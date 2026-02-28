// src/components/admin/AdminPromotionManager.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils/slugify";
import { type Promotion } from "@/types";

const MAX_BYTES = 15 * 1024 * 1024;

// ── Empty form state ──────────────────────────────────────────────────────────
function emptyForm(): Partial<Promotion> {
  return { title_bg: "", title_en: "", description_bg: "", description_en: "", price: "", valid_from: "", valid_to: "" };
}

// ── Date input with click-to-open picker ─────────────────────────────────────
function DateInput({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <div>
      <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
        {label} <span className="text-red-500">*</span>
      </label>
      <input
        ref={ref}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onClick={() => ref.current?.showPicker?.()}
        className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-caramel)] cursor-pointer [color-scheme:light]"
      />
      {error && <p className="text-red-500 text-xs mt-0.5">{error}</p>}
    </div>
  );
}

// ── Inline edit form ──────────────────────────────────────────────────────────
function PromotionForm({
  initial,
  onSave,
  onCancel,
  saving,
  error,
}: {
  initial: Partial<Promotion>;
  onSave: (data: Partial<Promotion>, file: File | null) => void;
  onCancel: () => void;
  saving: boolean;
  error: string | null;
}) {
  const [form, setForm] = useState(initial);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const textFields = [
    { key: "title_bg", label: "Заглавие (BG)", multiline: false },
    { key: "title_en", label: "Заглавие (EN)", multiline: false },
    { key: "price", label: "Цена / Отстъпка (напр. 50 EUR, 20% отстъпка)", multiline: false },
    { key: "description_bg", label: "Описание (BG)", multiline: true },
    { key: "description_en", label: "Описание (EN)", multiline: true },
  ] as const;

  function validate() {
    const textValid = textFields.every((f) => (form[f.key as keyof typeof form] as string ?? "").trim().length > 0);
    const datesValid = !!(form.valid_from as string)?.trim() && !!(form.valid_to as string)?.trim();
    const dateOrderValid = !datesValid || (form.valid_from as string) <= (form.valid_to as string);
    return textValid && datesValid && dateOrderValid;
  }

  return (
    <div className="space-y-3 bg-[var(--color-linen)] rounded-xl p-4 border border-[var(--color-border)]">
      {textFields.map(({ key, label, multiline }) => (
        <div key={key}>
          <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
            {label} <span className="text-red-500">*</span>
          </label>
          {multiline ? (
            <textarea
              rows={4}
              value={(form[key as keyof typeof form] as string) ?? ""}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-caramel)] resize-y"
            />
          ) : (
            <input
              type="text"
              value={(form[key as keyof typeof form] as string) ?? ""}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-caramel)]"
            />
          )}
          {touched && !(form[key as keyof typeof form] as string ?? "").trim() && (
            <p className="text-red-500 text-xs mt-0.5">Полето е задължително.</p>
          )}
        </div>
      ))}

      {/* Date inputs */}
      <div className="grid grid-cols-2 gap-3">
        <DateInput
          label="Валидна от"
          value={(form.valid_from as string) ?? ""}
          onChange={(v) => setForm({ ...form, valid_from: v })}
          error={touched && !(form.valid_from as string)?.trim() ? "Полето е задължително." : undefined}
        />
        <DateInput
          label="Валидна до"
          value={(form.valid_to as string) ?? ""}
          onChange={(v) => setForm({ ...form, valid_to: v })}
          error={
            touched && !(form.valid_to as string)?.trim()
              ? "Полето е задължително."
              : touched && (form.valid_from as string)?.trim() && (form.valid_to as string)?.trim() && (form.valid_to as string) < (form.valid_from as string)
                ? "Крайната дата трябва да е след началната."
                : undefined
          }
        />
      </div>

      {/* Image upload */}
      <div>
        <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
          Снимка
        </label>
        <label className="flex items-center gap-2 cursor-pointer w-fit">
          <span className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-white text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-linen)] transition-colors">
            Избери файл
          </span>
          <span className="text-xs text-[var(--color-text-muted)] truncate max-w-[220px]">
            {file
              ? file.name
              : initial.storage_path
                ? initial.storage_path.split("/").pop()
                : "Няма избран файл"}
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              if (f && f.size > MAX_BYTES) {
                setFileError("Снимката е твърде голяма. Максималният размер е 15 МБ.");
                setFile(null);
              } else {
                setFileError(null);
                setFile(f);
              }
            }}
          />
        </label>
        {fileError && <p className="text-red-500 text-xs mt-0.5">{fileError}</p>}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-2 pt-1">
        <button
          onClick={() => {
            setTouched(true);
            if (!validate()) return;
            onSave(form, file);
          }}
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-[var(--color-caramel)] text-white text-sm font-semibold disabled:opacity-50 cursor-pointer"
        >
          {saving ? "Запазване..." : "Запази"}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg bg-white border border-[var(--color-border)] text-sm font-semibold cursor-pointer"
        >
          Отказ
        </button>
      </div>
    </div>
  );
}

