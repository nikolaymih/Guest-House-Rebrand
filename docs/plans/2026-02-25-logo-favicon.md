# Logo & Favicon Upload Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Allow admins to upload a site logo and favicon from /admin/home; logo replaces the hardcoded "Становец" text in the header; favicon served dynamically; logo added to structured data for SEO.

**Architecture:** New `site_settings` singleton table (id=1) stores `logo_url` and `favicon_url`. `HomeContentEditor` uploads to a new `assets` Supabase bucket and upserts the URL. `Header` converts to async server component and renders the logo. Root `layout.tsx` uses `generateMetadata()` to set the favicon dynamically. `LocalBusinessSchema` emits the logo URL in JSON-LD.

**Tech Stack:** Next.js 16 App Router, Supabase JS v2 (server + client), next-intl `getTranslations` (server), React `cache()`, Tailwind CSS.

---

## Pre-flight: Manual Supabase steps (do these before running tasks)

1. In Supabase dashboard → SQL Editor, run `docs/supabase/create-site-settings.sql` (created in Task 1).
2. In Supabase dashboard → Storage, create a new bucket named **`assets`**, set it to **Public**.

---

## Task 1: SQL migration + SiteSettings type

**Files:**
- Create: `docs/supabase/create-site-settings.sql`
- Modify: `src/types/index.ts`

**Step 1: Create the SQL file**

```sql
-- docs/supabase/create-site-settings.sql

-- site_settings singleton table (id always = 1)
create table site_settings (
  id int primary key,
  logo_url text,
  favicon_url text,
  updated_at timestamptz not null default now()
);

-- RLS: allow public read, authenticated write
alter table site_settings enable row level security;

create policy "Public read site_settings"
  on site_settings for select using (true);

create policy "Authenticated write site_settings"
  on site_settings for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Insert the singleton row so upsert always finds it
insert into site_settings (id) values (1)
  on conflict (id) do nothing;
```

**Step 2: Add SiteSettings type to `src/types/index.ts`**

Append at the end of the file:

```typescript
export interface SiteSettings {
  id: string;
  logo_url: string | null;
  favicon_url: string | null;
  updated_at: string;
}
```

**Step 3: Commit**

```bash
git add docs/supabase/create-site-settings.sql src/types/index.ts
git commit -m "feat: add site_settings table SQL and SiteSettings type"
```

---

## Task 2: Logo & favicon upload UI in HomeContentEditor

**Files:**
- Modify: `src/components/admin/HomeContentEditor.tsx`

The component already loads `home_content` and `home_amenities` in a `useEffect`. We extend it to also load `site_settings`, and add a new upload section at the very top of the rendered form.

**Step 1: Add new state variables**

Find the block of `useState` calls (around line 40) and add after the existing ones:

```typescript
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [faviconUploading, setFaviconUploading] = useState(false);
```

**Step 2: Extend the load useEffect to also fetch site_settings**

Find the `Promise.all` inside the `load` function. Add a third query:

```typescript
        const [
          { data: content, error: contentError },
          { data: ams, error: amsError },
          { data: settings },
        ] = await Promise.all([
          supabase.from("home_content").select("*").eq("id", 1).maybeSingle(),
          supabase.from("home_amenities").select("*").order("display_order"),
          supabase.from("site_settings").select("logo_url, favicon_url").eq("id", 1).maybeSingle(),
        ]);
```

After the existing `if (ams)` block, add:

```typescript
        if (settings) {
          setLogoUrl(settings.logo_url ?? null);
          setFaviconUrl(settings.favicon_url ?? null);
        }
```

**Step 3: Add upload handler function**

Add this function after `setAmenityField`:

```typescript
  async function handleAssetUpload(
    type: "logo" | "favicon",
    file: File
  ) {
    const setUploading = type === "logo" ? setLogoUploading : setFaviconUploading;
    setUploading(true);
    setError(null);
    const supabase = createClient();
    const ext = file.name.split(".").pop() ?? "png";
    const path = `${type}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("assets")
      .upload(path, file, { cacheControl: "3600", upsert: false });
    if (uploadError) {
      setError(`Грешка при качване: ${uploadError.message}`);
      setUploading(false);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from("assets").getPublicUrl(path);
    const { error: dbError } = await supabase
      .from("site_settings")
      .update({ [`${type}_url`]: publicUrl, updated_at: new Date().toISOString() })
      .eq("id", 1);
    if (dbError) {
      setError(`Грешка при запазване: ${dbError.message}`);
      setUploading(false);
      return;
    }
    if (type === "logo") setLogoUrl(publicUrl);
    else setFaviconUrl(publicUrl);
    setUploading(false);
  }
