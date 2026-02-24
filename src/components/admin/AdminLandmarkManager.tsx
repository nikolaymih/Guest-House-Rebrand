// src/components/admin/AdminLandmarkManager.tsx
"use client";

import { useState, useEffect } from "react";
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
import { type Landmark } from "@/types";

const MAX_BYTES = 15 * 1024 * 1024;

// ── Empty form state ──────────────────────────────────────────────────────────
function emptyForm(): Partial<Landmark> {
  return { name_bg: "", name_en: "", description_bg: "", description_en: "", distance: "" };
}

// ── Inline edit form ──────────────────────────────────────────────────────────
function LandmarkForm({
  initial,
  onSave,
  onCancel,
  saving,
  error,
}: {
  initial: Partial<Landmark>;
  onSave: (data: Partial<Landmark>, file: File | null) => void;
  onCancel: () => void;
  saving: boolean;
  error: string | null;
}) {
  const [form, setForm] = useState(initial);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const fields = [
    { key: "name_bg", label: "Заглавие (BG)", multiline: false },
    { key: "name_en", label: "Заглавие (EN)", multiline: false },
    { key: "distance", label: "Разстояние (напр. 23,7 км)", multiline: false },
    { key: "description_bg", label: "Описание (BG)", multiline: true },
    { key: "description_en", label: "Описание (EN)", multiline: true },
  ] as const;

  function validate() {
    return fields.every((f) => (form[f.key as keyof typeof form] as string ?? "").trim().length > 0);
  }

  return (
    <div className="space-y-3 bg-[var(--color-linen)] rounded-xl p-4 border border-[var(--color-border)]">
      {fields.map(({ key, label, multiline }) => (
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

      {/* Image upload */}
      <div>
        <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
          Снимка
        </label>
        <input
          type="file"
          accept="image/*"
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
          className="text-sm"
        />
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
          className="px-4 py-2 rounded-lg bg-[var(--color-caramel)] text-white text-sm font-semibold disabled:opacity-50"
        >
          {saving ? "Запазване..." : "Запази"}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg bg-white border border-[var(--color-border)] text-sm font-semibold"
        >
          Отказ
        </button>
      </div>
    </div>
  );
}

// ── Single sortable landmark card ─────────────────────────────────────────────
function SortableLandmarkCard({
  landmark,
  onEdit,
  onDelete,
}: {
  landmark: Landmark;
  onEdit: (lm: Landmark) => void;
  onDelete: (lm: Landmark) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: landmark.id });

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
      {landmark.url ? (
        <img
          src={landmark.url}
          alt={landmark.name_bg}
          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-16 h-16 rounded-lg bg-[var(--color-linen)] flex items-center justify-center flex-shrink-0">
          <span className="text-xs text-[var(--color-text-muted)]">—</span>
        </div>
      )}

      {/* Name + distance */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--color-espresso)] truncate">{landmark.name_bg}</p>
        <p className="text-xs text-[var(--color-text-muted)]">{landmark.distance}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={() => onEdit(landmark)}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--color-linen)] text-[var(--color-caramel-deep)] hover:bg-[var(--color-oatmeal)] transition-colors"
        >
          Редактирай
        </button>
        <button
          onClick={() => onDelete(landmark)}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
        >
          Изтрий
        </button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AdminLandmarkManager() {
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [saving, setSaving] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  async function load() {
    const supabase = createClient();
    const { data } = await supabase
      .from("landmarks")
      .select("*")
      .order("display_order", { ascending: true });

    setLandmarks(
      (data ?? []).map((row) => ({
        ...row,
        url: row.storage_path
          ? supabase.storage.from("gallery").getPublicUrl(row.storage_path).data.publicUrl
          : undefined,
      })) as Landmark[]
    );
  }

  useEffect(() => { void load(); }, []);

  // ── Save (create or update) ──
  async function handleSave(id: string | "new", formData: Partial<Landmark>, file: File | null) {
    setSaving(true);
    setFormError(null);
    const supabase = createClient();

    let storagePath: string | null =
      id !== "new" ? (landmarks.find((l) => l.id === id)?.storage_path ?? null) : null;

    // Upload image if provided
    if (file) {
      const ext = file.name.split(".").pop() ?? "jpg";
      const slug = id === "new"
        ? slugify(formData.name_bg ?? "landmark")
        : (landmarks.find((l) => l.id === id)?.slug ?? "landmark");
      storagePath = `landmarks/${slug}-${Date.now()}.${ext}`;

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
      let slug = slugify(formData.name_bg ?? "landmark");

      // Deduplicate slug against existing ones
      const existingSlugs = new Set(landmarks.map((l) => l.slug));
      if (existingSlugs.has(slug)) {
        let suffix = 2;
        while (existingSlugs.has(`${slug}-${suffix}`)) {
          suffix += 1;
        }
        slug = `${slug}-${suffix}`;
      }

      const maxOrder = landmarks.length > 0
        ? Math.max(...landmarks.map((l) => l.display_order))
        : -1;

      const { error } = await supabase.from("landmarks").insert({
        slug,
        name_bg: formData.name_bg,
        name_en: formData.name_en,
        description_bg: formData.description_bg,
        description_en: formData.description_en,
        distance: formData.distance,
        storage_path: storagePath,
        display_order: maxOrder + 1,
      });

      if (error) {
        setFormError(`Грешка: ${error.message}`);
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase.from("landmarks").update({
        name_bg: formData.name_bg,
        name_en: formData.name_en,
        description_bg: formData.description_bg,
        description_en: formData.description_en,
        distance: formData.distance,
        ...(storagePath !== (landmarks.find((l) => l.id === id)?.storage_path ?? null)
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
  async function handleDelete(landmark: Landmark) {
    if (!confirm(`Сигурни ли сте, че искате да изтриете „${landmark.name_bg}"?`)) return;
    const supabase = createClient();
    if (landmark.storage_path) {
      await supabase.storage.from("gallery").remove([landmark.storage_path]);
    }
    const { error } = await supabase.from("landmarks").delete().eq("id", landmark.id);
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

    const oldIndex = landmarks.findIndex((l) => l.id === active.id);
    const newIndex = landmarks.findIndex((l) => l.id === over.id);
    const reordered = arrayMove(landmarks, oldIndex, newIndex);
    const previous = landmarks;

    setLandmarks(reordered); // optimistic
    setReordering(true);

    const supabase = createClient();
    try {
      await Promise.all(
        reordered.map((lm, idx) =>
          supabase.from("landmarks").update({ display_order: idx }).eq("id", lm.id)
        )
      );
    } catch {
      setLandmarks(previous); // revert
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
          className="px-4 py-2 rounded-full bg-[var(--color-caramel)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          + Добави забележителност
        </button>
      </div>

      {/* New landmark form */}
      {editingId === "new" && (
        <LandmarkForm
          initial={emptyForm()}
          onSave={(data, file) => handleSave("new", data, file)}
          onCancel={() => { setEditingId(null); setFormError(null); }}
          saving={saving}
          error={formError}
        />
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={landmarks.map((l) => l.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {landmarks.map((lm) => (
              <div key={lm.id}>
                <SortableLandmarkCard
                  landmark={lm}
                  onEdit={(l) => { setEditingId(l.id); setFormError(null); }}
                  onDelete={handleDelete}
                />
                {editingId === lm.id && (
                  <div className="mt-2 ml-8">
                    <LandmarkForm
                      initial={lm}
                      onSave={(data, file) => handleSave(lm.id, data, file)}
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

      {landmarks.length === 0 && (
        <p className="text-[var(--color-text-muted)] text-sm text-center py-8">
          Няма добавени забележителности.
        </p>
      )}
    </div>
  );
}
