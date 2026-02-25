"use client";

import { useState, useEffect, useCallback } from "react";

interface CarouselImage {
  id: string;
  url: string;
}

interface HeroCarouselProps {
  images: CarouselImage[];
}

export default function HeroCarousel({ images }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % images.length);
  }, [images.length]);

  const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, images.length]);

  if (!images.length) return null;

  return (
    <div className="relative w-full h-[80vh] overflow-hidden bg-[var(--color-espresso)]">
      {images.map((img, i) => (
        <div
          key={img.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={img.url}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      {/* Prev button */}
      {images.length > 1 && (
        <button
          onClick={prev}
          aria-label="Previous"
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors z-10"
        >
          ‹
        </button>
      )}

      {/* Next button */}
      {images.length > 1 && (
        <button
          onClick={next}
          aria-label="Next"
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors z-10"
        >
          ›
        </button>
      )}

      {/* Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === current
                  ? "bg-white scale-110"
                  : "bg-white/50 hover:bg-white/75"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
