import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { type Landmark } from "@/types";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const supabase = await createClient();
  const { data } = await supabase.from("landmarks").select("slug");
  const slugs = (data ?? []).map((r: { slug: string }) => r.slug);
  const locales = ["bg", "en"];
  return locales.flatMap((locale) => slugs.map((slug: string) => ({ locale, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("landmarks")
    .select("name_bg, name_en, description_bg, description_en")
    .eq("slug", slug)
    .maybeSingle();

  if (!data) return {};
  const name = locale === "en" ? data.name_en : data.name_bg;
  const desc = locale === "en" ? data.description_en : data.description_bg;
  return {
    title: `${name} — Становец`,
    description: desc.slice(0, 160),
  };
}

export default async function LandmarkDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "landmarksPage" });

  const supabase = await createClient();
  const { data: lm } = await supabase
    .from("landmarks")
    .select("*")
    .eq("slug", slug)
    .maybeSingle() as { data: Landmark | null };

  if (!lm) notFound();

  const name = locale === "en" ? lm.name_en : lm.name_bg;
  const description = locale === "en" ? lm.description_en : lm.description_bg;
  const paragraphs = description.split("\n\n").filter(Boolean);

  const imageUrl = lm.storage_path
    ? supabase.storage.from("gallery").getPublicUrl(lm.storage_path).data.publicUrl
    : null;

  return (
    <div>
      <section className="bg-[var(--color-espresso)] text-[var(--color-warm-white)] py-16 px-4 text-center">
        <h1 className="font-serif text-4xl text-[var(--color-candlelight)]">{name}</h1>
        <p className="mt-3 text-[var(--color-parchment)]">{lm.distance}</p>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {imageUrl && (
          <div className="rounded-2xl overflow-hidden shadow-[var(--shadow-medium)] mb-10 aspect-[16/9]">
            <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
          </div>
        )}

        <article>
          {paragraphs.map((para, i) => (
            <p key={i} className="text-[var(--color-text-secondary)] leading-relaxed mb-5 text-base">
              {para}
            </p>
          ))}
        </article>

        <Link
          href={`/${locale}/landmarks`}
          className="inline-flex items-center gap-2 mt-8 text-sm font-semibold text-[var(--color-caramel)] hover:text-[var(--color-caramel-deep)] transition-colors"
        >
          ← {t("backToLandmarks")}
        </Link>
      </section>
    </div>
  );
}
