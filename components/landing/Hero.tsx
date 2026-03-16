import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function Hero() {
  return (
    <section
      className="flex flex-col items-center justify-center text-center animate-fade-in"
      style={{
        paddingTop: "calc(var(--header-height) + var(--space-20))",
        paddingBottom: "var(--space-24)",
        paddingInline: "var(--space-6)",
      }}
      aria-label="מארקו — עורך מארקדאון בעברית"
    >
      <div style={{ maxWidth: "800px" }}>
        <h1
          style={{
            fontSize: "var(--text-display)",
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
            color: "#FFFFFF",
          }}
        >
          מארקו — עורך מארקדאון בעברית
        </h1>
        <p
          style={{
            marginTop: "var(--space-6)",
            fontSize: "var(--text-h3)",
            lineHeight: 1.6,
            color: "var(--color-emerald-200)",
            maxWidth: "640px",
            marginInline: "auto",
          }}
        >
          כלי מארקדאון מתקדם עם תמיכה מלאה ב-RTL, ייצוא מעוצב ועריכה חכמה.
          כתבו מארקדאון בעברית — בדיוק כמו שצריך.
        </p>
        <Link
          href="/editor"
          className="marko-hero-cta animate-slide-in"
          aria-label="פתחו את העורך"
        >
          <span>פתחו את העורך</span>
          <ArrowLeft style={{ width: "var(--icon-md)", height: "var(--icon-md)" }} />
        </Link>
        <p
          style={{
            marginTop: "var(--space-4)",
            fontSize: "var(--text-body-sm)",
            color: "var(--color-emerald-300)",
          }}
        >
          חינם לחלוטין. בלי הרשמה.
        </p>
      </div>
    </section>
  );
}
