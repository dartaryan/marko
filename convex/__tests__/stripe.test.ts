import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ConvexError } from "convex/values";

// Mock Stripe SDK
const mockCheckoutSessionsCreate = vi.fn();
const mockWebhooksConstructEvent = vi.fn();
const mockSubscriptionsRetrieve = vi.fn();
const mockSubscriptionsCancel = vi.fn();
const mockCustomersCreate = vi.fn();

vi.mock("stripe", () => {
  return {
    default: class MockStripe {
      checkout = { sessions: { create: mockCheckoutSessionsCreate } };
      webhooks = { constructEvent: mockWebhooksConstructEvent };
      subscriptions = {
        retrieve: mockSubscriptionsRetrieve,
        cancel: mockSubscriptionsCancel,
      };
      customers = { create: mockCustomersCreate };
    },
  };
});

vi.mock("../_generated/api", () => ({
  internal: {
    users: {
      getUserByClerkId: "internal:users:getUserByClerkId",
    },
    subscriptions: {
      createSubscription: "internal:subscriptions:createSubscription",
      updateSubscriptionStatus:
        "internal:subscriptions:updateSubscriptionStatus",
      updateUserTier: "internal:subscriptions:updateUserTier",
      getSubscriptionByUserId:
        "internal:subscriptions:getSubscriptionByUserId",
      getSubscriptionByStripeId:
        "internal:subscriptions:getSubscriptionByStripeId",
    },
    receipts: {
      getReceiptByStripeSessionId:
        "internal:receipts:getReceiptByStripeSessionId",
      getReceiptByStripeInvoiceId:
        "internal:receipts:getReceiptByStripeInvoiceId",
      createReceipt: "internal:receipts:createReceipt",
    },
    sumit: {
      generateReceipt: "internal:sumit:generateReceipt",
    },
    analytics: {
      logEvent: "internal:analytics:logEvent",
    },
  },
}));

