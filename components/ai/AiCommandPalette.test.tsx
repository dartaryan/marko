import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { AiCommandPalette } from "./AiCommandPalette";

// cmdk uses ResizeObserver internally — not available in jsdom
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// cmdk uses scrollIntoView — not available in jsdom
if (typeof Element.prototype.scrollIntoView === "undefined") {
  Element.prototype.scrollIntoView = vi.fn();
}

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

function renderPalette(
  props: Partial<React.ComponentProps<typeof AiCommandPalette>> = {}
) {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    onAction: vi.fn(),
  };
  act(() => {
    root = createRoot(container);
    root.render(<AiCommandPalette {...defaultProps} {...props} />);
  });
  return { ...defaultProps, ...props };
}

describe("AiCommandPalette", () => {
  it("renders 4 action items for authenticated free user with quota", () => {
    mockUseCurrentUser.mockReturnValue({
      user: { tier: "free" },
      isLoading: false,
      isAuthenticated: true,
    });
    mockUseCapabilities.mockReturnValue({
      capabilities: { canUseAi: true, maxMonthlyAiCalls: 10 },
      tier: "free",
      isLoading: false,
    });
    mockUseQuery.mockReturnValue({ count: 3, limit: 10 });

    renderPalette();

    const html = document.body.innerHTML;
    expect(html).toContain("סכם את המסמך");
    expect(html).toContain("תרגם לאנגלית");
    expect(html).toContain("חלץ משימות");
    expect(html).toContain("שפר ניסוח");
  });

  it("shows register prompt for anonymous user", () => {
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

    renderPalette();

    const html = document.body.innerHTML;
    expect(html).toContain("הירשם בחינם כדי להשתמש ב-AI");
    expect(html).toContain('data-testid="ai-anonymous-gate"');
  });

  it("shows dimmed actions + upgrade gate for user at limit", () => {
    mockUseCurrentUser.mockReturnValue({
      user: { tier: "free" },
      isLoading: false,
      isAuthenticated: true,
    });
    mockUseCapabilities.mockReturnValue({
      capabilities: { canUseAi: true, maxMonthlyAiCalls: 10 },
      tier: "free",
      isLoading: false,
    });
    mockUseQuery.mockReturnValue({ count: 10, limit: 10 });

    renderPalette();

    const html = document.body.innerHTML;
    expect(html).toContain('data-testid="ai-limit-gate"');
    expect(html).toContain("ניצלת את כל פעולות ה-AI החינמיות החודש");
  });

  it('shows remaining count "נותרו X פעולות AI" for free user with quota', () => {
    mockUseCurrentUser.mockReturnValue({
      user: { tier: "free" },
      isLoading: false,
      isAuthenticated: true,
    });
    mockUseCapabilities.mockReturnValue({
      capabilities: { canUseAi: true, maxMonthlyAiCalls: 10 },
      tier: "free",
      isLoading: false,
    });
    mockUseQuery.mockReturnValue({ count: 3, limit: 10 });

    renderPalette();

    const html = document.body.innerHTML;
    expect(html).toContain("נותרו 7 פעולות AI");
  });

  it("calls onAction callback when action is selected", () => {
    mockUseCurrentUser.mockReturnValue({
      user: { tier: "free" },
      isLoading: false,
      isAuthenticated: true,
    });
    mockUseCapabilities.mockReturnValue({
      capabilities: { canUseAi: true, maxMonthlyAiCalls: 10 },
      tier: "free",
      isLoading: false,
    });
    mockUseQuery.mockReturnValue({ count: 3, limit: 10 });

    const props = renderPalette();

    const summarizeItem = document.querySelector(
      '[data-testid="ai-action-summarize"]'
    );
    expect(summarizeItem).not.toBeNull();

    act(() => {
      summarizeItem?.dispatchEvent(
        new MouseEvent("click", { bubbles: true })
      );
    });

    expect(props.onAction).toHaveBeenCalledWith("summarize");
  });

  it("shows all actions enabled with no limit display for paid user", () => {
    mockUseCurrentUser.mockReturnValue({
      user: { tier: "paid" },
      isLoading: false,
      isAuthenticated: true,
    });
    mockUseCapabilities.mockReturnValue({
      capabilities: { canUseAi: true, maxMonthlyAiCalls: null },
      tier: "paid",
      isLoading: false,
    });
    mockUseQuery.mockReturnValue({ count: 50, limit: null });

    renderPalette();

    const html = document.body.innerHTML;
    expect(html).toContain("סכם את המסמך");
    expect(html).toContain("תרגם לאנגלית");
    expect(html).toContain("חלץ משימות");
    expect(html).toContain("שפר ניסוח");
    expect(html).not.toContain('data-testid="ai-limit-gate"');
    expect(html).not.toContain('data-testid="ai-remaining-count"');
    expect(html).not.toContain('data-testid="ai-anonymous-gate"');
  });

  it("closes palette on Escape key", () => {
    mockUseCurrentUser.mockReturnValue({
      user: { tier: "free" },
      isLoading: false,
      isAuthenticated: true,
    });
    mockUseCapabilities.mockReturnValue({
      capabilities: { canUseAi: true, maxMonthlyAiCalls: 10 },
      tier: "free",
      isLoading: false,
    });
    mockUseQuery.mockReturnValue({ count: 3, limit: 10 });

    const onOpenChange = vi.fn();
    renderPalette({ onOpenChange });

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true })
      );
    });

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  // Story 6.4 tests
  it("shows UpgradePrompt component in gate section when user at limit", () => {
    mockUseCurrentUser.mockReturnValue({
      user: { tier: "free" },
      isLoading: false,
      isAuthenticated: true,
    });
    mockUseCapabilities.mockReturnValue({
      capabilities: { canUseAi: true, maxMonthlyAiCalls: 10 },
      tier: "free",
      isLoading: false,
    });
    mockUseQuery.mockReturnValue({ count: 10, limit: 10 });

    renderPalette();

    const upgradePrompt = document.querySelector(
      '[data-testid="upgrade-prompt"]'
    );
    expect(upgradePrompt).not.toBeNull();
    expect(upgradePrompt!.getAttribute("data-variant")).toBe("palette");
  });

  it("does not show UpgradePrompt for free user with remaining quota", () => {
    mockUseCurrentUser.mockReturnValue({
      user: { tier: "free" },
      isLoading: false,
      isAuthenticated: true,
    });
    mockUseCapabilities.mockReturnValue({
      capabilities: { canUseAi: true, maxMonthlyAiCalls: 10 },
      tier: "free",
      isLoading: false,
    });
    mockUseQuery.mockReturnValue({ count: 3, limit: 10 });

    renderPalette();

    const upgradePrompt = document.querySelector(
      '[data-testid="upgrade-prompt"]'
    );
    expect(upgradePrompt).toBeNull();
  });

  it("does not show UpgradePrompt or limit info for paid user", () => {
    mockUseCurrentUser.mockReturnValue({
      user: { tier: "paid" },
      isLoading: false,
      isAuthenticated: true,
    });
    mockUseCapabilities.mockReturnValue({
      capabilities: { canUseAi: true, maxMonthlyAiCalls: null },
      tier: "paid",
      isLoading: false,
    });
    mockUseQuery.mockReturnValue({ count: 50, limit: null });

    renderPalette();

    const upgradePrompt = document.querySelector(
      '[data-testid="upgrade-prompt"]'
    );
    expect(upgradePrompt).toBeNull();
    expect(document.body.innerHTML).not.toContain("נותרו");
    expect(document.body.innerHTML).not.toContain("ניצלת");
  });

  it("disabled actions have aria-disabled='true' when at limit", () => {
    mockUseCurrentUser.mockReturnValue({
      user: { tier: "free" },
      isLoading: false,
      isAuthenticated: true,
    });
    mockUseCapabilities.mockReturnValue({
      capabilities: { canUseAi: true, maxMonthlyAiCalls: 10 },
      tier: "free",
      isLoading: false,
    });
    mockUseQuery.mockReturnValue({ count: 10, limit: 10 });

    renderPalette();

    const actionItems = document.querySelectorAll(
      '[data-testid^="ai-action-"]'
    );
    actionItems.forEach((item) => {
      expect(item.getAttribute("aria-disabled")).toBe("true");
    });
  });

  it("disables actions while usage query is loading", () => {
    mockUseCurrentUser.mockReturnValue({
      user: { tier: "free" },
      isLoading: false,
      isAuthenticated: true,
    });
    mockUseCapabilities.mockReturnValue({
      capabilities: { canUseAi: true, maxMonthlyAiCalls: 10 },
      tier: "free",
      isLoading: false,
    });
    mockUseQuery.mockReturnValue(undefined); // Loading state

    renderPalette();

    const actionItems = document.querySelectorAll(
      '[data-testid^="ai-action-"]'
    );
    actionItems.forEach((item) => {
      expect(item.getAttribute("aria-disabled")).toBe("true");
    });
    // Should not show gate or remaining count while loading
    expect(document.body.innerHTML).not.toContain(
      'data-testid="ai-limit-gate"'
    );
    expect(document.body.innerHTML).not.toContain(
      'data-testid="ai-remaining-count"'
    );
  });

  it("calls useQuery with 'skip' for anonymous user", () => {
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

    renderPalette();

    expect(mockUseQuery).toHaveBeenCalledWith("getMyMonthlyUsage", "skip");
  });

  it("calls useQuery with args for authenticated user", () => {
    mockUseCurrentUser.mockReturnValue({
      user: { tier: "free" },
      isLoading: false,
      isAuthenticated: true,
    });
    mockUseCapabilities.mockReturnValue({
      capabilities: { canUseAi: true, maxMonthlyAiCalls: 10 },
      tier: "free",
      isLoading: false,
    });
    mockUseQuery.mockReturnValue({ count: 3, limit: 10 });

    renderPalette();

    expect(mockUseQuery).toHaveBeenCalledWith("getMyMonthlyUsage", {});
  });

  it("remaining count section has aria-live='polite'", () => {
    mockUseCurrentUser.mockReturnValue({
      user: { tier: "free" },
      isLoading: false,
      isAuthenticated: true,
    });
    mockUseCapabilities.mockReturnValue({
      capabilities: { canUseAi: true, maxMonthlyAiCalls: 10 },
      tier: "free",
      isLoading: false,
    });
    mockUseQuery.mockReturnValue({ count: 3, limit: 10 });

    renderPalette();

    const remainingSection = document.querySelector(
      '[data-testid="ai-remaining-count"]'
    );
    expect(remainingSection).not.toBeNull();
    expect(remainingSection!.getAttribute("aria-live")).toBe("polite");
  });
});
