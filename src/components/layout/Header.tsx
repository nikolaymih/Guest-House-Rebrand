import { getTranslations } from "next-intl/server";
import Link from "next/link";
import NavBar from "./NavBar";
import LanguageSwitcher from "./LanguageSwitcher";
import MobileMenu from "./MobileMenu";
import { createClient } from "@/lib/supabase/server";

export default async function Header() {
  const t = await getTranslations("header");

  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("site_settings")
    .select("logo_url")
    .eq("id", 1)
    .maybeSingle();
  const logoUrl = settings?.logo_url ?? null;

  return (
    <header className="sticky top-0 z-50 bg-[var(--color-espresso)] shadow-[var(--shadow-medium)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <Link
            href="/"
            className="font-serif text-xl text-[var(--color-candlelight)] hover:opacity-90 transition-opacity flex items-center"
            aria-label="Становец"
          >
            {logoUrl
              ? <img src={logoUrl} alt="Становец" className="h-16 w-auto object-contain" />
              : "Становец"
            }
          </Link>

          <NavBar />

          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-[var(--color-text-muted)] leading-none mb-0.5">
                {t("phone_label")}
              </p>
              <a
                href={`tel:${t("phone").replace(/\s/g, "")}`}
                className="text-sm font-semibold text-[var(--color-candlelight)] hover:text-[var(--color-amber-glow)] transition-colors"
              >
                {t("phone")}
              </a>
            </div>
            <LanguageSwitcher />
          </div>

          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
