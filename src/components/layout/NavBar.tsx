"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { key: "gallery", href: "/gallery" },
  { key: "landmarks", href: "/landmarks" },
  { key: "reservation", href: "/reservation" },
  { key: "contacts", href: "/contacts" },
] as const;

const ACCOMMODATION_DROPDOWN = [
  { key: "pricing", href: "/accommodation" },
  { key: "rules", href: "/rules" },
  { key: "personalData", href: "/personal-data" },
] as const;

const ACCOMMODATION_PATHS = ["/accommodation", "/rules", "/personal-data"];

export default function NavBar() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  // Strip locale prefix (e.g. /en/gallery -> /gallery)
  const bare = pathname.replace(/^\/en/, "") || "/";

  const isActive = (href: string) =>
    bare === href || bare.startsWith(href + "/");

  const accomActive = ACCOMMODATION_PATHS.some((p) => isActive(p));

  const activeClass = "text-sm font-medium text-[var(--color-candlelight)] border-b border-[var(--color-candlelight)] pb-0.5";
  const inactiveClass = "text-sm font-medium text-[var(--color-parchment)] hover:text-[var(--color-candlelight)] transition-colors";

  return (
    <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
      {/* Home */}
      <Link
        href="/"
        className={isActive("/") && !accomActive ? activeClass : inactiveClass}
      >
        {t("home")}
      </Link>

      {/* Accommodation with hover dropdown */}
      <div className="relative group">
        <Link
          href="/accommodation"
          aria-haspopup="menu"
          className={accomActive ? activeClass : inactiveClass}
        >
          {t("accommodation")}
        </Link>
        <div className="absolute top-full left-0 hidden group-hover:block group-focus-within:block pt-2 z-50">
          <div role="menu" className="bg-[var(--color-espresso)] border border-[var(--color-walnut)] rounded-lg shadow-lg py-1 min-w-max">
            {ACCOMMODATION_DROPDOWN.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                role="menuitem"
                className={`block px-4 py-2 text-sm transition-colors ${
                  isActive(item.href)
                    ? "text-[var(--color-candlelight)] bg-[var(--color-walnut)]"
                    : "text-[var(--color-parchment)] hover:text-[var(--color-candlelight)] hover:bg-[var(--color-walnut)]"
                }`}
              >
                {t(item.key)}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Remaining nav links */}
      {NAV_LINKS.map((link) => (
        <Link
          key={link.key}
          href={link.href}
          className={isActive(link.href) ? activeClass : inactiveClass}
        >
          {t(link.key)}
        </Link>
      ))}
    </nav>
  );
}
