import Link from "next/link";

export default function ReportBugPage() {
  return (
    <main
      dir="rtl"
      lang="he"
      className="flex min-h-screen flex-col items-center justify-center gap-4 p-8"
    >
      <h1 className="text-2xl font-bold text-foreground">דווח על בעיה</h1>
      <p className="text-foreground-muted">דף זה בבנייה. בקרוב תוכל לדווח על בעיות טכניות.</p>
      <Link
        href="/editor"
        className="text-[var(--color-emerald-500)] underline hover:text-[var(--color-emerald-400)]"
      >
        חזרה לעורך
      </Link>
    </main>
  );
}