```

**Step 4: Add the upload UI section at the top of the returned JSX**

Inside `return (`, before `{/* Text fields */}`, add:

```tsx
      {/* Logo & Favicon upload */}
      <div className="space-y-4">
        <h3 className="font-serif text-lg text-[var(--color-espresso)]">Лого и икона на сайта</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

          {/* Logo */}
          <div className="bg-[var(--color-linen)] rounded-xl p-4 flex flex-col gap-3">
            <p className="text-xs font-bold text-[var(--color-espresso)] uppercase tracking-wider">Лого</p>
            <div className="bg-[var(--color-espresso)] rounded-lg h-20 flex items-center justify-center overflow-hidden">
              {logoUrl
                ? <img src={logoUrl} alt="Лого" className="h-12 w-auto object-contain" />
                : <span className="text-xs text-[var(--color-text-muted)]">Няма качено лого</span>
              }
            </div>
            <label className="flex flex-col gap-1 cursor-pointer">
              <span className="text-xs text-[var(--color-caramel)] font-semibold hover:text-[var(--color-caramel-deep)] transition-colors">
                {logoUploading ? "Качване..." : "Качи лого"}
              </span>
              <input
                type="file"
                accept="image/png"
                disabled={logoUploading}
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleAssetUpload("logo", f);
                  e.target.value = "";
                }}
              />
            </label>
            <p className="text-xs text-[var(--color-text-muted)]">Препоръчваме PNG с прозрачен фон.</p>
          </div>

          {/* Favicon */}
          <div className="bg-[var(--color-linen)] rounded-xl p-4 flex flex-col gap-3">
            <p className="text-xs font-bold text-[var(--color-espresso)] uppercase tracking-wider">Икона (Favicon)</p>
            <div className="bg-[var(--color-espresso)] rounded-lg h-20 flex items-center justify-center overflow-hidden">
              {faviconUrl
                ? <img src={faviconUrl} alt="Favicon" className="h-12 w-12 object-contain" />
                : <span className="text-xs text-[var(--color-text-muted)]">Няма качена икона</span>
              }
            </div>
            <label className="flex flex-col gap-1 cursor-pointer">
              <span className="text-xs text-[var(--color-caramel)] font-semibold hover:text-[var(--color-caramel-deep)] transition-colors">
                {faviconUploading ? "Качване..." : "Качи икона"}
              </span>
              <input
                type="file"
                accept="image/png"
                disabled={faviconUploading}
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleAssetUpload("favicon", f);
                  e.target.value = "";
                }}
              />
            </label>
            <p className="text-xs text-[var(--color-text-muted)]">Препоръчваме квадратно PNG изображение.</p>
          </div>

        </div>
      </div>
```

**Step 5: Verify it compiles**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -20
```

Expected: no TypeScript errors related to the new code.

**Step 6: Commit**

```bash
git add src/components/admin/HomeContentEditor.tsx
git commit -m "feat: add logo and favicon upload section to HomeContentEditor"
```

---

## Task 3: Header — async server component with logo

**Files:**
- Modify: `src/components/layout/Header.tsx`

**Step 1: Replace imports and make async**

Replace the top of the file:

```typescript
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import NavBar from "./NavBar";
import LanguageSwitcher from "./LanguageSwitcher";
import MobileMenu from "./MobileMenu";
import { createClient } from "@/lib/supabase/server";

export default async function Header() {
  const t = await getTranslations("header");

  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("site_settings")
    .select("logo_url")
    .eq("id", 1)
    .maybeSingle();
  const logoUrl = settings?.logo_url ?? null;
```

**Step 2: Replace the hardcoded "Становец" link**

