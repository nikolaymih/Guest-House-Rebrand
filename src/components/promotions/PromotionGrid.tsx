"use client";

import { useState } from "react";
import PromotionModal from "./PromotionModal";

interface PromotionItem {
  id: string;
  title: string;
  description: string;
  price: string;
  dateRange: string;
  imageUrl: string | null;
}

export default function PromotionGrid({
  promotions,
  closeLabel,
}: {
  promotions: PromotionItem[];
  closeLabel: string;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = promotions.find((p) => p.id === selectedId) ?? null;

  return (
    <>
      <div className="flex flex-wrap justify-center gap-6">
        {promotions.map((promo) => (
          <button
            key={promo.id}
            onClick={() => setSelectedId(promo.id)}
            className="text-left bg-white rounded-2xl shadow-[var(--shadow-soft)] overflow-hidden hover:shadow-[var(--shadow-medium)] transition-shadow cursor-pointer group w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] max-w-sm"
          >
            {/* Image */}
            {promo.imageUrl ? (
              <img
                src={promo.imageUrl}
                alt={promo.title}
                className="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full aspect-[4/3] bg-[var(--color-linen)] flex items-center justify-center">
                <span className="text-[var(--color-text-muted)] text-sm">—</span>
              </div>
            )}

            {/* Content */}
            <div className="p-4 space-y-2">
              <h3 className="font-serif text-lg text-[var(--color-espresso)]">{promo.title}</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-[var(--color-candlelight)] text-[var(--color-espresso)] px-2 py-0.5 rounded-full font-semibold">
                  {promo.price}
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">{promo.dateRange}</span>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] line-clamp-3">
                {promo.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <PromotionModal
          title={selected.title}
          price={selected.price}
          dateRange={selected.dateRange}
          description={selected.description}
          imageUrl={selected.imageUrl}
          closeLabel={closeLabel}
          onClose={() => setSelectedId(null)}
        />
      )}
    </>
  );
}
