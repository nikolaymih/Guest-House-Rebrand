# Guest House Rebrand — Design Document

**Date:** 2026-02-23
**Status:** Approved

---

## 1. Overview

Full rebuild of the existing guest house website (React/Vite + Express/Node.js) as a modern Next.js full-stack application. The public site is redesigned from scratch using the Scandi Cozy design system. A new admin panel is introduced for managing gallery images and pricing. The existing Express API and Railway PostgreSQL hosting are replaced entirely by Supabase and Next.js Route Handlers.

---

## 2. Tech Stack

| Concern | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Bundler | Turbopack (Next.js native) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Design System | Scandi Cozy theme |
| Auth | Supabase Auth — Google SSO only |
| Database | Supabase Postgres (via Supabase JS client) |
| Storage | Supabase Storage (gallery images) |
| Email | Nodemailer (Gmail SMTP) via Next.js Route Handler |
| Validation | Zod — single shared schema, used on both client and server |
| Forms | React Hook Form + Zod resolver |
| Date handling | date-fns |
| Gallery (public) | react-photo-album + yet-another-react-lightbox |
| i18n | next-intl |
| Linting | ESLint (strict) + Prettier — zero warnings/errors |
| Component rule | No file exceeds ~350 lines |

---

## 3. Architecture

### Full-Stack in One Repo

Next.js serves both the public website and the admin panel. API logic lives in Next.js Route Handlers (`/app/api/`). No separate backend server. Railway dependency removed entirely.

### Auth Strategy

- Supabase Auth handles Google SSO flow
- `@supabase/ssr` middleware runs on every request
- Admin routes (`/admin/*` and `/en/admin/*`) check for an authenticated session
- Admin identity verified by matching the authenticated user's email against `ADMIN_EMAIL` environment variable
- Unauthenticated → redirect to `/admin/login`
- Authenticated but not admin → 403 page
- No user registration — admin account is pre-configured via Google OAuth

### i18n Strategy

- Library: `next-intl`
- Default locale: `bg` (Bulgarian) — no URL prefix (e.g., `/`, `/gallery/garden`)
- English locale: `/en/` prefix (e.g., `/en`, `/en/gallery/garden`)
- Language switcher in header (top right, alongside phone number)
- Translation files: `messages/bg.json` and `messages/en.json`
- All static content (nav labels, page text, form labels, error messages, landmarks descriptions, house rules, etc.) translated
- `generateMetadata()` outputs locale-appropriate `<title>` and `<meta description>` for SEO

---

## 4. Project Structure

```
src/
├── app/
│   ├── [locale]/                    ← next-intl locale wrapper
│   │   ├── layout.tsx               ← root layout with Header + Footer
│   │   ├── page.tsx                 ← / (landing)
│   │   ├── gallery/
│   │   │   └── [category]/page.tsx  ← /gallery/[category]
│   │   ├── accommodation/page.tsx
│   │   ├── reservation/page.tsx
│   │   ├── landmarks/page.tsx
│   │   ├── contacts/page.tsx
│   │   ├── rules/page.tsx
│   │   ├── personal-data/page.tsx
│   │   └── admin/
│   │       ├── layout.tsx           ← auth guard
│   │       ├── login/page.tsx
│   │       ├── page.tsx             ← admin dashboard
│   │       ├── gallery/page.tsx
│   │       └── pricing/page.tsx
│   └── api/
│       └── reservation/route.ts     ← POST: save to DB + send email
├── components/
│   ├── ui/                          ← shadcn primitives
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── NavBar.tsx
│   │   └── LanguageSwitcher.tsx
│   ├── reservation/
│   │   ├── ReservationForm.tsx
│   │   ├── FormField.tsx
│   │   └── ConsentCheckbox.tsx
│   ├── gallery/
│   │   ├── GalleryPage.tsx
│   │   ├── CategoryTabs.tsx
│   │   ├── PhotoGrid.tsx
│   │   └── LightboxViewer.tsx
│   ├── pricing/
│   │   ├── PricingTable.tsx
│   │   └── PriceRow.tsx
│   └── admin/
│       ├── AdminGalleryManager.tsx
│       ├── ImageUploadZone.tsx
│       ├── AdminImageGrid.tsx
│       ├── PricingEditor.tsx
│       └── PricingRow.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                ← browser Supabase client
│   │   ├── server.ts                ← server Supabase client
│   │   └── middleware.ts            ← session refresh + route protection
│   ├── email/
│   │   ├── mailer.ts                ← Nodemailer config
│   │   └── templates.ts             ← HTML email templates
│   ├── validations/
│   │   └── reservation.ts           ← shared Zod schema
│   └── utils/
│       ├── cn.ts                    ← clsx + tailwind-merge helper
│       └── format.ts                ← date-fns formatters, currency helpers
├── types/
│   └── index.ts                     ← shared TypeScript types
├── messages/
│   ├── bg.json                      ← Bulgarian translations
│   └── en.json                      ← English translations
└── middleware.ts                    ← next-intl + Supabase auth middleware
```

---

## 5. Database Schema

### `reservations`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK, gen_random_uuid() |
| full_name | text | not null |
| email | text | not null |
| phone | text | not null |
| subject | text | not null |
| message | text | not null |
| created_at | timestamptz | default now() |

### `pricing`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| guest_count | int | e.g. 9, 10, 11, 12 |
| daily_rate_bgn | numeric | not null |
| two_day_bgn | numeric | not null |
| three_plus_bgn | numeric | not null |
| spa_variant | boolean | true = SPA included |
| updated_at | timestamptz | default now() |

