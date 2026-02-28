import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import PricingTable from "@/components/pricing/PricingTable";
import PromotionSection from "@/components/promotions/PromotionSection";
import ReservationForm from "@/components/reservation/ReservationForm";
import { type PricingRow, type AccommodationContent, type AccommodationFeature } from "@/types";
import ContactSidebar from "@/components/contact/ContactSidebar";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.accommodation" });
  return { title: t("title"), description: t("description") };
}

export default async function AccommodationPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "accommodationPage" });

  const supabase = await createClient();
  const [{ data: contentData }, { data: featuresData }, { data: pricingData }] = await Promise.all([
    supabase.from("accommodation_content").select("*").eq("id", 1).maybeSingle(),
    supabase.from("accommodation_features").select("*").order("display_order"),
    supabase.from("pricing").select("*").order("guest_count"),
  ]);

  const content = contentData as AccommodationContent | null;
  const features = (featuresData ?? []) as AccommodationFeature[];
  const rows = (pricingData ?? []) as PricingRow[];

  const aboutHeading = locale === "en" ? (content?.about_heading_en ?? "") : (content?.about_heading_bg ?? "");
  const aboutP1 = locale === "en" ? (content?.about_p1_en ?? "") : (content?.about_p1_bg ?? "");
  const aboutP2 = locale === "en" ? (content?.about_p2_en ?? "") : (content?.about_p2_bg ?? "");
  const featuresHeading = locale === "en" ? (content?.features_heading_en ?? "") : (content?.features_heading_bg ?? "");

  return (
    <div>
      <section className="bg-[var(--color-espresso)] text-[var(--color-warm-white)] py-16 px-4 text-center">
        <h1 className="font-serif text-4xl text-[var(--color-candlelight)]">{t("heroTitle")}</h1>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start mb-12">
          <div>
            <h2 className="font-serif text-2xl text-[var(--color-espresso)] mb-4">{aboutHeading}</h2>
            <p className="text-[var(--color-text-secondary)] leading-relaxed mb-3">{aboutP1}</p>
            <p className="text-[var(--color-text-secondary)] leading-relaxed">{aboutP2}</p>
          </div>
          <div className="bg-[var(--color-linen)] rounded-2xl p-6 space-y-3">
            <h3 className="font-serif text-lg text-[var(--color-espresso)]">{featuresHeading}</h3>
            {features.map((f) => (
              <div key={f.id} className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-caramel)]" />
                {locale === "en" ? f.label_en : f.label_bg}
              </div>
            ))}
          </div>
        </div>

        <h2 className="font-serif text-2xl text-[var(--color-espresso)] mb-6">{t("pricingHeading")}</h2>
        <PricingTable rows={rows} />
      </section>

      {/* Promotions */}
      <PromotionSection locale={locale} />

      {/* Reservation form */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="font-serif text-2xl text-[var(--color-espresso)] mb-4">
              {t("inquiryHeading")}
            </h2>
            <p className="text-[var(--color-text-secondary)] leading-relaxed">
              {t("inquirySubtitle")}
            </p>
            <ContactSidebar locale={locale} namespace="home" />
          </div>
          <ReservationForm />
        </div>
      </section>
    </div>
  );
}
