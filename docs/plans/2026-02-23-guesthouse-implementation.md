# Guest House Rebrand — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a full-stack Next.js 15 guest house website with Supabase backend, Scandi Cozy design system, admin panel, and BG/EN i18n — replacing the existing React/Vite + Express/Railway stack.

**Architecture:** Next.js 15 App Router handles both public site and admin panel. Supabase provides auth (Google SSO), Postgres DB, and Storage. next-intl manages BG (default, no prefix) / EN (`/en/...`) routing with full static content translation.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS v4, shadcn/ui, Supabase, next-intl, Zod, React Hook Form, Nodemailer, react-photo-album, yet-another-react-lightbox, date-fns, Vitest

---

## Phase 1: Project Foundation

### Task 1: Scaffold Next.js 15 Project

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json` (auto-generated)

**Step 1: Initialize the project**

```bash
cd /home/nikolaymih11/webstormprojects/Guest-House-Rebrand
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --turbopack \
  --no-import-alias
```

When prompted: accept all defaults. This creates the base Next.js 15 project with TypeScript, Tailwind, ESLint, App Router, and Turbopack.

**Step 2: Install all project dependencies**

```bash
npm install \
  @supabase/supabase-js \
  @supabase/ssr \
  next-intl \
  zod \
  react-hook-form \
  @hookform/resolvers \
  nodemailer \
  react-photo-album \
  yet-another-react-lightbox \
  date-fns \
  clsx \
  tailwind-merge \
  sonner

npm install -D \
  @types/nodemailer \
  vitest \
  @vitejs/plugin-react \
  @testing-library/react \
  @testing-library/user-event \
  @testing-library/jest-dom \
  jsdom
```

**Step 3: Initialize shadcn/ui**

```bash
npx shadcn@latest init
```

When prompted:
- Style: Default
- Base color: Neutral
- CSS variables: Yes

**Step 4: Add shadcn components used throughout the project**

```bash
npx shadcn@latest add button input label textarea card badge table tabs separator
```

**Step 5: Verify dev server starts**

```bash
npm run dev
```

Expected: Server running at `http://localhost:3000` with no errors.

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js 15 project with dependencies"
```

---

### Task 2: ESLint + Prettier Configuration

**Files:**
- Modify: `eslint.config.mjs`
- Create: `.prettierrc`
- Create: `.prettierignore`

**Step 1: Install Prettier and ESLint plugins**

```bash
npm install -D prettier eslint-config-prettier eslint-plugin-import @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

**Step 2: Replace `eslint.config.mjs` with strict config**

```js
// eslint.config.mjs
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  ...compat.extends(
    "next/core-web-vitals",
    "next/typescript",
    "prettier"
  ),
  {
    rules: {
      "no-console": "error",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "react/display-name": "error",
    },
  },
];

export default eslintConfig;
```

**Step 3: Create `.prettierrc`**

```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

**Step 4: Create `.prettierignore`**

```
.next
node_modules
public
```

**Step 5: Add lint script to `package.json`**

In `package.json`, update the scripts section:
```json
"scripts": {
  "dev": "next dev --turbopack",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "lint:fix": "next lint --fix",
  "format": "prettier --write .",
  "test": "vitest",
  "test:run": "vitest run"
}
```

**Step 6: Run lint to verify zero errors**

```bash
npm run lint
```

Expected: No warnings or errors.

**Step 7: Commit**

```bash
git add -A
git commit -m "chore: configure ESLint strict rules and Prettier"
```

---

### Task 3: Vitest Configuration

**Files:**
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`

**Step 1: Create `vitest.config.ts`**

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

**Step 2: Create `src/test/setup.ts`**

```ts
// src/test/setup.ts
import "@testing-library/jest-dom";
```

**Step 3: Run tests to verify setup**

```bash
npm run test:run
```

Expected: "No test files found" — that's fine, setup is valid.

**Step 4: Commit**

```bash
git add vitest.config.ts src/test/setup.ts
git commit -m "chore: configure Vitest with jsdom and Testing Library"
```

---

## Phase 2: Design System

### Task 4: Scandi Cozy Theme Tokens

**Files:**
- Modify: `src/app/globals.css`
- Modify: `tailwind.config.ts` (or create if not present)

**Step 1: Replace `src/app/globals.css` with Scandi Cozy tokens**

```css
/* src/app/globals.css */
@import "tailwindcss";

@layer base {
  :root {
    /* Scandi Cozy — Warm Foundations */
    --color-cream: #fdf8f3;
    --color-warm-white: #faf6f1;
    --color-linen: #f5ede4;
    --color-oatmeal: #ebe1d5;
    --color-parchment: #e0d4c6;

    /* Candlelight & Caramel */
    --color-candlelight: #f5d98a;
    --color-amber-glow: #e8c46a;
    --color-caramel-light: #d9b38c;
    --color-caramel: #c4956a;
    --color-caramel-deep: #a67b52;
    --color-amber: #d4a84b;

    /* Nature Tones */
    --color-sage: #9baf93;
    --color-sage-muted: #a8bc9f;
    --color-sage-deep: #7a9470;
    --color-cinnamon: #a67858;
    --color-cocoa: #6b5344;
    --color-walnut: #5d4935;
    --color-espresso: #3d3028;

    /* Semantic */
    --color-text-primary: #3d3028;
    --color-text-secondary: #5d4935;
    --color-text-muted: #8a7a6b;
    --color-bg-primary: #fdf8f3;
    --color-bg-warm: #faf6f1;
    --color-bg-card: #ffffff;
    --color-border: #ebe1d5;
    --color-border-soft: #f5ede4;
    --color-accent: #c4956a;

    /* Shadows */
    --shadow-soft: 0 2px 8px rgba(61, 48, 40, 0.06);
    --shadow-medium: 0 4px 16px rgba(61, 48, 40, 0.08);
    --shadow-warm: 0 4px 20px rgba(196, 149, 106, 0.15);
    --shadow-cozy: 0 6px 24px rgba(166, 120, 88, 0.18);
    --shadow-candle: 0 8px 32px rgba(212, 168, 75, 0.12), 0 2px 8px rgba(245, 217, 138, 0.08);

    /* Transitions */
    --transition-fast: 0.15s ease;
    --transition-base: 0.25s ease;
    --transition-cozy: 0.35s cubic-bezier(0.4, 0, 0.2, 1);

    /* shadcn/ui semantic tokens mapped to Scandi Cozy */
    --background: var(--color-bg-primary);
    --foreground: var(--color-text-primary);
    --card: var(--color-bg-card);
    --card-foreground: var(--color-text-primary);
    --popover: var(--color-bg-card);
    --popover-foreground: var(--color-text-primary);
    --primary: var(--color-caramel);
    --primary-foreground: #ffffff;
    --secondary: var(--color-oatmeal);
    --secondary-foreground: var(--color-text-primary);
    --muted: var(--color-linen);
    --muted-foreground: var(--color-text-muted);
    --accent: var(--color-linen);
    --accent-foreground: var(--color-text-primary);
    --border: var(--color-border);
    --input: var(--color-border);
    --ring: var(--color-caramel);
    --radius: 0.75rem;
  }
}

@layer base {
  body {
    background-color: var(--color-bg-primary);
    color: var(--color-text-primary);
    font-family: "Nunito", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    line-height: 1.75;
  }

  h1, h2, h3 {
    font-family: "DM Serif Display", Georgia, serif;
    font-weight: 400;
    line-height: 1.3;
  }

  h4, h5, h6 {
    font-family: "Nunito", sans-serif;
    font-weight: 600;
  }
}
```

**Step 2: Add Google Fonts to `src/app/layout.tsx`**

```tsx
// At the top of layout.tsx, add font imports
import { DM_Serif_Display, Nunito } from "next/font/google";

const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif",
});

const nunito = Nunito({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
});
```

Then add `${dmSerifDisplay.variable} ${nunito.variable}` to the `<html>` className.

**Step 3: Verify styles load**

```bash
npm run dev
```

Open `http://localhost:3000` — background should be warm cream `#FDF8F3`.