### `gallery_images`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| category | text | garden / tavern / spa / rooms / overview |
| storage_path | text | path in Supabase Storage bucket |
| display_order | int | default 0 |
| created_at | timestamptz | default now() |

### Row Level Security (RLS)
- `reservations`: INSERT open to public (anon), SELECT admin only
- `pricing`: SELECT open to public, INSERT/UPDATE admin only
- `gallery_images`: SELECT open to public, INSERT/UPDATE/DELETE admin only

---

## 6. Public Pages

All pages are Server Components (SSR) with `generateMetadata()` for SEO. `next/image` used for all images.

| Route (bg) | Route (en) | Content |
|---|---|---|
| `/` | `/en` | Hero carousel, house description, Google Map, reservation form |
| `/gallery/[category]` | `/en/gallery/[category]` | Photo grid (react-photo-album) + lightbox (yet-another-react-lightbox) |
| `/accommodation` | `/en/accommodation` | Room details, pricing table (from DB) |
| `/reservation` | `/en/reservation` | Standalone reservation form |
| `/landmarks` | `/en/landmarks` | Tourist attractions guide |
| `/contacts` | `/en/contacts` | Contact info, Google Map, Facebook |
| `/rules` | `/en/rules` | House rules |
| `/personal-data` | `/en/personal-data` | GDPR/privacy policy |

---

## 7. Reservation Form

**Fields:** fullName, email, phone, subject, message, consent checkbox
**Validation:** Shared Zod schema — same schema imported on client (React Hook Form resolver) and server (Route Handler)
**Submission flow:** POST `/api/reservation` → validate → save to `reservations` table → send HTML email via Nodemailer to admin → return success/error
**UX:** Toast notification on success/error, form resets on success, submit button disabled while loading
**Bulgarian support:** Validation regex patterns preserve Cyrillic support (ported from existing Yup schema)

---

## 8. Gallery

### Public
- `react-photo-album` renders a responsive rows/masonry grid per category
- `yet-another-react-lightbox` opens on image click — fullscreen, swipe, keyboard navigation
- Images fetched server-side from `gallery_images` table (storage URLs) for SSR/SEO
- Category tabs: Градина / Механа / Спа / Интериор / Overview

### Admin Gallery Management (`/admin/gallery`)
- Same 5-tab structure as public gallery
- Per tab: upload zone (drag & drop or file picker, multiple files) + current image grid with ✕ delete overlay
- Upload flow: file → Supabase Storage → insert row in `gallery_images` → grid refreshes
- Delete flow: remove from Supabase Storage → delete row in `gallery_images` → grid refreshes

---

## 9. Pricing Management

### Public (`/accommodation`)
- Pricing table rendered from `pricing` table in DB
- Displays BGN + EUR (EUR = BGN / 1.9558)
- Shows discount notes (15% Mon–Thu, 5% early booking) as static text

### Admin Pricing Editor (`/admin/pricing`)
- Table of all pricing rows
- Each row has a pen icon — click to enter edit mode
- Edit mode converts numeric cells to `<input type="number">` fields inline
- Save button → PATCH to update row in Supabase → optimistic UI update
- Cancel button → reverts to display mode without saving

---

## 10. Header

```
[Logo / House Name]    [Nav links]    [Телефон за резервации: (+359) 885 771 328]  [BG | EN]
```

- Language switcher: two flag icons (BG active by default), clicking switches locale and navigates to the equivalent page in the other language
- Phone number always visible on desktop, collapsed on mobile
- Mobile: hamburger menu → offcanvas sidebar with nav + language switcher + phone

---

## 11. SEO

- `generateMetadata()` on every page — locale-aware title + description
- Open Graph tags on landing page
- JSON-LD structured data (LocalBusiness schema) on landing page
- `next/image` for all images (WebP, lazy loading, size optimization)
- `next-sitemap` for automatic sitemap generation (both locales)
- Canonical URLs via next-intl alternate links

---

## 12. Design System

**Theme:** Scandi Cozy
**Primary fonts:** DM Serif Display (headings) + Nunito (body)
**Key colors:**
- Background: `#FDF8F3` (Cream)
- Text: `#3D3028` (Espresso)
- Accent: `#C4956A` (Caramel)
- Border: `#EBE1D5` (Oatmeal)

Tailwind CSS custom theme tokens map directly to Scandi Cozy CSS variables. shadcn/ui components are re-themed using these tokens. No Bootstrap.

---

## 13. What Is Reused from Existing App

| Item | Reused | Notes |
|---|---|---|
| Reservation form fields & Cyrillic validation | Yes | Ported to Zod |
| Email template structure | Yes | Ported to Nodemailer HTML template |
| Admin email + Gmail SMTP config | Yes | Same credentials |
| Google Maps coordinates | Yes | 43.494470, 27.039641 |
| Pricing data | Yes | Seeded into DB from current hardcoded values |
| Gallery image files | Yes | Migrated to Supabase Storage |
| Landmarks content | Yes | Translated + moved to i18n messages |
| Page structure / routes | Yes | Same pages, redesigned UI |
| Bootstrap / Formik / Yup / Axios | No | Replaced by Tailwind/shadcn, RHF, Zod, fetch |
| Vite bundler | No | Next.js Turbopack |
| Express server | No | Next.js Route Handlers |
| Railway PostgreSQL | No | Supabase Postgres |
| Local image files (build-time) | No | Supabase Storage (runtime) |
