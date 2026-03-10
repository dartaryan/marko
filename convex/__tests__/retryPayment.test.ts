import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ConvexError } from "convex/values";

const mockInvoicesRetrieve = vi.fn();
const mockInvoicesPay = vi.fn();

vi.mock("stripe", () => ({
  default: class MockStripe {
    invoices = { retrieve: mockInvoicesRetrieve, pay: mockInvoicesPay };
  },
}));

vi.mock("../_generated/api", () => ({
  internal: {
    users: { getUserByClerkId: "internal:users:getUserByClerkId" },
    subscriptions: {
      getSubscriptionByUserId: "internal:subscriptions:getSubscriptionByUserId",
    },
    analytics: { logEvent: "internal:analytics:logEvent" },
  },
}));

vi.mock("../_generated/server", () => ({
  action: (config: { args: unknown; handler: Function }) => ({
    _handler: config.handler,
  }),
}));

vi.mock("../lib/stripe", () => ({
  getStripeClient: () => ({
    invoices: { retrieve: mockInvoicesRetrieve, pay: mockInvoicesPay },
  }),
}));

function getHandler(fn: unknown): Function {
  const registration = fn as { _handler?: Function };
  if (registration._handler) return registration._handler;
  throw new Error("Could not find handler on Convex function registration");
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.resetModules();
});

