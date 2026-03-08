import { describe, it, expect } from "vitest";
import LandingPage from "./page";
import { setupComponentTest } from "@/components/landing/test-utils";

const { render, getContainer } = setupComponentTest();

describe("LandingPage", () => {
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

  it("renders footer with Hebrew text", () => {
    render(<LandingPage />);
    const footer = getContainer().querySelector("footer");
    expect(footer).not.toBeNull();
    expect(footer!.textContent).toContain("מארקו");
    expect(footer!.textContent).toContain("כלי מארקדאון");
  });

  it("includes Hebrew keywords across the page", () => {
    render(<LandingPage />);
    const html = getContainer().innerHTML;
    expect(html).toContain("עורך מארקדאון");
    expect(html).toContain("מארקדאון בעברית");
    expect(html).toContain("כלי מארקדאון");
  });

  it("does not contain 'use client' directive (Server Component)", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("app/page.tsx", "utf-8");
    expect(content).not.toContain("use client");
  });
});
