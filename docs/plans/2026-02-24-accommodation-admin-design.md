# Accommodation Admin & Public Page Design

**Date:** 2026-02-24

## Goal

Extend the admin panel so the accommodation page content (text + feature bullets) is fully editable in both languages, allow adding and deleting pricing rows, and add a reservation form section at the bottom of the public accommodation page.

---

## Database

### New table: `accommodation_content` (singleton, always id = 1)

| Column | Type |
|--------|------|
| id | INTEGER PRIMARY KEY DEFAULT 1 |
| about_heading_bg | TEXT NOT NULL |
| about_heading_en | TEXT NOT NULL |
| about_p1_bg | TEXT NOT NULL |
| about_p1_en | TEXT NOT NULL |
| about_p2_bg | TEXT NOT NULL |
| about_p2_en | TEXT NOT NULL |
| features_heading_bg | TEXT NOT NULL |
| features_heading_en | TEXT NOT NULL |
| updated_at | TIMESTAMPTZ DEFAULT now() |

Seeded with the current values from `messages/bg.json` and `messages/en.json`.

### New table: `accommodation_features`

| Column | Type |
|--------|------|
| id | UUID PRIMARY KEY DEFAULT gen_random_uuid() |
| label_bg | TEXT NOT NULL |
| label_en | TEXT NOT NULL |
| display_order | INTEGER NOT NULL DEFAULT 0 |

Seeded with current features from translation files.

### Existing table: `pricing`

No schema changes. Add INSERT and DELETE operations in the admin only.

### RLS

- Both new tables: authenticated users can SELECT/INSERT/UPDATE/DELETE; public can SELECT.

---

## Admin UI

### Navigation

- Rename nav item "Цени" → "Настаняване"
- Route: `/admin/pricing` → `/admin/accommodation` (old route redirects)

### `/admin/accommodation` page — two tabs

**Tab 1: "Съдържание"**

A single form with BG/EN field pairs for:
- About heading
- Paragraph 1
- Paragraph 2
- Features heading

Below the text fields: a features list where each item shows `label_bg` + `label_en` inline with a delete (✕) button. An "Добави характеристика" button appends a new blank item row. One "Запази" button at the bottom upserts the singleton content row and syncs (delete-all + re-insert) the features list.

**Tab 2: "Цени"**

Existing pricing editor (Без/Със СПА toggle, editable rows) extended with:
- A ✕ delete button on each row — clicking shows `confirm()` dialog before deleting from DB.
- An "+ Добави ред" button at the bottom of the table — reveals an inline form row with: guest count input, 3 price fields, Без/Със СПА toggle → "Запази" / "Отказ" buttons.

---

## Public Accommodation Page

### Content from DB

The page fetches three things in parallel:
1. `accommodation_content` — single row
2. `accommodation_features` — ordered list
3. `pricing` — existing query

Text fields rendered using `_bg` / `_en` suffix based on locale. The following translation keys are removed from `messages/bg.json` and `messages/en.json`:
- `accommodationPage.aboutHeading`
- `accommodationPage.aboutP1`
- `accommodationPage.aboutP2`
- `accommodationPage.featuresHeading`
- `accommodationPage.features`

Keys that stay in translation files (not editable in admin): `heroTitle`, `pricingHeading`, `inquiryHeading`, `inquirySubtitle`.

### Reservation form section

Added at the bottom of the page, matching the home page layout:
- Two-column grid (heading + subtitle left, `<ReservationForm />` right)
- Heading/subtitle text sourced from existing `accommodationPage.inquiryHeading` / `accommodationPage.inquirySubtitle` translation keys (add these to messages files).

---

## Components

| Component | Action |
|-----------|--------|
| `src/app/admin/accommodation/page.tsx` | New page (replaces `/admin/pricing`) |
| `src/app/admin/pricing/page.tsx` | Redirect → `/admin/accommodation` |
| `src/components/admin/AccommodationContentEditor.tsx` | New — BG/EN text fields + features list |
| `src/components/admin/PricingEditor.tsx` | Extend — add delete button per row + add-row form |
| `src/components/admin/PricingRow.tsx` | Extend — add delete button |
| `src/app/[locale]/accommodation/page.tsx` | Fetch from DB, add reservation form section |
| `src/app/admin/layout.tsx` | Update nav link |
| `messages/bg.json` | Remove DB-sourced keys, add inquiry keys |
| `messages/en.json` | Remove DB-sourced keys, add inquiry keys |
| `src/types/index.ts` | Add `AccommodationContent`, `AccommodationFeature` types |
