"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";

const links = [
  { href: "/admin/home", label: "Начало" },
  { href: "/admin/accommodation", label: "Настаняване" },
  { href: "/admin/gallery", label: "Галерия" },
  { href: "/admin/promotions", label: "Промоции" },
  { href: "/admin/landmarks", label: "Забележителности" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-6 text-sm font-medium">
      {links.map(({ href, label }) => {
        const isActive = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={
              isActive
                ? "text-[var(--color-candlelight)] border-b border-[var(--color-candlelight)] pb-0.5"
                : "text-[var(--color-parchment)] hover:text-[var(--color-candlelight)] transition-colors"
            }
          >
            {label}
          </Link>
        );
      })}
      <LogoutButton />
    </nav>
  );
}