vi.mock("../_generated/server", () => ({
  action: (config: { args: unknown; handler: Function }) => ({
    _handler: config.handler,
  }),
  internalAction: (config: { args: unknown; handler: Function }) => ({
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
  vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_123");
  vi.stubEnv("STRIPE_PRICE_ID", "price_test_123");
  vi.stubEnv("STRIPE_WEBHOOKS_SECRET", "whsec_test_123");
  vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://marko.app");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("createCheckoutSession", () => {
  it("throws AUTH_REQUIRED when no identity", async () => {
    const { createCheckoutSession } = await import("../stripe");
    const handler = getHandler(createCheckoutSession);

    const ctx = {
      auth: { getUserIdentity: vi.fn().mockResolvedValue(null) },
      runQuery: vi.fn(),
    };

    await expect(handler(ctx)).rejects.toThrowError(ConvexError);
    await expect(handler(ctx)).rejects.toMatchObject({
      data: { code: "AUTH_REQUIRED" },
    });
  });

  it("throws USER_NOT_FOUND when user doesn't exist", async () => {
    const { createCheckoutSession } = await import("../stripe");
    const handler = getHandler(createCheckoutSession);

    const ctx = {
      auth: {
        getUserIdentity: vi
          .fn()
          .mockResolvedValue({ subject: "clerk_123" }),
      },
      runQuery: vi.fn().mockResolvedValue(null),
    };

    await expect(handler(ctx)).rejects.toMatchObject({
      data: { code: "USER_NOT_FOUND" },
    });
  });

  it("throws ALREADY_SUBSCRIBED when user is paid tier", async () => {
    const { createCheckoutSession } = await import("../stripe");
    const handler = getHandler(createCheckoutSession);

    const ctx = {
      auth: {
        getUserIdentity: vi
          .fn()
          .mockResolvedValue({ subject: "clerk_123" }),
      },
      runQuery: vi
        .fn()
        .mockResolvedValueOnce({
          _id: "user_123",
          clerkId: "clerk_123",
          tier: "paid",
        }),
    };

    await expect(handler(ctx)).rejects.toMatchObject({
      data: { code: "ALREADY_SUBSCRIBED" },
    });
  });

  it("creates checkout session and returns URL for free user", async () => {
    const { createCheckoutSession } = await import("../stripe");
    const handler = getHandler(createCheckoutSession);

    mockCustomersCreate.mockResolvedValue({ id: "cus_new_123" });
    mockCheckoutSessionsCreate.mockResolvedValue({
      url: "https://checkout.stripe.com/session_123",
    });

    const ctx = {
      auth: {
        getUserIdentity: vi
          .fn()
          .mockResolvedValue({ subject: "clerk_123" }),
      },
      runQuery: vi
        .fn()
        .mockResolvedValueOnce({
          _id: "user_123",
          clerkId: "clerk_123",
          tier: "free",
          email: "test@example.com",
          name: "Test User",
        })
        .mockResolvedValueOnce(null), // no existing subscription
    };

    const result = await handler(ctx);

    expect(result).toEqual({
      url: "https://checkout.stripe.com/session_123",
    });
    expect(mockCustomersCreate).toHaveBeenCalledWith({
      email: "test@example.com",
      name: "Test User",
      metadata: { convexUserId: "user_123", clerkId: "clerk_123" },
    });
    expect(mockCheckoutSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "subscription",
        customer: "cus_new_123",
        locale: "he",
        currency: "ils",
      })
    );
  });

  it("reuses existing Stripe customer ID when available", async () => {
    const { createCheckoutSession } = await import("../stripe");
    const handler = getHandler(createCheckoutSession);

    mockCheckoutSessionsCreate.mockResolvedValue({
      url: "https://checkout.stripe.com/session_123",
    });

    const ctx = {
      auth: {
        getUserIdentity: vi
          .fn()
          .mockResolvedValue({ subject: "clerk_123" }),
      },
      runQuery: vi
        .fn()
        .mockResolvedValueOnce({
          _id: "user_123",
          clerkId: "clerk_123",
          tier: "free",
        })
        .mockResolvedValueOnce({
          stripeCustomerId: "cus_existing_456",
        }), // existing subscription with customer ID
    };

    await handler(ctx);

    expect(mockCustomersCreate).not.toHaveBeenCalled();
    expect(mockCheckoutSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        customer: "cus_existing_456",
      })
    );
  });

  it("throws CONFIG_ERROR when STRIPE_SECRET_KEY is missing", async () => {
    vi.unstubAllEnvs();
    vi.stubEnv("STRIPE_SECRET_KEY", "");
    vi.resetModules();

    // Re-mock all dependencies
    vi.doMock("stripe", () => ({
      default: class MockStripe {
        checkout = { sessions: { create: mockCheckoutSessionsCreate } };
        webhooks = { constructEvent: mockWebhooksConstructEvent };
        subscriptions = { retrieve: mockSubscriptionsRetrieve, cancel: mockSubscriptionsCancel };
        customers = { create: mockCustomersCreate };
      },
    }));
    vi.doMock("../_generated/api", () => ({
      internal: {
        users: { getUserByClerkId: "internal:users:getUserByClerkId" },
        subscriptions: {
          createSubscription: "internal:subscriptions:createSubscription",
          updateSubscriptionStatus: "internal:subscriptions:updateSubscriptionStatus",
          updateUserTier: "internal:subscriptions:updateUserTier",
          getSubscriptionByUserId: "internal:subscriptions:getSubscriptionByUserId",
          getSubscriptionByStripeId: "internal:subscriptions:getSubscriptionByStripeId",
        },
        receipts: {
          getReceiptByStripeSessionId: "internal:receipts:getReceiptByStripeSessionId",
          getReceiptByStripeInvoiceId: "internal:receipts:getReceiptByStripeInvoiceId",
          createReceipt: "internal:receipts:createReceipt",
        },
        sumit: { generateReceipt: "internal:sumit:generateReceipt" },
        analytics: { logEvent: "internal:analytics:logEvent" },
      },
    }));
    vi.doMock("../_generated/server", () => ({
      action: (config: { args: unknown; handler: Function }) => ({
        _handler: config.handler,
      }),
      internalAction: (config: { args: unknown; handler: Function }) => ({
        _handler: config.handler,
      }),
    }));

    const { createCheckoutSession } = await import("../stripe");
    const handler = getHandler(createCheckoutSession);

    const ctx = {
      auth: {
        getUserIdentity: vi
          .fn()
          .mockResolvedValue({ subject: "clerk_123" }),
      },
      runQuery: vi
        .fn()
        .mockResolvedValueOnce({
          _id: "user_123",
          clerkId: "clerk_123",
          tier: "free",
        })
        .mockResolvedValueOnce(null),
    };

    await expect(handler(ctx)).rejects.toMatchObject({
      data: { code: "CONFIG_ERROR" },
    });
  });
});

