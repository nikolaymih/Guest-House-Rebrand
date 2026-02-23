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

const LANDMARKS: Landmark[] = [
  {
    name: "Бенедиктински манастир (Царев брод)",
    distance: "23,7 км",
    description:
      "Единственият действащ бенедиктински манастир в Североизточна България. Основан през 1914 г., известен с целебния мехлем от невен, приготвян от монахините.",
  },
  {
    name: "Плиска — Първа Българска столица",
    distance: "35 км",
    description:
      "Националният историко-археологически резерват и люлка на Българската държава от 681 г. Разгледайте руините на Голямата базилика и крепостните стени.",
  },
  {
    name: "Мадарски конник",
    distance: "43 км",
    description:
      "Уникален скален релеф от VIII век, включен в списъка на ЮНЕСКО. Единственият в света ранносредновековен скален паметник на открито.",
  },
  {
    name: "Шуменска крепост",
    distance: "42 км",
    description:
      "Средновековна крепост с хилядолетна история, предлагаща великолепна панорама към Шумен и околностите.",
  },
  {
    name: "Пещера Зандана",
    distance: "42 км",
    description:
      "Живописна пещера с богата сталактитова украса, идеална дестинация за любители на природата.",
  },
  {
    name: "Велики Преслав — Втора Българска столица",
    distance: "52 км",
    description:
      "Богат археологически резерват — столица на Първото Българско царство от 893 г. с Преславски и Патриаршески комплекс.",
  },
];

export default async function LandmarksPage() {
  return (
    <div>
      <section className="bg-[var(--color-espresso)] text-[var(--color-warm-white)] py-16 px-4 text-center">
        <h1 className="font-serif text-4xl text-[var(--color-candlelight)]">Забележителности</h1>
        <p className="mt-3 text-[var(--color-parchment)] max-w-xl mx-auto">
          Открийте историческите и природни забележителности в района
        </p>
      </section>
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {LANDMARKS.map((lm) => (
            <div
              key={lm.name}
              className="bg-[var(--color-bg-card)] rounded-2xl p-6 shadow-[var(--shadow-soft)] border border-[var(--color-border-soft)]"
            >
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
