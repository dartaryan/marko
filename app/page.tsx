import { Suspense } from "react";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Demo } from "@/components/landing/Demo";
import { Seo } from "@/components/landing/Seo";
import { LandingRedirectGuard } from "@/components/landing/LandingRedirectGuard";
export const runtime = "edge";

export default function LandingPage() {
  return (
    <>
      <Suspense fallback={null}>
        <LandingRedirectGuard>
          <main className="landing-gradient min-h-screen">
            <Hero />
            <Features />
            <Demo />
          </main>
        </LandingRedirectGuard>
      </Suspense>
      <Seo />
    </>
  );
}
