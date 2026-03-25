"use client";

import { useState } from "react";
import {
  PenLine,
  Sparkles,
  FileDown,
  FileText,
  FileCode,
  Wand2,
} from "lucide-react";

interface Tab {
  id: string;
  label: string;
  title: string;
  description: string;
}

const TABS: Tab[] = [
  {
    id: "write",
    label: "כתיבה",
    title: "כתבו מארקדאון בעברית",
    description:
      "עורך חכם עם תמיכה מלאה ב-RTL, זיהוי אוטומטי של כיוון טקסט, וסרגל כלים אינטואיטיבי.",
  },
  {
    id: "format",
    label: "עיצוב",
    title: "עיצוב מיידי ומרשים",
    description:
      "ערכות עיצוב מובנות, התאמה אישית של צבעים, ומצב כהה — המסמך שלכם תמיד נראה מושלם.",
  },
  {
    id: "ai",
    label: "AI",
    title: "עזרת AI חכמה",
    description:
      "סיכום, תרגום, שיפור סגנון ושכתוב — ישירות מתוך העורך. AI שמבין עברית.",
  },
  {
    id: "export",
    label: "ייצוא",
    title: "ייצוא לכל פורמט",
    description:
      "ייצאו ל-PDF, HTML או Markdown עם שמירה על העיצוב, הצבעים והכיוון.",
  },
];

function WriteDemo() {
  return (
    <div
      dir="rtl"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "var(--space-4)",
        fontSize: "var(--text-body-sm)",
      }}
      className="landing-tab-demo-grid"
    >
      {/* Editor side */}
      <div
        style={{
          background: "var(--surface-raised)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-4)",
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-code)",
          lineHeight: 1.8,
          color: "var(--foreground-muted)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <div style={{ color: "var(--primary)", fontWeight: 600 }}>
          # כותרת ראשית
        </div>
        <div style={{ marginBlockStart: "var(--space-1)" }}>
          פסקה עם <span style={{ fontWeight: 700 }}>**טקסט מודגש**</span>{" "}
          וגם <span style={{ fontStyle: "italic" }}>*טקסט נטוי*</span>
        </div>
        <div
          style={{ marginBlockStart: "var(--space-1)", color: "var(--foreground-muted)" }}
        >
          - פריט ראשון ברשימה
        </div>
        <div style={{ color: "var(--foreground-muted)" }}>
          - פריט שני ברשימה
        </div>
      </div>
      {/* Preview side */}
      <div
        style={{
          background: "var(--surface)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-4)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <h4
          style={{
            fontSize: "1.2rem",
            fontWeight: 700,
            color: "var(--primary)",
            borderBlockEnd: "2px solid var(--primary)",
            paddingBlockEnd: "var(--space-1)",
            marginBlockEnd: "var(--space-2)",
          }}
        >
          כותרת ראשית
        </h4>
        <p
          style={{
            lineHeight: 1.7,
            color: "var(--foreground)",
            marginBlockEnd: "var(--space-2)",
          }}
        >
          פסקה עם <strong>טקסט מודגש</strong> וגם <em>טקסט נטוי</em>
        </p>
        <ul
          style={{
            paddingInlineStart: "var(--space-5)",
            color: "var(--foreground)",
            lineHeight: 1.7,
          }}
        >
          <li>פריט ראשון ברשימה</li>
          <li>פריט שני ברשימה</li>
        </ul>
      </div>
    </div>
  );
}

function FormatDemo() {
  return (
    <div
      style={{
        display: "flex",
        gap: "var(--space-4)",
        alignItems: "center",
        justifyContent: "center",
      }}
      className="landing-tab-demo-format"
    >
      {/* Before */}
      <div
        dir="rtl"
        style={{
          flex: 1,
          background: "var(--surface-raised)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-4)",
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-code)",
          lineHeight: 1.8,
          color: "var(--foreground-muted)",
          border: "1px solid var(--border-subtle)",
          textAlign: "start",
        }}
      >
        <div
          style={{
            fontSize: "var(--text-caption)",
            textTransform: "uppercase",
            fontWeight: 600,
            letterSpacing: "0.05em",
            color: "var(--foreground-muted)",
            marginBlockEnd: "var(--space-2)",
            fontFamily: "var(--font-body)",
          }}
        >
          לפני
        </div>
        <div># כותרת</div>
        <div>טקסט רגיל בלי עיצוב</div>
        <div>&gt; ציטוט</div>
      </div>
      {/* Arrow */}
      <div
        style={{
          fontSize: "1.5rem",
          color: "var(--primary)",
          flexShrink: 0,
        }}
        aria-hidden="true"
      >
        ←
      </div>
      {/* After */}
      <div
        dir="rtl"
        style={{
          flex: 1,
          background: "var(--surface)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-4)",
          border: "2px solid var(--primary)",
          textAlign: "start",
        }}
      >
        <div
          style={{
            fontSize: "var(--text-caption)",
            textTransform: "uppercase",
            fontWeight: 600,
            letterSpacing: "0.05em",
            color: "var(--foreground-muted)",
            marginBlockEnd: "var(--space-2)",
          }}
        >
          אחרי
        </div>
        <h4
          style={{
            fontSize: "1.1rem",
            fontWeight: 700,
            color: "var(--color-emerald-900)",
            borderBlockEnd: "2px solid var(--primary)",
            paddingBlockEnd: "var(--space-1)",
            marginBlockEnd: "var(--space-2)",
          }}
        >
          כותרת
        </h4>
        <p
          style={{
            fontSize: "var(--text-body-sm)",
            color: "var(--foreground)",
            marginBlockEnd: "var(--space-2)",
            lineHeight: 1.7,
          }}
        >
          טקסט רגיל בלי עיצוב
        </p>
        <blockquote
          style={{
            borderInlineStart: "3px solid var(--primary)",
            background: "var(--primary-ghost)",
            padding: "var(--space-2) var(--space-3)",
            margin: 0,
            borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
            fontStyle: "italic",
            color: "var(--foreground-muted)",
            fontSize: "var(--text-body-sm)",
          }}
        >
          ציטוט
        </blockquote>
      </div>
    </div>
  );
}