// ── Single sortable promotion card ────────────────────────────────────────────
function SortablePromotionCard({
  promotion,
  onEdit,
  onDelete,
}: {
  promotion: Promotion;
  onEdit: (p: Promotion) => void;
  onDelete: (p: Promotion) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: promotion.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] p-3 shadow-[var(--shadow-soft)]"
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="text-[var(--color-text-muted)] cursor-grab text-lg select-none flex-shrink-0"
        aria-label="Drag to reorder"
      >
        ⠿
      </div>

      {/* Thumbnail */}
      {promotion.url ? (
        <img
          src={promotion.url}
          alt={promotion.title_bg}
          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-16 h-16 rounded-lg bg-[var(--color-linen)] flex items-center justify-center flex-shrink-0">
          <span className="text-xs text-[var(--color-text-muted)]">—</span>
        </div>
      )}

      {/* Title + price + dates */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--color-espresso)] truncate">{promotion.title_bg}</p>
        <span className="text-xs bg-[var(--color-candlelight)] text-[var(--color-espresso)] px-2 py-0.5 rounded-full font-semibold">{promotion.price}</span>
        <p className="text-xs text-[var(--color-text-muted)]">{promotion.valid_from.split("-").reverse().join(".")} – {promotion.valid_to.split("-").reverse().join(".")}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={() => onEdit(promotion)}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--color-linen)] text-[var(--color-caramel-deep)] hover:bg-[var(--color-oatmeal)] transition-colors cursor-pointer"
        >
          Редактирай
        </button>
        <button
          onClick={() => onDelete(promotion)}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
        >
          Изтрий
        </button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AdminPromotionManager() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [saving, setSaving] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  async function load() {
    const supabase = createClient();
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("promotions")
      .select("*")
      .gte("valid_to", today)
      .order("display_order", { ascending: true });

    setPromotions(
      (data ?? []).map((row) => ({
        ...row,
        url: row.storage_path
          ? supabase.storage.from("gallery").getPublicUrl(row.storage_path).data.publicUrl
          : undefined,
      })) as Promotion[]
    );
  }

  useEffect(() => { void load(); }, []);

  // ── Save (create or update) ──
  async function handleSave(id: string | "new", formData: Partial<Promotion>, file: File | null) {
    setSaving(true);
    setFormError(null);
    const supabase = createClient();

    let storagePath: string | null =
      id !== "new" ? (promotions.find((p) => p.id === id)?.storage_path ?? null) : null;

    // Upload image if provided
    if (file) {
      const ext = file.name.split(".").pop() ?? "jpg";
      const slug = id === "new"
        ? slugify(formData.title_bg ?? "promotion")
        : (promotions.find((p) => p.id === id)?.slug ?? "promotion");
      storagePath = `promotions/${slug}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("gallery")
        .upload(storagePath, file, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        setFormError(`Грешка при качване: ${uploadError.message}`);
        setSaving(false);
        return;
      }
    }

    if (id === "new") {
      const slug = slugify(formData.title_bg ?? "promotion");

      const maxOrder = promotions.length > 0
        ? Math.max(...promotions.map((p) => p.display_order))
        : -1;

      const { error } = await supabase.from("promotions").insert({
        slug,
        title_bg: formData.title_bg,
        title_en: formData.title_en,
        description_bg: formData.description_bg,
        description_en: formData.description_en,
        price: formData.price,
        valid_from: formData.valid_from,
        valid_to: formData.valid_to,
        storage_path: storagePath,
        display_order: maxOrder + 1,
      });

      if (error) {
        setFormError(`Грешка: ${error.message}`);
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase.from("promotions").update({
        title_bg: formData.title_bg,
        title_en: formData.title_en,
        description_bg: formData.description_bg,
        description_en: formData.description_en,
        price: formData.price,
        valid_from: formData.valid_from,
        valid_to: formData.valid_to,
        ...(storagePath !== (promotions.find((p) => p.id === id)?.storage_path ?? null)
          ? { storage_path: storagePath }
          : {}),
      }).eq("id", id);

      if (error) {
        setFormError(`Грешка: ${error.message}`);
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    setEditingId(null);
    void load();
  }

  // ── Delete ──
  async function handleDelete(promotion: Promotion) {
    if (!confirm(`Сигурни ли сте, че искате да изтриете „${promotion.title_bg}"?`)) return;
    const supabase = createClient();
    if (promotion.storage_path) {
      await supabase.storage.from("gallery").remove([promotion.storage_path]);
    }
    const { error } = await supabase.from("promotions").delete().eq("id", promotion.id);
    if (error) {
      setFormError("Грешка при изтриване.");
      return;
    }
    void load();
  }

  // ── Drag end ──
  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = promotions.findIndex((p) => p.id === active.id);
    const newIndex = promotions.findIndex((p) => p.id === over.id);
    const reordered = arrayMove(promotions, oldIndex, newIndex);
    const previous = promotions;

    setPromotions(reordered); // optimistic
    setReordering(true);

    const supabase = createClient();
    try {
      await Promise.all(
        reordered.map((p, idx) =>
          supabase.from("promotions").update({ display_order: idx }).eq("id", p.id)
        )
      );
    } catch {
      setPromotions(previous); // revert
      setFormError("Грешка при запазване на реда.");
    } finally {
      setReordering(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--color-text-muted)]">
          Плъзнете картите за промяна на реда.
          {reordering && " Запазване..."}
        </p>
        <button
          onClick={() => setEditingId("new")}
          className="px-4 py-2 rounded-full bg-[var(--color-caramel)] text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
        >
          + Добави промоция
        </button>
      </div>

      {/* New promotion form */}
      {editingId === "new" && (
        <PromotionForm
          initial={emptyForm()}
          onSave={(data, file) => handleSave("new", data, file)}
          onCancel={() => { setEditingId(null); setFormError(null); }}
          saving={saving}
          error={formError}
        />
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={promotions.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {promotions.map((p) => (
              <div key={p.id}>
                <SortablePromotionCard
                  promotion={p}
                  onEdit={(promo) => { setEditingId(promo.id); setFormError(null); }}
                  onDelete={handleDelete}
                />
                {editingId === p.id && (
                  <div className="mt-2 ml-8">
                    <PromotionForm
                      initial={p}
                      onSave={(data, file) => handleSave(p.id, data, file)}
                      onCancel={() => { setEditingId(null); setFormError(null); }}
                      saving={saving}
                      error={formError}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {promotions.length === 0 && (
        <p className="text-[var(--color-text-muted)] text-sm text-center py-8">
          Няма активни промоции.
        </p>
      )}
    </div>
  );
}
