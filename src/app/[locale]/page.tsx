import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ReservationForm from "@/components/reservation/ReservationForm";
import LocalBusinessSchema from "@/components/seo/LocalBusinessSchema";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.home" });
  return {
    title: t("title"),
    description: t("description"),
    openGraph: { title: t("title"), description: t("description") },
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  const amenities = t.raw("amenities") as string[];
  const distances = t.raw("distances") as Array<{ city: string; distance: string }>;

  return (
    <div>
      <LocalBusinessSchema />
      {/* Hero */}
      <section className="relative bg-[var(--color-espresso)] text-[var(--color-warm-white)] py-24 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-5xl md:text-6xl text-[var(--color-candlelight)] mb-6">
            {t("heroTitle")}
          </h1>
          <p className="text-lg text-[var(--color-parchment)] leading-relaxed max-w-xl mx-auto">
            {t("heroSubtitle")}
          </p>
        </div>
      </section>

      {/* About */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-serif text-3xl text-[var(--color-espresso)] mb-6">
              {t("aboutHeading")}
            </h2>
            <p className="text-[var(--color-text-secondary)] leading-relaxed mb-4">{t("aboutP1")}</p>
            <p className="text-[var(--color-text-secondary)] leading-relaxed mb-4">{t("aboutP2")}</p>
            <p className="text-[var(--color-text-secondary)] leading-relaxed">{t("aboutP3")}</p>
          </div>
          <div className="bg-[var(--color-linen)] rounded-2xl p-8 space-y-4">
            <h3 className="font-serif text-xl text-[var(--color-espresso)]">{t("amenitiesHeading")}</h3>
            {amenities.map((item) => (
              <div key={item} className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                <span className="w-2 h-2 rounded-full bg-[var(--color-caramel)] flex-shrink-0" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="bg-[var(--color-linen)] py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif text-3xl text-[var(--color-espresso)] mb-8 text-center">
            {t("locationHeading")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {distances.map((item) => (
              <div key={item.city} className="bg-white rounded-xl p-6 text-center shadow-[var(--shadow-soft)]">
                <p className="font-semibold text-[var(--color-espresso)]">{item.city}</p>
                <p className="text-[var(--color-caramel)] text-sm mt-1">{item.distance}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl overflow-hidden shadow-[var(--shadow-medium)] h-64">
            <iframe
              src="https://maps.google.com/maps?q=43.494470,27.039641&z=11&output=embed"
              className="w-full h-full border-0"
              loading="lazy"
              title="Map"
            />
          </div>
        </div>
      </section>

      {/* Reservation */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="font-serif text-3xl text-[var(--color-espresso)] mb-4">
              {t("inquiryHeading")}
            </h2>
            <p className="text-[var(--color-text-secondary)] leading-relaxed">
              {t("inquirySubtitle")}
            </p>
          </div>
          <ReservationForm />
        </div>
      </section>
    </div>
  );
}
