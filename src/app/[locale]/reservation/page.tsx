import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ReservationForm from "@/components/reservation/ReservationForm";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.reservation" });
  return { title: t("title"), description: t("description") };
}

export default async function ReservationPage() {
  return (
    <div>
      <section className="bg-[var(--color-espresso)] text-[var(--color-warm-white)] py-16 px-4 text-center">
        <h1 className="font-serif text-4xl text-[var(--color-candlelight)]">Резервация</h1>
        <p className="mt-3 text-[var(--color-parchment)]">Свържете се с нас за резервация</p>
      </section>
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="font-serif text-2xl text-[var(--color-espresso)] mb-4">Запитване</h2>
            <p className="text-[var(--color-text-secondary)] leading-relaxed mb-4">
              Попълнете формата и ще се свържем с вас в рамките на 24 часа.
            </p>
            <div className="space-y-3">
              {[
                { label: "Телефон", value: "(+359) 885 771 328", href: "tel:+359885771328" },
                { label: "Имейл", value: "stanovets.eu@gmail.com", href: "mailto:stanovets.eu@gmail.com" },
              ].map((c) => (
                <div key={c.label} className="flex flex-col">
                  <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                    {c.label}
                  </span>
                  <a
                    href={c.href}
                    className="text-[var(--color-caramel)] hover:text-[var(--color-caramel-deep)] font-medium"
                  >
                    {c.value}
                  </a>
                </div>
              ))}
            </div>
          </div>
          <ReservationForm />
        </div>
      </section>
    </div>
  );
}
