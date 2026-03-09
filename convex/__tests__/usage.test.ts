import { describe, it, expect, vi } from "vitest";

function getHandler(fn: unknown): Function {
  const registration = fn as { _handler?: Function };
  if (registration._handler) return registration._handler;
  throw new Error("Could not find handler on Convex function registration");
}

function createMockMutationCtx() {
  return {
    db: {
      insert: vi.fn().mockResolvedValue("mock_usage_id"),
      query: vi.fn(),
    },
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

describe("logAiUsage", () => {
  it("inserts a usage record with all fields and createdAt timestamp", async () => {
    const { logAiUsage } = await import("../usage");
    const ctx = createMockMutationCtx();

    const args = {
      userId: "user_123",
      model: "claude-sonnet-4-5-20250929",
      inputTokens: 100,
      outputTokens: 50,
      cost: 0.001,
      actionType: "summarize",
    };

    const handler = getHandler(logAiUsage);
    await handler(ctx, args);

    expect(ctx.db.insert).toHaveBeenCalledWith("aiUsage", {
      ...args,
      createdAt: expect.any(Number),
    });
  });
});

describe("getMonthlyUsageCount", () => {
  it("returns 0 for a user with no records", async () => {
    const { getMonthlyUsageCount } = await import("../usage");
    const ctx = createMockQueryCtx([]);

    const handler = getHandler(getMonthlyUsageCount);
    const count = await handler(ctx, { userId: "user_new" });

    expect(count).toBe(0);
  });

  it("counts records returned by compound index query", async () => {
    const { getMonthlyUsageCount } = await import("../usage");

    const now = Date.now();
    // Only current-month records (compound index filters at DB level)
    const records = [
      { userId: "user_1", createdAt: now },
      { userId: "user_1", createdAt: now },
    ];

    const ctx = createMockQueryCtx(records);

    const handler = getHandler(getMonthlyUsageCount);
    const count = await handler(ctx, { userId: "user_1" });

    expect(count).toBe(2);
  });

  it("uses by_userId_createdAt compound index", async () => {
    const { getMonthlyUsageCount } = await import("../usage");
    const ctx = createMockQueryCtx([]);

    const handler = getHandler(getMonthlyUsageCount);
    await handler(ctx, { userId: "user_specific" });

    expect(ctx.db.query).toHaveBeenCalledWith("aiUsage");
    expect(ctx._mockWithIndex).toHaveBeenCalledWith(
      "by_userId_createdAt",
      expect.any(Function)
    );
  });
});

describe("getCostSummary", () => {
  it("returns zeros and empty maps for no records", async () => {
    const { getCostSummary } = await import("../usage");
    const ctx = createMockQueryCtx([]);

    const handler = getHandler(getCostSummary);
    const result = await handler(ctx, { since: 0 });

    expect(result).toEqual({
      totalCalls: 0,
      totalCost: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      byModel: {},
      byActionType: {},
    });
  });

  it("aggregates totals correctly for a single record", async () => {
    const { getCostSummary } = await import("../usage");
    const records = [
      {
        userId: "user_1",
        model: "claude-sonnet-4-5-20250929",
        inputTokens: 500,
        outputTokens: 200,
        cost: 0.0045,
        actionType: "summarize",
        createdAt: Date.now(),
      },
    ];
    const ctx = createMockQueryCtx(records);

    const handler = getHandler(getCostSummary);
    const result = await handler(ctx, { since: 0 });

    expect(result.totalCalls).toBe(1);
    expect(result.totalCost).toBeCloseTo(0.0045);
    expect(result.totalInputTokens).toBe(500);
    expect(result.totalOutputTokens).toBe(200);
  });

  it("groups by model with correct call count, cost, and token breakdown", async () => {
    const { getCostSummary } = await import("../usage");
    const now = Date.now();
    const records = [
      {
        userId: "user_1",
        model: "claude-sonnet-4-5-20250929",
        inputTokens: 500,
        outputTokens: 200,
        cost: 0.0045,
        actionType: "summarize",
        createdAt: now,
      },
      {
        userId: "user_2",
        model: "claude-sonnet-4-5-20250929",
        inputTokens: 300,
        outputTokens: 100,
        cost: 0.0024,
        actionType: "translate",
        createdAt: now,
      },
      {
        userId: "user_1",
        model: "claude-haiku-4-5-20251001",
        inputTokens: 300,
        outputTokens: 100,
        cost: 0.0006,
        actionType: "summarize",
        createdAt: now,
      },
    ];
    const ctx = createMockQueryCtx(records);

    const handler = getHandler(getCostSummary);
    const result = await handler(ctx, { since: 0 });

    expect(result.totalCalls).toBe(3);
    expect(result.totalCost).toBeCloseTo(0.0075);
    expect(result.totalInputTokens).toBe(1100);
    expect(result.totalOutputTokens).toBe(400);

    expect(result.byModel["claude-sonnet-4-5-20250929"]).toEqual({
      calls: 2,
      cost: expect.closeTo(0.0069, 4),
      inputTokens: 800,
      outputTokens: 300,
    });
    expect(result.byModel["claude-haiku-4-5-20251001"]).toEqual({
      calls: 1,
      cost: expect.closeTo(0.0006, 4),
      inputTokens: 300,
      outputTokens: 100,
    });
  });

  it("groups by actionType with correct call count and cost", async () => {
    const { getCostSummary } = await import("../usage");
    const now = Date.now();
    const records = [
      {
        userId: "user_1",
        model: "sonnet",
        inputTokens: 100,
        outputTokens: 50,
        cost: 0.001,
        actionType: "summarize",
        createdAt: now,
      },
      {
        userId: "user_2",
        model: "sonnet",
        inputTokens: 200,
        outputTokens: 80,
        cost: 0.002,
        actionType: "summarize",
        createdAt: now,
      },
      {
        userId: "user_1",
        model: "haiku",
        inputTokens: 100,
        outputTokens: 50,
        cost: 0.0005,
        actionType: "translate",
        createdAt: now,
      },
    ];
    const ctx = createMockQueryCtx(records);

    const handler = getHandler(getCostSummary);
    const result = await handler(ctx, { since: 0 });

    expect(result.byActionType["summarize"]).toEqual({
      calls: 2,
      cost: expect.closeTo(0.003, 4),
    });
    expect(result.byActionType["translate"]).toEqual({
      calls: 1,
      cost: expect.closeTo(0.0005, 4),
    });
  });

  it("uses by_createdAt index", async () => {
    const { getCostSummary } = await import("../usage");
    const ctx = createMockQueryCtx([]);

    const handler = getHandler(getCostSummary);
    await handler(ctx, { since: 0 });

    expect(ctx.db.query).toHaveBeenCalledWith("aiUsage");
    expect(ctx._mockWithIndex).toHaveBeenCalledWith(
      "by_createdAt",
      expect.any(Function)
    );
  });
});

describe("getCostByUser", () => {
  it("returns empty array for no records", async () => {
    const { getCostByUser } = await import("../usage");
    const ctx = createMockQueryCtx([]);

    const handler = getHandler(getCostByUser);
    const result = await handler(ctx, { since: 0 });

    expect(result).toEqual([]);
  });

  it("groups records by userId with correct aggregation", async () => {
    const { getCostByUser } = await import("../usage");
    const now = Date.now();
    const records = [
      {
        userId: "user_1",
        model: "sonnet",
        inputTokens: 500,
        outputTokens: 200,
        cost: 0.004,
        actionType: "summarize",
        createdAt: now,
      },
      {
        userId: "user_1",
        model: "haiku",
        inputTokens: 300,
        outputTokens: 100,
        cost: 0.001,
        actionType: "translate",
        createdAt: now,
      },
    ];
    const ctx = createMockQueryCtx(records);

    const handler = getHandler(getCostByUser);
    const result = await handler(ctx, { since: 0 });

    expect(result).toHaveLength(1);
    expect(result[0].userId).toBe("user_1");
    expect(result[0].totalCost).toBeCloseTo(0.005);
    expect(result[0].totalCalls).toBe(2);
    expect(result[0].byModel).toEqual({
      sonnet: { calls: 1, cost: 0.004 },
      haiku: { calls: 1, cost: 0.001 },
    });
    expect(result[0].byActionType).toEqual({
      summarize: { calls: 1, cost: 0.004 },
      translate: { calls: 1, cost: 0.001 },
    });
  });

  it("sorts users by totalCost descending", async () => {
    const { getCostByUser } = await import("../usage");
    const now = Date.now();
    const records = [
      {
        userId: "user_cheap",
        model: "haiku",
        inputTokens: 100,
        outputTokens: 50,
        cost: 0.0001,
        actionType: "summarize",
        createdAt: now,
      },
      {
        userId: "user_expensive",
        model: "sonnet",
        inputTokens: 1000,
        outputTokens: 500,
        cost: 0.01,
        actionType: "summarize",
        createdAt: now,
      },
      {
        userId: "user_mid",
        model: "sonnet",
        inputTokens: 500,
        outputTokens: 200,
        cost: 0.003,
        actionType: "translate",
        createdAt: now,
      },
    ];
    const ctx = createMockQueryCtx(records);

    const handler = getHandler(getCostByUser);
    const result = await handler(ctx, { since: 0 });

    expect(result).toHaveLength(3);
    expect(result[0].userId).toBe("user_expensive");
    expect(result[1].userId).toBe("user_mid");
    expect(result[2].userId).toBe("user_cheap");
  });

  it("respects limit parameter", async () => {
    const { getCostByUser } = await import("../usage");
    const now = Date.now();
    const records = [
      { userId: "u1", model: "s", inputTokens: 1, outputTokens: 1, cost: 0.003, actionType: "a", createdAt: now },
      { userId: "u2", model: "s", inputTokens: 1, outputTokens: 1, cost: 0.002, actionType: "a", createdAt: now },
      { userId: "u3", model: "s", inputTokens: 1, outputTokens: 1, cost: 0.001, actionType: "a", createdAt: now },
    ];
    const ctx = createMockQueryCtx(records);

    const handler = getHandler(getCostByUser);
    const result = await handler(ctx, { since: 0, limit: 2 });

    expect(result).toHaveLength(2);
    expect(result[0].userId).toBe("u1");
    expect(result[1].userId).toBe("u2");
  });

  it("uses by_createdAt index", async () => {
    const { getCostByUser } = await import("../usage");
    const ctx = createMockQueryCtx([]);

    const handler = getHandler(getCostByUser);
    await handler(ctx, { since: 0 });

    expect(ctx.db.query).toHaveBeenCalledWith("aiUsage");
    expect(ctx._mockWithIndex).toHaveBeenCalledWith(
      "by_createdAt",
      expect.any(Function)
    );
  });
});

describe("getTimePeriodCosts", () => {
  it("returns zeros for no records", async () => {
    const { getTimePeriodCosts } = await import("../usage");
    const ctx = createMockQueryCtx([]);

    const handler = getHandler(getTimePeriodCosts);
    const result = await handler(ctx, {});

    expect(result.today).toEqual({ totalCost: 0, totalCalls: 0 });
    expect(result.thisWeek).toEqual({ totalCost: 0, totalCalls: 0 });
    expect(result.thisMonth).toEqual({ totalCost: 0, totalCalls: 0 });
  });

  it("correctly calculates today/thisWeek/thisMonth totals", async () => {
    const { getTimePeriodCosts } = await import("../usage");

    const now = new Date();
    const todayRecord = {
      userId: "user_1",
      model: "sonnet",
      inputTokens: 100,
      outputTokens: 50,
      cost: 0.001,
      actionType: "summarize",
      createdAt: now.getTime(),
    };

    const ctx = createMockQueryCtx([todayRecord]);

    const handler = getHandler(getTimePeriodCosts);
    const result = await handler(ctx, {});

    // A record from today should appear in all three periods
    expect(result.today.totalCalls).toBe(1);
    expect(result.today.totalCost).toBeCloseTo(0.001);
    expect(result.thisWeek.totalCalls).toBe(1);
    expect(result.thisWeek.totalCost).toBeCloseTo(0.001);
    expect(result.thisMonth.totalCalls).toBe(1);
    expect(result.thisMonth.totalCost).toBeCloseTo(0.001);
  });

  it("today is subset of thisWeek which is subset of thisMonth", async () => {
    const { getTimePeriodCosts } = await import("../usage");

    const now = new Date();
    // Record from today
    const todayRecord = {
      userId: "user_1",
      model: "sonnet",
      inputTokens: 100,
      outputTokens: 50,
      cost: 0.001,
      actionType: "summarize",
      createdAt: now.getTime(),
    };
    // Record from earlier this month (first of month)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 12);
    const monthRecord = {
      userId: "user_2",
      model: "haiku",
      inputTokens: 200,
      outputTokens: 100,
      cost: 0.002,
      actionType: "translate",
      createdAt: startOfMonth.getTime(),
    };

    const ctx = createMockQueryCtx([todayRecord, monthRecord]);

    const handler = getHandler(getTimePeriodCosts);
    const result = await handler(ctx, {});

    // thisMonth should include all records
    expect(result.thisMonth.totalCalls).toBe(2);
    // today should be subset (fewer or equal)
    expect(result.today.totalCalls).toBeLessThanOrEqual(
      result.thisWeek.totalCalls
    );
    expect(result.thisWeek.totalCalls).toBeLessThanOrEqual(
      result.thisMonth.totalCalls
    );
  });

  it("filters records into correct time buckets", async () => {
    // Fix to Wednesday March 11, 2026 12:00 local to ensure
    // today/thisWeek/thisMonth have distinct boundaries
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 2, 11, 12, 0, 0, 0));

    const { getTimePeriodCosts } = await import("../usage");

    const now = Date.now();
    const ONE_HOUR = 3_600_000;
    const ONE_DAY = 86_400_000;

    const records = [
      // 1 hour ago → today, thisWeek, thisMonth
      { userId: "u1", model: "s", inputTokens: 1, outputTokens: 1, cost: 0.001, actionType: "a", createdAt: now - ONE_HOUR },
      // 2 days ago (Monday) → NOT today, but thisWeek & thisMonth
      { userId: "u1", model: "s", inputTokens: 1, outputTokens: 1, cost: 0.002, actionType: "a", createdAt: now - 2 * ONE_DAY },
      // 8 days ago → NOT today, NOT thisWeek, but thisMonth
      { userId: "u1", model: "s", inputTokens: 1, outputTokens: 1, cost: 0.004, actionType: "a", createdAt: now - 8 * ONE_DAY },
    ];

    const ctx = createMockQueryCtx(records);
    const handler = getHandler(getTimePeriodCosts);
    const result = await handler(ctx, {});

    expect(result.today.totalCalls).toBe(1);
    expect(result.today.totalCost).toBeCloseTo(0.001);
    expect(result.thisWeek.totalCalls).toBe(2);
    expect(result.thisWeek.totalCost).toBeCloseTo(0.003);
    expect(result.thisMonth.totalCalls).toBe(3);
    expect(result.thisMonth.totalCost).toBeCloseTo(0.007);

    vi.useRealTimers();
  });

  it("uses by_createdAt index", async () => {
    const { getTimePeriodCosts } = await import("../usage");
    const ctx = createMockQueryCtx([]);

    const handler = getHandler(getTimePeriodCosts);
    await handler(ctx, {});

    expect(ctx.db.query).toHaveBeenCalledWith("aiUsage");
    expect(ctx._mockWithIndex).toHaveBeenCalledWith(
      "by_createdAt",
      expect.any(Function)
    );
  });
});

