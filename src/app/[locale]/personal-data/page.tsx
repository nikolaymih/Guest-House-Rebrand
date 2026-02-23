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

export default async function PersonalDataPage() {
  return (
    <div>
      <section className="bg-[var(--color-espresso)] text-[var(--color-warm-white)] py-16 px-4 text-center">
        <h1 className="font-serif text-4xl text-[var(--color-candlelight)]">Лични данни</h1>
      </section>
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="font-serif text-2xl text-[var(--color-espresso)] mb-6">
          Политика за защита на личните данни
        </h2>
        <div className="space-y-6 text-[var(--color-text-secondary)] leading-relaxed">
          <p>
            Гостилница Становец събира и обработва лични данни единствено за целите на управление на
            резервации и комуникация с гостите.
          </p>
          <p>Данните, които събираме: три имена, имейл адрес и телефонен номер.</p>
          <p>
            Данните се съхраняват сигурно и не се споделят с трети страни без вашето съгласие.
          </p>
          <p>
            Имате право да поискате достъп, корекция или изтриване на вашите данни по всяко време,
            като се свържете с нас на{" "}
            <a
              href="mailto:stanovets.eu@gmail.com"
              className="text-[var(--color-caramel)] hover:text-[var(--color-caramel-deep)]"
            >
              stanovets.eu@gmail.com
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
