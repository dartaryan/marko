import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hero } from "./Hero";
import { setupComponentTest } from "./test-utils";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) =>
    React.createElement("a", { href, ...props }, children),
}));

// Mock @clerk/nextjs
const mockUseAuth = vi.fn();
vi.mock("@clerk/nextjs", () => ({
  useAuth: () => mockUseAuth(),
}));

const { render, getContainer } = setupComponentTest();

describe("Hero", () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ isSignedIn: undefined });
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it("renders Hebrew headline with target keywords", () => {
    render(<Hero />);
    const h1 = getContainer().querySelector("h1");
    expect(h1).not.toBeNull();
    expect(h1!.textContent).toContain("עורך מארקדאון");
    expect(h1!.textContent).toContain("בעברית");
  });

  it("renders Hebrew tagline", () => {
    render(<Hero />);
    const tagline = getContainer().querySelector("p");
    expect(tagline).not.toBeNull();
    expect(tagline!.textContent).toContain("כלי מארקדאון");
  });

  it("renders primary CTA with anonymous text when not signed in", () => {
    mockUseAuth.mockReturnValue({ isSignedIn: false });
    render(<Hero />);
    const cta = getContainer().querySelector('a[href="/editor"].marko-hero-cta');
    expect(cta).not.toBeNull();
    expect(cta!.textContent).toContain("התחל בחינם");
  });

  it("renders primary CTA with authenticated text when signed in", () => {
    mockUseAuth.mockReturnValue({ isSignedIn: true });
    render(<Hero />);
    const cta = getContainer().querySelector('a[href="/editor"].marko-hero-cta');
    expect(cta).not.toBeNull();
    expect(cta!.textContent).toContain("פתח את מארקו");
  });

  it("defaults to anonymous CTA when auth is loading (undefined)", () => {
    mockUseAuth.mockReturnValue({ isSignedIn: undefined });
    render(<Hero />);
    const cta = getContainer().querySelector('a[href="/editor"].marko-hero-cta');
    expect(cta).not.toBeNull();
    expect(cta!.textContent).toContain("התחל בחינם");
  });

  it("renders secondary CTA pointing to demos section", () => {
    render(<Hero />);
    const secondary = getContainer().querySelector('a[href="#demos"]');
    expect(secondary).not.toBeNull();
    expect(secondary!.textContent).toContain("צפה בהדגמה");
  });

  it("renders EditorMockup component", () => {
    render(<Hero />);
    const mockup = getContainer().querySelector('[aria-label="תצוגת עורך מארקו עם ערכות עיצוב"]');
    expect(mockup).not.toBeNull();
  });

  it("has aria-label on section", () => {
    render(<Hero />);
    const section = getContainer().querySelector("section[aria-label]");
    expect(section).not.toBeNull();
  });
});