describe("getUserUsageSummary", () => {
  it("returns empty summary for user with no records", async () => {
    const { getUserUsageSummary } = await import("../usage");
    const ctx = createMockQueryCtx([]);

    const handler = getHandler(getUserUsageSummary);
    const summary = await handler(ctx, { userId: "user_new" });

    expect(summary).toEqual({
      totalCalls: 0,
      totalCost: 0,
      byModel: {},
      byActionType: {},
    });
  });

  it("aggregates usage by model and action type", async () => {
    const { getUserUsageSummary } = await import("../usage");

    const now = Date.now();
    const records = [
      { userId: "user_1", model: "sonnet", actionType: "summarize", cost: 0.001, createdAt: now },
      { userId: "user_1", model: "sonnet", actionType: "translate", cost: 0.002, createdAt: now },
      { userId: "user_1", model: "haiku", actionType: "summarize", cost: 0.0005, createdAt: now },
    ];

    const ctx = createMockQueryCtx(records);

    const handler = getHandler(getUserUsageSummary);
    const summary = await handler(ctx, { userId: "user_1" });

    expect(summary.totalCalls).toBe(3);
    expect(summary.totalCost).toBeCloseTo(0.0035);
    expect(summary.byModel).toEqual({ sonnet: 2, haiku: 1 });
    expect(summary.byActionType).toEqual({ summarize: 2, translate: 1 });
  });
});

