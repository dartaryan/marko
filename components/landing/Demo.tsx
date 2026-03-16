// sampleMarkdown and samplePreview must stay in sync — update both when changing demo content
const sampleMarkdown = `# ברוכים הבאים למארקו
\u200F
מארקו הוא **עורך מארקדאון עברי** עם תמיכה מלאה ב-RTL.

## יכולות עיקריות

- תמיכה מושלמת בעברית
- ייצוא ל-PDF, HTML ו-Markdown
- ערכות עיצוב וצבעים
- דיאגרמות Mermaid
- כלי AI חכמים`;

const samplePreview = `<h1>ברוכים הבאים למארקו</h1>
<p>מארקו הוא <strong>עורך מארקדאון עברי</strong> עם תמיכה מלאה ב-RTL.</p>
<h2>יכולות עיקריות</h2>
<ul>
<li>תמיכה מושלמת בעברית</li>
<li>ייצוא ל-PDF, HTML ו-Markdown</li>
<li>ערכות עיצוב וצבעים</li>
<li>דיאגרמות Mermaid</li>
<li>כלי AI חכמים</li>
</ul>`;

export function Demo() {
  return (
    <section
      className="animate-fade-in"
      style={{
        paddingBlock: "var(--space-24)",
        paddingInline: "var(--space-6)",
      }}
      aria-label="דוגמה לעריכה"
    >
      <h2
        style={{
          marginBlockEnd: "var(--space-4)",
          textAlign: "center",
          fontSize: "var(--text-h2)",
          fontWeight: 700,
          color: "#FFFFFF",
        }}
      >
        עריכה ותצוגה מקדימה — זה לצד זה
      </h2>
      <p
        style={{
          marginBlockEnd: "var(--space-12)",
          textAlign: "center",
          fontSize: "var(--text-body)",
          lineHeight: 1.7,
          color: "var(--color-emerald-200)",
          maxWidth: "640px",
          marginInline: "auto",
        }}
      >
        כתבו מארקדאון בצד אחד וראו את התוצאה המעוצבת בצד השני, בזמן אמת.
      </p>
      <div
        className="marko-demo-panel"
        style={{
          maxWidth: "1200px",
          marginInline: "auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          borderRadius: "var(--radius-2xl)",
          background: "var(--surface)",
          boxShadow: "var(--shadow-3)",
          overflow: "hidden",
          transition: "box-shadow 0.3s ease",
        }}
      >
        <div
          style={{
            background: "var(--gradient-brand)",
            height: "3px",
            gridColumn: "1 / -1",
          }}
        />
        {/* Editor pane */}
        <div
          style={{
            borderInlineEnd: "1px solid var(--border-subtle)",
          }}
        >
          <div
            style={{
              padding: "var(--space-3) var(--space-4)",
              borderBottom: "1px solid var(--border-subtle)",
              background: "var(--surface-raised)",
            }}
          >
            <span
              style={{
                fontSize: "var(--text-caption)",
                fontWeight: 600,
                letterSpacing: "0.05em",
                color: "var(--foreground-muted)",
                textTransform: "uppercase",
              }}
            >
              עורך
            </span>
          </div>
          <pre
            style={{
              padding: "var(--space-4)",
              fontSize: "var(--text-code)",
              lineHeight: 1.7,
              color: "var(--foreground)",
              fontFamily: "var(--font-mono)",
              margin: 0,
            }}
            dir="rtl"
            aria-label="דוגמה לקוד מארקדאון"
          >
            <code>{sampleMarkdown}</code>
          </pre>
        </div>
        {/* Preview pane */}
        <div>
          <div
            style={{
              padding: "var(--space-3) var(--space-4)",
              borderBottom: "1px solid var(--border-subtle)",
              background: "var(--surface-raised)",
            }}
          >
            <span
              style={{
                fontSize: "var(--text-caption)",
                fontWeight: 600,
                letterSpacing: "0.05em",
                color: "var(--foreground-muted)",
                textTransform: "uppercase",
              }}
            >
              תצוגה מקדימה
            </span>
          </div>
          <div
            className="preview-content"
            style={{
              padding: "var(--space-4)",
              fontSize: "var(--text-body-sm)",
              lineHeight: 1.7,
            }}
            dir="rtl"
            aria-label="תצוגה מקדימה של מארקדאון מעוצב"
            dangerouslySetInnerHTML={{ __html: samplePreview }}
          />
        </div>
      </div>
    </section>
  );
}
