# Admin Gallery & Landmarks Enhancement — Design

**Date:** 2026-02-24

## Goal

Improve the admin panel with drag-and-drop image reordering, correct upload ordering, image size validation, and a full landmark CRUD system backed by the database.

## Scope

Four distinct improvements:

1. **Fix image ordering** — new uploads append to the end; admin and public both display `display_order ASC`
2. **Image size validation** — reject files over 15 MB before upload
3. **Drag-and-drop reordering** — all gallery sections + landmark cards
4. **Landmark CRUD** — move all landmark data to DB; full create/edit/delete/reorder from admin

---

## Architecture

### Tech Stack Additions

- `@dnd-kit/core` + `@dnd-kit/sortable` — drag-and-drop for both image grids and landmark cards

### Database Changes

**New table: `landmarks`** (replaces `landmark_images` + hardcoded messages data)

```sql
CREATE TABLE landmarks (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug           TEXT NOT NULL UNIQUE,
  name_bg        TEXT NOT NULL,
  name_en        TEXT NOT NULL,
  description_bg TEXT NOT NULL,
  description_en TEXT NOT NULL,
  storage_path   TEXT,            -- nullable
  display_order  INT NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE landmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read landmarks"
  ON landmarks FOR SELECT TO anon USING (true);
CREATE POLICY "Authenticated can manage landmarks"
  ON landmarks FOR ALL TO authenticated USING (true);
```

Seed with all 8 existing landmarks (text from `bg.json` / `en.json`, images from current `landmark_images` rows).

Then drop the now-redundant `landmark_images` table.

**`gallery_images` — no schema change.** The existing `display_order` column is used properly from now on.

---

## Feature 1: Image Ordering Fix

**Problem:** `ImageUploadZone` always inserts `display_order: 0`. `AdminGalleryManager` queries `ORDER BY created_at DESC`, so new images appear first in admin but last in public (which uses a different order).

**Fix:**
- `ImageUploadZone`: before inserting, query `MAX(display_order)` for that category, insert with `display_order = max + 1`
- `AdminGalleryManager`: change query to `ORDER BY display_order ASC`
- All public gallery fetch calls (`GalleryPage`, home page `overview`/`welcome` queries): change to `ORDER BY display_order ASC`

---

## Feature 2: Image Size Validation

**Applied in:** `ImageUploadZone` and the landmark image upload in `AdminLandmarkImageManager`.

**Limit:** 15 MB per file.

**Behaviour:**
- Check `file.size > 15 * 1024 * 1024` before calling Supabase
- Show error: `"Снимката е твърде голяма. Максималният размер е 15 МБ."`
- Skip oversized files; continue uploading valid files in the same batch
- Error is shown per-file in the existing error state

---

## Feature 3: Drag-and-Drop Reordering

**Library:** `@dnd-kit/core` + `@dnd-kit/sortable`

**Components affected:**

| Component | What becomes draggable |
|-----------|----------------------|
| `AdminImageGrid` | Each image card (all gallery sections) |
| `AdminLandmarkImageManager` | Each landmark card |

**Interaction:**
- Drag handle icon (⠿) visible on hover on each card
- While dragging: card lifts with shadow, others animate to new positions
- On drop: optimistic local state update (instant), then batch `UPDATE` of all `display_order` values for the affected category/table
- Brief `"Запазено ✓"` indicator after successful DB write

**Batch update strategy for `gallery_images`:**
```
items.forEach((item, index) => UPDATE display_order = index WHERE id = item.id)
```
Done via Supabase's `Promise.all` of individual updates (no bulk update API needed for ~20 items).

---

## Feature 4: Landmark CRUD

### Admin — `AdminLandmarkImageManager` → renamed to `AdminLandmarkManager`

**Card layout (existing + new):**
- Drag handle for reordering
- Thumbnail image (or placeholder)
- Name (BG)
- Three action buttons: **Редактирай** | **Смени снимка** | **Изтрий**

**Edit mode** (inline expand or modal — inline is simpler):
- Заглавие (BG) — required
- Заглавие (EN) — required
- Описание (BG) — required, textarea
- Описание (EN) — required, textarea
- Save / Cancel
- Validation messages in Bulgarian

**Delete:** Confirmation prompt `"Сигурни ли сте, че искате да изтриете тази забележителност?"` before proceeding. Deletes DB row + storage file.

**+ Добави забележителност button** at top-right of the section:
- Opens same edit form, empty
- `slug` auto-generated from `name_bg` on save (e.g. `"Нова скала"` → `nova-skala`, deduplicated with suffix if clash)

### Public pages — `/landmarks` and `/landmarks/[slug]`

- Read from `landmarks` DB table instead of `messages`
- `name_bg`/`name_en` and `description_bg`/`description_en` selected based on locale
- `generateStaticParams` queries DB slugs at build time
- `/landmarks` displays `ORDER BY display_order ASC`
- The landmark entries in `bg.json` and `en.json` are removed after migration

### Data flow

```
Admin creates/edits landmark
        ↓
Supabase `landmarks` table
        ↓
Public /landmarks page (server component, reads DB)
        ↓
Public /landmarks/[slug] page (server component, reads DB by slug)
```

---

## Error Handling

- Upload size error: shown inline, per-file, in Bulgarian
- Landmark save error: shown inline in the form
- Drag-and-drop save error: show `"Грешка при запазване"` + revert order to previous state
- Delete error: show `"Грешка при изтриване"` inline

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/admin/ImageUploadZone.tsx` | Add 15 MB validation + `display_order = max + 1` |
| `src/components/admin/AdminImageGrid.tsx` | Add `@dnd-kit` sortable wrapper |
| `src/components/admin/AdminGalleryManager.tsx` | Change query to `display_order ASC` |
| `src/components/admin/AdminLandmarkImageManager.tsx` | Rename → `AdminLandmarkManager.tsx`, full CRUD + drag-and-drop |
| `src/app/admin/gallery/page.tsx` | Update import for renamed component |
| `src/app/[locale]/landmarks/page.tsx` | Read from DB instead of messages |
| `src/app/[locale]/landmarks/[slug]/page.tsx` | Read from DB instead of messages |
| `src/app/[locale]/gallery/[category]/page.tsx` | Change to `display_order ASC` |
| `src/app/[locale]/page.tsx` | Change overview/welcome queries to `display_order ASC` |
| `messages/bg.json` | Remove `landmarksPage.items` array |
| `messages/en.json` | Remove `landmarksPage.items` array |
| `src/types/index.ts` | Add `Landmark` interface, remove `LandmarkImage` |
| `docs/SETUP.md` | Add SQL for `landmarks` table + seed data |
