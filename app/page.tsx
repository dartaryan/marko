import { Suspense } from "react";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { TabbedDemos } from "@/components/landing/TabbedDemos";
import { CtaSection } from "@/components/landing/CtaSection";
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
            <TabbedDemos />
            <CtaSection />
            <Features />
            <CtaSection variant="bottom" />
          </main>
        </LandingRedirectGuard>
      </Suspense>
      <Seo />
    </>
  );
}
