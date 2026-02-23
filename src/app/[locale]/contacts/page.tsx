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

export default async function ContactsPage() {
  return (
    <div>
      <section className="bg-[var(--color-espresso)] text-[var(--color-warm-white)] py-16 px-4 text-center">
        <h1 className="font-serif text-4xl text-[var(--color-candlelight)]">Контакти</h1>
      </section>
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: "Телефон", value: "(+359) 885 771 328", href: "tel:+359885771328" },
            { label: "Имейл", value: "stanovets.eu@gmail.com", href: "mailto:stanovets.eu@gmail.com" },
            { label: "Facebook", value: "Становец", href: "https://www.facebook.com/people/%D0%A1%D1%82%D0%B0%D0%BD%D0%BE%D0%B2%D0%B5%D1%86/100063453006216/" },
          ].map((c) => (
            <div
              key={c.label}
              className="bg-[var(--color-linen)] rounded-2xl p-6 text-center shadow-[var(--shadow-soft)]"
            >
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
