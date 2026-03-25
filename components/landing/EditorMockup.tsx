"use client";

import { useState, useEffect, useCallback } from "react";
import { CURATED_THEMES } from "@/lib/colors/themes";
import type { Theme } from "@/types/colors";

const LANDING_THEME_IDS = ["green-meadow", "sea-of-galilee", "minimal-gray", "negev-night", "ocean-deep"];
const LANDING_THEMES: Theme[] = LANDING_THEME_IDS
  .map((id) => CURATED_THEMES.find((t) => t.id === id))
  .filter((t): t is Theme => t !== undefined);

const CYCLE_INTERVAL = 3500;

export function EditorMockup() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [cycling, setCycling] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
      if (e.matches) setCycling(false);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!cycling || reducedMotion) return;
    const id = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % LANDING_THEMES.length);
    }, CYCLE_INTERVAL);
    return () => clearInterval(id);
  }, [cycling, reducedMotion]);

  const handleDotClick = useCallback((index: number) => {
    setActiveIndex(index);
    setCycling(false);
  }, []);

  const theme = LANDING_THEMES[activeIndex];
  const colors = theme.colors;

  return (
    <div
      className="landing-mockup-container"
      style={{
        maxWidth: "620px",
        width: "100%",
        marginInline: "auto",
        borderRadius: "var(--radius-2xl)",
        boxShadow: "var(--shadow-4)",
        overflow: "hidden",
        transition: reducedMotion ? "none" : "background-color 1.2s ease-in-out, border-color 1.2s ease-in-out",
        background: colors.previewBg,
        border: `2px solid ${colors.h1Border}`,
      }}
      aria-label="תצוגת עורך מארקו עם ערכות עיצוב"
    >
      {/* Title bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-2)",
          padding: "var(--space-2-5) var(--space-4)",
          background: colors.codeBg,
          transition: reducedMotion ? "none" : "background 1.2s ease-in-out",
        }}
      >
        <div style={{ display: "flex", gap: "6px" }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#FF5F56",
            }}
          />
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#FFBD2E",
            }}
          />
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#27C93F",
            }}
          />
        </div>
        <span
          style={{
            fontSize: "var(--text-caption)",
            color: colors.secondaryText,
            opacity: 0.7,
            marginInlineStart: "auto",
            transition: reducedMotion ? "none" : "color 1.2s ease-in-out",
          }}
        >
          marko
        </span>
      </div>

      {/* Mockup content */}
      <div
        dir="rtl"
        style={{
          padding: "var(--space-5) var(--space-6)",
          fontFamily: "var(--font-body)",
          transition: reducedMotion ? "none" : "background 1.2s ease-in-out",
          background: colors.previewBg,
        }}
      >
        <h3
          style={{
            fontSize: "1.4rem",
            fontWeight: 700,
            color: colors.h1,
            borderBlockEnd: `3px solid ${colors.h1Border}`,
            paddingBlockEnd: "var(--space-2)",
            marginBlockEnd: "var(--space-3)",
            transition: reducedMotion ? "none" : "color 1.2s ease-in-out, border-color 1.2s ease-in-out",
          }}
        >
          ברוכים הבאים
        </h3>
        <p
          style={{
            fontSize: "var(--text-body-sm)",
            lineHeight: 1.7,
            color: colors.primaryText,
            marginBlockEnd: "var(--space-3)",
            transition: reducedMotion ? "none" : "color 1.2s ease-in-out",
          }}
        >
          מארקו הוא עורך מארקדאון מתקדם עם תמיכה מלאה בעברית.
        </p>
        <blockquote
          style={{
            borderInlineStart: `4px solid ${colors.blockquoteBorder}`,
            background: colors.blockquoteBg,
            padding: "var(--space-3) var(--space-4)",
            marginBlockEnd: "var(--space-3)",
            marginInline: 0,
            borderRadius: "0 var(--radius-md) var(--radius-md) 0",
            transition: reducedMotion
              ? "none"
              : "border-color 1.2s ease-in-out, background 1.2s ease-in-out",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "var(--text-body-sm)",
              color: colors.secondaryText,
              fontStyle: "italic",
              transition: reducedMotion ? "none" : "color 1.2s ease-in-out",
            }}
          >
            ציטוט לדוגמה — כי גם ציטוטים מגיעים מימין
          </p>
        </blockquote>
        <pre
          style={{
            background: colors.codeBg,
            padding: "var(--space-3) var(--space-4)",
            borderRadius: "var(--radius-md)",
            direction: "ltr",
            overflow: "hidden",
            transition: reducedMotion ? "none" : "background 1.2s ease-in-out",
          }}
        >
          <code
            style={{
              fontSize: "var(--text-code)",
              fontFamily: "var(--font-mono)",
              color: colors.code,
              transition: reducedMotion ? "none" : "color 1.2s ease-in-out",
            }}
          >
            {`const hello = "שלום עולם";`}
          </code>
        </pre>
      </div>

      {/* Theme dots */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "var(--space-2)",
          padding: "var(--space-3)",
          background: colors.previewBg,
          transition: reducedMotion ? "none" : "background 1.2s ease-in-out",
        }}
      >
        {LANDING_THEMES.map((t, i) => (
          <button
            key={t.id}
            onClick={() => handleDotClick(i)}
            aria-label={`ערכת עיצוב ${t.hebrewName}`}
            aria-pressed={i === activeIndex}
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              border: "2px solid",
              borderColor:
                i === activeIndex ? t.colors.h1Border : "transparent",
              background: t.colors.h1Border,
              cursor: "pointer",
              padding: 0,
              transition: "transform 0.2s ease, border-color 0.2s ease",
              transform: i === activeIndex ? "scale(1.3)" : "scale(1)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
