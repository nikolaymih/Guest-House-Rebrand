# Public Promotions Component — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a reusable promotions section that displays active promotions on the Home, Accommodation, and Reservation pages with card grid and detail modal.

**Architecture:** Server component (`PromotionSection`) fetches active promotions, returns null if none. Passes resolved data to a client component (`PromotionGrid`) that renders cards and manages modal state. Dropped into each page as a single `<PromotionSection locale={locale} />` line.

**Tech Stack:** Next.js 16 (App Router), Supabase, next-intl, TypeScript, Tailwind CSS

---

### Task 1: Add i18n keys for promotions

**Files:**
- Modify: `messages/bg.json`
- Modify: `messages/en.json`

**Step 1: Add promotions namespace to bg.json**

Find a suitable location (e.g. after the existing `"landmarksPage"` block) and add:

```json
"promotions": {
  "heading": "Актуални промоции",
  "validUntil": "Валидна до",
  "close": "Затвори"
}
```

**Step 2: Add promotions namespace to en.json**

Same location:

```json
"promotions": {
  "heading": "Current Promotions",
  "validUntil": "Valid until",
  "close": "Close"
}
```

**Step 3: Commit**

```bash
git add messages/bg.json messages/en.json
git commit -m "feat: add i18n keys for public promotions"
```

---

### Task 2: Create PromotionModal component

**Files:**
- Create: `src/components/promotions/PromotionModal.tsx`

**Step 1: Create the client component**

```tsx
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
```

**Step 2: Commit**

```bash
git add src/components/promotions/PromotionModal.tsx
git commit -m "feat: add PromotionModal component"
```

---

### Task 3: Create PromotionGrid component

**Files:**
- Create: `src/components/promotions/PromotionGrid.tsx`

**Step 1: Create the client component**

This component receives an array of resolved promotions and the close label, renders cards, and manages modal state.

```tsx
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promotions.map((promo) => (
          <button
            key={promo.id}
            onClick={() => setSelectedId(promo.id)}
            className="text-left bg-white rounded-2xl shadow-[var(--shadow-soft)] overflow-hidden hover:shadow-[var(--shadow-medium)] transition-shadow cursor-pointer group"
          >
            {/* Image */}
            {promo.imageUrl ? (
              <img
                src={promo.imageUrl}
                alt={promo.title}
                className="w-full aspect-[16/9] object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full aspect-[16/9] bg-[var(--color-linen)] flex items-center justify-center">
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
```

Note: Uses `line-clamp-3` (Tailwind built-in) to truncate description to 3 lines on the card.

**Step 2: Commit**

```bash
git add src/components/promotions/PromotionGrid.tsx
git commit -m "feat: add PromotionGrid component"
```

---

### Task 4: Create PromotionSection server component

**Files:**
- Create: `src/components/promotions/PromotionSection.tsx`

**Step 1: Create the server component**

This is the single entry point — fetches data, resolves URLs, picks locale text, and delegates rendering to `PromotionGrid`. Returns `null` if no active promotions.

```tsx
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import PromotionGrid from "./PromotionGrid";

export default async function PromotionSection({ locale }: { locale: string }) {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data } = await supabase
    .from("promotions")
    .select("*")
    .gte("valid_to", today)
    .order("display_order", { ascending: true });

  const promotions = data ?? [];
  if (promotions.length === 0) return null;

  const t = await getTranslations({ locale, namespace: "promotions" });

  const items = promotions.map((p) => {
    const fromFormatted = p.valid_from.split("-").reverse().join(".");
    const toFormatted = p.valid_to.split("-").reverse().join(".");
    return {
      id: p.id,
      title: locale === "en" ? p.title_en : p.title_bg,
      description: locale === "en" ? p.description_en : p.description_bg,
      price: p.price,
      dateRange: `${fromFormatted} – ${toFormatted}`,
      imageUrl: p.storage_path
        ? supabase.storage.from("gallery").getPublicUrl(p.storage_path).data.publicUrl
        : null,
    };
  });

  return (
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-serif text-3xl text-[var(--color-espresso)] mb-10 text-center">
          {t("heading")}
        </h2>
        <PromotionGrid promotions={items} closeLabel={t("close")} />
      </div>
    </section>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/promotions/PromotionSection.tsx
git commit -m "feat: add PromotionSection server component"
```

---

### Task 5: Integrate into Home page

**Files:**
- Modify: `src/app/[locale]/page.tsx`

**Step 1: Add import**

Add at the top with other imports (after line 7):

```tsx
import PromotionSection from "@/components/promotions/PromotionSection";
```

**Step 2: Insert the component**

Insert `<PromotionSection locale={locale} />` between the About section (ends line 128 `</section>`) and the Welcome section (starts line 131 `{welcomeImages.length > 0 && (`).

Add this line between lines 128 and 130 (after the closing `</section>` of About, before the `{/* Welcome Section */}` comment):

```tsx
      {/* Promotions */}
      <PromotionSection locale={locale} />
```

**Step 3: Commit**

```bash
git add src/app/[locale]/page.tsx
git commit -m "feat: add promotions section to home page"
```

---

### Task 6: Integrate into Accommodation page

**Files:**
- Modify: `src/app/[locale]/accommodation/page.tsx`

**Step 1: Add import**

Add at the top with other imports (after line 7):

```tsx
import PromotionSection from "@/components/promotions/PromotionSection";
```

**Step 2: Insert the component**

Insert between the PricingTable `</section>` (line 65) and the Reservation `<section>` (line 68). Add after line 65:

```tsx
      {/* Promotions */}
      <PromotionSection locale={locale} />
```

**Step 3: Commit**

```bash
git add src/app/[locale]/accommodation/page.tsx
git commit -m "feat: add promotions section to accommodation page"
```

---

### Task 7: Integrate into Reservation page

**Files:**
- Modify: `src/app/[locale]/reservation/page.tsx`

**Step 1: Add import**

Add at the top with other imports (after line 4):

```tsx
import PromotionSection from "@/components/promotions/PromotionSection";
```

**Step 2: Insert the component**

Insert after the form section `</section>` (line 35), before the closing `</div>` (line 36). Add after line 35:

```tsx
      {/* Promotions */}
      <PromotionSection locale={locale} />
```

**Step 3: Commit**

```bash
git add src/app/[locale]/reservation/page.tsx
git commit -m "feat: add promotions section to reservation page"
```

---

### Task 8: Verify everything works

**Step 1: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: No errors.

**Step 2: Manual verification**

1. Home page — verify "Актуални промоции" section appears between "Добре дошли" and "Заповядайте при нас" with 2 promotion cards
2. Click a card — verify modal opens with full image, title, price, dates, description
3. Close modal — Escape key, X button, and backdrop click all work
4. Accommodation page — verify promotions section between pricing table and inquiry form
5. Reservation page — verify promotions section after the form
6. Switch to EN (`/en/`) — verify heading says "Current Promotions" and card content is in English
7. Body scroll is locked when modal is open, restored when closed
