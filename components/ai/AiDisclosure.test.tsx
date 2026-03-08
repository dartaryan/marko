import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { AiDisclosure } from "./AiDisclosure";

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  vi.clearAllMocks();
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
});

function renderDisclosure(
  props: Partial<React.ComponentProps<typeof AiDisclosure>> = {}
) {
  const defaultProps = {
    open: true,
    onAccept: vi.fn(),
    onCancel: vi.fn(),
  };
  act(() => {
    root = createRoot(container);
    root.render(<AiDisclosure {...defaultProps} {...props} />);
  });
  return { ...defaultProps, ...props };
}

describe("AiDisclosure", () => {
  it('renders disclosure title "גילוי נאות — שימוש ב-AI"', () => {
    renderDisclosure();
    const html = document.body.innerHTML;
    expect(html).toContain("גילוי נאות — שימוש ב-AI");
  });

  it("renders all three disclosure text paragraphs", () => {
    renderDisclosure();
    const html = document.body.innerHTML;
    expect(html).toContain(
      "בעת שימוש בפעולות AI, תוכן המסמך שלך נשלח לשרתי Anthropic לעיבוד"
    );
    expect(html).toContain(
      "Anthropic לא משתמשת בתוכן שנשלח דרך ה-API שלה לאימון מודלים"
    );
    expect(html).toContain(
      "Marko לא שומרת את תוכן המסמך שלך בשרתים שלנו"
    );
  });

  it('"הבנתי, המשך" button calls onAccept', () => {
    const props = renderDisclosure();
    const acceptBtn = Array.from(
      document.querySelectorAll("button")
    ).find((btn) => btn.textContent?.includes("הבנתי, המשך"));

    expect(acceptBtn).toBeDefined();

    act(() => {
      acceptBtn?.click();
    });

    expect(props.onAccept).toHaveBeenCalledOnce();
  });

  it('"ביטול" button calls onCancel', () => {
    const props = renderDisclosure();
    const cancelBtn = Array.from(
      document.querySelectorAll("button")
    ).find((btn) => btn.textContent?.includes("ביטול"));

    expect(cancelBtn).toBeDefined();

    act(() => {
      cancelBtn?.click();
    });

    expect(props.onCancel).toHaveBeenCalledOnce();
  });

  it('has dir="rtl" on content', () => {
    renderDisclosure();
    const dialog = document.querySelector('[role="alertdialog"]');
    expect(dialog?.getAttribute("dir")).toBe("rtl");
  });

  it('has role="alertdialog" (provided by Radix AlertDialog)', () => {
    renderDisclosure();
    const dialog = document.querySelector('[role="alertdialog"]');
    expect(dialog).not.toBeNull();
  });

  it("does not render when open is false", () => {
    renderDisclosure({ open: false });
    const dialog = document.querySelector('[role="alertdialog"]');
    expect(dialog).toBeNull();
  });

  it("calls onCancel when Escape is pressed", () => {
    const props = renderDisclosure();

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true })
      );
    });

    expect(props.onCancel).toHaveBeenCalled();
  });
});
