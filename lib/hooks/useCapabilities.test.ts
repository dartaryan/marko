import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { useCapabilities } from "./useCapabilities";

const mockUseCurrentUser = vi.fn();

vi.mock("@/lib/hooks/useCurrentUser", () => ({
  useCurrentUser: () => mockUseCurrentUser(),
}));

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;
let hookResult: ReturnType<typeof useCapabilities>;

function TestComponent() {
  hookResult = useCapabilities();
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

describe("useCapabilities", () => {
  it("returns anonymous capabilities when not authenticated", () => {
    mockUseCurrentUser.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });

    act(() => {
      root = createRoot(container);
      root.render(React.createElement(TestComponent));
    });

    expect(hookResult.tier).toBe("anonymous");
    expect(hookResult.capabilities.canUseAi).toBe(false);
    expect(hookResult.capabilities.canUseSonnet).toBe(false);
    expect(hookResult.capabilities.canUseOpus).toBe(false);
    expect(hookResult.isLoading).toBe(false);
  });

  it("returns free tier capabilities for free user", () => {
    mockUseCurrentUser.mockReturnValue({
      user: { tier: "free", clerkId: "test", createdAt: 123 },
      isLoading: false,
      isAuthenticated: true,
    });

    act(() => {
      root = createRoot(container);
      root.render(React.createElement(TestComponent));
    });

    expect(hookResult.tier).toBe("free");
    expect(hookResult.capabilities.canUseAi).toBe(true);
    expect(hookResult.capabilities.canUseSonnet).toBe(true);
    expect(hookResult.capabilities.canUseOpus).toBe(false);
    expect(hookResult.capabilities.hasAiLimit).toBe(true);
  });

  it("returns paid tier capabilities for paid user", () => {
    mockUseCurrentUser.mockReturnValue({
      user: { tier: "paid", clerkId: "test", createdAt: 123 },
      isLoading: false,
      isAuthenticated: true,
    });

    act(() => {
      root = createRoot(container);
      root.render(React.createElement(TestComponent));
    });

    expect(hookResult.tier).toBe("paid");
    expect(hookResult.capabilities.canUseAi).toBe(true);
    expect(hookResult.capabilities.canUseSonnet).toBe(true);
    expect(hookResult.capabilities.canUseOpus).toBe(true);
    expect(hookResult.capabilities.hasAiLimit).toBe(false);
  });

  it("returns isLoading true when auth is loading", () => {
    mockUseCurrentUser.mockReturnValue({
      user: null,
      isLoading: true,
      isAuthenticated: false,
    });

    act(() => {
      root = createRoot(container);
      root.render(React.createElement(TestComponent));
    });

    expect(hookResult.isLoading).toBe(true);
    expect(hookResult.tier).toBe("anonymous");
  });
});
