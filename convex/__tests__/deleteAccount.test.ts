import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ConvexError } from "convex/values";

// Mock the _generated/api module before importing users
vi.mock("../_generated/api", () => ({
  internal: {
    users: {
      deleteFromClerk: "internal:users:deleteFromClerk",
      getUserByClerkId: "internal:users:getUserByClerkId",
    },
    analytics: {
      deleteByUserId: "internal:analytics:deleteByUserId",
    },
  },
}));

// Mock the _generated/server module
vi.mock("../_generated/server", () => ({
  query: (config: { args: unknown; handler: Function }) => {
    const fn = { _handler: config.handler };
    return fn;
  },
  internalQuery: (config: { args: unknown; handler: Function }) => {
    const fn = { _handler: config.handler };
    return fn;
  },
  internalMutation: (config: { args: unknown; handler: Function }) => {
    const fn = { _handler: config.handler };
    return fn;
  },
  action: (config: { args: unknown; handler: Function }) => {
    const fn = { _handler: config.handler };
    return fn;
  },
}));

function getHandler(fn: unknown): Function {
  const registration = fn as { _handler?: Function };
  if (registration._handler) return registration._handler;
  throw new Error("Could not find handler on Convex function registration");
}

let mockFetch: ReturnType<typeof vi.fn>;

beforeEach(() => {
  mockFetch = vi.fn();
  vi.stubGlobal("fetch", mockFetch);
  vi.stubEnv("CLERK_SECRET_KEY", "test_secret_key");
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("deleteMyAccount", () => {
  it("throws AUTH_REQUIRED when no identity", async () => {
    const { deleteMyAccount } = await import("../users");
    const handler = getHandler(deleteMyAccount);

    const ctx = {
      auth: { getUserIdentity: vi.fn().mockResolvedValue(null) },
      runMutation: vi.fn(),
    };

    await expect(handler(ctx)).rejects.toThrowError(ConvexError);
    await expect(handler(ctx)).rejects.toMatchObject({
      data: { code: "AUTH_REQUIRED" },
    });
  });

  it("deletes from Convex and Clerk on success", async () => {
    const { deleteMyAccount } = await import("../users");
    const handler = getHandler(deleteMyAccount);

    mockFetch.mockResolvedValue({ ok: true, status: 200 });

    const ctx = {
      auth: {
        getUserIdentity: vi.fn().mockResolvedValue({ subject: "clerk_123" }),
      },
      runMutation: vi.fn().mockResolvedValue(undefined),
      runQuery: vi.fn().mockResolvedValue({ _id: "user_123", clerkId: "clerk_123" }),
    };

    await handler(ctx);

    expect(ctx.runMutation).toHaveBeenCalledWith(
      "internal:users:deleteFromClerk",
      { clerkId: "clerk_123" }
    );

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.clerk.com/v1/users/clerk_123",
      {
        method: "DELETE",
        headers: { Authorization: "Bearer test_secret_key" },
      }
    );
  });

  it("handles Clerk 404 gracefully (user already deleted)", async () => {
    const { deleteMyAccount } = await import("../users");
    const handler = getHandler(deleteMyAccount);

    mockFetch.mockResolvedValue({ ok: false, status: 404 });

    const ctx = {
      auth: {
        getUserIdentity: vi.fn().mockResolvedValue({ subject: "clerk_123" }),
      },
      runMutation: vi.fn().mockResolvedValue(undefined),
      runQuery: vi.fn().mockResolvedValue({ _id: "user_123", clerkId: "clerk_123" }),
    };

    // Should not throw
    await expect(handler(ctx)).resolves.toBeUndefined();
  });

  it("throws CONFIG_ERROR when CLERK_SECRET_KEY is missing", async () => {
    vi.unstubAllEnvs();
    vi.stubEnv("CLERK_SECRET_KEY", "");

    // Need to re-import after clearing env
    vi.resetModules();

    // Re-mock dependencies
    vi.doMock("../_generated/api", () => ({
      internal: {
        users: {
          deleteFromClerk: "internal:users:deleteFromClerk",
          getUserByClerkId: "internal:users:getUserByClerkId",
        },
        analytics: {
          deleteByUserId: "internal:analytics:deleteByUserId",
        },
      },
    }));
    vi.doMock("../_generated/server", () => ({
      query: (config: { args: unknown; handler: Function }) => ({
        _handler: config.handler,
      }),
      internalQuery: (config: { args: unknown; handler: Function }) => ({
        _handler: config.handler,
      }),
      internalMutation: (config: { args: unknown; handler: Function }) => ({
        _handler: config.handler,
      }),
      action: (config: { args: unknown; handler: Function }) => ({
        _handler: config.handler,
      }),
    }));

    const { deleteMyAccount } = await import("../users");
    const handler = getHandler(deleteMyAccount);

    const ctx = {
      auth: {
        getUserIdentity: vi.fn().mockResolvedValue({ subject: "clerk_123" }),
      },
      runMutation: vi.fn().mockResolvedValue(undefined),
    };

    await expect(handler(ctx)).rejects.toMatchObject({
      data: { code: "CONFIG_ERROR" },
    });
  });

  it("throws CLERK_DELETE_FAILED on Clerk API error", async () => {
    const { deleteMyAccount } = await import("../users");
    const handler = getHandler(deleteMyAccount);

    mockFetch.mockResolvedValue({ ok: false, status: 500 });

    const ctx = {
      auth: {
        getUserIdentity: vi.fn().mockResolvedValue({ subject: "clerk_123" }),
      },
      runMutation: vi.fn().mockResolvedValue(undefined),
    };

    await expect(handler(ctx)).rejects.toMatchObject({
      data: { code: "CLERK_DELETE_FAILED" },
    });
  });

  it("does not delete from Convex if Clerk API fails", async () => {
    const { deleteMyAccount } = await import("../users");
    const handler = getHandler(deleteMyAccount);

    mockFetch.mockResolvedValue({ ok: false, status: 500 });

    const ctx = {
      auth: {
        getUserIdentity: vi.fn().mockResolvedValue({ subject: "clerk_123" }),
      },
      runMutation: vi.fn().mockResolvedValue(undefined),
    };

    await expect(handler(ctx)).rejects.toThrowError();
    expect(ctx.runMutation).not.toHaveBeenCalled();
  });

  it("deletes from Clerk before Convex (Clerk first for safe rollback)", async () => {
    const { deleteMyAccount } = await import("../users");
    const handler = getHandler(deleteMyAccount);

    const callOrder: string[] = [];
    mockFetch.mockImplementation(async () => {
      callOrder.push("clerk-api");
      return { ok: true, status: 200 };
    });

    const ctx = {
      auth: {
        getUserIdentity: vi.fn().mockResolvedValue({ subject: "clerk_123" }),
      },
      runMutation: vi.fn().mockImplementation(async () => {
        callOrder.push("convex-mutation");
      }),
      runQuery: vi.fn().mockImplementation(async () => {
        callOrder.push("convex-query");
        return { _id: "user_123", clerkId: "clerk_123" };
      }),
    };

    await handler(ctx);

    // Clerk API first, then query user, cascade delete analytics, then delete user
    expect(callOrder[0]).toBe("clerk-api");
    expect(callOrder).toContain("convex-query");
    expect(callOrder.filter(c => c === "convex-mutation").length).toBeGreaterThanOrEqual(2);
  });
});
