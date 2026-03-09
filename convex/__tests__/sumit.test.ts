import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock _generated/server
vi.mock("../_generated/server", () => ({
  internalAction: (config: { args: unknown; handler: Function }) => ({
    _handler: config.handler,
  }),
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
  vi.stubEnv("SUMIT_COMPANY_ID", "test_company_id");
  vi.stubEnv("SUMIT_API_KEY", "test_api_key");
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("generateReceipt", () => {
  const defaultArgs = {
    customerName: "John Doe",
    customerEmail: "john@example.com",
    amount: 99.0,
    currency: "ils", // Stripe sends lowercase — Sumit expects uppercase
    description: "Monthly Subscription - Marko Pro - 09/03/2026",
    stripeReference: "session_123",
  };

  it("builds correct request body with DocumentType 3 for Osek Patur", async () => {
    mockFetch.mockResolvedValue({
      json: () =>
        Promise.resolve({
          Status: 0,
          DocumentNumber: "0042",
          DocumentID: "doc_123",
          DocumentURL: "https://app.sumit.co.il/doc/0042",
          PdfURL: "https://app.sumit.co.il/pdf/0042",
        }),
    });

    const { generateReceipt } = await import("../sumit");
    const handler = getHandler(generateReceipt);
    await handler({}, defaultArgs);

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("https://api.sumit.co.il/billing/v1/documents/create");

    const body = JSON.parse(options.body);
    expect(body.CompanyID).toBe("test_company_id");
    expect(body.APIKey).toBe("test_api_key");
    expect(body.Document.Type).toBe(3); // Osek Patur — NOT 1 or 5
    expect(body.Document.Payment[0].Type).toBe(4); // Credit Card
    expect(body.Document.SendDocumentByEmail).toBe(true);
    expect(body.Document.Language).toBe("he");
  });

  it("sends correct customer and item data", async () => {
    mockFetch.mockResolvedValue({
      json: () =>
        Promise.resolve({
          Status: 0,
          DocumentNumber: "0042",
          DocumentID: "doc_123",
          DocumentURL: "https://sumit.co.il/doc",
          PdfURL: "https://sumit.co.il/pdf",
        }),
    });

    const { generateReceipt } = await import("../sumit");
    const handler = getHandler(generateReceipt);
    await handler({}, defaultArgs);

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.Document.Customer.Name).toBe("John Doe");
    expect(body.Document.Customer.EmailAddress).toBe("john@example.com");
    expect(body.Document.Items[0].Price).toBe(99.0);
    expect(body.Document.Items[0].Quantity).toBe(1);
    expect(body.Document.Items[0].Currency).toBe("ILS");
  });

  it("returns success response with document details", async () => {
    mockFetch.mockResolvedValue({
      json: () =>
        Promise.resolve({
          Status: 0,
          DocumentNumber: "0042",
          DocumentID: "abc123-def456",
          DocumentURL: "https://app.sumit.co.il/docs/0042",
          PdfURL: "https://app.sumit.co.il/pdf/0042",
        }),
    });

    const { generateReceipt } = await import("../sumit");
    const handler = getHandler(generateReceipt);
    const result = await handler({}, defaultArgs);

    expect(result).toEqual({
      success: true,
      documentNumber: "0042",
      documentId: "abc123-def456",
      documentUrl: "https://app.sumit.co.il/docs/0042",
      pdfUrl: "https://app.sumit.co.il/pdf/0042",
    });
  });

  it("returns error on Sumit API error response", async () => {
    mockFetch.mockResolvedValue({
      json: () =>
        Promise.resolve({
          Status: 1,
          ErrorMessage: "Invalid customer email",
          UserErrorMessage: "Customer email is required",
        }),
    });

    const { generateReceipt } = await import("../sumit");
    const handler = getHandler(generateReceipt);
    const result = await handler({}, defaultArgs);

    expect(result).toEqual({
      success: false,
      error: "Invalid customer email",
    });
  });

  it("returns error when API credentials are missing", async () => {
    vi.unstubAllEnvs();
    vi.resetModules();

    vi.doMock("../_generated/server", () => ({
      internalAction: (config: { args: unknown; handler: Function }) => ({
        _handler: config.handler,
      }),
    }));

    const { generateReceipt } = await import("../sumit");
    const handler = getHandler(generateReceipt);
    const result = await handler({}, defaultArgs);

    expect(result).toEqual({
      success: false,
      error: "Missing Sumit API credentials",
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("handles network/fetch errors gracefully", async () => {
    mockFetch.mockRejectedValue(new Error("Network timeout"));

    const { generateReceipt } = await import("../sumit");
    const handler = getHandler(generateReceipt);
    const result = await handler({}, defaultArgs);

    expect(result).toEqual({
      success: false,
      error: "Network timeout",
    });
  });

  it("does NOT add VAT — Osek Patur is VAT-exempt", async () => {
    mockFetch.mockResolvedValue({
      json: () =>
        Promise.resolve({
          Status: 0,
          DocumentNumber: "0042",
          DocumentID: "doc_123",
          DocumentURL: "https://sumit.co.il/doc",
          PdfURL: "https://sumit.co.il/pdf",
        }),
    });

    const { generateReceipt } = await import("../sumit");
    const handler = getHandler(generateReceipt);
    await handler({}, { ...defaultArgs, amount: 99.0 });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    // Amount sent to Sumit should equal exactly what was passed — no VAT added
    expect(body.Document.Items[0].Price).toBe(99.0);
    expect(body.Document.Payment[0].Amount).toBe(99.0);
    // No VAT-related fields
    expect(body.Document.Items[0].VAT).toBeUndefined();
    expect(body.Document.VATRate).toBeUndefined();
  });

  it("posts with correct Content-Type header", async () => {
    mockFetch.mockResolvedValue({
      json: () =>
        Promise.resolve({
          Status: 0,
          DocumentNumber: "0042",
          DocumentID: "doc_123",
          DocumentURL: "https://sumit.co.il/doc",
          PdfURL: "https://sumit.co.il/pdf",
        }),
    });

    const { generateReceipt } = await import("../sumit");
    const handler = getHandler(generateReceipt);
    await handler({}, defaultArgs);

    const options = mockFetch.mock.calls[0][1];
    expect(options.method).toBe("POST");
    expect(options.headers["Content-Type"]).toBe("application/json");
  });
});
