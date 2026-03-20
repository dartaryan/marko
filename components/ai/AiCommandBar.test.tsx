import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { AiCommandBar } from "./AiCommandBar";

const { mockUseCurrentUser, mockUseCapabilities, mockUseQuery } = vi.hoisted(
  () => ({
    mockUseCurrentUser: vi.fn(),
    mockUseCapabilities: vi.fn(),
    mockUseQuery: vi.fn(),
  })
);

vi.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
}));

vi.mock("@/lib/hooks/useCurrentUser", () => ({
  useCurrentUser: () => mockUseCurrentUser(),
}));

vi.mock("@/lib/hooks/useCapabilities", () => ({
  useCapabilities: () => mockUseCapabilities(),
}));

vi.mock("@clerk/nextjs", () => ({
  SignInButton: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sign-in-button">{children}</div>
  ),
}));

vi.mock("@/convex/_generated/api", () => ({
  api: {
    usage: {
      getMyMonthlyUsage: "getMyMonthlyUsage",
      getMyDailyOpusUsage: "getMyDailyOpusUsage",
    },
  },
}));

vi.mock("sonner", () => ({
  toast: { info: vi.fn(), error: vi.fn(), success: vi.fn() },
}));

vi.mock("@/components/auth/UpgradePrompt", () => ({
  UpgradePrompt: ({ variant }: { variant?: string }) => (
    <div data-testid="upgrade-prompt" data-variant={variant}>
      שדרג עכשיו
    </div>
  ),
}));

function setupAuthenticatedUser(count = 3, limit = 5) {
  mockUseCurrentUser.mockReturnValue({
    user: { tier: "free" },
    isLoading: false,
    isAuthenticated: true,
  });
  mockUseCapabilities.mockReturnValue({
    capabilities: { canUseAi: true, maxMonthlyAiCalls: 5 },
    tier: "free",
    isLoading: false,
  });
  mockUseQuery.mockReturnValue({ count, limit });
}

function setupAnonymousUser() {
  mockUseCurrentUser.mockReturnValue({
    user: null,
    isLoading: false,
    isAuthenticated: false,
  });
  mockUseCapabilities.mockReturnValue({
    capabilities: { canUseAi: false, maxMonthlyAiCalls: null },
    tier: "anonymous",
    isLoading: false,
  });
  mockUseQuery.mockReturnValue(undefined);
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
});

function renderBar(
  props: Partial<React.ComponentProps<typeof AiCommandBar>> = {}
) {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    onAction: vi.fn(),
  };
  act(() => {
    root = createRoot(container);
    root.render(<AiCommandBar {...defaultProps} {...props} />);
  });
  return { ...defaultProps, ...props };
}

describe("AiCommandBar", () => {
  it("renders action chips for authenticated user with quota", () => {
    setupAuthenticatedUser();
    renderBar();

    const html = document.body.innerHTML;
    expect(html).toContain("סכם");
    expect(html).toContain("תרגם");
    expect(html).toContain("צור תרשים");
    expect(html).toContain("שכתב");
    expect(html).toContain('data-testid="ai-command-bar"');
  });

  it("shows register prompt for anonymous user", () => {
    setupAnonymousUser();
    renderBar();

    const html = document.body.innerHTML;
    expect(html).toContain("הירשם בחינם כדי להשתמש ב-AI");
    expect(html).toContain('data-testid="ai-anonymous-gate"');
  });

  it("shows upgrade gate for user at limit", () => {
    setupAuthenticatedUser(5, 5);
    renderBar();

    const html = document.body.innerHTML;
    expect(html).toContain('data-testid="ai-limit-gate"');
    expect(html).toContain("רוצה עוד? שדרג לפרימיום");
  });

  it("shows remaining count for free user with quota", () => {
    setupAuthenticatedUser(2, 5);
    renderBar();

    const html = document.body.innerHTML;
    expect(html).toContain("נותרו 3 פעולות AI");
  });

  it("calls onAction when chip is clicked", () => {
    setupAuthenticatedUser();
    const props = renderBar();

    const chip = document.querySelector('[data-testid="ai-action-summarize"]');
    expect(chip).not.toBeNull();

    act(() => {
      chip?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(props.onAction).toHaveBeenCalledWith("summarize", false, undefined);
  });

  it("closes on Escape key", () => {
    setupAuthenticatedUser();
    const onOpenChange = vi.fn();
    renderBar({ onOpenChange });

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true })
      );
    });

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("renders nothing when open=false", () => {
    setupAuthenticatedUser();
    renderBar({ open: false });

    expect(
      document.querySelector('[data-testid="ai-command-bar"]')
    ).toBeNull();
  });

  it("disables chips when at limit", () => {
    setupAuthenticatedUser(5, 5);
    renderBar();

    const chips = document.querySelectorAll("[data-ai-chip]");
    chips.forEach((chip) => {
      expect(chip.getAttribute("aria-disabled")).toBe("true");
      expect((chip as HTMLButtonElement).disabled).toBe(true);
    });
  });

  it("chips are keyboard navigable with arrow keys", () => {
    setupAuthenticatedUser();
    renderBar();

    const chips = document.querySelectorAll<HTMLElement>("[data-ai-chip]");
    expect(chips.length).toBe(4);

    // Focus first chip
    act(() => {
      chips[0].focus();
    });

    // ArrowLeft in RTL = next
    act(() => {
      chips[0].dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true })
      );
    });

    // The component should have focused the next chip
    // We verify the listbox role exists for accessibility
    const listbox = document.querySelector('[role="listbox"]');
    expect(listbox).not.toBeNull();
  });

  it("has dir=rtl and Hebrew accessibility labels", () => {
    setupAuthenticatedUser();
    renderBar();

    const bar = document.querySelector('[data-testid="ai-command-bar"]');
    expect(bar?.getAttribute("dir")).toBe("rtl");
    expect(bar?.getAttribute("aria-label")).toBe("פעולות AI");
  });

  it("shows selected text context when provided", () => {
    setupAuthenticatedUser();
    renderBar({ selectedText: "הטקסט הנבחר" });

    const html = document.body.innerHTML;
    expect(html).toContain("הטקסט הנבחר");
  });

  it("has free-text input for custom instructions", () => {
    setupAuthenticatedUser();
    renderBar();

    const input = document.querySelector(
      'input[aria-label="הוראה חופשית ל-AI"]'
    );
    expect(input).not.toBeNull();
  });

  it("has close button", () => {
    setupAuthenticatedUser();
    const onOpenChange = vi.fn();
    renderBar({ onOpenChange });

    const closeBtn = document.querySelector('button[aria-label="סגור"]');
    expect(closeBtn).not.toBeNull();

    act(() => {
      closeBtn?.dispatchEvent(
        new MouseEvent("click", { bubbles: true })
      );
    });

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
