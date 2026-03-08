import { describe, it, expect, vi, beforeEach } from "vitest";

// Controllable verify mock - shared across all tests
const mockVerify = vi.fn();
const mockRunMutation = vi.fn().mockResolvedValue(undefined);

vi.mock("svix", () => ({
  Webhook: function MockWebhook() {
    return { verify: mockVerify };
  },
}));

vi.mock("../_generated/api", () => ({
  internal: {
    users: {
      upsertFromClerk: "internal:users:upsertFromClerk",
      deleteFromClerk: "internal:users:deleteFromClerk",
    },
  },
}));

// Capture the handler passed to httpAction
let capturedHandler: Function | null = null;

vi.mock("../_generated/server", () => ({
  httpAction: vi.fn((handler: Function) => {
    capturedHandler = handler;
    return handler;
  }),
}));

vi.mock("convex/server", () => ({
  httpRouter: vi.fn(() => ({
    route: vi.fn(),
  })),
}));

// Import the module to trigger httpAction capture (after mocks are set up)
await import("../http");

describe("Clerk webhook handler", () => {
  let mockCtx: { runMutation: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockVerify.mockReset();
    mockRunMutation.mockClear();
    process.env.CLERK_WEBHOOK_SECRET = "whsec_test_secret";
    mockCtx = {
      runMutation: mockRunMutation,
    };
  });

  function createRequest(
    body: string,
    headers: Record<string, string> = {}
  ): Request {
    return new Request("https://example.convex.site/clerk-users-webhook", {
      method: "POST",
      headers: {
        "svix-id": "msg_test123",
        "svix-timestamp": "1234567890",
        "svix-signature": "v1,test_signature",
        "content-type": "application/json",
        ...headers,
      },
      body,
    });
  }

  it("returns 400 for missing svix headers", async () => {
    const handler = capturedHandler!;
    const request = new Request(
      "https://example.convex.site/clerk-users-webhook",
      { method: "POST", body: "{}" }
    );

    const response = await handler(mockCtx, request);
    expect(response.status).toBe(400);
    expect(await response.text()).toBe("Missing svix headers");
  });

  it("returns 500 when CLERK_WEBHOOK_SECRET is not set", async () => {
    const handler = capturedHandler!;
    delete process.env.CLERK_WEBHOOK_SECRET;

    const request = createRequest(JSON.stringify({ type: "user.created", data: { id: "x" } }));
    const response = await handler(mockCtx, request);

    expect(response.status).toBe(500);
    expect(await response.text()).toBe("Server configuration error");
  });

  it("returns 400 for invalid webhook signature", async () => {
    const handler = capturedHandler!;
    mockVerify.mockImplementation(() => {
      throw new Error("Invalid signature");
    });

    const request = createRequest(JSON.stringify({ type: "user.created", data: { id: "x" } }));
    const response = await handler(mockCtx, request);

    expect(response.status).toBe(400);
    expect(await response.text()).toBe("Invalid webhook signature");
  });

  it("processes user.created event and calls upsertFromClerk with primary email", async () => {
    const handler = capturedHandler!;
    const eventData = {
      type: "user.created",
      data: {
        id: "user_new",
        email_addresses: [
          { id: "email_secondary", email_address: "secondary@example.com" },
          { id: "email_primary", email_address: "primary@example.com" },
        ],
        primary_email_address_id: "email_primary",
        first_name: "Test",
        last_name: "User",
      },
    };
    mockVerify.mockReturnValue(eventData);

    const request = createRequest(JSON.stringify(eventData));
    const response = await handler(mockCtx, request);

    expect(response.status).toBe(200);
    expect(mockCtx.runMutation).toHaveBeenCalledWith(
      "internal:users:upsertFromClerk",
      { clerkId: "user_new", email: "primary@example.com", name: "Test User" }
    );
  });

  it("processes user.updated event and calls upsertFromClerk", async () => {
    const handler = capturedHandler!;
    const eventData = {
      type: "user.updated",
      data: {
        id: "user_existing",
        email_addresses: [{ id: "email_1", email_address: "updated@example.com" }],
        primary_email_address_id: "email_1",
        first_name: "Updated",
        last_name: null,
      },
    };
    mockVerify.mockReturnValue(eventData);

    const request = createRequest(JSON.stringify(eventData));
    const response = await handler(mockCtx, request);

    expect(response.status).toBe(200);
    expect(mockCtx.runMutation).toHaveBeenCalledWith(
      "internal:users:upsertFromClerk",
      { clerkId: "user_existing", email: "updated@example.com", name: "Updated" }
    );
  });

  it("processes user.deleted event and calls deleteFromClerk", async () => {
    const handler = capturedHandler!;
    const eventData = {
      type: "user.deleted",
      data: { id: "user_deleted" },
    };
    mockVerify.mockReturnValue(eventData);

    const request = createRequest(JSON.stringify(eventData));
    const response = await handler(mockCtx, request);

    expect(response.status).toBe(200);
    expect(mockCtx.runMutation).toHaveBeenCalledWith(
      "internal:users:deleteFromClerk",
      { clerkId: "user_deleted" }
    );
  });

  it("returns 200 for unhandled event types", async () => {
    const handler = capturedHandler!;
    const eventData = {
      type: "session.created",
      data: { id: "session_123" },
    };
    mockVerify.mockReturnValue(eventData);

    const request = createRequest(JSON.stringify(eventData));
    const response = await handler(mockCtx, request);

    expect(response.status).toBe(200);
    expect(mockCtx.runMutation).not.toHaveBeenCalled();
  });
});
