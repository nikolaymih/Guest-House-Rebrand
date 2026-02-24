import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

interface Props {
  params: Promise<{ locale: string }>;
}

interface Section {
  header: string;
  paragraphs: string[];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.rules" });
  return { title: t("title"), description: t("description") };
}

export default async function RulesPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "rulesPage" });
  const sections = t.raw("sections") as Section[];

  return (
    <div>
      <section className="bg-[var(--color-espresso)] text-[var(--color-warm-white)] py-16 px-4 text-center">
        <h1 className="font-serif text-4xl text-[var(--color-candlelight)]">{t("heroTitle")}</h1>
      </section>
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="font-serif text-2xl text-[var(--color-espresso)] mb-6">{t("pageHeading")}</h2>
        <div className="space-y-2">
          {sections.map((section, idx) => (
            <details
              key={idx}
              open={idx === 0}
              className="group border border-[var(--color-border)] rounded-lg overflow-hidden"
            >
              <summary className="flex items-center justify-between px-4 py-3 bg-[var(--color-linen)] cursor-pointer list-none font-semibold text-[var(--color-espresso)] hover:bg-[var(--color-caramel)] hover:text-white transition-colors">
                {section.header}
                <span className="ml-4 flex-shrink-0 text-lg transition-transform group-open:rotate-180">▾</span>
              </summary>
              <div className="px-4 py-4 bg-white space-y-2">
                {section.paragraphs.map((p, pIdx) => (
                  <p key={pIdx} className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
