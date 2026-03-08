import { describe, it, expect, vi } from "vitest";

function getHandler(fn: unknown): Function {
  const registration = fn as { _handler?: Function };
  if (registration._handler) return registration._handler;
  throw new Error("Could not find handler on Convex function registration");
}

function createMockMutationCtx() {
  return {
    db: {
      insert: vi.fn().mockResolvedValue("mock_event_id"),
      query: vi.fn(),
      delete: vi.fn().mockResolvedValue(undefined),
    },
  };
}

function createMockMutationCtxWithQuery(records: unknown[] = []) {
  return {
    db: {
      insert: vi.fn().mockResolvedValue("mock_event_id"),
      query: vi.fn().mockReturnValue({
        withIndex: vi.fn().mockReturnThis(),
        collect: vi.fn().mockResolvedValue(records),
        unique: vi.fn().mockResolvedValue(records[0] ?? null),
      }),
      delete: vi.fn().mockResolvedValue(undefined),
    },
    auth: {
      getUserIdentity: vi.fn(),
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
        take: vi.fn().mockResolvedValue(records),
        order: vi.fn().mockReturnValue({
          take: vi.fn().mockResolvedValue(records),
        }),
      }),
    },
    _mockWithIndex: mockWithIndex,
  };
}

describe("logEvent", () => {
  it("inserts into analyticsEvents with all args and createdAt timestamp", async () => {
    const { logEvent } = await import("../analytics");
    const ctx = createMockMutationCtx();

    const args = {
      userId: "user_123",
      event: "auth.signup",
      metadata: { clerkId: "clerk_abc" },
    };

    const handler = getHandler(logEvent);
    await handler(ctx, args);

    expect(ctx.db.insert).toHaveBeenCalledWith("analyticsEvents", {
      ...args,
      createdAt: expect.any(Number),
    });
  });

  it("inserts without metadata when not provided", async () => {
    const { logEvent } = await import("../analytics");
    const ctx = createMockMutationCtx();

    const args = {
      userId: "user_123",
      event: "auth.delete",
    };

    const handler = getHandler(logEvent);
    await handler(ctx, args);

    expect(ctx.db.insert).toHaveBeenCalledWith("analyticsEvents", {
      userId: "user_123",
      event: "auth.delete",
      metadata: undefined,
      createdAt: expect.any(Number),
    });
  });
});

describe("trackEvent", () => {
  it("authenticates, looks up user, and inserts event", async () => {
    const { trackEvent } = await import("../analytics");
    const mockUser = { _id: "user_123", clerkId: "clerk_abc" };
    const ctx = createMockMutationCtxWithQuery([mockUser]);
    ctx.auth.getUserIdentity.mockResolvedValue({ subject: "clerk_abc" });

    // Set up the query chain to return the user
    ctx.db.query.mockReturnValue({
      withIndex: vi.fn().mockReturnValue({
        unique: vi.fn().mockResolvedValue(mockUser),
      }),
    });

    const handler = getHandler(trackEvent);
    await handler(ctx, { event: "export.pdf", metadata: { format: "a4" } });

    expect(ctx.auth.getUserIdentity).toHaveBeenCalled();
    expect(ctx.db.insert).toHaveBeenCalledWith("analyticsEvents", {
      userId: "user_123",
      event: "export.pdf",
      metadata: { format: "a4" },
      createdAt: expect.any(Number),
    });
  });

  it("silently returns when not authenticated (no throw)", async () => {
    const { trackEvent } = await import("../analytics");
    const ctx = createMockMutationCtxWithQuery([]);
    ctx.auth.getUserIdentity.mockResolvedValue(null);

    const handler = getHandler(trackEvent);
    // Should not throw
    await handler(ctx, { event: "export.pdf" });

    expect(ctx.db.insert).not.toHaveBeenCalled();
  });

  it("silently returns when user not found (no throw)", async () => {
    const { trackEvent } = await import("../analytics");
    const ctx = createMockMutationCtxWithQuery([]);
    ctx.auth.getUserIdentity.mockResolvedValue({ subject: "clerk_unknown" });

    ctx.db.query.mockReturnValue({
      withIndex: vi.fn().mockReturnValue({
        unique: vi.fn().mockResolvedValue(null),
      }),
    });

    const handler = getHandler(trackEvent);
    // Should not throw
    await handler(ctx, { event: "export.pdf" });

    expect(ctx.db.insert).not.toHaveBeenCalled();
  });
});

