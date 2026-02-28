"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LanguageSwitcher from "./LanguageSwitcher";

const NAV_LINKS_BEFORE = [
  { key: "home", href: "/" },
] as const;

const NAV_LINKS_AFTER = [
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
  const pathname = usePathname();

  const bare = pathname.replace(/^\/en/, "") || "/";
  const isActive = (href: string) =>
    bare === href || bare.startsWith(href + "/");
  const accomActive = ["/accommodation", "/rules", "/personal-data"].some((p) => isActive(p));

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
          {/* Home */}
          {NAV_LINKS_BEFORE.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`text-base font-medium transition-colors ${
                isActive(link.href) && !accomActive
                  ? "text-[var(--color-candlelight)]"
                  : "text-[var(--color-warm-white)] hover:text-[var(--color-candlelight)]"
              }`}
            >
              {t(link.key)}
            </Link>
          ))}

          {/* Accommodation section — 2nd position */}
          <div role="group" aria-label={t("accommodation")} className="flex flex-col gap-4">
            <span aria-hidden="true" className={`text-base font-medium ${accomActive ? "text-[var(--color-candlelight)]" : "text-[var(--color-text-muted)]"}`}>
              {t("accommodation")}
            </span>
            {ACCOMMODATION_LINKS.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`pl-4 text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "text-[var(--color-candlelight)]"
                    : "text-[var(--color-warm-white)] hover:text-[var(--color-candlelight)]"
                }`}
              >
                {t(link.key)}
              </Link>
            ))}
          </div>

          {/* Remaining nav links */}
          {NAV_LINKS_AFTER.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`text-base font-medium transition-colors ${
                isActive(link.href)
                  ? "text-[var(--color-candlelight)]"
                  : "text-[var(--color-warm-white)] hover:text-[var(--color-candlelight)]"
              }`}
            >
              {t(link.key)}
            </Link>
          ))}

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
