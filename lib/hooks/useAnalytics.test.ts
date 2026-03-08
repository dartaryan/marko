import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { useAnalytics } from "./useAnalytics";

const mockTrackEvent = vi.fn();

vi.mock("convex/react", () => ({
  useMutation: () => mockTrackEvent,
}));

vi.mock("@/convex/_generated/api", () => ({
  api: {
    analytics: {
      trackEvent: "trackEvent",
    },
  },
}));

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;
let hookResult: ReturnType<typeof useAnalytics>;

function TestComponent() {
  hookResult = useAnalytics();
  return null;
}

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  vi.clearAllMocks();
  mockTrackEvent.mockResolvedValue(undefined);
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
});

describe("useAnalytics", () => {
  it("track calls mutation with event name and metadata", () => {
    act(() => {
      root = createRoot(container);
      root.render(React.createElement(TestComponent));
    });

    act(() => {
      hookResult.track("export.pdf", { format: "a4" });
    });

    expect(mockTrackEvent).toHaveBeenCalledWith({
      event: "export.pdf",
      metadata: { format: "a4" },
    });
  });

  it("track calls mutation with event only (no metadata)", () => {
    act(() => {
      root = createRoot(container);
      root.render(React.createElement(TestComponent));
    });

    act(() => {
      hookResult.track("editor.clear");
    });

    expect(mockTrackEvent).toHaveBeenCalledWith({
      event: "editor.clear",
      metadata: undefined,
    });
  });

  it("track does not throw when mutation rejects (fire-and-forget)", () => {
    mockTrackEvent.mockRejectedValue(new Error("Network error"));

    act(() => {
      root = createRoot(container);
      root.render(React.createElement(TestComponent));
    });

    // Should not throw
    expect(() => {
      act(() => {
        hookResult.track("export.pdf");
      });
    }).not.toThrow();
  });

  it("track returns void (synchronous return)", () => {
    act(() => {
      root = createRoot(container);
      root.render(React.createElement(TestComponent));
    });

    let result: unknown;
    act(() => {
      result = hookResult.track("export.pdf");
    });

    expect(result).toBeUndefined();
  });

  it("returns a track function", () => {
    act(() => {
      root = createRoot(container);
      root.render(React.createElement(TestComponent));
    });

    expect(hookResult).toHaveProperty("track");
    expect(typeof hookResult.track).toBe("function");
  });
});
