import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.contacts" });
  return { title: t("title"), description: t("description") };
}

export default async function ContactsPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contactsPage" });

  const contacts = [
    { label: t("phoneLabel"), value: "(+359) 885 771 328", href: "tel:+359885771328" },
    { label: t("emailLabel"), value: "stanovets.eu@gmail.com", href: "mailto:stanovets.eu@gmail.com" },
  ];

  return (
    <div>
      <section className="bg-[var(--color-espresso)] text-[var(--color-warm-white)] py-16 px-4 text-center">
        <h1 className="font-serif text-4xl text-[var(--color-candlelight)]">{t("heroTitle")}</h1>
      </section>
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {contacts.map((c) => (
            <div key={c.href} className="bg-[var(--color-linen)] rounded-2xl p-6 text-center shadow-[var(--shadow-soft)]">
              <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
                {c.label}
              </p>
              <a
                href={c.href}
                className="text-[var(--color-caramel)] font-semibold hover:text-[var(--color-caramel-deep)] transition-colors"
              >
                {c.value}
              </a>
            </div>
          ))}
          {/* Facebook — card with icon */}
          <a
            href="https://www.facebook.com/p/%D0%9A%D1%8A%D1%89%D0%B0-%D0%B7%D0%B0-%D0%B3%D0%BE%D1%81%D1%82%D0%B8%D0%A1%D1%82%D0%B0%D0%BD%D0%BE%D0%B2%D0%B5%D1%86-100088378700640/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[var(--color-linen)] rounded-2xl p-6 text-center shadow-[var(--shadow-soft)] flex flex-col items-center justify-center gap-3 hover:bg-[var(--color-linen)]/70 transition-colors"
          >
            <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
              {t("facebookLabel")}
            </p>
            <span className="flex items-center gap-2 text-[var(--color-caramel)] font-semibold text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                className="w-5 h-5 flex-shrink-0" aria-hidden="true">
                <path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
              </svg>
              Facebook
            </span>
          </a>
          {/* Instagram — card with icon */}
          <a
            href="https://www.instagram.com/stanovets.guesthouse/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[var(--color-linen)] rounded-2xl p-6 text-center shadow-[var(--shadow-soft)] flex flex-col items-center justify-center gap-3 hover:bg-[var(--color-linen)]/70 transition-colors"
          >
            <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
              {t("instagramLabel")}
            </p>
            <span className="flex items-center gap-2 text-[var(--color-caramel)] font-semibold text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                className="w-5 h-5 flex-shrink-0" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
              Instagram
            </span>
          </a>
        </div>
        <div className="rounded-2xl overflow-hidden shadow-[var(--shadow-medium)] h-80">
          <iframe
            src="https://maps.google.com/maps?q=43.494470,27.039641&z=12&output=embed"
            className="w-full h-full border-0"
            loading="lazy"
            title="Location map"
          />
        </div>
      </section>
    </div>
  );
}
