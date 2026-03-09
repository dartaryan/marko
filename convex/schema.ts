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

  analyticsEvents: defineTable({
    userId: v.id("users"),
    event: v.string(),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_event", ["event"])
    .index("by_createdAt", ["createdAt"]),
});