describe("getDailyOpusUsageCount", () => {
  it("returns 0 for user with no daily Opus records", async () => {
    const { getDailyOpusUsageCount } = await import("../usage");
    const ctx = createMockQueryCtx([]);

    const handler = getHandler(getDailyOpusUsageCount);
    const count = await handler(ctx, { userId: "user_new" });

    expect(count).toBe(0);
  });

  it("counts only Opus model records, not Sonnet", async () => {
    const { getDailyOpusUsageCount } = await import("../usage");

    const now = Date.now();
    const records = [
      { userId: "user_1", model: "claude-opus-4-6", createdAt: now },
      { userId: "user_1", model: "claude-opus-4-6", createdAt: now },
      { userId: "user_1", model: "claude-sonnet-4-5-20250929", createdAt: now },
      { userId: "user_1", model: "claude-sonnet-4-5-20250929", createdAt: now },
    ];

    const ctx = createMockQueryCtx(records);

    const handler = getHandler(getDailyOpusUsageCount);
    const count = await handler(ctx, { userId: "user_1" });

    expect(count).toBe(2); // Only 2 Opus records
  });

  it("uses by_userId_createdAt compound index", async () => {
    const { getDailyOpusUsageCount } = await import("../usage");
    const ctx = createMockQueryCtx([]);

    const handler = getHandler(getDailyOpusUsageCount);
    await handler(ctx, { userId: "user_specific" });

    expect(ctx.db.query).toHaveBeenCalledWith("aiUsage");
    expect(ctx._mockWithIndex).toHaveBeenCalledWith(
      "by_userId_createdAt",
      expect.any(Function)
    );
  });
});

