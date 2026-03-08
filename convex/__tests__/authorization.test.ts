import { describe, it, expect, vi } from "vitest";
import { ConvexError } from "convex/values";
import { requireAuth, requireTier } from "../lib/authorization";
import { checkAiAccess, FREE_MONTHLY_AI_LIMIT, PAID_DAILY_OPUS_LIMIT } from "../lib/tierLimits";

function createMockQueryChain(result: unknown = null) {
  return {
    withIndex: vi.fn().mockReturnThis(),
    unique: vi.fn().mockResolvedValue(result),
  };
}

function createMockCtx(identity: unknown = null, queryResult: unknown = null) {
  const queryChain = createMockQueryChain(queryResult);
  return {
    ctx: {
      db: {
        query: vi.fn().mockReturnValue(queryChain),
      },
      auth: {
        getUserIdentity: vi.fn().mockResolvedValue(identity),
      },
    },
    queryChain,
  };
}

describe("requireAuth", () => {
  it("throws AUTH_REQUIRED when no identity", async () => {
    const { ctx } = createMockCtx(null);

    await expect(requireAuth(ctx as never)).rejects.toThrowError(ConvexError);
    await expect(requireAuth(ctx as never)).rejects.toMatchObject({
      data: { code: "AUTH_REQUIRED" },
    });
  });

  it("returns identity when authenticated", async () => {
    const identity = { subject: "clerk_123", issuer: "https://clerk.example.com" };
    const { ctx } = createMockCtx(identity);

    const result = await requireAuth(ctx as never);
    expect(result).toEqual(identity);
  });
});

describe("requireTier", () => {
  it("throws AUTH_REQUIRED when no identity", async () => {
    const { ctx } = createMockCtx(null);

    await expect(requireTier(ctx as never, "free")).rejects.toMatchObject({
      data: { code: "AUTH_REQUIRED" },
    });
  });

  it("throws USER_NOT_FOUND when authenticated but no user record", async () => {
    const identity = { subject: "clerk_unknown" };
    const { ctx } = createMockCtx(identity, null);

    await expect(requireTier(ctx as never, "free")).rejects.toMatchObject({
      data: { code: "USER_NOT_FOUND" },
    });
  });

  it("returns user when free tier is required and user is free", async () => {
    const identity = { subject: "clerk_123" };
    const user = { _id: "user_1", clerkId: "clerk_123", tier: "free", createdAt: 1000 };
    const { ctx } = createMockCtx(identity, user);

    const result = await requireTier(ctx as never, "free");
    expect(result).toEqual(user);
  });

  it("returns user when free tier is required and user is paid", async () => {
    const identity = { subject: "clerk_123" };
    const user = { _id: "user_1", clerkId: "clerk_123", tier: "paid", createdAt: 1000 };
    const { ctx } = createMockCtx(identity, user);

    const result = await requireTier(ctx as never, "free");
    expect(result).toEqual(user);
  });

  it("throws TIER_INSUFFICIENT when paid tier required but user is free", async () => {
    const identity = { subject: "clerk_123" };
    const user = { _id: "user_1", clerkId: "clerk_123", tier: "free", createdAt: 1000 };
    const { ctx } = createMockCtx(identity, user);

    await expect(requireTier(ctx as never, "paid")).rejects.toMatchObject({
      data: { code: "TIER_INSUFFICIENT" },
    });
  });

  it("returns user when paid tier required and user is paid", async () => {
    const identity = { subject: "clerk_123" };
    const user = { _id: "user_1", clerkId: "clerk_123", tier: "paid", createdAt: 1000 };
    const { ctx } = createMockCtx(identity, user);

    const result = await requireTier(ctx as never, "paid");
    expect(result).toEqual(user);
  });
});

describe("checkAiAccess", () => {
  it("denies free users access to Opus", () => {
    const result = checkAiAccess("free", "opus");
    expect(result.allowed).toBe(false);
    expect(result.message).toBeTruthy();
    expect(result.messageEn).toBeTruthy();
  });

  it("allows free users access to Sonnet", () => {
    const result = checkAiAccess("free", "sonnet");
    expect(result.allowed).toBe(true);
  });

  it("allows paid users access to Sonnet", () => {
    const result = checkAiAccess("paid", "sonnet");
    expect(result.allowed).toBe(true);
  });

  it("allows paid users access to Opus", () => {
    const result = checkAiAccess("paid", "opus");
    expect(result.allowed).toBe(true);
  });
});

describe("tier limit constants", () => {
  it("FREE_MONTHLY_AI_LIMIT is a positive number", () => {
    expect(FREE_MONTHLY_AI_LIMIT).toBeGreaterThan(0);
  });

  it("PAID_DAILY_OPUS_LIMIT is a positive number", () => {
    expect(PAID_DAILY_OPUS_LIMIT).toBeGreaterThan(0);
  });
});
