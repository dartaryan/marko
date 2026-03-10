import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ConvexError } from "convex/values";

const mockInvoicesList = vi.fn();

vi.mock("../stripe", () => ({
  getStripeClient: () => ({
    invoices: { list: mockInvoicesList },
  }),
}));

vi.mock("../_generated/api", () => ({
  internal: {
    users: { getUserByClerkId: "internal:users:getUserByClerkId" },
    subscriptions: {
      getSubscriptionByUserId: "internal:subscriptions:getSubscriptionByUserId",
    },
    receipts: {
      getReceiptsByUserIdInternal:
        "internal:receipts:getReceiptsByUserIdInternal",
    },
  },
}));

vi.mock("../_generated/server", () => ({
  action: (config: { args: unknown; handler: Function }) => ({
    _handler: config.handler,
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

describe("listInvoices", () => {
  it("throws AUTH_REQUIRED when not authenticated", async () => {
    const { listInvoices } = await import("../subscriptionActions");
    const handler = getHandler(listInvoices);

    const ctx = {
      auth: { getUserIdentity: vi.fn().mockResolvedValue(null) },
      runQuery: vi.fn(),
    };

    await expect(handler(ctx)).rejects.toMatchObject({
      data: { code: "AUTH_REQUIRED" },
    });
  });

  it("returns empty invoices when user has no subscription", async () => {
    const { listInvoices } = await import("../subscriptionActions");
    const handler = getHandler(listInvoices);

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
    };

    const result = await handler(ctx);

    expect(result).toEqual({ invoices: [] });
    expect(mockInvoicesList).not.toHaveBeenCalled();
  });

  it("transforms Stripe invoices and matches receipts", async () => {
    const { listInvoices } = await import("../subscriptionActions");
    const handler = getHandler(listInvoices);

    mockInvoicesList.mockResolvedValue({
      data: [
        {
          id: "in_001",
          created: 1711238400,
          amount_paid: 9900,
          currency: "ils",
          status: "paid",
          payment_intent: "pi_abc",
        },
        {
          id: "in_002",
          created: 1708560000,
          amount_paid: 0,
          currency: "ils",
          status: "open",
          payment_intent: { id: "pi_def" },
        },
      ],
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
        })
        .mockResolvedValueOnce([
          {
            stripeInvoiceId: "in_001",
            status: "success",
            sumitPdfUrl: "https://sumit.co.il/pdf/001",
            sumitDocumentUrl: "https://sumit.co.il/doc/001",
          },
        ]),
    };

    const result = await handler(ctx);

    expect(result.invoices).toHaveLength(2);

    expect(result.invoices[0]).toEqual({
      id: "in_001",
      date: 1711238400000,
      amountPaid: 99,
      currency: "ils",
      status: "paid",
      paymentIntent: "pi_abc",
      receiptPdfUrl: "https://sumit.co.il/pdf/001",
    });

    expect(result.invoices[1]).toEqual({
      id: "in_002",
      date: 1708560000000,
      amountPaid: 0,
      currency: "ils",
      status: "open",
      paymentIntent: "pi_def",
      receiptPdfUrl: null,
    });

    expect(mockInvoicesList).toHaveBeenCalledWith({
      customer: "cus_abc",
      limit: 20,
    });
  });

  it("handles invoices with no matching receipts", async () => {
    const { listInvoices } = await import("../subscriptionActions");
    const handler = getHandler(listInvoices);

    mockInvoicesList.mockResolvedValue({
      data: [
        {
          id: "in_old",
          created: 1700000000,
          amount_paid: 9900,
          currency: "ils",
          status: "paid",
          payment_intent: "pi_old",
        },
      ],
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
        })
        .mockResolvedValueOnce([]),
    };

    const result = await handler(ctx);

    expect(result.invoices[0].receiptPdfUrl).toBeNull();
  });
});
