import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";

const mockPush = vi.fn();
const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

const mockGetDetails = vi.fn();
const mockListInvoices = vi.fn();
const mockCancelSubscription = vi.fn();
const mockRetryPayment = vi.fn();

vi.mock("convex/react", () => ({
  useAction: (ref: string) => {
    if (ref === "getSubscriptionDetails") return mockGetDetails;
    if (ref === "listInvoices") return mockListInvoices;
    if (ref === "cancelSubscription") return mockCancelSubscription;
    if (ref === "retryPayment") return mockRetryPayment;
    return vi.fn();
  },
}));

const mockUseCurrentUser = vi.fn();
vi.mock("@/lib/hooks/useCurrentUser", () => ({
  useCurrentUser: () => mockUseCurrentUser(),
}));

vi.mock("@/convex/_generated/api", () => ({
  api: {
    subscriptionActions: {
      getSubscriptionDetails: "getSubscriptionDetails",
      listInvoices: "listInvoices",
      cancelSubscription: "cancelSubscription",
      retryPayment: "retryPayment",
    },
  },
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn() },
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    ...props
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    [key: string]: unknown;
  }) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/alert-dialog", () => ({
  AlertDialog: ({
    children,
    open,
  }: {
    children: React.ReactNode;
    open: boolean;
  }) => (open ? <div data-testid="alert-dialog">{children}</div> : null),
  AlertDialogContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2>{children}</h2>
  ),
  AlertDialogDescription: ({ children }: { children: React.ReactNode }) => (
    <p>{children}</p>
  ),
  AlertDialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogCancel: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => <button {...props}>{children}</button>,
  AlertDialogAction: ({
    children,
    onClick,
    ...props
  }: {
    children: React.ReactNode;
    onClick?: (e: React.MouseEvent) => void;
    [key: string]: unknown;
  }) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
  vi.clearAllMocks();
  mockListInvoices.mockResolvedValue({ invoices: [] });
  mockCancelSubscription.mockResolvedValue({ cancelDate: Date.now() });
  mockRetryPayment.mockResolvedValue({ success: true, status: "paid" });
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
});

describe("SubscriptionPage", () => {
  it("shows loading state while user is loading", async () => {
    mockUseCurrentUser.mockReturnValue({
      user: null,
      isLoading: true,
      isAuthenticated: false,
    });

    const { default: SubscriptionPage } = await import("../page");

    await act(async () => {
      root = createRoot(container);
      root.render(<SubscriptionPage />);
    });

    const pulseElements = container.querySelectorAll(".animate-pulse");
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  it("redirects unauthenticated users to sign-in", async () => {
    mockUseCurrentUser.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });

    const { default: SubscriptionPage } = await import("../page");

    await act(async () => {
      root = createRoot(container);
      root.render(<SubscriptionPage />);
    });

    expect(mockReplace).toHaveBeenCalledWith("/sign-in");
  });

  it("redirects free tier users to editor", async () => {
    mockUseCurrentUser.mockReturnValue({
      user: { _id: "user_123", tier: "free" },
      isLoading: false,
      isAuthenticated: true,
    });

    const { default: SubscriptionPage } = await import("../page");

    await act(async () => {
      root = createRoot(container);
      root.render(<SubscriptionPage />);
    });

    expect(mockReplace).toHaveBeenCalledWith("/editor");
  });

  it("displays subscription details for paid user", async () => {
    mockUseCurrentUser.mockReturnValue({
      user: { _id: "user_123", tier: "paid" },
      isLoading: false,
      isAuthenticated: true,
    });

    mockGetDetails.mockResolvedValue({
      tier: "paid",
      subscription: {
        status: "active",
        currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000,
        cancelAtPeriodEnd: false,
        paymentMethodSummary: "visa **** 4242",
        nextBillingAmount: 99,
        currency: "ils",
      },
    });

    const { default: SubscriptionPage } = await import("../page");

    await act(async () => {
      root = createRoot(container);
      root.render(<SubscriptionPage />);
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    const details = container.querySelector(
      '[data-testid="subscription-details"]'
    );
    expect(details).toBeTruthy();

    const statusBadge = container.querySelector(
      '[data-testid="subscription-status-badge"]'
    );
    expect(statusBadge?.textContent).toBe("פעיל");

    const paymentMethod = container.querySelector(
      '[data-testid="payment-method"]'
    );
    expect(paymentMethod?.textContent).toBe("visa **** 4242");

    const amount = container.querySelector(
      '[data-testid="next-billing-amount"]'
    );
    expect(amount?.textContent).toContain("99");

    const cancelButton = container.querySelector(
      '[data-testid="cancel-subscription-button"]'
    );
    expect(cancelButton).toBeTruthy();
  });

  it("shows cancellation notice when subscription is canceling", async () => {
    mockUseCurrentUser.mockReturnValue({
      user: { _id: "user_123", tier: "paid" },
      isLoading: false,
      isAuthenticated: true,
    });

    mockGetDetails.mockResolvedValue({
      tier: "paid",
      subscription: {
        status: "active",
        currentPeriodEnd: Date.now() + 15 * 24 * 60 * 60 * 1000,
        cancelAtPeriodEnd: true,
        paymentMethodSummary: null,
        nextBillingAmount: 99,
        currency: "ils",
      },
    });

    const { default: SubscriptionPage } = await import("../page");

    await act(async () => {
      root = createRoot(container);
      root.render(<SubscriptionPage />);
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    const notice = container.querySelector(
      '[data-testid="cancellation-notice"]'
    );
    expect(notice).toBeTruthy();

    const statusBadge = container.querySelector(
      '[data-testid="subscription-status-badge"]'
    );
    expect(statusBadge?.textContent).toBe("בביטול");

    const cancelButton = container.querySelector(
      '[data-testid="cancel-subscription-button"]'
    );
    expect(cancelButton).toBeNull();
  });

  it("shows no subscription message when subscription is null", async () => {
    mockUseCurrentUser.mockReturnValue({
      user: { _id: "user_123", tier: "paid" },
      isLoading: false,
      isAuthenticated: true,
    });

    mockGetDetails.mockResolvedValue({
      tier: "paid",
      subscription: null,
    });

    const { default: SubscriptionPage } = await import("../page");

    await act(async () => {
      root = createRoot(container);
      root.render(<SubscriptionPage />);
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(container.textContent).toContain("אין מנוי פעיל");
  });

  it("has Hebrew text for all UI elements", async () => {
    mockUseCurrentUser.mockReturnValue({
      user: { _id: "user_123", tier: "paid" },
      isLoading: false,
      isAuthenticated: true,
    });

    mockGetDetails.mockResolvedValue({
      tier: "paid",
      subscription: {
        status: "active",
        currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000,
        cancelAtPeriodEnd: false,
        paymentMethodSummary: "visa **** 4242",
        nextBillingAmount: 99,
        currency: "ils",
      },
    });

    const { default: SubscriptionPage } = await import("../page");

    await act(async () => {
      root = createRoot(container);
      root.render(<SubscriptionPage />);
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    const text = container.textContent || "";
    expect(text).toContain("המנוי שלך");
    expect(text).toContain("תאריך חידוש");
    expect(text).toContain("שיטת תשלום");
    expect(text).toContain("חיוב הבא");
    expect(text).toContain("בטל מנוי");
  });
});
