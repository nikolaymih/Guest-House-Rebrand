import PricingEditor from "@/components/admin/PricingEditor";

export default function AdminPricingPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl text-[var(--color-espresso)] mb-8">
        Управление на цени
      </h1>
      <PricingEditor />
    </div>
  );
}
