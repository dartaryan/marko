import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    tier: v.union(v.literal("free"), v.literal("paid")),
    createdAt: v.number(),
    flagged: v.optional(v.boolean()),
    flagReason: v.optional(v.string()),
    flaggedAt: v.optional(v.number()),
  }).index("by_clerkId", ["clerkId"]),

  aiUsage: defineTable({
    userId: v.id("users"),
    model: v.string(),
    inputTokens: v.number(),
    outputTokens: v.number(),
    cost: v.number(),
    actionType: v.string(),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_createdAt", ["userId", "createdAt"])
    .index("by_createdAt", ["createdAt"]),

  subscriptions: defineTable({
    userId: v.id("users"),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("past_due"),
      v.literal("canceled"),
      v.literal("incomplete")
    ),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_stripeCustomerId", ["stripeCustomerId"])
    .index("by_stripeSubscriptionId", ["stripeSubscriptionId"]),

  analyticsEvents: defineTable({
    userId: v.id("users"),
    event: v.string(),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_event", ["event"])
    .index("by_createdAt", ["createdAt"]),

  receipts: defineTable({
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
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_stripeSessionId", ["stripeSessionId"])
    .index("by_stripeInvoiceId", ["stripeInvoiceId"])
    .index("by_subscriptionId", ["subscriptionId"]),
});
