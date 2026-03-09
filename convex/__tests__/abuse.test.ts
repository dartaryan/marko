import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Id } from "../_generated/dataModel";

function getHandler(fn: unknown): Function {
  const registration = fn as { _handler?: Function };
  if (registration._handler) return registration._handler;
  throw new Error("Could not find handler on Convex function registration");
}

function createMockMutationCtx(
  userRecords: unknown[] = [],
  usageRecords: unknown[] = []
) {
  const patchFn = vi.fn();

  return {
    db: {
      query: vi.fn().mockImplementation((table: string) => {
        const records = table === "users" ? userRecords : usageRecords;
        return {
          withIndex: vi.fn().mockReturnThis(),
          collect: vi.fn().mockResolvedValue(records),
        };
      }),
      patch: patchFn,
    },
    _patchFn: patchFn,
  };
}

function createMockQueryCtx(records: unknown[] = []) {
  const mockWithIndex = vi.fn().mockReturnThis();
  return {
    db: {
      query: vi.fn().mockReturnValue({
        withIndex: mockWithIndex,
        collect: vi.fn().mockResolvedValue(records),
      }),
    },
    _mockWithIndex: mockWithIndex,
  };
}

const NOW = 1741500000000; // Fixed timestamp for deterministic tests

function makeUser(overrides: Partial<{
  _id: string;
  clerkId: string;
  email: string;
  name: string;
  tier: string;
  createdAt: number;
  flagged: boolean;
  flagReason: string;
  flaggedAt: number;
}> = {}) {
  return {
    _id: "user_1" as Id<"users">,
    clerkId: "clerk_1",
    email: "test@example.com",
    name: "Test User",
    tier: "free" as const,
    createdAt: NOW - 12 * 60 * 60 * 1000, // 12 hours ago
    ...overrides,
  };
}

function makeUsageRecord(overrides: Partial<{
  userId: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  actionType: string;
  createdAt: number;
}> = {}) {
  return {
    userId: "user_1" as Id<"users">,
    model: "claude-haiku-4-5-20251001",
    inputTokens: 500,
    outputTokens: 200,
    cost: 0.0012,
    actionType: "summarize",
    createdAt: NOW - 30 * 60 * 1000, // 30 minutes ago
    ...overrides,
  };
}