describe("fulfillStripeWebhook", () => {
  it("returns success: false when STRIPE_WEBHOOKS_SECRET is missing", async () => {
    vi.unstubAllEnvs();
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_123");
    vi.stubEnv("STRIPE_WEBHOOKS_SECRET", "");
    vi.resetModules();

    vi.doMock("stripe", () => ({
      default: class MockStripe {
        checkout = { sessions: { create: mockCheckoutSessionsCreate } };
        webhooks = { constructEvent: mockWebhooksConstructEvent };
        subscriptions = { retrieve: mockSubscriptionsRetrieve, cancel: mockSubscriptionsCancel };
        customers = { create: mockCustomersCreate };
      },
    }));
    vi.doMock("../_generated/api", () => ({
      internal: {
        users: { getUserByClerkId: "internal:users:getUserByClerkId" },
        subscriptions: {
          createSubscription: "internal:subscriptions:createSubscription",
          updateSubscriptionStatus: "internal:subscriptions:updateSubscriptionStatus",
          updateUserTier: "internal:subscriptions:updateUserTier",
          getSubscriptionByUserId: "internal:subscriptions:getSubscriptionByUserId",
          getSubscriptionByStripeId: "internal:subscriptions:getSubscriptionByStripeId",
        },
        receipts: {
          getReceiptByStripeSessionId: "internal:receipts:getReceiptByStripeSessionId",
          getReceiptByStripeInvoiceId: "internal:receipts:getReceiptByStripeInvoiceId",
          createReceipt: "internal:receipts:createReceipt",
        },
        sumit: { generateReceipt: "internal:sumit:generateReceipt" },
        analytics: { logEvent: "internal:analytics:logEvent" },
      },
    }));
    vi.doMock("../_generated/server", () => ({
      action: (config: { args: unknown; handler: Function }) => ({
        _handler: config.handler,
      }),
      internalAction: (config: { args: unknown; handler: Function }) => ({
        _handler: config.handler,
      }),
    }));

    const { fulfillStripeWebhook } = await import("../stripe");
    const handler = getHandler(fulfillStripeWebhook);

    const ctx = { runMutation: vi.fn(), runAction: vi.fn() };
    const result = await handler(ctx, {
      signature: "sig_123",
      payload: "{}",
    });

    expect(result).toEqual({ success: false });
  });

  it("returns success: false when signature verification fails", async () => {
    const { fulfillStripeWebhook } = await import("../stripe");
    const handler = getHandler(fulfillStripeWebhook);

    mockWebhooksConstructEvent.mockImplementation(() => {
      throw new Error("Invalid signature");
    });

    const ctx = { runMutation: vi.fn(), runAction: vi.fn() };
    const result = await handler(ctx, {
      signature: "bad_sig",
      payload: "{}",
    });

    expect(result).toEqual({ success: false });
  });

  it("handles checkout.session.completed event", async () => {
    const { fulfillStripeWebhook } = await import("../stripe");
    const handler = getHandler(fulfillStripeWebhook);

    mockWebhooksConstructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          mode: "subscription",
          subscription: "sub_new_123",
          customer: "cus_abc",
          metadata: { convexUserId: "user_123", clerkId: "clerk_123" },
        },
      },
    });

    mockSubscriptionsRetrieve.mockResolvedValue({
      id: "sub_new_123",
      current_period_end: 1700000000,
    });

    const ctx = {
      runMutation: vi.fn().mockResolvedValue(undefined),
      runQuery: vi.fn().mockImplementation(async (fn: string) => {
        if (fn === "internal:users:getUserByClerkId") {
          return { _id: "user_123", clerkId: "clerk_123" };
        }
        return null; // getSubscriptionByStripeId returns null (no existing)
      }),
      runAction: vi.fn(),
    };
    const result = await handler(ctx, {
      signature: "sig_valid",
      payload: "{}",
    });

    expect(result).toEqual({ success: true });
    expect(ctx.runQuery).toHaveBeenCalledWith(
      "internal:users:getUserByClerkId",
      { clerkId: "clerk_123" }
    );
    expect(ctx.runMutation).toHaveBeenCalledWith(
      "internal:subscriptions:createSubscription",
      expect.objectContaining({
        userId: "user_123",
        stripeCustomerId: "cus_abc",
        stripeSubscriptionId: "sub_new_123",
        status: "active",
        currentPeriodEnd: 1700000000000,
      })
    );
    expect(ctx.runMutation).toHaveBeenCalledWith(
      "internal:subscriptions:updateUserTier",
      { userId: "user_123", tier: "paid" }
    );
    expect(ctx.runMutation).toHaveBeenCalledWith(
      "internal:analytics:logEvent",
      expect.objectContaining({
        userId: "user_123",
        event: "subscription.created",
      })
    );
  });

  it("skips subscription creation on duplicate webhook (idempotency)", async () => {
    const { fulfillStripeWebhook } = await import("../stripe");
    const handler = getHandler(fulfillStripeWebhook);

    mockWebhooksConstructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          mode: "subscription",
          subscription: "sub_existing_123",
          customer: "cus_abc",
          metadata: { convexUserId: "user_123", clerkId: "clerk_123" },
        },
      },
    });

    mockSubscriptionsRetrieve.mockResolvedValue({
      id: "sub_existing_123",
      current_period_end: 1700000000,
    });

    const ctx = {
      runMutation: vi.fn().mockResolvedValue(undefined),
      runQuery: vi.fn().mockImplementation(async (fn: string) => {
        if (fn === "internal:users:getUserByClerkId") {
          return { _id: "user_123", clerkId: "clerk_123" };
        }
        if (fn === "internal:subscriptions:getSubscriptionByStripeId") {
          return { _id: "sub_id", stripeSubscriptionId: "sub_existing_123" }; // already exists
        }
        return null;
      }),
      runAction: vi.fn(),
    };
    const result = await handler(ctx, {
      signature: "sig_valid",
      payload: "{}",
    });

    expect(result).toEqual({ success: true });
    // createSubscription should NOT be called (duplicate)
    expect(ctx.runMutation).not.toHaveBeenCalledWith(
      "internal:subscriptions:createSubscription",
      expect.anything()
    );
    // But tier update should still happen (idempotent)
    expect(ctx.runMutation).toHaveBeenCalledWith(
      "internal:subscriptions:updateUserTier",
      { userId: "user_123", tier: "paid" }
    );
  });

  it("handles invoice.paid event", async () => {
    const { fulfillStripeWebhook } = await import("../stripe");
    const handler = getHandler(fulfillStripeWebhook);

    mockWebhooksConstructEvent.mockReturnValue({
      type: "invoice.paid",
      data: {
        object: {
          subscription: "sub_existing_123",
          customer_email: "user@example.com",
          customer_name: "User",
          amount_paid: 9900,
          currency: "ils",
          id: "inv_existing",
          created: Math.floor(Date.now() / 1000),
        },
      },
    });

    mockSubscriptionsRetrieve.mockResolvedValue({
      id: "sub_existing_123",
      current_period_end: 1800000000,
    });

    const ctx = {
      runQuery: vi.fn().mockImplementation((fn) => {
        if (fn === "internal:subscriptions:getSubscriptionByStripeId") {
          return Promise.resolve({
            _id: "sub_convex_123",
            userId: "user_123",
            stripeSubscriptionId: "sub_existing_123",
          });
        }
        return Promise.resolve(null);
      }),
      runMutation: vi.fn().mockResolvedValue(undefined),
      runAction: vi.fn().mockResolvedValue({
        success: true,
        documentNumber: "0042",
        documentId: "doc_123",
        documentUrl: "https://sumit.co.il/doc/0042",
        pdfUrl: "https://sumit.co.il/pdf/0042",
      }),
    };
    const result = await handler(ctx, {
      signature: "sig_valid",
      payload: "{}",
    });

    expect(result).toEqual({ success: true });
    expect(ctx.runMutation).toHaveBeenCalledWith(
      "internal:subscriptions:updateSubscriptionStatus",
      {
        stripeSubscriptionId: "sub_existing_123",
        status: "active",
        currentPeriodEnd: 1800000000000,
      }
    );
  });

  it("handles invoice.payment_failed event", async () => {
    const { fulfillStripeWebhook } = await import("../stripe");
    const handler = getHandler(fulfillStripeWebhook);

    mockWebhooksConstructEvent.mockReturnValue({
      type: "invoice.payment_failed",
      data: {
        object: {
          subscription: "sub_failing_123",
        },
      },
    });

    const ctx = { runMutation: vi.fn().mockResolvedValue(undefined), runAction: vi.fn() };
    const result = await handler(ctx, {
      signature: "sig_valid",
      payload: "{}",
    });

    expect(result).toEqual({ success: true });
    expect(ctx.runMutation).toHaveBeenCalledWith(
      "internal:subscriptions:updateSubscriptionStatus",
      {
        stripeSubscriptionId: "sub_failing_123",
        status: "past_due",
      }
    );
  });

  it("handles customer.subscription.deleted event and reverts tier to free", async () => {
    const { fulfillStripeWebhook } = await import("../stripe");
    const handler = getHandler(fulfillStripeWebhook);

    mockWebhooksConstructEvent.mockReturnValue({
      type: "customer.subscription.deleted",
      data: {
        object: {
          id: "sub_deleted_123",
        },
      },
    });

    const ctx = {
      runMutation: vi.fn().mockResolvedValue(undefined),
      runQuery: vi.fn().mockImplementation(async (fn: string) => {
        if (fn === "internal:subscriptions:getSubscriptionByStripeId") {
          return { userId: "user_456", stripeSubscriptionId: "sub_deleted_123" };
        }
        return null;
      }),
      runAction: vi.fn(),
    };

    const result = await handler(ctx, {
      signature: "sig_valid",
      payload: "{}",
    });

    expect(result).toEqual({ success: true });
    expect(ctx.runMutation).toHaveBeenCalledWith(
      "internal:subscriptions:updateSubscriptionStatus",
      {
        stripeSubscriptionId: "sub_deleted_123",
        status: "canceled",
      }
    );
    expect(ctx.runMutation).toHaveBeenCalledWith(
      "internal:subscriptions:updateUserTier",
      { userId: "user_456", tier: "free" }
    );
    expect(ctx.runMutation).toHaveBeenCalledWith(
      "internal:analytics:logEvent",
      expect.objectContaining({
        userId: "user_456",
        event: "subscription.canceled",
      })
    );
  });

  it("handles unrecognized event types gracefully", async () => {
    const { fulfillStripeWebhook } = await import("../stripe");
    const handler = getHandler(fulfillStripeWebhook);

    mockWebhooksConstructEvent.mockReturnValue({
      type: "some.unknown.event",
      data: { object: {} },
    });

    const ctx = { runMutation: vi.fn(), runAction: vi.fn() };
    const result = await handler(ctx, {
      signature: "sig_valid",
      payload: "{}",
    });

    expect(result).toEqual({ success: true });
    expect(ctx.runMutation).not.toHaveBeenCalled();
  });
});

