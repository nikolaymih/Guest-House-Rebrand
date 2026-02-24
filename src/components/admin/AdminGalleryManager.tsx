"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { type GalleryCategory, type GalleryImage } from "@/types";
import ImageUploadZone from "./ImageUploadZone";
import AdminImageGrid from "./AdminImageGrid";

const ALL_CATEGORIES: GalleryCategory[] = ["garden", "tavern", "spa", "rooms"];

const CATEGORY_LABELS: Record<GalleryCategory, string> = {
  garden: "Градина",
  tavern: "Механа",
  spa: "СПА",
  rooms: "Интериор",
  overview: "Заглавни снимки",
  welcome: "Заповядайте при нас",
};

interface AdminGalleryManagerProps {
  categories?: GalleryCategory[];
}

export default function AdminGalleryManager({ categories }: AdminGalleryManagerProps) {
  const displayCategories = categories ?? ALL_CATEGORIES;
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>(displayCategories[0]);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("gallery_images")
        .select("*")
        .eq("category", activeCategory)
        .order("display_order", { ascending: true });

      setImages(
        (data ?? []).map((row) => ({
          ...row,
          url: supabase.storage.from("gallery").getPublicUrl(row.storage_path).data.publicUrl,
        }))
      );
    }
    void load();
  }, [activeCategory, refreshKey]);

  return (
    <div>
      {displayCategories.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {displayCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                activeCategory === cat
                  ? "bg-[var(--color-caramel)] text-white"
                  : "bg-[var(--color-linen)] text-[var(--color-text-secondary)] hover:bg-[var(--color-oatmeal)]"
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      )}
      <ImageUploadZone category={activeCategory} onUploadComplete={refresh} />
      <AdminImageGrid images={images} onDelete={refresh} />
    </div>
  );
}
