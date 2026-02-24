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
