import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React, { useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { AiDisclosure } from "./AiDisclosure";
import { useAiDisclosure } from "@/lib/hooks/useAiDisclosure";

/**
 * Integration test component that mimics EditorPage's disclosure flow:
 * useAiDisclosure hook + AiDisclosure dialog + action dispatch logic
 */
function TestDisclosureFlow({
  onActionExecuted,
}: {
  onActionExecuted: (action: string) => void;
}) {
  const { needsDisclosure, acceptDisclosure } = useAiDisclosure();
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const handleAction = useCallback(
    (actionType: string) => {
      if (needsDisclosure) {
        setPendingAction(actionType);
        return;
      }
      onActionExecuted(actionType);
    },
    [needsDisclosure, onActionExecuted]
  );

  const handleAccept = useCallback(() => {
    acceptDisclosure();
    if (pendingAction) {
      onActionExecuted(pendingAction);
      setPendingAction(null);
    }
  }, [acceptDisclosure, pendingAction, onActionExecuted]);

  const handleCancel = useCallback(() => {
    setPendingAction(null);
  }, []);

  return (
    <>
      <button data-testid="trigger" onClick={() => handleAction("summarize")}>
        Trigger Action
      </button>
      <AiDisclosure
        open={pendingAction !== null}
        onAccept={handleAccept}
        onCancel={handleCancel}
      />
    </>
  );
}

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;
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

describe("AI Disclosure Integration", () => {
  it("first action shows disclosure instead of executing", () => {
    const onExecuted = vi.fn();
    act(() => {
      root = createRoot(container);
      root.render(<TestDisclosureFlow onActionExecuted={onExecuted} />);
    });

    act(() => {
      document
        .querySelector('[data-testid="trigger"]')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(document.querySelector('[role="alertdialog"]')).not.toBeNull();
    expect(onExecuted).not.toHaveBeenCalled();
  });

  it("accepting disclosure executes the pending action", () => {
    const onExecuted = vi.fn();
    act(() => {
      root = createRoot(container);
      root.render(<TestDisclosureFlow onActionExecuted={onExecuted} />);
    });

    act(() => {
      document
        .querySelector('[data-testid="trigger"]')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    const acceptBtn = Array.from(document.querySelectorAll("button")).find(
      (btn) => btn.textContent?.includes("הבנתי, המשך")
    );
    act(() => {
      acceptBtn?.click();
    });

    expect(onExecuted).toHaveBeenCalledWith("summarize");
  });

  it("canceling disclosure does not execute the action", () => {
    const onExecuted = vi.fn();
    act(() => {
      root = createRoot(container);
      root.render(<TestDisclosureFlow onActionExecuted={onExecuted} />);
    });

    act(() => {
      document
        .querySelector('[data-testid="trigger"]')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    const cancelBtn = Array.from(document.querySelectorAll("button")).find(
      (btn) => btn.textContent?.includes("ביטול")
    );
    act(() => {
      cancelBtn?.click();
    });

    expect(onExecuted).not.toHaveBeenCalled();
    expect(document.querySelector('[role="alertdialog"]')).toBeNull();
  });

  it("subsequent actions skip disclosure after acceptance", () => {
    const onExecuted = vi.fn();
    act(() => {
      root = createRoot(container);
      root.render(<TestDisclosureFlow onActionExecuted={onExecuted} />);
    });

    // First action: trigger → disclosure → accept
    act(() => {
      document
        .querySelector('[data-testid="trigger"]')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    const acceptBtn = Array.from(document.querySelectorAll("button")).find(
      (btn) => btn.textContent?.includes("הבנתי, המשך")
    );
    act(() => {
      acceptBtn?.click();
    });
    expect(onExecuted).toHaveBeenCalledTimes(1);

    // Second action: should execute immediately without disclosure
    act(() => {
      document
        .querySelector('[data-testid="trigger"]')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(document.querySelector('[role="alertdialog"]')).toBeNull();
    expect(onExecuted).toHaveBeenCalledTimes(2);
  });
});
