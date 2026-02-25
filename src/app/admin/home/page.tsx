import HomeContentEditor from "@/components/admin/HomeContentEditor";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Начало — Администрация | Становец",
};

export default function AdminHomePage() {
  return (
    <div>
      <h1 className="font-serif text-3xl text-[var(--color-espresso)] mb-6">Начало</h1>
      <HomeContentEditor />
    </div>
  );
}
