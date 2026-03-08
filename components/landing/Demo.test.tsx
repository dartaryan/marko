import { describe, it, expect } from "vitest";
import { Demo } from "./Demo";
import { setupComponentTest } from "./test-utils";

const { render, getContainer } = setupComponentTest();

describe("Demo", () => {
  it("renders section heading", () => {
    render(<Demo />);
    const h2 = getContainer().querySelector("h2");
    expect(h2).not.toBeNull();
    expect(h2!.textContent).toContain("עריכה ותצוגה מקדימה");
  });

  it("renders editor pane with markdown sample", () => {
    render(<Demo />);
    const pre = getContainer().querySelector("pre");
    expect(pre).not.toBeNull();
    expect(pre!.textContent).toContain("ברוכים הבאים למארקו");
    expect(pre!.getAttribute("dir")).toBe("rtl");
  });

  it("renders preview pane with formatted HTML", () => {
    render(<Demo />);
    const preview = getContainer().querySelector(".preview-content");
    expect(preview).not.toBeNull();
    expect(preview!.innerHTML).toContain("<h1>");
    expect(preview!.innerHTML).toContain("עורך מארקדאון עברי");
    expect(preview!.getAttribute("dir")).toBe("rtl");
  });

  it("renders editor and preview labels", () => {
    render(<Demo />);
    expect(getContainer().innerHTML).toContain("עורך");
    expect(getContainer().innerHTML).toContain("תצוגה מקדימה");
  });

  it("has aria-label on section", () => {
    render(<Demo />);
    const section = getContainer().querySelector('section[aria-label]');
    expect(section).not.toBeNull();
  });
});
