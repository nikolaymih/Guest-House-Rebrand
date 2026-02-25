"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm font-medium text-[var(--color-parchment)] hover:text-[var(--color-candlelight)] transition-colors"
    >
      Изход
    </button>
  );
}
