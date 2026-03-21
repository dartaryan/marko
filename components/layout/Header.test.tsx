import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { Header } from "./Header";

const mockUseConvexAuth = vi.fn();
const mockUseQuery = vi.fn();

vi.mock("convex/react", () => ({
  useConvexAuth: () => mockUseConvexAuth(),
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
  useAction: () => vi.fn(),
}));

vi.mock("@/convex/_generated/api", () => ({
  api: {
    users: {
      getCurrentUser: "users:getCurrentUser",
      deleteMyAccount: "users:deleteMyAccount",
    },
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) =>
    React.createElement("a", { href, ...props }, children),
}));

vi.mock("@clerk/nextjs", () => ({
  SignInButton: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sign-in-button-wrapper">{children}</div>
  ),
  UserButton: () => <div data-testid="clerk-user-button" />,
  useClerk: () => ({ signOut: vi.fn() }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// Stub matchMedia for ThemeToggle
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

const defaultProps = {
  viewMode: "split" as const,
  onViewModeChange: vi.fn(),
  onEnterPresentation: vi.fn(),
  docDirection: "rtl" as const,
  onDirectionChange: vi.fn(),
  onClearEditor: vi.fn(),
  onLoadSample: vi.fn(),
  onOpenColorPanel: vi.fn(),
  onExportRequest: vi.fn(),
  onCopyRequest: vi.fn(),
  onAiClick: vi.fn(),
};

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

describe("Header", () => {
  it("renders the logo", () => {
    mockUseConvexAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });
    mockUseQuery.mockReturnValue(undefined);

    act(() => {
      root = createRoot(container);
      root.render(<Header {...defaultProps} />);
    });
    const logo = container.querySelector("a")!;
    expect(logo.textContent).toContain("מארקו");
  });

  it("renders AuthButton when user is anonymous", () => {
    mockUseConvexAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });
    mockUseQuery.mockReturnValue(undefined);

    act(() => {
      root = createRoot(container);
      root.render(<Header {...defaultProps} />);
    });
    const authBtn = container.querySelector('[data-testid="auth-button"]')!;
    expect(authBtn).toBeTruthy();
    expect(authBtn.textContent).toBe("הרשמה / התחברות");
  });

  it("renders UserMenu when user is authenticated", () => {
    mockUseConvexAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });
    mockUseQuery.mockReturnValue({ tier: "free" });

    act(() => {
      root = createRoot(container);
      root.render(<Header {...defaultProps} />);
    });
    const userMenu = container.querySelector('[data-testid="user-menu"]')!;
    expect(userMenu).toBeTruthy();
  });

  it("renders zone separators between header zones", () => {
    mockUseConvexAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });
    mockUseQuery.mockReturnValue(undefined);

    act(() => {
      root = createRoot(container);
      root.render(<Header {...defaultProps} />);
    });
    const separators = container.querySelectorAll(".marko-header-separator");
    // 7 zones → 6 separators between them
    expect(separators.length).toBe(6);
  });

  it("shows loading skeleton when auth is loading", () => {
    mockUseConvexAuth.mockReturnValue({ isAuthenticated: false, isLoading: true });
    mockUseQuery.mockReturnValue(undefined);

    act(() => {
      root = createRoot(container);
      root.render(<Header {...defaultProps} />);
    });
    const loading = container.querySelector('[data-testid="auth-loading"]')!;
    expect(loading).toBeTruthy();
  });

  it("shows paid badge for paid users", () => {
    mockUseConvexAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });
    mockUseQuery.mockReturnValue({ tier: "paid" });

    act(() => {
      root = createRoot(container);
      root.render(<Header {...defaultProps} />);
    });
    const badge = container.querySelector('[data-testid="paid-badge"]')!;
    expect(badge).toBeTruthy();
  });

  it("renders AI star button with keyboard hint", () => {
    mockUseConvexAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });
    mockUseQuery.mockReturnValue(undefined);

    act(() => {
      root = createRoot(container);
      root.render(<Header {...defaultProps} />);
    });
    const aiBtn = container.querySelector('[aria-label="עוזר AI (Ctrl+J)"]')!;
    expect(aiBtn).toBeTruthy();
    expect(aiBtn.classList.contains("marko-header-btn--ai")).toBe(true);
    expect(aiBtn.textContent).toContain("עוזר AI");
  });

  it("calls onAiClick when AI button is clicked", () => {
    mockUseConvexAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });
    mockUseQuery.mockReturnValue(undefined);

    act(() => {
      root = createRoot(container);
      root.render(<Header {...defaultProps} />);
    });
    const aiBtn = container.querySelector('[aria-label="עוזר AI (Ctrl+J)"]') as HTMLButtonElement;
    act(() => {
      aiBtn.click();
    });
    expect(defaultProps.onAiClick).toHaveBeenCalledTimes(1);
  });

  it("renders 7 header zones", () => {
    mockUseConvexAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });
    mockUseQuery.mockReturnValue(undefined);

    act(() => {
      root = createRoot(container);
      root.render(<Header {...defaultProps} />);
    });
    const zones = container.querySelectorAll(".marko-header-zone");
    expect(zones.length).toBe(7);
  });

  it("renders overflow button placeholder", () => {
    mockUseConvexAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });
    mockUseQuery.mockReturnValue(undefined);

    act(() => {
      root = createRoot(container);
      root.render(<Header {...defaultProps} />);
    });
    const overflowBtn = container.querySelector('[aria-label="תפריט נוסף"]')!;
    expect(overflowBtn).toBeTruthy();
  });

  it("has correct header aria-label", () => {
    mockUseConvexAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });
    mockUseQuery.mockReturnValue(undefined);

    act(() => {
      root = createRoot(container);
      root.render(<Header {...defaultProps} />);
    });
    const header = container.querySelector("header")!;
    expect(header.getAttribute("aria-label")).toBe("סרגל כלים של מארקו");
  });
});
