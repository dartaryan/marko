"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Bug } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

function collectMetadata() {
  try {
    return {
      browser: navigator.userAgent,
      os: navigator.platform,
      screenSize: `${screen.width}×${screen.height}`,
      windowSize: `${window.innerWidth}×${window.innerHeight}`,
      url: window.location.href,
      darkMode: document.documentElement.classList.contains("dark"),
      theme: localStorage.getItem("marko-v2-active-theme") || "default",
      editorContentLength: (localStorage.getItem("marko-v2-editor-content") || "").length,
      timestamp: new Date().toISOString(),
    };
  } catch {
    return {
      browser: "unknown",
      os: "unknown",
      screenSize: "unknown",
      windowSize: "unknown",
      url: "unknown",
      darkMode: false,
      theme: "unknown",
      editorContentLength: 0,
      timestamp: new Date().toISOString(),
    };
  }
}

function formatMetadata(metadata: ReturnType<typeof collectMetadata>) {
  return `<details>
<summary>Environment Details</summary>

| Property | Value |
|----------|-------|
| Browser | ${metadata.browser} |
| OS | ${metadata.os} |
| Screen | ${metadata.screenSize} |
| Window | ${metadata.windowSize} |
| URL | ${metadata.url} |
| Dark Mode | ${metadata.darkMode} |
| Theme | ${metadata.theme} |
| Content Length | ${metadata.editorContentLength} chars |
| Timestamp | ${metadata.timestamp} |

</details>`;
}

export default function ReportBugPage() {
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState("");
  const [expected, setExpected] = useState("");
  const [screenshot, setScreenshot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const metadata = collectMetadata();

      const issueBody = `## Bug Report

### תיאור הבעיה (Description)
${description}

### צעדים לשחזור (Steps to Reproduce)
${steps || "לא צוין"}

### מה ציפית שיקרה (Expected Behavior)
${expected || "לא צוין"}

### תיאור מה שאתה רואה (Visual Description)
${screenshot || "לא צוין"}

${formatMetadata(metadata)}`;

      const response = await fetch("/api/github/create-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `[Bug] ${description.slice(0, 80)}`,
          body: issueBody,
          labels: ["bug"],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send bug report");
      }

      toast.success("הדיווח נשלח בהצלחה ✓");
      setDescription("");
      setSteps("");
      setExpected("");
      setScreenshot("");
    } catch {
      toast.error("שגיאה בשליחת הדיווח. נסה שוב.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main dir="rtl" lang="he" className="min-h-screen bg-[var(--background)] p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Back link */}
        <Link
          href="/editor"
          className="inline-flex items-center gap-1.5 text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
          aria-label="חזרה לעורך"
        >
          <ArrowRight className="size-4" aria-hidden="true" />
          <span>חזרה לעורך</span>
        </Link>

        <div className="flex items-center gap-2">
          <Bug className="size-6 text-[var(--primary)]" aria-hidden="true" />
          <h1 className="text-2xl font-bold text-foreground">דווח על בעיה</h1>
        </div>

        <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Description — required */}
            <div>
              <label htmlFor="bug-description" className="block text-sm font-medium text-foreground mb-1.5">
                תיאור הבעיה <span className="text-[var(--foreground-muted)]">(חובה)</span>
              </label>
              <textarea
                id="bug-description"
                required
                dir="auto"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-foreground placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-y"
                maxLength={5000}
                placeholder="תאר את הבעיה שנתקלת בה"
                disabled={isSubmitting}
              />
            </div>

            {/* Steps to reproduce — optional */}
            <div>
              <label htmlFor="bug-steps" className="block text-sm font-medium text-foreground mb-1.5">
                צעדים לשחזור
              </label>
              <textarea
                id="bug-steps"
                dir="auto"
                rows={3}
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-foreground placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-y"
                maxLength={3000}
                placeholder="1. פתחתי את העורך&#10;2. לחצתי על...&#10;3. ..."
                disabled={isSubmitting}
              />
            </div>

            {/* Expected behavior — optional */}
            <div>
              <label htmlFor="bug-expected" className="block text-sm font-medium text-foreground mb-1.5">
                מה ציפית שיקרה
              </label>
              <input
                id="bug-expected"
                type="text"
                dir="auto"
                value={expected}
                onChange={(e) => setExpected(e.target.value)}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-foreground placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                maxLength={500}
                placeholder="מה היית מצפה שיקרה במקום?"
                disabled={isSubmitting}
              />
            </div>

            {/* Visual description — optional (replaces file upload per dev notes) */}
            <div>
              <label htmlFor="bug-screenshot" className="block text-sm font-medium text-foreground mb-1.5">
                תאר מה אתה רואה
              </label>
              <textarea
                id="bug-screenshot"
                dir="auto"
                rows={2}
                value={screenshot}
                onChange={(e) => setScreenshot(e.target.value)}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-foreground placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-y"
                maxLength={2000}
                placeholder="תאר את מה שמופיע על המסך"
                disabled={isSubmitting}
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "שולח..." : "שלח דיווח"}
            </Button>
          </form>
        </section>
      </div>
    </main>
  );
}
