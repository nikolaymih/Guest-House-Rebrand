# Home Admin & UI Improvements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an admin "Начало" section backed by Supabase, fix AccommodationContentEditor visual layout, correct location description text and distances, add contact sidebar next to every reservation form, and redesign the footer with 4 columns + Facebook card.

**Architecture:** Server components read from Supabase and fall back gracefully; admin components are client components that upsert to Supabase using the singleton-row pattern (id=1) used in accommodation_content. `ContactSidebar` is a new shared server component. Footer becomes a server component (no `"use client"` needed after redesign). `HomeContentEditor` mirrors `AccommodationContentEditor` exactly.

**Tech Stack:** Next.js 16 App Router, Supabase JS v2, next-intl, Tailwind CSS

---

### Task 1: Create Supabase tables + add TypeScript types

**Files:**
- Modify: `src/types/index.ts`

**Step 1: Create tables in Supabase SQL editor**

Run this SQL in the Supabase project's SQL editor (Dashboard → SQL editor):

```sql
-- home_content singleton table
create table home_content (
  id int primary key,
  hero_title_bg text not null default '',
  hero_title_en text not null default '',
  hero_subtitle_bg text not null default '',
  hero_subtitle_en text not null default '',
  about_heading_bg text not null default '',
  about_heading_en text not null default '',
  about_p1_bg text not null default '',
  about_p1_en text not null default '',
  about_p2_bg text not null default '',
  about_p2_en text not null default '',
  about_p3_bg text not null default '',
  about_p3_en text not null default '',
  amenities_heading_bg text not null default '',
  amenities_heading_en text not null default '',
  updated_at timestamptz not null default now()
);

-- home_amenities (same shape as accommodation_features)
create table home_amenities (
  id uuid primary key default gen_random_uuid(),
  label_bg text not null default '',
  label_en text not null default '',
  display_order int not null default 0
);

-- RLS: allow public read, service role write (same as accommodation_features)
alter table home_content enable row level security;
alter table home_amenities enable row level security;

create policy "Public read home_content" on home_content for select using (true);
create policy "Public read home_amenities" on home_amenities for select using (true);
create policy "Service role write home_content" on home_content for all using (auth.role() = 'service_role');
create policy "Service role write home_amenities" on home_amenities for all using (auth.role() = 'service_role');
```

**Step 2: Add TypeScript types to `src/types/index.ts`**

Open `src/types/index.ts`. After the last existing type export, append:

```typescript
export interface HomeContent {
  id: number;
  hero_title_bg: string;
  hero_title_en: string;
  hero_subtitle_bg: string;
  hero_subtitle_en: string;
  about_heading_bg: string;
  about_heading_en: string;
  about_p1_bg: string;
  about_p1_en: string;
  about_p2_bg: string;
  about_p2_en: string;
  about_p3_bg: string;
  about_p3_en: string;
  amenities_heading_bg: string;
  amenities_heading_en: string;
  updated_at: string;
}

export interface HomeAmenity {
  id: string;
  label_bg: string;
  label_en: string;
  display_order: number;
}
```

**Step 3: Confirm no tests broken**

```bash
npm test -- --passWithNoTests
```

Expected: all existing tests pass.

