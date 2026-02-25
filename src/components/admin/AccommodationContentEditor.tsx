// src/components/admin/AccommodationContentEditor.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { type AccommodationContent, type AccommodationFeature } from "@/types";

type ContentForm = Omit<AccommodationContent, "id" | "updated_at">;

type FeatureItem = { clientId: string; label_bg: string; label_en: string };

function emptyContent(): ContentForm {
  return {
    about_heading_bg: "", about_heading_en: "",
    about_p1_bg: "", about_p1_en: "",
    about_p2_bg: "", about_p2_en: "",
    features_heading_bg: "", features_heading_en: "",
  };
}

const TEXT_FIELDS: { keyBg: keyof ContentForm; keyEn: keyof ContentForm; label: string; multiline?: boolean }[] = [
  { keyBg: "about_heading_bg",    keyEn: "about_heading_en",    label: 'Заглавие на секция „За Къщата"' },
  { keyBg: "about_p1_bg",         keyEn: "about_p1_en",         label: "Параграф 1",                     multiline: true },
  { keyBg: "about_p2_bg",         keyEn: "about_p2_en",         label: "Параграф 2",                     multiline: true },
  { keyBg: "features_heading_bg", keyEn: "features_heading_en", label: "Заглавие на характеристиките" },
];

export default function AccommodationContentEditor() {
  const [form, setForm] = useState<ContentForm>(emptyContent());
  const [features, setFeatures] = useState<FeatureItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [featuresTouched, setFeaturesTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      try {
        const [{ data: content, error: contentError }, { data: feats, error: featsError }] = await Promise.all([
          supabase.from("accommodation_content").select("*").eq("id", 1).maybeSingle(),
          supabase.from("accommodation_features").select("*").order("display_order"),
        ]);
        if (contentError || featsError) {
          setError("Грешка при зареждане на съдържанието.");
          return;
        }
        if (content) {
          const { id: _id, updated_at: _ts, ...fields } = content as AccommodationContent;
          setForm(fields);
        }
        if (feats) {
          setFeatures((feats as AccommodationFeature[]).map(({ label_bg, label_en }) => ({ clientId: crypto.randomUUID(), label_bg, label_en })));
        }
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  useEffect(() => () => { if (successTimerRef.current) clearTimeout(successTimerRef.current); }, []);

  function setField(key: keyof ContentForm, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function setFeatureField(idx: number, key: "label_bg" | "label_en", value: string) {
    setFeatures((prev) => prev.map((f, i) => i === idx ? { ...f, [key]: value } : f));
  }

  async function handleSave() {
    setFeaturesTouched(true);
    const hasEmptyFeature = features.some(
      (f) => !f.label_bg.trim() || !f.label_en.trim()
    );
    if (hasEmptyFeature) {
      setError("Всички характеристики трябва да имат попълнени и двата полета (BG и EN).");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(false);
    const supabase = createClient();

    try {
      const { error: contentError } = await supabase
        .from("accommodation_content")
        .upsert({ id: 1, ...form, updated_at: new Date().toISOString() });

      if (contentError) {
        setError(`Грешка при запазване: ${contentError.message}`);
        return;
      }

      const { error: deleteError } = await supabase
        .from("accommodation_features")
        .delete()
        .not("id", "is", null);

      if (deleteError) {
        setError(`Грешка при изтриване на характеристики: ${deleteError.message}`);
        return;
      }

      if (features.length > 0) {
        const { error: insertError } = await supabase
          .from("accommodation_features")
          .insert(features.map(({ label_bg, label_en }, idx) => ({ label_bg, label_en, display_order: idx })));

        if (insertError) {
          setError(`Грешка при запазване на характеристики: ${insertError.message}`);
          return;
        }
      }

      setSuccess(true);
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      successTimerRef.current = setTimeout(() => setSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-[var(--color-text-muted)] py-8">Зареждане...</p>;

  return (
    <div className="space-y-8">
      {/* Text fields — BG + EN side by side */}
      <div className="space-y-4">
        <h3 className="font-serif text-lg text-[var(--color-espresso)]">Заглавие на секция „За Къщата"</h3>
      </div>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-xs font-bold text-[var(--color-espresso)] uppercase tracking-wider pb-1">
            БГ — Български
          </div>
          <div className="text-xs font-bold text-[var(--color-espresso)] uppercase tracking-wider pb-1">
            EN — English
          </div>
        </div>
        {TEXT_FIELDS.map(({ keyBg, keyEn, label, multiline }) => (
          <div key={keyBg} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                {label} (BG)
              </label>
              {multiline ? (
                <textarea
                  rows={3}
                  value={form[keyBg]}
                  onChange={(e) => setField(keyBg, e.target.value)}
                  className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-caramel)] resize-y"
                />
              ) : (
                <input
                  type="text"
                  value={form[keyBg]}
                  onChange={(e) => setField(keyBg, e.target.value)}
                  className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-caramel)]"
                />
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                {label} (EN)
              </label>
              {multiline ? (
                <textarea
                  rows={3}
                  value={form[keyEn]}
                  onChange={(e) => setField(keyEn, e.target.value)}
                  className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-caramel)] resize-y"
                />
              ) : (
                <input
                  type="text"
                  value={form[keyEn]}
                  onChange={(e) => setField(keyEn, e.target.value)}
                  className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-caramel)]"
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Features list */}
      <div>
        <h3 className="font-serif text-lg text-[var(--color-espresso)] mb-4">Характеристики</h3>
        <div className="grid grid-cols-[1fr_1fr_2rem] gap-3 mb-1">
          <div className="text-xs font-bold text-[var(--color-espresso)] uppercase tracking-wider pb-1">
            Характеристика (БГ)
          </div>
          <div className="text-xs font-bold text-[var(--color-espresso)] uppercase tracking-wider pb-1">
            Characteristic (EN)
          </div>
          <div />
        </div>
        <div className="space-y-2">
          {features.map((feat, idx) => (
            <div key={feat.clientId} className="flex items-center gap-3">
              <input
                type="text"
                placeholder="BG *"
                value={feat.label_bg}
                onChange={(e) => setFeatureField(idx, "label_bg", e.target.value)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-caramel)] ${
                  featuresTouched && !feat.label_bg.trim()
                    ? "border-red-400"
                    : "border-[var(--color-border)]"
                }`}
              />
              <input
                type="text"
                placeholder="EN *"
                value={feat.label_en}
                onChange={(e) => setFeatureField(idx, "label_en", e.target.value)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-caramel)] ${
                  featuresTouched && !feat.label_en.trim()
                    ? "border-red-400"
                    : "border-[var(--color-border)]"
                }`}
              />
              <button
                onClick={() => setFeatures((prev) => prev.filter((_, i) => i !== idx))}
                className="text-red-500 hover:text-red-700 font-bold text-lg leading-none flex-shrink-0"
                aria-label="Изтрий"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => setFeatures((prev) => [...prev, { clientId: crypto.randomUUID(), label_bg: "", label_en: "" }])}
          className="mt-3 text-sm font-semibold text-[var(--color-caramel)] hover:text-[var(--color-caramel-deep)] transition-colors"
        >
          + Добави характеристика
        </button>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && <p className="text-green-600 text-sm">Запазено успешно.</p>}

      <button
        onClick={() => void handleSave()}
        disabled={saving}
        className="px-6 py-2.5 rounded-full bg-[var(--color-caramel)] text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {saving ? "Запазване..." : "Запази"}
      </button>
    </div>
  );
}