**Step 4: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx
git commit -m "feat: apply Scandi Cozy design system tokens"
```

---

## Phase 3: Supabase Setup

### Task 5: Environment Variables

**Files:**
- Create: `.env.local`
- Create: `.env.example`

**Step 1: Create `.env.local`**

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Admin
ADMIN_EMAIL=stanovets.eu@gmail.com

# Email (Nodemailer / Gmail SMTP)
EMAIL_USER=n.mihaylovv@gmail.com
EMAIL_PASS=jisqrwnkhfnkisgo
EMAIL_PROD_RECEIVER=stanovets.eu@gmail.com
EMAIL_DEV_RECEIVER=n.mihaylovv@gmail.com

# Google Maps
NEXT_PUBLIC_MAPS_KEY=your_google_maps_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

**Step 2: Create `.env.example` (no secrets)**

Copy `.env.local` and replace all values with `your_value_here`.

**Step 3: Verify `.env.local` is gitignored**

```bash
grep ".env.local" .gitignore
```

Expected: `.env.local` appears in `.gitignore` (Next.js adds this by default).

**Step 4: Commit only the example file**

```bash
git add .env.example
git commit -m "chore: add environment variable template"
```

---

### Task 6: Supabase Client Helpers

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/middleware.ts`

**Step 1: Create browser client `src/lib/supabase/client.ts`**

```ts
// src/lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**Step 2: Create server client `src/lib/supabase/server.ts`**

```ts
// src/lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
}
```

**Step 3: Create `src/middleware.ts`**

```ts
// src/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Protect /admin routes (both locales)
  const isAdminRoute =
    request.nextUrl.pathname.startsWith("/admin") ||
    request.nextUrl.pathname.startsWith("/en/admin");

  if (isAdminRoute && request.nextUrl.pathname !== "/admin/login" && request.nextUrl.pathname !== "/en/admin/login") {
    if (!user) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    if (user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.redirect(new URL("/403", request.url));
    }
  }

  // Run i18n middleware for non-admin, non-API routes
  if (!isAdminRoute && !request.nextUrl.pathname.startsWith("/api")) {
    return intlMiddleware(request);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
```

**Step 4: Commit**

```bash
git add src/lib/supabase/ src/middleware.ts
git commit -m "feat: add Supabase client helpers and middleware"
```

---

### Task 7: Database Schema (Run in Supabase SQL Editor)

**Step 1: Open Supabase Dashboard → SQL Editor and run:**

```sql
-- Reservations table
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pricing table
CREATE TABLE pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_count INT NOT NULL,
  daily_rate_bgn NUMERIC NOT NULL,
  two_day_bgn NUMERIC NOT NULL,
  three_plus_bgn NUMERIC NOT NULL,
  spa_variant BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gallery images table
CREATE TABLE gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('garden', 'tavern', 'spa', 'rooms', 'overview')),
  storage_path TEXT NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Step 2: Enable RLS and set policies:**

```sql
-- Enable RLS
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

-- reservations: public insert only
CREATE POLICY "Public can insert reservations"
  ON reservations FOR INSERT TO anon WITH CHECK (true);

-- pricing: public read, authenticated write
CREATE POLICY "Public can read pricing"
  ON pricing FOR SELECT TO anon USING (true);
CREATE POLICY "Authenticated can manage pricing"
  ON pricing FOR ALL TO authenticated USING (true);

-- gallery_images: public read, authenticated write
CREATE POLICY "Public can read gallery images"
  ON gallery_images FOR SELECT TO anon USING (true);
CREATE POLICY "Authenticated can manage gallery images"
  ON gallery_images FOR ALL TO authenticated USING (true);
```

**Step 3: Seed pricing data (from existing hardcoded values)**

```sql
-- Without SPA
INSERT INTO pricing (guest_count, daily_rate_bgn, two_day_bgn, three_plus_bgn, spa_variant) VALUES
(9,  280, 250, 230, false),
(10, 300, 270, 250, false),
(11, 320, 290, 270, false),
(12, 340, 310, 290, false);

-- With SPA
INSERT INTO pricing (guest_count, daily_rate_bgn, two_day_bgn, three_plus_bgn, spa_variant) VALUES
(9,  350, 320, 300, true),
(10, 370, 340, 320, true),
(11, 390, 360, 340, true),
(12, 410, 380, 360, true);
```

> **Note:** Verify exact pricing values from the existing `/home/nikolaymih11/webstormprojects/Guest-house-UI/src/components/PricesTable/` before seeding. Update the INSERT values accordingly.

**Step 4: Create Storage bucket in Supabase Dashboard**

In Supabase Dashboard → Storage → New Bucket:
- Name: `gallery`
- Public: Yes (images need to be publicly readable)

**Step 5: Note down your Supabase project URL and keys, add to `.env.local`**

---

### Task 8: TypeScript Types

**Files:**
- Create: `src/types/index.ts`

**Step 1: Write `src/types/index.ts`**

```ts
// src/types/index.ts

export type GalleryCategory = "garden" | "tavern" | "spa" | "rooms" | "overview";

export interface GalleryImage {
  id: string;
  category: GalleryCategory;
  storage_path: string;
  display_order: number;
  created_at: string;
  url?: string; // resolved public URL, populated at runtime
}

export interface PricingRow {
  id: string;
  guest_count: number;
  daily_rate_bgn: number;
  two_day_bgn: number;
  three_plus_bgn: number;
  spa_variant: boolean;
  updated_at: string;
}

export interface Reservation {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  created_at: string;
}
```

