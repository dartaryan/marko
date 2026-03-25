import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getMySettings = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return null;

    return ctx.db
      .query("userSettings")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();
  },
});

export const saveMySettings = mutation({
  args: {
    docDirection: v.union(v.literal("auto"), v.literal("rtl"), v.literal("ltr")),
    autoSave: v.boolean(),
    activeThemeId: v.string(),
    darkLightModePref: v.union(v.literal("system"), v.literal("light"), v.literal("dark")),
    fontSize: v.union(v.literal("small"), v.literal("medium"), v.literal("large")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return null;

    const existing = await ctx.db
      .query("userSettings")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    const settings = {
      ...args,
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, settings);
      return existing._id;
    }

    return await ctx.db.insert("userSettings", { userId: user._id, ...settings });
  },
});
