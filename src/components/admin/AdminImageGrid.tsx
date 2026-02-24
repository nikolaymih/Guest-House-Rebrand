"use client";

import Image from "next/image";
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
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createClient } from "@/lib/supabase/client";
import { type GalleryImage } from "@/types";

// ── Single sortable image card ────────────────────────────────────────────────
function SortableImageCard({
  image,
  onDelete,
}: {
  image: GalleryImage;
  onDelete: (img: GalleryImage) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group rounded-lg overflow-hidden aspect-square bg-[var(--color-linen)]"
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-1.5 left-1.5 z-10 bg-black/40 text-white rounded px-1 py-0.5 text-xs cursor-grab opacity-0 group-hover:opacity-100 transition-opacity select-none"
        aria-label="Drag to reorder"
      >
        ⠿
      </div>

      <Image
        src={image.url ?? image.storage_path}
        alt=""
        fill
        unoptimized
        className="object-cover"
        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 200px"
      />

      {/* Delete */}
      <button
        onClick={() => onDelete(image)}
        className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full w-6 h-6 text-xs font-bold opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity flex items-center justify-center"
        aria-label="Delete image"
      >
        ✕
      </button>
    </div>
  );
}

// ── Grid ─────────────────────────────────────────────────────────────────────
interface AdminImageGridProps {
  images: GalleryImage[];
  onDelete: () => void;
}

export default function AdminImageGrid({ images, onDelete }: AdminImageGridProps) {
  const [items, setItems] = useState<GalleryImage[]>(images);
  const [saving, setSaving] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Keep local state in sync when parent refreshes
  useEffect(() => {
    setItems(images);
  }, [images]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  async function handleDelete(image: GalleryImage) {
    setDeleteError(null);
    const supabase = createClient();
    const { error: storageError } = await supabase.storage.from("gallery").remove([image.storage_path]);
    if (storageError) {
      setDeleteError("Грешка при изтриване на снимката.");
      return;
    }
    const { error: dbError } = await supabase.from("gallery_images").delete().eq("id", image.id);
    if (dbError) {
      setDeleteError("Грешка при изтриване.");
      return;
    }
    onDelete();
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    const previous = items;

    setItems(reordered); // optimistic
    setSaving(true);
    setDragError(null);

    const supabase = createClient();
    try {
      await Promise.all(
        reordered.map((img, idx) =>
          supabase
            .from("gallery_images")
            .update({ display_order: idx })
            .eq("id", img.id)
        )
      );
    } catch {
      setItems(previous); // revert
      setDragError("Грешка при запазване на реда.");
    } finally {
      setSaving(false);
    }
  }

  if (items.length === 0) {
    return (
      <p className="text-[var(--color-text-muted)] text-sm text-center py-8">
        Няма качени снимки в тази категория.
      </p>
    );
  }

  return (
    <div className="mt-6">
      {saving && (
        <p className="text-xs text-[var(--color-text-muted)] mb-2 text-right">Запазване...</p>
      )}
      {dragError && <p className="text-red-500 text-xs mb-2 text-right">{dragError}</p>}
      {deleteError && <p className="text-red-500 text-xs mb-2 text-right">{deleteError}</p>}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {items.map((img) => (
              <SortableImageCard key={img.id} image={img} onDelete={handleDelete} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
