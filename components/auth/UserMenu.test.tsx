import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from "vitest";
import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { UserMenu } from "./UserMenu";

const mockPush = vi.fn();
const mockSignOut = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn() }),
}));

vi.mock("@clerk/nextjs", () => ({
  useUser: () => ({
    user: {
      firstName: "Test",
      imageUrl: null,
      primaryEmailAddress: { emailAddress: "test@example.com" },
    },
  }),
  useClerk: () => ({ signOut: mockSignOut }),
}));

vi.mock("./DeleteAccountDialog", () => ({
  DeleteAccountDialog: ({ open }: { open: boolean }) =>
    open ? <div data-testid="delete-account-dialog" /> : null,
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

describe("UserMenu", () => {
  it("renders with data-testid user-menu", () => {
    act(() => {
      root = createRoot(container);
      root.render(<UserMenu tier="free" />);
    });
    const menu = container.querySelector('[data-testid="user-menu"]')!;
    expect(menu).toBeTruthy();
  });

  it("renders dropdown trigger with user initials", () => {
    act(() => {
      root = createRoot(container);
      root.render(<UserMenu tier="free" />);
    });
    const trigger = container.querySelector('[data-testid="user-menu-trigger"]')!;
    expect(trigger).toBeTruthy();
    expect(trigger.textContent).toContain("T");
  });

  it("does NOT show paid badge for free tier", () => {
    act(() => {
      root = createRoot(container);
      root.render(<UserMenu tier="free" />);
    });
    const badge = container.querySelector('[data-testid="paid-badge"]');
    expect(badge).toBeNull();
  });

  it("shows paid badge for paid tier", () => {
    act(() => {
      root = createRoot(container);
      root.render(<UserMenu tier="paid" />);
    });
    const badge = container.querySelector('[data-testid="paid-badge"]')!;
    expect(badge).toBeTruthy();
  });

  it("paid badge has correct aria-label and role", () => {
    act(() => {
      root = createRoot(container);
      root.render(<UserMenu tier="paid" />);
    });
    const badge = container.querySelector('[data-testid="paid-badge"]')!;
    expect(badge.getAttribute("aria-label")).toBe("מנוי פרימיום");
    expect(badge.getAttribute("role")).toBe("img");
  });

  it("renders 6 menu items when dropdown is opened", async () => {
    act(() => {
      root = createRoot(container);
      root.render(<UserMenu tier="free" />);
    });

    const trigger = container.querySelector('[data-testid="user-menu-trigger"]') as HTMLButtonElement;
    openMenu(trigger);

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    const menuContent = document.querySelector('[role="menu"]');
    expect(menuContent).toBeTruthy();
    expect(document.querySelector('[data-testid="menu-item-documents"]')).toBeTruthy();
    expect(document.querySelector('[data-testid="menu-item-settings"]')).toBeTruthy();
    expect(document.querySelector('[data-testid="menu-item-contact"]')).toBeTruthy();
    expect(document.querySelector('[data-testid="menu-item-report-bug"]')).toBeTruthy();
    expect(document.querySelector('[data-testid="menu-item-delete-account"]')).toBeTruthy();
    expect(document.querySelector('[data-testid="menu-item-signout"]')).toBeTruthy();
  });

  it("shows subscription item for paid tier", async () => {
    act(() => {
      root = createRoot(container);
      root.render(<UserMenu tier="paid" />);
    });

    const trigger = container.querySelector('[data-testid="user-menu-trigger"]') as HTMLButtonElement;
    openMenu(trigger);

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    expect(document.querySelector('[data-testid="menu-item-subscription"]')).toBeTruthy();
  });

  it("does not show subscription item for free tier", async () => {
    act(() => {
      root = createRoot(container);
      root.render(<UserMenu tier="free" />);
    });

    const trigger = container.querySelector('[data-testid="user-menu-trigger"]') as HTMLButtonElement;
    openMenu(trigger);

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    expect(document.querySelector('[data-testid="menu-item-subscription"]')).toBeNull();
  });

  it("sign-out item calls signOut()", async () => {
    act(() => {
      root = createRoot(container);
      root.render(<UserMenu tier="free" />);
    });

    const trigger = container.querySelector('[data-testid="user-menu-trigger"]') as HTMLButtonElement;
    openMenu(trigger);

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    const signOutItem = document.querySelector('[data-testid="menu-item-signout"]') as HTMLElement;
    expect(signOutItem).toBeTruthy();

    act(() => {
      signOutItem.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true, button: 0, pointerType: "mouse" }));
    });
    act(() => {
      signOutItem.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it("renders delete account menu item", async () => {
    act(() => {
      root = createRoot(container);
      root.render(<UserMenu tier="free" />);
    });

    const trigger = container.querySelector('[data-testid="user-menu-trigger"]') as HTMLButtonElement;
    openMenu(trigger);

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    const deleteItem = document.querySelector('[data-testid="menu-item-delete-account"]') as HTMLElement;
    expect(deleteItem).toBeTruthy();
  });
});
