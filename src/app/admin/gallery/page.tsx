"use client";

import { useState } from "react";
import AdminGalleryManager from "@/components/admin/AdminGalleryManager";
import AdminLandmarkManager from "@/components/admin/AdminLandmarkManager";

type AdminSection = "gallery" | "hero" | "welcome" | "landmarks";

const SECTIONS: { id: AdminSection; label: string }[] = [
  { id: "gallery", label: "Галерия" },
  { id: "hero", label: "Заглавни снимки" },
  { id: "welcome", label: "Заповядайте при нас" },
  { id: "landmarks", label: "Забележителности" },
];

export default function AdminGalleryPage() {
  const [activeSection, setActiveSection] = useState<AdminSection>("gallery");

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

      {activeSection === "gallery" && (
        <AdminGalleryManager />
      )}
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
      {activeSection === "landmarks" && (
        <div>
          <p className="text-sm text-[var(--color-text-muted)] mb-6">
            По една снимка за всяка забележителност, показвана на детайлната страница.
          </p>
          <AdminLandmarkManager />
        </div>
      )}
    </div>
  );
}
