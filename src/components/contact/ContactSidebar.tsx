import { getTranslations } from "next-intl/server";

const FB_URL =
  "https://www.facebook.com/people/%D0%A1%D1%82%D0%B0%D0%BD%D0%BE%D0%B2%D0%B5%D1%86/100063453006216/";

interface Props {
  locale: string;
  namespace: "home" | "reservationPage";
}

export default async function ContactSidebar({ locale, namespace }: Props) {
  const t = await getTranslations({ locale, namespace });

  const contacts = [
    {
      label: t("phoneLabel"),
      value: "(+359) 885 771 328",
      href: "tel:+359885771328",
    },
    {
      label: t("emailLabel"),
      value: "stanovets.eu@gmail.com",
      href: "mailto:stanovets.eu@gmail.com",
    },
    {
      label: t("facebookLabel"),
      value: "Становец / Stanovets",
      href: FB_URL,
    },
  ];

  return (
    <div className="flex flex-col gap-3 mt-6">
      {contacts.map((c) => (
        <div
          key={c.href}
          className="bg-[var(--color-linen)] rounded-xl px-4 py-3 flex flex-col"
        >
          <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-0.5">
            {c.label}
          </span>
          <a
            href={c.href}
            target={c.href.startsWith("http") ? "_blank" : undefined}
            rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="text-[var(--color-caramel)] font-semibold hover:text-[var(--color-caramel-deep)] transition-colors text-sm"
          >
            {c.value}
          </a>
        </div>
      ))}
    </div>
  );
}
