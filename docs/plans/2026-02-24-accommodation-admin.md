# Accommodation Admin & Public Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add full admin control over the Настаняване page — editable bilingual content, manageable feature bullets, add/delete pricing rows — and add a reservation form at the bottom of the public page.

**Architecture:** Two new Supabase tables (`accommodation_content` singleton + `accommodation_features` list) replace the hardcoded translation strings. The `/admin/pricing` route is renamed to `/admin/accommodation` with two tabs (Съдържание / Цени). The public `/[locale]/accommodation` page fetches from DB instead of translation files and gains a ReservationForm section at the bottom.

**Tech Stack:** Next.js 16 App Router, Supabase JS v2, React, Tailwind CSS, TypeScript, Vitest

---

## ⚠️ DB Setup (run in Supabase SQL Editor before coding)

The implementer must ask the user to run this SQL before starting Task 3:

```sql
-- 1. accommodation_content (singleton, always id = 1)
CREATE TABLE accommodation_content (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  about_heading_bg TEXT NOT NULL DEFAULT '',
  about_heading_en TEXT NOT NULL DEFAULT '',
  about_p1_bg      TEXT NOT NULL DEFAULT '',
  about_p1_en      TEXT NOT NULL DEFAULT '',
  about_p2_bg      TEXT NOT NULL DEFAULT '',
  about_p2_en      TEXT NOT NULL DEFAULT '',
  features_heading_bg TEXT NOT NULL DEFAULT '',
  features_heading_en TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE accommodation_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read accommodation_content"
  ON accommodation_content FOR SELECT USING (true);
CREATE POLICY "Authenticated write accommodation_content"
  ON accommodation_content FOR ALL TO authenticated USING (true) WITH CHECK (true);

INSERT INTO accommodation_content
  (id, about_heading_bg, about_heading_en, about_p1_bg, about_p1_en,
   about_p2_bg, about_p2_en, features_heading_bg, features_heading_en)
VALUES (
  1,
  'За Къщата за гости', 'About the guest house',
  'Становец е подходяща за групи до 12 човека. Разполага с 4 спални, 4 бани, просторна всекидневна, кухня и трапезария.',
  'Guest House Stanovets is suitable for groups of up to 12 people. It has 4 bedrooms, 4 bathrooms, a spacious living room, kitchen and dining room.',
  'СПА зоната включва вана за хидромасаж, сауна, душ кабина и фитнес уреди. Механата е с автентична атмосфера и е идеална за семейни събирания.',
  'The spa zone includes a hydromassage tub, sauna, shower cabin and fitness equipment. The tavern has an authentic atmosphere and is ideal for family gatherings.',
  'Характеристики', 'Features'
);

-- 2. accommodation_features
CREATE TABLE accommodation_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label_bg TEXT NOT NULL,
  label_en TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0
);
ALTER TABLE accommodation_features ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read accommodation_features"
  ON accommodation_features FOR SELECT USING (true);
CREATE POLICY "Authenticated write accommodation_features"
  ON accommodation_features FOR ALL TO authenticated USING (true) WITH CHECK (true);

INSERT INTO accommodation_features (label_bg, label_en, display_order) VALUES
  ('10+2 гости', '10+2 guests', 0),
  ('4 спални',   '4 bedrooms',  1),
  ('4 бани',     '4 bathrooms', 2),
  ('СПА зона',   'Spa zone',    3),
  ('Механа',     'Tavern',      4),
  ('Паркинг',    'Parking',     5);

-- 3. RLS for pricing (INSERT + DELETE if not already present)
CREATE POLICY "Authenticated can insert pricing"
  ON pricing FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can delete pricing"
  ON pricing FOR DELETE TO authenticated USING (true);
```

---

### Task 1: Add types for accommodation content

**Files:**
- Modify: `src/types/index.ts`

**Step 1: Add two new interfaces** at the end of `src/types/index.ts`:

```typescript
export interface AccommodationContent {
  id: number;
  about_heading_bg: string;
  about_heading_en: string;
  about_p1_bg: string;
  about_p1_en: string;
  about_p2_bg: string;
  about_p2_en: string;
  features_heading_bg: string;
  features_heading_en: string;
  updated_at: string;
}

export interface AccommodationFeature {
  id: string;
  label_bg: string;
  label_en: string;
  display_order: number;
}
```

