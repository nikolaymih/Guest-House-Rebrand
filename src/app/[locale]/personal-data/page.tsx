import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.personalData" });
  return { title: t("title"), description: t("description") };
}

export default async function PersonalDataPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "personalDataPage" });

  return (
    <div>
      <section className="bg-[var(--color-espresso)] text-[var(--color-warm-white)] py-16 px-4 text-center">
        <h1 className="font-serif text-4xl text-[var(--color-candlelight)]">{t("heroTitle")}</h1>
      </section>
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="font-serif text-2xl text-[var(--color-espresso)] mb-6">{t("heading")}</h2>
        <div className="space-y-6 text-[var(--color-text-secondary)] leading-relaxed">
          <p>{t("p1")}</p>
          <p>{t("p2")}</p>
          <p>{t("p3")}</p>
          <p>
            {t("p4")}
          </p>
        </div>
      </section>
    </div>
  );
}
