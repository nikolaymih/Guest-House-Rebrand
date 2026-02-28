import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import PromotionGrid from "./PromotionGrid";

export default async function PromotionSection({ locale }: { locale: string }) {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data } = await supabase
    .from("promotions")
    .select("*")
    .gte("valid_to", today)
    .order("display_order", { ascending: true });

  const promotions = data ?? [];
  if (promotions.length === 0) return null;

  const t = await getTranslations({ locale, namespace: "promotions" });

  const items = promotions.map((p) => {
    const fromFormatted = p.valid_from.split("-").reverse().join(".");
    const toFormatted = p.valid_to.split("-").reverse().join(".");
    return {
      id: p.id,
      title: locale === "en" ? p.title_en : p.title_bg,
      description: locale === "en" ? p.description_en : p.description_bg,
      price: p.price,
      dateRange: `${fromFormatted} – ${toFormatted}`,
      imageUrl: p.storage_path
        ? supabase.storage.from("gallery").getPublicUrl(p.storage_path).data.publicUrl
        : null,
    };
  });

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <h2 className="font-serif text-2xl text-[var(--color-espresso)] mb-6">
        {t("heading")}
      </h2>
      <PromotionGrid promotions={items} ctaLabel={t("cta")} closeLabel={t("close")} />
    </section>
  );
}
