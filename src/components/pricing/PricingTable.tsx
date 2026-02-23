"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import PriceRow from "./PriceRow";
import { type PricingRow } from "@/types";

interface PricingTableProps {
  rows: PricingRow[];
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
        active
          ? "bg-[var(--color-caramel)] text-white shadow-[var(--shadow-warm)]"
          : "bg-[var(--color-linen)] text-[var(--color-text-secondary)] hover:bg-[var(--color-oatmeal)]"
      }`}
    >
      {children}
    </button>
  );
}

export default function PricingTable({ rows }: PricingTableProps) {
  const t = useTranslations("accommodation");
  const [showEur, setShowEur] = useState(true);
  const [spaVariant, setSpaVariant] = useState(false);

  const filtered = rows.filter((r) => r.spa_variant === spaVariant);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <ToggleButton active={!spaVariant} onClick={() => setSpaVariant(false)}>
          {t("noSpa")}
        </ToggleButton>
        <ToggleButton active={spaVariant} onClick={() => setSpaVariant(true)}>
          {t("withSpa")}
        </ToggleButton>
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => setShowEur(true)}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              showEur
                ? "text-[var(--color-caramel)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
            }`}
          >
            {t("eur")}
          </button>
          <span className="text-[var(--color-text-muted)] text-sm">|</span>
          <button
            onClick={() => setShowEur(false)}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              !showEur
                ? "text-[var(--color-caramel)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
            }`}
          >
            {t("bgn")}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-soft)]">
        <table className="w-full">
          <thead className="bg-[var(--color-linen)]">
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
