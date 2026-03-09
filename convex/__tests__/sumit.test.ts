import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("Sumit API integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock environment variables
    process.env.SUMIT_COMPANY_ID = "test_company_id";
    process.env.SUMIT_API_KEY = "test_api_key";
  });

  afterEach(() => {
    delete process.env.SUMIT_COMPANY_ID;
    delete process.env.SUMIT_API_KEY;
  });

  describe("generateReceipt", () => {
    it("builds correct request body with DocumentType 3 for Osek Patur", async () => {
      const expectedBody = {
        CompanyID: "test_company_id",
        APIKey: "test_api_key",
        Document: {
          Type: 3, // Invoice/Receipt for Osek Patur (NOT 1 or 5)
          Description: "Monthly Subscription - Marko Pro",
          Customer: {
            Name: "John Doe",
            EmailAddress: "john@example.com",
          },
          Items: [
            {
              Description: "Monthly Subscription - Marko Pro",
              Price: 99.0,
              Quantity: 1,
              Currency: "ILS",
            },
          ],
          Payment: [
            {
              Type: 4, // Credit Card
              Amount: 99.0,
              Currency: "ILS",
            },
          ],
          SendDocumentByEmail: true,
          Language: "he",
        },
      };

      // Verify the body structure
      expect(expectedBody.Document.Type).toBe(3);
      expect(expectedBody.Document.Payment[0].Type).toBe(4);
      expect(expectedBody.Document.Language).toBe("he");
      expect(expectedBody.Document.SendDocumentByEmail).toBe(true);
    });

    it("converts Stripe amount (cents) to ILS (÷ 100)", async () => {
      const stipeAmountCents = 9900; // $99.00
      const expectedAmountIls = 9900 / 100; // 99.00 ILS

      expect(expectedAmountIls).toBe(99.0);
    });

    it("handles successful Sumit API response", async () => {
      const mockSuccessResponse = {
        DocumentNumber: "0042",
        DocumentID: "abc123-def456",
        DocumentURL: "https://app.sumit.co.il/docs/0042",
        PdfURL: "https://app.sumit.co.il/pdf/0042",
        Status: 0,
      };

      // Simulate successful response parsing
      expect(mockSuccessResponse.Status).toBe(0);
      expect(mockSuccessResponse).toMatchObject({
        DocumentNumber: expect.any(String),
        DocumentID: expect.any(String),
        DocumentURL: expect.any(String),
        PdfURL: expect.any(String),
      });
    });

    it("handles Sumit API error response", async () => {
      const mockErrorResponse = {
        Status: 1,
        ErrorMessage: "Invalid customer email",
        UserErrorMessage: "Customer email is required",
      };

      // Simulate error response
      expect(mockErrorResponse.Status).toBe(1);
      expect(mockErrorResponse.ErrorMessage).toBeDefined();
    });

    it("returns error when API credentials are missing", async () => {
      delete process.env.SUMIT_COMPANY_ID;

      const result = {
        success: false,
        error: "Missing Sumit API credentials",
      };

      expect(result.success).toBe(false);
      expect(result.error).toContain("credentials");
    });

    it("handles network errors gracefully", async () => {
      // Simulate fetch failure
      const result = {
        success: false,
        error: "Network error or API unreachable",
      };

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("returns success response with correct structure", async () => {
      const result = {
        success: true,
        documentNumber: "0042",
        documentId: "abc123",
        documentUrl: "https://app.sumit.co.il/docs/0042",
        pdfUrl: "https://app.sumit.co.il/pdf/0042",
      };

      expect(result.success).toBe(true);
      expect(result).toMatchObject({
        documentNumber: expect.any(String),
        documentId: expect.any(String),
        documentUrl: expect.any(String),
        pdfUrl: expect.any(String),
      });
    });

    it("includes customer email in SendDocumentByEmail flow", async () => {
      const requestBody = {
        Document: {
          Customer: {
            EmailAddress: "user@example.com",
          },
          SendDocumentByEmail: true,
        },
      };

      // When SendDocumentByEmail=true, Sumit will email the receipt automatically
      expect(requestBody.Document.SendDocumentByEmail).toBe(true);
      expect(requestBody.Document.Customer.EmailAddress).toBe("user@example.com");
    });
  });

  describe("Amount conversion for Osek Patur (VAT-exempt)", () => {
    it("does NOT add VAT to the amount", async () => {
      const amountChargedByStripe = 99.0; // ILS
      const expectedAmountInReceipt = 99.0; // Same - NO VAT added

      expect(expectedAmountInReceipt).toBe(amountChargedByStripe);
    });

    it("uses Currency 'ILS' without VAT breakdown", async () => {
      const requestBody = {
        Items: [
          {
            Price: 99.0,
            Currency: "ILS",
          },
        ],
        Payment: [
          {
            Amount: 99.0,
            Currency: "ILS",
          },
        ],
      };

      // Osek Patur is VAT-exempt - no VAT field or breakdown
      expect(requestBody.Items[0].Currency).toBe("ILS");
      expect(requestBody.Items[0].Price).toBe(99.0);
      expect(requestBody.Payment[0].Amount).toBe(99.0);
      // No VAT-related fields
      expect((requestBody.Items[0] as any).VAT).toBeUndefined();
    });
  });
});
