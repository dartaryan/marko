import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ConvexError } from "convex/values";

vi.mock("../_generated/server", () => ({
  query: (config: { args: unknown; handler: Function }) => ({
    _handler: config.handler,
  }),
  internalQuery: (config: { args: unknown; handler: Function }) => ({
    _handler: config.handler,
  }),
  internalMutation: (config: { args: unknown; handler: Function }) => ({
    _handler: config.handler,
  }),
}));

function getHandler(fn: unknown): Function {
  const registration = fn as { _handler?: Function };
  if (registration._handler) return registration._handler;
  throw new Error("Could not find handler on Convex function registration");
}

function createMockQueryChain(result: unknown = null) {
  return {
    withIndex: vi.fn().mockReturnThis(),
    unique: vi.fn().mockResolvedValue(result),
    collect: vi.fn().mockResolvedValue(result || []),
  };
}

function createMockCtx(queryResult: unknown = null) {
  const queryChain = createMockQueryChain(queryResult);
  return {
    ctx: {
      db: {
        query: vi.fn().mockReturnValue(queryChain),
        insert: vi.fn().mockResolvedValue("mock_sub_id"),
        patch: vi.fn().mockResolvedValue(undefined),
        delete: vi.fn().mockResolvedValue(undefined),
      },
      auth: {
        getUserIdentity: vi.fn().mockResolvedValue(null),
      },
    },
    queryChain,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.resetModules();
});

describe("createSubscription", () => {
  it("inserts a new subscription record", async () => {
    const { createSubscription } = await import("../subscriptions");
    const { ctx } = createMockCtx();

    const handler = getHandler(createSubscription);
    const result = await handler(ctx, {
      userId: "user_123",
      stripeCustomerId: "cus_abc",
      stripeSubscriptionId: "sub_xyz",
      status: "active",
      currentPeriodEnd: 1700000000000,
    });

    expect(ctx.db.insert).toHaveBeenCalledWith("subscriptions", {
      userId: "user_123",
      stripeCustomerId: "cus_abc",
      stripeSubscriptionId: "sub_xyz",
      status: "active",
      currentPeriodEnd: 1700000000000,
      cancelAtPeriodEnd: false,
      createdAt: expect.any(Number),
    });
    expect(result).toBe("mock_sub_id");
  });
});

describe("updateSubscriptionStatus", () => {
  it("updates status and period end for existing subscription", async () => {
    const { updateSubscriptionStatus } = await import("../subscriptions");
    const existingSub = {
      _id: "sub_id_1",
      stripeSubscriptionId: "sub_xyz",
      status: "active",
    };
    const { ctx } = createMockCtx(existingSub);

    const handler = getHandler(updateSubscriptionStatus);
    await handler(ctx, {
      stripeSubscriptionId: "sub_xyz",
      status: "past_due",
      currentPeriodEnd: 1800000000000,
    });

    expect(ctx.db.patch).toHaveBeenCalledWith("sub_id_1", {
      status: "past_due",
      currentPeriodEnd: 1800000000000,
    });
  });

  it("updates only status when period end not provided", async () => {
    const { updateSubscriptionStatus } = await import("../subscriptions");
    const existingSub = {
      _id: "sub_id_1",
      stripeSubscriptionId: "sub_xyz",
      status: "active",
    };
    const { ctx } = createMockCtx(existingSub);

    const handler = getHandler(updateSubscriptionStatus);
    await handler(ctx, {
      stripeSubscriptionId: "sub_xyz",
      status: "canceled",
    });

    expect(ctx.db.patch).toHaveBeenCalledWith("sub_id_1", {
      status: "canceled",
    });
  });

  it("throws SUBSCRIPTION_NOT_FOUND when subscription does not exist", async () => {
    const { updateSubscriptionStatus } = await import("../subscriptions");
    const { ctx } = createMockCtx(null);

    const handler = getHandler(updateSubscriptionStatus);
    await expect(
      handler(ctx, {
        stripeSubscriptionId: "sub_nonexistent",
        status: "canceled",
      })
    ).rejects.toThrowError(ConvexError);

    await expect(
      handler(ctx, {
        stripeSubscriptionId: "sub_nonexistent",
        status: "canceled",
      })
    ).rejects.toMatchObject({
      data: { code: "SUBSCRIPTION_NOT_FOUND" },
    });
  });
});

describe("getMySubscription", () => {
  it("returns null when no auth identity", async () => {
    const { getMySubscription } = await import("../subscriptions");
    const { ctx } = createMockCtx();
    ctx.auth.getUserIdentity.mockResolvedValue(null);

    const handler = getHandler(getMySubscription);
    const result = await handler(ctx, {});

    expect(result).toBeNull();
  });

  it("returns null when user not found", async () => {
    const { getMySubscription } = await import("../subscriptions");
    const { ctx, queryChain } = createMockCtx(null);
    ctx.auth.getUserIdentity.mockResolvedValue({
      subject: "clerk_123",
    });

    // First query returns null (no user), second query won't be called
    queryChain.unique.mockResolvedValue(null);

    const handler = getHandler(getMySubscription);
    const result = await handler(ctx, {});

    expect(result).toBeNull();
  });

  it("returns subscription when user exists and has subscription", async () => {
    const { getMySubscription } = await import("../subscriptions");
    const user = { _id: "user_123", clerkId: "clerk_123" };
    const subscription = {
      _id: "sub_id",
      userId: "user_123",
      status: "active",
    };
    const { ctx, queryChain } = createMockCtx();
    ctx.auth.getUserIdentity.mockResolvedValue({
      subject: "clerk_123",
    });

    // First call returns user, second call returns subscription
    queryChain.unique
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(subscription);

    const handler = getHandler(getMySubscription);
    const result = await handler(ctx, {});

    expect(result).toEqual(subscription);
  });
});

describe("updateUserTier", () => {
  it("patches user tier to paid", async () => {
    const { updateUserTier } = await import("../subscriptions");
    const { ctx } = createMockCtx();

    const handler = getHandler(updateUserTier);
    await handler(ctx, { userId: "user_123", tier: "paid" });

    expect(ctx.db.patch).toHaveBeenCalledWith("user_123", { tier: "paid" });
  });

  it("patches user tier to free", async () => {
    const { updateUserTier } = await import("../subscriptions");
    const { ctx } = createMockCtx();

    const handler = getHandler(updateUserTier);
    await handler(ctx, { userId: "user_123", tier: "free" });

    expect(ctx.db.patch).toHaveBeenCalledWith("user_123", { tier: "free" });
  });
});

describe("deleteByUserId", () => {
  it("deletes all subscriptions for a user", async () => {
    const { deleteByUserId } = await import("../subscriptions");
    const subs = [
      { _id: "sub_1", userId: "user_123" },
      { _id: "sub_2", userId: "user_123" },
    ];
    const { ctx, queryChain } = createMockCtx();
    queryChain.collect.mockResolvedValue(subs);

    const handler = getHandler(deleteByUserId);
    await handler(ctx, { userId: "user_123" });

    expect(ctx.db.delete).toHaveBeenCalledTimes(2);
    expect(ctx.db.delete).toHaveBeenCalledWith("sub_1");
    expect(ctx.db.delete).toHaveBeenCalledWith("sub_2");
  });

  it("does nothing when no subscriptions exist", async () => {
    const { deleteByUserId } = await import("../subscriptions");
    const { ctx, queryChain } = createMockCtx();
    queryChain.collect.mockResolvedValue([]);

    const handler = getHandler(deleteByUserId);
    await handler(ctx, { userId: "user_123" });

    expect(ctx.db.delete).not.toHaveBeenCalled();
  });
});
