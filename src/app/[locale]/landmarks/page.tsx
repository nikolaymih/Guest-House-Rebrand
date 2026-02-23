import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.landmarks" });
  return { title: t("title"), description: t("description") };
}

interface Landmark {
  name: string;
  distance: string;
  description: string;
}

export default async function LandmarksPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landmarksPage" });
  const landmarks = t.raw("items") as Landmark[];

  return (
    <div>
      <section className="bg-[var(--color-espresso)] text-[var(--color-warm-white)] py-16 px-4 text-center">
        <h1 className="font-serif text-4xl text-[var(--color-candlelight)]">{t("heroTitle")}</h1>
        <p className="mt-3 text-[var(--color-parchment)] max-w-xl mx-auto">{t("heroSubtitle")}</p>
      </section>
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {landmarks.map((lm) => (
            <div key={lm.name} className="bg-[var(--color-bg-card)] rounded-2xl p-6 shadow-[var(--shadow-soft)] border border-[var(--color-border-soft)]">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="font-serif text-lg text-[var(--color-espresso)]">{lm.name}</h3>
                <span className="text-xs font-semibold bg-[var(--color-linen)] text-[var(--color-caramel-deep)] px-3 py-1 rounded-full flex-shrink-0">
                  {lm.distance}
                </span>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{lm.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
