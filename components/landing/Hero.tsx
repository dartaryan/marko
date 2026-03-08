import Link from "next/link";

export function Hero() {
  return (
    <section className="flex flex-col items-center justify-center px-6 py-24 text-center" aria-label="מארקו — עורך מארקדאון בעברית">
      <h1 className="text-5xl font-bold leading-tight tracking-tight text-[var(--color-h1)] sm:text-6xl">
        מארקו — עורך מארקדאון בעברית
      </h1>
      <p className="mt-6 max-w-2xl text-xl leading-relaxed text-[var(--color-secondary-text)]">
        כלי מארקדאון מתקדם עם תמיכה מלאה ב-RTL, ייצוא מעוצב ועריכה חכמה.
        כתבו מארקדאון בעברית — בדיוק כמו שצריך.
      </p>
      <Link
        href="/editor"
        className="mt-10 inline-flex items-center rounded-lg bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        aria-label="פתחו את העורך"
      >
        פתחו את העורך
      </Link>
      <p className="mt-4 text-sm text-muted-foreground">
        חינם לחלוטין. בלי הרשמה.
      </p>
    </section>
  );
}
