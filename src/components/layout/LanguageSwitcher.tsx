"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(next: "bg" | "en") {
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => switchLocale("bg")}
        className={`text-sm font-semibold px-2 py-1 rounded transition-colors ${
          locale === "bg"
            ? "text-[var(--color-candlelight)] underline underline-offset-2"
            : "text-[var(--color-text-muted)] hover:text-[var(--color-warm-white)]"
        }`}
        aria-label="Превключи на български"
      >
        БГ
      </button>
      <span className="text-[var(--color-walnut)] text-sm">|</span>
      <button
        onClick={() => switchLocale("en")}
        className={`text-sm font-semibold px-2 py-1 rounded transition-colors ${
          locale === "en"
            ? "text-[var(--color-candlelight)] underline underline-offset-2"
            : "text-[var(--color-text-muted)] hover:text-[var(--color-warm-white)]"
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>
    </div>
  );
}