**Step 2: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add shared TypeScript types"
```

---

## Phase 4: i18n Setup

### Task 9: next-intl Configuration

**Files:**
- Create: `src/i18n/routing.ts`
- Create: `src/i18n/request.ts`
- Create: `messages/bg.json`
- Create: `messages/en.json`
- Modify: `next.config.ts`

**Step 1: Create `src/i18n/routing.ts`**

```ts
// src/i18n/routing.ts
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["bg", "en"],
  defaultLocale: "bg",
  localePrefix: "as-needed", // BG has no prefix, EN has /en/
});
```

**Step 2: Create `src/i18n/request.ts`**

```ts
// src/i18n/request.ts
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as "bg" | "en")) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
```

**Step 3: Modify `next.config.ts` to add next-intl plugin**

```ts
// next.config.ts
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
```

**Step 4: Create `messages/bg.json`**

```json
{
  "nav": {
    "home": "Начало",
    "accommodation": "Настаняване",
    "gallery": "Галерия",
    "landmarks": "Забележителности",
    "reservation": "Резервация",
    "contacts": "Контакти",
    "rules": "Правила",
    "personalData": "Лични данни"
  },
  "header": {
    "phone_label": "Телефон за резервации",
    "phone": "(+359) 885 771 328"
  },
  "gallery": {
    "categories": {
      "garden": "Градина",
      "tavern": "Механа",
      "spa": "Спа",
      "rooms": "Интериор",
      "overview": "Преглед"
    }
  },
  "reservation": {
    "title": "Резервация",
    "subtitle": "Свържете се с нас",
    "fullName": "Три имена",
    "email": "Имейл",
    "phone": "Телефон",
    "subject": "Относно",
    "message": "Съобщение",
    "consent": "Съгласявам се данните ми да бъдат обработени",
    "submit": "Изпрати",
    "submitting": "Изпращане...",
    "success": "Формата е изпратена успешно!",
    "error": "Грешка при изпращане. Опитайте отново.",
    "errors": {
      "fullNameRequired": "Моля въведете три имена",
      "fullNameInvalid": "Моля въведете валидни три имена",
      "emailRequired": "Моля въведете имейл",
      "emailInvalid": "Невалиден имейл адрес",
      "phoneRequired": "Моля въведете телефон",
      "phoneInvalid": "Невалиден телефонен номер",
      "subjectRequired": "Моля въведете относно",
      "subjectMin": "Минимум 3 символа",
      "messageRequired": "Моля въведете съобщение",
      "messageMin": "Минимум 10 символа",
      "consentRequired": "Необходимо е съгласие"
    }
  },
  "accommodation": {
    "title": "Настаняване",
    "guests": "гости",
    "daily": "1 нощувка",
    "twoDays": "2 нощувки",
    "threePlus": "3+ нощувки",
    "noSpa": "Без СПА",
    "withSpa": "Със СПА",
    "bgn": "лв.",
    "eur": "EUR",
    "discounts": {
      "weekday": "15% намаление Понеделник–Четвъртък",
      "earlyBook": "5% намаление при ранна резервация"
    }
  },
  "contacts": {
    "title": "Контакти",
    "address": "Адрес",
    "phone": "Телефон",
    "email": "Имейл",
    "findUs": "Намерете ни"
  },
  "footer": {
    "rights": "Всички права запазени"
  },
  "meta": {
    "home": {
      "title": "Гостилница Становец — Почивка в природата",
      "description": "Наслаждавайте се на уютна почивка в гостилница Становец. Спа зона, механа, красива природа."
    },
    "gallery": {
      "title": "Галерия — Гостилница Становец",
      "description": "Разгледайте снимки на гостилницата, спа зоната, механата и градината."
    },
    "accommodation": {
      "title": "Настаняване и цени — Гостилница Становец",
      "description": "Информация за настаняване, цени и условия за наем на гостилница Становец."
    },
    "reservation": {
      "title": "Резервация — Гостилница Становец",
      "description": "Изпратете запитване за резервация на гостилница Становец."
    },
    "landmarks": {
      "title": "Забележителности — Гостилница Становец",
      "description": "Открийте забележителностите наблизо — Плиска, Мадарски конник, Рупите и др."
    },
    "contacts": {
      "title": "Контакти — Гостилница Становец",
      "description": "Свържете се с нас за резервации и информация."
    }
  }
}
```

**Step 5: Create `messages/en.json`**

Mirror `bg.json` with English translations:

```json
{
  "nav": {
    "home": "Home",
    "accommodation": "Accommodation",
    "gallery": "Gallery",
    "landmarks": "Landmarks",
    "reservation": "Reservation",
    "contacts": "Contacts",
    "rules": "Rules",
    "personalData": "Privacy Policy"
  },
  "header": {
    "phone_label": "Reservation phone",
    "phone": "(+359) 885 771 328"
  },
  "gallery": {
    "categories": {
      "garden": "Garden",
      "tavern": "Tavern",
      "spa": "Spa",
      "rooms": "Interior",
      "overview": "Overview"
    }
  },
  "reservation": {
    "title": "Reservation",
    "subtitle": "Get in touch",
    "fullName": "Full name",
    "email": "Email",
    "phone": "Phone",
    "subject": "Subject",
    "message": "Message",
    "consent": "I agree to have my personal data processed",
    "submit": "Send",
    "submitting": "Sending...",
    "success": "Your message was sent successfully!",
    "error": "Something went wrong. Please try again.",
    "errors": {
      "fullNameRequired": "Please enter your full name",
      "fullNameInvalid": "Please enter a valid full name",
      "emailRequired": "Please enter your email",
      "emailInvalid": "Invalid email address",
      "phoneRequired": "Please enter your phone number",
      "phoneInvalid": "Invalid phone number",
      "subjectRequired": "Please enter a subject",
      "subjectMin": "Minimum 3 characters",
      "messageRequired": "Please enter a message",
      "messageMin": "Minimum 10 characters",
      "consentRequired": "Consent is required"
    }
  },
  "accommodation": {
    "title": "Accommodation",
    "guests": "guests",
    "daily": "1 night",
    "twoDays": "2 nights",
    "threePlus": "3+ nights",
    "noSpa": "Without SPA",
    "withSpa": "With SPA",
    "bgn": "BGN",
    "eur": "EUR",
    "discounts": {
      "weekday": "15% discount Monday–Thursday",
      "earlyBook": "5% discount for early booking"
    }
  },
  "contacts": {
    "title": "Contacts",
    "address": "Address",
    "phone": "Phone",
    "email": "Email",
    "findUs": "Find us"
  },
  "footer": {
    "rights": "All rights reserved"
  },
  "meta": {
    "home": {
      "title": "Guest House Stanovets — Relaxation in Nature",
      "description": "Enjoy a cozy stay at Guest House Stanovets. Spa zone, tavern, beautiful nature."
    },
    "gallery": {
      "title": "Gallery — Guest House Stanovets",
      "description": "Browse photos of the guest house, spa zone, tavern and garden."
    },
    "accommodation": {
      "title": "Accommodation & Pricing — Guest House Stanovets",
      "description": "Information about accommodation, pricing and rental terms."
    },
    "reservation": {
      "title": "Reservation — Guest House Stanovets",
      "description": "Send a reservation inquiry for Guest House Stanovets."
    },
    "landmarks": {
      "title": "Landmarks — Guest House Stanovets",
      "description": "Discover nearby landmarks — Pliska, Madara Rider, Rupite and more."
    },
    "contacts": {
      "title": "Contacts — Guest House Stanovets",
      "description": "Contact us for reservations and information."
    }
  }
}
```

**Step 6: Restructure `src/app/` for next-intl locale routing**

Rename `src/app/` to use `[locale]` segment. Create `src/app/[locale]/layout.tsx`:

```tsx
// src/app/[locale]/layout.tsx
import type { Metadata } from "next";
import { DM_Serif_Display, Nunito } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import "../globals.css";

const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif",
});

