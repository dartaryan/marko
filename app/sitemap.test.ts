import { describe, it, expect } from "vitest";
import sitemap from "./sitemap";

describe("sitemap", () => {
  const entries = sitemap();

  it("returns an array of sitemap entries", () => {
    expect(Array.isArray(entries)).toBe(true);
    expect(entries.length).toBeGreaterThan(0);
  });

  it("includes the landing page with highest priority", () => {
    const landing = entries.find((e) => new URL(e.url).pathname === "/");
    expect(landing).toBeDefined();
    expect(landing!.priority).toBe(1);
    expect(landing!.changeFrequency).toBe("weekly");
  });

  it("includes /sign-in with low priority", () => {
    const signIn = entries.find((e) => e.url.includes("/sign-in"));
    expect(signIn).toBeDefined();
    expect(signIn!.priority).toBe(0.3);
    expect(signIn!.changeFrequency).toBe("monthly");
  });

  it("includes /sign-up with low priority", () => {
    const signUp = entries.find((e) => e.url.includes("/sign-up"));
    expect(signUp).toBeDefined();
    expect(signUp!.priority).toBe(0.3);
    expect(signUp!.changeFrequency).toBe("monthly");
  });

  it("does NOT include /editor", () => {
    const editor = entries.find((e) => e.url.includes("/editor"));
    expect(editor).toBeUndefined();
  });

  it("all entries share the same fixed lastModified date", () => {
    for (const entry of entries) {
      expect(entry.lastModified).toBeInstanceOf(Date);
    }
    const dates = entries.map((e) => (e.lastModified as Date).getTime());
    expect(new Set(dates).size).toBe(1);
  });
});