describe("cancelSubscription", () => {
  it("calls stripe.subscriptions.cancel with subscription ID", async () => {
    const { cancelSubscription } = await import("../stripe");
    const handler = getHandler(cancelSubscription);

    mockSubscriptionsCancel.mockResolvedValue({ id: "sub_canceled" });

    const ctx = {};
    await handler(ctx, { stripeSubscriptionId: "sub_to_cancel" });

    expect(mockSubscriptionsCancel).toHaveBeenCalledWith("sub_to_cancel");
  });
});

describe("Receipt generation in webhook handlers", () => {
  beforeEach(() => {
    vi.stubEnv("SUMIT_COMPANY_ID", "company_123");
    vi.stubEnv("SUMIT_API_KEY", "api_key_456");
  });

  it("generates receipt on checkout.session.completed webhook", async () => {
    const { fulfillStripeWebhook } = await import("../stripe");
    const handler = getHandler(fulfillStripeWebhook);

    const mockSession = {
      id: "session_123",
      mode: "subscription",
      subscription: "sub_stripe_123",
      customer: "cus_123",
      customer_details: {
        name: "John Doe",
        email: "john@example.com",
      },
      amount_total: 9900, // 99.00 ILS in cents
      currency: "ils",
      created: Math.floor(Date.now() / 1000),
      metadata: { clerkId: "clerk_123" },
    };

    mockWebhooksConstructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: { object: mockSession },
    });

    mockSubscriptionsRetrieve.mockResolvedValue({
      id: "sub_stripe_123",
      current_period_end: Math.floor(Date.now() / 1000) + 2592000,
    });

    const ctx = {
      runQuery: vi.fn().mockImplementation((fn) => {
        if (fn === "internal:users:getUserByClerkId") {
          return Promise.resolve({
            _id: "user_123",
            clerkId: "clerk_123",
            tier: "free",
            name: "John Doe",
            email: "john@example.com",
          });
        }
        return Promise.resolve(null);
      }),
      runMutation: vi.fn().mockResolvedValue(undefined),
      runAction: vi.fn().mockResolvedValue({
        success: true,
        documentNumber: "0042",
        documentId: "doc_123",
        documentUrl: "https://sumit.co.il/doc/0042",
        pdfUrl: "https://sumit.co.il/pdf/0042",
      }),
    };

    const result = await handler(ctx, {
      signature: "sig_valid",
      payload: "{}",
    });

    expect(result).toEqual({ success: true });
    // Verify Sumit API was called with correct amount conversion (cents -> ILS)
    expect(ctx.runAction).toHaveBeenCalledWith(
      "internal:sumit:generateReceipt",
      expect.objectContaining({
        customerName: "John Doe",
        customerEmail: "john@example.com",
        amount: 99, // 9900 cents / 100
        currency: "ils",
      })
    );
    // Verify receipt was stored with Sumit response data
    expect(ctx.runMutation).toHaveBeenCalledWith(
      "internal:receipts:createReceipt",
      expect.objectContaining({
        userId: "user_123",
        stripeSessionId: "session_123",
        sumitDocumentId: "doc_123",
        sumitDocumentNumber: "0042",
        amount: 99,
        status: "success",
      })
    );
  });

  it("generates receipt on invoice.paid webhook (renewal)", async () => {
    const { fulfillStripeWebhook } = await import("../stripe");
    const handler = getHandler(fulfillStripeWebhook);

    const mockInvoice = {
      id: "inv_789",
      subscription: "sub_stripe_123",
      customer_email: "john@example.com",
      customer_name: "John Doe",
      amount_paid: 9900,
      currency: "ils",
      created: Math.floor(Date.now() / 1000),
    };

    mockWebhooksConstructEvent.mockReturnValue({
      type: "invoice.paid",
      data: { object: mockInvoice },
    });

    mockSubscriptionsRetrieve.mockResolvedValue({
      id: "sub_stripe_123",
      current_period_end: Math.floor(Date.now() / 1000) + 2592000,
    });

    const ctx = {
      runQuery: vi.fn().mockImplementation((fn) => {
        if (fn === "internal:subscriptions:getSubscriptionByStripeId") {
          return Promise.resolve({
            _id: "sub_convex_123",
            userId: "user_123",
            stripeSubscriptionId: "sub_stripe_123",
          });
        }
        return Promise.resolve(null);
      }),
      runMutation: vi.fn().mockResolvedValue(undefined),
      runAction: vi.fn().mockResolvedValue({
        success: true,
        documentNumber: "0043",
        documentId: "doc_456",
        documentUrl: "https://sumit.co.il/doc/0043",
        pdfUrl: "https://sumit.co.il/pdf/0043",
      }),
    };

    const result = await handler(ctx, {
      signature: "sig_valid",
      payload: "{}",
    });

    expect(result).toEqual({ success: true });
    // Verify Sumit API called with correct amount and invoice data
    expect(ctx.runAction).toHaveBeenCalledWith(
      "internal:sumit:generateReceipt",
      expect.objectContaining({
        customerName: "John Doe",
        customerEmail: "john@example.com",
        amount: 99, // 9900 / 100
        stripeReference: "inv_789",
      })
    );
    // Verify receipt stored with renewal invoice ID
    expect(ctx.runMutation).toHaveBeenCalledWith(
      "internal:receipts:createReceipt",
      expect.objectContaining({
        userId: "user_123",
        stripeInvoiceId: "inv_789",
        sumitDocumentId: "doc_456",
        status: "success",
      })
    );
  });

  it("skips receipt generation when receipt already exists (idempotency)", async () => {
    const { fulfillStripeWebhook } = await import("../stripe");
    const handler = getHandler(fulfillStripeWebhook);

    const mockSession = {
      id: "session_duplicate",
      mode: "subscription",
      subscription: "sub_stripe_123",
      customer: "cus_123",
      customer_details: { name: "John Doe", email: "john@example.com" },
      amount_total: 9900,
      currency: "ils",
      created: Math.floor(Date.now() / 1000),
      metadata: { clerkId: "clerk_123" },
    };

    mockWebhooksConstructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: { object: mockSession },
    });

    mockSubscriptionsRetrieve.mockResolvedValue({
      id: "sub_stripe_123",
      current_period_end: Math.floor(Date.now() / 1000) + 2592000,
    });

    const ctx = {
      runQuery: vi.fn().mockImplementation((fn) => {
        if (fn === "internal:users:getUserByClerkId") {
          return Promise.resolve({
            _id: "user_123",
            clerkId: "clerk_123",
            tier: "free",
          });
        }
        if (fn === "internal:subscriptions:getSubscriptionByStripeId") {
          return Promise.resolve(null);
        }
        if (fn === "internal:receipts:getReceiptByStripeSessionId") {
          // Receipt already exists for this session
          return Promise.resolve({
            _id: "existing_receipt",
            stripeSessionId: "session_duplicate",
          });
        }
        return Promise.resolve(null);
      }),
      runMutation: vi.fn().mockResolvedValue(undefined),
      runAction: vi.fn(),
    };

    const result = await handler(ctx, {
      signature: "sig_valid",
      payload: "{}",
    });

    expect(result).toEqual({ success: true });
    // Sumit API should NOT be called — receipt already exists
    expect(ctx.runAction).not.toHaveBeenCalledWith(
      "internal:sumit:generateReceipt",
      expect.anything()
    );
    // No new receipt should be created
    expect(ctx.runMutation).not.toHaveBeenCalledWith(
      "internal:receipts:createReceipt",
      expect.anything()
    );
  });

  it("does not fail webhook if receipt generation fails", async () => {
    const { fulfillStripeWebhook } = await import("../stripe");
    const handler = getHandler(fulfillStripeWebhook);

    const mockSession = {
      id: "session_fail_123",
      mode: "subscription",
      subscription: "sub_stripe_123",
      customer: "cus_123",
      customer_details: {
        name: "John Doe",
        email: "john@example.com",
      },
      amount_total: 9900,
      currency: "ils",
      created: Math.floor(Date.now() / 1000),
      metadata: { clerkId: "clerk_123" },
    };

    mockWebhooksConstructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: { object: mockSession },
    });

    mockSubscriptionsRetrieve.mockResolvedValue({
      id: "sub_stripe_123",
      current_period_end: Math.floor(Date.now() / 1000) + 2592000,
    });

    const ctx = {
      runQuery: vi.fn().mockImplementation((fn) => {
        if (fn === "internal:users:getUserByClerkId") {
          return Promise.resolve({
            _id: "user_123",
            clerkId: "clerk_123",
            tier: "free",
          });
        }
        // Return null for receipt idempotency check
        return Promise.resolve(null);
      }),
      runMutation: vi.fn().mockResolvedValue(undefined),
      runAction: vi
        .fn()
        .mockRejectedValue(new Error("Sumit API unavailable")),
    };

    // Should NOT throw, even though runAction fails
    const result = await handler(ctx, {
      signature: "sig_valid",
      payload: "{}",
    });

    expect(result).toEqual({ success: true });
    expect(ctx.runAction).toHaveBeenCalled();
  });
});
