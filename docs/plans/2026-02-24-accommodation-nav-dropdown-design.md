# Accommodation Nav Dropdown Design

**Date:** 2026-02-24

## Goal

Add a hover dropdown under the "Настаняване" nav item that exposes three sub-links: Цени, Политика за къщата, and Защита на личните данни. Both target pages already exist; this is a pure nav wiring change.

---

## Desktop (NavBar)

- "Настаняване" link remains clickable → `/accommodation`
- Wrap it in a `relative group` container
- On hover, a `absolute top-full left-0 hidden group-hover:block` dropdown panel appears below
- Panel contains 3 links:
  1. **Цени** (`nav.accommodation`) → `/accommodation`
  2. **Политика за къщата** (`nav.rules`) → `/rules`
  3. **Защита на личните данни** (`nav.personalData`) → `/personal-data`
- Styling: espresso background, parchment text, candlelight hover — matches header palette
- Approach: CSS-only via Tailwind `group` / `group-hover` — no JS, no client boundary

---

## Mobile (MobileMenu)

- "Настаняване" becomes a non-linked section label (plain text, slightly muted)
- Three sub-links listed flat below it with a small left indent
- Uses existing `nav.*` translation keys

---

## Translation keys (no changes needed)

All required keys already exist in `messages/bg.json` and `messages/en.json`:
- `nav.accommodation` — "Настаняване" / "Accommodation"
- `nav.rules` — "Правила" / "Rules"
- `nav.personalData` — "Лични данни" / "Privacy Policy"

---

## Components touched

| File | Change |
|------|--------|
| `src/components/layout/NavBar.tsx` | Add dropdown wrapper + sub-links for accommodation item |
| `src/components/layout/MobileMenu.tsx` | Replace accommodation link with label + 3 flat sub-links |
