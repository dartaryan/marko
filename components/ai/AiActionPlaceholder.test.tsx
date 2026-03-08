import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { AiActionPlaceholder } from "./AiActionPlaceholder";

const mockUseConvexAuth = vi.fn();

vi.mock("convex/react", () => ({
  useConvexAuth: () => mockUseConvexAuth(),
}));

vi.mock("@clerk/nextjs", () => ({
  SignInButton: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sign-in-button-wrapper">{children}</div>
  ),
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

describe("AiActionPlaceholder", () => {
  it("shows register prompt for anonymous users", () => {
    mockUseConvexAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });

    act(() => {
      root = createRoot(container);
      root.render(<AiActionPlaceholder />);
    });
    const prompt = container.querySelector('[data-testid="ai-anonymous-prompt"]')!;
    expect(prompt).toBeTruthy();
    expect(prompt.textContent).toContain("הירשם בחינם כדי להשתמש ב-AI");
  });

  it("wraps anonymous prompt with SignInButton", () => {
    mockUseConvexAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });

    act(() => {
      root = createRoot(container);
      root.render(<AiActionPlaceholder />);
    });
    const wrapper = container.querySelector('[data-testid="sign-in-button-wrapper"]')!;
    expect(wrapper).toBeTruthy();
  });

  it("shows placeholder text for authenticated users", () => {
    mockUseConvexAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });

    act(() => {
      root = createRoot(container);
      root.render(<AiActionPlaceholder />);
    });
    const placeholder = container.querySelector('[data-testid="ai-placeholder"]')!;
    expect(placeholder).toBeTruthy();
    expect(placeholder.textContent).toContain("פעולות AI יהיו זמינות בקרוב");
  });

  it("does not show anonymous prompt for authenticated users", () => {
    mockUseConvexAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });

    act(() => {
      root = createRoot(container);
      root.render(<AiActionPlaceholder />);
    });
    const prompt = container.querySelector('[data-testid="ai-anonymous-prompt"]');
    expect(prompt).toBeNull();
  });

  it("renders nothing while loading", () => {
    mockUseConvexAuth.mockReturnValue({ isAuthenticated: false, isLoading: true });

    act(() => {
      root = createRoot(container);
      root.render(<AiActionPlaceholder />);
    });
    expect(container.innerHTML).toBe("");
  });
});
