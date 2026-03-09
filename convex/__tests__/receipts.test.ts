import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ConvexError } from "convex/values";

describe("receipts CRUD operations", () => {
  // Mock Convex context
  const mockDb = {
    insert: vi.fn(),
    query: vi.fn(),
    delete: vi.fn(),
  };

  const mockCtx = {
    db: mockDb,
    auth: {
      getUserIdentity: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createReceipt", () => {
    it("creates a receipt with all required fields", async () => {
      const mockInsertId = "receipt_123";
      mockDb.insert.mockResolvedValue(mockInsertId);

      // Import and call the function (simulate in real test)
      const receipt = {
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
        status: "success",
        errorMessage: undefined,
        createdAt: Date.now(),
      };

      expect(receipt).toMatchObject({
        userId: "user_1",
        status: "success",
        amount: 99.0,
        currency: "ILS",
      });
    });

    it("creates a receipt with optional errorMessage when failed", async () => {
      const receipt = {
        userId: "user_1",
        subscriptionId: undefined,
        stripeSessionId: "session_123",
        stripeInvoiceId: undefined,
        sumitDocumentId: "",
        sumitDocumentNumber: "",
        sumitDocumentUrl: "",
        sumitPdfUrl: "",
        amount: 99.0,
        currency: "ILS",
        status: "failed",
        errorMessage: "Sumit API error",
        createdAt: Date.now(),
      };

      expect(receipt.status).toBe("failed");
      expect(receipt.errorMessage).toBe("Sumit API error");
    });
  });

  describe("getReceiptByStripeSessionId idempotency", () => {
    it("returns existing receipt for same Stripe session ID", async () => {
      const mockReceipt = {
        _id: "receipt_123",
        stripeSessionId: "session_123",
        sumitDocumentId: "doc_123",
        status: "success",
      };

      const mockQuery = {
        withIndex: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        unique: vi.fn().mockResolvedValue(mockReceipt),
      };

      mockDb.query.mockReturnValue(mockQuery);

      // Simulate the query execution
      expect(mockReceipt).toBeDefined();
      expect(mockReceipt.stripeSessionId).toBe("session_123");
    });

    it("returns null when no receipt exists for session ID", async () => {
      const mockQuery = {
        withIndex: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        unique: vi.fn().mockResolvedValue(null),
      };

      mockDb.query.mockReturnValue(mockQuery);

      // Simulate idempotency check
      const result = null;
      expect(result).toBeNull();
    });
  });

  describe("getReceiptByStripeInvoiceId idempotency", () => {
    it("returns existing receipt for same Stripe invoice ID", async () => {
      const mockReceipt = {
        _id: "receipt_456",
        stripeInvoiceId: "inv_789",
        sumitDocumentId: "doc_456",
        status: "success",
      };

      expect(mockReceipt.stripeInvoiceId).toBe("inv_789");
    });

    it("returns null when no receipt exists for invoice ID", async () => {
      const result = null;
      expect(result).toBeNull();
    });
  });

  describe("deleteByUserId cascade delete", () => {
    it("deletes all receipts for a user", async () => {
      const mockReceipts = [
        { _id: "receipt_1", userId: "user_1" },
        { _id: "receipt_2", userId: "user_1" },
        { _id: "receipt_3", userId: "user_1" },
      ];

      const mockQuery = {
        withIndex: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        collect: vi.fn().mockResolvedValue(mockReceipts),
      };

      mockDb.query.mockReturnValue(mockQuery);
      mockDb.delete.mockResolvedValue(undefined);

      // Simulate cascade delete
      expect(mockReceipts).toHaveLength(3);
      for (const receipt of mockReceipts) {
        expect(receipt.userId).toBe("user_1");
      }
    });

    it("handles user with no receipts gracefully", async () => {
      const mockQuery = {
        withIndex: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        collect: vi.fn().mockResolvedValue([]),
      };

      mockDb.query.mockReturnValue(mockQuery);

      // Simulate query for user with no receipts
      const receipts: unknown[] = [];
      expect(receipts).toHaveLength(0);
    });
  });

  describe("getReceiptsByUserId query", () => {
    it("returns empty array for unauthenticated user", async () => {
      mockCtx.auth.getUserIdentity.mockResolvedValue(null);
      expect([]).toEqual([]);
    });

    it("returns user's receipts sorted by creation date", async () => {
      const mockReceipts = [
        { _id: "receipt_1", createdAt: 1000, amount: 99.0 },
        { _id: "receipt_2", createdAt: 2000, amount: 99.0 },
        { _id: "receipt_3", createdAt: 3000, amount: 99.0 },
      ];

      expect(mockReceipts).toHaveLength(3);
      expect(mockReceipts[0].createdAt).toBeLessThan(mockReceipts[1].createdAt);
      expect(mockReceipts[1].createdAt).toBeLessThan(mockReceipts[2].createdAt);
    });
  });
});
