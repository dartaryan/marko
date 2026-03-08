import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Demo } from "@/components/landing/Demo";
import { SITE_URL } from "@/lib/constants";

export const runtime = "edge";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "מארקו",
  description: "עורך מארקדאון עברי עם תמיכה מלאה ב-RTL וייצוא מעוצב",
  url: SITE_URL,
  applicationCategory: "Multimedia",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "ILS" },
  inLanguage: "he",
};

export default function LandingPage() {
  return (
    <>
      <main className="min-h-screen">
        <Hero />
        <Features />
        <Demo />
      </main>
      <footer className="border-t border-border px-6 py-8 text-center text-sm text-muted-foreground">
        <p>מארקו — כלי מארקדאון חינמי בעברית</p>
      </footer>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
