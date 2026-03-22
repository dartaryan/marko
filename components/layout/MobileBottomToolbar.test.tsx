import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React, { createRef } from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { MobileBottomToolbar } from "./MobileBottomToolbar";

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

function makeTextarea(value = "test content", selectionStart = 0, selectionEnd = 0) {
  const ta = document.createElement("textarea");
  ta.value = value;
  ta.selectionStart = selectionStart;
  ta.selectionEnd = selectionEnd;
  document.body.appendChild(ta);
  return ta;
}

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  // Clean up any textareas
  document.querySelectorAll("textarea").forEach((ta) => ta.remove());
});

describe("MobileBottomToolbar", () => {
  function defaultProps(overrides: Record<string, unknown> = {}) {
    const ta = makeTextarea();
    const ref = { current: ta } as React.RefObject<HTMLTextAreaElement | null>;
    return {
      viewMode: "editor" as const,
      textareaRef: ref,
      onContentChange: vi.fn(),
      ...overrides,
    };
  }

  it("renders 5 formatting buttons", () => {
    const props = defaultProps();
    act(() => root.render(<MobileBottomToolbar {...props} />));
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBe(5);
  });

  it("returns null in preview mode", () => {
    const props = defaultProps({ viewMode: "preview" });
    act(() => root.render(<MobileBottomToolbar {...props} />));
    expect(container.innerHTML).toBe("");
  });

  it("renders in split mode", () => {
    const props = defaultProps({ viewMode: "split" });
    act(() => root.render(<MobileBottomToolbar {...props} />));
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBe(5);
  });

  it("has Hebrew aria-labels on all buttons", () => {
    const props = defaultProps();
    act(() => root.render(<MobileBottomToolbar {...props} />));
    const labels = ["מודגש", "נטוי", "כותרת", "קישור", "רשימה"];
    for (const label of labels) {
      expect(container.querySelector(`[aria-label="${label}"]`)).not.toBeNull();
    }
  });

  it("has toolbar aria-label", () => {
    const props = defaultProps();
    act(() => root.render(<MobileBottomToolbar {...props} />));
    expect(
      container.querySelector('[aria-label="סרגל עיצוב מהיר"]')
    ).not.toBeNull();
  });

  it("inserts bold markdown at cursor position", () => {
    const ta = makeTextarea("hello world", 5, 5);
    const ref = { current: ta } as React.RefObject<HTMLTextAreaElement | null>;
    const onContentChange = vi.fn();
    act(() =>
      root.render(
        <MobileBottomToolbar viewMode="editor" textareaRef={ref} onContentChange={onContentChange} />
      )
    );
    const boldBtn = container.querySelector('[aria-label="מודגש"]') as HTMLButtonElement;
    act(() => boldBtn.click());
    expect(onContentChange).toHaveBeenCalledTimes(1);
    const result = onContentChange.mock.calls[0][0];
    expect(result).toContain("**");
    // Bold was inserted at position 5, not appended at end
    expect(result.indexOf("**")).toBe(5);
  });

  it("wraps selected text with bold markers", () => {
    const ta = makeTextarea("hello world", 6, 11); // "world" selected
    const ref = { current: ta } as React.RefObject<HTMLTextAreaElement | null>;
    const onContentChange = vi.fn();
    act(() =>
      root.render(
        <MobileBottomToolbar viewMode="editor" textareaRef={ref} onContentChange={onContentChange} />
      )
    );
    const boldBtn = container.querySelector('[aria-label="מודגש"]') as HTMLButtonElement;
    act(() => boldBtn.click());
    expect(onContentChange).toHaveBeenCalledTimes(1);
    expect(onContentChange.mock.calls[0][0]).toContain("**world**");
  });

  it("inserts heading markdown at cursor position", () => {
    const ta = makeTextarea("hello", 5, 5);
    const ref = { current: ta } as React.RefObject<HTMLTextAreaElement | null>;
    const onContentChange = vi.fn();
    act(() =>
      root.render(
        <MobileBottomToolbar viewMode="editor" textareaRef={ref} onContentChange={onContentChange} />
      )
    );
    const headingBtn = container.querySelector('[aria-label="כותרת"]') as HTMLButtonElement;
    act(() => headingBtn.click());
    expect(onContentChange).toHaveBeenCalledTimes(1);
    expect(onContentChange.mock.calls[0][0]).toContain("# ");
  });

  it("inserts list markdown at cursor position", () => {
    const ta = makeTextarea("hello", 5, 5);
    const ref = { current: ta } as React.RefObject<HTMLTextAreaElement | null>;
    const onContentChange = vi.fn();
    act(() =>
      root.render(
        <MobileBottomToolbar viewMode="editor" textareaRef={ref} onContentChange={onContentChange} />
      )
    );
    const listBtn = container.querySelector('[aria-label="רשימה"]') as HTMLButtonElement;
    act(() => listBtn.click());
    expect(onContentChange).toHaveBeenCalledTimes(1);
    expect(onContentChange.mock.calls[0][0]).toContain("- ");
  });

  it("uses marko-header-btn class on all buttons", () => {
    const props = defaultProps();
    act(() => root.render(<MobileBottomToolbar {...props} />));
    const buttons = container.querySelectorAll("button");
    for (const btn of buttons) {
      expect(btn.classList.contains("marko-header-btn")).toBe(true);
    }
  });

  it("uses marko-mobile-bottom-toolbar class on container", () => {
    const props = defaultProps();
    act(() => root.render(<MobileBottomToolbar {...props} />));
    expect(
      container.querySelector(".marko-mobile-bottom-toolbar")
    ).not.toBeNull();
  });
});
