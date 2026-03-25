"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

export function CtaSection({ variant = "default" }: { variant?: "default" | "bottom" }) {
  const { isSignedIn } = useAuth();
  const ctaText = isSignedIn === true ? "פתח את מארקו" : "התחל בחינם";
  const ctaHref = "/editor";

  return (
    <section
      className="landing-cta-section"
      style={{
        paddingBlock: variant === "bottom" ? "var(--space-24)" : "var(--space-16)",
        paddingInline: "var(--space-6)",
        textAlign: "center",
      }}
      aria-label="התחילו להשתמש במארקו"
    >
      <div
        style={{
          maxWidth: "600px",
          marginInline: "auto",
        }}
      >
        {variant === "bottom" && (
          <h2
            style={{
              fontSize: "var(--text-h2)",
              fontWeight: 700,
              color: "var(--landing-heading)",
              marginBlockEnd: "var(--space-4)",
            }}
          >
            מוכנים להתחיל?
          </h2>
        )}
        <p
          style={{
            fontSize: "var(--text-body)",
            lineHeight: 1.6,
            color: "var(--landing-subtext)",
            marginBlockEnd: "var(--space-8)",
          }}
        >
          {variant === "bottom"
            ? "הצטרפו לאלפי משתמשים שכבר כותבים מארקדאון בעברית עם מארקו."
            : "מוכנים לנסות? התחילו לכתוב מארקדאון בעברית עכשיו."}
        </p>
        <Link
          href={ctaHref}
          className="marko-hero-cta"
          aria-label={ctaText}
        >
          {ctaText}
        </Link>
      </div>
    </section>
  );
}
