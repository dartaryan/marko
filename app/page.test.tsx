import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import LandingPage from "./page";
import { setupComponentTest } from "@/components/landing/test-utils";

vi.mock("@/components/landing/LandingRedirectGuard", () => ({
  LandingRedirectGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({ isSignedIn: undefined }),
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) =>
    React.createElement("a", { href, ...props }, children),
}));

// Mock framer-motion for ScrollReveal and Hero
vi.mock("framer-motion", () => ({
  m: {
    div: React.forwardRef(({ children, initial: _i, whileInView: _w, viewport: _v, transition: _t, ...props }: Record<string, unknown> & { children?: React.ReactNode }, ref: React.Ref<HTMLDivElement>) =>
      React.createElement("div", { ...props, ref } as React.HTMLAttributes<HTMLDivElement>, children as React.ReactNode)
    ),
    section: React.forwardRef(({ children, initial: _i, animate: _a, transition: _t, ...props }: Record<string, unknown> & { children?: React.ReactNode }, ref: React.Ref<HTMLElement>) =>
      React.createElement("section", { ...props, ref } as React.HTMLAttributes<HTMLElement>, children as React.ReactNode)
    ),
  },
  useReducedMotion: () => false,
}));

const { render, getContainer } = setupComponentTest();

describe("LandingPage", () => {
  beforeEach(() => {
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

  it("renders Hero, Features, and Demo sections", () => {
    render(<LandingPage />);
    const sections = getContainer().querySelectorAll("section");
    expect(sections.length).toBeGreaterThanOrEqual(3);
  });

  it("renders JSON-LD structured data", () => {
    render(<LandingPage />);
    const script = getContainer().querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    const data = JSON.parse(script!.textContent!);
    expect(data["@type"]).toBe("SoftwareApplication");
    expect(data.name).toBe("מארקו");
    expect(data.inLanguage).toBe("he");
  });

  it("does not render a footer", () => {
    render(<LandingPage />);
    const footer = getContainer().querySelector("footer");
    expect(footer).toBeNull();
  });

  it("includes Hebrew keywords across the page", () => {
    render(<LandingPage />);
    const html = getContainer().innerHTML;
    expect(html).toContain("עורך מארקדאון");
    expect(html).toContain("מארקדאון בעברית");
  });

  it("does not contain 'use client' directive (Server Component)", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("app/page.tsx", "utf-8");
    expect(content).not.toContain("use client");
  });

  it("renders landing-warm class on main element", () => {
    render(<LandingPage />);
    const main = getContainer().querySelector("main.landing-warm");
    expect(main).not.toBeNull();
  });
});
