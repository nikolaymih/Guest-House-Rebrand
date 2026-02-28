# Public Promotions Component — Design

**Date:** 2026-02-28

## Overview

Reusable promotions section displayed on 3 pages. Renders a card grid of active promotions with a modal for full details. Returns null (renders nothing) if no active promotions exist.

No nav link — users discover promotions naturally while browsing.

## Component Architecture

Three components in `src/components/promotions/`:

### `PromotionSection.tsx` (server component)
- Fetches active promotions from Supabase (`valid_to >= today`, ordered by `display_order`)
- Returns `null` if no active promotions
- Accepts `locale` prop to select `title_bg`/`title_en` and `description_bg`/`description_en`
- Renders heading "Актуални промоции" / "Current Promotions" via `next-intl` `getTranslations`
- Passes resolved data to `PromotionGrid`

### `PromotionGrid.tsx` (client component)
- Receives promotions array as props (URLs and locale text already resolved)
- Renders card grid: 1 col mobile, 2 cols `md`, 3 cols `lg`
- Manages modal open/close state
- Each card is fully clickable — opens modal

### `PromotionModal.tsx` (client component)
- Full-screen overlay with backdrop blur
- Shows: full-size image, title, price badge, date range (DD.MM.YYYY), full description (split by double newlines)
- Close via X button, backdrop click, or Escape key

## Card Design

Each card shows:
- Image (16:9 aspect ratio, `object-cover`, or placeholder)
- Title (locale-aware)
- Price badge (candlelight gold, `rounded-full`)
- Date range (DD.MM.YYYY – DD.MM.YYYY, muted text)
- Description snippet (first 120 chars, truncated with "...")

Styling: `--color-espresso` text, `--color-linen` card bg, `--shadow-soft`, `--color-candlelight` price badge.

## Page Integration

### Home (`src/app/[locale]/page.tsx`)
Insert `<PromotionSection locale={locale} />` between "Добре дошли" about section and "Заповядайте при нас" welcome section.

### Accommodation (`src/app/[locale]/accommodation/page.tsx`)
Insert between PricingTable and "Изпратете запитване" section.

### Reservation (`src/app/[locale]/reservation/page.tsx`)
Insert after the form section.

## i18n

Add to `messages/bg.json`:
```json
"promotions": {
  "heading": "Актуални промоции",
  "validUntil": "Валидна до"
}
```

Add to `messages/en.json`:
```json
"promotions": {
  "heading": "Current Promotions",
  "validUntil": "Valid until"
}
```

## Data Flow

1. Server component fetches from `promotions` table with `valid_to >= CURRENT_DATE`
2. Resolves image URLs via `supabase.storage.from("gallery").getPublicUrl()`
3. Selects locale-appropriate title/description
4. Passes flat array to client `PromotionGrid`
5. Client handles click → modal interaction
