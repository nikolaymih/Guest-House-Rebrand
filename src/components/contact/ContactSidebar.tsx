import { getTranslations } from "next-intl/server";

const FB_URL = "https://www.facebook.com/p/%D0%9A%D1%8A%D1%89%D0%B0-%D0%B7%D0%B0-%D0%B3%D0%BE%D1%81%D1%82%D0%B8%D0%A1%D1%82%D0%B0%D0%BD%D0%BE%D0%B2%D0%B5%D1%86-100088378700640/";
const IG_URL = "https://www.instagram.com/stanovets.guesthouse/";

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
    {
      label: t("instagramLabel"),
      value: "@stanovets.guesthouse",
      href: IG_URL,
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