describe("detectAbuse", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns flaggedCount 0 when no users exist", async () => {
    const { detectAbuse } = await import("../abuse");
    const ctx = createMockMutationCtx([], []);

    const handler = getHandler(detectAbuse);
    const result = await handler(ctx, {});

    expect(result).toEqual({ flaggedCount: 0 });
    expect(ctx._patchFn).not.toHaveBeenCalled();
  });

  it("skips paid-tier users", async () => {
    const { detectAbuse } = await import("../abuse");
    const paidUser = makeUser({ _id: "user_paid" as Id<"users">, tier: "paid" as const });
    const ctx = createMockMutationCtx([paidUser], []);

    const handler = getHandler(detectAbuse);
    const result = await handler(ctx, {});

    expect(result).toEqual({ flaggedCount: 0 });
    expect(ctx._patchFn).not.toHaveBeenCalled();
  });

  it("skips already-flagged users", async () => {
    const { detectAbuse } = await import("../abuse");
    const flaggedUser = makeUser({
      _id: "user_flagged" as Id<"users">,
      flagged: true,
      flagReason: "previously flagged",
      flaggedAt: NOW - 1000,
    });
    const ctx = createMockMutationCtx([flaggedUser], []);

    const handler = getHandler(detectAbuse);
    const result = await handler(ctx, {});

    expect(result).toEqual({ flaggedCount: 0 });
    expect(ctx._patchFn).not.toHaveBeenCalled();
  });

  it("does not flag new account with 8 or fewer calls", async () => {
    const { detectAbuse } = await import("../abuse");
    const newUser = makeUser({ createdAt: NOW - 6 * 60 * 60 * 1000 }); // 6h old
    const usageRecords = Array.from({ length: 8 }, (_, i) =>
      makeUsageRecord({ createdAt: NOW - i * 60 * 1000 })
    );
    const ctx = createMockMutationCtx([newUser], usageRecords);

    const handler = getHandler(detectAbuse);
    const result = await handler(ctx, {});

    expect(result).toEqual({ flaggedCount: 0 });
    expect(ctx._patchFn).not.toHaveBeenCalled();
  });

  it("flags new account with burst AI usage (> 8 calls in < 24h)", async () => {
    const { detectAbuse } = await import("../abuse");
    const newUser = makeUser({ createdAt: NOW - 6 * 60 * 60 * 1000 }); // 6h old
    const usageRecords = Array.from({ length: 9 }, (_, i) =>
      makeUsageRecord({ createdAt: NOW - i * 60 * 1000 })
    );
    const ctx = createMockMutationCtx([newUser], usageRecords);

    const handler = getHandler(detectAbuse);
    const result = await handler(ctx, {});

    expect(result).toEqual({ flaggedCount: 1 });
    expect(ctx._patchFn).toHaveBeenCalledWith(newUser._id, {
      flagged: true,
      flagReason: expect.stringContaining("new_account_burst"),
      flaggedAt: NOW,
    });
    expect(ctx._patchFn.mock.calls[0][1].flagReason).toContain("9 AI calls");
  });

  it("does not flag user with exactly 20 hourly calls", async () => {
    const { detectAbuse } = await import("../abuse");
    // Old account (not new account burst eligible)
    const user = makeUser({ createdAt: NOW - 30 * 24 * 60 * 60 * 1000 });
    const usageRecords = Array.from({ length: 20 }, (_, i) =>
      makeUsageRecord({ createdAt: NOW - i * 60 * 1000 })
    );
    const ctx = createMockMutationCtx([user], usageRecords);

    const handler = getHandler(detectAbuse);
    const result = await handler(ctx, {});

    expect(result).toEqual({ flaggedCount: 0 });
    expect(ctx._patchFn).not.toHaveBeenCalled();
  });

  it("flags user with hourly burst (> 20 calls in 1 hour)", async () => {
    const { detectAbuse } = await import("../abuse");
    // Old account (not new account burst eligible)
    const user = makeUser({ createdAt: NOW - 30 * 24 * 60 * 60 * 1000 });
    const usageRecords = Array.from({ length: 21 }, (_, i) =>
      makeUsageRecord({ createdAt: NOW - i * 60 * 1000 })
    );
    const ctx = createMockMutationCtx([user], usageRecords);

    const handler = getHandler(detectAbuse);
    const result = await handler(ctx, {});

    expect(result).toEqual({ flaggedCount: 1 });
    expect(ctx._patchFn).toHaveBeenCalledWith(user._id, {
      flagged: true,
      flagReason: expect.stringContaining("hourly_burst"),
      flaggedAt: NOW,
    });
    expect(ctx._patchFn.mock.calls[0][1].flagReason).toContain("21 AI calls");
  });

  it("flags user exceeding monthly cost threshold (> $1.00)", async () => {
    const { detectAbuse } = await import("../abuse");
    // Old account, low call count per hour
    const user = makeUser({ createdAt: NOW - 30 * 24 * 60 * 60 * 1000 });
    // 5 expensive calls (under hourly burst, but high cost)
    const usageRecords = Array.from({ length: 5 }, (_, i) =>
      makeUsageRecord({ cost: 0.25, createdAt: NOW - i * 24 * 60 * 60 * 1000 })
    );
    const ctx = createMockMutationCtx([user], usageRecords);

    const handler = getHandler(detectAbuse);
    const result = await handler(ctx, {});

    expect(result).toEqual({ flaggedCount: 1 });
    expect(ctx._patchFn).toHaveBeenCalledWith(user._id, {
      flagged: true,
      flagReason: expect.stringContaining("high_monthly_cost"),
      flaggedAt: NOW,
    });
    expect(ctx._patchFn.mock.calls[0][1].flagReason).toContain("$1.25");
  });

  it("does not flag free user with normal usage", async () => {
    const { detectAbuse } = await import("../abuse");
    // Old account, few calls, low cost
    const user = makeUser({ createdAt: NOW - 30 * 24 * 60 * 60 * 1000 });
    const usageRecords = Array.from({ length: 3 }, (_, i) =>
      makeUsageRecord({ cost: 0.001, createdAt: NOW - i * 24 * 60 * 60 * 1000 })
    );
    const ctx = createMockMutationCtx([user], usageRecords);

    const handler = getHandler(detectAbuse);
    const result = await handler(ctx, {});

    expect(result).toEqual({ flaggedCount: 0 });
    expect(ctx._patchFn).not.toHaveBeenCalled();
  });

  it("calls ctx.db.patch with correct flagged fields", async () => {
    const { detectAbuse } = await import("../abuse");
    const newUser = makeUser({ createdAt: NOW - 2 * 60 * 60 * 1000 }); // 2h old
    const usageRecords = Array.from({ length: 10 }, (_, i) =>
      makeUsageRecord({ createdAt: NOW - i * 60 * 1000 })
    );
    const ctx = createMockMutationCtx([newUser], usageRecords);

    const handler = getHandler(detectAbuse);
    await handler(ctx, {});

    expect(ctx._patchFn).toHaveBeenCalledTimes(1);
    const patchArgs = ctx._patchFn.mock.calls[0];
    expect(patchArgs[0]).toBe(newUser._id);
    expect(patchArgs[1]).toEqual({
      flagged: true,
      flagReason: expect.any(String),
      flaggedAt: NOW,
    });
  });
});

