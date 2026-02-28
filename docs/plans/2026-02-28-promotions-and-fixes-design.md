# Promotions Admin & Header Fixes — Design

**Date:** 2026-02-28
**Approach:** Clone landmarks pattern (Approach A)

## Bug Fixes

### 1. Cursor pointer on BG/EN switch

`src/components/layout/LanguageSwitcher.tsx` — add `cursor-pointer` to both locale buttons.

### 2. Mobile nav order

`src/components/layout/MobileMenu.tsx` — reorder `NAV_LINKS` so accommodation is 2nd (after home), matching desktop order:

1. Начало → `/`
2. Настаняване → `/accommodation`
3. Галерия → `/gallery/garden`
4. Забележителности → `/landmarks`
5. Резервация → `/reservation`
6. Контакти → `/contacts`

## Promotions Feature (Admin Only)

### Database: `promotions` table

```sql
promotions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          text UNIQUE NOT NULL,
  title_bg      text NOT NULL,
  title_en      text NOT NULL,
  description_bg text NOT NULL,
  description_en text NOT NULL,
  price         text NOT NULL,
  valid_from    date NOT NULL,
  valid_to      date NOT NULL,
  storage_path  text,
  display_order integer NOT NULL DEFAULT 0,
  created_at    timestamptz DEFAULT now()
)
```

- `price` is free-form text (e.g. "50 EUR", "20% отстъпка", "от 30 лв/нощ").
- `valid_from` / `valid_to` are calendar dates.
- Images stored in existing `gallery` bucket under `promotions/{slug}-{timestamp}.{ext}`.
- RLS disabled (admin-only, accessed via service role key).
- Slug auto-generated from `title_bg`.
- Admin query filters `valid_to >= CURRENT_DATE` to hide expired promotions.
- Expired promotions are not shown and cannot be recovered.

### TypeScript type

```typescript
export interface Promotion {
  id: string;
  slug: string;
  title_bg: string;
  title_en: string;
  description_bg: string;
  description_en: string;
  price: string;
  valid_from: string;
  valid_to: string;
  storage_path: string | null;
  display_order: number;
  created_at: string;
  url?: string;
}
```

### Admin component: `AdminPromotionManager.tsx`

Cloned from `AdminLandmarkManager.tsx` with these changes:

- **Form fields:** title_bg, title_en, description_bg, description_en, price, valid_from (date input), valid_to (date input), image upload.
- **Fetch query:** filters `valid_to >= today`.
- **Card display:** title, price badge, date range, image thumbnail.
- **Drag-and-drop reordering** via `@dnd-kit/sortable`.
- **Inline edit/delete** same pattern as landmarks.

### Admin page

`/admin/promotions/page.tsx` — wrapper with title "Управление на промоции", mounts `AdminPromotionManager`.

### Admin nav update

Insert "Промоции" in `AdminNav.tsx` between "Галерия" and "Забележителности":

1. Начало → `/admin/home`
2. Настаняване → `/admin/accommodation`
3. Галерия → `/admin/gallery`
4. **Промоции** → `/admin/promotions`
5. Забележителности → `/admin/landmarks`
6. Logout

### i18n

No new translation keys for admin (hardcoded Bulgarian). Promotion content is bilingual via `title_bg`/`title_en` and `description_bg`/`description_en` — ready for future public page.

### Public display

Deferred to a separate task. This design covers admin CRUD only.
