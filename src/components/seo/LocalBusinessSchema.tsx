export default function LocalBusinessSchema() {
  const schema = {
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

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