describe("getFlaggedUsers", () => {
  it("returns empty array when no users are flagged", async () => {
    const { getFlaggedUsers } = await import("../abuse");
    const unflaggedUsers = [
      makeUser({ _id: "user_1" as Id<"users"> }),
      makeUser({ _id: "user_2" as Id<"users">, email: "user2@test.com" }),
    ];
    const ctx = createMockQueryCtx(unflaggedUsers);

    const handler = getHandler(getFlaggedUsers);
    const result = await handler(ctx, {});

    expect(result).toEqual([]);
  });

  it("returns flagged users sorted by flaggedAt descending", async () => {
    const { getFlaggedUsers } = await import("../abuse");
    const users = [
      makeUser({
        _id: "user_1" as Id<"users">,
        flagged: true,
        flagReason: "hourly_burst: 25 calls",
        flaggedAt: NOW - 1000,
      }),
      makeUser({
        _id: "user_2" as Id<"users">,
        email: "user2@test.com",
        flagged: true,
        flagReason: "new_account_burst: 12 calls",
        flaggedAt: NOW,
      }),
    ];
    const ctx = createMockQueryCtx(users);

    const handler = getHandler(getFlaggedUsers);
    const result = await handler(ctx, {});

    expect(result).toHaveLength(2);
    expect(result[0].userId).toBe("user_2");
    expect(result[1].userId).toBe("user_1");
    expect(result[0].flaggedAt).toBeGreaterThan(result[1].flaggedAt!);
  });

  it("respects limit parameter", async () => {
    const { getFlaggedUsers } = await import("../abuse");
    const users = Array.from({ length: 5 }, (_, i) =>
      makeUser({
        _id: `user_${i}` as Id<"users">,
        email: `user${i}@test.com`,
        flagged: true,
        flagReason: "test",
        flaggedAt: NOW - i * 1000,
      })
    );
    const ctx = createMockQueryCtx(users);

    const handler = getHandler(getFlaggedUsers);
    const result = await handler(ctx, { limit: 2 });

    expect(result).toHaveLength(2);
  });

  it("returns user details: userId, email, tier, flagReason, flaggedAt", async () => {
    const { getFlaggedUsers } = await import("../abuse");
    const user = makeUser({
      _id: "user_detail" as Id<"users">,
      email: "detail@test.com",
      tier: "free" as const,
      flagged: true,
      flagReason: "high_monthly_cost: $1.50",
      flaggedAt: NOW,
    });
    const ctx = createMockQueryCtx([user]);

    const handler = getHandler(getFlaggedUsers);
    const result = await handler(ctx, {});

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      userId: "user_detail",
      email: "detail@test.com",
      name: "Test User",
      tier: "free",
      createdAt: expect.any(Number),
      flagged: true,
      flagReason: "high_monthly_cost: $1.50",
      flaggedAt: NOW,
    });
  });

  it("defaults limit to 50", async () => {
    const { getFlaggedUsers } = await import("../abuse");
    const users = Array.from({ length: 55 }, (_, i) =>
      makeUser({
        _id: `user_${i}` as Id<"users">,
        email: `user${i}@test.com`,
        flagged: true,
        flagReason: "test",
        flaggedAt: NOW - i * 1000,
      })
    );
    const ctx = createMockQueryCtx(users);

    const handler = getHandler(getFlaggedUsers);
    const result = await handler(ctx, {});

    expect(result).toHaveLength(50);
  });
});

describe("unflagUser", () => {
  it("calls ctx.db.patch with flagged: undefined, flagReason: undefined, flaggedAt: undefined", async () => {
    const { unflagUser } = await import("../abuse");
    const patchFn = vi.fn();
    const getFn = vi.fn().mockResolvedValue({ _id: "user_target" });
    const ctx = { db: { patch: patchFn, get: getFn } };

    const handler = getHandler(unflagUser);
    await handler(ctx, { userId: "user_target" as Id<"users"> });

    expect(patchFn).toHaveBeenCalledWith("user_target", {
      flagged: undefined,
      flagReason: undefined,
      flaggedAt: undefined,
    });
  });

  it("uses correct userId argument", async () => {
    const { unflagUser } = await import("../abuse");
    const patchFn = vi.fn();
    const getFn = vi.fn().mockResolvedValue({ _id: "user_specific" });
    const ctx = { db: { patch: patchFn, get: getFn } };

    const handler = getHandler(unflagUser);
    await handler(ctx, { userId: "user_specific" as Id<"users"> });

    expect(patchFn).toHaveBeenCalledTimes(1);
    expect(patchFn.mock.calls[0][0]).toBe("user_specific");
  });

  it("throws error when user does not exist", async () => {
    const { unflagUser } = await import("../abuse");
    const patchFn = vi.fn();
    const getFn = vi.fn().mockResolvedValue(null);
    const ctx = { db: { patch: patchFn, get: getFn } };

    const handler = getHandler(unflagUser);
    await expect(handler(ctx, { userId: "nonexistent" as Id<"users"> }))
      .rejects.toThrow("User nonexistent not found");
    expect(patchFn).not.toHaveBeenCalled();
  });
});
