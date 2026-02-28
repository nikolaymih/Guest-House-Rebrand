"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import PriceRow from "./PriceRow";
import { type PricingRow } from "@/types";

interface PricingTableProps {
  rows: PricingRow[];
  darkBg?: boolean;
}

function ToggleButton({
  active,
  onClick,
  children,
  darkBg,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  darkBg?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
        active
          ? "bg-[var(--color-caramel)] text-white shadow-[var(--shadow-warm)]"
          : darkBg
            ? "bg-[var(--color-bg-primary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-oatmeal)]"
            : "bg-[var(--color-linen)] text-[var(--color-text-secondary)] hover:bg-[var(--color-oatmeal)]"
      }`}
    >
      {children}
    </button>
  );
}

export default function PricingTable({ rows, darkBg }: PricingTableProps) {
  const t = useTranslations("accommodation");
  const [showEur, setShowEur] = useState(true);
  const [spaVariant, setSpaVariant] = useState(false);

  const filtered = rows.filter((r) => r.spa_variant === spaVariant);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <ToggleButton active={!spaVariant} onClick={() => setSpaVariant(false)} darkBg={darkBg}>
          {t("noSpa")}
        </ToggleButton>
        <ToggleButton active={spaVariant} onClick={() => setSpaVariant(true)} darkBg={darkBg}>
          {t("withSpa")}
        </ToggleButton>
        <div className="ml-auto flex items-center gap-3">
          <ToggleButton active={showEur} onClick={() => setShowEur(true)} darkBg={darkBg}>
            {t("eur")}
          </ToggleButton>
          <ToggleButton active={!showEur} onClick={() => setShowEur(false)} darkBg={darkBg}>
            {t("bgn")}
          </ToggleButton>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-soft)]">
        <table className="w-full">
          <thead className={darkBg ? "bg-[var(--color-bg-primary)]" : "bg-[var(--color-linen)]"}>
            <tr>
              <th className="py-3 px-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                {t("guests")}
              </th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                {t("daily")}
              </th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                {t("twoDays")}
              </th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                {t("threePlus")}
              </th>
            </tr>
          </thead>
          <tbody className="bg-[var(--color-bg-card)]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-sm text-[var(--color-text-muted)]">
                  —
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <PriceRow key={row.id} row={row} showEur={showEur} />
              ))
            )}
          </tbody>
        </table>
      </div>

      <ul className="text-sm text-[var(--color-text-muted)] space-y-1 list-disc list-inside pl-1">
        <li>{t("discounts.weekday")}</li>
        <li>{t("discounts.earlyBook")}</li>
      </ul>
    </div>
  );
}
