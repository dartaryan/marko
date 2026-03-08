import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { useCurrentUser } from "./useCurrentUser";

const mockUseConvexAuth = vi.fn();
const mockUseQuery = vi.fn();

vi.mock("convex/react", () => ({
  useConvexAuth: () => mockUseConvexAuth(),
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
}));

vi.mock("@/convex/_generated/api", () => ({
  api: {
    users: {
      getCurrentUser: "users:getCurrentUser",
    },
  },
}));

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;
let hookResult: ReturnType<typeof useCurrentUser>;

function TestComponent() {
  hookResult = useCurrentUser();
  return null;
}

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

describe("useCurrentUser", () => {
  it("returns isLoading true when auth is loading", () => {
    mockUseConvexAuth.mockReturnValue({ isAuthenticated: false, isLoading: true });
    mockUseQuery.mockReturnValue(undefined);

    act(() => {
      root = createRoot(container);
      root.render(React.createElement(TestComponent));
    });
    expect(hookResult.isLoading).toBe(true);
    expect(hookResult.isAuthenticated).toBe(false);
    expect(hookResult.user).toBeNull();
  });

  it("returns null user when not authenticated", () => {
    mockUseConvexAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });
    mockUseQuery.mockReturnValue(undefined);

    act(() => {
      root = createRoot(container);
      root.render(React.createElement(TestComponent));
    });
    expect(hookResult.isAuthenticated).toBe(false);
    expect(hookResult.user).toBeNull();
  });

  it("returns user data when authenticated", () => {
    const mockUser = { tier: "free", clerkId: "test", createdAt: 123 };
    mockUseConvexAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });
    mockUseQuery.mockReturnValue(mockUser);

    act(() => {
      root = createRoot(container);
      root.render(React.createElement(TestComponent));
    });
    expect(hookResult.isAuthenticated).toBe(true);
    expect(hookResult.user).toEqual(mockUser);
  });

  it("skips Convex query when not authenticated", () => {
    mockUseConvexAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });
    mockUseQuery.mockReturnValue(undefined);

    act(() => {
      root = createRoot(container);
      root.render(React.createElement(TestComponent));
    });
    expect(mockUseQuery).toHaveBeenCalledWith("users:getCurrentUser", "skip");
  });

  it("passes empty args when authenticated", () => {
    mockUseConvexAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });
    mockUseQuery.mockReturnValue({ tier: "free" });

    act(() => {
      root = createRoot(container);
      root.render(React.createElement(TestComponent));
    });
    expect(mockUseQuery).toHaveBeenCalledWith("users:getCurrentUser", {});
  });
});
