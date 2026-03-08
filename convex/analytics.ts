import { v } from "convex/values";
import { mutation, internalMutation, internalQuery } from "./_generated/server";

// Server-side logging — called from other Convex functions (webhooks, AI calls)
export const logEvent = internalMutation({
  args: {
    userId: v.id("users"),
    event: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("analyticsEvents", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

// Maximum metadata size in bytes (4KB) to prevent storage abuse
const MAX_METADATA_SIZE = 4096;

function sanitizeMetadata(metadata: unknown): unknown {
  if (metadata === undefined) return undefined;
  try {
    const serialized = JSON.stringify(metadata);
    if (serialized.length > MAX_METADATA_SIZE) {
      return { _error: "metadata_too_large" };
    }
    return metadata;
  } catch {
    return { _error: "metadata_invalid" };
  }
}

// Client-side logging — called from React via useMutation
export const trackEvent = mutation({
  args: {
    event: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return; // Anonymous users — silently skip

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return; // User not synced yet — silently skip

    await ctx.db.insert("analyticsEvents", {
      userId: user._id,
      event: args.event,
      metadata: sanitizeMetadata(args.metadata),
      createdAt: Date.now(),
    });
  },
});

// Groups events by event name for a given time range
// Bounded to 10K records to prevent OOM at scale
export const getEventCounts = internalQuery({
  args: {
    since: v.number(),
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("analyticsEvents")
      .withIndex("by_createdAt", (q) => q.gte("createdAt", args.since))
      .take(10000);

    const counts: Record<string, number> = {};
    for (const event of events) {
      counts[event.event] = (counts[event.event] || 0) + 1;
    }
    return counts;
  },
});

// Returns recent events for a user
export const getRecentEventsByUser = internalQuery({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const events = await ctx.db
      .query("analyticsEvents")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);

    return events;
  },
});

// Cascade delete all analytics events for a user
export const deleteByUserId = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("analyticsEvents")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    for (const event of events) {
      await ctx.db.delete(event._id);
    }
  },
});
