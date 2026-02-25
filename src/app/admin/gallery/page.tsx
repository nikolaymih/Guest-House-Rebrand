"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AdminGalleryManager from "@/components/admin/AdminGalleryManager";

type AdminSection = "gallery" | "hero" | "welcome";

const SECTIONS: { id: AdminSection; label: string }[] = [
  { id: "gallery", label: "Галерия" },
  { id: "hero", label: "Заглавни снимки" },
  { id: "welcome", label: "Заповядайте при нас" },
];

const VALID: Set<string> = new Set(SECTIONS.map((s) => s.id));

function AdminGalleryPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const raw = searchParams.get("tab") ?? "gallery";
  const activeSection = (VALID.has(raw) ? raw : "gallery") as AdminSection;

  function setActiveSection(id: AdminSection) {
    router.push(`?tab=${id}`, { scroll: false });
  }

  return (
    <div>
      <h1 className="font-serif text-3xl text-[var(--color-espresso)] mb-6">
        Управление на галерия
      </h1>

      {/* Section tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-[var(--color-border)] pb-4">
        {SECTIONS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
              activeSection === id
                ? "bg-[var(--color-espresso)] text-white"
                : "bg-[var(--color-linen)] text-[var(--color-text-secondary)] hover:bg-[var(--color-oatmeal)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeSection === "gallery" && <AdminGalleryManager />}
      {activeSection === "hero" && (
        <div>
          <p className="text-sm text-[var(--color-text-muted)] mb-6">
            Снимките от тази категория се показват в каруселa на началната страница.
          </p>
          <AdminGalleryManager categories={["overview"]} />
        </div>
      )}
      {activeSection === "welcome" && (
        <div>
          <p className="text-sm text-[var(--color-text-muted)] mb-6">
            Снимките от тази категория се показват в секция „Заповядайте при нас" на началната страница (показват се до 3 снимки).
          </p>
          <AdminGalleryManager categories={["welcome"]} />
        </div>
      )}
    </div>
  );
}

export default function AdminGalleryPage() {
  return (
    <Suspense>
      <AdminGalleryPageInner />
    </Suspense>
  );
}
