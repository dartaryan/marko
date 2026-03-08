import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { useAiAction } from "./useAiAction";

const { mockCallAi, mockToast } = vi.hoisted(() => ({
  mockCallAi: vi.fn(),
  mockToast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("convex/react", () => ({
  useAction: () => mockCallAi,
}));

vi.mock("sonner", () => ({
  toast: mockToast,
}));

vi.mock("@/convex/_generated/api", () => ({
  api: {
    ai: {
      callAnthropicApi: "callAnthropicApi",
    },
  },
}));

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;
let hookResult: ReturnType<typeof useAiAction>;

function TestComponent() {
  hookResult = useAiAction();
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

describe("useAiAction", () => {
  it("returns initial state with isLoading=false and null result", () => {
    act(() => {
      root = createRoot(container);
      root.render(React.createElement(TestComponent));
    });

    expect(hookResult.isLoading).toBe(false);
    expect(hookResult.result).toBeNull();
    expect(hookResult.error).toBeNull();
  });

  it("sets result on successful action", async () => {
    const mockResponse = {
      result: "Summary text",
      model: "claude-sonnet",
      inputTokens: 100,
      outputTokens: 50,
    };
    mockCallAi.mockResolvedValue(mockResponse);

    act(() => {
      root = createRoot(container);
      root.render(React.createElement(TestComponent));
    });

    await act(async () => {
      await hookResult.executeAction("summarize", "test content");
    });

    expect(hookResult.result).toEqual(mockResponse);
    expect(hookResult.isLoading).toBe(false);
    expect(hookResult.error).toBeNull();
  });

  it("shows success toast on completion", async () => {
    mockCallAi.mockResolvedValue({
      result: "Result",
      model: "claude-sonnet",
      inputTokens: 10,
      outputTokens: 5,
    });

    act(() => {
      root = createRoot(container);
      root.render(React.createElement(TestComponent));
    });

    await act(async () => {
      await hookResult.executeAction("summarize", "content");
    });

    expect(mockToast.success).toHaveBeenCalledWith("AI סיים לעבד");
  });

  it("catches error and sets error state with Hebrew message", async () => {
    mockCallAi.mockRejectedValue({
      data: {
        code: "AI_LIMIT_REACHED",
        message: "הגעת למגבלת השימוש החודשית ב-AI",
      },
    });

    act(() => {
      root = createRoot(container);
      root.render(React.createElement(TestComponent));
    });

    await act(async () => {
      await hookResult.executeAction("summarize", "content");
    });

    expect(hookResult.error).toBe("הגעת למגבלת השימוש החודשית ב-AI");
    expect(hookResult.result).toBeNull();
    expect(hookResult.isLoading).toBe(false);
  });

  it("shows error toast with Hebrew message", async () => {
    mockCallAi.mockRejectedValue({
      data: { message: "שגיאה בעיבוד AI" },
    });

    act(() => {
      root = createRoot(container);
      root.render(React.createElement(TestComponent));
    });

    await act(async () => {
      await hookResult.executeAction("summarize", "content");
    });

    expect(mockToast.error).toHaveBeenCalledWith("שגיאה בעיבוד AI");
  });

  it("uses fallback Hebrew message when error has no data", async () => {
    mockCallAi.mockRejectedValue(new Error("network error"));

    act(() => {
      root = createRoot(container);
      root.render(React.createElement(TestComponent));
    });

    await act(async () => {
      await hookResult.executeAction("summarize", "content");
    });

    expect(hookResult.error).toBe("שגיאה בעיבוד AI");
  });

  it("clearResult resets state", async () => {
    mockCallAi.mockResolvedValue({
      result: "Result",
      model: "claude-sonnet",
      inputTokens: 10,
      outputTokens: 5,
    });

    act(() => {
      root = createRoot(container);
      root.render(React.createElement(TestComponent));
    });

    await act(async () => {
      await hookResult.executeAction("summarize", "content");
    });

    expect(hookResult.result).not.toBeNull();

    act(() => {
      hookResult.clearResult();
    });

    expect(hookResult.result).toBeNull();
    expect(hookResult.error).toBeNull();
  });

  it("exposes errorCode from ConvexError data", async () => {
    mockCallAi.mockRejectedValue({
      data: {
        code: "AI_UNAVAILABLE",
        message: "AI לא זמין כרגע. נסה שוב מאוחר יותר",
      },
    });

    act(() => {
      root = createRoot(container);
      root.render(React.createElement(TestComponent));
    });

    await act(async () => {
      await hookResult.executeAction("summarize", "content");
    });

    expect(hookResult.errorCode).toBe("AI_UNAVAILABLE");
  });

  it("clearResult also resets errorCode", async () => {
    mockCallAi.mockRejectedValue({
      data: { code: "AI_UNAVAILABLE", message: "AI error" },
    });

    act(() => {
      root = createRoot(container);
      root.render(React.createElement(TestComponent));
    });

    await act(async () => {
      await hookResult.executeAction("summarize", "content");
    });

    expect(hookResult.errorCode).toBe("AI_UNAVAILABLE");

    act(() => {
      hookResult.clearResult();
    });

    expect(hookResult.errorCode).toBeNull();
  });

  it("does NOT show error toast for AI_LIMIT_REACHED error code", async () => {
    mockCallAi.mockRejectedValue({
      data: {
        code: "AI_LIMIT_REACHED",
        message: "הגעת למגבלת השימוש החודשית ב-AI",
      },
    });

    act(() => {
      root = createRoot(container);
      root.render(React.createElement(TestComponent));
    });

    await act(async () => {
      await hookResult.executeAction("summarize", "content");
    });

    expect(hookResult.errorCode).toBe("AI_LIMIT_REACHED");
    expect(hookResult.error).toBe("הגעת למגבלת השימוש החודשית ב-AI");
    expect(mockToast.error).not.toHaveBeenCalled();
  });

  it("passes targetLanguage for translate action", async () => {
    mockCallAi.mockResolvedValue({
      result: "Translated",
      model: "claude-sonnet",
      inputTokens: 10,
      outputTokens: 5,
    });

    act(() => {
      root = createRoot(container);
      root.render(React.createElement(TestComponent));
    });

    await act(async () => {
      await hookResult.executeAction("translate", "content", "en");
    });

    expect(mockCallAi).toHaveBeenCalledWith({
      actionType: "translate",
      content: "content",
      targetLanguage: "en",
    });
  });
});
