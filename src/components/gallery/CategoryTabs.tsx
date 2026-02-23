"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { type GalleryCategory } from "@/types";

const CATEGORIES: GalleryCategory[] = ["garden", "tavern", "spa", "rooms"];

interface CategoryTabsProps {
  active: GalleryCategory;
}

export default function CategoryTabs({ active }: CategoryTabsProps) {
  const t = useTranslations("gallery.categories");
  const router = useRouter();

  return (
    <div className="flex flex-wrap gap-2 justify-center mb-8" role="tablist" aria-label="Gallery categories">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          role="tab"
          aria-selected={active === cat}
          onClick={() => router.push(`/gallery/${cat}`)}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
            active === cat
              ? "bg-[var(--color-caramel)] text-white shadow-[var(--shadow-warm)]"
              : "bg-[var(--color-linen)] text-[var(--color-text-secondary)] hover:bg-[var(--color-oatmeal)]"
          }`}
        >
          {t(cat)}
        </button>
      ))}
    </div>
  );
}