const nunito = Nunito({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Guest House Stanovets",
  description: "Guest house website",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${dmSerifDisplay.variable} ${nunito.variable}`}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

**Step 7: Verify dev server with no errors**

```bash
npm run dev
```

**Step 8: Commit**

```bash
git add -A
git commit -m "feat: configure next-intl with BG/EN locales"
```

---

## Phase 5: Layout Components

### Task 10: Utility Helpers

**Files:**
- Create: `src/lib/utils/cn.ts`
- Create: `src/lib/utils/format.ts`
- Create: `src/lib/utils/format.test.ts`

**Step 1: Write failing test for currency formatter**

```ts
// src/lib/utils/format.test.ts
import { describe, it, expect } from "vitest";
import { bgnToEur, formatBgn, formatEur } from "./format";

describe("bgnToEur", () => {
  it("converts BGN to EUR using fixed rate 1.9558", () => {
    expect(bgnToEur(195.58)).toBeCloseTo(100, 1);
  });

  it("rounds to 2 decimal places", () => {
    expect(bgnToEur(100)).toBe(51.13);
  });
});

describe("formatBgn", () => {
  it("formats number as BGN string", () => {
    expect(formatBgn(280)).toBe("280 лв.");
  });
});

describe("formatEur", () => {
  it("formats number as EUR string", () => {
    expect(formatEur(100)).toBe("100 EUR");
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm run test:run
```

Expected: FAIL — `Cannot find module './format'`

**Step 3: Implement `src/lib/utils/format.ts`**

```ts
// src/lib/utils/format.ts
const BGN_TO_EUR_RATE = 1.9558;

export function bgnToEur(bgn: number): number {
  return Math.round((bgn / BGN_TO_EUR_RATE) * 100) / 100;
}

export function formatBgn(amount: number): string {
  return `${amount} лв.`;
}

export function formatEur(amount: number): string {
  return `${amount} EUR`;
}
```

**Step 4: Create `src/lib/utils/cn.ts`**

```ts
// src/lib/utils/cn.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Step 5: Run tests to verify they pass**

```bash
npm run test:run
```

Expected: PASS — all 3 tests green.

**Step 6: Commit**

```bash
git add src/lib/utils/
git commit -m "feat: add cn and currency format utilities with tests"
```

---

### Task 11: Header Component

**Files:**
- Create: `src/components/layout/Header.tsx`
- Create: `src/components/layout/NavBar.tsx`
- Create: `src/components/layout/LanguageSwitcher.tsx`
- Create: `src/components/layout/MobileMenu.tsx`

**Step 1: Create `src/components/layout/LanguageSwitcher.tsx`**

```tsx
// src/components/layout/LanguageSwitcher.tsx
"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(next: "bg" | "en") {
    if (next === locale) return;
    if (next === "bg") {
      // Remove /en prefix
      const newPath = pathname.replace(/^\/en/, "") || "/";
      router.push(newPath);
    } else {
      // Add /en prefix
      const newPath = `/en${pathname}`;
      router.push(newPath);
    }
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => switchLocale("bg")}
        className={`text-sm font-semibold px-2 py-1 rounded transition-colors ${
          locale === "bg"
            ? "text-[var(--color-caramel)] underline underline-offset-2"
            : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
        }`}
        aria-label="Превключи на български"
      >
        БГ
      </button>
      <span className="text-[var(--color-border)] text-sm">|</span>
      <button
        onClick={() => switchLocale("en")}
        className={`text-sm font-semibold px-2 py-1 rounded transition-colors ${
          locale === "en"
            ? "text-[var(--color-caramel)] underline underline-offset-2"
            : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>
    </div>
  );
}
```

**Step 2: Create `src/components/layout/NavBar.tsx`**

```tsx
// src/components/layout/NavBar.tsx
import { useTranslations } from "next-intl";
import Link from "next/link";

const navLinks = [
  { key: "home", href: "/" },
  { key: "accommodation", href: "/accommodation" },
  { key: "gallery", href: "/gallery/garden" },
  { key: "landmarks", href: "/landmarks" },
  { key: "reservation", href: "/reservation" },
  { key: "contacts", href: "/contacts" },
] as const;

export default function NavBar() {
  const t = useTranslations("nav");

  return (
    <nav className="hidden md:flex items-center gap-6">
      {navLinks.map((link) => (
        <Link
          key={link.key}
          href={link.href}
          className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-caramel)] transition-colors"
        >
          {t(link.key)}
        </Link>
      ))}
    </nav>
  );
}
```

**Step 3: Create `src/components/layout/Header.tsx`**

```tsx
// src/components/layout/Header.tsx
import { useTranslations } from "next-intl";
import Link from "next/link";
import NavBar from "./NavBar";
import LanguageSwitcher from "./LanguageSwitcher";
import MobileMenu from "./MobileMenu";

export default function Header() {
  const t = useTranslations("header");

  return (
    <header className="sticky top-0 z-50 bg-[var(--color-espresso)] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Name */}
          <Link
            href="/"
            className="font-serif text-xl text-[var(--color-candlelight)] hover:opacity-90 transition-opacity"
          >
            Становец
          </Link>

          {/* Desktop nav */}
          <NavBar />

          {/* Right side: phone + language */}
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-[var(--color-text-muted)] leading-none mb-0.5">
                {t("phone_label")}
              </p>
              <a
                href={`tel:${t("phone").replace(/\s/g, "")}`}
                className="text-sm font-semibold text-[var(--color-candlelight)] hover:text-[var(--color-amber-glow)] transition-colors"
              >
                {t("phone")}
              </a>
            </div>
            <LanguageSwitcher />
          </div>

          {/* Mobile hamburger */}
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
```

**Step 4: Create `src/components/layout/MobileMenu.tsx`**

```tsx
// src/components/layout/MobileMenu.tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";

const navLinks = [
  { key: "home", href: "/" },
  { key: "accommodation", href: "/accommodation" },
  { key: "gallery", href: "/gallery/garden" },
  { key: "landmarks", href: "/landmarks" },
  { key: "reservation", href: "/reservation" },
  { key: "contacts", href: "/contacts" },
] as const;

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const t = useTranslations("nav");
  const th = useTranslations("header");

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
        className="text-[var(--color-candlelight)] p-2"
      >
        <span className="block w-6 h-0.5 bg-current mb-1.5" />
        <span className="block w-6 h-0.5 bg-current mb-1.5" />
        <span className="block w-6 h-0.5 bg-current" />
      </button>

      {open && (
        <div className="absolute top-16 left-0 right-0 bg-[var(--color-espresso)] border-t border-[var(--color-walnut)] px-4 py-6 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-base font-medium text-[var(--color-warm-white)] hover:text-[var(--color-candlelight)] transition-colors"
            >
              {t(link.key)}
            </Link>
          ))}
          <div className="pt-4 border-t border-[var(--color-walnut)] flex items-center justify-between">
            <a
              href={`tel:${th("phone").replace(/\s/g, "")}`}
              className="text-sm text-[var(--color-candlelight)]"
            >
              {th("phone")}
            </a>
            <LanguageSwitcher />
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 5: Create `src/components/layout/Footer.tsx`**

```tsx
// src/components/layout/Footer.tsx
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="bg-[#1B1B1B] text-[var(--color-text-muted)] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-serif text-lg text-[var(--color-candlelight)] mb-4">Становец</h3>
            <p className="text-sm leading-relaxed">
              Уютна почивка сред природата с спа зона, механа и красива градина.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-[var(--color-warm-white)] mb-4 text-sm uppercase tracking-wider">
              Бързи връзки
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: "Галерия", href: "/gallery/garden" },
                { label: "Настаняване", href: "/accommodation" },
                { label: "Резервация", href: "/reservation" },
                { label: "Контакти", href: "/contacts" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-[var(--color-candlelight)] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-[var(--color-warm-white)] mb-4 text-sm uppercase tracking-wider">
              Контакти
            </h4>
            <ul className="space-y-2 text-sm">
              <li>(+359) 885 771 328</li>
              <li>stanovets.eu@gmail.com</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[var(--color-walnut)] mt-8 pt-6 text-center text-xs">
          © {new Date().getFullYear()} Становец. {t("rights")}.
        </div>
      </div>
    </footer>
  );
}
```

**Step 6: Wire Header + Footer into locale layout**

Update `src/app/[locale]/layout.tsx` to include:

```tsx
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// In the body:
<body className="flex flex-col min-h-screen">
  <Header />
  <main className="flex-1">{children}</main>
  <Footer />
</body>
```

**Step 7: Commit**

```bash
git add src/components/layout/ src/app/[locale]/layout.tsx
git commit -m "feat: add Header, Footer, NavBar, LanguageSwitcher, MobileMenu"
```

---

## Phase 6: Validation & Email

### Task 12: Shared Zod Reservation Schema

**Files:**
- Create: `src/lib/validations/reservation.ts`
- Create: `src/lib/validations/reservation.test.ts`

**Step 1: Write failing tests**

```ts
// src/lib/validations/reservation.test.ts
import { describe, it, expect } from "vitest";
import { reservationSchema } from "./reservation";

describe("reservationSchema", () => {
  const valid = {
    fullName: "Иван Иванов",
    email: "ivan@example.com",
    phone: "+35988577132",
    subject: "Резервация",
    message: "Искам да резервирам за уикенда.",
    consent: true,
  };

  it("passes with valid data", () => {
    expect(() => reservationSchema.parse(valid)).not.toThrow();
  });

  it("rejects single-word full name", () => {
    const result = reservationSchema.safeParse({ ...valid, fullName: "Иван" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = reservationSchema.safeParse({ ...valid, email: "notanemail" });
    expect(result.success).toBe(false);
  });

  it("rejects short subject", () => {
    const result = reservationSchema.safeParse({ ...valid, subject: "ab" });
    expect(result.success).toBe(false);
  });

  it("rejects short message", () => {
    const result = reservationSchema.safeParse({ ...valid, message: "short" });
    expect(result.success).toBe(false);
  });

  it("rejects when consent is false", () => {
    const result = reservationSchema.safeParse({ ...valid, consent: false });
    expect(result.success).toBe(false);
  });
});
```

**Step 2: Run to verify failures**

```bash
npm run test:run
```

Expected: FAIL — `Cannot find module './reservation'`

**Step 3: Implement `src/lib/validations/reservation.ts`**

```ts
// src/lib/validations/reservation.ts
import { z } from "zod";

// Supports Latin and Cyrillic names with two words minimum
const fullNameRegex = /^[\p{L}]+[\s'-][\p{L}\s'-]+$/u;
// International phone formats
const phoneRegex = /^(\+|00)[1-9][0-9\s\-().]{6,20}$/;

export const reservationSchema = z.object({
  fullName: z
    .string()
    .min(1, "fullNameRequired")
    .regex(fullNameRegex, "fullNameInvalid"),
  email: z
    .string()
    .min(1, "emailRequired")
    .email("emailInvalid"),
  phone: z
    .string()
    .min(1, "phoneRequired")
    .regex(phoneRegex, "phoneInvalid"),
  subject: z
    .string()
    .min(3, "subjectMin"),
  message: z
    .string()
    .min(10, "messageMin"),
  consent: z
    .boolean()
    .refine((v) => v === true, "consentRequired"),
});

export type ReservationInput = z.infer<typeof reservationSchema>;
```

**Step 4: Run tests to verify pass**

```bash
npm run test:run
```

Expected: PASS — all 6 tests green.

**Step 5: Commit**

```bash
git add src/lib/validations/
git commit -m "feat: add Zod reservation schema with Cyrillic support + tests"
```

---

### Task 13: Email Service

**Files:**
- Create: `src/lib/email/mailer.ts`
- Create: `src/lib/email/templates.ts`

**Step 1: Create `src/lib/email/mailer.ts`**

```ts
// src/lib/email/mailer.ts
import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendReservationEmail(data: {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}) {
  const receiver =
    process.env.NODE_ENV === "production"
      ? process.env.EMAIL_PROD_RECEIVER
      : process.env.EMAIL_DEV_RECEIVER;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: receiver,
    subject: `Ново запитване: ${data.subject}`,
    html: buildEmailHtml(data),
  });
}

function buildEmailHtml(data: {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3D3028;">Ново запитване от сайта</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px; font-weight: bold; color: #5D4935;">Имена:</td><td style="padding: 8px;">${data.fullName}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold; color: #5D4935;">Имейл:</td><td style="padding: 8px;"><a href="mailto:${data.email}">${data.email}</a></td></tr>
        <tr><td style="padding: 8px; font-weight: bold; color: #5D4935;">Телефон:</td><td style="padding: 8px;">${data.phone}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold; color: #5D4935;">Относно:</td><td style="padding: 8px;">${data.subject}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold; color: #5D4935;" colspan="2">Съобщение:</td></tr>
        <tr><td style="padding: 8px;" colspan="2">${data.message}</td></tr>
      </table>
    </div>
  `;
}
```

**Step 2: Commit**

```bash
git add src/lib/email/
git commit -m "feat: add Nodemailer email service with HTML template"
```

---

### Task 14: Reservation API Route

**Files:**
- Create: `src/app/api/reservation/route.ts`

**Step 1: Create `src/app/api/reservation/route.ts`**

```ts
// src/app/api/reservation/route.ts
import { NextRequest, NextResponse } from "next/server";
import { reservationSchema } from "@/lib/validations/reservation";
import { createClient } from "@/lib/supabase/server";
import { sendReservationEmail } from "@/lib/email/mailer";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const result = reservationSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: result.error.issues },
      { status: 400 }
    );
  }

  const { consent: _consent, ...data } = result.data;

  const supabase = await createClient();

  const { error: dbError } = await supabase.from("reservations").insert({
    full_name: data.fullName,
    email: data.email,
    phone: data.phone,
    subject: data.subject,
    message: data.message,
  });

  if (dbError) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  try {
    await sendReservationEmail(data);
  } catch {
    // Email failure is non-blocking — reservation is already saved
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
```

**Step 2: Commit**

```bash
git add src/app/api/reservation/route.ts
git commit -m "feat: add reservation API route (save to DB + send email)"
```

---

## Phase 7: Reservation Form Component

### Task 15: ReservationForm

**Files:**
- Create: `src/components/reservation/ReservationForm.tsx`
- Create: `src/components/reservation/FormField.tsx`
- Create: `src/components/reservation/ConsentCheckbox.tsx`

**Step 1: Create `src/components/reservation/FormField.tsx`**

```tsx
// src/components/reservation/FormField.tsx
import { type FieldError } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils/cn";

interface FormFieldProps {
  id: string;
  label: string;
  error?: FieldError;
  multiline?: boolean;
  registration: Record<string, unknown>;
  type?: string;
}

export default function FormField({
  id,
  label,
  error,
  multiline = false,
  registration,
  type = "text",
}: FormFieldProps) {
  const inputClass = cn(
    "border-2 border-[var(--color-oatmeal)] bg-[var(--color-warm-white)] px-5 py-4 rounded-xl",
    "focus:border-[var(--color-caramel)] focus:ring-2 focus:ring-[var(--color-caramel)]/20",
    "hover:border-[var(--color-parchment)] transition-all",
    "placeholder:text-[var(--color-text-muted)]",
    error && "border-red-400 focus:border-red-400"
  );

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="font-semibold text-sm text-[var(--color-text-secondary)]">
        {label}
      </Label>
      {multiline ? (
        <Textarea id={id} className={inputClass} rows={5} {...registration} />
      ) : (
        <Input id={id} type={type} className={inputClass} {...registration} />
      )}
      {error && (
        <p className="text-red-500 text-xs mt-0.5">{error.message}</p>
      )}
    </div>
  );
}
```

**Step 2: Create `src/components/reservation/ConsentCheckbox.tsx`**

```tsx
// src/components/reservation/ConsentCheckbox.tsx
import { type FieldError } from "react-hook-form";

