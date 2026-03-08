import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { UserMenu } from "./UserMenu";

vi.mock("@clerk/nextjs", () => {
  const UserButton = ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="clerk-user-button">{children}</div>
  );
  UserButton.MenuItems = ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="clerk-menu-items">{children}</div>
  );
  UserButton.Action = ({ label, onClick }: { label: string; onClick?: () => void }) => (
    <button data-testid="clerk-menu-action" onClick={onClick}>{label}</button>
  );
  return { UserButton };
});

vi.mock("./DeleteAccountDialog", () => ({
  DeleteAccountDialog: ({ open }: { open: boolean }) =>
    open ? <div data-testid="delete-account-dialog" /> : null,
}));

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
});

describe("UserMenu", () => {
  it("renders Clerk UserButton", () => {
    act(() => {
      root = createRoot(container);
      root.render(<UserMenu tier="free" />);
    });
    const clerkBtn = container.querySelector(
      '[data-testid="clerk-user-button"]'
    )!;
    expect(clerkBtn).toBeTruthy();
  });

  it("does NOT show gold badge for free tier", () => {
    act(() => {
      root = createRoot(container);
      root.render(<UserMenu tier="free" />);
    });
    const badge = container.querySelector('[data-testid="paid-badge"]');
    expect(badge).toBeNull();
  });

  it("shows gold badge for paid tier", () => {
    act(() => {
      root = createRoot(container);
      root.render(<UserMenu tier="paid" />);
    });
    const badge = container.querySelector('[data-testid="paid-badge"]')!;
    expect(badge).toBeTruthy();
  });

  it("gold badge has correct aria-label and role", () => {
    act(() => {
      root = createRoot(container);
      root.render(<UserMenu tier="paid" />);
    });
    const badge = container.querySelector('[data-testid="paid-badge"]')!;
    expect(badge.getAttribute("aria-label")).toBe("מנוי פרימיום");
    expect(badge.getAttribute("role")).toBe("img");
  });

  it("renders with data-testid user-menu", () => {
    act(() => {
      root = createRoot(container);
      root.render(<UserMenu tier="free" />);
    });
    const menu = container.querySelector('[data-testid="user-menu"]')!;
    expect(menu).toBeTruthy();
  });

  it("renders delete account menu action", () => {
    act(() => {
      root = createRoot(container);
      root.render(<UserMenu tier="free" />);
    });
    const menuAction = container.querySelector(
      '[data-testid="clerk-menu-action"]'
    )!;
    expect(menuAction).toBeTruthy();
    expect(menuAction.textContent).toBe("מחיקת חשבון");
  });

  it("opens delete account dialog when delete action is clicked", () => {
    act(() => {
      root = createRoot(container);
      root.render(<UserMenu tier="free" />);
    });

    // Dialog should not be visible initially
    let dialog = container.querySelector('[data-testid="delete-account-dialog"]');
    expect(dialog).toBeNull();

    // Click the delete action
    const menuAction = container.querySelector(
      '[data-testid="clerk-menu-action"]'
    ) as HTMLButtonElement;
    act(() => {
      menuAction.click();
    });

    // Dialog should now be visible
    dialog = container.querySelector('[data-testid="delete-account-dialog"]');
    expect(dialog).toBeTruthy();
  });
});
