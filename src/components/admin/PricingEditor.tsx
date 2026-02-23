"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { type PricingRow } from "@/types";
import AdminPricingRow from "./PricingRow";

export default function PricingEditor() {
  const [rows, setRows] = useState<PricingRow[]>([]);
  const [spaVariant, setSpaVariant] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

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

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        {([false, true] as const).map((v) => (
          <button
            key={String(v)}
            onClick={() => setSpaVariant(v)}
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
              <AdminPricingRow key={row.id} row={row} onSave={refresh} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