describe("getEventCounts", () => {
  it("aggregates events by event name correctly", async () => {
    const { getEventCounts } = await import("../analytics");

    const events = [
      { event: "auth.signup", createdAt: Date.now() },
      { event: "auth.signup", createdAt: Date.now() },
      { event: "export.pdf", createdAt: Date.now() },
      { event: "ai.call", createdAt: Date.now() },
      { event: "ai.call", createdAt: Date.now() },
      { event: "ai.call", createdAt: Date.now() },
    ];

    const ctx = createMockQueryCtx(events);

    const handler = getHandler(getEventCounts);
    const counts = await handler(ctx, { since: 0 });

    expect(counts).toEqual({
      "auth.signup": 2,
      "export.pdf": 1,
      "ai.call": 3,
    });
  });

  it("returns empty object when no events exist", async () => {
    const { getEventCounts } = await import("../analytics");
    const ctx = createMockQueryCtx([]);

    const handler = getHandler(getEventCounts);
    const counts = await handler(ctx, { since: Date.now() });

    expect(counts).toEqual({});
  });
});

describe("getRecentEventsByUser", () => {
  it("returns events filtered by userId", async () => {
    const { getRecentEventsByUser } = await import("../analytics");

    const events = [
      { userId: "user_1", event: "export.pdf", createdAt: Date.now() },
      { userId: "user_1", event: "ai.call", createdAt: Date.now() },
    ];

    const mockTake = vi.fn().mockResolvedValue(events);
    const mockOrder = vi.fn().mockReturnValue({ take: mockTake });
    const mockWithIndex = vi.fn().mockReturnValue({ order: mockOrder });

    const ctx = {
      db: {
        query: vi.fn().mockReturnValue({
          withIndex: mockWithIndex,
        }),
      },
    };

    const handler = getHandler(getRecentEventsByUser);
    const result = await handler(ctx, { userId: "user_1" });

    expect(result).toEqual(events);
    expect(mockTake).toHaveBeenCalledWith(50); // default limit
  });

  it("respects custom limit parameter", async () => {
    const { getRecentEventsByUser } = await import("../analytics");

    const mockTake = vi.fn().mockResolvedValue([]);
    const mockOrder = vi.fn().mockReturnValue({ take: mockTake });
    const mockWithIndex = vi.fn().mockReturnValue({ order: mockOrder });

    const ctx = {
      db: {
        query: vi.fn().mockReturnValue({
          withIndex: mockWithIndex,
        }),
      },
    };

    const handler = getHandler(getRecentEventsByUser);
    await handler(ctx, { userId: "user_1", limit: 10 });

    expect(mockTake).toHaveBeenCalledWith(10);
  });
});

describe("deleteByUserId", () => {
  it("deletes all events for a user", async () => {
    const { deleteByUserId } = await import("../analytics");

    const events = [
      { _id: "evt_1", userId: "user_1", event: "auth.signup" },
      { _id: "evt_2", userId: "user_1", event: "export.pdf" },
      { _id: "evt_3", userId: "user_1", event: "ai.call" },
    ];

    const mockCollect = vi.fn().mockResolvedValue(events);
    const mockWithIndex = vi.fn().mockReturnValue({ collect: mockCollect });
    const mockDelete = vi.fn().mockResolvedValue(undefined);

    const ctx = {
      db: {
        query: vi.fn().mockReturnValue({
          withIndex: mockWithIndex,
        }),
        delete: mockDelete,
      },
    };

    const handler = getHandler(deleteByUserId);
    await handler(ctx, { userId: "user_1" });

    expect(mockDelete).toHaveBeenCalledTimes(3);
    expect(mockDelete).toHaveBeenCalledWith("evt_1");
    expect(mockDelete).toHaveBeenCalledWith("evt_2");
    expect(mockDelete).toHaveBeenCalledWith("evt_3");
  });

  it("handles user with no events gracefully", async () => {
    const { deleteByUserId } = await import("../analytics");

    const mockCollect = vi.fn().mockResolvedValue([]);
    const mockWithIndex = vi.fn().mockReturnValue({ collect: mockCollect });
    const mockDelete = vi.fn();

    const ctx = {
      db: {
        query: vi.fn().mockReturnValue({
          withIndex: mockWithIndex,
        }),
        delete: mockDelete,
      },
    };

    const handler = getHandler(deleteByUserId);
    await handler(ctx, { userId: "user_empty" });

    expect(mockDelete).not.toHaveBeenCalled();
  });
});
