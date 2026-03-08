import { describe, it, expect, vi } from "vitest";
import { ConvexError } from "convex/values";

// Helper to create a mock database query chain
function createMockQueryChain(result: unknown = null) {
  return {
    withIndex: vi.fn().mockReturnThis(),
    unique: vi.fn().mockResolvedValue(result),
  };
}

// Helper to create a mock mutation context
function createMockMutationCtx(queryResult: unknown = null) {
  const queryChain = createMockQueryChain(queryResult);
  return {
    ctx: {
      db: {
        query: vi.fn().mockReturnValue(queryChain),
        insert: vi.fn().mockResolvedValue("mock_id"),
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

// Extract handler from Convex function registration object
// Convex builders store the handler in _handler property
function getHandler(fn: unknown): Function {
  const registration = fn as { _handler?: Function };
  if (registration._handler) return registration._handler;
  throw new Error("Could not find handler on Convex function registration");
}

async function importUsers() {
  return await import("../users");
}

describe("upsertFromClerk", () => {
  it("creates a new user when user does not exist", async () => {
    const { upsertFromClerk } = await importUsers();
    const { ctx } = createMockMutationCtx(null);

    // Access the handler from the Convex function definition
    const handler = getHandler(upsertFromClerk);
    await handler(ctx, {
      clerkId: "clerk_123",
      email: "test@example.com",
      name: "Test User",
    });

    expect(ctx.db.query).toHaveBeenCalledWith("users");
    expect(ctx.db.insert).toHaveBeenCalledWith("users", {
      clerkId: "clerk_123",
      email: "test@example.com",
      name: "Test User",
      tier: "free",
      createdAt: expect.any(Number),
    });
  });

  it("updates existing user when user already exists (idempotent)", async () => {
    const { upsertFromClerk } = await importUsers();
    const existingUser = {
      _id: "existing_id",
      clerkId: "clerk_123",
      email: "old@example.com",
      name: "Old Name",
      tier: "free",
      createdAt: 1000,
    };
    const { ctx } = createMockMutationCtx(existingUser);

    const handler = getHandler(upsertFromClerk);
    await handler(ctx, {
      clerkId: "clerk_123",
      email: "new@example.com",
      name: "New Name",
    });

    expect(ctx.db.patch).toHaveBeenCalledWith("existing_id", {
      email: "new@example.com",
      name: "New Name",
    });
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });
});

describe("deleteFromClerk", () => {
  it("removes user record by clerkId", async () => {
    const { deleteFromClerk } = await importUsers();
    const existingUser = {
      _id: "user_to_delete",
      clerkId: "clerk_456",
    };
    const { ctx } = createMockMutationCtx(existingUser);

    const handler = getHandler(deleteFromClerk);
    await handler(ctx, { clerkId: "clerk_456" });

    expect(ctx.db.query).toHaveBeenCalledWith("users");
    expect(ctx.db.delete).toHaveBeenCalledWith("user_to_delete");
  });

  it("does nothing when user does not exist", async () => {
    const { deleteFromClerk } = await importUsers();
    const { ctx } = createMockMutationCtx(null);

    const handler = getHandler(deleteFromClerk);
    await handler(ctx, { clerkId: "nonexistent" });

    expect(ctx.db.delete).not.toHaveBeenCalled();
  });
});

describe("getCurrentUser", () => {
  it("returns null when no auth identity", async () => {
    const { getCurrentUser } = await importUsers();
    const { ctx } = createMockMutationCtx();
    ctx.auth.getUserIdentity.mockResolvedValue(null);

    const handler = getHandler(getCurrentUser);
    const result = await handler(ctx, {});

    expect(result).toBeNull();
    expect(ctx.db.query).not.toHaveBeenCalled();
  });

  it("returns user object when authenticated", async () => {
    const { getCurrentUser } = await importUsers();
    const user = {
      _id: "user_id",
      clerkId: "clerk_789",
      email: "auth@example.com",
      name: "Auth User",
      tier: "free",
      createdAt: 1000,
    };
    const { ctx } = createMockMutationCtx(user);
    ctx.auth.getUserIdentity.mockResolvedValue({
      subject: "clerk_789",
      issuer: "https://clerk.example.com",
    });

    const handler = getHandler(getCurrentUser);
    const result = await handler(ctx, {});

    expect(result).toEqual(user);
    expect(ctx.db.query).toHaveBeenCalledWith("users");
  });
});

describe("getCurrentUserOrThrow", () => {
  it("throws ConvexError with AUTH_REQUIRED when no auth identity", async () => {
    const { getCurrentUserOrThrow } = await importUsers();
    const { ctx } = createMockMutationCtx();
    ctx.auth.getUserIdentity.mockResolvedValue(null);

    const handler = getHandler(getCurrentUserOrThrow);

    await expect(handler(ctx, {})).rejects.toThrowError(ConvexError);
    await expect(handler(ctx, {})).rejects.toMatchObject({
      data: { code: "AUTH_REQUIRED" },
    });
  });

  it("throws ConvexError with USER_NOT_FOUND when authenticated but no user record", async () => {
    const { getCurrentUserOrThrow } = await importUsers();
    const { ctx } = createMockMutationCtx(null);
    ctx.auth.getUserIdentity.mockResolvedValue({
      subject: "clerk_unknown",
      issuer: "https://clerk.example.com",
    });

    const handler = getHandler(getCurrentUserOrThrow);

    await expect(handler(ctx, {})).rejects.toThrowError(ConvexError);
    await expect(handler(ctx, {})).rejects.toMatchObject({
      data: { code: "USER_NOT_FOUND" },
    });
  });

  it("returns user when authenticated and user exists", async () => {
    const { getCurrentUserOrThrow } = await importUsers();
    const user = {
      _id: "user_id",
      clerkId: "clerk_valid",
      email: "valid@example.com",
      name: "Valid User",
      tier: "free",
      createdAt: 1000,
    };
    const { ctx } = createMockMutationCtx(user);
    ctx.auth.getUserIdentity.mockResolvedValue({
      subject: "clerk_valid",
      issuer: "https://clerk.example.com",
    });

    const handler = getHandler(getCurrentUserOrThrow);
    const result = await handler(ctx, {});

    expect(result).toEqual(user);
  });
});
