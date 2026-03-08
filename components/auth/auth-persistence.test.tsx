import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { AuthGate } from "./AuthGate";

const STORAGE_KEYS = [
  "marko-v2-editor-content",
  "marko-v2-color-theme",
  "marko-v2-view-mode",
  "marko-v2-doc-direction",
];

const mockUseConvexAuth = vi.fn();
const mockUseQuery = vi.fn();

vi.mock("convex/react", () => ({
  useConvexAuth: () => mockUseConvexAuth(),
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
}));

vi.mock("@/convex/_generated/api", () => ({
  api: {
    users: {
      getCurrentUser: "users:getCurrentUser",
    },
  },
}));

vi.mock("@clerk/nextjs", () => ({
  SignInButton: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sign-in-button-wrapper">{children}</div>
  ),
  UserButton: () => <div data-testid="clerk-user-button" />,
}));

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  localStorage.clear();
  vi.clearAllMocks();
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
  localStorage.clear();
});

describe("Auth state transitions preserve localStorage", () => {
  it("localStorage keys survive transition from anonymous to authenticated", () => {
    // Set up localStorage with user content
    localStorage.setItem("marko-v2-editor-content", JSON.stringify("# My Document"));
    localStorage.setItem("marko-v2-color-theme", JSON.stringify({ h1: "#ff0000" }));
    localStorage.setItem("marko-v2-view-mode", JSON.stringify("split"));
    localStorage.setItem("marko-v2-doc-direction", JSON.stringify("rtl"));

    // Render in anonymous state
    mockUseConvexAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });
    mockUseQuery.mockReturnValue(undefined);

    act(() => {
      root = createRoot(container);
      root.render(<AuthGate />);
    });

    // Verify localStorage is untouched
    for (const key of STORAGE_KEYS) {
      expect(localStorage.getItem(key)).not.toBeNull();
    }

    // Simulate transition to authenticated
    mockUseConvexAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });
    mockUseQuery.mockReturnValue({ tier: "free" });

    act(() => {
      root.render(<AuthGate />);
    });

    // Verify localStorage is still untouched
    expect(JSON.parse(localStorage.getItem("marko-v2-editor-content")!)).toBe("# My Document");
    expect(JSON.parse(localStorage.getItem("marko-v2-color-theme")!)).toEqual({ h1: "#ff0000" });
    expect(JSON.parse(localStorage.getItem("marko-v2-view-mode")!)).toBe("split");
    expect(JSON.parse(localStorage.getItem("marko-v2-doc-direction")!)).toBe("rtl");
  });

  it("localStorage keys survive transition from authenticated to anonymous (sign out)", () => {
    // Set up localStorage with user content
    localStorage.setItem("marko-v2-editor-content", JSON.stringify("# Important work"));
    localStorage.setItem("marko-v2-color-theme", JSON.stringify({ h1: "#0000ff" }));
    localStorage.setItem("marko-v2-view-mode", JSON.stringify("preview"));
    localStorage.setItem("marko-v2-doc-direction", JSON.stringify("ltr"));

    // Start authenticated
    mockUseConvexAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });
    mockUseQuery.mockReturnValue({ tier: "paid" });

    act(() => {
      root = createRoot(container);
      root.render(<AuthGate />);
    });

    // Simulate sign out (transition to anonymous)
    mockUseConvexAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });
    mockUseQuery.mockReturnValue(undefined);

    act(() => {
      root.render(<AuthGate />);
    });

    // Verify localStorage is preserved
    expect(JSON.parse(localStorage.getItem("marko-v2-editor-content")!)).toBe("# Important work");
    expect(JSON.parse(localStorage.getItem("marko-v2-color-theme")!)).toEqual({ h1: "#0000ff" });
    expect(JSON.parse(localStorage.getItem("marko-v2-view-mode")!)).toBe("preview");
    expect(JSON.parse(localStorage.getItem("marko-v2-doc-direction")!)).toBe("ltr");
  });

  it("auth components never write to localStorage", () => {
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem");

    // Render anonymous
    mockUseConvexAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });
    mockUseQuery.mockReturnValue(undefined);

    act(() => {
      root = createRoot(container);
      root.render(<AuthGate />);
    });

    // Transition to authenticated
    mockUseConvexAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });
    mockUseQuery.mockReturnValue({ tier: "free" });

    act(() => {
      root.render(<AuthGate />);
    });

    // Transition back to anonymous
    mockUseConvexAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });
    mockUseQuery.mockReturnValue(undefined);

    act(() => {
      root.render(<AuthGate />);
    });

    // Auth components should never call setItem
    expect(setItemSpy).not.toHaveBeenCalled();

    setItemSpy.mockRestore();
  });
});