function AiDemo() {
  return (
    <div
      dir="rtl"
      style={{
        maxWidth: "420px",
        marginInline: "auto",
      }}
    >
      {/* Simulated AI command bar */}
      <div
        style={{
          background: "var(--surface)",
          borderRadius: "var(--radius-xl)",
          border: "2px solid var(--primary)",
          boxShadow: "var(--shadow-3)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            padding: "var(--space-3) var(--space-4)",
            borderBlockEnd: "1px solid var(--border-subtle)",
          }}
        >
          <Sparkles
            style={{
              width: "var(--icon-md)",
              height: "var(--icon-md)",
              color: "var(--primary)",
            }}
            aria-hidden="true"
          />
          <span
            style={{
              fontSize: "var(--text-body-sm)",
              fontWeight: 600,
              color: "var(--foreground)",
            }}
          >
            עזרת AI
          </span>
        </div>
        <div style={{ padding: "var(--space-2)" }}>
          {[
            { icon: Wand2, label: "שפר את הסגנון" },
            { icon: FileText, label: "סכם את המסמך" },
            { icon: PenLine, label: "תרגם לאנגלית" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-3)",
                  padding: "var(--space-2-5) var(--space-3)",
                  borderRadius: "var(--radius-md)",
                  cursor: "default",
                  fontSize: "var(--text-body-sm)",
                  color: "var(--foreground)",
                }}
              >
                <Icon
                  style={{
                    width: "var(--icon-sm)",
                    height: "var(--icon-sm)",
                    color: "var(--foreground-muted)",
                  }}
                  aria-hidden="true"
                />
                {item.label}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ExportDemo() {
  const formats = [
    { label: "PDF", icon: FileDown, color: "var(--destructive)" },
    { label: "HTML", icon: FileCode, color: "var(--info)" },
    { label: "Markdown", icon: FileText, color: "var(--primary)" },
  ];

  return (
    <div
      style={{
        display: "flex",
        gap: "var(--space-6)",
        justifyContent: "center",
        flexWrap: "wrap",
      }}
    >
      {formats.map((fmt) => {
        const Icon = fmt.icon;
        return (
          <div
            key={fmt.label}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "var(--space-3)",
              padding: "var(--space-6) var(--space-8)",
              background: "var(--surface)",
              borderRadius: "var(--radius-xl)",
              border: "2px solid var(--border-subtle)",
              boxShadow: "var(--shadow-2)",
              minWidth: "120px",
            }}
          >
            <Icon
              style={{
                width: "var(--icon-2xl)",
                height: "var(--icon-2xl)",
                color: fmt.color,
              }}
              aria-hidden="true"
            />
            <span
              style={{
                fontWeight: 600,
                fontSize: "var(--text-body)",
                color: "var(--foreground)",
              }}
            >
              {fmt.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

const TAB_DEMOS: Record<string, () => React.JSX.Element> = {
  write: WriteDemo,
  format: FormatDemo,
  ai: AiDemo,
  export: ExportDemo,
};

export function TabbedDemos() {
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const ActiveDemo = activeTab ? TAB_DEMOS[activeTab] : null;

  return (
    <section
      id="demos"
      style={{
        paddingBlock: "var(--space-24)",
        paddingInline: "var(--space-6)",
      }}
      aria-label="הדגמות יכולות מארקו"
    >
      <h2
        style={{
          textAlign: "center",
          fontSize: "var(--text-h2)",
          fontWeight: 700,
          color: "var(--landing-heading)",
          marginBlockEnd: "var(--space-4)",
        }}
      >
        ראו איך זה עובד
      </h2>
      <p
        style={{
          textAlign: "center",
          fontSize: "var(--text-body)",
          lineHeight: 1.6,
          color: "var(--landing-subtext)",
          maxWidth: "540px",
          marginInline: "auto",
          marginBlockEnd: "var(--space-10)",
        }}
      >
        לחצו על כל טאב כדי לגלות את היכולות של מארקו.
      </p>

      {/* Tab bar */}
      <div
        className="landing-tab-bar"
        role="toolbar"
        aria-label="הדגמות"
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "var(--space-2)",
          marginBlockEnd: "var(--space-8)",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            aria-expanded={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            onClick={() => setActiveTab(activeTab === tab.id ? null : tab.id)}
            className={`landing-tab-btn ${activeTab === tab.id ? "landing-tab-btn--active" : ""}`}
            style={{
              padding: "var(--space-2-5) var(--space-5)",
              borderRadius: "var(--radius-pill)",
              border: "2px solid",
              borderColor:
                activeTab === tab.id
                  ? "var(--primary)"
                  : "var(--border-subtle)",
              background:
                activeTab === tab.id
                  ? "var(--primary)"
                  : "var(--surface)",
              color:
                activeTab === tab.id
                  ? "var(--primary-foreground)"
                  : "var(--foreground)",
              fontWeight: 600,
              fontSize: "var(--text-body-sm)",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.2s ease",
              minHeight: "44px",
              minWidth: "44px",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Demo panel */}
      {activeTab && ActiveDemo && (
        <div
          role="region"
          id={`tabpanel-${activeTab}`}
          aria-label={TABS.find((t) => t.id === activeTab)?.title}
          style={{
            maxWidth: "800px",
            marginInline: "auto",
          }}
        >
          <div style={{ textAlign: "center", marginBlockEnd: "var(--space-6)" }}>
            <h3
              style={{
                fontSize: "var(--text-h3)",
                fontWeight: 700,
                color: "var(--landing-heading)",
                marginBlockEnd: "var(--space-2)",
              }}
            >
              {TABS.find((t) => t.id === activeTab)?.title}
            </h3>
            <p
              style={{
                fontSize: "var(--text-body-sm)",
                lineHeight: 1.6,
                color: "var(--landing-subtext)",
              }}
            >
              {TABS.find((t) => t.id === activeTab)?.description}
            </p>
          </div>
          <ActiveDemo />
        </div>
      )}
    </section>
  );
}
