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
