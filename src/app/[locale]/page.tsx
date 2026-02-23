import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ReservationForm from "@/components/reservation/ReservationForm";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.home" });
  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
    },
  };
}

export default async function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-[var(--color-espresso)] text-[var(--color-warm-white)] py-24 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-5xl md:text-6xl text-[var(--color-candlelight)] mb-6">
            Становец
          </h1>
          <p className="text-lg text-[var(--color-parchment)] leading-relaxed max-w-xl mx-auto">
            Уютна гостилница сред природата. Спа зона, механа, красива градина и незабравима почивка.
          </p>
        </div>
      </section>

      {/* About Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-serif text-3xl text-[var(--color-espresso)] mb-6">
              Добре дошли в Становец
            </h2>
            <p className="text-[var(--color-text-secondary)] leading-relaxed mb-4">
              Гостилница Становец предлага комфортно настаняване за до 12 гости. Разполагаме с 4 спални, 4 бани,
              просторна всекидневна и напълно оборудвана кухня.
            </p>
            <p className="text-[var(--color-text-secondary)] leading-relaxed mb-4">
              Насладете се на СПА зоната с вана за хидромасаж, сауна и фитнес уреди, или прекарайте вечерта в
              нашата уютна механа с автентична атмосфера.
            </p>
            <p className="text-[var(--color-text-secondary)] leading-relaxed">
              Намираме се в живописен район, близо до природни забележителности и исторически обекти.
            </p>
          </div>
          <div className="bg-[var(--color-linen)] rounded-2xl p-8 space-y-4">
            <h3 className="font-serif text-xl text-[var(--color-espresso)]">Удобства</h3>
            {[
              "4 спални, 4 бани",
              "До 12 гости",
              "СПА зона (хидромасаж, сауна, фитнес)",
              "Механа с автентична атмосфера",
              "Просторна градина",
              "Напълно оборудвана кухня",
              "Безплатен паркинг",
              "Wi-Fi",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                <span className="w-2 h-2 rounded-full bg-[var(--color-caramel)] flex-shrink-0" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="bg-[var(--color-linen)] py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif text-3xl text-[var(--color-espresso)] mb-8 text-center">
            Местоположение
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { city: "Шумен", distance: "32 км" },
              { city: "Велики Преслав", distance: "15 км" },
              { city: "Плиска", distance: "20 км" },
            ].map((item) => (
              <div
                key={item.city}
                className="bg-white rounded-xl p-6 text-center shadow-[var(--shadow-soft)]"
              >
                <p className="font-semibold text-[var(--color-espresso)]">{item.city}</p>
                <p className="text-[var(--color-caramel)] text-sm mt-1">{item.distance}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl overflow-hidden shadow-[var(--shadow-medium)] h-64">
            <iframe
              src={`https://maps.google.com/maps?q=43.494470,27.039641&z=11&output=embed`}
              className="w-full h-full border-0"
              loading="lazy"
              title="Map"
            />
          </div>
        </div>
      </section>

      {/* Reservation Form Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="font-serif text-3xl text-[var(--color-espresso)] mb-4">
              Изпратете запитване
            </h2>
            <p className="text-[var(--color-text-secondary)] leading-relaxed">
              Попълнете формата и ние ще се свържем с вас за потвърждение на резервацията.
            </p>
          </div>
          <ReservationForm />
        </div>
      </section>
    </div>
  );
}
