import { describe, it, expect, vi, beforeEach } from "vitest";
import { ConvexError } from "convex/values";

// Mock @anthropic-ai/sdk before importing ai.ts
const mockCreate = vi.fn();
vi.mock("@anthropic-ai/sdk", () => {
  return {
    default: class MockAnthropic {
      messages = { create: mockCreate };
    },
  };
});

// Mock requireAuth
const mockGetUserIdentity = vi.fn();
vi.mock("../lib/authorization", () => ({
  requireAuth: vi.fn().mockImplementation(async (ctx: { auth: { getUserIdentity: () => Promise<unknown> } }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        code: "AUTH_REQUIRED",
        message: "נדרש התחברות",
        messageEn: "Authentication required",
      });
    }
    return identity;
  }),
}));

function getHandler(fn: unknown): Function {
  const registration = fn as { _handler?: Function };
  if (registration._handler) return registration._handler;
  throw new Error("Could not find handler on Convex function registration");
}

function createMockActionCtx(options: {
  identity?: { subject: string } | null;
  user?: { _id: string; tier: string } | null;
  monthlyUsageCount?: number;
  envApiKey?: string;
}) {
  const {
    identity = null,
    user = null,
    monthlyUsageCount = 0,
    envApiKey = "test-api-key",
  } = options;

  // Set env var
  if (envApiKey) {
    process.env.ANTHROPIC_API_KEY = envApiKey;
  } else {
    delete process.env.ANTHROPIC_API_KEY;
  }

  return {
    auth: {
      getUserIdentity: vi.fn().mockResolvedValue(identity),
    },
    runQuery: vi.fn().mockImplementation(async (_ref: unknown, _args: unknown) => {
      // Determine which query is being called based on call order
      // First call is getUserByClerkId, second is getMonthlyUsageCount
      return user;
    }),
    runMutation: vi.fn().mockResolvedValue(undefined),
  };
}

const defaultArgs = {
  actionType: "summarize" as const,
  content: "Test document content for summarization.",
};

const mockUser = { _id: "user_123", tier: "free" };
const mockIdentity = { subject: "clerk_123" };

