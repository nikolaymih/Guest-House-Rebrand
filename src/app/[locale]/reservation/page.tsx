import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ReservationForm from "@/components/reservation/ReservationForm";
import ContactSidebar from "@/components/contact/ContactSidebar";
import PromotionSection from "@/components/promotions/PromotionSection";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.reservation" });
  return { title: t("title"), description: t("description") };
}

export default async function ReservationPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "reservationPage" });

  return (
    <div>
      <section className="bg-[var(--color-espresso)] text-[var(--color-warm-white)] py-16 px-4 text-center">
        <h1 className="font-serif text-4xl text-[var(--color-candlelight)]">{t("heroTitle")}</h1>
        <p className="mt-3 text-[var(--color-parchment)]">{t("heroSubtitle")}</p>
      </section>
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="font-serif text-2xl text-[var(--color-espresso)] mb-4">{t("inquiryHeading")}</h2>
            <p className="text-[var(--color-text-secondary)] leading-relaxed mb-4">{t("inquirySubtitle")}</p>
            <ContactSidebar locale={locale} namespace="reservationPage" />
          </div>
          <ReservationForm />
        </div>
      </section>
      {/* Promotions */}
      <PromotionSection locale={locale} />
    </div>
  );
}
