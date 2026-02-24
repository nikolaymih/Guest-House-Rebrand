# Guest House Stanovets — Setup & Deployment Notes

## Tech Stack

- **Framework:** Next.js 16, App Router, TypeScript
- **Styling:** Tailwind CSS v4, custom Scandi Cozy design tokens
- **Backend:** Supabase (Postgres + Storage + Auth)
- **i18n:** next-intl — Bulgarian default (`/`), English (`/en/...`)
- **Email:** Nodemailer via Gmail SMTP
- **Forms:** React Hook Form + Zod
- **Admin auth:** Supabase Google OAuth

---

## Environment Variables (`.env.local`)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # server-only, never expose to browser

# Admin
ADMIN_EMAIL=stanovets.eu@gmail.com  # only this Google account can access /admin

# Email (Nodemailer / Gmail SMTP)
EMAIL_USER=stanovets.eu@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx      # Gmail App Password (not login password)
EMAIL_DEV_RECEIVER=n.mihaylovv@gmail.com
EMAIL_PROD_RECEIVER=stanovets.eu@gmail.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000  # change to production domain on Vercel
```

### Getting the Gmail App Password
1. myaccount.google.com → Security → 2-Step Verification (enable if not on)
2. Search "App passwords" → Create → name it "Stanovets site"
3. Copy the 16-character code (spaces are fine)

---

## Supabase Setup

### 1. Database Tables (SQL Editor)

```sql
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_count INT NOT NULL,
  daily_rate_bgn NUMERIC NOT NULL,
  two_day_bgn NUMERIC NOT NULL,
  three_plus_bgn NUMERIC NOT NULL,
  spa_variant BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('garden', 'tavern', 'spa', 'rooms', 'overview')),
  storage_path TEXT NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. RLS Policies (SQL Editor)

```sql
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

-- reservations: server-side API uses service role key (bypasses RLS)
-- pricing: public read
CREATE POLICY "Public can read pricing"
  ON pricing FOR SELECT TO anon USING (true);
CREATE POLICY "Authenticated can manage pricing"
  ON pricing FOR ALL TO authenticated USING (true);

-- gallery_images: public read
CREATE POLICY "Public can read gallery images"
  ON gallery_images FOR SELECT TO anon USING (true);
CREATE POLICY "Authenticated can manage gallery images"
  ON gallery_images FOR ALL TO authenticated USING (true);
```

### 6. Add Welcome Category + Landmark Images Table (SQL Editor)

Run this **after** the initial setup to support the welcome section and landmark detail pages:

```sql
-- Add 'welcome' category to gallery_images constraint
ALTER TABLE gallery_images DROP CONSTRAINT gallery_images_category_check;
ALTER TABLE gallery_images ADD CONSTRAINT gallery_images_category_check
  CHECK (category IN ('garden', 'tavern', 'spa', 'rooms', 'overview', 'welcome'));

-- Create landmark_images table (one image per landmark slug)
CREATE TABLE landmark_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE landmark_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read landmark images"
  ON landmark_images FOR SELECT TO anon USING (true);
CREATE POLICY "Authenticated can manage landmark images"
  ON landmark_images FOR ALL TO authenticated USING (true);
```

Then run the migration script to upload all images (gallery + hero + welcome + landmarks):

```bash
npm run migrate:images
```

### 3. Seed Pricing Data (SQL Editor)

