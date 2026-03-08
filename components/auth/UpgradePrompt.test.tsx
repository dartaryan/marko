import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { UpgradePrompt } from "./UpgradePrompt";

const { mockToastInfo } = vi.hoisted(() => ({
  mockToastInfo: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { info: mockToastInfo, error: vi.fn(), success: vi.fn() },
}));

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

function renderComponent(
  props: Partial<React.ComponentProps<typeof UpgradePrompt>> = {}
) {
  act(() => {
    root = createRoot(container);
    root.render(<UpgradePrompt {...props} />);
  });
}

describe("UpgradePrompt", () => {
  it('renders "שדרג עכשיו" button text', () => {
    renderComponent();
    const button = container.querySelector("button");
    expect(button).not.toBeNull();
    expect(button!.textContent).toContain("שדרג עכשיו");
  });

  it("click calls toast.info with Phase 1 placeholder message", () => {
    renderComponent();
    const button = container.querySelector("button")!;

    act(() => {
      button.click();
    });

    expect(mockToastInfo).toHaveBeenCalledWith("שדרוג יהיה זמין בקרוב!");
  });

  it('has aria-label="שדרג לגישה בלתי מוגבלת ל-AI"', () => {
    renderComponent();
    const button = container.querySelector("button")!;
    expect(button.getAttribute("aria-label")).toBe(
      "שדרג לגישה בלתי מוגבלת ל-AI"
    );
  });

  it('renders with dir="rtl"', () => {
    renderComponent();
    const wrapper = container.querySelector('[dir="rtl"]');
    expect(wrapper).not.toBeNull();
  });

  it('renders correct variant styling for "palette"', () => {
    renderComponent({ variant: "palette" });
    const button = container.querySelector("button")!;
    // palette variant uses "default" variant and "sm" size — no "outline" class
    expect(button.className).not.toContain("border-input");
  });

  it('renders correct variant styling for "inline"', () => {
    renderComponent({ variant: "inline" });
    const button = container.querySelector("button")!;
    // inline variant uses "outline" variant — has border styling
    expect(button.className).toContain("border");
  });
});
