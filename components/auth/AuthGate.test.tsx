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
  SignInButton: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sign-in-button-wrapper">{children}</div>
  ),
  UserButton: () => <div data-testid="clerk-user-button" />,
  useClerk: () => ({ signOut: vi.fn() }),
}));

vi.mock("convex/react", () => ({
  useAction: () => vi.fn(),
}));

vi.mock("@/convex/_generated/api", () => ({
  api: { users: { deleteMyAccount: "users:deleteMyAccount" } },
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
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

  it("shows AuthButton when not authenticated", () => {
    mockUseCurrentUser.mockReturnValue({ user: null, isLoading: false, isAuthenticated: false });

    act(() => {
      root = createRoot(container);
      root.render(<AuthGate />);
    });
    const authBtn = container.querySelector('[data-testid="auth-button"]')!;
    expect(authBtn).toBeTruthy();
    expect(authBtn.textContent).toBe("הרשמה / התחברות");
  });

  it("shows UserMenu when authenticated (free tier)", () => {
    mockUseCurrentUser.mockReturnValue({ user: { tier: "free" }, isLoading: false, isAuthenticated: true });

    act(() => {
      root = createRoot(container);
      root.render(<AuthGate />);
    });
    const userMenu = container.querySelector('[data-testid="user-menu"]')!;
    expect(userMenu).toBeTruthy();
    const badge = container.querySelector('[data-testid="paid-badge"]');
    expect(badge).toBeNull();
  });

  it("shows UserMenu with gold badge when authenticated (paid tier)", () => {
    mockUseCurrentUser.mockReturnValue({ user: { tier: "paid" }, isLoading: false, isAuthenticated: true });

    act(() => {
      root = createRoot(container);
      root.render(<AuthGate />);
    });
    const userMenu = container.querySelector('[data-testid="user-menu"]')!;
    expect(userMenu).toBeTruthy();
    const badge = container.querySelector('[data-testid="paid-badge"]')!;
    expect(badge).toBeTruthy();
  });

  it("defaults to free tier when user data is still loading", () => {
    mockUseCurrentUser.mockReturnValue({ user: null, isLoading: false, isAuthenticated: true });

    act(() => {
      root = createRoot(container);
      root.render(<AuthGate />);
    });
    const userMenu = container.querySelector('[data-testid="user-menu"]')!;
    expect(userMenu).toBeTruthy();
    const badge = container.querySelector('[data-testid="paid-badge"]');
    expect(badge).toBeNull();
  });
});
