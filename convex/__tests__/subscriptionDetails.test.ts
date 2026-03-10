import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ConvexError } from "convex/values";

const mockSubscriptionsRetrieve = vi.fn();

vi.mock("../stripe", () => ({
  getStripeClient: () => ({
    subscriptions: { retrieve: mockSubscriptionsRetrieve },
  }),
}));

vi.mock("../_generated/api", () => ({
  internal: {
    users: { getUserByClerkId: "internal:users:getUserByClerkId" },
    subscriptions: {
      getSubscriptionByUserId: "internal:subscriptions:getSubscriptionByUserId",
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

describe("getSubscriptionDetails", () => {
  it("throws AUTH_REQUIRED when no identity", async () => {
    const { getSubscriptionDetails } = await import(
      "../subscriptionActions"
    );
    const handler = getHandler(getSubscriptionDetails);

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
    const { getSubscriptionDetails } = await import(
      "../subscriptionActions"
    );
    const handler = getHandler(getSubscriptionDetails);

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

  it("returns null subscription when user has no subscription", async () => {
    const { getSubscriptionDetails } = await import(
      "../subscriptionActions"
    );
    const handler = getHandler(getSubscriptionDetails);

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
          tier: "free",
        })
        .mockResolvedValueOnce(null),
    };

    const result = await handler(ctx);

    expect(result).toEqual({ tier: "free", subscription: null });
    expect(mockSubscriptionsRetrieve).not.toHaveBeenCalled();
  });

  it("returns subscription details with payment method for paid user", async () => {
    const { getSubscriptionDetails } = await import(
      "../subscriptionActions"
    );
    const handler = getHandler(getSubscriptionDetails);

    mockSubscriptionsRetrieve.mockResolvedValue({
      status: "active",
      cancel_at_period_end: false,
      default_payment_method: {
        card: { brand: "visa", last4: "4242" },
      },
      items: {
        data: [
          {
            price: {
              unit_amount: 9900,
              currency: "ils",
            },
          },
        ],
      },
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
          tier: "paid",
        })
        .mockResolvedValueOnce({
          stripeSubscriptionId: "sub_xyz",
          currentPeriodEnd: 1711238400000,
        }),
    };

    const result = await handler(ctx);

    expect(result.tier).toBe("paid");
    expect(result.subscription).toEqual({
      status: "active",
      currentPeriodEnd: 1711238400000,
      cancelAtPeriodEnd: false,
      paymentMethodSummary: "visa **** 4242",
      nextBillingAmount: 99,
      currency: "ils",
    });

    expect(mockSubscriptionsRetrieve).toHaveBeenCalledWith("sub_xyz", {
      expand: ["default_payment_method"],
    });
  });

  it("returns null payment method when none set", async () => {
    const { getSubscriptionDetails } = await import(
      "../subscriptionActions"
    );
    const handler = getHandler(getSubscriptionDetails);

    mockSubscriptionsRetrieve.mockResolvedValue({
      status: "active",
      cancel_at_period_end: false,
      default_payment_method: null,
      items: {
        data: [
          {
            price: {
              unit_amount: 9900,
              currency: "ils",
            },
          },
        ],
      },
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
          stripeSubscriptionId: "sub_xyz",
          currentPeriodEnd: 1711238400000,
        }),
    };

    const result = await handler(ctx);

    expect(result.subscription?.paymentMethodSummary).toBeNull();
  });

  it("shows cancelAtPeriodEnd when subscription is canceling", async () => {
    const { getSubscriptionDetails } = await import(
      "../subscriptionActions"
    );
    const handler = getHandler(getSubscriptionDetails);

    mockSubscriptionsRetrieve.mockResolvedValue({
      status: "active",
      cancel_at_period_end: true,
      default_payment_method: null,
      items: { data: [{ price: { unit_amount: 9900, currency: "ils" } }] },
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
          stripeSubscriptionId: "sub_xyz",
          currentPeriodEnd: 1711238400000,
        }),
    };

    const result = await handler(ctx);

    expect(result.subscription?.cancelAtPeriodEnd).toBe(true);
  });
});
