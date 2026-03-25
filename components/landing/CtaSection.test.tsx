import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CtaSection } from "./CtaSection";
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

describe("CtaSection", () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ isSignedIn: undefined });
  });

  it("renders CTA link to /editor", () => {
    render(<CtaSection />);
    const link = getContainer().querySelector('a[href="/editor"]');
    expect(link).not.toBeNull();
  });

  it("renders anonymous CTA text when not signed in", () => {
    mockUseAuth.mockReturnValue({ isSignedIn: false });
    render(<CtaSection />);
    const link = getContainer().querySelector('a[href="/editor"]');
    expect(link!.textContent).toContain("התחל בחינם");
  });

  it("renders authenticated CTA text when signed in", () => {
    mockUseAuth.mockReturnValue({ isSignedIn: true });
    render(<CtaSection />);
    const link = getContainer().querySelector('a[href="/editor"]');
    expect(link!.textContent).toContain("פתח את מארקו");
  });

  it("renders bottom variant with heading", () => {
    render(<CtaSection variant="bottom" />);
    const h2 = getContainer().querySelector("h2");
    expect(h2).not.toBeNull();
    expect(h2!.textContent).toContain("מוכנים להתחיל");
  });

  it("does not render heading in default variant", () => {
    render(<CtaSection />);
    const h2 = getContainer().querySelector("h2");
    expect(h2).toBeNull();
  });

  it("has aria-label on section", () => {
    render(<CtaSection />);
    const section = getContainer().querySelector('section[aria-label]');
    expect(section).not.toBeNull();
  });
});
