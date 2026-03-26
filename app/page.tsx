import { Suspense } from "react";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { TabbedDemos } from "@/components/landing/TabbedDemos";
import { CtaSection } from "@/components/landing/CtaSection";
import { ScrollReveal } from "@/components/landing/ScrollReveal";
import { Seo } from "@/components/landing/Seo";
import { LandingRedirectGuard } from "@/components/landing/LandingRedirectGuard";
export const runtime = "edge";

export default function LandingPage() {
  return (
    <>
      <Suspense fallback={null}>
        <LandingRedirectGuard>
          <main className="landing-warm min-h-screen">
            <Hero />
            <ScrollReveal>
              <TabbedDemos />
            </ScrollReveal>
            <ScrollReveal>
              <CtaSection />
            </ScrollReveal>
            <ScrollReveal>
              <Features />
            </ScrollReveal>
            <ScrollReveal>
              <CtaSection variant="bottom" />
            </ScrollReveal>
          </main>
        </LandingRedirectGuard>
      </Suspense>
      <Seo />
    </>
  );
}