interface ConsentCheckboxProps {
  label: string;
  error?: FieldError;
  registration: Record<string, unknown>;
}

export default function ConsentCheckbox({ label, error, registration }: ConsentCheckboxProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          className="mt-0.5 w-4 h-4 accent-[var(--color-caramel)] cursor-pointer"
          {...registration}
        />
        <span className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{label}</span>
      </label>
      {error && <p className="text-red-500 text-xs">{error.message}</p>}
    </div>
  );
}
```

**Step 3: Create `src/components/reservation/ReservationForm.tsx`**

```tsx
// src/components/reservation/ReservationForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { reservationSchema, type ReservationInput } from "@/lib/validations/reservation";
import FormField from "./FormField";
import ConsentCheckbox from "./ConsentCheckbox";
import { Button } from "@/components/ui/button";

export default function ReservationForm() {
  const t = useTranslations("reservation");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ReservationInput>({
    resolver: zodResolver(reservationSchema),
    mode: "onBlur",
  });

  async function onSubmit(data: ReservationInput) {
    const res = await fetch("/api/reservation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      toast.success(t("success"));
      reset();
    } else {
      toast.error(t("error"));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 w-full max-w-xl">
      <FormField
        id="fullName"
        label={t("fullName")}
        error={errors.fullName}
        registration={register("fullName")}
      />
      <FormField
        id="email"
        label={t("email")}
        type="email"
        error={errors.email}
        registration={register("email")}
      />
      <FormField
        id="phone"
        label={t("phone")}
        type="tel"
        error={errors.phone}
        registration={register("phone")}
      />
      <FormField
        id="subject"
        label={t("subject")}
        error={errors.subject}
        registration={register("subject")}
      />
      <FormField
        id="message"
        label={t("message")}
        multiline
        error={errors.message}
        registration={register("message")}
      />
      <ConsentCheckbox
        label={t("consent")}
        error={errors.consent}
        registration={register("consent")}
      />
      <Button
        type="submit"
        disabled={isSubmitting || !isValid}
        className="bg-[var(--color-caramel)] hover:bg-[var(--color-caramel-deep)] text-white rounded-full px-8 py-3 font-semibold transition-colors self-start"
      >
        {isSubmitting ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
```

**Step 4: Add Sonner toast provider to layout**

In `src/app/[locale]/layout.tsx`, add:
```tsx
import { Toaster } from "sonner";
// Inside body:
<Toaster position="top-right" richColors />
```

**Step 5: Commit**

```bash
git add src/components/reservation/ src/app/[locale]/layout.tsx
git commit -m "feat: add reservation form with React Hook Form + Zod + toast"
```

---

## Phase 8: Gallery

### Task 16: Gallery Components

**Files:**
- Create: `src/components/gallery/CategoryTabs.tsx`
- Create: `src/components/gallery/PhotoGrid.tsx`
- Create: `src/components/gallery/LightboxViewer.tsx`
- Create: `src/components/gallery/GalleryPage.tsx`

**Step 1: Create `src/components/gallery/CategoryTabs.tsx`**

```tsx
// src/components/gallery/CategoryTabs.tsx
"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { type GalleryCategory } from "@/types";

const CATEGORIES: GalleryCategory[] = ["garden", "tavern", "spa", "rooms", "overview"];

interface CategoryTabsProps {
  active: GalleryCategory;
}

export default function CategoryTabs({ active }: CategoryTabsProps) {
  const t = useTranslations("gallery.categories");
  const router = useRouter();

  return (
    <div className="flex flex-wrap gap-2 justify-center mb-8">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => router.push(`/gallery/${cat}`)}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
            active === cat
              ? "bg-[var(--color-caramel)] text-white shadow-[var(--shadow-warm)]"
              : "bg-[var(--color-linen)] text-[var(--color-text-secondary)] hover:bg-[var(--color-oatmeal)]"
          }`}
        >
          {t(cat)}
        </button>
      ))}
    </div>
  );
}
```

**Step 2: Create `src/components/gallery/LightboxViewer.tsx`**

```tsx
// src/components/gallery/LightboxViewer.tsx
"use client";

import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

interface LightboxViewerProps {
  slides: { src: string }[];
  index: number;
  onClose: () => void;
}

export default function LightboxViewer({ slides, index, onClose }: LightboxViewerProps) {
  return (
    <Lightbox
      open={index >= 0}
      close={onClose}
      index={index}
      slides={slides}
    />
  );
}
```

**Step 3: Create `src/components/gallery/PhotoGrid.tsx`**

```tsx
// src/components/gallery/PhotoGrid.tsx
"use client";

import { useState } from "react";
import PhotoAlbum from "react-photo-album";
import "react-photo-album/rows.css";
import LightboxViewer from "./LightboxViewer";
import { type GalleryImage } from "@/types";

interface PhotoGridProps {
  images: GalleryImage[];
}

export default function PhotoGrid({ images }: PhotoGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  const photos = images.map((img) => ({
    src: img.url ?? img.storage_path,
    width: 800,
    height: 600,
    alt: "",
  }));

  return (
    <>
      <PhotoAlbum
        layout="rows"
        photos={photos}
        onClick={({ index }) => setLightboxIndex(index)}
        rowConstraints={{ maxPhotos: 4 }}
      />
      <LightboxViewer
        slides={photos}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(-1)}
      />
    </>
  );
}
```

**Step 4: Create `src/components/gallery/GalleryPage.tsx`**

```tsx
// src/components/gallery/GalleryPage.tsx
import { type GalleryCategory, type GalleryImage } from "@/types";
import CategoryTabs from "./CategoryTabs";
import PhotoGrid from "./PhotoGrid";

interface GalleryPageProps {
  category: GalleryCategory;
  images: GalleryImage[];
}

export default function GalleryPage({ category, images }: GalleryPageProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <CategoryTabs active={category} />
      <PhotoGrid images={images} />
    </section>
  );
}
```

**Step 5: Commit**

```bash
git add src/components/gallery/
git commit -m "feat: add gallery components with react-photo-album + lightbox"
```

---

## Phase 9: Public Pages

### Task 17: Gallery Page Route

**Files:**
- Create: `src/app/[locale]/gallery/[category]/page.tsx`

**Step 1: Create `src/app/[locale]/gallery/[category]/page.tsx`**

```tsx
// src/app/[locale]/gallery/[category]/page.tsx
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import GalleryPage from "@/components/gallery/GalleryPage";
import { type GalleryCategory, type GalleryImage } from "@/types";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

const VALID_CATEGORIES: GalleryCategory[] = ["garden", "tavern", "spa", "rooms", "overview"];

interface Props {
  params: Promise<{ locale: string; category: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.gallery" });
  return { title: t("title"), description: t("description") };
}

export default async function GalleryCategoryPage({ params }: Props) {
  const { category } = await params;

  if (!VALID_CATEGORIES.includes(category as GalleryCategory)) {
    notFound();
  }

  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("gallery_images")
    .select("*")
    .eq("category", category)
    .order("display_order");

  const images: GalleryImage[] = (rows ?? []).map((row) => ({
    ...row,
    url: supabase.storage.from("gallery").getPublicUrl(row.storage_path).data.publicUrl,
  }));

  return <GalleryPage category={category as GalleryCategory} images={images} />;
}
```

**Step 2: Commit**

```bash
git add src/app/[locale]/gallery/
git commit -m "feat: add gallery page route with Supabase image fetching"
```

---

### Task 18: Pricing Table Component

**Files:**
- Create: `src/components/pricing/PricingTable.tsx`
- Create: `src/components/pricing/PriceRow.tsx`

**Step 1: Create `src/components/pricing/PriceRow.tsx`**

```tsx
// src/components/pricing/PriceRow.tsx
import { bgnToEur, formatBgn, formatEur } from "@/lib/utils/format";
import { type PricingRow } from "@/types";

interface PriceRowProps {
  row: PricingRow;
  showEur: boolean;
}

export default function PriceRow({ row, showEur }: PriceRowProps) {
  const fmt = showEur
    ? (v: number) => formatEur(bgnToEur(v))
    : (v: number) => formatBgn(v);

  return (
    <tr className="border-b border-[var(--color-border)]">
      <td className="py-3 px-4 text-sm font-medium">{row.guest_count}</td>
      <td className="py-3 px-4 text-sm">{fmt(row.daily_rate_bgn)}</td>
      <td className="py-3 px-4 text-sm">{fmt(row.two_day_bgn)}</td>
      <td className="py-3 px-4 text-sm">{fmt(row.three_plus_bgn)}</td>
    </tr>
  );
}
```

**Step 2: Create `src/components/pricing/PricingTable.tsx`**

```tsx
// src/components/pricing/PricingTable.tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import PriceRow from "./PriceRow";
import { type PricingRow } from "@/types";

interface PricingTableProps {
  rows: PricingRow[];
}

export default function PricingTable({ rows }: PricingTableProps) {
  const t = useTranslations("accommodation");
  const [showEur, setShowEur] = useState(false);
  const [spaVariant, setSpaVariant] = useState(false);

  const filtered = rows.filter((r) => r.spa_variant === spaVariant);

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => setSpaVariant(false)}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
            !spaVariant
              ? "bg-[var(--color-caramel)] text-white"
              : "bg-[var(--color-linen)] text-[var(--color-text-secondary)]"
          }`}
        >
          {t("noSpa")}
        </button>
        <button
          onClick={() => setSpaVariant(true)}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
            spaVariant
              ? "bg-[var(--color-caramel)] text-white"
              : "bg-[var(--color-linen)] text-[var(--color-text-secondary)]"
          }`}
        >
          {t("withSpa")}
        </button>
        <button
          onClick={() => setShowEur(!showEur)}
          className="ml-auto px-4 py-2 rounded-full text-sm font-semibold bg-[var(--color-linen)] text-[var(--color-text-secondary)] hover:bg-[var(--color-oatmeal)] transition-all"
        >
          {showEur ? t("bgn") : t("eur")}
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-soft)]">
        <table className="w-full">
          <thead className="bg-[var(--color-linen)]">
            <tr>
              <th className="py-3 px-4 text-left text-sm font-semibold text-[var(--color-text-secondary)]">
                {t("guests")}
              </th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-[var(--color-text-secondary)]">
                {t("daily")}
              </th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-[var(--color-text-secondary)]">
                {t("twoDays")}
              </th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-[var(--color-text-secondary)]">
                {t("threePlus")}
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <PriceRow key={row.id} row={row} showEur={showEur} />
            ))}
          </tbody>
        </table>
      </div>

      <ul className="text-sm text-[var(--color-text-muted)] space-y-1 list-disc list-inside">
        <li>{t("discounts.weekday")}</li>
        <li>{t("discounts.earlyBook")}</li>
      </ul>
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add src/components/pricing/
git commit -m "feat: add PricingTable with BGN/EUR toggle and SPA variant"
```

---

### Task 19: Remaining Public Pages

For each of these pages, create the route file with `generateMetadata()`, fetch data if needed, and assemble using small components. These pages are primarily static content — render them as Server Components.

**Files to create:**
- `src/app/[locale]/page.tsx` — Landing page
- `src/app/[locale]/accommodation/page.tsx` — Pricing from DB
- `src/app/[locale]/reservation/page.tsx` — Reservation form
- `src/app/[locale]/landmarks/page.tsx` — Static content
- `src/app/[locale]/contacts/page.tsx` — Contact info + map
- `src/app/[locale]/rules/page.tsx` — Static
- `src/app/[locale]/personal-data/page.tsx` — Static

**Landing page (`src/app/[locale]/page.tsx`):**
```tsx
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import ReservationForm from "@/components/reservation/ReservationForm";

interface Props { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.home" });
  return {
    title: t("title"),
    description: t("description"),
    openGraph: { title: t("title"), description: t("description") },
  };
}

export default async function HomePage() {
  return (
    <div>
      {/* Hero section — full-width image with overlay text */}
      {/* House description section */}
      {/* Location section with Google Map */}
      {/* Reservation form section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <ReservationForm />
      </section>
    </div>
  );
}
```

> Note: Fill in hero and description sections using existing content from Guest-house-UI. Refer to `/home/nikolaymih11/webstormprojects/Guest-house-UI/src/pages/Main/` for copy and structure.

**Accommodation page (`src/app/[locale]/accommodation/page.tsx`):**
```tsx
import { createClient } from "@/lib/supabase/server";
import PricingTable from "@/components/pricing/PricingTable";
import { type PricingRow } from "@/types";

export default async function AccommodationPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("pricing").select("*").order("guest_count");
  const rows = (data ?? []) as PricingRow[];

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Room details, specs */}
      <PricingTable rows={rows} />
    </main>
  );
}
```

**Commit all public pages together:**

```bash
git add src/app/[locale]/
git commit -m "feat: add all public pages with SSR and metadata"
```

---

## Phase 10: Admin Panel

### Task 20: Admin Login Page

**Files:**
- Create: `src/app/admin/login/page.tsx`
- Create: `src/app/admin/layout.tsx`

**Step 1: Create `src/app/admin/login/page.tsx`**

```tsx
// src/app/admin/login/page.tsx
"use client";

import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  async function handleGoogleLogin() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/admin`,
      },
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)]">
      <div className="bg-white p-10 rounded-2xl shadow-[var(--shadow-medium)] text-center max-w-sm w-full">
        <h1 className="font-serif text-2xl text-[var(--color-espresso)] mb-2">Администратор</h1>
        <p className="text-sm text-[var(--color-text-muted)] mb-8">Влезте с Google акаунт</p>
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 border-2 border-[var(--color-oatmeal)] rounded-xl py-3 px-5 font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-linen)] transition-colors"
        >
          <GoogleIcon />
          Вход с Google
        </button>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}
