import Link from "next/link";
import type { Metadata } from "next";
import AdminNav from "@/components/admin/AdminNav";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admin — Становец",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      <div className="bg-[var(--color-espresso)] px-6 py-4 flex items-center justify-between">
        <Link
          href="/admin/home"
          className="font-serif text-lg text-[var(--color-candlelight)] hover:opacity-90 transition-opacity"
        >
          Становец — Администрация
        </Link>
        {user && <AdminNav />}
      </div>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {children}
      </main>
    </div>
  );
}