Find:
```tsx
          <Link
            href="/"
            className="font-serif text-xl text-[var(--color-candlelight)] hover:opacity-90 transition-opacity"
          >
            Становец
          </Link>
```

Replace with:
```tsx
          <Link
            href="/"
            className="font-serif text-xl text-[var(--color-candlelight)] hover:opacity-90 transition-opacity flex items-center"
            aria-label="Становец"
          >
            {logoUrl
              ? <img src={logoUrl} alt="Становец" className="h-8 w-auto object-contain" />
              : "Становец"
            }
          </Link>
```

**Step 3: Verify it compiles**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -20
```

**Step 4: Commit**

```bash
git add src/components/layout/Header.tsx
git commit -m "feat: header shows logo from DB, falls back to text"
```

---

## Task 4: Dynamic favicon in root layout

**Files:**
- Modify: `src/app/layout.tsx`

**Step 1: Replace static metadata export with generateMetadata**

Replace the entire `layout.tsx`:

```typescript
import type { Metadata } from "next";
import { DM_Serif_Display, Nunito } from "next/font/google";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
});

const getSiteSettings = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("favicon_url")
    .eq("id", 1)
    .maybeSingle();
  return data;
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: "Guest House Stanovets",
    description: "Guest house website",
    ...(settings?.favicon_url ? { icons: { icon: settings.favicon_url } } : {}),
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bg" className={`${dmSerifDisplay.variable} ${nunito.variable}`}>
      <body className="flex flex-col min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
```

**Step 2: Verify it compiles**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -20
```

**Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: dynamic favicon from site_settings in root layout"
```

---

## Task 5: SEO — logo in LocalBusinessSchema

**Files:**
- Modify: `src/components/seo/LocalBusinessSchema.tsx`
- Modify: `src/app/[locale]/page.tsx`

**Step 1: Update LocalBusinessSchema to accept logoUrl prop**

Replace `src/components/seo/LocalBusinessSchema.tsx`:

```typescript
interface Props {
  logoUrl?: string | null;
}

export default function LocalBusinessSchema({ logoUrl }: Props) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: "Гостилница Становец",
    telephone: "+359885771328",
    email: "stanovets.eu@gmail.com",
    address: {
      "@type": "PostalAddress",
      addressCountry: "BG",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 43.49447,
      longitude: 27.039641,
    },
  };

  if (logoUrl) {
    schema.logo = logoUrl;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

**Step 2: Fetch site_settings in home page and pass logo to schema**

In `src/app/[locale]/page.tsx`, add `site_settings` to the existing `Promise.all`:

```typescript
  const [
    { data: carouselData },
    { data: welcomeData },
    { data: homeContentData },
    { data: homeAmenitiesData },
    { data: siteSettingsData },
  ] = await Promise.all([
    supabase.from("gallery_images").select("id, storage_path").eq("category", "overview").order("display_order"),
    supabase.from("gallery_images").select("id, storage_path").eq("category", "welcome").order("display_order").limit(3),
    supabase.from("home_content").select("*").eq("id", 1).maybeSingle(),
    supabase.from("home_amenities").select("*").order("display_order"),
    supabase.from("site_settings").select("logo_url").eq("id", 1).maybeSingle(),
  ]);
```

Add after the existing `const dbAmenities` line:

```typescript
  const logoUrl = siteSettingsData?.logo_url ?? null;
```

Update the `<LocalBusinessSchema />` call:

```tsx
      <LocalBusinessSchema logoUrl={logoUrl} />
```

**Step 3: Run tests to confirm nothing broke**

```bash
npm test
```

Expected: 20 tests passing.

**Step 4: Commit**

```bash
git add src/components/seo/LocalBusinessSchema.tsx src/app/[locale]/page.tsx
git commit -m "feat: pass logo URL to LocalBusinessSchema for SEO structured data"
```

---

## Task 6: Final verification

**Step 1: Full build check**

```bash
npm run build 2>&1 | tail -20
```

Expected: build succeeds, no errors.

**Step 2: Run all tests**

```bash
npm test
```

Expected: 20/20 passing.

**Step 3: Commit if any lint fixes were needed, then finish**

```bash
git log --oneline -6
```

Expected: 5 new commits on top of the base branch.
