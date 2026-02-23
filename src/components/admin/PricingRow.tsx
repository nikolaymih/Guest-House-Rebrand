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
          <button
            onClick={() => setEditing(true)}
            aria-label="Редактирай"
            className="text-[var(--color-caramel)] hover:opacity-70"
          >
            ✏️
          </button>
        )}
      </td>
    </tr>
  );
}
