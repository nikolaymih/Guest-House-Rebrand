"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { type GalleryCategory } from "@/types";

interface ImageUploadZoneProps {
  category: GalleryCategory;
  onUploadComplete: () => void;
}

export default function ImageUploadZone({
  category,
  onUploadComplete,
}: ImageUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList) {
    setUploading(true);
    setError(null);
    const supabase = createClient();

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${category}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("gallery")
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        setError(`Failed to upload ${file.name}`);
        continue;
      }

      await supabase.from("gallery_images").insert({
        category,
        storage_path: path,
        display_order: 0,
      });
    }

    setUploading(false);
    onUploadComplete();
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files.length) {
            void handleFiles(e.dataTransfer.files);
          }
        }}
        className="border-2 border-dashed border-[var(--color-caramel)] rounded-xl p-10 text-center cursor-pointer hover:bg-[var(--color-linen)] transition-colors"
        role="button"
        tabIndex={0}
        aria-label="Upload images"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) void handleFiles(e.target.files);
          }}
        />
        <p className="text-[var(--color-text-secondary)] font-medium">
          {uploading
            ? "Качване..."
            : "Плъзни снимки тук или кликни за избор"}
        </p>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">PNG, JPG, WEBP</p>
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  );
}
