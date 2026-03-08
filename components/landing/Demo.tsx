// sampleMarkdown and samplePreview must stay in sync — update both when changing demo content
const sampleMarkdown = `# ברוכים הבאים למארקו 🎉

מארקו הוא **עורך מארקדאון עברי** עם תמיכה מלאה ב-RTL.

## יכולות עיקריות

- ✅ תמיכה מושלמת בעברית
- ✅ ייצוא ל-PDF, HTML ו-Markdown
- ✅ ערכות עיצוב וצבעים
- ✅ דיאגרמות Mermaid
- ✅ כלי AI חכמים`;

const samplePreview = `<h1>ברוכים הבאים למארקו 🎉</h1>
<p>מארקו הוא <strong>עורך מארקדאון עברי</strong> עם תמיכה מלאה ב-RTL.</p>
<h2>יכולות עיקריות</h2>
<ul>
<li>✅ תמיכה מושלמת בעברית</li>
<li>✅ ייצוא ל-PDF, HTML ו-Markdown</li>
<li>✅ ערכות עיצוב וצבעים</li>
<li>✅ דיאגרמות Mermaid</li>
<li>✅ כלי AI חכמים</li>
</ul>`;

export function Demo() {
  return (
    <section className="px-6 py-20" aria-label="דוגמה לעריכה">
      <h2 className="mb-8 text-center text-3xl font-bold text-[var(--color-h2)] sm:text-4xl">
        עריכה ותצוגה מקדימה — זה לצד זה
      </h2>
      <p className="mx-auto mb-10 max-w-2xl text-center text-[var(--color-secondary-text)]">
        כתבו מארקדאון בצד אחד וראו את התוצאה המעוצבת בצד השני, בזמן אמת.
      </p>
      <div className="mx-auto grid max-w-5xl gap-0 overflow-hidden rounded-xl border border-border shadow-lg sm:grid-cols-2">
        {/* Editor pane */}
        <div className="border-b border-border bg-muted/30 sm:border-b-0 sm:border-e">
          <div className="border-b border-border px-4 py-2">
            <span className="text-xs font-medium text-muted-foreground">
              עורך
            </span>
          </div>
          <pre
            className="p-4 text-sm leading-relaxed text-[var(--color-primary-text)]"
            dir="rtl"
            aria-label="דוגמה לקוד מארקדאון"
          >
            <code>{sampleMarkdown}</code>
          </pre>
        </div>
        {/* Preview pane */}
        <div className="bg-[var(--color-preview-bg)]">
          <div className="border-b border-border px-4 py-2">
            <span className="text-xs font-medium text-muted-foreground">
              תצוגה מקדימה
            </span>
          </div>
          <div
            className="preview-content p-4 text-sm leading-relaxed"
            dir="rtl"
            aria-label="תצוגה מקדימה של מארקדאון מעוצב"
            dangerouslySetInnerHTML={{ __html: samplePreview }}
          />
        </div>
      </div>
    </section>
  );
}
