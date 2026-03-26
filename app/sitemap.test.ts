import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import sitemap from "./sitemap";

describe("sitemap", () => {
  const FIXED_DATE = new Date("2026-03-26T12:00:00Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_DATE);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const entries = () => sitemap();

  it("returns an array of sitemap entries", () => {
    const result = entries();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(5);
  });

  it("includes the landing page with highest priority", () => {
    const landing = entries().find((e) => new URL(e.url).pathname === "/");
    expect(landing).toBeDefined();
    expect(landing!.priority).toBe(1);
    expect(landing!.changeFrequency).toBe("weekly");
  });

  it("includes /contact with medium priority", () => {
    const contact = entries().find((e) => e.url.includes("/contact"));
    expect(contact).toBeDefined();
    expect(contact!.priority).toBe(0.5);
    expect(contact!.changeFrequency).toBe("monthly");
  });

  it("includes /report-bug with low priority", () => {
    const reportBug = entries().find((e) => e.url.includes("/report-bug"));
    expect(reportBug).toBeDefined();
    expect(reportBug!.priority).toBe(0.3);
    expect(reportBug!.changeFrequency).toBe("monthly");
  });

  it("includes /sign-in with low priority", () => {
    const signIn = entries().find((e) => e.url.includes("/sign-in"));
    expect(signIn).toBeDefined();
    expect(signIn!.priority).toBe(0.3);
    expect(signIn!.changeFrequency).toBe("monthly");
  });

  it("includes /sign-up with low priority", () => {
    const signUp = entries().find((e) => e.url.includes("/sign-up"));
    expect(signUp).toBeDefined();
    expect(signUp!.priority).toBe(0.3);
    expect(signUp!.changeFrequency).toBe("monthly");
  });

  it("does NOT include /editor", () => {
    const editor = entries().find((e) => e.url.includes("/editor"));
    expect(editor).toBeUndefined();
  });

  it("does NOT include /settings", () => {
    const settings = entries().find((e) => e.url.includes("/settings"));
    expect(settings).toBeUndefined();
  });

  it("does NOT include /subscription", () => {
    const subscription = entries().find((e) => e.url.includes("/subscription"));
    expect(subscription).toBeUndefined();
  });

  it("uses current date for lastModified on all entries", () => {
    const result = entries();
    for (const entry of result) {
      expect(entry.lastModified).toBeInstanceOf(Date);
      expect((entry.lastModified as Date).getTime()).toBe(FIXED_DATE.getTime());
    }
  });
});
