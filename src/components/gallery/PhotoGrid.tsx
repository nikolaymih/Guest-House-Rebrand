"use client";

import { useState } from "react";
import LightboxViewer from "./LightboxViewer";
import { type GalleryImage } from "@/types";

interface PhotoGridProps {
  images: GalleryImage[];
}

export default function PhotoGrid({ images }: PhotoGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  if (images.length === 0) {
    return (
      <p className="text-center text-[var(--color-text-muted)] py-16">
        Няма снимки в тази категория.
      </p>
    );
  }

  const slides = images.map((img) => ({ src: img.url ?? img.storage_path, alt: "" }));

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {images.map((img, i) => (
          <div
            key={img.id}
            className="aspect-[4/3] overflow-hidden rounded-lg cursor-pointer"
            onClick={() => setLightboxIndex(i)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url ?? img.storage_path}
              alt=""
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        ))}
      </div>
      <LightboxViewer
        slides={slides}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(-1)}
      />
    </>
  );
}
