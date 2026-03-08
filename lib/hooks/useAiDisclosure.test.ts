import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { useAiDisclosure } from "./useAiDisclosure";

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;
let hookResult: ReturnType<typeof useAiDisclosure>;

function TestComponent() {
  hookResult = useAiDisclosure();
  return null;
}

let mockStorage: Record<string, string>;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  mockStorage = {};
  vi.stubGlobal("sessionStorage", {
    getItem: vi.fn((key: string) => mockStorage[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      mockStorage[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete mockStorage[key];
    }),
    clear: vi.fn(() => {
      Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
    }),
  });
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
  vi.unstubAllGlobals();
});

describe("useAiDisclosure", () => {
  it("returns needsDisclosure: true when sessionStorage is empty", () => {
    act(() => {
      root = createRoot(container);
      root.render(React.createElement(TestComponent));
    });

    expect(hookResult.needsDisclosure).toBe(true);
  });

  it("returns needsDisclosure: false when sessionStorage has accepted key", () => {
    mockStorage["marko-ai-disclosure-accepted"] = "true";

    act(() => {
      root = createRoot(container);
      root.render(React.createElement(TestComponent));
    });

    expect(hookResult.needsDisclosure).toBe(false);
  });

  it("acceptDisclosure sets needsDisclosure to false and writes to sessionStorage", () => {
    act(() => {
      root = createRoot(container);
      root.render(React.createElement(TestComponent));
    });

    expect(hookResult.needsDisclosure).toBe(true);

    act(() => {
      hookResult.acceptDisclosure();
    });

    expect(hookResult.needsDisclosure).toBe(false);
    expect(sessionStorage.setItem).toHaveBeenCalledWith(
      "marko-ai-disclosure-accepted",
      "true"
    );
  });

  it("handles sessionStorage unavailability gracefully (defaults to showing disclosure)", () => {
    vi.stubGlobal("sessionStorage", {
      getItem: vi.fn(() => {
        throw new Error("SecurityError");
      }),
      setItem: vi.fn(() => {
        throw new Error("SecurityError");
      }),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });

    act(() => {
      root = createRoot(container);
      root.render(React.createElement(TestComponent));
    });

    // Should default to true (show disclosure) when sessionStorage throws
    expect(hookResult.needsDisclosure).toBe(true);
  });

  it("does not persist across mock session resets", () => {
    act(() => {
      root = createRoot(container);
      root.render(React.createElement(TestComponent));
    });

    act(() => {
      hookResult.acceptDisclosure();
    });

    expect(hookResult.needsDisclosure).toBe(false);

    // Simulate session reset by clearing storage and re-mounting
    mockStorage = {};
    act(() => {
      root.unmount();
    });

    act(() => {
      root = createRoot(container);
      root.render(React.createElement(TestComponent));
    });

    // After remount with cleared storage, should need disclosure again
    expect(hookResult.needsDisclosure).toBe(true);
  });
});
