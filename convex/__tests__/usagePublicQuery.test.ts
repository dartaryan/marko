import { describe, it, expect, vi } from "vitest";

function getHandler(fn: unknown): Function {
  const registration = fn as { _handler?: Function };
  if (registration._handler) return registration._handler;
  throw new Error("Could not find handler on Convex function registration");
}

function createMockPublicQueryCtx(options: {
  identity?: { subject: string } | null;
  user?: { _id: string; tier: "free" | "paid"; clerkId: string } | null;
  usageRecords?: unknown[];
}) {
  const { identity = null, user = null, usageRecords = [] } = options;

  const mockCollect = vi.fn().mockResolvedValue(usageRecords);
  const mockWithIndex = vi.fn().mockReturnValue({
    collect: mockCollect,
    filter: vi.fn().mockReturnValue({ collect: mockCollect }),
  });
  const mockUnique = vi.fn().mockResolvedValue(user);

  return {
    auth: {
      getUserIdentity: vi.fn().mockResolvedValue(identity),
    },
    db: {
      query: vi.fn().mockReturnValue({
        withIndex: vi.fn((indexName: string) => {
          if (indexName === "by_clerkId") {
            return { unique: mockUnique };
          }
          return { collect: mockCollect };
        }),
      }),
    },
  };
}

describe("getMyMonthlyUsage", () => {
  it("returns { count: 0, limit: 0 } for unauthenticated user", async () => {
    const { getMyMonthlyUsage } = await import("../usage");
    const ctx = createMockPublicQueryCtx({ identity: null });

    const handler = getHandler(getMyMonthlyUsage);
    const result = await handler(ctx, {});

    expect(result).toEqual({ count: 0, limit: 0 });
  });

  it("returns { count: 0, limit: 0 } when user not found in database", async () => {
    const { getMyMonthlyUsage } = await import("../usage");
    const ctx = createMockPublicQueryCtx({
      identity: { subject: "clerk_unknown" },
      user: null,
    });

    const handler = getHandler(getMyMonthlyUsage);
    const result = await handler(ctx, {});

    expect(result).toEqual({ count: 0, limit: 0 });
  });

  it("returns { count: N, limit: 5 } for free user with N usage records", async () => {
    const { getMyMonthlyUsage } = await import("../usage");
    const now = Date.now();
    const ctx = createMockPublicQueryCtx({
      identity: { subject: "clerk_free" },
      user: { _id: "user_free", tier: "free", clerkId: "clerk_free" },
      usageRecords: [
        { userId: "user_free", createdAt: now },
        { userId: "user_free", createdAt: now },
        { userId: "user_free", createdAt: now },
      ],
    });

    const handler = getHandler(getMyMonthlyUsage);
    const result = await handler(ctx, {});

    expect(result).toEqual({ count: 3, limit: 5 });

    // Verify correct tables and indexes are queried
    expect(ctx.auth.getUserIdentity).toHaveBeenCalled();
    expect(ctx.db.query).toHaveBeenCalledWith("users");
    expect(ctx.db.query).toHaveBeenCalledWith("aiUsage");
  });

  it("returns { count: 0, limit: 5 } for free user with no usage this month", async () => {
    const { getMyMonthlyUsage } = await import("../usage");
    const ctx = createMockPublicQueryCtx({
      identity: { subject: "clerk_new_free" },
      user: { _id: "user_new_free", tier: "free", clerkId: "clerk_new_free" },
      usageRecords: [],
    });

    const handler = getHandler(getMyMonthlyUsage);
    const result = await handler(ctx, {});

    expect(result).toEqual({ count: 0, limit: 5 });
  });

  it("returns { count: N, limit: null } for paid user", async () => {
    const { getMyMonthlyUsage } = await import("../usage");
    const now = Date.now();
    const ctx = createMockPublicQueryCtx({
      identity: { subject: "clerk_paid" },
      user: { _id: "user_paid", tier: "paid", clerkId: "clerk_paid" },
      usageRecords: [
        { userId: "user_paid", createdAt: now },
        { userId: "user_paid", createdAt: now },
      ],
    });

    const handler = getHandler(getMyMonthlyUsage);
    const result = await handler(ctx, {});

    expect(result).toEqual({ count: 2, limit: null });
  });
});
