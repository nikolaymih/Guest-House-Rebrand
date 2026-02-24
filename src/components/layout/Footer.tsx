import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";

const FB_URL =
  "https://www.facebook.com/people/%D0%A1%D1%82%D0%B0%D0%BD%D0%BE%D0%B2%D0%B5%D1%86/100063453006216/";

export default async function Footer() {
  const t = await getTranslations("footer");

  const amenities = t.raw("amenities") as string[];
  const accommodationItems = t.raw("accommodationItems") as string[];

  return (
    <footer className="bg-[var(--color-espresso)] text-[var(--color-parchment)] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 4-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Column 1 — Guest house info */}
          <div>
            <h3 className="font-serif text-lg text-[var(--color-candlelight)] mb-4">
              {t("guestHouseName")}
            </h3>
            <p className="text-sm leading-relaxed mb-3">{t("address")}</p>
            <a
              href="tel:+359885771328"
              className="block text-sm hover:text-[var(--color-candlelight)] transition-colors mb-1"
            >
              (+359) 885 771 328
            </a>
            <a
              href="mailto:stanovets.eu@gmail.com"
              className="block text-sm hover:text-[var(--color-candlelight)] transition-colors"
            >
              stanovets.eu@gmail.com
            </a>
          </div>

          {/* Column 2 — Amenities (static) */}
          <div>
            <h4 className="font-semibold text-[var(--color-warm-white)] mb-4 text-sm uppercase tracking-wider">
              {t("amenitiesHeading")}
            </h4>
            <ul className="space-y-2 text-sm">
              {amenities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Accommodation (static) */}
          <div>
            <h4 className="font-semibold text-[var(--color-warm-white)] mb-4 text-sm uppercase tracking-wider">
              {t("accommodationHeading")}
            </h4>
            <ul className="space-y-2 text-sm">
              {accommodationItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Column 4 — Useful links */}
          <div>
            <h4 className="font-semibold text-[var(--color-warm-white)] mb-4 text-sm uppercase tracking-wider">
              {t("linksHeading")}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-[var(--color-candlelight)] transition-colors">
                  {t("linkHome")}
                </Link>
              </li>
              <li>
                <Link href="/reservation" className="hover:text-[var(--color-candlelight)] transition-colors">
                  {t("linkReservation")}
                </Link>
              </li>
              <li>
                <Link href="/rules" className="hover:text-[var(--color-candlelight)] transition-colors">
                  {t("linkRules")}
                </Link>
              </li>
              <li>
                <Link href="/personal-data" className="hover:text-[var(--color-candlelight)] transition-colors">
                  {t("linkPrivacy")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Facebook card */}
        <a
          href={FB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-[var(--color-walnut)] hover:bg-[var(--color-walnut)]/80 transition-colors rounded-xl px-6 py-4 mb-8 w-full md:w-auto md:inline-flex"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6 text-[var(--color-candlelight)] flex-shrink-0"
            aria-hidden="true"
          >
            <path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
          </svg>
          <span className="text-sm font-semibold text-[var(--color-warm-white)]">
            {t("facebookLabel")}
          </span>
        </a>

        {/* Copyright */}
        <div className="border-t border-[var(--color-walnut)] pt-6 text-center text-xs text-[var(--color-text-muted)]">
          © {new Date().getFullYear()} Становец. {t("rights")}.
        </div>
      </div>
    </footer>
  );
}
