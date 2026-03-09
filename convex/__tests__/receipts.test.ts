import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock _generated/server
vi.mock("../_generated/server", () => ({
  query: (config: { args: unknown; handler: Function }) => ({
    _handler: config.handler,
  }),
  internalMutation: (config: { args: unknown; handler: Function }) => ({
    _handler: config.handler,
  }),
  internalQuery: (config: { args: unknown; handler: Function }) => ({
    _handler: config.handler,
  }),
}));

function getHandler(fn: unknown): Function {
  const registration = fn as { _handler?: Function };
  if (registration._handler) return registration._handler;
  throw new Error("Could not find handler on Convex function registration");
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});

describe("createReceipt", () => {
  it("inserts a receipt record into the database", async () => {
    const { createReceipt } = await import("../receipts");
    const handler = getHandler(createReceipt);

    const mockInsert = vi.fn().mockResolvedValue("receipt_id_123");
    const ctx = { db: { insert: mockInsert } };

    const args = {
      userId: "user_1",
      subscriptionId: "sub_1",
      stripeSessionId: "session_123",
      stripeInvoiceId: undefined,
      sumitDocumentId: "doc_123",
      sumitDocumentNumber: "0042",
      sumitDocumentUrl: "https://app.sumit.co.il/doc/0042",
      sumitPdfUrl: "https://app.sumit.co.il/pdf/0042",
      amount: 99.0,
      currency: "ILS",
      status: "success" as const,
      errorMessage: undefined,
    };

    const result = await handler(ctx, args);

    expect(result).toBe("receipt_id_123");
    expect(mockInsert).toHaveBeenCalledWith(
      "receipts",
      expect.objectContaining({
        userId: "user_1",
        subscriptionId: "sub_1",
        stripeSessionId: "session_123",
        sumitDocumentId: "doc_123",
        sumitDocumentNumber: "0042",
        amount: 99.0,
        currency: "ILS",
        status: "success",
        createdAt: expect.any(Number),
      })
    );
  });

  it("stores failed receipt with errorMessage", async () => {
    const { createReceipt } = await import("../receipts");
    const handler = getHandler(createReceipt);

    const mockInsert = vi.fn().mockResolvedValue("receipt_id_456");
    const ctx = { db: { insert: mockInsert } };

    const args = {
      userId: "user_1",
      subscriptionId: undefined,
      stripeSessionId: "session_fail",
      stripeInvoiceId: undefined,
      sumitDocumentId: "",
      sumitDocumentNumber: "",
      sumitDocumentUrl: "",
      sumitPdfUrl: "",
      amount: 99.0,
      currency: "ILS",
      status: "failed" as const,
      errorMessage: "Sumit API error",
    };

    await handler(ctx, args);

    expect(mockInsert).toHaveBeenCalledWith(
      "receipts",
      expect.objectContaining({
        status: "failed",
        errorMessage: "Sumit API error",
      })
    );
  });
});

describe("getReceiptByStripeSessionId", () => {
  it("returns existing receipt for a Stripe session ID", async () => {
    const { getReceiptByStripeSessionId } = await import("../receipts");
    const handler = getHandler(getReceiptByStripeSessionId);

    const mockReceipt = {
      _id: "receipt_123",
      stripeSessionId: "session_123",
      status: "success",
    };
    const mockUnique = vi.fn().mockResolvedValue(mockReceipt);
    const mockWithIndex = vi.fn().mockReturnValue({ unique: mockUnique });
    const mockQuery = vi.fn().mockReturnValue({ withIndex: mockWithIndex });
    const ctx = { db: { query: mockQuery } };

    const result = await handler(ctx, { stripeSessionId: "session_123" });

    expect(result).toEqual(mockReceipt);
    expect(mockQuery).toHaveBeenCalledWith("receipts");
    expect(mockWithIndex).toHaveBeenCalledWith(
      "by_stripeSessionId",
      expect.any(Function)
    );
  });

  it("returns null when no receipt exists (idempotency check)", async () => {
    const { getReceiptByStripeSessionId } = await import("../receipts");
    const handler = getHandler(getReceiptByStripeSessionId);

    const mockUnique = vi.fn().mockResolvedValue(null);
    const mockWithIndex = vi.fn().mockReturnValue({ unique: mockUnique });
    const mockQuery = vi.fn().mockReturnValue({ withIndex: mockWithIndex });
    const ctx = { db: { query: mockQuery } };

    const result = await handler(ctx, { stripeSessionId: "session_new" });
    expect(result).toBeNull();
  });
});

