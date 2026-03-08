const features = [
  {
    title: "עברית מלאה מימין לשמאל",
    description:
      "תמיכה מושלמת ב-RTL — כותרות, פסקאות, רשימות וטבלאות מוצגים בכיוון הנכון, כולל זיהוי אוטומטי של טקסט דו-כיווני.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M17 6H3" />
        <path d="M21 12H8" />
        <path d="M21 18H8" />
        <path d="m3 12 3-3-3-3" />
      </svg>
    ),
  },
  {
    title: "ייצוא מעוצב",
    description:
      "ייצאו את המסמך ל-PDF, HTML או Markdown עם שמירה מלאה על העיצוב, הצבעים והפריסה מימין לשמאל.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="12" y1="18" x2="12" y2="12" />
        <line x1="9" y1="15" x2="12" y2="18" />
        <line x1="15" y1="15" x2="12" y2="18" />
      </svg>
    ),
  },
  {
    title: "ערכות עיצוב וצבעים",
    description:
      "בחרו מתוך ערכות עיצוב מובנות או צרו ערכה מותאמת אישית. מצב כהה ובהיר, חילוץ צבעים מתמונות, ועוד.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <circle cx="13.5" cy="6.5" r="2.5" />
        <circle cx="6.5" cy="13.5" r="2.5" />
        <circle cx="17.5" cy="17.5" r="2.5" />
        <path d="M8.5 6.5h8" />
        <path d="M15.5 13.5h4" />
        <path d="M4 17.5h5" />
      </svg>
    ),
  },
  {
    title: "עזרת AI חכמה",
    description:
      "סיכום, תרגום, שיפור סגנון ושכתוב — ישירות מתוך העורך. כלי AI שמבינים עברית.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93" />
        <path d="M8.24 4.47A4 4 0 0 1 12 2" />
        <path d="M12 22v-6" />
        <path d="m9 19 3 3 3-3" />
        <path d="M4 12h16" />
        <circle cx="12" cy="12" r="1" />
      </svg>
    ),
  },
] as const;

export function Features() {
  return (
    <section className="px-6 py-20" aria-label="יכולות מארקו">
      <h2 className="mb-12 text-center text-3xl font-bold text-[var(--color-h2)] sm:text-4xl">
        כל מה שצריך כדי לכתוב מארקדאון בעברית
      </h2>
      <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {feature.icon}
            </div>
            <h3 className="mb-2 text-lg font-semibold text-[var(--color-h3)]">
              {feature.title}
            </h3>
            <p className="text-sm leading-relaxed text-[var(--color-secondary-text)]">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
