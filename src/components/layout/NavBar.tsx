import { useTranslations } from "next-intl";
import Link from "next/link";

const NAV_LINKS = [
  { key: "home", href: "/" },
  { key: "gallery", href: "/gallery/garden" },
  { key: "landmarks", href: "/landmarks" },
  { key: "reservation", href: "/reservation" },
  { key: "contacts", href: "/contacts" },
] as const;

const ACCOMMODATION_DROPDOWN = [
  { key: "pricing", href: "/accommodation" },
  { key: "rules", href: "/rules" },
  { key: "personalData", href: "/personal-data" },
] as const;

export default function NavBar() {
  const t = useTranslations("nav");

  return (
    <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
      {/* Accommodation with hover dropdown */}
      <div className="relative group">
        <Link
          href="/accommodation"
          aria-haspopup="true"
          className="text-sm font-medium text-[var(--color-parchment)] hover:text-[var(--color-candlelight)] transition-colors"
        >
          {t("accommodation")}
        </Link>
        <div className="absolute top-full left-0 hidden group-hover:block pt-2 z-50">
          <div role="menu" className="bg-[var(--color-espresso)] border border-[var(--color-walnut)] rounded-lg shadow-lg py-1 min-w-max">
            {ACCOMMODATION_DROPDOWN.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                role="menuitem"
                className="block px-4 py-2 text-sm text-[var(--color-parchment)] hover:text-[var(--color-candlelight)] hover:bg-[var(--color-walnut)] transition-colors"
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
          className="text-sm font-medium text-[var(--color-parchment)] hover:text-[var(--color-candlelight)] transition-colors"
        >
          {t(link.key)}
        </Link>
      ))}
    </nav>
  );
}
