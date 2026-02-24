"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { type AccommodationContent, type AccommodationFeature } from "@/types";

type ContentForm = Omit<AccommodationContent, "id" | "updated_at">;

function emptyContent(): ContentForm {
  return {
    about_heading_bg: "", about_heading_en: "",
    about_p1_bg: "", about_p1_en: "",
    about_p2_bg: "", about_p2_en: "",
    features_heading_bg: "", features_heading_en: "",
  };
}

const TEXT_FIELDS: { key: keyof ContentForm; labelBg: string; multiline?: boolean }[] = [
  { key: "about_heading_bg",    labelBg: "Заглавие на секция „За Къщата"" },
  { key: "about_p1_bg",         labelBg: "Параграф 1",                     multiline: true },
  { key: "about_p2_bg",         labelBg: "Параграф 2",                     multiline: true },
  { key: "features_heading_bg", labelBg: "Заглавие на характеристиките" },
];

export default function AccommodationContentEditor() {
  const [form, setForm] = useState<ContentForm>(emptyContent());
  const [features, setFeatures] = useState<{ label_bg: string; label_en: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const [{ data: content }, { data: feats }] = await Promise.all([
        supabase.from("accommodation_content").select("*").eq("id", 1).maybeSingle(),
        supabase.from("accommodation_features").select("*").order("display_order"),
      ]);
      if (content) {
        const { id: _id, updated_at: _ts, ...fields } = content as AccommodationContent;
        setForm(fields);
      }
      if (feats) {
        setFeatures((feats as AccommodationFeature[]).map(({ label_bg, label_en }) => ({ label_bg, label_en })));
      }
    }
    void load();
  }, []);

  function setField(key: keyof ContentForm, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function setFeatureField(idx: number, key: "label_bg" | "label_en", value: string) {
    setFeatures((prev) => prev.map((f, i) => i === idx ? { ...f, [key]: value } : f));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);
    const supabase = createClient();

    const { error: contentError } = await supabase
      .from("accommodation_content")
      .upsert({ id: 1, ...form, updated_at: new Date().toISOString() });

    if (contentError) {
      setError(`Грешка при запазване: ${contentError.message}`);
      setSaving(false);
      return;
    }

    const { error: deleteError } = await supabase
      .from("accommodation_features")
      .delete()
      .gte("display_order", 0);

    if (deleteError) {
      setError(`Грешка при изтриване на характеристики: ${deleteError.message}`);
      setSaving(false);
      return;
    }

    if (features.length > 0) {
      const { error: insertError } = await supabase
        .from("accommodation_features")
        .insert(features.map((f, idx) => ({ ...f, display_order: idx })));

      if (insertError) {
        setError(`Грешка при запазване на характеристики: ${insertError.message}`);
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  }

  return (
    <div className="space-y-8">
      {/* Text fields — BG + EN side by side */}
      <div className="space-y-6">
        {TEXT_FIELDS.map(({ key, labelBg, multiline }) => {
          const enKey = key.replace("_bg", "_en") as keyof ContentForm;
          const labelEn = labelBg + " (EN)";
          return (
            <div key={key} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                  {labelBg} (BG)
                </label>
                {multiline ? (
                  <textarea
                    rows={3}
                    value={form[key]}
                    onChange={(e) => setField(key, e.target.value)}
                    className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-caramel)] resize-y"
                  />
                ) : (
                  <input
                    type="text"
                    value={form[key]}
                    onChange={(e) => setField(key, e.target.value)}
                    className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-caramel)]"
                  />
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                  {labelEn}
                </label>
                {multiline ? (
                  <textarea
                    rows={3}
                    value={form[enKey]}
                    onChange={(e) => setField(enKey, e.target.value)}
                    className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-caramel)] resize-y"
                  />
                ) : (
                  <input
                    type="text"
                    value={form[enKey]}
                    onChange={(e) => setField(enKey, e.target.value)}
                    className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-caramel)]"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Features list */}
      <div>
        <h3 className="font-serif text-lg text-[var(--color-espresso)] mb-4">Характеристики</h3>
        <div className="space-y-2">
          {features.map((feat, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <input
                type="text"
                placeholder="BG"
                value={feat.label_bg}
                onChange={(e) => setFeatureField(idx, "label_bg", e.target.value)}
                className="flex-1 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-caramel)]"
              />
              <input
                type="text"
                placeholder="EN"
                value={feat.label_en}
                onChange={(e) => setFeatureField(idx, "label_en", e.target.value)}
                className="flex-1 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-caramel)]"
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
          onClick={() => setFeatures((prev) => [...prev, { label_bg: "", label_en: "" }])}
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
