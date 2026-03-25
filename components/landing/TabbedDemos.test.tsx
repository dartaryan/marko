import { describe, it, expect } from "vitest";
import { act } from "react";
import { TabbedDemos } from "./TabbedDemos";
import { setupComponentTest } from "./test-utils";

const { render, getContainer } = setupComponentTest();

describe("TabbedDemos", () => {
  it("renders section with id=demos", () => {
    render(<TabbedDemos />);
    const section = getContainer().querySelector("#demos");
    expect(section).not.toBeNull();
  });

  it("renders section heading", () => {
    render(<TabbedDemos />);
    const h2 = getContainer().querySelector("h2");
    expect(h2).not.toBeNull();
    expect(h2!.textContent).toContain("ראו איך זה עובד");
  });

  it("renders 4 demo buttons", () => {
    render(<TabbedDemos />);
    const tabs = getContainer().querySelectorAll('[aria-expanded]');
    expect(tabs.length).toBe(4);
  });

  it("renders Hebrew tab labels", () => {
    render(<TabbedDemos />);
    const html = getContainer().innerHTML;
    expect(html).toContain("כתיבה");
    expect(html).toContain("עיצוב");
    expect(html).toContain("AI");
    expect(html).toContain("ייצוא");
  });

  it("does not render tab content until a tab is clicked (lazy-load)", () => {
    render(<TabbedDemos />);
    const panel = getContainer().querySelector('[role="region"]');
    expect(panel).toBeNull();
  });

  it("renders tab content when a tab is clicked", () => {
    render(<TabbedDemos />);
    const tabs = getContainer().querySelectorAll('[aria-expanded]');

    act(() => {
      (tabs[0] as HTMLElement).click();
    });

    const panel = getContainer().querySelector('[role="region"]');
    expect(panel).not.toBeNull();
    expect(getContainer().innerHTML).toContain("כתבו מארקדאון בעברית");
  });

  it("switches tab content on different tab click", () => {
    render(<TabbedDemos />);
    const tabs = getContainer().querySelectorAll('[aria-expanded]');

    // Click AI tab (index 2)
    act(() => {
      (tabs[2] as HTMLElement).click();
    });

    expect(getContainer().innerHTML).toContain("עזרת AI חכמה");
  });

  it("has aria-label on section", () => {
    render(<TabbedDemos />);
    const section = getContainer().querySelector('section[aria-label]');
    expect(section).not.toBeNull();
    expect(section!.getAttribute("aria-label")).toBe("הדגמות יכולות מארקו");
  });
});
