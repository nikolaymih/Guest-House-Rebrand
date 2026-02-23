import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import GalleryPage from "@/components/gallery/GalleryPage";
import { type GalleryCategory, type GalleryImage } from "@/types";

const VALID_CATEGORIES: GalleryCategory[] = [
  "garden",
  "tavern",
  "spa",
  "rooms",
  "overview",
];

interface Props {
  params: Promise<{ locale: string; category: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.gallery" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function GalleryCategoryPage({ params }: Props) {
  const { category } = await params;

  if (!VALID_CATEGORIES.includes(category as GalleryCategory)) {
    notFound();
  }

  const supabase = await createClient();

  const { data: rows } = await supabase
    .from("gallery_images")
    .select("*")
    .eq("category", category)
    .order("display_order");

  const images: GalleryImage[] = (rows ?? []).map((row) => {
    const { data } = supabase.storage
      .from("gallery")
      .getPublicUrl(row.storage_path as string);
    return {
      id: row.id as string,
      category: row.category as GalleryCategory,
      storage_path: row.storage_path as string,
      display_order: row.display_order as number,
      created_at: row.created_at as string,
      url: data.publicUrl,
    };
  });

  return <GalleryPage category={category as GalleryCategory} images={images} />;
}
