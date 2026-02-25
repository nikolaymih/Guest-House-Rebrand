# Logo & Favicon Upload Design

**Date:** 2026-02-25

## Goal

Admin can upload a site logo (PNG, transparent) and a square favicon from the "Начало" admin section. The logo replaces the hardcoded "Становец" text in the header. The favicon is served dynamically via Next.js `generateMetadata`. No SEO risk — logo gets added to structured data improving Google Knowledge Graph presence.

---

## Database & Storage

### New table: `site_settings` (singleton, id = 1)

| Column | Type | Notes |
|--------|------|-------|
| `id` | `int` | primary key, always 1 |
| `logo_url` | `text` | nullable — public Supabase storage URL |
| `favicon_url` | `text` | nullable — public Supabase storage URL |
| `updated_at` | `timestamptz` | default now() |

RLS: public read, `authenticated` write (same as `home_content`).

SQL files saved to `docs/supabase/`.

### New Supabase Storage bucket: `assets` (public)

Upload naming: `logo-{timestamp}.png` / `favicon-{timestamp}.png` — timestamped to bust CDN cache. URL stored in `site_settings`.

---

## Admin UI (`HomeContentEditor.tsx`)

New "Лого и икона" section added **above** the existing BG/EN text fields. Two upload cards side by side:

**Logo card:**
- Preview on espresso background (so transparency is visible), or placeholder text if none uploaded
- "Качи лого" button → file picker, PNG only
- Hint: *"Препоръчваме PNG с прозрачен фон"*

**Favicon card:**
- Small square preview, or placeholder if none uploaded
- "Качи икона" button → file picker, PNG only
- Hint: *"Препоръчваме квадратно PNG изображение"*

Both upload instantly on file select (no "Запази" needed). Spinner during upload, preview refreshes after.

---

## Header (`src/components/layout/Header.tsx`)

- Convert from `useTranslations` → `await getTranslations` (async server component)
- Fetch `logo_url` from `site_settings` on each request
- If logo exists → `<img src={logoUrl} alt="Становец" className="h-8 w-auto" />`
- If no logo → fallback to hardcoded "Становец" text (no visible change until admin uploads)

---

## Favicon (`src/app/layout.tsx`)

- Change from static `export const metadata` → `export async function generateMetadata()`
- Fetch `favicon_url` from `site_settings` using React `cache()` to avoid duplicate fetches
- If found → `icons: { icon: faviconUrl }`
- If not found → no favicon set (browser default)

---

## SEO Bonus (`src/components/seo/LocalBusinessSchema.tsx`)

- Accept `logoUrl` prop
- Include `"logo": logoUrl` in the JSON-LD structured data
- Helps Google Knowledge Graph show the logo in search results
- Called from `src/app/[locale]/page.tsx` which already fetches `site_settings`

---

## Files Touched

| File | Change |
|------|--------|
| `docs/supabase/create-site-settings.sql` | Create |
| `src/types/index.ts` | Add `SiteSettings` type |
| `src/components/admin/HomeContentEditor.tsx` | Add logo/favicon upload section at top |
| `src/components/layout/Header.tsx` | Fetch logo from DB, show image or fallback text |
| `src/app/layout.tsx` | `generateMetadata` with dynamic favicon |
| `src/components/seo/LocalBusinessSchema.tsx` | Accept + emit logo URL in JSON-LD |
| `src/app/[locale]/page.tsx` | Fetch `site_settings`, pass logo to schema |
