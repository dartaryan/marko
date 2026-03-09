import { v, ConvexError } from "convex/values";
import { query, internalMutation, internalQuery, action } from "./_generated/server";
import { internal } from "./_generated/api";
import { requireAuth } from "./lib/authorization";

export const upsertFromClerk = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: args.email,
        name: args.name,
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      tier: "free",
      createdAt: Date.now(),
    });
  },
});

export const deleteFromClerk = internalMutation({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (user) {
      await ctx.db.delete(user._id);
    }
  },
});

export const getUserByClerkId = internalQuery({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    return user;
  },
});

export const getCurrentUserOrThrow = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        code: "AUTH_REQUIRED",
        message: "נדרש התחברות כדי לגשת לתכונה זו",
        messageEn: "Authentication required to access this feature",
      });
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new ConvexError({
        code: "USER_NOT_FOUND",
        message: "המשתמש לא נמצא במערכת",
        messageEn: "User not found in system",
      });
    }

    return user;
  },
});

export const deleteMyAccount = action({
  args: {},
  handler: async (ctx) => {
    const identity = await requireAuth(ctx);
    const clerkId = identity.subject;

    // Delete from Clerk FIRST via Backend API.
    // If this fails, nothing has been deleted — user can safely retry.
    // If this succeeds but Convex delete fails, the Clerk webhook (user.deleted)
    // will fire and deleteFromClerk handles cleanup idempotently.
    const clerkSecretKey = process.env.CLERK_SECRET_KEY;
    if (!clerkSecretKey) {
      throw new ConvexError({
        code: "CONFIG_ERROR",
        message: "שגיאת הגדרות שרת",
        messageEn: "Server configuration error: missing CLERK_SECRET_KEY",
      });
    }

    const response = await fetch(
      `https://api.clerk.com/v1/users/${clerkId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${clerkSecretKey}` },
      }
    );

    // 404 is acceptable — means Clerk already deleted the user
    if (!response.ok && response.status !== 404) {
      throw new ConvexError({
        code: "CLERK_DELETE_FAILED",
        message: "שגיאה במחיקת החשבון. נסה שוב.",
        messageEn: "Failed to delete Clerk account",
      });
    }

    // Cascade delete analytics events before deleting the user
    const user = await ctx.runQuery(internal.users.getUserByClerkId, { clerkId });
    if (user) {
      // Cancel active Stripe subscription before deleting
      const subscription = await ctx.runQuery(
        internal.subscriptions.getSubscriptionByUserId,
        { userId: user._id }
      );
      if (subscription && (subscription.status === "active" || subscription.status === "past_due")) {
        try {
          await ctx.runAction(internal.stripe.cancelSubscription, {
            stripeSubscriptionId: subscription.stripeSubscriptionId,
          });
        } catch (err) {
          console.error("Failed to cancel Stripe subscription during account deletion:", err);
          // Continue with deletion — Stripe subscription will expire naturally
        }
      }

      // Cascade delete subscription records
      await ctx.runMutation(internal.subscriptions.deleteByUserId, { userId: user._id });

      await ctx.runMutation(internal.analytics.deleteByUserId, { userId: user._id });

      await ctx.runMutation(internal.receipts.deleteByUserId, { userId: user._id });
    }

    // Delete from Convex (via internal mutation — idempotent, handles user-not-found)
    await ctx.runMutation(internal.users.deleteFromClerk, { clerkId });
  },
});
