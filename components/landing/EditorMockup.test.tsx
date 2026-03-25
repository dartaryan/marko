import { describe, it, expect, vi, beforeEach } from "vitest";
import { EditorMockup } from "./EditorMockup";
import { setupComponentTest } from "./test-utils";

// Mock matchMedia
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

const { render, getContainer } = setupComponentTest();

describe("EditorMockup", () => {
  it("renders mockup container with aria-label", () => {
    render(<EditorMockup />);
    const container = getContainer().querySelector(
      '[aria-label="תצוגת עורך מארקו עם ערכות עיצוב"]'
    );
    expect(container).not.toBeNull();
  });

  it("renders Hebrew mockup content", () => {
    render(<EditorMockup />);
    const html = getContainer().innerHTML;
    expect(html).toContain("ברוכים הבאים");
    expect(html).toContain("מארקו הוא עורך מארקדאון");
    expect(html).toContain("ציטוט לדוגמה");
    expect(html).toContain('const hello = "שלום עולם"');
  });

  it("renders 5 theme selector dots", () => {
    render(<EditorMockup />);
    const dots = getContainer().querySelectorAll('button[aria-label^="ערכת עיצוב"]');
    expect(dots.length).toBe(5);
  });

  it("first dot is active by default", () => {
    render(<EditorMockup />);
    const dots = getContainer().querySelectorAll('button[aria-label^="ערכת עיצוב"]');
    expect(dots[0].getAttribute("aria-pressed")).toBe("true");
    expect(dots[1].getAttribute("aria-pressed")).toBe("false");
  });

  it("renders title bar with window dots", () => {
    render(<EditorMockup />);
    const html = getContainer().innerHTML;
    expect(html).toContain("marko");
  });
});