**Step 2: Run tests to confirm no breakage**

```bash
npm test
```

Expected: all 20 tests pass.

**Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add AccommodationContent and AccommodationFeature types"
```

---

### Task 2: Create AccommodationContentEditor component

**Files:**
- Create: `src/components/admin/AccommodationContentEditor.tsx`

**Step 1: Create the file** with this complete content:

```tsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { type AccommodationContent, type AccommodationFeature } from "@/types";

type ContentForm = Omit<AccommodationContent, "id" | "updated_at">;

function emptyContent(): ContentForm {
  return {
    about_heading_bg: "", about_heading_en: "",
    about_p1_bg: "", about_p1_en: "",
    about_p2_bg: "", about_p2_en: "",
    features_heading_bg: "", features_heading_en: "",
  };
}

const TEXT_FIELDS: { key: keyof ContentForm; labelBg: string; multiline?: boolean }[] = [
  { key: "about_heading_bg",    labelBg: "Заглавие на секция „За Къщата"" },
  { key: "about_p1_bg",         labelBg: "Параграф 1",                     multiline: true },
  { key: "about_p2_bg",         labelBg: "Параграф 2",                     multiline: true },
  { key: "features_heading_bg", labelBg: "Заглавие на характеристиките" },
];

export default function AccommodationContentEditor() {
  const [form, setForm] = useState<ContentForm>(emptyContent());
  const [features, setFeatures] = useState<{ label_bg: string; label_en: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const [{ data: content }, { data: feats }] = await Promise.all([
        supabase.from("accommodation_content").select("*").eq("id", 1).maybeSingle(),
        supabase.from("accommodation_features").select("*").order("display_order"),
      ]);
      if (content) {
        const { id: _id, updated_at: _ts, ...fields } = content as AccommodationContent;
        setForm(fields);
      }
      if (feats) {
        setFeatures((feats as AccommodationFeature[]).map(({ label_bg, label_en }) => ({ label_bg, label_en })));
      }
    }
    void load();
  }, []);

  function setField(key: keyof ContentForm, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function setFeatureField(idx: number, key: "label_bg" | "label_en", value: string) {
    setFeatures((prev) => prev.map((f, i) => i === idx ? { ...f, [key]: value } : f));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);
    const supabase = createClient();

    const { error: contentError } = await supabase
      .from("accommodation_content")
      .upsert({ id: 1, ...form, updated_at: new Date().toISOString() });

    if (contentError) {
      setError(`Грешка при запазване: ${contentError.message}`);
      setSaving(false);
      return;
    }

    const { error: deleteError } = await supabase
      .from("accommodation_features")
      .delete()
      .gte("display_order", 0); // delete all rows

    if (deleteError) {
      setError(`Грешка при изтриване на характеристики: ${deleteError.message}`);
      setSaving(false);
      return;
    }

    if (features.length > 0) {
      const { error: insertError } = await supabase
        .from("accommodation_features")
        .insert(features.map((f, idx) => ({ ...f, display_order: idx })));

      if (insertError) {
        setError(`Грешка при запазване на характеристики: ${insertError.message}`);
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  }

  return (
    <div className="space-y-8">
      {/* Text fields — BG + EN side by side */}
      <div className="space-y-6">
        {TEXT_FIELDS.map(({ key, labelBg, multiline }) => {
          const enKey = key.replace("_bg", "_en") as keyof ContentForm;
          const labelEn = labelBg + " (EN)";
          return (
            <div key={key} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                  {labelBg} (BG)
                </label>
                {multiline ? (
                  <textarea
                    rows={3}
                    value={form[key]}
                    onChange={(e) => setField(key, e.target.value)}
                    className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-caramel)] resize-y"
                  />
                ) : (
                  <input
                    type="text"
                    value={form[key]}
                    onChange={(e) => setField(key, e.target.value)}
                    className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-caramel)]"
                  />
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                  {labelEn}
                </label>
                {multiline ? (
                  <textarea
                    rows={3}
                    value={form[enKey]}
                    onChange={(e) => setField(enKey, e.target.value)}
                    className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-caramel)] resize-y"
                  />
                ) : (
                  <input
                    type="text"
                    value={form[enKey]}
                    onChange={(e) => setField(enKey, e.target.value)}
                    className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-caramel)]"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Features list */}
      <div>
        <h3 className="font-serif text-lg text-[var(--color-espresso)] mb-4">Характеристики</h3>
        <div className="space-y-2">
          {features.map((feat, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <input
                type="text"
                placeholder="BG"
                value={feat.label_bg}
                onChange={(e) => setFeatureField(idx, "label_bg", e.target.value)}
                className="flex-1 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-caramel)]"
              />
              <input
                type="text"
                placeholder="EN"
                value={feat.label_en}
                onChange={(e) => setFeatureField(idx, "label_en", e.target.value)}
                className="flex-1 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-caramel)]"
              />
              <button
                onClick={() => setFeatures((prev) => prev.filter((_, i) => i !== idx))}
                className="text-red-500 hover:text-red-700 font-bold text-lg leading-none flex-shrink-0"
                aria-label="Изтрий"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => setFeatures((prev) => [...prev, { label_bg: "", label_en: "" }])}
          className="mt-3 text-sm font-semibold text-[var(--color-caramel)] hover:text-[var(--color-caramel-deep)] transition-colors"
        >
          + Добави характеристика
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
npm test
```

Expected: all tests pass (no new tests needed — no testable pure logic in this component).

**Step 3: Commit**

```bash
git add src/components/admin/AccommodationContentEditor.tsx
git commit -m "feat: add AccommodationContentEditor component"
```

---

### Task 3: Add delete button to AdminPricingRow

**Files:**
- Modify: `src/components/admin/PricingRow.tsx`

**Step 1: Add `onDelete` prop and delete handler**

Add `onDelete: () => void` to the interface and implement. The full updated file:

```tsx
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { type PricingRow } from "@/types";
import { formatEur } from "@/lib/utils/format";

interface PricingRowProps {
  row: PricingRow;
  onSave: () => void;
  onDelete: () => void;
}

export default function AdminPricingRow({ row, onSave, onDelete }: PricingRowProps) {
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState({
    daily_rate_eur: row.daily_rate_eur,
    two_day_eur: row.two_day_eur,
    three_plus_eur: row.three_plus_eur,
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

  async function handleDelete() {
    if (!confirm(`Сигурни ли сте, че искате да изтриете реда за ${row.guest_count} гости?`)) return;
    const supabase = createClient();
    const { error } = await supabase.from("pricing").delete().eq("id", row.id);
    if (!error) onDelete();
  }

  return (
    <tr className="border-b border-[var(--color-border)]">
      <td className="py-3 px-4 text-sm font-medium">{row.guest_count} гости</td>
      {(["daily_rate_eur", "two_day_eur", "three_plus_eur"] as const).map((field) => (
        <td key={field} className="py-3 px-4">
          {editing ? (
            <input
              type="number"
              value={values[field]}
              onChange={(e) => setValues((v) => ({ ...v, [field]: Number(e.target.value) }))}
              className="w-24 border border-[var(--color-caramel)] rounded px-2 py-1 text-sm"
            />
          ) : (
            <span className="text-sm">{formatEur(row[field])}</span>
          )}
        </td>
      ))}
      <td className="py-3 px-4">
        {editing ? (
          <div className="flex gap-2">
            <button
              onClick={() => void handleSave()}
              className="text-xs font-semibold text-green-600 hover:text-green-800"
            >
              Запази
            </button>
            <button
              onClick={() => setEditing(false)}
              className="text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            >
              Откажи
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setEditing(true)}
              aria-label="Редактирай"
              className="text-[var(--color-caramel)] hover:opacity-70"
            >
              ✏️
            </button>
            <button
              onClick={() => void handleDelete()}
              aria-label="Изтрий"
              className="text-red-400 hover:text-red-600 text-sm font-bold"
            >
              ✕
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}
```

**Step 2: Run tests**

```bash
npm test
```

Expected: all tests pass.

**Step 3: Commit**

```bash
git add src/components/admin/PricingRow.tsx
git commit -m "feat: add delete button to AdminPricingRow"
```

---

### Task 4: Add add-row form to PricingEditor

**Files:**
- Modify: `src/components/admin/PricingEditor.tsx`

**Step 1: Replace the entire file** with this updated version that passes `onDelete={refresh}` to `AdminPricingRow` and adds an inline add-row form below the table:

```tsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { type PricingRow } from "@/types";
import AdminPricingRow from "./PricingRow";

type NewRowForm = {
  guest_count: string;
  daily_rate_eur: string;
  two_day_eur: string;
  three_plus_eur: string;
  spa_variant: boolean;
};

function emptyNewRow(spaVariant: boolean): NewRowForm {
  return { guest_count: "", daily_rate_eur: "", two_day_eur: "", three_plus_eur: "", spa_variant: spaVariant };
}

export default function PricingEditor() {
  const [rows, setRows] = useState<PricingRow[]>([]);
  const [spaVariant, setSpaVariant] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [adding, setAdding] = useState(false);
  const [newRow, setNewRow] = useState<NewRowForm>(emptyNewRow(false));
  const [addError, setAddError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const refresh = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from("pricing").select("*").order("guest_count");
      setRows((data ?? []) as PricingRow[]);
    }
    void load();
  }, [refreshKey]);

  const filtered = rows.filter((r) => r.spa_variant === spaVariant);

  async function handleAddRow() {
    setAddError(null);
    const guestCount = parseInt(newRow.guest_count, 10);
    const daily = parseFloat(newRow.daily_rate_eur);
    const twoDay = parseFloat(newRow.two_day_eur);
    const threePlus = parseFloat(newRow.three_plus_eur);

    if (!newRow.guest_count || isNaN(guestCount) || guestCount < 1) {
      setAddError("Въведете валиден брой гости.");
      return;
    }
    if (isNaN(daily) || isNaN(twoDay) || isNaN(threePlus)) {
      setAddError("Въведете валидни цени.");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("pricing").insert({
      guest_count: guestCount,
      daily_rate_eur: daily,
      two_day_eur: twoDay,
      three_plus_eur: threePlus,
      spa_variant: newRow.spa_variant,
    });

    setSaving(false);
    if (error) {
      setAddError(`Грешка: ${error.message}`);
      return;
    }
    setAdding(false);
    setNewRow(emptyNewRow(spaVariant));
    refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        {([false, true] as const).map((v) => (
          <button
            key={String(v)}
            onClick={() => { setSpaVariant(v); setAdding(false); setNewRow(emptyNewRow(v)); }}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              spaVariant === v
                ? "bg-[var(--color-caramel)] text-white"
                : "bg-[var(--color-linen)] text-[var(--color-text-secondary)] hover:bg-[var(--color-oatmeal)]"
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
                <th
                  key={h}
                  className="py-3 px-4 text-left text-sm font-semibold text-[var(--color-text-secondary)]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <AdminPricingRow key={row.id} row={row} onSave={refresh} onDelete={refresh} />
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-sm text-[var(--color-text-muted)]">
                  Няма редове. Добавете нов ред по-долу.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add row form */}
      {adding ? (
        <div className="bg-[var(--color-linen)] rounded-xl p-4 border border-[var(--color-border)] space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {([
              { key: "guest_count", label: "Гости" },
              { key: "daily_rate_eur", label: "1 нощувка (EUR)" },
              { key: "two_day_eur", label: "2 нощувки (EUR)" },
              { key: "three_plus_eur", label: "3+ нощувки (EUR)" },
            ] as const).map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">{label}</label>
                <input
                  type="number"
                  min="0"
                  value={newRow[key]}
                  onChange={(e) => setNewRow((r) => ({ ...r, [key]: e.target.value }))}
                  className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-caramel)]"
                />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[var(--color-text-secondary)]">СПА:</span>
            {([false, true] as const).map((v) => (
              <button
                key={String(v)}
                onClick={() => setNewRow((r) => ({ ...r, spa_variant: v }))}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  newRow.spa_variant === v
                    ? "bg-[var(--color-caramel)] text-white"
                    : "bg-white border border-[var(--color-border)] text-[var(--color-text-secondary)]"
                }`}
              >
                {v ? "Със СПА" : "Без СПА"}
              </button>
            ))}
          </div>
          {addError && <p className="text-red-500 text-xs">{addError}</p>}
          <div className="flex gap-2">
            <button
              onClick={() => void handleAddRow()}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-[var(--color-caramel)] text-white text-sm font-semibold disabled:opacity-50"
            >
              {saving ? "Запазване..." : "Запази"}
            </button>
            <button
              onClick={() => { setAdding(false); setAddError(null); setNewRow(emptyNewRow(spaVariant)); }}
              className="px-4 py-2 rounded-lg bg-white border border-[var(--color-border)] text-sm font-semibold"
            >
              Отказ
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => { setAdding(true); setNewRow(emptyNewRow(spaVariant)); }}
          className="px-4 py-2 rounded-full bg-[var(--color-linen)] text-[var(--color-caramel-deep)] text-sm font-semibold hover:bg-[var(--color-oatmeal)] transition-colors"
        >
          + Добави ред
        </button>
      )}
    </div>
  );
}
```

**Step 2: Run tests**

```bash
npm test
```

Expected: all tests pass.

**Step 3: Commit**

```bash
git add src/components/admin/PricingEditor.tsx
git commit -m "feat: add add-row and delete-row to PricingEditor"
```

---

### Task 5: Create /admin/accommodation page and redirect /admin/pricing

**Files:**
- Create: `src/app/admin/accommodation/page.tsx`
- Modify: `src/app/admin/pricing/page.tsx`
- Modify: `src/app/admin/layout.tsx`

**Step 1: Create** `src/app/admin/accommodation/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import AccommodationContentEditor from "@/components/admin/AccommodationContentEditor";
import PricingEditor from "@/components/admin/PricingEditor";

type Tab = "content" | "pricing";

const TABS: { id: Tab; label: string }[] = [
  { id: "content", label: "Съдържание" },
  { id: "pricing", label: "Цени" },
];

export default function AdminAccommodationPage() {
  const [tab, setTab] = useState<Tab>("content");

  return (
    <div>
      <h1 className="font-serif text-3xl text-[var(--color-espresso)] mb-6">
        Управление на настаняване
      </h1>

      <div className="flex flex-wrap gap-2 mb-8 border-b border-[var(--color-border)] pb-4">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
              tab === id
                ? "bg-[var(--color-espresso)] text-white"
                : "bg-[var(--color-linen)] text-[var(--color-text-secondary)] hover:bg-[var(--color-oatmeal)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "content" && <AccommodationContentEditor />}
      {tab === "pricing" && <PricingEditor />}
    </div>
  );
}
```

**Step 2: Replace** `src/app/admin/pricing/page.tsx` with a redirect:

```tsx
import { redirect } from "next/navigation";

export default function AdminPricingPage() {
  redirect("/admin/accommodation");
}
```

**Step 3: Update** `src/app/admin/layout.tsx` — change the nav link from "Цени" → "Настаняване" pointing to `/admin/accommodation`.

Find this block in `src/app/admin/layout.tsx` (lines 28-33):
```tsx
          <Link
            href="/admin/pricing"
            className="text-[var(--color-parchment)] hover:text-[var(--color-candlelight)] transition-colors"
          >
            Цени
          </Link>
```

Replace with:
```tsx
          <Link
            href="/admin/accommodation"
            className="text-[var(--color-parchment)] hover:text-[var(--color-candlelight)] transition-colors"
          >
            Настаняване
          </Link>
```

**Step 4: Run tests**

```bash
npm test
```

Expected: all tests pass.

**Step 5: Commit**

```bash
git add src/app/admin/accommodation/page.tsx src/app/admin/pricing/page.tsx src/app/admin/layout.tsx
git commit -m "feat: add /admin/accommodation page with content + pricing tabs"
```

---

### Task 6: Update public accommodation page to read from DB and add reservation form

**Files:**
- Modify: `src/app/[locale]/accommodation/page.tsx`

**Step 1: Replace the entire file** with this updated version:

```tsx
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import PricingTable from "@/components/pricing/PricingTable";
import ReservationForm from "@/components/reservation/ReservationForm";
import { type PricingRow, type AccommodationContent, type AccommodationFeature } from "@/types";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.accommodation" });
  return { title: t("title"), description: t("description") };
}

export default async function AccommodationPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "accommodationPage" });

  const supabase = await createClient();
  const [{ data: contentData }, { data: featuresData }, { data: pricingData }] = await Promise.all([
    supabase.from("accommodation_content").select("*").eq("id", 1).maybeSingle(),
    supabase.from("accommodation_features").select("*").order("display_order"),
    supabase.from("pricing").select("*").order("guest_count"),
  ]);

  const content = contentData as AccommodationContent | null;
  const features = (featuresData ?? []) as AccommodationFeature[];
  const rows = (pricingData ?? []) as PricingRow[];

  const aboutHeading = locale === "en" ? (content?.about_heading_en ?? "") : (content?.about_heading_bg ?? "");
  const aboutP1 = locale === "en" ? (content?.about_p1_en ?? "") : (content?.about_p1_bg ?? "");
  const aboutP2 = locale === "en" ? (content?.about_p2_en ?? "") : (content?.about_p2_bg ?? "");
  const featuresHeading = locale === "en" ? (content?.features_heading_en ?? "") : (content?.features_heading_bg ?? "");

  return (
    <div>
      <section className="bg-[var(--color-espresso)] text-[var(--color-warm-white)] py-16 px-4 text-center">
        <h1 className="font-serif text-4xl text-[var(--color-candlelight)]">{t("heroTitle")}</h1>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start mb-12">
          <div>
            <h2 className="font-serif text-2xl text-[var(--color-espresso)] mb-4">{aboutHeading}</h2>
            <p className="text-[var(--color-text-secondary)] leading-relaxed mb-3">{aboutP1}</p>
            <p className="text-[var(--color-text-secondary)] leading-relaxed">{aboutP2}</p>
          </div>
          <div className="bg-[var(--color-linen)] rounded-2xl p-6 space-y-3">
            <h3 className="font-serif text-lg text-[var(--color-espresso)]">{featuresHeading}</h3>
            {features.map((f) => (
              <div key={f.id} className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-caramel)]" />
                {locale === "en" ? f.label_en : f.label_bg}
              </div>
            ))}
          </div>
        </div>

        <h2 className="font-serif text-2xl text-[var(--color-espresso)] mb-6">{t("pricingHeading")}</h2>
        <PricingTable rows={rows} />
      </section>

      {/* Reservation form */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-[var(--color-border-soft)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="font-serif text-3xl text-[var(--color-espresso)] mb-4">
              {t("inquiryHeading")}
            </h2>
            <p className="text-[var(--color-text-secondary)] leading-relaxed">
              {t("inquirySubtitle")}
            </p>
          </div>
          <ReservationForm />
        </div>
      </section>
    </div>
  );
}
```

**Step 2: Run tests**

```bash
npm test
```

Expected: all tests pass.

**Step 3: Commit**

```bash
git add src/app/[locale]/accommodation/page.tsx
git commit -m "feat: accommodation page reads from DB, adds reservation form"
```

---

### Task 7: Update messages files

**Files:**
- Modify: `messages/bg.json`
- Modify: `messages/en.json`

**Step 1: Update `messages/bg.json`**

Find the `"accommodationPage"` section (around line 54) and replace it with:

```json
  "accommodationPage": {
    "heroTitle": "Настаняване",
    "pricingHeading": "Цени",
    "inquiryHeading": "Изпратете запитване",
    "inquirySubtitle": "Попълнете формата и ние ще се свържем с вас за потвърждение на резервацията."
  },
```

(Remove: `aboutHeading`, `aboutP1`, `aboutP2`, `featuresHeading`, `features` — these now come from the DB.)

**Step 2: Update `messages/en.json`**

Find the `"accommodationPage"` section (around line 63) and replace it with:

```json
  "accommodationPage": {
    "heroTitle": "Accommodation",
    "pricingHeading": "Pricing",
    "inquiryHeading": "Send an inquiry",
    "inquirySubtitle": "Fill in the form and we will get back to you to confirm your reservation."
  },
```

**Step 3: Run tests**

```bash
npm test
```

Expected: all tests pass.

**Step 4: Commit**

```bash
git add messages/bg.json messages/en.json
git commit -m "feat: remove DB-sourced accommodation keys, add inquiry keys"
```