```

**Step 2: Create `src/app/admin/layout.tsx`**

```tsx
// src/app/admin/layout.tsx
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      <div className="bg-[var(--color-espresso)] text-[var(--color-candlelight)] px-6 py-4 flex items-center justify-between">
        <Link href="/admin" className="font-serif text-lg">Администрация</Link>
        <nav className="flex gap-6 text-sm font-medium">
          <Link href="/admin/gallery" className="hover:text-[var(--color-amber-glow)] transition-colors">
            Галерия
          </Link>
          <Link href="/admin/pricing" className="hover:text-[var(--color-amber-glow)] transition-colors">
            Цени
          </Link>
        </nav>
      </div>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">{children}</main>
    </div>
  );
}
```

**Step 3: Configure Google OAuth in Supabase Dashboard**

In Supabase Dashboard → Authentication → Providers → Google:
- Enable Google provider
- Add Client ID and Secret from Google Cloud Console
- Add authorized redirect URL: `https://your-project.supabase.co/auth/v1/callback`

In Google Cloud Console → OAuth credentials:
- Authorized JavaScript origins: `http://localhost:3000`, `https://yourdomain.com`
- Authorized redirect URIs: `https://your-project.supabase.co/auth/v1/callback`

**Step 4: Commit**

```bash
git add src/app/admin/
git commit -m "feat: add admin login page with Google SSO"
```

