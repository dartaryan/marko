import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

export const ABUSE_THRESHOLDS = {
  NEW_ACCOUNT_WINDOW_MS: 24 * 60 * 60 * 1000, // 24 hours
  NEW_ACCOUNT_MAX_AI_CALLS: 8, // Max calls for new accounts
  HOURLY_BURST_MAX_CALLS: 20, // Max calls per hour
  MONTHLY_COST_SOFT_LIMIT: 1.0, // $1.00 USD per month
};

export const detectAbuse = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Get all non-flagged free-tier users
    const allUsers = await ctx.db.query("users").collect();
    const candidates = allUsers.filter(
      (u) => u.tier === "free" && !u.flagged
    );

    let flaggedCount = 0;

    for (const user of candidates) {
      try {
      let reason: string | null = null;

      // Pattern 1: New account burst
      const accountAge = now - user.createdAt;
      if (accountAge < ABUSE_THRESHOLDS.NEW_ACCOUNT_WINDOW_MS) {
        const usage = await ctx.db
          .query("aiUsage")
          .withIndex("by_userId_createdAt", (q) =>
            q.eq("userId", user._id).gte("createdAt", user.createdAt)
          )
          .collect();

        if (usage.length > ABUSE_THRESHOLDS.NEW_ACCOUNT_MAX_AI_CALLS) {
          reason = `new_account_burst: ${usage.length} AI calls within ${Math.round(accountAge / 3600000)}h of creation`;
        }
      }

      // Pattern 2: Hourly burst (skip if already flagged by pattern 1)
      if (!reason) {
        const oneHourAgo = now - 60 * 60 * 1000;
        const hourlyUsage = await ctx.db
          .query("aiUsage")
          .withIndex("by_userId_createdAt", (q) =>
            q.eq("userId", user._id).gte("createdAt", oneHourAgo)
          )
          .collect();

        if (hourlyUsage.length > ABUSE_THRESHOLDS.HOURLY_BURST_MAX_CALLS) {
          reason = `hourly_burst: ${hourlyUsage.length} AI calls in last hour`;
        }
      }

      // Pattern 3: Monthly cost threshold (skip if already flagged)
      if (!reason) {
        const d = new Date(now);
        const startOfMonth = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));

        const monthlyUsage = await ctx.db
          .query("aiUsage")
          .withIndex("by_userId_createdAt", (q) =>
            q.eq("userId", user._id).gte("createdAt", startOfMonth.getTime())
          )
          .collect();

        const monthlyCost = monthlyUsage.reduce((sum, r) => sum + r.cost, 0);
        if (monthlyCost > ABUSE_THRESHOLDS.MONTHLY_COST_SOFT_LIMIT) {
          reason = `high_monthly_cost: $${monthlyCost.toFixed(4)} exceeds $${ABUSE_THRESHOLDS.MONTHLY_COST_SOFT_LIMIT} threshold`;
        }
      }

      // Flag user if any pattern matched
      if (reason) {
        await ctx.db.patch(user._id, {
          flagged: true,
          flagReason: reason,
          flaggedAt: now,
        });
        flaggedCount++;
      }
      } catch {
        // Skip individual user errors so the scan continues for remaining users
        continue;
      }
    }

    return { flaggedCount };
  },
});

export const getFlaggedUsers = internalQuery({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const allUsers = await ctx.db.query("users").collect();
    const flagged = allUsers
      .filter((u) => u.flagged === true)
      .map((u) => ({
        userId: u._id,
        email: u.email,
        name: u.name,
        tier: u.tier,
        createdAt: u.createdAt,
        flagged: u.flagged,
        flagReason: u.flagReason,
        flaggedAt: u.flaggedAt,
      }))
      .sort((a, b) => (b.flaggedAt ?? 0) - (a.flaggedAt ?? 0));

    const resultLimit = args.limit ?? 50;
    return flagged.slice(0, resultLimit);
  },
});

export const unflagUser = internalMutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error(`User ${args.userId} not found`);
    }
    await ctx.db.patch(args.userId, {
      flagged: undefined,
      flagReason: undefined,
      flaggedAt: undefined,
    });
  },
});
