import { type GalleryCategory, type GalleryImage } from "@/types";
import CategoryTabs from "./CategoryTabs";
import PhotoGrid from "./PhotoGrid";

interface GalleryPageProps {
  category: GalleryCategory;
  images: GalleryImage[];
}

export default function GalleryPage({ category, images }: GalleryPageProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <CategoryTabs active={category} />
      <PhotoGrid images={images} />
    </section>
  );
}
