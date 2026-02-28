# Promotions Admin & Header Fixes — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add cursor pointer to language switch, fix mobile nav order, and build admin promotions CRUD section.

**Architecture:** Clone the landmarks admin pattern (AdminLandmarkManager) for promotions. New Supabase `promotions` table with date-range filtering. Two small bug fixes in existing header components.

**Tech Stack:** Next.js 16, Supabase (Postgres + Storage), @dnd-kit/sortable, TypeScript

---

### Task 1: Fix cursor pointer on language switch

**Files:**
- Modify: `src/components/layout/LanguageSwitcher.tsx:20,32`

**Step 1: Add cursor-pointer to both buttons**

In `src/components/layout/LanguageSwitcher.tsx`, add `cursor-pointer` to both button className strings.

Line 20 — BG button className, change:
```tsx
className={`text-sm font-semibold px-2 py-1 rounded transition-colors ${
```
to:
```tsx
className={`text-sm font-semibold px-2 py-1 rounded transition-colors cursor-pointer ${
```

Line 32 — EN button className, same change:
```tsx
className={`text-sm font-semibold px-2 py-1 rounded transition-colors ${
```
to:
```tsx
className={`text-sm font-semibold px-2 py-1 rounded transition-colors cursor-pointer ${
```

**Step 2: Commit**

```bash
git add src/components/layout/LanguageSwitcher.tsx
git commit -m "fix: add cursor-pointer to language switch buttons"
```

---

### Task 2: Fix mobile nav order

**Files:**
- Modify: `src/components/layout/MobileMenu.tsx:8-68`

**Step 1: Restructure mobile menu to match desktop order**

The desktop NavBar order is: Home → Accommodation (with dropdown) → Gallery → Landmarks → Reservation → Contacts.

Currently in `MobileMenu.tsx`, `NAV_LINKS` has home/gallery/landmarks/reservation/contacts, and accommodation is rendered separately after NAV_LINKS as a group at the bottom.

Change the rendering so accommodation appears 2nd (after home), matching desktop. Replace the current `NAV_LINKS` and rendering logic:

Replace `NAV_LINKS` (lines 8-14) with:
```tsx
const NAV_LINKS_BEFORE = [
  { key: "home", href: "/" },
] as const;

const NAV_LINKS_AFTER = [
  { key: "gallery", href: "/gallery/garden" },
  { key: "landmarks", href: "/landmarks" },
  { key: "reservation", href: "/reservation" },
  { key: "contacts", href: "/contacts" },
] as const;
```

Then update the rendering inside the dropdown div (lines 42-68). Replace the `{NAV_LINKS.map(...)}` block and the accommodation section with:

```tsx
{/* Home */}
{NAV_LINKS_BEFORE.map((link) => (
  <Link
    key={link.key}
    href={link.href}
    onClick={() => setOpen(false)}
    className="text-base font-medium text-[var(--color-warm-white)] hover:text-[var(--color-candlelight)] transition-colors"
  >
    {t(link.key)}
  </Link>
))}

{/* Accommodation section — 2nd position */}
<div role="group" aria-label={t("accommodation")} className="flex flex-col gap-4">
  <span aria-hidden="true" className="text-base font-medium text-[var(--color-text-muted)]">
    {t("accommodation")}
  </span>
  {ACCOMMODATION_LINKS.map((link) => (
    <Link
      key={link.key}
      href={link.href}
      onClick={() => setOpen(false)}
      className="pl-4 text-sm font-medium text-[var(--color-warm-white)] hover:text-[var(--color-candlelight)] transition-colors"
    >
      {t(link.key)}
    </Link>
  ))}
</div>

{/* Remaining nav links */}
{NAV_LINKS_AFTER.map((link) => (
  <Link
    key={link.key}
    href={link.href}
    onClick={() => setOpen(false)}
    className="text-base font-medium text-[var(--color-warm-white)] hover:text-[var(--color-candlelight)] transition-colors"
  >
    {t(link.key)}
  </Link>
))}
```

**Step 2: Commit**

```bash
git add src/components/layout/MobileMenu.tsx
git commit -m "fix: reorder mobile nav — accommodation now 2nd after home"
```

---

### Task 3: Create promotions Supabase table

**Files:**
- Create: `supabase/migrations/20260228_create_promotions.sql` (or run via Supabase dashboard)

**Step 1: Create the migration SQL**

```sql
CREATE TABLE promotions (
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
);

ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
```

**Step 2: Run the migration**

Run this SQL in the Supabase dashboard (SQL Editor) for the project. RLS is enabled but no policies are needed — admin access uses the service role key via server-side client.

**Step 3: Commit the migration file**

```bash
mkdir -p supabase/migrations
git add supabase/migrations/20260228_create_promotions.sql
git commit -m "feat: add promotions table migration"
```

---

### Task 4: Add Promotion TypeScript type

**Files:**
- Modify: `src/types/index.ts`

**Step 1: Add the Promotion interface**

Add after the `Landmark` interface (after line 26):

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

**Step 2: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add Promotion type"
```

---

### Task 5: Build AdminPromotionManager component

**Files:**
- Create: `src/components/admin/AdminPromotionManager.tsx`

**Step 1: Create the component**

Clone from `AdminLandmarkManager.tsx` with these modifications:

1. **Import `Promotion` instead of `Landmark`**
2. **`emptyForm()` returns Promotion fields:** `title_bg`, `title_en`, `description_bg`, `description_en`, `price`, `valid_from` (empty string), `valid_to` (empty string)
3. **`PromotionForm` fields array:**
   ```tsx
   const textFields = [
     { key: "title_bg", label: "Заглавие (BG)", multiline: false },
     { key: "title_en", label: "Заглавие (EN)", multiline: false },
     { key: "price", label: "Цена / Отстъпка (напр. 50 EUR, 20% отстъпка)", multiline: false },
     { key: "description_bg", label: "Описание (BG)", multiline: true },
     { key: "description_en", label: "Описание (EN)", multiline: true },
   ] as const;
   ```
4. **Add date inputs** after text fields, before image upload:
   ```tsx
   <div className="grid grid-cols-2 gap-3">
     <div>
       <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
         Валидна от <span className="text-red-500">*</span>
       </label>
       <input
         type="date"
         value={(form.valid_from as string) ?? ""}
         onChange={(e) => setForm({ ...form, valid_from: e.target.value })}
         className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-caramel)]"
       />
       {touched && !(form.valid_from as string)?.trim() && (
         <p className="text-red-500 text-xs mt-0.5">Полето е задължително.</p>
       )}
     </div>
     <div>
       <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
         Валидна до <span className="text-red-500">*</span>
       </label>
       <input
         type="date"
         value={(form.valid_to as string) ?? ""}
         onChange={(e) => setForm({ ...form, valid_to: e.target.value })}
         className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-caramel)]"
       />
       {touched && !(form.valid_to as string)?.trim() && (
         <p className="text-red-500 text-xs mt-0.5">Полето е задължително.</p>
       )}
     </div>
   </div>
   ```
5. **Validation** must also check `valid_from` and `valid_to` are non-empty and `price` is non-empty.
6. **`SortablePromotionCard`** displays:
   - Drag handle (same as landmarks)
   - Image thumbnail (same)
   - Title (`promotion.title_bg`)
   - Price badge: `<span className="text-xs bg-[var(--color-candlelight)] text-[var(--color-espresso)] px-2 py-0.5 rounded-full font-semibold">{promotion.price}</span>`
   - Date range: `<p className="text-xs text-[var(--color-text-muted)]">{promotion.valid_from} – {promotion.valid_to}</p>`
   - Edit/Delete buttons (same)
7. **`load()` function** — query `promotions` table with filter:
   ```tsx
   const today = new Date().toISOString().split("T")[0];
   const { data } = await supabase
     .from("promotions")
     .select("*")
     .gte("valid_to", today)
     .order("display_order", { ascending: true });
   ```
8. **`handleSave()`** — same pattern as landmarks but:
   - Slug from `formData.title_bg` instead of `name_bg`
   - Storage path: `promotions/${slug}-${Date.now()}.${ext}` (not `landmarks/`)
   - Insert/update uses `title_bg`, `title_en`, `description_bg`, `description_en`, `price`, `valid_from`, `valid_to`, `storage_path`, `display_order`
9. **`handleDelete()`** and **`handleDragEnd()`** — same logic, just on `promotions` table with `Promotion` type.
10. **Button text:** `"+ Добави промоция"` instead of `"+ Добави забележителност"`
11. **Empty state text:** `"Няма активни промоции."` instead of `"Няма добавени забележителности."`

**Step 2: Commit**

```bash
git add src/components/admin/AdminPromotionManager.tsx
git commit -m "feat: add AdminPromotionManager component"
```

---

### Task 6: Create admin promotions page

**Files:**
- Create: `src/app/admin/promotions/page.tsx`

**Step 1: Create the page**

```tsx
import AdminPromotionManager from "@/components/admin/AdminPromotionManager";

