"use client";

import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { type GalleryImage } from "@/types";

interface AdminImageGridProps {
  images: GalleryImage[];
  onDelete: () => void;
}

export default function AdminImageGrid({
  images,
  onDelete,
}: AdminImageGridProps) {
  async function handleDelete(image: GalleryImage) {
    const supabase = createClient();

    await supabase.storage.from("gallery").remove([image.storage_path]);
    await supabase.from("gallery_images").delete().eq("id", image.id);

    onDelete();
  }

  if (images.length === 0) {
    return (
      <p className="text-[var(--color-text-muted)] text-sm text-center py-8">
        Няма качени снимки в тази категория.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-6">
      {images.map((img) => (
        <div
          key={img.id}
          className="relative group rounded-lg overflow-hidden aspect-square bg-[var(--color-linen)]"
        >
          <Image
            src={img.url ?? img.storage_path}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 200px"
          />
          <button
            onClick={() => void handleDelete(img)}
            className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full w-6 h-6 text-xs font-bold opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity flex items-center justify-center"
            aria-label="Delete image"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