describe("getReceiptByStripeInvoiceId", () => {
  it("returns existing receipt for a Stripe invoice ID", async () => {
    const { getReceiptByStripeInvoiceId } = await import("../receipts");
    const handler = getHandler(getReceiptByStripeInvoiceId);

    const mockReceipt = {
      _id: "receipt_456",
      stripeInvoiceId: "inv_789",
      status: "success",
    };
    const mockUnique = vi.fn().mockResolvedValue(mockReceipt);
    const mockWithIndex = vi.fn().mockReturnValue({ unique: mockUnique });
    const mockQuery = vi.fn().mockReturnValue({ withIndex: mockWithIndex });
    const ctx = { db: { query: mockQuery } };

    const result = await handler(ctx, { stripeInvoiceId: "inv_789" });
    expect(result).toEqual(mockReceipt);
  });

  it("returns null when no receipt exists for invoice ID", async () => {
    const { getReceiptByStripeInvoiceId } = await import("../receipts");
    const handler = getHandler(getReceiptByStripeInvoiceId);

    const mockUnique = vi.fn().mockResolvedValue(null);
    const mockWithIndex = vi.fn().mockReturnValue({ unique: mockUnique });
    const mockQuery = vi.fn().mockReturnValue({ withIndex: mockWithIndex });
    const ctx = { db: { query: mockQuery } };

    const result = await handler(ctx, { stripeInvoiceId: "inv_new" });
    expect(result).toBeNull();
  });
});

describe("getReceiptsByUserId", () => {
  it("returns empty array for unauthenticated user", async () => {
    const { getReceiptsByUserId } = await import("../receipts");
    const handler = getHandler(getReceiptsByUserId);

    const ctx = {
      auth: { getUserIdentity: vi.fn().mockResolvedValue(null) },
      db: { query: vi.fn() },
    };

    const result = await handler(ctx);
    expect(result).toEqual([]);
    expect(ctx.db.query).not.toHaveBeenCalled();
  });

  it("returns empty array when user not found in DB", async () => {
    const { getReceiptsByUserId } = await import("../receipts");
    const handler = getHandler(getReceiptsByUserId);

    const mockUnique = vi.fn().mockResolvedValue(null);
    const mockWithIndex = vi.fn().mockReturnValue({ unique: mockUnique });
    const mockQuery = vi.fn().mockReturnValue({ withIndex: mockWithIndex });

    const ctx = {
      auth: {
        getUserIdentity: vi
          .fn()
          .mockResolvedValue({ subject: "clerk_unknown" }),
      },
      db: { query: mockQuery },
    };

    const result = await handler(ctx);
    expect(result).toEqual([]);
  });

  it("returns user's receipts when authenticated", async () => {
    const { getReceiptsByUserId } = await import("../receipts");
    const handler = getHandler(getReceiptsByUserId);

    const mockReceipts = [
      { _id: "r1", amount: 99.0, createdAt: 1000 },
      { _id: "r2", amount: 99.0, createdAt: 2000 },
    ];

    // First query: users table lookup
    const userUnique = vi
      .fn()
      .mockResolvedValue({ _id: "user_123", clerkId: "clerk_123" });
    const userWithIndex = vi.fn().mockReturnValue({ unique: userUnique });

    // Second query: receipts table lookup
    const receiptsCollect = vi.fn().mockResolvedValue(mockReceipts);
    const receiptsWithIndex = vi
      .fn()
      .mockReturnValue({ collect: receiptsCollect });

    const mockQuery = vi
      .fn()
      .mockReturnValueOnce({ withIndex: userWithIndex }) // users query
      .mockReturnValueOnce({ withIndex: receiptsWithIndex }); // receipts query

    const ctx = {
      auth: {
        getUserIdentity: vi
          .fn()
          .mockResolvedValue({ subject: "clerk_123" }),
      },
      db: { query: mockQuery },
    };

    const result = await handler(ctx);
    expect(result).toEqual(mockReceipts);
    expect(mockQuery).toHaveBeenCalledWith("users");
    expect(mockQuery).toHaveBeenCalledWith("receipts");
  });
});

describe("deleteByUserId", () => {
  it("deletes all receipts for a user", async () => {
    const { deleteByUserId } = await import("../receipts");
    const handler = getHandler(deleteByUserId);

    const mockReceipts = [
      { _id: "receipt_1" },
      { _id: "receipt_2" },
      { _id: "receipt_3" },
    ];

    const mockCollect = vi.fn().mockResolvedValue(mockReceipts);
    const mockWithIndex = vi.fn().mockReturnValue({ collect: mockCollect });
    const mockQuery = vi.fn().mockReturnValue({ withIndex: mockWithIndex });
    const mockDelete = vi.fn().mockResolvedValue(undefined);

    const ctx = { db: { query: mockQuery, delete: mockDelete } };

    await handler(ctx, { userId: "user_1" });

    expect(mockDelete).toHaveBeenCalledTimes(3);
    expect(mockDelete).toHaveBeenCalledWith("receipt_1");
    expect(mockDelete).toHaveBeenCalledWith("receipt_2");
    expect(mockDelete).toHaveBeenCalledWith("receipt_3");
  });

  it("handles user with no receipts gracefully", async () => {
    const { deleteByUserId } = await import("../receipts");
    const handler = getHandler(deleteByUserId);

    const mockCollect = vi.fn().mockResolvedValue([]);
    const mockWithIndex = vi.fn().mockReturnValue({ collect: mockCollect });
    const mockQuery = vi.fn().mockReturnValue({ withIndex: mockWithIndex });
    const mockDelete = vi.fn();

    const ctx = { db: { query: mockQuery, delete: mockDelete } };

    await handler(ctx, { userId: "user_no_receipts" });

    expect(mockDelete).not.toHaveBeenCalled();
  });
});
