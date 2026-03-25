import { Languages, FileDown, Palette, Sparkles } from "lucide-react";

const features = [
  {
    title: "עברית מלאה מימין לשמאל",
    description:
      "תמיכה מושלמת ב-RTL — כותרות, פסקאות, רשימות וטבלאות מוצגים בכיוון הנכון, כולל זיהוי אוטומטי של טקסט דו-כיווני.",
    icon: Languages,
  },
  {
    title: "ייצוא מעוצב",
    description:
      "ייצאו את המסמך ל-PDF, HTML או Markdown עם שמירה מלאה על העיצוב, הצבעים והפריסה מימין לשמאל.",
    icon: FileDown,
  },
  {
    title: "ערכות עיצוב וצבעים",
    description:
      "בחרו מתוך ערכות עיצוב מובנות או צרו ערכה מותאמת אישית. מצב כהה ובהיר, חילוץ צבעים מתמונות, ועוד.",
    icon: Palette,
  },
  {
    title: "עזרת AI חכמה",
    description:
      "סיכום, תרגום, שיפור סגנון ושכתוב — ישירות מתוך העורך. כלי AI שמבינים עברית.",
    icon: Sparkles,
  },
];

export function Features() {
  return (
    <section
      style={{
        paddingBlock: "var(--space-24)",
        paddingInline: "var(--space-6)",
      }}
      aria-label="יכולות מארקו"
    >
      <h2
        style={{
          marginBlockEnd: "var(--space-12)",
          textAlign: "center",
          fontSize: "var(--text-h2)",
          fontWeight: 700,
          color: "var(--landing-heading)",
        }}
      >
        כל מה שצריך כדי לכתוב מארקדאון בעברית
      </h2>
      <div className="marko-features-grid">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div key={feature.title} className="marko-feature-card">
              <div
                style={{
                  width: "var(--space-12)",
                  height: "var(--space-12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "var(--radius-lg)",
                  background: "var(--primary-ghost-strong)",
                  marginBlockEnd: "var(--space-4)",
                }}
              >
                <Icon
                  style={{
                    width: "var(--icon-xl)",
                    height: "var(--icon-xl)",
                    strokeWidth: 1.5,
                  }}
                  className="text-primary"
                  aria-hidden="true"
                />
              </div>
              <h3
                style={{
                  marginBlockEnd: "var(--space-2)",
                  fontSize: "var(--text-h4)",
                  fontWeight: 600,
                  color: "var(--card-foreground)",
                }}
              >
                {feature.title}
              </h3>
              <p
                style={{
                  fontSize: "var(--text-body-sm)",
                  lineHeight: 1.7,
                  color: "var(--foreground-muted)",
                }}
              >
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
