import { describe, it, expect } from "vitest";
import { Features } from "./Features";
import { setupComponentTest } from "./test-utils";

const { render, getContainer } = setupComponentTest();

describe("Features", () => {
  it("renders section heading with Hebrew keyword", () => {
    render(<Features />);
    const h2 = getContainer().querySelector("h2");
    expect(h2).not.toBeNull();
    expect(h2!.textContent).toContain("מארקדאון בעברית");
  });

  it("renders four feature cards", () => {
    render(<Features />);
    const cards = getContainer().querySelectorAll("h3");
    expect(cards.length).toBe(4);
  });

  it("renders RTL feature", () => {
    render(<Features />);
    expect(getContainer().innerHTML).toContain("RTL");
    expect(getContainer().innerHTML).toContain("עברית מלאה");
  });

  it("renders export feature", () => {
    render(<Features />);
    expect(getContainer().innerHTML).toContain("ייצוא מעוצב");
    expect(getContainer().innerHTML).toContain("PDF");
  });

  it("renders theme feature", () => {
    render(<Features />);
    expect(getContainer().innerHTML).toContain("ערכות עיצוב");
  });

  it("renders AI feature", () => {
    render(<Features />);
    expect(getContainer().innerHTML).toContain("AI");
  });

  it("has aria-label on section", () => {
    render(<Features />);
    const section = getContainer().querySelector('section[aria-label]');
    expect(section).not.toBeNull();
    expect(section!.getAttribute("aria-label")).toBe("יכולות מארקו");
  });
});
