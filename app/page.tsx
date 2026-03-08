import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Demo } from "@/components/landing/Demo";
import { Seo } from "@/components/landing/Seo";

export const runtime = "edge";

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
      <Seo />
    </>
  );
}