describe("callAnthropicApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreate.mockResolvedValue({
      content: [{ type: "text", text: "Mock AI response" }],
      usage: { input_tokens: 100, output_tokens: 50 },
    });
  });

  it("rejects unauthenticated requests with AUTH_REQUIRED", async () => {
    const { callAnthropicApi } = await import("../ai");
    const ctx = createMockActionCtx({ identity: null });

    const handler = getHandler(callAnthropicApi);

    await expect(handler(ctx, defaultArgs)).rejects.toThrowError(ConvexError);
    await expect(handler(ctx, defaultArgs)).rejects.toMatchObject({
      data: { code: "AUTH_REQUIRED" },
    });
  });

  it("rejects when user is not found in database", async () => {
    const { callAnthropicApi } = await import("../ai");
    const ctx = createMockActionCtx({ identity: mockIdentity, user: null });

    const handler = getHandler(callAnthropicApi);

    await expect(handler(ctx, defaultArgs)).rejects.toThrowError(ConvexError);
    await expect(handler(ctx, defaultArgs)).rejects.toMatchObject({
      data: { code: "USER_NOT_FOUND" },
    });
  });

  it("rejects empty content with AI_INPUT_EMPTY", async () => {
    const { callAnthropicApi } = await import("../ai");
    const ctx = createMockActionCtx({ identity: mockIdentity, user: mockUser });

    // Need to handle the monthly usage check
    let callCount = 0;
    ctx.runQuery.mockImplementation(async () => {
      callCount++;
      if (callCount === 1) return mockUser; // getUserByClerkId
      return 0; // getMonthlyUsageCount
    });

    const handler = getHandler(callAnthropicApi);

    await expect(
      handler(ctx, { ...defaultArgs, content: "   " })
    ).rejects.toMatchObject({
      data: { code: "AI_INPUT_EMPTY" },
    });
  });

  it("rejects when free user exceeds monthly limit", async () => {
    const { callAnthropicApi } = await import("../ai");
    const ctx = createMockActionCtx({ identity: mockIdentity, user: mockUser });

    let callCount = 0;
    ctx.runQuery.mockImplementation(async () => {
      callCount++;
      if (callCount === 1) return mockUser;
      return 999; // over limit
    });

    const handler = getHandler(callAnthropicApi);

    await expect(handler(ctx, defaultArgs)).rejects.toMatchObject({
      data: { code: "AI_LIMIT_REACHED" },
    });
  });

  it("does not check usage limits for paid users", async () => {
    const { callAnthropicApi } = await import("../ai");
    const paidUser = { _id: "user_paid", tier: "paid" };
    const ctx = createMockActionCtx({ identity: mockIdentity, user: paidUser });

    ctx.runQuery.mockImplementation(async () => {
      return paidUser;
    });

    const handler = getHandler(callAnthropicApi);
    const result = await handler(ctx, defaultArgs);

    expect(result.result).toBe("Mock AI response");
    // runQuery should only be called once (getUserByClerkId), not twice
    expect(ctx.runQuery).toHaveBeenCalledTimes(1);
  });

  it("rejects when ANTHROPIC_API_KEY is missing", async () => {
    const { callAnthropicApi } = await import("../ai");
    const ctx = createMockActionCtx({
      identity: mockIdentity,
      user: mockUser,
      envApiKey: "",
    });
    delete process.env.ANTHROPIC_API_KEY;

    let callCount = 0;
    ctx.runQuery.mockImplementation(async () => {
      callCount++;
      if (callCount === 1) return mockUser;
      return 0;
    });

    const handler = getHandler(callAnthropicApi);

    await expect(handler(ctx, defaultArgs)).rejects.toMatchObject({
      data: { code: "AI_CONFIG_ERROR" },
    });
  });

  it("handles Anthropic API errors gracefully", async () => {
    const { callAnthropicApi } = await import("../ai");
    const ctx = createMockActionCtx({ identity: mockIdentity, user: mockUser });

    let callCount = 0;
    ctx.runQuery.mockImplementation(async () => {
      callCount++;
      if (callCount === 1) return mockUser;
      return 0;
    });

    mockCreate.mockRejectedValue(new Error("API timeout"));

    const handler = getHandler(callAnthropicApi);

    await expect(handler(ctx, defaultArgs)).rejects.toMatchObject({
      data: { code: "AI_UNAVAILABLE", detail: "API timeout" },
    });
  });

  it("calls Anthropic with correct model and returns result", async () => {
    const { callAnthropicApi } = await import("../ai");
    const ctx = createMockActionCtx({ identity: mockIdentity, user: mockUser });

    let callCount = 0;
    ctx.runQuery.mockImplementation(async () => {
      callCount++;
      if (callCount === 1) return mockUser;
      return 0;
    });

    const handler = getHandler(callAnthropicApi);
    const result = await handler(ctx, defaultArgs);

    expect(result).toEqual({
      result: "Mock AI response",
      model: "claude-sonnet-4-5-20250929",
      inputTokens: 100,
      outputTokens: 50,
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "claude-sonnet-4-5-20250929",
        messages: expect.arrayContaining([
          expect.objectContaining({ role: "user" }),
        ]),
      })
    );
  });

  it("logs usage after successful API call", async () => {
    const { callAnthropicApi } = await import("../ai");
    const ctx = createMockActionCtx({ identity: mockIdentity, user: mockUser });

    let callCount = 0;
    ctx.runQuery.mockImplementation(async () => {
      callCount++;
      if (callCount === 1) return mockUser;
      return 0;
    });

    const handler = getHandler(callAnthropicApi);
    await handler(ctx, defaultArgs);

    expect(ctx.runMutation).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        userId: "user_123",
        model: "claude-sonnet-4-5-20250929",
        inputTokens: 100,
        outputTokens: 50,
        actionType: "summarize",
        cost: expect.any(Number),
      })
    );
  });

  it("logs analytics event after successful AI call", async () => {
    const { callAnthropicApi } = await import("../ai");
    const ctx = createMockActionCtx({ identity: mockIdentity, user: mockUser });

    let callCount = 0;
    ctx.runQuery.mockImplementation(async () => {
      callCount++;
      if (callCount === 1) return mockUser;
      return 0;
    });

    const handler = getHandler(callAnthropicApi);
    await handler(ctx, defaultArgs);

    // Should have called runMutation twice: logAiUsage and logEvent
    expect(ctx.runMutation).toHaveBeenCalledTimes(2);
    expect(ctx.runMutation).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        userId: "user_123",
        event: "ai.call",
        metadata: expect.objectContaining({
          model: "claude-sonnet-4-5-20250929",
          actionType: "summarize",
        }),
      })
    );
  });

  it("logs analytics event when free user exceeds AI limit", async () => {
    const { callAnthropicApi } = await import("../ai");
    const ctx = createMockActionCtx({ identity: mockIdentity, user: mockUser });

    let callCount = 0;
    ctx.runQuery.mockImplementation(async () => {
      callCount++;
      if (callCount === 1) return mockUser;
      return 999; // over limit
    });

    const handler = getHandler(callAnthropicApi);

    await expect(handler(ctx, defaultArgs)).rejects.toMatchObject({
      data: { code: "AI_LIMIT_REACHED" },
    });

    // logEvent should have been called with ai.limit_reached before throwing
    expect(ctx.runMutation).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        userId: "user_123",
        event: "ai.limit_reached",
      })
    );
  });

  it("truncates long content instead of rejecting", async () => {
    const { callAnthropicApi } = await import("../ai");
    const ctx = createMockActionCtx({ identity: mockIdentity, user: mockUser });

    let callCount = 0;
    ctx.runQuery.mockImplementation(async () => {
      callCount++;
      if (callCount === 1) return mockUser;
      return 0;
    });

    // Create content longer than MAX_INPUT_CHARS (100,000)
    const longContent = "x".repeat(150_000);

    const handler = getHandler(callAnthropicApi);
    const result = await handler(ctx, { ...defaultArgs, content: longContent });

    // Should succeed (truncated, not rejected)
    expect(result.result).toBe("Mock AI response");

    // Verify the content sent to Anthropic was truncated
    const createCall = mockCreate.mock.calls[0][0];
    expect(createCall.messages[0].content.length).toBe(100_000);
  });
});
