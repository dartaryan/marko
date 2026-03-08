import type { QueryCtx, MutationCtx, ActionCtx } from "../_generated/server";
import { ConvexError } from "convex/values";

export async function requireAuth(
  ctx: QueryCtx | MutationCtx | ActionCtx
) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError({
      code: "AUTH_REQUIRED",
      message: "נדרש התחברות",
      messageEn: "Authentication required",
    });
  }
  return identity;
}

// Note: ActionCtx is excluded because it doesn't have ctx.db for user queries.
// In Convex actions, use ctx.runQuery to get user data, then check tier manually.
export async function requireTier(
  ctx: QueryCtx | MutationCtx,
  minTier: "free" | "paid"
) {
  const identity = await requireAuth(ctx);
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .unique();

  if (!user) {
    throw new ConvexError({
      code: "USER_NOT_FOUND",
      message: "משתמש לא נמצא",
      messageEn: "User not found",
    });
  }

  if (minTier === "paid" && user.tier !== "paid") {
    throw new ConvexError({
      code: "TIER_INSUFFICIENT",
      message: "נדרש מנוי בתשלום לתכונה זו",
      messageEn: "Paid subscription required for this feature",
    });
  }

  return user;
}
