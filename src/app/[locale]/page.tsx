import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ReservationForm from "@/components/reservation/ReservationForm";
import LocalBusinessSchema from "@/components/seo/LocalBusinessSchema";
import { createClient } from "@/lib/supabase/server";
import HeroCarousel from "@/components/home/HeroCarousel";
import ContactSidebar from "@/components/contact/ContactSidebar";
import { type HomeContent, type HomeAmenity } from "@/types";

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
  const distances = t.raw("distances") as Array<{ city: string; distance: string }>;

  const supabase = await createClient();

  const [
    { data: carouselData },
    { data: welcomeData },
    { data: homeContentData },
    { data: homeAmenitiesData },
  ] = await Promise.all([
    supabase
      .from("gallery_images")
      .select("id, storage_path")
      .eq("category", "overview")
      .order("display_order"),
    supabase
      .from("gallery_images")
      .select("id, storage_path")
      .eq("category", "welcome")
      .order("display_order")
      .limit(3),
    supabase.from("home_content").select("*").eq("id", 1).maybeSingle(),
    supabase.from("home_amenities").select("*").order("display_order"),
  ]);

  const carouselImages = (carouselData ?? []).map((row) => ({
    id: row.id,
    url: supabase.storage.from("gallery").getPublicUrl(row.storage_path).data.publicUrl,
  }));

  const welcomeImages = (welcomeData ?? []).map((row) => ({
    id: row.id,
    url: supabase.storage.from("gallery").getPublicUrl(row.storage_path).data.publicUrl,
  }));

  const homeContent = homeContentData as HomeContent | null;
  const dbAmenities = (homeAmenitiesData ?? []) as HomeAmenity[];

  // Derive content from DB fields; DB is now the sole source of truth
  const heroTitle =
    (locale === "en" ? homeContent?.hero_title_en : homeContent?.hero_title_bg) || "";
  const heroSubtitle =
    (locale === "en" ? homeContent?.hero_subtitle_en : homeContent?.hero_subtitle_bg) || "";
  const aboutHeading =
    (locale === "en" ? homeContent?.about_heading_en : homeContent?.about_heading_bg) || "";
  const aboutP1 =
    (locale === "en" ? homeContent?.about_p1_en : homeContent?.about_p1_bg) || "";
  const aboutP2 =
    (locale === "en" ? homeContent?.about_p2_en : homeContent?.about_p2_bg) || "";
  const aboutP3 =
    (locale === "en" ? homeContent?.about_p3_en : homeContent?.about_p3_bg) || "";
  const amenitiesHeading =
    (locale === "en" ? homeContent?.amenities_heading_en : homeContent?.amenities_heading_bg) || "";

  const amenityLabels: string[] =
    dbAmenities.length > 0
      ? dbAmenities.map((a) => (locale === "en" ? a.label_en : a.label_bg))
      : [];

  return (
    <div>
      <LocalBusinessSchema />
      {/* Hero */}
      <section className="relative bg-[var(--color-espresso)] text-[var(--color-warm-white)] py-24 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-5xl md:text-6xl text-[var(--color-candlelight)] mb-6">
            {heroTitle}
          </h1>
          <p className="text-lg text-[var(--color-parchment)] leading-relaxed max-w-xl mx-auto">
            {heroSubtitle}
          </p>
        </div>
      </section>

      {/* Hero Carousel */}
      <HeroCarousel images={carouselImages} />

      {/* About */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-serif text-3xl text-[var(--color-espresso)] mb-6">
              {aboutHeading}
            </h2>
            <p className="text-[var(--color-text-secondary)] leading-relaxed mb-4">{aboutP1}</p>
            <p className="text-[var(--color-text-secondary)] leading-relaxed mb-4">{aboutP2}</p>
            <p className="text-[var(--color-text-secondary)] leading-relaxed">{aboutP3}</p>
          </div>
          <div className="bg-[var(--color-linen)] rounded-2xl p-8 space-y-4">
            <h3 className="font-serif text-xl text-[var(--color-espresso)]">{amenitiesHeading}</h3>
            {amenityLabels.map((item) => (
              <div key={item} className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                <span className="w-2 h-2 rounded-full bg-[var(--color-caramel)] flex-shrink-0" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      {welcomeImages.length > 0 && (
        <section className="py-16 px-4 bg-[var(--color-linen)]">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-serif text-3xl text-[var(--color-espresso)] mb-3 text-center">
              {t("welcomeHeading")}
            </h2>
            <p className="text-[var(--color-text-secondary)] text-center mb-10 max-w-xl mx-auto">
              {t("welcomeSubtitle")}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {welcomeImages.map((img) => (
                <div
                  key={img.id}
                  className="overflow-hidden rounded-2xl shadow-[var(--shadow-medium)] aspect-[3/4] group"
                >
                  <img
                    src={img.url}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Location */}
      <section className="bg-[var(--color-bg-primary)] py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif text-3xl text-[var(--color-espresso)] mb-4 text-center">
            {t("locationHeading")}
          </h2>
          <p className="text-[var(--color-text-secondary)] leading-relaxed text-center mb-8 max-w-2xl mx-auto">
            {t("locationDescription")}
          </p>
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
            <ContactSidebar locale={locale} namespace="home" />
          </div>
          <ReservationForm />
        </div>
      </section>
    </div>
  );
}