describe("getMyDailyOpusUsage", () => {
  it("returns 0/0 when user is not authenticated", async () => {
    const { getMyDailyOpusUsage } = await import("../usage");

    const ctx = {
      auth: {
        getUserIdentity: vi.fn().mockResolvedValue(null),
      },
      db: {
        query: vi.fn(),
      },
    };

    const handler = getHandler(getMyDailyOpusUsage);
    const result = await handler(ctx, {});

    expect(result).toEqual({ count: 0, limit: 0 });
  });

  it("returns 0/0 when user not found in DB", async () => {
    const { getMyDailyOpusUsage } = await import("../usage");

    const ctx = {
      auth: {
        getUserIdentity: vi.fn().mockResolvedValue({ subject: "clerk_user_123" }),
      },
      db: {
        query: vi.fn().mockReturnValue({
          withIndex: vi.fn().mockReturnThis(),
          unique: vi.fn().mockResolvedValue(null),
        }),
      },
    };

    const handler = getHandler(getMyDailyOpusUsage);
    const result = await handler(ctx, {});

    expect(result).toEqual({ count: 0, limit: 0 });
  });

  it("returns 0/0 for free user (no Opus access)", async () => {
    const { getMyDailyOpusUsage } = await import("../usage");

    const ctx = {
      auth: {
        getUserIdentity: vi.fn().mockResolvedValue({ subject: "clerk_user_123" }),
      },
      db: {
        query: vi.fn().mockReturnValue({
          withIndex: vi.fn().mockReturnThis(),
          unique: vi.fn().mockResolvedValue({ _id: "user_free", tier: "free" }),
          collect: vi.fn().mockResolvedValue([]),
        }),
      },
    };

    const handler = getHandler(getMyDailyOpusUsage);
    const result = await handler(ctx, {});

    expect(result).toEqual({ count: 0, limit: 0 }); // Free users don't get Opus limit shown
  });

  it("returns Opus count and limit (5) for paid user", async () => {
    const { getMyDailyOpusUsage } = await import("../usage");

    const now = Date.now();
    const opusRecords = [
      { userId: "user_paid", model: "claude-opus-4-6", createdAt: now },
      { userId: "user_paid", model: "claude-opus-4-6", createdAt: now },
      { userId: "user_paid", model: "claude-sonnet-4-5-20250929", createdAt: now },
    ];

    const ctx = {
      auth: {
        getUserIdentity: vi.fn().mockResolvedValue({ subject: "clerk_user_123" }),
      },
      db: {
        query: vi.fn().mockReturnValue({
          withIndex: vi.fn().mockReturnThis(),
          unique: vi.fn().mockResolvedValue({ _id: "user_paid", tier: "paid" }),
          collect: vi.fn().mockResolvedValue(opusRecords),
        }),
      },
    };

    const handler = getHandler(getMyDailyOpusUsage);
    const result = await handler(ctx, {});

    expect(result).toEqual({ count: 2, limit: 5 }); // 2 Opus calls, 5 limit
  });
});