```sql
TRUNCATE TABLE pricing;

-- Without SPA
INSERT INTO pricing (guest_count, daily_rate_bgn, two_day_bgn, three_plus_bgn, spa_variant) VALUES
(1,  383,  650,  312, false),
(2,  383,  650,  312, false),
(3,  443,  750,  360, false),
(4,  443,  750,  360, false),
(5,  472,  800,  384, false),
(6,  502,  850,  408, false),
(7,  502,  850,  408, false),
(8,  531,  900,  432, false),
(9,  590, 1000,  480, false),
(10, 590, 1000,  480, false),
(11, 590, 1000,  480, false),
(12, 590, 1000,  480, false);

-- With SPA
INSERT INTO pricing (guest_count, daily_rate_bgn, two_day_bgn, three_plus_bgn, spa_variant) VALUES
(1,  422,  715,  344, true),
(2,  422,  715,  344, true),
(3,  488,  825,  398, true),
(4,  488,  825,  398, true),
(5,  520,  880,  424, true),
(6,  553,  935,  451, true),
(7,  553,  935,  451, true),
(8,  585,  990,  477, true),
(9,  650, 1100,  530, true),
(10, 650, 1100,  530, true),
(11, 650, 1100,  530, true),
(12, 650, 1100,  530, true);
```

### 4. Storage Bucket

- Dashboard → Storage → New Bucket
- Name: `gallery`
- Public: **Yes** (marketing photos need public URLs)

### 5. Google OAuth

- Dashboard → Authentication → Providers → Google → Enable
- Add Client ID + Secret from Google Cloud Console
- Dashboard → Authentication → URL Configuration → Redirect URLs:
  - `http://localhost:3000/auth/callback` (development)
  - `https://yourdomain.com/auth/callback` (production)

---

## Image Migration (from old UI)

Copies images from old `/Guest-house-UI/src/assets/images/gallery/` into Supabase Storage:

```bash
npm run migrate:images
```

Requires `.env.local` with `SUPABASE_SERVICE_ROLE_KEY` set.

---

## Running Locally

```bash
npm run dev       # starts on localhost:3000
npm test          # run Vitest tests (13 passing)
npm run build     # production build (also generates sitemap)
```

---

## Bugs Fixed During Development

| # | Bug | Fix |
|---|-----|-----|
| 1 | `404` on `/api/reservation` | Proxy was running intl middleware on API routes — added `/api/` exclusion |
| 2 | `500` on reservation submit (RLS) | Reservation API now uses service role key (server-side, safe) |
| 3 | Gallery images not showing | Supabase bucket was private — set to Public in dashboard |
| 4 | Gallery images stretched | Replaced photo-album component with CSS grid + `aspect-[4/3]` + `object-fit: cover` |
| 5 | Language switcher EN→BG broken | Used `next/navigation` instead of next-intl's `createNavigation` |
| 6 | Translations only on headers | All pages had hardcoded BG strings — rewired to `getTranslations` |
| 7 | `404` on homepage after dev start | Proxy had no intl middleware — added `createIntlMiddleware` for public routes |
| 8 | Admin login loops back to login | Missing `/auth/callback` route to exchange OAuth code for session |
| 9 | Admin nav links (Gallery/Pricing) do nothing | Same root cause as #8 — session not established without callback route |
| 10 | New gallery images appear in wrong position | Upload was inserting `display_order: 0`; fixed to order by `created_at DESC` |
| 11 | Form validation errors in English in BG mode | Zod schema used hardcoded strings — refactored to `makeReservationSchema(msgs)` factory with next-intl translations |
| 12 | Pricing table showed only 9–12 guests | Initial seed only had 4 rows — re-seeded with all 12 guest counts × 2 SPA variants |
| 13 | `middleware.ts` deprecated in Next.js 16 | Renamed to `proxy.ts`, export renamed to `proxy()` |
| 14 | Zod `errorMap` API changed in v4 | Updated to `z.literal(true, { error: "..." })` |
| 15 | Email not sending | Gmail App Password not configured in `.env.local` |

---

## Deployment (Vercel)

1. Push branch to GitHub
2. Import project in Vercel → connect repo
3. Add all env vars from `.env.local` (change `NEXT_PUBLIC_APP_URL` to production URL)
4. Add production callback URL in Supabase: `https://yourdomain.com/auth/callback`
5. Deploy

---

## Admin Panel

- URL: `/admin/login`
- Auth: Google OAuth (only `ADMIN_EMAIL` can access)
- Gallery manager: `/admin/gallery` — upload/delete images per category
- Pricing editor: `/admin/pricing` — inline edit of all pricing rows
