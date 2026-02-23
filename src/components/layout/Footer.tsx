"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

const QUICK_LINKS = [
  { label_key: "gallery", href: "/gallery/garden" },
  { label_key: "accommodation", href: "/accommodation" },
  { label_key: "reservation", href: "/reservation" },
  { label_key: "contacts", href: "/contacts" },
] as const;

export default function Footer() {
  const t = useTranslations("footer");
  const tn = useTranslations("nav");

  return (
    <footer className="bg-[#1B1B1B] text-[var(--color-text-muted)] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-serif text-lg text-[var(--color-candlelight)] mb-4">Становец</h3>
            <p className="text-sm leading-relaxed">{t("tagline")}</p>
          </div>
          <div>
            <h4 className="font-semibold text-[var(--color-warm-white)] mb-4 text-sm uppercase tracking-wider">
              {t("quickLinksHeading")}
            </h4>
            <ul className="space-y-2 text-sm">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-[var(--color-candlelight)] transition-colors">
                    {tn(link.label_key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-[var(--color-warm-white)] mb-4 text-sm uppercase tracking-wider">
              {t("contactsHeading")}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="tel:+359885771328" className="hover:text-[var(--color-candlelight)] transition-colors">
                  (+359) 885 771 328
                </a>
              </li>
              <li>
                <a href="mailto:stanovets.eu@gmail.com" className="hover:text-[var(--color-candlelight)] transition-colors">
                  stanovets.eu@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[var(--color-walnut)] mt-8 pt-6 text-center text-xs">
          © {new Date().getFullYear()} Становец. {t("rights")}.
        </div>
      </div>
    </footer>
  );
}
