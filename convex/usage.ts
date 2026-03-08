import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

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
