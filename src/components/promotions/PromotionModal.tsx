"use client";

import { useEffect } from "react";

interface PromotionModalProps {
  title: string;
  price: string;
  dateRange: string;
  description: string;
  imageUrl: string | null;
  closeLabel: string;
  onClose: () => void;
}

export default function PromotionModal({
  title,
  price,
  dateRange,
  description,
  imageUrl,
  closeLabel,
  onClose,
}: PromotionModalProps) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 text-[var(--color-espresso)] hover:bg-white transition-colors cursor-pointer text-lg font-semibold"
          aria-label={closeLabel}
        >
          ✕
        </button>

        {/* Image */}
        {imageUrl && (
          <img
            src={imageUrl}
            alt={title}
            className="w-full aspect-[16/9] object-cover rounded-t-2xl"
          />
        )}

        {/* Content */}
        <div className="p-6 space-y-4">
          <h3 className="font-serif text-2xl text-[var(--color-espresso)]">{title}</h3>

          <div className="flex items-center gap-3">
            <span className="text-sm bg-[var(--color-candlelight)] text-[var(--color-espresso)] px-3 py-1 rounded-full font-semibold">
              {price}
            </span>
            <span className="text-sm text-[var(--color-text-muted)]">{dateRange}</span>
          </div>

          <div className="text-[var(--color-text-secondary)] leading-relaxed space-y-3">
            {description.split("\n\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
