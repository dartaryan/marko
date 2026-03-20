import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { AiSuggestionCard } from "./AiSuggestionCard";

vi.mock("isomorphic-dompurify", () => ({
  default: { sanitize: (html: string) => html },
}));

vi.mock("@/lib/markdown/render-pipeline", () => ({
  renderMarkdown: (text: string) => `<p>${text}</p>`,
}));

vi.mock("sonner", () => ({
  toast: { info: vi.fn(), error: vi.fn(), success: vi.fn() },
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

function renderCard(
  props: Partial<React.ComponentProps<typeof AiSuggestionCard>> = {}
) {
  const defaultProps = {
    isLoading: false,
    result: null,
    onAccept: vi.fn(),
    onDismiss: vi.fn(),
  };
  act(() => {
    root = createRoot(container);
    root.render(<AiSuggestionCard {...defaultProps} {...props} />);
  });
  return { ...defaultProps, ...props };
}

describe("AiSuggestionCard", () => {
  it("renders nothing when not loading and no result", () => {
    renderCard();
    expect(
      document.querySelector('[data-testid="ai-suggestion-card"]')
    ).toBeNull();
  });

  it("shows loading skeleton when isLoading=true", () => {
    renderCard({ isLoading: true });

    const skeleton = document.querySelector(
      '[data-testid="ai-loading-skeleton"]'
    );
    expect(skeleton).not.toBeNull();
    expect(document.body.innerHTML).toContain("...מעבד");
  });

  it("renders result with Accept, Discard buttons", () => {
    const result = {
      result: "תוצאה לדוגמה",
      model: "sonnet",
      inputTokens: 100,
      outputTokens: 50,
    };
    renderCard({ result });

    const html = document.body.innerHTML;
    expect(html).toContain("תוצאה לדוגמה");
    expect(
      document.querySelector('[data-testid="ai-accept-btn"]')
    ).not.toBeNull();
    expect(
      document.querySelector('[data-testid="ai-dismiss-btn"]')
    ).not.toBeNull();
  });

  it("shows Regenerate button when onRegenerate is provided", () => {
    const result = {
      result: "test",
      model: "sonnet",
      inputTokens: 100,
      outputTokens: 50,
    };
    renderCard({ result, onRegenerate: vi.fn() });

    expect(
      document.querySelector('[data-testid="ai-regenerate-btn"]')
    ).not.toBeNull();
  });

  it("does not show Regenerate button when onRegenerate is undefined", () => {
    const result = {
      result: "test",
      model: "sonnet",
      inputTokens: 100,
      outputTokens: 50,
    };
    renderCard({ result });

    expect(
      document.querySelector('[data-testid="ai-regenerate-btn"]')
    ).toBeNull();
  });

  it("calls onAccept with result text when Accept is clicked", () => {
    const result = {
      result: "תוצאה לדוגמה",
      model: "sonnet",
      inputTokens: 100,
      outputTokens: 50,
    };
    const props = renderCard({ result });

    const acceptBtn = document.querySelector(
      '[data-testid="ai-accept-btn"]'
    );
    act(() => {
      acceptBtn?.dispatchEvent(
        new MouseEvent("click", { bubbles: true })
      );
    });

    expect(props.onAccept).toHaveBeenCalledWith("תוצאה לדוגמה");
  });

  it("calls onDismiss when Discard is clicked", () => {
    const result = {
      result: "test",
      model: "sonnet",
      inputTokens: 100,
      outputTokens: 50,
    };
    const props = renderCard({ result });

    const dismissBtn = document.querySelector(
      '[data-testid="ai-dismiss-btn"]'
    );
    act(() => {
      dismissBtn?.dispatchEvent(
        new MouseEvent("click", { bubbles: true })
      );
    });

    expect(props.onDismiss).toHaveBeenCalled();
  });

  it("calls onRegenerate when Regenerate is clicked", () => {
    const result = {
      result: "test",
      model: "sonnet",
      inputTokens: 100,
      outputTokens: 50,
    };
    const onRegenerate = vi.fn();
    renderCard({ result, onRegenerate });

    const regenBtn = document.querySelector(
      '[data-testid="ai-regenerate-btn"]'
    );
    act(() => {
      regenBtn?.dispatchEvent(
        new MouseEvent("click", { bubbles: true })
      );
    });

    expect(onRegenerate).toHaveBeenCalled();
  });

  it("applies blur class when isBlurred=true", () => {
    const result = {
      result: "test",
      model: "sonnet",
      inputTokens: 100,
      outputTokens: 50,
    };
    renderCard({ result, isBlurred: true });

    const blurred = document.querySelector(".marko-ai-result-blurred");
    expect(blurred).not.toBeNull();
  });

  it("disables Accept and Regenerate when isBlurred=true", () => {
    const result = {
      result: "test",
      model: "sonnet",
      inputTokens: 100,
      outputTokens: 50,
    };
    renderCard({ result, isBlurred: true, onRegenerate: vi.fn() });

    const acceptBtn = document.querySelector(
      '[data-testid="ai-accept-btn"]'
    ) as HTMLButtonElement;
    const regenBtn = document.querySelector(
      '[data-testid="ai-regenerate-btn"]'
    ) as HTMLButtonElement;

    expect(acceptBtn.disabled).toBe(true);
    expect(regenBtn.disabled).toBe(true);
  });

  it("has dir=rtl and Hebrew accessibility label", () => {
    const result = {
      result: "test",
      model: "sonnet",
      inputTokens: 100,
      outputTokens: 50,
    };
    renderCard({ result });

    const card = document.querySelector(
      '[data-testid="ai-suggestion-card"]'
    );
    expect(card?.getAttribute("dir")).toBe("rtl");
    expect(card?.getAttribute("aria-label")).toBe("הצעת AI");
  });

  it("has gradient border element", () => {
    const result = {
      result: "test",
      model: "sonnet",
      inputTokens: 100,
      outputTokens: 50,
    };
    renderCard({ result });

    const border = document.querySelector(".marko-suggestion-card-border");
    expect(border).not.toBeNull();
  });
});
