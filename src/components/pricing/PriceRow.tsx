import { eurToBgn, formatBgn, formatEur } from "@/lib/utils/format";
import { type PricingRow } from "@/types";

interface PriceRowProps {
  row: PricingRow;
  showEur: boolean;
}

export default function PriceRow({ row, showEur }: PriceRowProps) {
  function fmt(eur: number): string {
    return showEur ? formatEur(eur) : formatBgn(eurToBgn(eur));
  }

  return (
    <tr className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-linen)]/40 transition-colors">
      <td className="py-3 px-4 text-sm font-semibold text-[var(--color-text-primary)]">
        {row.guest_count}
      </td>
      <td className="py-3 px-4 text-sm text-[var(--color-text-secondary)]">
        {fmt(row.daily_rate_eur)}
      </td>
      <td className="py-3 px-4 text-sm text-[var(--color-text-secondary)]">
        {fmt(row.two_day_eur)}
      </td>
      <td className="py-3 px-4 text-sm text-[var(--color-text-secondary)]">
        {fmt(row.three_plus_eur)}
      </td>
    </tr>
  );
}
