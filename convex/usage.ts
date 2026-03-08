import { v } from "convex/values";
import { internalMutation, internalQuery, query } from "./_generated/server";
import { FREE_MONTHLY_AI_LIMIT } from "./lib/tierLimits";

function getStartOfMonth(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
}

export const logAiUsage = internalMutation({
  args: {
    userId: v.id("users"),
    model: v.string(),
    inputTokens: v.number(),
    outputTokens: v.number(),
    cost: v.number(),
    actionType: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("aiUsage", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const getMonthlyUsageCount = internalQuery({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const startOfMonth = getStartOfMonth();

    const records = await ctx.db
      .query("aiUsage")
      .withIndex("by_userId_createdAt", (q) =>
        q.eq("userId", args.userId).gte("createdAt", startOfMonth)
      )
      .collect();

    return records.length;
  },
});

export const getMyMonthlyUsage = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { count: 0, limit: FREE_MONTHLY_AI_LIMIT };

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return { count: 0, limit: FREE_MONTHLY_AI_LIMIT };

    const startOfMonth = getStartOfMonth();
    const records = await ctx.db
      .query("aiUsage")
      .withIndex("by_userId_createdAt", (q) =>
        q.eq("userId", user._id).gte("createdAt", startOfMonth)
      )
      .collect();

    return { count: records.length, limit: FREE_MONTHLY_AI_LIMIT };
  },
});

export const getUserUsageSummary = internalQuery({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const startOfMonth = getStartOfMonth();

    const records = await ctx.db
      .query("aiUsage")
      .withIndex("by_userId_createdAt", (q) =>
        q.eq("userId", args.userId).gte("createdAt", startOfMonth)
      )
      .collect();

    const byModel: Record<string, number> = {};
    const byActionType: Record<string, number> = {};
    let totalCost = 0;

    for (const record of records) {
      byModel[record.model] = (byModel[record.model] || 0) + 1;
      byActionType[record.actionType] =
        (byActionType[record.actionType] || 0) + 1;
      totalCost += record.cost;
    }

    return {
      totalCalls: records.length,
      totalCost,
      byModel,
      byActionType,
    };
  },
});