---

### Task 21: Admin Gallery Manager

**Files:**
- Create: `src/components/admin/ImageUploadZone.tsx`
- Create: `src/components/admin/AdminImageGrid.tsx`
- Create: `src/components/admin/AdminGalleryManager.tsx`
- Create: `src/app/admin/gallery/page.tsx`

**Step 1: Create `src/components/admin/ImageUploadZone.tsx`**

```tsx
// src/components/admin/ImageUploadZone.tsx
"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { type GalleryCategory } from "@/types";

interface ImageUploadZoneProps {
  category: GalleryCategory;
  onUploadComplete: () => void;
}

export default function ImageUploadZone({ category, onUploadComplete }: ImageUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: FileList) {
    setUploading(true);
    const supabase = createClient();

    for (const file of Array.from(files)) {
      const path = `${category}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("gallery")
        .upload(path, file);

      if (uploadError) continue;

      await supabase.from("gallery_images").insert({
        category,
        storage_path: path,
        display_order: 0,
      });
    }

    setUploading(false);
    onUploadComplete();
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
      }}
      className="border-2 border-dashed border-[var(--color-caramel)] rounded-xl p-10 text-center cursor-pointer hover:bg-[var(--color-linen)] transition-colors"
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
      <p className="text-[var(--color-text-secondary)] font-medium">
        {uploading ? "Качване..." : "Плъзни снимки тук или кликни за избор"}
      </p>
      <p className="text-xs text-[var(--color-text-muted)] mt-1">PNG, JPG, WEBP</p>
    </div>
  );
}
```

**Step 2: Create `src/components/admin/AdminImageGrid.tsx`**

```tsx
// src/components/admin/AdminImageGrid.tsx
"use client";

import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { type GalleryImage } from "@/types";

interface AdminImageGridProps {
  images: GalleryImage[];
  onDelete: () => void;
}

export default function AdminImageGrid({ images, onDelete }: AdminImageGridProps) {
  async function handleDelete(image: GalleryImage) {
    const supabase = createClient();
    await supabase.storage.from("gallery").remove([image.storage_path]);
    await supabase.from("gallery_images").delete().eq("id", image.id);
    onDelete();
  }

  if (images.length === 0) {
    return (
      <p className="text-[var(--color-text-muted)] text-sm text-center py-8">
        Няма качени снимки в тази категория.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-6">
      {images.map((img) => (
        <div key={img.id} className="relative group rounded-lg overflow-hidden aspect-square">
          <Image
            src={img.url ?? img.storage_path}
            alt=""
            fill
            className="object-cover"
            sizes="200px"
          />
          <button
            onClick={() => handleDelete(img)}
            className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full w-6 h-6 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            aria-label="Изтрий снимка"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
```

**Step 3: Create `src/components/admin/AdminGalleryManager.tsx`**

```tsx
// src/components/admin/AdminGalleryManager.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { type GalleryCategory, type GalleryImage } from "@/types";
import CategoryTabs from "@/components/gallery/CategoryTabs";
import ImageUploadZone from "./ImageUploadZone";
import AdminImageGrid from "./AdminImageGrid";

const CATEGORIES: GalleryCategory[] = ["garden", "tavern", "spa", "rooms", "overview"];

export default function AdminGalleryManager() {
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>("garden");
  const [images, setImages] = useState<GalleryImage[]>([]);

  const fetchImages = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("gallery_images")
      .select("*")
      .eq("category", activeCategory)
      .order("display_order");

    const resolved = (data ?? []).map((row) => ({
      ...row,
      url: supabase.storage.from("gallery").getPublicUrl(row.storage_path).data.publicUrl,
    }));
    setImages(resolved);
  }, [activeCategory]);

  useEffect(() => { fetchImages(); }, [fetchImages]);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              activeCategory === cat
                ? "bg-[var(--color-caramel)] text-white"
                : "bg-[var(--color-linen)] text-[var(--color-text-secondary)]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      <ImageUploadZone category={activeCategory} onUploadComplete={fetchImages} />
      <AdminImageGrid images={images} onDelete={fetchImages} />
    </div>
  );
}
```

**Step 4: Create `src/app/admin/gallery/page.tsx`**

```tsx
// src/app/admin/gallery/page.tsx
import AdminGalleryManager from "@/components/admin/AdminGalleryManager";

export default function AdminGalleryPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl text-[var(--color-espresso)] mb-8">Управление на галерия</h1>
      <AdminGalleryManager />
    </div>
  );
}
```

**Step 5: Commit**

```bash
git add src/components/admin/ImageUploadZone.tsx src/components/admin/AdminImageGrid.tsx src/components/admin/AdminGalleryManager.tsx src/app/admin/gallery/
git commit -m "feat: add admin gallery manager with upload and delete"
```

---

### Task 22: Admin Pricing Editor

**Files:**
- Create: `src/components/admin/PricingRow.tsx`
- Create: `src/components/admin/PricingEditor.tsx`
- Create: `src/app/admin/pricing/page.tsx`

**Step 1: Create `src/components/admin/PricingRow.tsx`**

```tsx
// src/components/admin/PricingRow.tsx
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { type PricingRow } from "@/types";
import { formatBgn } from "@/lib/utils/format";

interface PricingRowProps {
  row: PricingRow;
  onSave: () => void;
}

export default function AdminPricingRow({ row, onSave }: PricingRowProps) {
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState({
    daily_rate_bgn: row.daily_rate_bgn,
    two_day_bgn: row.two_day_bgn,
    three_plus_bgn: row.three_plus_bgn,
  });

  async function handleSave() {
    const supabase = createClient();
    await supabase
      .from("pricing")
      .update({ ...values, updated_at: new Date().toISOString() })
      .eq("id", row.id);
    setEditing(false);
    onSave();
  }

  return (
    <tr className="border-b border-[var(--color-border)]">
      <td className="py-3 px-4 text-sm font-medium">{row.guest_count} гости</td>
      {(["daily_rate_bgn", "two_day_bgn", "three_plus_bgn"] as const).map((field) => (
        <td key={field} className="py-3 px-4">
          {editing ? (
            <input
              type="number"
              value={values[field]}
              onChange={(e) => setValues((v) => ({ ...v, [field]: Number(e.target.value) }))}
              className="w-24 border border-[var(--color-caramel)] rounded px-2 py-1 text-sm"
            />
          ) : (
            <span className="text-sm">{formatBgn(row[field])}</span>
          )}
        </td>
      ))}
      <td className="py-3 px-4">
        {editing ? (
          <div className="flex gap-2">
            <button onClick={handleSave} className="text-xs font-semibold text-green-600 hover:text-green-800">
              Запази
            </button>
            <button onClick={() => setEditing(false)} className="text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
              Откажи
            </button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} aria-label="Редактирай" className="text-[var(--color-caramel)] hover:text-[var(--color-caramel-deep)]">
            ✏️
          </button>
        )}
      </td>
    </tr>
  );
}
```

**Step 2: Create `src/components/admin/PricingEditor.tsx`**

```tsx
// src/components/admin/PricingEditor.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { type PricingRow } from "@/types";
import AdminPricingRow from "./PricingRow";

