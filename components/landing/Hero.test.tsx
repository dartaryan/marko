import { describe, it, expect } from "vitest";
import { Hero } from "./Hero";
import { setupComponentTest } from "./test-utils";

const { render, getContainer } = setupComponentTest();

describe("Hero", () => {
  it("renders Hebrew headline with target keyword", () => {
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

  it("renders CTA link to /editor", () => {
    render(<Hero />);
    const link = getContainer().querySelector('a[href="/editor"]');
    expect(link).not.toBeNull();
    expect(link!.textContent).toContain("פתחו את העורך");
    expect(link!.getAttribute("aria-label")).toBe("פתחו את העורך");
  });

  it("renders free-of-charge notice", () => {
    render(<Hero />);
    expect(getContainer().innerHTML).toContain("חינם לחלוטין");
  });

  it("has aria-label on section", () => {
    render(<Hero />);
    const section = getContainer().querySelector("section[aria-label]");
    expect(section).not.toBeNull();
  });
});
