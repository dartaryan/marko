import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { DeleteAccountDialog } from "./DeleteAccountDialog";

const mockSignOut = vi.fn().mockResolvedValue(undefined);
const mockDeleteMyAccount = vi.fn().mockResolvedValue(undefined);
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();

vi.mock("@clerk/nextjs", () => ({
  useClerk: () => ({ signOut: mockSignOut }),
}));

vi.mock("convex/react", () => ({
  useAction: () => mockDeleteMyAccount,
}));

vi.mock("@/convex/_generated/api", () => ({
  api: {
    users: {
      deleteMyAccount: "users:deleteMyAccount",
    },
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  },
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

function renderDialog(open = true, onOpenChange = vi.fn()) {
  act(() => {
    root = createRoot(container);
    root.render(
      <DeleteAccountDialog open={open} onOpenChange={onOpenChange} />
    );
  });
}

describe("DeleteAccountDialog", () => {
  it("renders Hebrew title and description when open", () => {
    renderDialog();

    const dialog = document.querySelector(
      '[data-testid="delete-account-dialog"]'
    );
    expect(dialog).toBeTruthy();
    expect(dialog!.textContent).toContain("מחיקת חשבון");
    expect(dialog!.textContent).toContain(
      "פעולה זו תמחק את החשבון שלך ואת כל הנתונים לצמיתות"
    );
  });

  it("does not render dialog when closed", () => {
    renderDialog(false);

    const dialog = document.querySelector(
      '[data-testid="delete-account-dialog"]'
    );
    expect(dialog).toBeNull();
  });

  it("has confirm button disabled initially", () => {
    renderDialog();

    const confirmBtn = document.querySelector(
      '[data-testid="delete-confirm-button"]'
    ) as HTMLButtonElement;
    expect(confirmBtn).toBeTruthy();
    expect(confirmBtn.disabled).toBe(true);
  });

  it("enables confirm button when user types מחק", () => {
    renderDialog();

    const input = document.querySelector(
      '[data-testid="delete-confirm-input"]'
    ) as HTMLInputElement;
    expect(input).toBeTruthy();

    // Button should be disabled before typing
    const confirmBtn = document.querySelector(
      '[data-testid="delete-confirm-button"]'
    ) as HTMLButtonElement;
    expect(confirmBtn.disabled).toBe(true);

    act(() => {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value"
      )!.set!;
      nativeInputValueSetter.call(input, "מחק");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });

    // Button should now be enabled
    expect(confirmBtn.disabled).toBe(false);
  });

  it("calls deleteMyAccount and signOut on confirm", async () => {
    const onOpenChange = vi.fn();
    renderDialog(true, onOpenChange);

    // Simulate typing the confirmation word
    const input = document.querySelector(
      '[data-testid="delete-confirm-input"]'
    ) as HTMLInputElement;

    act(() => {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value"
      )!.set!;
      nativeInputValueSetter.call(input, "מחק");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });

    const confirmBtn = document.querySelector(
      '[data-testid="delete-confirm-button"]'
    ) as HTMLButtonElement;

    // Click confirm
    await act(async () => {
      confirmBtn.click();
    });

    expect(mockDeleteMyAccount).toHaveBeenCalled();
    expect(mockSignOut).toHaveBeenCalled();
    expect(mockToastSuccess).toHaveBeenCalledWith("החשבון נמחק בהצלחה");
  });

  it("shows error toast when deletion fails", async () => {
    mockDeleteMyAccount.mockRejectedValueOnce(new Error("fail"));
    renderDialog();

    const input = document.querySelector(
      '[data-testid="delete-confirm-input"]'
    ) as HTMLInputElement;

    act(() => {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value"
      )!.set!;
      nativeInputValueSetter.call(input, "מחק");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });

    const confirmBtn = document.querySelector(
      '[data-testid="delete-confirm-button"]'
    ) as HTMLButtonElement;

    await act(async () => {
      confirmBtn.click();
    });

    expect(mockToastError).toHaveBeenCalledWith(
      "שגיאה במחיקת החשבון. נסה שוב."
    );
  });

  it("has confirmation input with rtl direction", () => {
    renderDialog();

    const input = document.querySelector(
      '[data-testid="delete-confirm-input"]'
    ) as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.getAttribute("dir")).toBe("rtl");
  });

  it("shows loading state and keeps dialog open during deletion", async () => {
    let resolveDelete: () => void;
    mockDeleteMyAccount.mockImplementation(
      () => new Promise<void>((resolve) => { resolveDelete = resolve; })
    );

    const onOpenChange = vi.fn();
    renderDialog(true, onOpenChange);

    // Type confirmation word
    const input = document.querySelector(
      '[data-testid="delete-confirm-input"]'
    ) as HTMLInputElement;
    act(() => {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value"
      )!.set!;
      nativeInputValueSetter.call(input, "מחק");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });

    const confirmBtn = document.querySelector(
      '[data-testid="delete-confirm-button"]'
    ) as HTMLButtonElement;

    // Click confirm — starts async deletion
    act(() => {
      confirmBtn.click();
    });

    // Dialog should still be open (onOpenChange(false) not called yet)
    expect(onOpenChange).not.toHaveBeenCalledWith(false);

    // Button should show loading text
    expect(confirmBtn.textContent).toBe("מוחק...");

    // Input should be disabled during deletion
    expect(input.disabled).toBe(true);

    // Complete the deletion
    await act(async () => {
      resolveDelete!();
    });
  });
});
