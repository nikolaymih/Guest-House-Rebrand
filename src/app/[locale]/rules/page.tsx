import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.rules" });
  return { title: t("title"), description: t("description") };
}

const RULES = [
  "Настаняването е от 15:00 ч., а освобождаването — до 12:00 ч.",
  "Забранено е пушенето в затворените помещения.",
  "Домашни животни се допускат само след предварително съгласуване.",
  "Гостите са отговорни за нанесените щети на имуществото.",
  "Шумът след 23:00 ч. е забранен.",
  "Отговорникът за групата носи пълна отговорност за спазване на правилата.",
];

export default async function RulesPage() {
  return (
    <div>
      <section className="bg-[var(--color-espresso)] text-[var(--color-warm-white)] py-16 px-4 text-center">
        <h1 className="font-serif text-4xl text-[var(--color-candlelight)]">Правила</h1>
      </section>
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="font-serif text-2xl text-[var(--color-espresso)] mb-6">Правила за ползване</h2>
        <ul className="space-y-4">
          {RULES.map((rule) => (
            <li key={rule} className="flex items-start gap-3 text-[var(--color-text-secondary)]">
              <span className="w-2 h-2 rounded-full bg-[var(--color-caramel)] flex-shrink-0 mt-2" />
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
