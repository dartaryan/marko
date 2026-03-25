"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const issueBody = `## Contact Message\n\n**From:** ${name}\n**Email:** ${email}\n\n---\n\n${message}`;

      const response = await fetch("/api/github/create-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `[Contact] ${name}`,
          body: issueBody,
          labels: ["contact"],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      toast.success("ההודעה נשלחה בהצלחה ✓");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      toast.error("שגיאה בשליחת ההודעה. נסה שוב.");
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
          <Phone className="size-6 text-[var(--primary)]" aria-hidden="true" />
          <h1 className="text-2xl font-bold text-foreground">צור קשר</h1>
        </div>

        <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label htmlFor="contact-name" className="block text-sm font-medium text-foreground mb-1.5">
                שם <span className="text-[var(--foreground-muted)]">(חובה)</span>
              </label>
              <input
                id="contact-name"
                type="text"
                required
                dir="auto"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-foreground placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                maxLength={100}
                placeholder="השם שלך"
                disabled={isSubmitting}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="contact-email" className="block text-sm font-medium text-foreground mb-1.5">
                דוא״ל <span className="text-[var(--foreground-muted)]">(חובה)</span>
              </label>
              <input
                id="contact-email"
                type="email"
                required
                dir="auto"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-foreground placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                maxLength={254}
                placeholder="your@email.com"
                disabled={isSubmitting}
              />
            </div>

            {/* Message */}
            <div>
              <label htmlFor="contact-message" className="block text-sm font-medium text-foreground mb-1.5">
                הודעה <span className="text-[var(--foreground-muted)]">(חובה)</span>
              </label>
              <textarea
                id="contact-message"
                required
                dir="auto"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={5000}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-foreground placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-y"
                placeholder="במה נוכל לעזור?"
                disabled={isSubmitting}
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "שולח..." : "שלח הודעה"}
            </Button>
          </form>
        </section>
      </div>
    </main>
  );
}
