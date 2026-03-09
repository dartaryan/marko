import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { UpgradePrompt } from "./UpgradePrompt";

const mockCreateCheckout = vi.fn();

const { mockToastError } = vi.hoisted(() => ({
  mockToastError: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { info: vi.fn(), error: mockToastError, success: vi.fn() },
}));

vi.mock("convex/react", () => ({
  useAction: () => mockCreateCheckout,
}));

vi.mock("@/convex/_generated/api", () => ({
  api: {
    stripe: {
      createCheckoutSession: "api:stripe:createCheckoutSession",
    },
  },
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

  it("calls createCheckoutSession on click and redirects", async () => {
    mockCreateCheckout.mockResolvedValue({
      url: "https://checkout.stripe.com/test",
    });

    // Mock window.location
    const originalLocation = window.location;
    Object.defineProperty(window, "location", {
      writable: true,
      value: { ...originalLocation, href: "" },
    });

    renderComponent();
    const button = container.querySelector("button")!;

    await act(async () => {
      button.click();
    });

    expect(mockCreateCheckout).toHaveBeenCalled();
    expect(window.location.href).toBe("https://checkout.stripe.com/test");

    // Restore
    Object.defineProperty(window, "location", {
      writable: true,
      value: originalLocation,
    });
  });

  it("shows error toast when checkout fails", async () => {
    mockCreateCheckout.mockRejectedValue({
      data: { code: "CHECKOUT_ERROR", message: "שגיאה ביצירת דף התשלום" },
    });

    renderComponent();
    const button = container.querySelector("button")!;

    await act(async () => {
      button.click();
    });

    expect(mockToastError).toHaveBeenCalledWith("שגיאה ביצירת דף התשלום");
  });

  it("disables button during loading", async () => {
    let resolveCheckout: (value: { url: string }) => void;
    mockCreateCheckout.mockReturnValue(
      new Promise((resolve) => {
        resolveCheckout = resolve;
      })
    );

    renderComponent();
    const button = container.querySelector("button")!;

    act(() => {
      button.click();
    });

    // Button should show loading text
    expect(button.textContent).toContain("מעבד...");
    expect(button.disabled).toBe(true);

    // Resolve the checkout
    await act(async () => {
      resolveCheckout!({ url: "https://checkout.stripe.com/test" });
    });
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
    expect(button.className).not.toContain("border-input");
  });

  it('renders correct variant styling for "inline"', () => {
    renderComponent({ variant: "inline" });
    const button = container.querySelector("button")!;
    expect(button.className).toContain("border");
  });
});
