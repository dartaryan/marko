import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { AuthButton } from "./AuthButton";

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
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
});

describe("AuthButton", () => {
  it("renders a button with Hebrew text", () => {
    act(() => {
      root = createRoot(container);
      root.render(<AuthButton />);
    });
    const btn = container.querySelector('[data-testid="auth-button"]')!;
    expect(btn).toBeTruthy();
    expect(btn.textContent).toBe("הרשמה / התחברות");
  });

  it("renders with outline variant styling", () => {
    act(() => {
      root = createRoot(container);
      root.render(<AuthButton />);
    });
    const btn = container.querySelector('[data-testid="auth-button"]')!;
    expect(btn.getAttribute("data-variant")).toBe("outline");
  });

  it("renders with sm size", () => {
    act(() => {
      root = createRoot(container);
      root.render(<AuthButton />);
    });
    const btn = container.querySelector('[data-testid="auth-button"]')!;
    expect(btn.getAttribute("data-size")).toBe("sm");
  });

  it("is wrapped by Clerk SignInButton", () => {
    act(() => {
      root = createRoot(container);
      root.render(<AuthButton />);
    });
    const wrapper = container.querySelector(
      '[data-testid="sign-in-button-wrapper"]'
    )!;
    expect(wrapper).toBeTruthy();
    const btn = wrapper.querySelector('[data-testid="auth-button"]')!;
    expect(btn).toBeTruthy();
  });
});
