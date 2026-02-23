import { useTranslations } from "next-intl";
import Link from "next/link";

const NAV_LINKS = [
  { key: "home", href: "/" },
  { key: "accommodation", href: "/accommodation" },
  { key: "gallery", href: "/gallery/garden" },
  { key: "landmarks", href: "/landmarks" },
  { key: "reservation", href: "/reservation" },
  { key: "contacts", href: "/contacts" },
] as const;

export default function NavBar() {
  const t = useTranslations("nav");

  return (
    <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
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
