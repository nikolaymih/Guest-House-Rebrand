import type { Metadata } from "next";
import { cache } from "react";
import { DM_Serif_Display, Nunito } from "next/font/google";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";

const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
});

const getSiteSettings = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("favicon_url")
    .eq("id", 1)
    .maybeSingle();
  return data;
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: "Guest House Stanovets",
    description: "Guest house website",
    ...(settings?.favicon_url ? { icons: { icon: settings.favicon_url } } : {}),
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bg" className={`${dmSerifDisplay.variable} ${nunito.variable}`}>
      <body className="flex flex-col min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
