"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { m, useReducedMotion } from "framer-motion";
import { EditorMockup } from "./EditorMockup";

export function Hero() {
  const { isSignedIn } = useAuth();
  const shouldReduceMotion = useReducedMotion();
  const ctaText = isSignedIn === true ? "פתח את מארקו" : "התחל בחינם";
  const ctaHref = "/editor";

  const handleDemoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    document.getElementById("demos")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <m.section
      initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
      animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, ease: "easeOut" }}
      style={{
        paddingBlockStart: "calc(var(--header-height) + var(--space-16))",
        paddingBlockEnd: "var(--space-20)",
        paddingInline: "var(--space-6)",
      }}
      aria-label="מארקו — עורך מארקדאון בעברית"
    >
      <div
        style={{
          maxWidth: "900px",
          marginInline: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "var(--space-10)",
        }}
      >
        {/* Headline + CTAs */}
        <div style={{ textAlign: "center" }}>
          <h1
            style={{
              fontSize: "var(--text-display)",
              fontWeight: 700,
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              color: "var(--landing-heading)",
            }}
          >
            מארקו — עורך מארקדאון בעברית
          </h1>
          <p
            style={{
              marginBlockStart: "var(--space-5)",
              fontSize: "var(--text-h3)",
              lineHeight: 1.6,
              color: "var(--landing-subtext)",
              maxWidth: "640px",
              marginInline: "auto",
            }}
          >
            כלי מארקדאון מתקדם עם תמיכה מלאה ב-RTL, ייצוא מעוצב ועריכה חכמה.
          </p>

          {/* CTA buttons */}
          <div
            style={{
              marginBlockStart: "var(--space-10)",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "var(--space-4)",
            }}
          >
            <Link
              href={ctaHref}
              className="marko-hero-cta"
              aria-label={ctaText}
            >
              {ctaText}
            </Link>
            <a
              href="#demos"
              onClick={handleDemoClick}
              className="marko-hero-cta-secondary"
              aria-label="צפה בהדגמה"
            >
              צפה בהדגמה
            </a>
          </div>
        </div>

        {/* Editor mockup */}
        <EditorMockup />
      </div>
    </m.section>
  );
}
