// src/components/admin/HomeContentEditor.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { type HomeContent, type HomeAmenity } from "@/types";

type ContentForm = Omit<HomeContent, "id" | "updated_at">;

type AmenityItem = { clientId: string; label_bg: string; label_en: string };

function emptyContent(): ContentForm {
  return {
    hero_title_bg: "", hero_title_en: "",
    hero_subtitle_bg: "", hero_subtitle_en: "",
    about_heading_bg: "", about_heading_en: "",
    about_p1_bg: "", about_p1_en: "",
    about_p2_bg: "", about_p2_en: "",
    about_p3_bg: "", about_p3_en: "",
    amenities_heading_bg: "", amenities_heading_en: "",
  };
}

const TEXT_FIELDS: {
  keyBg: keyof ContentForm;
  keyEn: keyof ContentForm;
  label: string;
  multiline?: boolean;
  sectionBreak?: string;
}[] = [
  { keyBg: "hero_title_bg",        keyEn: "hero_title_en",        label: "Заглавен текст" },
  { keyBg: "hero_subtitle_bg",     keyEn: "hero_subtitle_en",     label: "Заглавна снимка",               multiline: true },
  { keyBg: "about_heading_bg",     keyEn: "about_heading_en",     label: 'Заглавие „Добре дошли"',        sectionBreak: 'Секция „Добре дошли"' },
  { keyBg: "about_p1_bg",          keyEn: "about_p1_en",          label: "Параграф 1",                    multiline: true },
  { keyBg: "about_p2_bg",          keyEn: "about_p2_en",          label: "Параграф 2",                    multiline: true },
  { keyBg: "about_p3_bg",          keyEn: "about_p3_en",          label: "Параграф 3",                    multiline: true },
  { keyBg: "amenities_heading_bg", keyEn: "amenities_heading_en", label: "Заглавие на удобствата" },
];

