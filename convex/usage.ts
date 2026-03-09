import { v } from "convex/values";
import { internalMutation, internalQuery, query } from "./_generated/server";
import { FREE_MONTHLY_AI_LIMIT, PAID_DAILY_OPUS_LIMIT } from "./lib/tierLimits";
import { MODEL_IDS } from "./modelRouter";

function getStartOfMonth(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
}

function getStartOfDay(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

function roundCost(value: number): number {
  return Math.round(value * 1e6) / 1e6;
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
    if (!identity) return { count: 0, limit: 0 };

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return { count: 0, limit: 0 };

    const startOfMonth = getStartOfMonth();
    const records = await ctx.db
      .query("aiUsage")
      .withIndex("by_userId_createdAt", (q) =>
        q.eq("userId", user._id).gte("createdAt", startOfMonth)
      )
      .collect();

    const isPaid = user.tier === "paid";
    return {
      count: records.length,
      limit: isPaid ? null : FREE_MONTHLY_AI_LIMIT,
    };
  },
});

export const getDailyOpusUsageCount = internalQuery({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const startOfDay = getStartOfDay();

    const records = await ctx.db
      .query("aiUsage")
      .withIndex("by_userId_createdAt", (q) =>
        q.eq("userId", args.userId).gte("createdAt", startOfDay)
      )
      .collect();

    // Filter for Opus model specifically
    return records.filter((r) => r.model === MODEL_IDS.opus).length;
  },
});

export const getMyDailyOpusUsage = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { count: 0, limit: 0 };

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return { count: 0, limit: 0 };

    const isPaid = user.tier === "paid";
    if (!isPaid) return { count: 0, limit: 0 };

    const startOfDay = getStartOfDay();
    const records = await ctx.db
      .query("aiUsage")
      .withIndex("by_userId_createdAt", (q) =>
        q.eq("userId", user._id).gte("createdAt", startOfDay)
      )
      .collect();

    const opusCount = records.filter((r) => r.model === MODEL_IDS.opus).length;
    return {
      count: opusCount,
      limit: PAID_DAILY_OPUS_LIMIT,
    };
  },
});

export const getCostSummary = internalQuery({
  args: {
    since: v.number(),
  },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("aiUsage")
      .withIndex("by_createdAt", (q) => q.gte("createdAt", args.since))
      .collect();

    let totalCost = 0;
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    const byModel: Record<
      string,
      { calls: number; cost: number; inputTokens: number; outputTokens: number }
    > = {};
    const byActionType: Record<string, { calls: number; cost: number }> = {};

    for (const record of records) {
      totalCost += record.cost;
      totalInputTokens += record.inputTokens;
      totalOutputTokens += record.outputTokens;

      if (!byModel[record.model]) {
        byModel[record.model] = {
          calls: 0,
          cost: 0,
          inputTokens: 0,
          outputTokens: 0,
        };
      }
      byModel[record.model].calls++;
      byModel[record.model].cost += record.cost;
      byModel[record.model].inputTokens += record.inputTokens;
      byModel[record.model].outputTokens += record.outputTokens;

      if (!byActionType[record.actionType]) {
        byActionType[record.actionType] = { calls: 0, cost: 0 };
      }
      byActionType[record.actionType].calls++;
      byActionType[record.actionType].cost += record.cost;
    }

    for (const key of Object.keys(byModel)) {
      byModel[key].cost = roundCost(byModel[key].cost);
    }
    for (const key of Object.keys(byActionType)) {
      byActionType[key].cost = roundCost(byActionType[key].cost);
    }

    return {
      totalCalls: records.length,
      totalCost: roundCost(totalCost),
      totalInputTokens,
      totalOutputTokens,
      byModel,
      byActionType,
    };
  },
});

// Note: Time boundaries use server timezone (UTC on Convex). Operators in other
// timezones will see UTC-based "today"/"thisWeek" boundaries.
export const getTimePeriodCosts = internalQuery({
  args: {},
  handler: async (ctx) => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayTs = startOfToday.getTime();

    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const weekTs = startOfWeek.getTime();

    const monthTs = getStartOfMonth();

    const records = await ctx.db
      .query("aiUsage")
      .withIndex("by_createdAt", (q) => q.gte("createdAt", monthTs))
      .collect();

    function summarize(recs: typeof records) {
      let totalCost = 0;
      for (const r of recs) {
        totalCost += r.cost;
      }
      return { totalCost: roundCost(totalCost), totalCalls: recs.length };
    }

    return {
      today: summarize(records.filter((r) => r.createdAt >= todayTs)),
      thisWeek: summarize(records.filter((r) => r.createdAt >= weekTs)),
      thisMonth: summarize(records),
    };
  },
});

export const getCostByUser = internalQuery({
  args: {
    since: v.number(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("aiUsage")
      .withIndex("by_createdAt", (q) => q.gte("createdAt", args.since))
      .collect();

    const userMap: Record<
      string,
      {
        totalCost: number;
        totalCalls: number;
        byModel: Record<string, { calls: number; cost: number }>;
        byActionType: Record<string, { calls: number; cost: number }>;
      }
    > = {};

    for (const record of records) {
      const uid = String(record.userId);
      if (!userMap[uid]) {
        userMap[uid] = {
          totalCost: 0,
          totalCalls: 0,
          byModel: {},
          byActionType: {},
        };
      }
      userMap[uid].totalCost += record.cost;
      userMap[uid].totalCalls++;

      if (!userMap[uid].byModel[record.model]) {
        userMap[uid].byModel[record.model] = { calls: 0, cost: 0 };
      }
      userMap[uid].byModel[record.model].calls++;
      userMap[uid].byModel[record.model].cost += record.cost;

      if (!userMap[uid].byActionType[record.actionType]) {
        userMap[uid].byActionType[record.actionType] = { calls: 0, cost: 0 };
      }
      userMap[uid].byActionType[record.actionType].calls++;
      userMap[uid].byActionType[record.actionType].cost += record.cost;
    }

    for (const uid of Object.keys(userMap)) {
      userMap[uid].totalCost = roundCost(userMap[uid].totalCost);
      for (const key of Object.keys(userMap[uid].byModel)) {
        userMap[uid].byModel[key].cost = roundCost(userMap[uid].byModel[key].cost);
      }
      for (const key of Object.keys(userMap[uid].byActionType)) {
        userMap[uid].byActionType[key].cost = roundCost(
          userMap[uid].byActionType[key].cost
        );
      }
    }

    const users = Object.entries(userMap)
      .map(([userId, data]) => ({ userId, ...data }))
      .sort((a, b) => b.totalCost - a.totalCost);

    const resultLimit = args.limit ?? 50;
    return users.slice(0, resultLimit);
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
