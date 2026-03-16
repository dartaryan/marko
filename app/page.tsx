import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Demo } from "@/components/landing/Demo";
import { Seo } from "@/components/landing/Seo";
import { Footer } from "@/components/layout/Footer";

export const runtime = "edge";

export default function LandingPage() {
  return (
    <>
      <main className="landing-gradient min-h-screen">
        <Hero />
        <Features />
        <Demo />
      </main>
      <Footer />
      <Seo />
    </>
  );
}