export default function PricingEditor() {
  const [rows, setRows] = useState<PricingRow[]>([]);
  const [spaVariant, setSpaVariant] = useState(false);

  const fetchRows = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.from("pricing").select("*").order("guest_count");
    setRows((data ?? []) as PricingRow[]);
  }, []);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  const filtered = rows.filter((r) => r.spa_variant === spaVariant);

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        {[false, true].map((v) => (
          <button
            key={String(v)}
            onClick={() => setSpaVariant(v)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              spaVariant === v
                ? "bg-[var(--color-caramel)] text-white"
                : "bg-[var(--color-linen)] text-[var(--color-text-secondary)]"
            }`}
          >
            {v ? "Със СПА" : "Без СПА"}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-soft)]">
        <table className="w-full">
          <thead className="bg-[var(--color-linen)]">
            <tr>
              {["Гости", "1 нощувка", "2 нощувки", "3+ нощувки", ""].map((h) => (
                <th key={h} className="py-3 px-4 text-left text-sm font-semibold text-[var(--color-text-secondary)]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <AdminPricingRow key={row.id} row={row} onSave={fetchRows} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

**Step 3: Create `src/app/admin/pricing/page.tsx`**

```tsx
// src/app/admin/pricing/page.tsx
import PricingEditor from "@/components/admin/PricingEditor";

export default function AdminPricingPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl text-[var(--color-espresso)] mb-8">Управление на цени</h1>
      <PricingEditor />
    </div>
  );
}
```

**Step 4: Commit**

```bash
git add src/components/admin/PricingRow.tsx src/components/admin/PricingEditor.tsx src/app/admin/pricing/
git commit -m "feat: add admin pricing editor with inline edit"
```

---

## Phase 11: SEO

### Task 23: JSON-LD + Sitemap

**Files:**
- Create: `src/components/seo/LocalBusinessSchema.tsx`
- Create: `next-sitemap.config.js`

**Step 1: Install next-sitemap**

```bash
npm install next-sitemap
```

**Step 2: Create `src/components/seo/LocalBusinessSchema.tsx`**

```tsx
// src/components/seo/LocalBusinessSchema.tsx
export default function LocalBusinessSchema() {
  const schema = {
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

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

Add `<LocalBusinessSchema />` inside `<head>` in `src/app/[locale]/layout.tsx`.

**Step 3: Create `next-sitemap.config.js`**

```js
// next-sitemap.config.js
/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || "https://www.stanovets.eu",
  generateRobotsTxt: true,
  exclude: ["/admin", "/admin/*", "/en/admin", "/en/admin/*"],
};
```

**Step 4: Add postbuild script to `package.json`**

```json
"postbuild": "next-sitemap"
```

**Step 5: Commit**

```bash
git add src/components/seo/ next-sitemap.config.js package.json
git commit -m "feat: add JSON-LD local business schema and sitemap generation"
```

---

## Phase 12: Image Migration

### Task 24: Migrate Existing Gallery Images to Supabase Storage

**Step 1: Write migration script**

Create `scripts/migrate-images.ts`:

```ts
// scripts/migrate-images.ts
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const GALLERY_ROOT = "/home/nikolaymih11/webstormprojects/Guest-house-UI/src/assets/images/gallery";

const CATEGORY_MAP: Record<string, string> = {
  garden: "garden",
  tavern: "tavern",
  spa: "spa",
  rooms: "rooms",
};

async function migrate() {
  for (const [folder, category] of Object.entries(CATEGORY_MAP)) {
    const dir = path.join(GALLERY_ROOT, folder);
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir).filter((f) =>
      /\.(jpg|jpeg|png|webp)$/i.test(f)
    );

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filePath = path.join(dir, file);
      const buffer = fs.readFileSync(filePath);
      const storagePath = `${category}/${file}`;

      const { error } = await supabase.storage
        .from("gallery")
        .upload(storagePath, buffer, { contentType: "image/jpeg", upsert: true });

      if (error) {
        process.stdout.write(`Error uploading ${file}: ${error.message}\n`);
        continue;
      }

      await supabase.from("gallery_images").insert({
        category,
        storage_path: storagePath,
        display_order: i,
      });

      process.stdout.write(`Uploaded: ${storagePath}\n`);
    }
  }
}

migrate().catch((err) => {
  process.stderr.write(String(err));
  process.exit(1);
});
```

**Step 2: Add script to `package.json`**

```json
"scripts": {
  "migrate:images": "npx ts-node --project tsconfig.json scripts/migrate-images.ts"
}
```

**Step 3: Run migration**

```bash
npm run migrate:images
```

Expected: Each image logs `Uploaded: category/filename.jpg`

**Step 4: Verify in Supabase Dashboard** → Storage → gallery bucket — images should appear in category subfolders.

**Step 5: Commit**

```bash
git add scripts/migrate-images.ts package.json
git commit -m "chore: add image migration script for Supabase Storage"
```

---

## Phase 13: Final Verification

### Task 25: Full Lint + Build Check

**Step 1: Run ESLint**

```bash
npm run lint
```

Expected: Zero warnings, zero errors.

**Step 2: Run tests**

```bash
npm run test:run
```

Expected: All tests pass.

**Step 3: Run production build**

```bash
npm run build
```

Expected: Build completes with no errors. All pages show as static/SSR in the output.

**Step 4: Verify dev server**

```bash
npm run dev
```

Test the following manually:
- [ ] `/` loads with correct BG content and Scandi Cozy theme
- [ ] `/en` loads with correct EN content
- [ ] Language switcher toggles between BG and EN
- [ ] `/gallery/garden` loads images from Supabase
- [ ] `/accommodation` shows pricing table from DB
- [ ] `/reservation` — submit form → success toast, email received, row in DB
- [ ] `/admin/login` → Google SSO → redirects to `/admin`
- [ ] `/admin/gallery` — upload image appears in public gallery
- [ ] `/admin/pricing` — inline edit saves correctly

**Step 5: Final commit**

```bash
git add -A
git commit -m "chore: final lint and build verification pass"
```

---

## Summary of All Commits

| Phase | Commits |
|---|---|
| Foundation | scaffold, ESLint, Vitest |
| Design System | Scandi Cozy tokens |
| Supabase | env, clients, middleware, types |
| i18n | next-intl, BG/EN messages |
| Layout | Header, Footer, NavBar, LanguageSwitcher |
| Validation & Email | Zod schema + tests, Nodemailer, API route |
| Reservation Form | ReservationForm, FormField, ConsentCheckbox |
| Gallery | CategoryTabs, PhotoGrid, LightboxViewer |
| Public Pages | All 8 routes with SSR + metadata |
| Admin | Login, Gallery Manager, Pricing Editor |
| SEO | JSON-LD, sitemap |
| Migration | Image migration script |
