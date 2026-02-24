import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

interface Landmark {
  slug: string;
  name: string;
  distance: string;
  description: string;
  longDescription: string[];
}

const ALL_SLUGS = [
  "benediktinski-manastir",
  "pliska",
  "shumenska-krepost",
  "peshtera-zandana",
  "madarski-konnik",
  "hankrumovski-skalen-manastir",
  "okoto-na-osmar",
  "veliki-preslav",
];

export async function generateStaticParams() {
  const locales = ["bg", "en"];
  return locales.flatMap((locale) =>
    ALL_SLUGS.map((slug) => ({ locale, slug }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "landmarksPage" });
  const landmarks = t.raw("items") as Landmark[];
  const lm = landmarks.find((l) => l.slug === slug);
  if (!lm) return {};
  return {
    title: `${lm.name} — Становец`,
    description: lm.description,
  };
}

export default async function LandmarkDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "landmarksPage" });
  const landmarks = t.raw("items") as Landmark[];
  const lm = landmarks.find((l) => l.slug === slug);

  if (!lm) notFound();

  const supabase = await createClient();
  const { data: imgData } = await supabase
    .from("landmark_images")
    .select("storage_path")
    .eq("slug", slug)
    .maybeSingle();

  const imageUrl = imgData
    ? supabase.storage.from("gallery").getPublicUrl(imgData.storage_path).data.publicUrl
    : null;

  return (
    <div>
      {/* Hero */}
      <section className="bg-[var(--color-espresso)] text-[var(--color-warm-white)] py-16 px-4 text-center">
        <h1 className="font-serif text-4xl text-[var(--color-candlelight)]">{lm.name}</h1>
        <p className="mt-3 text-[var(--color-parchment)]">{lm.distance}</p>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Image */}
        {imageUrl && (
          <div className="rounded-2xl overflow-hidden shadow-[var(--shadow-medium)] mb-10 aspect-[16/9]">
            <img
              src={imageUrl}
              alt={lm.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Long description */}
        <article className="prose max-w-none">
          {lm.longDescription.map((para, i) => (
            <p key={i} className="text-[var(--color-text-secondary)] leading-relaxed mb-5 text-base">
              {para}
            </p>
          ))}
        </article>

        {/* Back link */}
        <Link
          href="/landmarks"
          className="inline-flex items-center gap-2 mt-8 text-sm font-semibold text-[var(--color-caramel)] hover:text-[var(--color-caramel-deep)] transition-colors"
        >
          ← {t("backToLandmarks")}
        </Link>
      </section>
    </div>
  );
}
