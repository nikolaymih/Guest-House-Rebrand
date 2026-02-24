import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { type Landmark } from "@/types";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.landmarks" });
  return { title: t("title"), description: t("description") };
}

export default async function LandmarksPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landmarksPage" });

  const supabase = await createClient();
  const { data } = await supabase
    .from("landmarks")
    .select("id, slug, name_bg, name_en, description_bg, description_en, distance, storage_path, display_order")
    .order("display_order", { ascending: true });

  const landmarks = (data ?? []) as Landmark[];

  return (
    <div>
      <section className="bg-[var(--color-espresso)] text-[var(--color-warm-white)] py-16 px-4 text-center">
        <h1 className="font-serif text-4xl text-[var(--color-candlelight)]">{t("heroTitle")}</h1>
        <p className="mt-3 text-[var(--color-parchment)] max-w-xl mx-auto">{t("heroSubtitle")}</p>
      </section>
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {landmarks.map((lm) => {
            const name = locale === "en" ? lm.name_en : lm.name_bg;
            const desc = locale === "en" ? lm.description_en : lm.description_bg;
            // Show first ~180 chars as card preview
            const preview = desc.length > 180 ? desc.slice(0, 180).trimEnd() + "…" : desc;

            return (
              <Link
                key={lm.slug}
                href={`/${locale}/landmarks/${lm.slug}`}
                className="block bg-[var(--color-bg-card)] rounded-2xl p-6 shadow-[var(--shadow-soft)] border border-[var(--color-border-soft)] hover:shadow-[var(--shadow-medium)] hover:border-[var(--color-caramel)] transition-all group"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="font-serif text-lg font-semibold text-[var(--color-espresso)] group-hover:text-[var(--color-caramel-deep)] transition-colors">
                    {name}
                  </h3>
                  <span className="text-xs font-semibold bg-[var(--color-linen)] text-[var(--color-caramel-deep)] px-3 py-1 rounded-full flex-shrink-0">
                    {lm.distance}
                  </span>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{preview}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
