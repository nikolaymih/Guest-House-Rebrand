import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — Становец",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      <div className="bg-[var(--color-espresso)] px-6 py-4 flex items-center justify-between">
        <Link
          href="/admin/home"
          className="font-serif text-lg text-[var(--color-candlelight)] hover:opacity-90 transition-opacity"
        >
          Становец — Администрация
        </Link>
        <nav className="flex gap-6 text-sm font-medium">
          <Link
            href="/admin/home"
            className="text-[var(--color-parchment)] hover:text-[var(--color-candlelight)] transition-colors"
          >
            Начало
          </Link>
          <Link
            href="/admin/accommodation"
            className="text-[var(--color-parchment)] hover:text-[var(--color-candlelight)] transition-colors"
          >
            Настаняване
          </Link>
          <Link
            href="/admin/gallery"
            className="text-[var(--color-parchment)] hover:text-[var(--color-candlelight)] transition-colors"
          >
            Галерия
          </Link>
          <Link
            href="/admin/landmarks"
            className="text-[var(--color-parchment)] hover:text-[var(--color-candlelight)] transition-colors"
          >
            Забележителности
          </Link>
        </nav>
      </div>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {children}
      </main>
    </div>
  );
}
