interface Props {
  logoUrl?: string | null;
}

export default function LocalBusinessSchema({ logoUrl }: Props) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: "Гостилница Становец",
    telephone: "+359885771328",
    email: "stanovets.eu@gmail.com",
    address: {
      "@type": "PostalAddress",
      addressCountry: "BG",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 43.49447,
      longitude: 27.039641,
    },
  };

  if (logoUrl) {
    schema.logo = logoUrl;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
