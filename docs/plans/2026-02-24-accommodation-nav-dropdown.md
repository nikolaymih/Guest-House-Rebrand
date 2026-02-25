# Accommodation Nav Dropdown Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a hover dropdown under "Настаняване" in the desktop nav and flat sub-links in the mobile menu, linking to Цени (/accommodation), Политика за къщата (/rules), and Защита на личните данни (/personal-data).

**Architecture:** CSS-only hover dropdown via Tailwind `group`/`group-hover` on the desktop NavBar (stays a server component). MobileMenu gets the three sub-links listed flat under a non-clickable "Настаняване" label. One new translation key (`nav.pricing`) is added; `nav.rules` label is updated to match the user's requested text.

**Tech Stack:** Next.js App Router, next-intl, Tailwind CSS

---

### Task 1: Add translation keys and update NavBar with hover dropdown

**Files:**
- Modify: `messages/bg.json`
- Modify: `messages/en.json`
- Modify: `src/components/layout/NavBar.tsx`

**Context:**
- `NavBar` is currently a server component — keep it that way (no `"use client"`)
- Tailwind `group` on the wrapper div, `group-hover:block` on the dropdown panel
- The dropdown has a small `pt-2` gap so the mouse can travel from the link to the panel without it disappearing
- Color tokens in use: `--color-espresso` (bg), `--color-walnut` (border/hover bg), `--color-parchment` (text), `--color-candlelight` (hover text)

**Step 1: Add `nav.pricing` key and update `nav.rules` in `messages/bg.json`**

In the `"nav"` object, add `"pricing"` and change `"rules"`:

```json
"nav": {
  "home": "Начало",
  "accommodation": "Настаняване",
  "gallery": "Галерия",
  "landmarks": "Забележителности",
  "reservation": "Резервация",
  "contacts": "Контакти",
  "pricing": "Цени",
  "rules": "Политика за къщата",
  "personalData": "Лични данни"
},
```

**Step 2: Do the same in `messages/en.json`**

```json
"nav": {
  "home": "Home",
  "accommodation": "Accommodation",
  "gallery": "Gallery",
  "landmarks": "Landmarks",
  "reservation": "Reservation",
  "contacts": "Contacts",
  "pricing": "Pricing",
  "rules": "House Policy",
  "personalData": "Privacy Policy"
},
```

**Step 3: Replace `src/components/layout/NavBar.tsx` with the following**

The accommodation link is pulled out of `NAV_LINKS` and rendered separately with a dropdown. The rest of the links map as before.

```tsx
import { useTranslations } from "next-intl";
import Link from "next/link";

const NAV_LINKS = [
  { key: "home", href: "/" },
  { key: "gallery", href: "/gallery/garden" },
  { key: "landmarks", href: "/landmarks" },
  { key: "reservation", href: "/reservation" },
  { key: "contacts", href: "/contacts" },
] as const;

const ACCOMMODATION_DROPDOWN = [
  { key: "pricing", href: "/accommodation" },
  { key: "rules", href: "/rules" },
  { key: "personalData", href: "/personal-data" },
] as const;

export default function NavBar() {
  const t = useTranslations("nav");

  return (
    <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
      {/* Accommodation with hover dropdown */}
      <div className="relative group">
        <Link
          href="/accommodation"
          className="text-sm font-medium text-[var(--color-parchment)] hover:text-[var(--color-candlelight)] transition-colors"
        >
          {t("accommodation")}
        </Link>
        <div className="absolute top-full left-0 hidden group-hover:block pt-2 z-50">
          <div className="bg-[var(--color-espresso)] border border-[var(--color-walnut)] rounded-lg shadow-lg py-1 min-w-[200px]">
            {ACCOMMODATION_DROPDOWN.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="block px-4 py-2 text-sm text-[var(--color-parchment)] hover:text-[var(--color-candlelight)] hover:bg-[var(--color-walnut)] transition-colors"
              >
                {t(item.key)}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Remaining nav links */}
      {NAV_LINKS.map((link) => (
        <Link
          key={link.key}
          href={link.href}
          className="text-sm font-medium text-[var(--color-parchment)] hover:text-[var(--color-candlelight)] transition-colors"
        >
          {t(link.key)}
        </Link>
      ))}
    </nav>
  );
}
```

**Step 4: Run the test suite to confirm nothing is broken**

```bash
npm test -- --passWithNoTests
```

Expected: all 20 tests pass, 0 failures.

**Step 5: Commit**

```bash
git add messages/bg.json messages/en.json src/components/layout/NavBar.tsx
git commit -m "feat: add hover dropdown to Настаняване nav item"
```

---

### Task 2: Update MobileMenu with flat sub-links

**Files:**
- Modify: `src/components/layout/MobileMenu.tsx`

**Context:**
- Mobile menu is already a full-screen overlay — no accordion needed
- "Настаняване" becomes a non-clickable section label (muted text, same size as other links)
- Three sub-links sit below it, indented with `pl-4` and slightly smaller text (`text-sm`)
- Existing `NAV_LINKS` drops the `accommodation` entry (it's now covered by the sub-links section)

**Step 1: Replace `src/components/layout/MobileMenu.tsx` with the following**

```tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";

const NAV_LINKS = [
  { key: "home", href: "/" },
  { key: "gallery", href: "/gallery/garden" },
  { key: "landmarks", href: "/landmarks" },
  { key: "reservation", href: "/reservation" },
  { key: "contacts", href: "/contacts" },
] as const;

const ACCOMMODATION_LINKS = [
  { key: "pricing", href: "/accommodation" },
  { key: "rules", href: "/rules" },
  { key: "personalData", href: "/personal-data" },
] as const;

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const t = useTranslations("nav");
  const th = useTranslations("header");

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="text-[var(--color-candlelight)] p-2"
      >
        <span className="block w-6 h-0.5 bg-current mb-1.5" />
        <span className="block w-6 h-0.5 bg-current mb-1.5" />
        <span className="block w-6 h-0.5 bg-current" />
      </button>

      {open && (
        <div className="absolute top-16 left-0 right-0 z-50 bg-[var(--color-espresso)] border-t border-[var(--color-walnut)] px-4 py-6 flex flex-col gap-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-base font-medium text-[var(--color-warm-white)] hover:text-[var(--color-candlelight)] transition-colors"
            >
              {t(link.key)}
            </Link>
          ))}

          {/* Accommodation section */}
          <span className="text-base font-medium text-[var(--color-text-muted)]">
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

**Step 2: Run the test suite**

```bash
npm test -- --passWithNoTests
```

Expected: all 20 tests pass, 0 failures.

**Step 3: Commit**

```bash
git add src/components/layout/MobileMenu.tsx
git commit -m "feat: add accommodation sub-links to mobile menu"
```