export default function AdminPromotionsPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl text-[var(--color-espresso)] mb-2">
        Управление на промоции
      </h1>
      <p className="text-sm text-[var(--color-text-muted)] mb-8">
        Добавяйте, редактирайте и подреждайте промоции. Показват се само активните (с валидна крайна дата).
      </p>
      <AdminPromotionManager />
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/admin/promotions/page.tsx
git commit -m "feat: add admin promotions page"
```

---

### Task 7: Add "Промоции" to admin navigation

**Files:**
- Modify: `src/components/admin/AdminNav.tsx:7-12`

**Step 1: Insert the promotions link**

Change the `links` array (lines 7-12) from:
```tsx
const links = [
  { href: "/admin/home", label: "Начало" },
  { href: "/admin/accommodation", label: "Настаняване" },
  { href: "/admin/gallery", label: "Галерия" },
  { href: "/admin/landmarks", label: "Забележителности" },
];
```

to:
```tsx
const links = [
  { href: "/admin/home", label: "Начало" },
  { href: "/admin/accommodation", label: "Настаняване" },
  { href: "/admin/gallery", label: "Галерия" },
  { href: "/admin/promotions", label: "Промоции" },
  { href: "/admin/landmarks", label: "Забележителности" },
];
```

**Step 2: Commit**

```bash
git add src/components/admin/AdminNav.tsx
git commit -m "feat: add promotions link to admin nav"
```

---

### Task 8: Verify everything works

**Step 1: Run the dev server**

```bash
npm run dev
```

**Step 2: Manual verification checklist**

1. Open homepage — verify BG/EN switch shows cursor pointer on hover
2. Open mobile view — verify hamburger menu order: Начало → Настаняване (with sub-items) → Галерия → Забележителности → Резервация → Контакти
3. Go to `/admin/home` — verify "Промоции" appears in nav between "Галерия" and "Забележителности"
4. Go to `/admin/promotions` — verify page loads with title and empty state
5. Click "+ Добави промоция" — verify form shows all fields (title BG/EN, price, description BG/EN, date pickers, image upload)
6. Create a test promotion — verify it appears as a card with title, price badge, and date range
7. Edit the promotion — verify form pre-fills correctly
8. Drag to reorder (create 2+ promotions) — verify order persists
9. Delete a promotion — verify removal

**Step 3: Final commit (if any fixes needed)**

```bash
git add -A
git commit -m "fix: adjustments from manual testing"
```