export default function HomeContentEditor() {
  const [form, setForm] = useState<ContentForm>(emptyContent());
  const [amenities, setAmenities] = useState<AmenityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [amenitiesTouched, setAmenitiesTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [faviconUploading, setFaviconUploading] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [faviconError, setFaviconError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      try {
        const [
          { data: content, error: contentError },
          { data: ams, error: amsError },
          { data: settings },
        ] = await Promise.all([
          supabase.from("home_content").select("*").eq("id", 1).maybeSingle(),
          supabase.from("home_amenities").select("*").order("display_order"),
          supabase.from("site_settings").select("logo_url, favicon_url").eq("id", 1).maybeSingle(),
        ]);
        if (contentError || amsError) {
          setError("Грешка при зареждане на съдържанието.");
          return;
        }
        if (content) {
          const { id: _id, updated_at: _ts, ...fields } = content as HomeContent;
          setForm(fields);
        }
        if (ams) {
          setAmenities(
            (ams as HomeAmenity[]).map(({ label_bg, label_en }) => ({
              clientId: crypto.randomUUID(),
              label_bg,
              label_en,
            }))
          );
        }
        if (settings) {
          setLogoUrl(settings.logo_url ?? null);
          setFaviconUrl(settings.favicon_url ?? null);
        }
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  useEffect(
    () => () => { if (successTimerRef.current) clearTimeout(successTimerRef.current); },
    []
  );

  function setField(key: keyof ContentForm, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function setAmenityField(idx: number, key: "label_bg" | "label_en", value: string) {
    setAmenities((prev) => prev.map((a, i) => (i === idx ? { ...a, [key]: value } : a)));
  }

  async function handleAssetUpload(
    type: "logo" | "favicon",
    file: File
  ) {
    const setUploading = type === "logo" ? setLogoUploading : setFaviconUploading;
    const setLocalError = type === "logo" ? setLogoError : setFaviconError;
    setUploading(true);
    setLocalError(null);
    const supabase = createClient();
    const ext = file.name.split(".").pop() ?? "png";
    const path = `${type}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("assets")
      .upload(path, file, { cacheControl: "3600", upsert: false });
    if (uploadError) {
      setLocalError(type === "logo" ? "Неуспешно качване на лого." : "Неуспешно качване на икона.");
      setUploading(false);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from("assets").getPublicUrl(path);
    const { error: dbError } = await supabase
      .from("site_settings")
      .update({ [`${type}_url`]: publicUrl, updated_at: new Date().toISOString() })
      .eq("id", 1);
    if (dbError) {
      setLocalError(type === "logo" ? "Неуспешно качване на лого." : "Неуспешно качване на икона.");
      setUploading(false);
      return;
    }
    if (type === "logo") setLogoUrl(publicUrl);
    else setFaviconUrl(publicUrl);
    setUploading(false);
  }

  async function handleSave() {
    setAmenitiesTouched(true);
    const hasEmpty = amenities.some((a) => !a.label_bg.trim() || !a.label_en.trim());
    if (hasEmpty) {
      setError("Всички удобства трябва да имат попълнени и двата полета (BG и EN).");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(false);
    const supabase = createClient();
    try {
      const { error: contentError } = await supabase
        .from("home_content")
        .upsert({ id: 1, ...form, updated_at: new Date().toISOString() });
      if (contentError) {
        setError(`Грешка при запазване: ${contentError.message}`);
        return;
      }
      const { error: deleteError } = await supabase
        .from("home_amenities")
        .delete()
        .not("id", "is", null);
      if (deleteError) {
        setError(`Грешка при изтриване на удобства: ${deleteError.message}`);
        return;
      }
      if (amenities.length > 0) {
        const { error: insertError } = await supabase
          .from("home_amenities")
          .insert(
            amenities.map(({ label_bg, label_en }, idx) => ({
              label_bg,
              label_en,
              display_order: idx,
            }))
          );
        if (insertError) {
          setError(`Грешка при запазване на удобства: ${insertError.message}`);
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

  if (loading)
    return <p className="text-sm text-[var(--color-text-muted)] py-8">Зареждане...</p>;

  return (
    <div className="space-y-8">
      {/* Logo & Favicon upload */}
      <div className="space-y-4">
        <h3 className="font-serif text-lg text-[var(--color-espresso)]">Лого и икона на сайта</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

          {/* Logo */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-[var(--color-espresso)] tracking-wider">Лого</p>
            {logoUrl && (
              <div className="bg-[var(--color-espresso)] rounded-lg h-16 flex items-center justify-center overflow-hidden">
                <img src={logoUrl} alt="Лого" className="h-10 w-auto object-contain" />
              </div>
            )}
            <div
              onClick={() => logoInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files?.[0];
                if (f) void handleAssetUpload("logo", f);
              }}
              className="border-2 border-dashed border-[var(--color-caramel)] rounded-xl p-8 text-center cursor-pointer hover:bg-[var(--color-linen)] transition-colors"
              role="button"
              tabIndex={0}
              aria-label="Качи лого"
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") logoInputRef.current?.click(); }}
            >
              <input
                ref={logoInputRef}
                type="file"
                accept="image/png"
                disabled={logoUploading}
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleAssetUpload("logo", f);
                  e.target.value = "";
                }}
              />
              <p className="text-[var(--color-text-secondary)] font-medium text-sm">
                {logoUploading ? "Качване..." : "Плъзни тук или кликни за избор"}
              </p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">PNG · прозрачен фон</p>
            </div>
            {logoError && <p className="text-red-500 text-sm">{logoError}</p>}
          </div>

          {/* Favicon */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-[var(--color-espresso)] tracking-wider">Икона (Favicon)</p>
            {faviconUrl && (
              <div className="bg-[var(--color-espresso)] rounded-lg h-16 flex items-center justify-center overflow-hidden">
                <img src={faviconUrl} alt="Favicon" className="h-10 w-10 object-contain" />
              </div>
            )}
            <div
              onClick={() => faviconInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files?.[0];
                if (f) void handleAssetUpload("favicon", f);
              }}
              className="border-2 border-dashed border-[var(--color-caramel)] rounded-xl p-8 text-center cursor-pointer hover:bg-[var(--color-linen)] transition-colors"
              role="button"
              tabIndex={0}
              aria-label="Качи икона"
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") faviconInputRef.current?.click(); }}
            >
              <input
                ref={faviconInputRef}
                type="file"
                accept="image/png"
                disabled={faviconUploading}
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleAssetUpload("favicon", f);
                  e.target.value = "";
                }}
              />
              <p className="text-[var(--color-text-secondary)] font-medium text-sm">
                {faviconUploading ? "Качване..." : "Плъзни тук или кликни за избор"}
              </p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">PNG · квадратно изображение</p>
            </div>
            {faviconError && <p className="text-red-500 text-sm">{faviconError}</p>}
          </div>

        </div>
      </div>

      {/* Text fields — BG + EN side by side */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-xs font-bold text-[var(--color-espresso)] uppercase tracking-wider border-b border-[var(--color-border)] pb-1">
            БГ — Български
          </div>
          <div className="text-xs font-bold text-[var(--color-espresso)] uppercase tracking-wider border-b border-[var(--color-border)] pb-1">
            EN — English
          </div>
        </div>
        {TEXT_FIELDS.map(({ keyBg, keyEn, label, multiline, sectionBreak }) => (
          <div key={keyBg}>
          {sectionBreak && (
            <div className="flex items-center gap-3 pt-4 pb-2">
              <hr className="flex-1 border-[var(--color-border)]" />
              <span className="text-xs font-bold text-[var(--color-espresso)] uppercase tracking-wider whitespace-nowrap">
                {sectionBreak}
              </span>
              <hr className="flex-1 border-[var(--color-border)]" />
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>
        ))}
      </div>

      {/* Amenities list */}
      <div>
        <h3 className="font-serif text-lg text-[var(--color-espresso)] mb-4">Удобства</h3>
        <div className="grid grid-cols-[1fr_1fr_2rem] gap-3 mb-1">
          <div className="text-xs font-bold text-[var(--color-espresso)] uppercase tracking-wider border-b border-[var(--color-border)] pb-1">
            Удобство (БГ)
          </div>
          <div className="text-xs font-bold text-[var(--color-espresso)] uppercase tracking-wider border-b border-[var(--color-border)] pb-1">
            Amenity (EN)
          </div>
          <div />
        </div>
        <div className="space-y-2">
          {amenities.map((am, idx) => (
            <div key={am.clientId} className="flex items-center gap-3">
              <input
                type="text"
                placeholder="BG *"
                value={am.label_bg}
                onChange={(e) => setAmenityField(idx, "label_bg", e.target.value)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-caramel)] ${
                  amenitiesTouched && !am.label_bg.trim()
                    ? "border-red-400"
                    : "border-[var(--color-border)]"
                }`}
              />
              <input
                type="text"
                placeholder="EN *"
                value={am.label_en}
                onChange={(e) => setAmenityField(idx, "label_en", e.target.value)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-caramel)] ${
                  amenitiesTouched && !am.label_en.trim()
                    ? "border-red-400"
                    : "border-[var(--color-border)]"
                }`}
              />
              <button
                onClick={() => setAmenities((prev) => prev.filter((_, i) => i !== idx))}
                className="text-red-500 hover:text-red-700 font-bold text-lg leading-none flex-shrink-0"
                aria-label="Изтрий"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() =>
            setAmenities((prev) => [
              ...prev,
              { clientId: crypto.randomUUID(), label_bg: "", label_en: "" },
            ])
          }
          className="mt-3 text-sm font-semibold text-[var(--color-caramel)] hover:text-[var(--color-caramel-deep)] transition-colors"
        >
          + Добави удобство
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
