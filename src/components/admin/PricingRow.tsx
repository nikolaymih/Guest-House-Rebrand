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