describe("retryPayment", () => {
  it("throws AUTH_REQUIRED when not authenticated", async () => {
    const { retryPayment } = await import("../subscriptionActions");
    const handler = getHandler(retryPayment);

    const ctx = {
      auth: { getUserIdentity: vi.fn().mockResolvedValue(null) },
      runQuery: vi.fn(),
      runMutation: vi.fn(),
    };

    await expect(
      handler(ctx, { invoiceId: "in_123" })
    ).rejects.toMatchObject({
      data: { code: "AUTH_REQUIRED" },
    });
  });

  it("throws USER_NOT_FOUND when user doesn't exist", async () => {
    const { retryPayment } = await import("../subscriptionActions");
    const handler = getHandler(retryPayment);

    const ctx = {
      auth: {
        getUserIdentity: vi
          .fn()
          .mockResolvedValue({ subject: "clerk_123" }),
      },
      runQuery: vi.fn().mockResolvedValue(null),
      runMutation: vi.fn(),
    };

    await expect(
      handler(ctx, { invoiceId: "in_123" })
    ).rejects.toMatchObject({
      data: { code: "USER_NOT_FOUND" },
    });
  });

  it("throws NO_SUBSCRIPTION when user has no subscription", async () => {
    const { retryPayment } = await import("../subscriptionActions");
    const handler = getHandler(retryPayment);

    const ctx = {
      auth: {
        getUserIdentity: vi
          .fn()
          .mockResolvedValue({ subject: "clerk_123" }),
      },
      runQuery: vi
        .fn()
        .mockResolvedValueOnce({ _id: "user_123", tier: "paid" })
        .mockResolvedValueOnce(null),
      runMutation: vi.fn(),
    };

    await expect(
      handler(ctx, { invoiceId: "in_123" })
    ).rejects.toMatchObject({
      data: { code: "NO_SUBSCRIPTION" },
    });
  });

  it("throws INVOICE_NOT_FOUND when invoice belongs to different customer", async () => {
    const { retryPayment } = await import("../subscriptionActions");
    const handler = getHandler(retryPayment);

    mockInvoicesRetrieve.mockResolvedValue({
      id: "in_123",
      customer: "cus_other",
      status: "open",
    });

    const ctx = {
      auth: {
        getUserIdentity: vi
          .fn()
          .mockResolvedValue({ subject: "clerk_123" }),
      },
      runQuery: vi
        .fn()
        .mockResolvedValueOnce({ _id: "user_123", tier: "paid" })
        .mockResolvedValueOnce({
          stripeCustomerId: "cus_abc",
          stripeSubscriptionId: "sub_xyz",
        }),
      runMutation: vi.fn(),
    };

    await expect(
      handler(ctx, { invoiceId: "in_123" })
    ).rejects.toMatchObject({
      data: { code: "INVOICE_NOT_FOUND" },
    });
  });

  it("throws INVOICE_NOT_PAYABLE when invoice is not open", async () => {
    const { retryPayment } = await import("../subscriptionActions");
    const handler = getHandler(retryPayment);

    mockInvoicesRetrieve.mockResolvedValue({
      id: "in_123",
      customer: "cus_abc",
      status: "paid",
    });

    const ctx = {
      auth: {
        getUserIdentity: vi
          .fn()
          .mockResolvedValue({ subject: "clerk_123" }),
      },
      runQuery: vi
        .fn()
        .mockResolvedValueOnce({ _id: "user_123", tier: "paid" })
        .mockResolvedValueOnce({
          stripeCustomerId: "cus_abc",
          stripeSubscriptionId: "sub_xyz",
        }),
      runMutation: vi.fn(),
    };

    await expect(
      handler(ctx, { invoiceId: "in_123" })
    ).rejects.toMatchObject({
      data: { code: "INVOICE_NOT_PAYABLE" },
    });
  });

  it("successfully retries payment and logs analytics", async () => {
    const { retryPayment } = await import("../subscriptionActions");
    const handler = getHandler(retryPayment);

    mockInvoicesRetrieve.mockResolvedValue({
      id: "in_123",
      customer: "cus_abc",
      status: "open",
    });

    mockInvoicesPay.mockResolvedValue({
      id: "in_123",
      status: "paid",
    });

    const ctx = {
      auth: {
        getUserIdentity: vi
          .fn()
          .mockResolvedValue({ subject: "clerk_123" }),
      },
      runQuery: vi
        .fn()
        .mockResolvedValueOnce({ _id: "user_123", tier: "paid" })
        .mockResolvedValueOnce({
          stripeCustomerId: "cus_abc",
          stripeSubscriptionId: "sub_xyz",
        }),
      runMutation: vi.fn(),
    };

    const result = await handler(ctx, { invoiceId: "in_123" });

    expect(result).toEqual({ success: true, status: "paid" });

    expect(mockInvoicesPay).toHaveBeenCalledWith("in_123");

    expect(ctx.runMutation).toHaveBeenCalledWith(
      "internal:analytics:logEvent",
      {
        userId: "user_123",
        event: "subscription.payment_retry",
        metadata: { invoiceId: "in_123", status: "paid" },
      }
    );
  });

  it("returns success=false when payment doesn't complete", async () => {
    const { retryPayment } = await import("../subscriptionActions");
    const handler = getHandler(retryPayment);

    mockInvoicesRetrieve.mockResolvedValue({
      id: "in_123",
      customer: "cus_abc",
      status: "open",
    });

    mockInvoicesPay.mockResolvedValue({
      id: "in_123",
      status: "open",
    });

    const ctx = {
      auth: {
        getUserIdentity: vi
          .fn()
          .mockResolvedValue({ subject: "clerk_123" }),
      },
      runQuery: vi
        .fn()
        .mockResolvedValueOnce({ _id: "user_123", tier: "paid" })
        .mockResolvedValueOnce({
          stripeCustomerId: "cus_abc",
          stripeSubscriptionId: "sub_xyz",
        }),
      runMutation: vi.fn(),
    };

    const result = await handler(ctx, { invoiceId: "in_123" });

    expect(result).toEqual({ success: false, status: "open" });
  });

  it("wraps Stripe API errors in ConvexError", async () => {
    const { retryPayment } = await import("../subscriptionActions");
    const handler = getHandler(retryPayment);

    mockInvoicesRetrieve.mockRejectedValue(
      new Error("Stripe API unavailable")
    );

    const ctx = {
      auth: {
        getUserIdentity: vi
          .fn()
          .mockResolvedValue({ subject: "clerk_123" }),
      },
      runQuery: vi
        .fn()
        .mockResolvedValueOnce({ _id: "user_123", tier: "paid" })
        .mockResolvedValueOnce({
          stripeCustomerId: "cus_abc",
          stripeSubscriptionId: "sub_xyz",
        }),
      runMutation: vi.fn(),
    };

    await expect(
      handler(ctx, { invoiceId: "in_123" })
    ).rejects.toMatchObject({
      data: { code: "STRIPE_ERROR" },
    });
  });
});
