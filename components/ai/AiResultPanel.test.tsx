import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { AiResultPanel } from "./AiResultPanel";

vi.mock("@/lib/markdown/render-pipeline", () => ({
  renderMarkdown: (content: string) => `<p>${content}</p>`,
}));

vi.mock("isomorphic-dompurify", () => ({
  default: {
    sanitize: (html: string) => html,
  },
}));

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  vi.clearAllMocks();

  Object.assign(navigator, {
    clipboard: {
      writeText: vi.fn().mockResolvedValue(undefined),
    },
  });
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
});

describe("AiResultPanel", () => {
  it("returns null when not loading and no result", () => {
    act(() => {
      root = createRoot(container);
      root.render(
        <AiResultPanel
          isLoading={false}
          result={null}
          onAccept={vi.fn()}
          onDismiss={vi.fn()}
        />
      );
    });

    expect(container.innerHTML).toBe("");
  });

  it("shows skeleton loading state when isLoading=true", () => {
    act(() => {
      root = createRoot(container);
      root.render(
        <AiResultPanel
          isLoading={true}
          result={null}
          onAccept={vi.fn()}
          onDismiss={vi.fn()}
        />
      );
    });

    const html = container.innerHTML;
    expect(html).toContain('data-testid="ai-loading-skeleton"');
    expect(html).toContain("מעבד");
  });

  it("renders AI result when result is provided", () => {
    const result = {
      result: "Summary of document",
      model: "claude-sonnet",
      inputTokens: 100,
      outputTokens: 50,
    };

    act(() => {
      root = createRoot(container);
      root.render(
        <AiResultPanel
          isLoading={false}
          result={result}
          onAccept={vi.fn()}
          onDismiss={vi.fn()}
        />
      );
    });

    const html = container.innerHTML;
    expect(html).toContain("Summary of document");
  });

  it("calls onAccept when Accept button is clicked", () => {
    const onAccept = vi.fn();
    const result = {
      result: "AI output text",
      model: "claude-sonnet",
      inputTokens: 100,
      outputTokens: 50,
    };

    act(() => {
      root = createRoot(container);
      root.render(
        <AiResultPanel
          isLoading={false}
          result={result}
          onAccept={onAccept}
          onDismiss={vi.fn()}
        />
      );
    });

    const acceptBtn = container.querySelector(
      '[data-testid="ai-accept-btn"]'
    );
    expect(acceptBtn).not.toBeNull();

    act(() => {
      acceptBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onAccept).toHaveBeenCalledWith("AI output text");
  });

  it("calls onDismiss when Dismiss button is clicked", () => {
    const onDismiss = vi.fn();
    const result = {
      result: "AI output",
      model: "claude-sonnet",
      inputTokens: 10,
      outputTokens: 5,
    };

    act(() => {
      root = createRoot(container);
      root.render(
        <AiResultPanel
          isLoading={false}
          result={result}
          onAccept={vi.fn()}
          onDismiss={onDismiss}
        />
      );
    });

    const dismissBtn = container.querySelector(
      '[data-testid="ai-dismiss-btn"]'
    );
    act(() => {
      dismissBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onDismiss).toHaveBeenCalled();
  });

  it("copies text to clipboard when Copy button is clicked", async () => {
    const result = {
      result: "Copy me",
      model: "claude-sonnet",
      inputTokens: 10,
      outputTokens: 5,
    };

    act(() => {
      root = createRoot(container);
      root.render(
        <AiResultPanel
          isLoading={false}
          result={result}
          onAccept={vi.fn()}
          onDismiss={vi.fn()}
        />
      );
    });

    const copyBtn = container.querySelector('[data-testid="ai-copy-btn"]');
    await act(async () => {
      copyBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("Copy me");
  });

  it('has correct ARIA attributes: role="complementary" and aria-label="תוצאת AI"', () => {
    const result = {
      result: "Result",
      model: "claude-sonnet",
      inputTokens: 10,
      outputTokens: 5,
    };

    act(() => {
      root = createRoot(container);
      root.render(
        <AiResultPanel
          isLoading={false}
          result={result}
          onAccept={vi.fn()}
          onDismiss={vi.fn()}
        />
      );
    });

    const panel = container.querySelector('[data-testid="ai-result-panel"]');
    expect(panel?.getAttribute("role")).toBe("complementary");
    expect(panel?.getAttribute("aria-label")).toBe("תוצאת AI");
  });

  it("buttons have Hebrew ARIA labels", () => {
    const result = {
      result: "Result",
      model: "claude-sonnet",
      inputTokens: 10,
      outputTokens: 5,
    };

    act(() => {
      root = createRoot(container);
      root.render(
        <AiResultPanel
          isLoading={false}
          result={result}
          onAccept={vi.fn()}
          onDismiss={vi.fn()}
        />
      );
    });

    const html = container.innerHTML;
    expect(html).toContain('aria-label="הכנס לעורך"');
    expect(html).toContain('aria-label="סגור"');
    expect(html).toContain('aria-label="העתק"');
  });
});
