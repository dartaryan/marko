import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { AuthGate } from "./AuthGate";

const mockUseCurrentUser = vi.fn();

vi.mock("@/lib/hooks/useCurrentUser", () => ({
  useCurrentUser: () => mockUseCurrentUser(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock("@clerk/nextjs", () => ({
  useUser: () => ({
    user: {
      firstName: "Test",
      imageUrl: null,
      primaryEmailAddress: { emailAddress: "test@example.com" },
    },
  }),
  useClerk: () => ({ signOut: vi.fn(), openSignIn: vi.fn() }),
}));

vi.mock("convex/react", () => ({
  useAction: () => vi.fn(),
}));

vi.mock("@/convex/_generated/api", () => ({
  api: { users: { deleteMyAccount: "users:deleteMyAccount" } },
}));

vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }),
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

describe("AuthGate", () => {
  it("shows loading skeleton when auth is loading", () => {
    mockUseCurrentUser.mockReturnValue({ user: null, isLoading: true, isAuthenticated: false });

    act(() => {
      root = createRoot(container);
      root.render(<AuthGate />);
    });
    const loading = container.querySelector('[data-testid="auth-loading"]')!;
    expect(loading).toBeTruthy();
  });

  it("shows AuthButton in desktop container when not authenticated", () => {
    mockUseCurrentUser.mockReturnValue({ user: null, isLoading: false, isAuthenticated: false });

    act(() => {
      root = createRoot(container);
      root.render(<AuthGate />);
    });
    const desktop = container.querySelector('.marko-user-desktop')!;
    expect(desktop).toBeTruthy();
    const authBtn = desktop.querySelector('[data-testid="auth-button"]')!;
    expect(authBtn).toBeTruthy();
  });

  it("shows MobileUserSheet in mobile container when not authenticated", () => {
    mockUseCurrentUser.mockReturnValue({ user: null, isLoading: false, isAuthenticated: false });

    act(() => {
      root = createRoot(container);
      root.render(<AuthGate />);
    });
    const mobile = container.querySelector('.marko-user-mobile')!;
    expect(mobile).toBeTruthy();
    const mobileBtn = mobile.querySelector('[data-testid="mobile-menu-trigger"]')!;
    expect(mobileBtn).toBeTruthy();
  });

  it("shows UserMenu in desktop container when authenticated (free tier)", () => {
    mockUseCurrentUser.mockReturnValue({ user: { tier: "free" }, isLoading: false, isAuthenticated: true });

    act(() => {
      root = createRoot(container);
      root.render(<AuthGate />);
    });
    const desktop = container.querySelector('.marko-user-desktop')!;
    const userMenu = desktop.querySelector('[data-testid="user-menu"]')!;
    expect(userMenu).toBeTruthy();
    const badge = desktop.querySelector('[data-testid="paid-badge"]');
    expect(badge).toBeNull();
  });

  it("shows paid badge when authenticated (paid tier)", () => {
    mockUseCurrentUser.mockReturnValue({ user: { tier: "paid" }, isLoading: false, isAuthenticated: true });

    act(() => {
      root = createRoot(container);
      root.render(<AuthGate />);
    });
    const desktop = container.querySelector('.marko-user-desktop')!;
    const userMenu = desktop.querySelector('[data-testid="user-menu"]')!;
    expect(userMenu).toBeTruthy();
    const badge = desktop.querySelector('[data-testid="paid-badge"]')!;
    expect(badge).toBeTruthy();
  });

  it("defaults to free tier when user data is null", () => {
    mockUseCurrentUser.mockReturnValue({ user: null, isLoading: false, isAuthenticated: true });

    act(() => {
      root = createRoot(container);
      root.render(<AuthGate />);
    });
    const desktop = container.querySelector('.marko-user-desktop')!;
    const userMenu = desktop.querySelector('[data-testid="user-menu"]')!;
    expect(userMenu).toBeTruthy();
    const badge = desktop.querySelector('[data-testid="paid-badge"]');
    expect(badge).toBeNull();
  });

  it("renders both desktop and mobile containers", () => {
    mockUseCurrentUser.mockReturnValue({ user: null, isLoading: false, isAuthenticated: false });

    act(() => {
      root = createRoot(container);
      root.render(<AuthGate />);
    });
    expect(container.querySelector('.marko-user-desktop')).toBeTruthy();
    expect(container.querySelector('.marko-user-mobile')).toBeTruthy();
  });
});
