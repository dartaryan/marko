import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ConvexError } from "convex/values";

const mockSubscriptionsUpdate = vi.fn();

vi.mock("../lib/stripe", () => ({
  getStripeClient: () => ({
    subscriptions: { update: mockSubscriptionsUpdate },
  }),
}));

vi.mock("../_generated/api", () => ({
  internal: {
    users: { getUserByClerkId: "internal:users:getUserByClerkId" },
    subscriptions: {
      getSubscriptionByUserId: "internal:subscriptions:getSubscriptionByUserId",
      updateSubscriptionStatus:
        "internal:subscriptions:updateSubscriptionStatus",
    },
    analytics: { logEvent: "internal:analytics:logEvent" },
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

describe("cancelSubscription", () => {
  it("throws AUTH_REQUIRED when not authenticated", async () => {
    const { cancelSubscription } = await import("../subscriptionActions");
    const handler = getHandler(cancelSubscription);

    const ctx = {
      auth: { getUserIdentity: vi.fn().mockResolvedValue(null) },
      runQuery: vi.fn(),
      runMutation: vi.fn(),
    };

    await expect(handler(ctx)).rejects.toMatchObject({
      data: { code: "AUTH_REQUIRED" },
    });
  });

  it("throws NO_ACTIVE_SUBSCRIPTION when user has no subscription", async () => {
    const { cancelSubscription } = await import("../subscriptionActions");
    const handler = getHandler(cancelSubscription);

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

    await expect(handler(ctx)).rejects.toMatchObject({
      data: { code: "NO_ACTIVE_SUBSCRIPTION" },
    });
  });

  it("throws NO_ACTIVE_SUBSCRIPTION when subscription is not active", async () => {
    const { cancelSubscription } = await import("../subscriptionActions");
    const handler = getHandler(cancelSubscription);

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
          status: "canceled",
        }),
      runMutation: vi.fn(),
    };

    await expect(handler(ctx)).rejects.toMatchObject({
      data: { code: "NO_ACTIVE_SUBSCRIPTION" },
    });
  });

  it("cancels subscription at period end and updates Convex", async () => {
    const { cancelSubscription } = await import("../subscriptionActions");
    const handler = getHandler(cancelSubscription);

    mockSubscriptionsUpdate.mockResolvedValue({ id: "sub_xyz" });

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
          status: "active",
          currentPeriodEnd: 1711238400000,
        }),
      runMutation: vi.fn(),
    };

    const result = await handler(ctx);

    expect(result).toEqual({ cancelDate: 1711238400000 });

    expect(mockSubscriptionsUpdate).toHaveBeenCalledWith("sub_xyz", {
      cancel_at_period_end: true,
    });

    expect(ctx.runMutation).toHaveBeenCalledWith(
      "internal:subscriptions:updateSubscriptionStatus",
      {
        stripeSubscriptionId: "sub_xyz",
        status: "active",
        cancelAtPeriodEnd: true,
      }
    );

    expect(ctx.runMutation).toHaveBeenCalledWith(
      "internal:analytics:logEvent",
      {
        userId: "user_123",
        event: "subscription.cancel_requested",
        metadata: { stripeSubscriptionId: "sub_xyz" },
      }
    );
  });

  it("throws USER_NOT_FOUND when user doesn't exist", async () => {
    const { cancelSubscription } = await import("../subscriptionActions");
    const handler = getHandler(cancelSubscription);

    const ctx = {
      auth: {
        getUserIdentity: vi
          .fn()
          .mockResolvedValue({ subject: "clerk_123" }),
      },
      runQuery: vi.fn().mockResolvedValue(null),
      runMutation: vi.fn(),
    };

    await expect(handler(ctx)).rejects.toMatchObject({
      data: { code: "USER_NOT_FOUND" },
    });
  });
});
