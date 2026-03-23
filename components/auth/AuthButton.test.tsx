import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from "vitest";
import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { AuthButton } from "./AuthButton";

const mockPush = vi.fn();
const mockOpenSignIn = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn() }),
}));

vi.mock("@clerk/nextjs", () => ({
  useClerk: () => ({ openSignIn: mockOpenSignIn }),
}));

vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }),
}));

// Stub matchMedia for Radix internals
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Radix DropdownMenu uses Popper which needs ResizeObserver
class FakeResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = FakeResizeObserver as unknown as typeof ResizeObserver;

// Radix needs DOMRect for positioning
const origGetBoundingClientRect = Element.prototype.getBoundingClientRect;
Element.prototype.getBoundingClientRect = vi.fn(() => ({
  x: 0, y: 0, width: 100, height: 40, top: 0, right: 100, bottom: 40, left: 0, toJSON: () => {},
}));

afterAll(() => {
  Element.prototype.getBoundingClientRect = origGetBoundingClientRect;
});

/** Radix DropdownMenu opens via pointerdown, not click */
function openMenu(trigger: HTMLElement) {
  act(() => {
    trigger.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true, button: 0, pointerType: "mouse" }));
  });
  act(() => {
    trigger.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

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
  document.querySelectorAll("[data-radix-popper-content-wrapper]").forEach((el) => el.remove());
  document.querySelectorAll('[role="menu"]').forEach((el) => el.parentElement?.remove());
});

describe("AuthButton", () => {
  it("renders a dropdown trigger button", () => {
    act(() => {
      root = createRoot(container);
      root.render(<AuthButton />);
    });
    const btn = container.querySelector('[data-testid="auth-button"]')!;
    expect(btn).toBeTruthy();
  });

  it("trigger button has correct aria-label", () => {
    act(() => {
      root = createRoot(container);
      root.render(<AuthButton />);
    });
    const btn = container.querySelector('[data-testid="auth-button"]')!;
    expect(btn.getAttribute("aria-label")).toBe("תפריט אורח");
  });

  it("renders 4 menu items when dropdown is opened", async () => {
    act(() => {
      root = createRoot(container);
      root.render(<AuthButton />);
    });

    const trigger = container.querySelector('[data-testid="auth-button"]') as HTMLButtonElement;
    openMenu(trigger);

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    const menuContent = document.querySelector('[role="menu"]');
    expect(menuContent).toBeTruthy();
    expect(document.querySelector('[data-testid="menu-item-settings"]')).toBeTruthy();
    expect(document.querySelector('[data-testid="menu-item-contact"]')).toBeTruthy();
    expect(document.querySelector('[data-testid="menu-item-report-bug"]')).toBeTruthy();
    expect(document.querySelector('[data-testid="menu-item-signin"]')).toBeTruthy();
  });

  it("sign-in item triggers openSignIn", async () => {
    act(() => {
      root = createRoot(container);
      root.render(<AuthButton />);
    });

    const trigger = container.querySelector('[data-testid="auth-button"]') as HTMLButtonElement;
    openMenu(trigger);

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    const signInItem = document.querySelector('[data-testid="menu-item-signin"]') as HTMLElement;
    expect(signInItem).toBeTruthy();

    act(() => {
      signInItem.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true, button: 0, pointerType: "mouse" }));
    });
    act(() => {
      signInItem.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    expect(mockOpenSignIn).toHaveBeenCalledTimes(1);
  });

  it("settings item triggers navigation", async () => {
    act(() => {
      root = createRoot(container);
      root.render(<AuthButton />);
    });

    const trigger = container.querySelector('[data-testid="auth-button"]') as HTMLButtonElement;
    openMenu(trigger);

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    const settingsItem = document.querySelector('[data-testid="menu-item-settings"]') as HTMLElement;
    expect(settingsItem).toBeTruthy();

    act(() => {
      settingsItem.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true, button: 0, pointerType: "mouse" }));
    });
    act(() => {
      settingsItem.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    expect(mockPush).toHaveBeenCalledWith("/settings");
  });
});
