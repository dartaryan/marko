import { SITE_URL } from "@/lib/constants";

export function Seo() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "מארקו",
    description:
      "מארקו הוא עורך מארקדאון עברי עם תמיכה מלאה ב-RTL, ייצוא מעוצב ל-PDF ו-HTML, ערכות עיצוב, דיאגרמות וכלי AI חכמים. חינמי ובלי הרשמה.",
    url: SITE_URL,
    applicationCategory: "Multimedia",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "ILS" },
    inLanguage: "he",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
      }}
    />
  );
}