**Step 4: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add HomeContent and HomeAmenity types"
```

---

### Task 2: Update translation files — location fix, footer, contact sidebar

**Files:**
- Modify: `messages/bg.json`
- Modify: `messages/en.json`

**Step 1: Update `messages/bg.json`**

In the `"home"` object, make these changes:

1. Add `"locationDescription"` key right before `"locationHeading"`:
```json
"locationDescription": "Щастливи сме да ви поканим в самостоятелна къща за гости в село Становец, община Хитрино, намиращо се сред широколистните гори на Воеводското плато, на 400м надморска височина, в Лудогорието!",
```

2. Update the `"distances"` array values (currently wrong):
```json
"distances": [
  { "city": "Шумен", "distance": "38 км" },
  { "city": "Велики Преслав", "distance": "52 км" },
  { "city": "Плиска", "distance": "35 км" }
],
```

3. Add `"facebookLabel"` to the `"home"` object (for ContactSidebar):
```json
"facebookLabel": "Facebook",
```

In the `"reservationPage"` object, add:
```json
"facebookLabel": "Facebook",
```

Replace the entire `"footer"` object with:
```json
"footer": {
  "guestHouseName": "Къща за гости Становец",
  "address": "село Становец, община Хитрино, България",
  "amenitiesHeading": "Удобства",
  "amenities": [
    "Starlink Wi-Fi",
    "Спа зона",
    "Басейн",
    "Японско джакузи"
  ],
  "accommodationHeading": "Настаняване",
  "accommodationItems": [
    "Цяла къща",
    "Единична стая",
    "Тройна стая",
    "Апартамент за четирима"
  ],
  "linksHeading": "Полезни връзки",
  "linkHome": "За къщата",
  "linkReservation": "Резервации",
  "linkRules": "Правила",
  "linkPrivacy": "Лични данни",
  "facebookLabel": "Следвайте ни във Facebook",
  "rights": "Всички права запазени"
},
```

**Step 2: Update `messages/en.json`**

Make identical structural changes:

1. Add `"locationDescription"` before `"locationHeading"`:
```json
"locationDescription": "We are happy to invite you to a standalone guest house in the village of Stanovets, Hitrino municipality, nestled among the deciduous forests of the Voyevodsko Plateau, at 400 m altitude, in Ludogorie!",
```

2. Update `"distances"`:
```json
"distances": [
  { "city": "Shumen", "distance": "38 km" },
  { "city": "Veliki Preslav", "distance": "52 km" },
  { "city": "Pliska", "distance": "35 km" }
],
```

3. Add `"facebookLabel": "Facebook"` to the `"home"` object.

In `"reservationPage"` add:
```json
"facebookLabel": "Facebook",
```

Replace the entire `"footer"` object with:
```json
"footer": {
  "guestHouseName": "Guest House Stanovets",
  "address": "Village of Stanovets, Hitrino Municipality, Bulgaria",
  "amenitiesHeading": "Amenities",
  "amenities": [
    "Starlink Wi-Fi",
    "Spa zone",
    "Swimming pool",
    "Japanese jacuzzi"
  ],
  "accommodationHeading": "Accommodation",
  "accommodationItems": [
    "Whole house",
    "Single room",
    "Triple room",
    "Apartment for four"
  ],
  "linksHeading": "Useful Links",
  "linkHome": "About the house",
  "linkReservation": "Reservations",
  "linkRules": "House Policy",
  "linkPrivacy": "Privacy Policy",
  "facebookLabel": "Follow us on Facebook",
  "rights": "All rights reserved"
},
```

**Step 3: Validate JSON**

```bash
node -e "JSON.parse(require('fs').readFileSync('messages/bg.json','utf8')); console.log('bg.json OK')"
node -e "JSON.parse(require('fs').readFileSync('messages/en.json','utf8')); console.log('en.json OK')"
```

Expected: `bg.json OK` and `en.json OK` printed.

**Step 4: Run tests**

```bash
npm test -- --passWithNoTests
```

**Step 5: Commit**

```bash
git add messages/bg.json messages/en.json
git commit -m "feat: fix location description/distances, add footer and contact sidebar translation keys"
```

---

### Task 3: AccommodationContentEditor visual fix

**Files:**
- Modify: `src/components/admin/AccommodationContentEditor.tsx`

**Context:** The component renders a grid of BG/EN pairs with only `(BG)` / `(EN)` suffixes in the label. Add clear column headers above the text fields section and above the characteristics list section.

**Step 1: Add column headers above the text fields grid**

In `src/components/admin/AccommodationContentEditor.tsx`, find the text fields section (the `<div className="space-y-6">` that maps over `TEXT_FIELDS`). Add a header row directly above it:

Replace:
```tsx
      {/* Text fields — BG + EN side by side */}
      <div className="space-y-6">
        {TEXT_FIELDS.map(({ keyBg, keyEn, label, multiline }) => (
```

With:
```tsx
      {/* Text fields — BG + EN side by side */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-xs font-bold text-[var(--color-espresso)] uppercase tracking-wider border-b border-[var(--color-border)] pb-1">
            БГ — Български
          </div>
          <div className="text-xs font-bold text-[var(--color-espresso)] uppercase tracking-wider border-b border-[var(--color-border)] pb-1">
            EN — English
          </div>
        </div>
        {TEXT_FIELDS.map(({ keyBg, keyEn, label, multiline }) => (
```

**Step 2: Add column headers above the characteristics list**

Find the characteristics section. It starts with:
```tsx
        <div className="space-y-2">
          {features.map((feat, idx) => (
```

Add a header row directly above the `<div className="space-y-2">`:

```tsx
        <div className="grid grid-cols-[1fr_1fr_2rem] gap-3 mb-1">
          <div className="text-xs font-bold text-[var(--color-espresso)] uppercase tracking-wider border-b border-[var(--color-border)] pb-1">
            Характеристика (БГ)
          </div>
          <div className="text-xs font-bold text-[var(--color-espresso)] uppercase tracking-wider border-b border-[var(--color-border)] pb-1">
            Characteristic (EN)
          </div>
          <div />
        </div>
        <div className="space-y-2">
          {features.map((feat, idx) => (
```

**Step 3: Run tests**

```bash
npm test -- --passWithNoTests
```

**Step 4: Commit**

```bash
git add src/components/admin/AccommodationContentEditor.tsx
git commit -m "fix: add BG/EN column headers to AccommodationContentEditor"
```

---

### Task 4: Create ContactSidebar component

**Files:**
- Create: `src/components/contact/ContactSidebar.tsx`

**Context:** The contacts page (`src/app/[locale]/contacts/page.tsx`) already has the exact card pattern. `ContactSidebar` renders the same 3 cards (Phone, Email, Facebook) stacked vertically, as a server component. It accepts a `namespace` prop so it can pick up labels from either `"home"`, `"reservationPage"`, or `"contactsPage"` — all have `phoneLabel`, `emailLabel`, `facebookLabel`.

**Step 1: Create the file**

Create `src/components/contact/ContactSidebar.tsx` with this content:

```tsx
import { getTranslations } from "next-intl/server";

const FB_URL =
  "https://www.facebook.com/people/%D0%A1%D1%82%D0%B0%D0%BD%D0%BE%D0%B2%D0%B5%D1%86/100063453006216/";

interface Props {
  locale: string;
  namespace: "home" | "reservationPage" | "contactsPage";
}

export default async function ContactSidebar({ locale, namespace }: Props) {
  const t = await getTranslations({ locale, namespace });

  const contacts = [
    {
      label: t("phoneLabel"),
      value: "(+359) 885 771 328",
      href: "tel:+359885771328",
    },
    {
      label: t("emailLabel"),
      value: "stanovets.eu@gmail.com",
      href: "mailto:stanovets.eu@gmail.com",
    },
    {
      label: t("facebookLabel"),
      value: "Становец / Stanovets",
      href: FB_URL,
    },
  ];

  return (
    <div className="flex flex-col gap-3 mt-6">
      {contacts.map((c) => (
        <div
          key={c.href}
          className="bg-[var(--color-linen)] rounded-xl px-4 py-3 flex flex-col"
        >
          <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-0.5">
            {c.label}
          </span>
          <a
            href={c.href}
            target={c.href.startsWith("http") ? "_blank" : undefined}
            rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="text-[var(--color-caramel)] font-semibold hover:text-[var(--color-caramel-deep)] transition-colors text-sm"
          >
            {c.value}
          </a>
        </div>
      ))}
    </div>
  );
}
```

**Step 2: Run tests**

```bash
npm test -- --passWithNoTests
```

**Step 3: Commit**

```bash
git add src/components/contact/ContactSidebar.tsx
git commit -m "feat: add ContactSidebar server component"
```

---

### Task 5: Add ContactSidebar + location description to pages

**Files:**
- Modify: `src/app/[locale]/page.tsx`
- Modify: `src/app/[locale]/accommodation/page.tsx`
- Modify: `src/app/[locale]/reservation/page.tsx`

#### Home page (`src/app/[locale]/page.tsx`)

**Step 1: Import ContactSidebar**

Add to the imports at the top of `src/app/[locale]/page.tsx`:

```tsx
import ContactSidebar from "@/components/contact/ContactSidebar";
```

**Step 2: Add `locationDescription` to the location section**

Find the Location section. After the `<h2>` heading and before the distances grid, add:

```tsx
          <p className="text-[var(--color-text-secondary)] leading-relaxed text-center mb-8 max-w-2xl mx-auto">
            {t("locationDescription")}
          </p>
```

Full updated location section:
```tsx
      {/* Location */}
      <section className="bg-[var(--color-bg-primary)] py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif text-3xl text-[var(--color-espresso)] mb-4 text-center">
            {t("locationHeading")}
          </h2>
          <p className="text-[var(--color-text-secondary)] leading-relaxed text-center mb-8 max-w-2xl mx-auto">
            {t("locationDescription")}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {distances.map((item) => (
              <div key={item.city} className="bg-white rounded-xl p-6 text-center shadow-[var(--shadow-soft)]">
                <p className="font-semibold text-[var(--color-espresso)]">{item.city}</p>
                <p className="text-[var(--color-caramel)] text-sm mt-1">{item.distance}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl overflow-hidden shadow-[var(--shadow-medium)] h-64">
            <iframe
              src="https://maps.google.com/maps?q=43.494470,27.039641&z=11&output=embed"
              className="w-full h-full border-0"
              loading="lazy"
              title="Map"
            />
          </div>
        </div>
      </section>
```

**Step 3: Add ContactSidebar to the reservation section**

Find the Reservation section. The left column currently has an `<h2>` and `<p>`. Add `<ContactSidebar>` after the `<p>`:

```tsx
      {/* Reservation */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="font-serif text-3xl text-[var(--color-espresso)] mb-4">
              {t("inquiryHeading")}
            </h2>
            <p className="text-[var(--color-text-secondary)] leading-relaxed">
              {t("inquirySubtitle")}
            </p>
            <ContactSidebar locale={locale} namespace="home" />
          </div>
          <ReservationForm />
        </div>
      </section>
```

#### Accommodation page (`src/app/[locale]/accommodation/page.tsx`)

**Step 4: Import ContactSidebar**

Add to imports:
```tsx
import ContactSidebar from "@/components/contact/ContactSidebar";
```

**Step 5: Add ContactSidebar to the reservation section**

Find the reservation section left column. It currently has `<h2>` and `<p>`. Add after the `<p>`:

```tsx
          <div>
            <h2 className="font-serif text-3xl text-[var(--color-espresso)] mb-4">
              {t("inquiryHeading")}
            </h2>
            <p className="text-[var(--color-text-secondary)] leading-relaxed">
              {t("inquirySubtitle")}
            </p>
            <ContactSidebar locale={locale} namespace="home" />
          </div>
```

(The accommodation page uses the `"home"` namespace for these keys since it uses `t = getTranslations({ namespace: "accommodationPage" })` — check if `accommodationPage` has `phoneLabel`/`emailLabel`. If not, use `"home"` namespace which already has them.)

> **Note:** `ContactSidebar` takes a `locale` prop and a `namespace` prop. If `accommodationPage` doesn't have `phoneLabel`/`emailLabel`/`facebookLabel` keys, pass `namespace="home"` — the home namespace has all three. Check the existing `accommodationPage` keys before deciding which namespace to pass.

#### Reservation page (`src/app/[locale]/reservation/page.tsx`)

**Step 6: Replace inline contact list with ContactSidebar**

The reservation page currently builds a `contacts` array manually and renders phone + email inline. Replace that entire inline block with `ContactSidebar` (which also adds Facebook):

Import:
```tsx
import ContactSidebar from "@/components/contact/ContactSidebar";
```

Remove the `contacts` const array and the `<div className="space-y-3">` block that maps over it. Replace with:

```tsx
            <ContactSidebar locale={locale} namespace="reservationPage" />
```

Full updated left column:
```tsx
          <div>
            <h2 className="font-serif text-2xl text-[var(--color-espresso)] mb-4">{t("inquiryHeading")}</h2>
            <p className="text-[var(--color-text-secondary)] leading-relaxed mb-4">{t("inquirySubtitle")}</p>
            <ContactSidebar locale={locale} namespace="reservationPage" />
          </div>
```

**Step 7: Run tests**

```bash
npm test -- --passWithNoTests
```

**Step 8: Commit**

```bash
git add src/app/\[locale\]/page.tsx src/app/\[locale\]/accommodation/page.tsx src/app/\[locale\]/reservation/page.tsx
git commit -m "feat: add ContactSidebar and location description to pages"
```

---

### Task 6: Footer redesign

**Files:**
- Modify: `src/components/layout/Footer.tsx`

**Context:** The current footer is a 3-column client component. Replace it with a 4-column server component. The footer does not need client-side features — remove `"use client"`. Use `getTranslations` (server) instead of `useTranslations`.

**Step 1: Replace `src/components/layout/Footer.tsx` entirely**

```tsx
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";

const FB_URL =
  "https://www.facebook.com/people/%D0%A1%D1%82%D0%B0%D0%BD%D0%BE%D0%B2%D0%B5%D1%86/100063453006216/";

export default async function Footer() {
  const t = await getTranslations("footer");

  const amenities = t.raw("amenities") as string[];
  const accommodationItems = t.raw("accommodationItems") as string[];

  return (
    <footer className="bg-[var(--color-espresso)] text-[var(--color-parchment)] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 4-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Column 1 — Guest house info */}
          <div>
            <h3 className="font-serif text-lg text-[var(--color-candlelight)] mb-4">
              {t("guestHouseName")}
            </h3>
            <p className="text-sm leading-relaxed mb-3">{t("address")}</p>
            <a
              href="tel:+359885771328"
              className="block text-sm hover:text-[var(--color-candlelight)] transition-colors mb-1"
            >
              (+359) 885 771 328
            </a>
            <a
              href="mailto:stanovets.eu@gmail.com"
              className="block text-sm hover:text-[var(--color-candlelight)] transition-colors"
            >
              stanovets.eu@gmail.com
            </a>
          </div>

          {/* Column 2 — Amenities (static) */}
          <div>
            <h4 className="font-semibold text-[var(--color-warm-white)] mb-4 text-sm uppercase tracking-wider">
              {t("amenitiesHeading")}
            </h4>
            <ul className="space-y-2 text-sm">
              {amenities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Accommodation (static) */}
          <div>
            <h4 className="font-semibold text-[var(--color-warm-white)] mb-4 text-sm uppercase tracking-wider">
              {t("accommodationHeading")}
            </h4>
            <ul className="space-y-2 text-sm">
              {accommodationItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Column 4 — Useful links */}
          <div>
            <h4 className="font-semibold text-[var(--color-warm-white)] mb-4 text-sm uppercase tracking-wider">
              {t("linksHeading")}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-[var(--color-candlelight)] transition-colors">
                  {t("linkHome")}
                </Link>
              </li>
              <li>
                <Link href="/reservation" className="hover:text-[var(--color-candlelight)] transition-colors">
                  {t("linkReservation")}
                </Link>
              </li>
              <li>
                <Link href="/rules" className="hover:text-[var(--color-candlelight)] transition-colors">
                  {t("linkRules")}
                </Link>
              </li>
              <li>
                <Link href="/personal-data" className="hover:text-[var(--color-candlelight)] transition-colors">
                  {t("linkPrivacy")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Facebook card */}
        <a
          href={FB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-[var(--color-walnut)] hover:bg-[var(--color-walnut)]/80 transition-colors rounded-xl px-6 py-4 mb-8 w-full md:w-auto md:inline-flex"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6 text-[var(--color-candlelight)] flex-shrink-0"
            aria-hidden="true"
          >
            <path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
          </svg>
          <span className="text-sm font-semibold text-[var(--color-warm-white)]">
            {t("facebookLabel")}
          </span>
        </a>

        {/* Copyright */}
        <div className="border-t border-[var(--color-walnut)] pt-6 text-center text-xs text-[var(--color-text-muted)]">
          © {new Date().getFullYear()} Становец. {t("rights")}.
        </div>
      </div>
    </footer>
  );
}
```

**Step 2: Check the footer's parent layout uses it correctly**

The footer is likely imported in `src/app/[locale]/layout.tsx`. Since we removed `"use client"`, this should work fine — server components can be used in server layouts. No change needed in the layout.

**Step 3: Run tests**

```bash
npm test -- --passWithNoTests
```

**Step 4: Commit**

```bash
git add src/components/layout/Footer.tsx
git commit -m "feat: redesign footer with 4 columns and Facebook card"
```

---

### Task 7: Create HomeContentEditor admin component

**Files:**
- Create: `src/components/admin/HomeContentEditor.tsx`

**Context:** Mirrors `AccommodationContentEditor.tsx` exactly. Read it at `src/components/admin/AccommodationContentEditor.tsx` to understand the full pattern before implementing. Key differences: different table names (`home_content`, `home_amenities`), different field list (hero title, hero subtitle, about heading, about p1-3, amenities heading).

**Step 1: Create `src/components/admin/HomeContentEditor.tsx`**

```tsx
// src/components/admin/HomeContentEditor.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { type HomeContent, type HomeAmenity } from "@/types";

type ContentForm = Omit<HomeContent, "id" | "updated_at">;

type AmenityItem = { clientId: string; label_bg: string; label_en: string };

function emptyContent(): ContentForm {
  return {
    hero_title_bg: "", hero_title_en: "",
    hero_subtitle_bg: "", hero_subtitle_en: "",
    about_heading_bg: "", about_heading_en: "",
    about_p1_bg: "", about_p1_en: "",
    about_p2_bg: "", about_p2_en: "",
    about_p3_bg: "", about_p3_en: "",
    amenities_heading_bg: "", amenities_heading_en: "",
  };
}

const TEXT_FIELDS: {
  keyBg: keyof ContentForm;
  keyEn: keyof ContentForm;
  label: string;
  multiline?: boolean;
}[] = [
  { keyBg: "hero_title_bg",       keyEn: "hero_title_en",       label: "Заглавие на героя (Становец)" },
  { keyBg: "hero_subtitle_bg",    keyEn: "hero_subtitle_en",    label: "Подзаглавие на героя",          multiline: true },
  { keyBg: "about_heading_bg",    keyEn: "about_heading_en",    label: 'Заглавие „Добре дошли"' },
  { keyBg: "about_p1_bg",         keyEn: "about_p1_en",         label: "Параграф 1",                    multiline: true },
  { keyBg: "about_p2_bg",         keyEn: "about_p2_en",         label: "Параграф 2",                    multiline: true },
  { keyBg: "about_p3_bg",         keyEn: "about_p3_en",         label: "Параграф 3",                    multiline: true },
  { keyBg: "amenities_heading_bg", keyEn: "amenities_heading_en", label: "Заглавие на удобствата" },
];

export default function HomeContentEditor() {
  const [form, setForm] = useState<ContentForm>(emptyContent());
  const [amenities, setAmenities] = useState<AmenityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [amenitiesTouched, setAmenitiesTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      try {
        const [{ data: content, error: contentError }, { data: ams, error: amsError }] = await Promise.all([
          supabase.from("home_content").select("*").eq("id", 1).maybeSingle(),
          supabase.from("home_amenities").select("*").order("display_order"),
        ]);
        if (contentError || amsError) {
          setError("Грешка при зареждане на съдържанието.");
          return;
        }
        if (content) {
          const { id: _id, updated_at: _ts, ...fields } = content as HomeContent;
          setForm(fields);
        }
        if (ams) {
          setAmenities(
            (ams as HomeAmenity[]).map(({ label_bg, label_en }) => ({
              clientId: crypto.randomUUID(),
              label_bg,
              label_en,
            }))
          );
        }
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  useEffect(
    () => () => { if (successTimerRef.current) clearTimeout(successTimerRef.current); },
    []
  );

  function setField(key: keyof ContentForm, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function setAmenityField(idx: number, key: "label_bg" | "label_en", value: string) {
    setAmenities((prev) => prev.map((a, i) => (i === idx ? { ...a, [key]: value } : a)));
  }

  async function handleSave() {
    setAmenitiesTouched(true);
    const hasEmpty = amenities.some((a) => !a.label_bg.trim() || !a.label_en.trim());
    if (hasEmpty) {
      setError("Всички удобства трябва да имат попълнени и двата полета (BG и EN).");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(false);
    const supabase = createClient();
    try {
      const { error: contentError } = await supabase
        .from("home_content")
        .upsert({ id: 1, ...form, updated_at: new Date().toISOString() });
      if (contentError) {
        setError(`Грешка при запазване: ${contentError.message}`);
        return;
      }
      const { error: deleteError } = await supabase
        .from("home_amenities")
        .delete()
        .not("id", "is", null);
      if (deleteError) {
        setError(`Грешка при изтриване на удобства: ${deleteError.message}`);
        return;
      }
      if (amenities.length > 0) {
        const { error: insertError } = await supabase
          .from("home_amenities")
          .insert(
            amenities.map(({ label_bg, label_en }, idx) => ({
              label_bg,
              label_en,
              display_order: idx,
            }))
          );
        if (insertError) {
          setError(`Грешка при запазване на удобства: ${insertError.message}`);
          return;
        }
      }
      setSuccess(true);
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      successTimerRef.current = setTimeout(() => setSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return <p className="text-sm text-[var(--color-text-muted)] py-8">Зареждане...</p>;

  return (
    <div className="space-y-8">
      {/* Text fields — BG + EN side by side */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-xs font-bold text-[var(--color-espresso)] uppercase tracking-wider border-b border-[var(--color-border)] pb-1">
            БГ — Български
          </div>
          <div className="text-xs font-bold text-[var(--color-espresso)] uppercase tracking-wider border-b border-[var(--color-border)] pb-1">
            EN — English
          </div>
        </div>
        {TEXT_FIELDS.map(({ keyBg, keyEn, label, multiline }) => (
          <div key={keyBg} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                {label} (BG)
              </label>
              {multiline ? (
                <textarea
                  rows={3}
                  value={form[keyBg]}
                  onChange={(e) => setField(keyBg, e.target.value)}
                  className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-caramel)] resize-y"
                />
              ) : (
                <input
                  type="text"
                  value={form[keyBg]}
                  onChange={(e) => setField(keyBg, e.target.value)}
                  className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-caramel)]"
                />
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                {label} (EN)
              </label>
              {multiline ? (
                <textarea
                  rows={3}
                  value={form[keyEn]}
                  onChange={(e) => setField(keyEn, e.target.value)}
                  className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-caramel)] resize-y"
                />
              ) : (
                <input
                  type="text"
                  value={form[keyEn]}
                  onChange={(e) => setField(keyEn, e.target.value)}
                  className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-caramel)]"
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Amenities list */}
      <div>
        <h3 className="font-serif text-lg text-[var(--color-espresso)] mb-4">Удобства</h3>
        <div className="grid grid-cols-[1fr_1fr_2rem] gap-3 mb-1">
          <div className="text-xs font-bold text-[var(--color-espresso)] uppercase tracking-wider border-b border-[var(--color-border)] pb-1">
            Удобство (БГ)
          </div>
          <div className="text-xs font-bold text-[var(--color-espresso)] uppercase tracking-wider border-b border-[var(--color-border)] pb-1">
            Amenity (EN)
          </div>
          <div />
        </div>
        <div className="space-y-2">
          {amenities.map((am, idx) => (
            <div key={am.clientId} className="flex items-center gap-3">
              <input
                type="text"
                placeholder="BG *"
                value={am.label_bg}
                onChange={(e) => setAmenityField(idx, "label_bg", e.target.value)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-caramel)] ${
                  amenitiesTouched && !am.label_bg.trim()
                    ? "border-red-400"
                    : "border-[var(--color-border)]"
                }`}
              />
              <input
                type="text"
                placeholder="EN *"
                value={am.label_en}
                onChange={(e) => setAmenityField(idx, "label_en", e.target.value)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-caramel)] ${
                  amenitiesTouched && !am.label_en.trim()
                    ? "border-red-400"
                    : "border-[var(--color-border)]"
                }`}
              />
              <button
                onClick={() => setAmenities((prev) => prev.filter((_, i) => i !== idx))}
                className="text-red-500 hover:text-red-700 font-bold text-lg leading-none flex-shrink-0"
                aria-label="Изтрий"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() =>
            setAmenities((prev) => [
              ...prev,
              { clientId: crypto.randomUUID(), label_bg: "", label_en: "" },
            ])
          }
          className="mt-3 text-sm font-semibold text-[var(--color-caramel)] hover:text-[var(--color-caramel-deep)] transition-colors"
        >
          + Добави удобство
        </button>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && <p className="text-green-600 text-sm">Запазено успешно.</p>}

      <button
        onClick={() => void handleSave()}
        disabled={saving}
        className="px-6 py-2.5 rounded-full bg-[var(--color-caramel)] text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {saving ? "Запазване..." : "Запази"}
      </button>
    </div>
  );
}
```

**Step 2: Run tests**

```bash
npm test -- --passWithNoTests
```

**Step 3: Commit**

```bash
git add src/components/admin/HomeContentEditor.tsx
git commit -m "feat: add HomeContentEditor admin component"
```

---

### Task 8: Create admin home page + update admin nav

**Files:**
- Create: `src/app/admin/home/page.tsx`
- Modify: `src/app/admin/layout.tsx`

**Step 1: Create `src/app/admin/home/page.tsx`**

```tsx
import HomeContentEditor from "@/components/admin/HomeContentEditor";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Начало — Администрация | Становец",
};

export default function AdminHomePage() {
  return (
    <div>
      <h1 className="font-serif text-2xl text-[var(--color-espresso)] mb-8">Начало</h1>
      <HomeContentEditor />
    </div>
  );
}
```

**Step 2: Add "Начало" link to `src/app/admin/layout.tsx`**

In the `<nav>` element, add a "Начало" link as the first item (before "Галерия"):

Replace:
```tsx
        <nav className="flex gap-6 text-sm font-medium">
          <Link
            href="/admin/gallery"
            className="text-[var(--color-parchment)] hover:text-[var(--color-candlelight)] transition-colors"
          >
            Галерия
          </Link>
          <Link
            href="/admin/accommodation"
            className="text-[var(--color-parchment)] hover:text-[var(--color-candlelight)] transition-colors"
          >
            Настаняване
          </Link>
        </nav>
```

With:
```tsx
        <nav className="flex gap-6 text-sm font-medium">
          <Link
            href="/admin/home"
            className="text-[var(--color-parchment)] hover:text-[var(--color-candlelight)] transition-colors"
          >
            Начало
          </Link>
          <Link
            href="/admin/gallery"
            className="text-[var(--color-parchment)] hover:text-[var(--color-candlelight)] transition-colors"
          >
            Галерия
          </Link>
          <Link
            href="/admin/accommodation"
            className="text-[var(--color-parchment)] hover:text-[var(--color-candlelight)] transition-colors"
          >
            Настаняване
          </Link>
        </nav>
```

**Step 3: Run tests**

```bash
npm test -- --passWithNoTests
```

**Step 4: Commit**

```bash
git add src/app/admin/home/page.tsx src/app/admin/layout.tsx
git commit -m "feat: add admin Начало page and nav link"
```

---

### Task 9: Update public home page to read hero/about/amenities from DB

**Files:**
- Modify: `src/app/[locale]/page.tsx`

**Context:** Currently the home page reads `heroTitle`, `heroSubtitle`, `aboutHeading`, `aboutP1-3`, `amenitiesHeading`, and `amenities[]` from the `"home"` translation namespace. After this task, these come from the `home_content` and `home_amenities` Supabase tables. Fall back to the existing translation-file values when the DB row is empty (i.e., when all string fields are empty strings).

**Step 1: Add Supabase queries for home_content and home_amenities**

In `src/app/[locale]/page.tsx`, the existing `Promise.all` fetches carousel and welcome images. Add two more queries to that same `Promise.all`:

```tsx
  const [
    { data: carouselData },
    { data: welcomeData },
    { data: homeContentData },
    { data: homeAmenitiesData },
  ] = await Promise.all([
    supabase
      .from("gallery_images")
      .select("id, storage_path")
      .eq("category", "overview")
      .order("display_order"),
    supabase
      .from("gallery_images")
      .select("id, storage_path")
      .eq("category", "welcome")
      .order("display_order")
      .limit(3),
    supabase.from("home_content").select("*").eq("id", 1).maybeSingle(),
    supabase.from("home_amenities").select("*").order("display_order"),
  ]);
```

Add the imports at the top:
```tsx
import { type HomeContent, type HomeAmenity } from "@/types";
```

**Step 2: Derive display values with fallback**

After the `Promise.all`, add:

```tsx
  const homeContent = homeContentData as HomeContent | null;
  const dbAmenities = (homeAmenitiesData ?? []) as HomeAmenity[];

  // Fall back to translation-file values when DB fields are empty
  const heroTitle =
    (locale === "en" ? homeContent?.hero_title_en : homeContent?.hero_title_bg) ||
    t("heroTitle");
  const heroSubtitle =
    (locale === "en" ? homeContent?.hero_subtitle_en : homeContent?.hero_subtitle_bg) ||
    t("heroSubtitle");
  const aboutHeading =
    (locale === "en" ? homeContent?.about_heading_en : homeContent?.about_heading_bg) ||
    t("aboutHeading");
  const aboutP1 =
    (locale === "en" ? homeContent?.about_p1_en : homeContent?.about_p1_bg) ||
    t("aboutP1");
  const aboutP2 =
    (locale === "en" ? homeContent?.about_p2_en : homeContent?.about_p2_bg) ||
    t("aboutP2");
  const aboutP3 =
    (locale === "en" ? homeContent?.about_p3_en : homeContent?.about_p3_bg) ||
    t("aboutP3");
  const amenitiesHeading =
    (locale === "en" ? homeContent?.amenities_heading_en : homeContent?.amenities_heading_bg) ||
    t("amenitiesHeading");

  // Use DB amenities if available, fall back to translation-file amenities
  const amenityLabels: string[] =
    dbAmenities.length > 0
      ? dbAmenities.map((a) => (locale === "en" ? a.label_en : a.label_bg))
      : (t.raw("amenities") as string[]);
```

Remove the old line `const amenities = t.raw("amenities") as string[];` at the top of the function.

**Step 3: Update JSX to use derived variables**

Replace all hardcoded `{t("heroTitle")}`, `{t("heroSubtitle")}`, etc. with the derived variables:

- `{t("heroTitle")}` → `{heroTitle}`
- `{t("heroSubtitle")}` → `{heroSubtitle}`
- `{t("aboutHeading")}` → `{aboutHeading}`
- `{t("aboutP1")}` → `{aboutP1}`
- `{t("aboutP2")}` → `{aboutP2}`
- `{t("aboutP3")}` → `{aboutP3}`
- `{t("amenitiesHeading")}` → `{amenitiesHeading}`
- `{amenities.map(...)}` → `{amenityLabels.map(...)}`

Keep all other `t(...)` calls (locationHeading, locationDescription, inquiryHeading, etc.) as-is.

**Step 4: Run tests**

```bash
npm test -- --passWithNoTests
```

**Step 5: Commit**

```bash
git add src/app/\[locale\]/page.tsx
git commit -m "feat: home page reads hero/about/amenities from DB with translation fallback"
```
