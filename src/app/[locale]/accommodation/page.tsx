import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import PricingTable from "@/components/pricing/PricingTable";
import { type PricingRow } from "@/types";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.accommodation" });
  return { title: t("title"), description: t("description") };
}

export default async function AccommodationPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pricing")
    .select("*")
    .order("guest_count");
  const rows = (data ?? []) as PricingRow[];

  return (
    <div>
      <section className="bg-[var(--color-espresso)] text-[var(--color-warm-white)] py-16 px-4 text-center">
        <h1 className="font-serif text-4xl text-[var(--color-candlelight)]">Настаняване</h1>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start mb-12">
          <div>
            <h2 className="font-serif text-2xl text-[var(--color-espresso)] mb-4">За гостилницата</h2>
            <p className="text-[var(--color-text-secondary)] leading-relaxed mb-3">
              Гостилница Становец е подходяща за групи до 12 човека. Разполага с 4 спални, 4 бани,
              просторна всекидневна, кухня и трапезария.
            </p>
            <p className="text-[var(--color-text-secondary)] leading-relaxed">
              СПА зоната включва вана за хидромасаж, сауна, душ кабина и фитнес уреди. Механата е с
              автентична атмосфера и е идеална за семейни събирания.
            </p>
          </div>
          <div className="bg-[var(--color-linen)] rounded-2xl p-6 space-y-3">
            <h3 className="font-serif text-lg text-[var(--color-espresso)]">Характеристики</h3>
            {["10+2 гости", "4 спални", "4 бани", "СПА зона", "Механа", "Паркинг"].map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-caramel)]" />
                {f}
              </div>
            ))}
          </div>
        </div>

        <h2 className="font-serif text-2xl text-[var(--color-espresso)] mb-6">Цени</h2>
        <PricingTable rows={rows} />
      </section>
    </div>
  );
}
