"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";

const NAV_LINKS = [
  { key: "home", href: "/" },
  { key: "gallery", href: "/gallery/garden" },
  { key: "landmarks", href: "/landmarks" },
  { key: "reservation", href: "/reservation" },
  { key: "contacts", href: "/contacts" },
] as const;

const ACCOMMODATION_LINKS = [
  { key: "pricing", href: "/accommodation" },
  { key: "rules", href: "/rules" },
  { key: "personalData", href: "/personal-data" },
] as const;

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const t = useTranslations("nav");
  const th = useTranslations("header");

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? t("closeMenu") : t("openMenu")}
        aria-expanded={open}
        className="text-[var(--color-candlelight)] p-2"
      >
        <span className="block w-6 h-0.5 bg-current mb-1.5" />
        <span className="block w-6 h-0.5 bg-current mb-1.5" />
        <span className="block w-6 h-0.5 bg-current" />
      </button>

      {open && (
        <div className="absolute top-16 left-0 right-0 z-50 bg-[var(--color-espresso)] border-t border-[var(--color-walnut)] px-4 py-6 flex flex-col gap-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-base font-medium text-[var(--color-warm-white)] hover:text-[var(--color-candlelight)] transition-colors"
            >
              {t(link.key)}
            </Link>
          ))}

          {/* Accommodation section */}
          <div role="group" aria-label={t("accommodation")} className="flex flex-col gap-4">
            <span aria-hidden="true" className="text-base font-medium text-[var(--color-text-muted)]">
              {t("accommodation")}
            </span>
            {ACCOMMODATION_LINKS.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                onClick={() => setOpen(false)}
                className="pl-4 text-sm font-medium text-[var(--color-warm-white)] hover:text-[var(--color-candlelight)] transition-colors"
              >
                {t(link.key)}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-[var(--color-walnut)] flex items-center justify-between">
            <a
              href={`tel:${th("phone").replace(/\s/g, "")}`}
              className="text-sm text-[var(--color-candlelight)]"
            >
              {th("phone")}
            </a>
            <LanguageSwitcher />
          </div>
        </div>
      )}
    </div>
  );
}
