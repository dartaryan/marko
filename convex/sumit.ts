"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";

interface SumitSuccessResponse {
  DocumentNumber: string;
  DocumentID: string;
  DocumentURL: string;
  PdfURL: string;
  Status: 0;
}

interface SumitErrorResponse {
  Status: 1;
  ErrorMessage: string;
  UserErrorMessage?: string;
}

type SumitResponse = SumitSuccessResponse | SumitErrorResponse;

export const generateReceipt = internalAction({
  args: {
    customerName: v.string(),
    customerEmail: v.string(),
    amount: v.number(),
    currency: v.string(),
    description: v.string(),
    stripeReference: v.string(),
  },
  handler: async (ctx, args) => {
    const companyId = process.env.SUMIT_COMPANY_ID;
    const apiKey = process.env.SUMIT_API_KEY;

    if (!companyId || !apiKey) {
      return {
        success: false,
        error: "Missing Sumit API credentials",
      };
    }

    const requestBody = {
      CompanyID: companyId,
      APIKey: apiKey,
      Document: {
        Type: 3,
        Description: args.description,
        Customer: {
          Name: args.customerName,
          EmailAddress: args.customerEmail,
        },
        Items: [
          {
            Description: args.description,
            Price: args.amount,
            Quantity: 1,
            Currency: args.currency.toUpperCase(),
          },
        ],
        Payment: [
          {
            Type: 4,
            Amount: args.amount,
            Currency: args.currency.toUpperCase(),
          },
        ],
        SendDocumentByEmail: true,
        Language: "he",
      },
    };

    try {
      const response = await fetch(
        "https://api.sumit.co.il/billing/v1/documents/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = (await response.json()) as SumitResponse;

      if (data.Status === 0) {
        const successData = data as SumitSuccessResponse;
        return {
          success: true,
          documentNumber: successData.DocumentNumber,
          documentId: successData.DocumentID,
          documentUrl: successData.DocumentURL,
          pdfUrl: successData.PdfURL,
        };
      } else {
        const errorData = data as SumitErrorResponse;
        return {
          success: false,
          error: errorData.ErrorMessage,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});
