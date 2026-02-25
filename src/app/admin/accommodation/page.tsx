"use client";

import { useState } from "react";
import AccommodationContentEditor from "@/components/admin/AccommodationContentEditor";
import PricingEditor from "@/components/admin/PricingEditor";

type Tab = "content" | "pricing";

const TABS: { id: Tab; label: string }[] = [
  { id: "content", label: "Съдържание" },
  { id: "pricing", label: "Цени" },
];

export default function AdminAccommodationPage() {
  const [tab, setTab] = useState<Tab>("content");

  return (
    <div>
      <h1 className="font-serif text-3xl text-[var(--color-espresso)] mb-6">
        Управление на настаняване
      </h1>

      <div className="flex flex-wrap gap-2 mb-8 pb-4">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
              tab === id
                ? "bg-[var(--color-espresso)] text-white"
                : "bg-[var(--color-linen)] text-[var(--color-text-secondary)] hover:bg-[var(--color-oatmeal)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "content" && <AccommodationContentEditor />}
      {tab === "pricing" && <PricingEditor />}
    </div>
  );
}
