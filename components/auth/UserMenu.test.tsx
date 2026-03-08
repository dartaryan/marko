import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { UserMenu } from "./UserMenu";

vi.mock("@clerk/nextjs", () => ({
  UserButton: () => <div data-testid="clerk-user-button" />,
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
});
