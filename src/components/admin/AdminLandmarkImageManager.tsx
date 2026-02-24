"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const LANDMARKS = [
  { slug: "benediktinski-manastir", name: "Бенедиктински манастир" },
  { slug: "pliska", name: "Плиска" },
  { slug: "shumenska-krepost", name: "Шуменска крепост" },
  { slug: "peshtera-zandana", name: "Пещера Зандана" },
  { slug: "madarski-konnik", name: "Мадарски конник" },
  { slug: "hankrumovski-skalen-manastir", name: "Ханкрумовски скален манастир" },
  { slug: "okoto-na-osmar", name: "Окото на Осмар" },
  { slug: "veliki-preslav", name: "Велики Преслав" },
];

interface LandmarkImageRow {
  slug: string;
  storage_path: string;
  url: string;
}

export default function AdminLandmarkImageManager() {
  const [images, setImages] = useState<Record<string, LandmarkImageRow>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadImages() {
    const supabase = createClient();
    const { data } = await supabase.from("landmark_images").select("slug, storage_path");
    const map: Record<string, LandmarkImageRow> = {};
    for (const row of data ?? []) {
      map[row.slug] = {
        ...row,
        url: supabase.storage.from("gallery").getPublicUrl(row.storage_path).data.publicUrl,
      };
    }
    setImages(map);
  }

  useEffect(() => {
    void loadImages();
  }, []);

  async function handleUpload(slug: string, file: File) {
    setUploading(slug);
    setError(null);
    const supabase = createClient();
    const ext = file.name.split(".").pop() ?? "jpg";
    const storagePath = `landmarks/${slug}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("gallery")
      .upload(storagePath, file, { cacheControl: "3600", upsert: true });

    if (uploadError) {
      setError(`Грешка при качване: ${uploadError.message}`);
      setUploading(null);
      return;
    }

    await supabase
      .from("landmark_images")
      .upsert({ slug, storage_path: storagePath }, { onConflict: "slug" });

    setUploading(null);
    void loadImages();
  }

  async function handleDelete(slug: string) {
    const supabase = createClient();
    await supabase.from("landmark_images").delete().eq("slug", slug);
    void loadImages();
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {LANDMARKS.map(({ slug, name }) => {
          const img = images[slug];
          const isUploading = uploading === slug;
          return (
            <div
              key={slug}
              className="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] overflow-hidden shadow-[var(--shadow-soft)]"
            >
              {img ? (
                <div className="relative aspect-[4/3] group">
                  <img
                    src={img.url}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => void handleDelete(slug)}
                    className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Изтрий
                  </button>
                </div>
              ) : (
                <div className="aspect-[4/3] bg-[var(--color-linen)] flex items-center justify-center">
                  <span className="text-xs text-[var(--color-text-muted)]">Няма снимка</span>
                </div>
              )}
              <div className="p-3">
                <p className="text-sm font-semibold text-[var(--color-espresso)] mb-2">{name}</p>
                <label className="block">
                  <span className="sr-only">Качи снимка</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) void handleUpload(slug, e.target.files[0]);
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                      input?.click();
                    }}
                    disabled={isUploading}
                    className="w-full py-1.5 text-xs font-semibold rounded-lg bg-[var(--color-linen)] text-[var(--color-caramel-deep)] hover:bg-[var(--color-oatmeal)] transition-colors disabled:opacity-50"
                  >
                    {isUploading ? "Качване..." : img ? "Смени снимка" : "Качи снимка"}
                  </button>
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
