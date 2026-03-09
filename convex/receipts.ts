import { v, ConvexError } from "convex/values";
import { query, internalMutation, internalQuery } from "./_generated/server";

export const createReceipt = internalMutation({
  args: {
    userId: v.id("users"),
    subscriptionId: v.optional(v.id("subscriptions")),
    stripeSessionId: v.optional(v.string()),
    stripeInvoiceId: v.optional(v.string()),
    sumitDocumentId: v.string(),
    sumitDocumentNumber: v.string(),
    sumitDocumentUrl: v.string(),
    sumitPdfUrl: v.string(),
    amount: v.number(),
    currency: v.string(),
    status: v.union(v.literal("success"), v.literal("failed")),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("receipts", {
      userId: args.userId,
      subscriptionId: args.subscriptionId,
      stripeSessionId: args.stripeSessionId,
      stripeInvoiceId: args.stripeInvoiceId,
      sumitDocumentId: args.sumitDocumentId,
      sumitDocumentNumber: args.sumitDocumentNumber,
      sumitDocumentUrl: args.sumitDocumentUrl,
      sumitPdfUrl: args.sumitPdfUrl,
      amount: args.amount,
      currency: args.currency,
      status: args.status,
      errorMessage: args.errorMessage,
      createdAt: Date.now(),
    });
  },
});

export const getReceiptByStripeSessionId = internalQuery({
  args: { stripeSessionId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("receipts")
      .withIndex("by_stripeSessionId", (q) =>
        q.eq("stripeSessionId", args.stripeSessionId)
      )
      .unique();
  },
});

export const getReceiptByStripeInvoiceId = internalQuery({
  args: { stripeInvoiceId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("receipts")
      .withIndex("by_stripeInvoiceId", (q) =>
        q.eq("stripeInvoiceId", args.stripeInvoiceId)
      )
      .unique();
  },
});

export const getReceiptsByUserId = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return [];
    }

    return await ctx.db
      .query("receipts")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const deleteByUserId = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const receipts = await ctx.db
      .query("receipts")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    for (const receipt of receipts) {
      await ctx.db.delete(receipt._id);
    }
  },
});
