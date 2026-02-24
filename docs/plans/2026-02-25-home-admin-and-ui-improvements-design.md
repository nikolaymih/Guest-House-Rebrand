# Home Admin & UI Improvements Design

**Date:** 2026-02-25

## Goal

Five improvements: (1) new admin "Начало" section for editing home page content, (2) visual BG/EN separation in AccommodationContentEditor, (3) correct location description text and distance values, (4) contact cards below reservation form everywhere, (5) full footer redesign.

---

## Feature 1: Admin "Начало" Section

### DB Tables (new)

**`home_content`** — singleton (id = 1):
- `hero_title_bg`, `hero_title_en`
- `hero_subtitle_bg`, `hero_subtitle_en`
- `about_heading_bg`, `about_heading_en`
- `about_p1_bg`, `about_p1_en`
- `about_p2_bg`, `about_p2_en`
- `about_p3_bg`, `about_p3_en`
- `amenities_heading_bg`, `amenities_heading_en`
- `updated_at`

**`home_amenities`** — same pattern as `accommodation_features`:
- `id`, `label_bg`, `label_en`, `display_order`

### Components / Pages

| File | Change |
|------|--------|
| `src/components/admin/HomeContentEditor.tsx` | New client component — mirrors AccommodationContentEditor: text fields + dynamic amenity list |
| `src/app/[locale]/admin/home/page.tsx` | New admin page rendering HomeContentEditor |
| `src/app/[locale]/admin/layout.tsx` (or nav component) | Add "Начало" link above "Настаняване" |
| `src/app/[locale]/page.tsx` | Read `home_content` + `home_amenities` from Supabase on each request; fall back to empty strings |

### Editable fields in admin UI

- Hero: title + subtitle (BG / EN)
- "Добре дошли в Становец": heading + 3 paragraphs (BG / EN)
- "Удобства": heading (BG / EN) + dynamic amenity list (add / delete / reorder)

---

## Feature 2: AccommodationContentEditor Visual Fix

**Problem:** BG and EN fields sit side by side with only `(BG)` / `(EN)` label suffixes — visually confusing.

**Fix (pure UI, no logic change):**
- Add a header row above the text fields grid: `| БГ | EN |` — bold, espresso color
- Add a header row above the characteristics list: `| Характеристика (BG) | Характеристика (EN) | |` (matching the 3 columns of the input row)

---

## Feature 3: Location Section Fix

**Description paragraph** — add as new `homePage.locationDescription` translation key, displayed above the distance cards:

> BG: "Щастливи сме да ви поканим в самостоятелна къща за гости в село Становец, община Хитрино, намиращо се сред широколистните гори на Воеводското плато, на 400м надморска височина, в Лудогорието!"
>
> EN: "We are happy to invite you to a standalone guest house in the village of Stanovets, Hitrino municipality, nestled among the deciduous forests of the Voyevodsko Plateau, at 400 m altitude, in Ludogorie!"

**Distance values** — update the 3 existing distance cards in `homePage.distances` array to match accurate values from the old project:

| City | Old (wrong) | New (correct) |
|------|-------------|---------------|
| Шумен / Shumen | 32 км | 38 км |
| Велики Преслав / Veliki Preslav | 15 км | 52 км |
| Плиска / Pliska | 20 км | 35 км |

No structural changes to the location section JSX — only message file values change plus the new paragraph above the cards.

---

## Feature 4: Contact Cards Below Reservation Form

**Where:** Every page that has `<ReservationForm />`:
- `src/app/[locale]/page.tsx` (home)
- `src/app/[locale]/accommodation/page.tsx`
- `src/app/[locale]/reservation/page.tsx`

**Layout:** Below the subtitle `<p>` on the LEFT column (next to the form), stack 3 cards vertically:
1. Phone card — icon + number, `tel:` link
2. Email card — icon + address, `mailto:` link
3. Facebook card — icon + "Следвайте ни" / "Follow us", external link

**Implementation:** Extract into a shared `src/components/contact/ContactSidebar.tsx` server component; place it below the subtitle text in the left column of each page's reservation section.

Phone and email come from `header` translation namespace (already used in `MobileMenu`). Facebook URL: `https://www.facebook.com/people/%D0%A1%D1%82%D0%B0%D0%BD%D0%BE%D0%B2%D0%B5%D1%86/100063453006216/`

---

## Feature 5: Footer Redesign

**Layout:** 4-column grid (2 cols on tablet, 1 col on mobile) + full-width Facebook card below.

### Column 1 — "Къща за гости Становец"
- Guest house name (bold)
- Address: "село Становец, община Хитрино, България"
- Phone (tel: link)
- Email (mailto: link)

### Column 2 — "Удобства" (static)
- Starlink Wi-Fi
- Спа зона
- Басейн
- Японско джакузи

### Column 3 — "Настаняване" (static)
- Цяла къща
- Единична стая
- Тройна стая
- Апартамент за четирима

### Column 4 — "Полезни връзки" (linked)
- За къщата → `/`
- Резервации → `/reservation`
- Правила → `/rules`
- Лични данни → `/personal-data`

### Facebook card (full-width, below columns)
Simple link card: Facebook icon + "Следвайте ни във Facebook" / "Follow us on Facebook"
Link: `https://www.facebook.com/people/%D0%A1%D1%82%D0%B0%D0%BD%D0%BE%D0%B2%D0%B5%D1%86/100063453006216/`
No live API calls — static link only.

All copy stored as translation keys in `messages/bg.json` and `messages/en.json` under `footer.*`.

---

## Components Touched Summary

| File | Change |
|------|--------|
| `src/components/admin/HomeContentEditor.tsx` | Create |
| `src/app/[locale]/admin/home/page.tsx` | Create |
| `src/app/[locale]/admin/layout.tsx` (nav section) | Add "Начало" link |
| `src/components/admin/AccommodationContentEditor.tsx` | Add BG/EN column headers |
| `src/app/[locale]/page.tsx` | Read home_content from DB + add locationDescription + ContactSidebar |
| `src/app/[locale]/accommodation/page.tsx` | Add ContactSidebar |
| `src/app/[locale]/reservation/page.tsx` | Add ContactSidebar |
| `src/components/contact/ContactSidebar.tsx` | Create |
| `src/components/layout/Footer.tsx` | Full redesign |
| `messages/bg.json` | Add home_content keys, locationDescription, correct distances, footer.* |
| `messages/en.json` | Same as bg.json |
