import Link from "next/link";

export default function ContactPage() {
  return (
    <main
      dir="rtl"
      lang="he"
      className="flex min-h-screen flex-col items-center justify-center gap-4 p-8"
    >
      <h1 className="text-2xl font-bold text-foreground">צור קשר</h1>
      <p className="text-foreground-muted">דף זה בבנייה. בקרוב יתווספו כאן אפשרויות יצירת קשר.</p>
      <Link
        href="/editor"
        className="text-[var(--color-emerald-500)] underline hover:text-[var(--color-emerald-400)]"
      >
        חזרה לעורך
      </Link>
    </main>
  );
}
