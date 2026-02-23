"use client";

import { useState } from "react";
import { RowsPhotoAlbum } from "react-photo-album";
import "react-photo-album/rows.css";
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

  const photos = images.map((img) => ({
    src: img.url ?? img.storage_path,
    width: 800,
    height: 600,
    alt: "",
  }));

  const slides = photos.map((p) => ({ src: p.src, alt: p.alt }));

  return (
    <>
      <RowsPhotoAlbum
        photos={photos}
        onClick={({ index }) => setLightboxIndex(index)}
        rowConstraints={{ maxPhotos: 4 }}
        targetRowHeight={250}
        renderPhoto={({ imageProps: { alt, style, ...rest } }) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt={alt} style={{ ...style, objectFit: "cover" }} {...rest} />
        )}
      />
      <LightboxViewer
        slides={slides}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(-1)}
      />
    </>
  );
}
