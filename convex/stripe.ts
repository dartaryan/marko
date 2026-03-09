"use node";

import Stripe from "stripe";
import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v, ConvexError } from "convex/values";
import { requireAuth } from "./lib/authorization";

function getStripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new ConvexError({
      code: "CONFIG_ERROR",
      message: "שגיאת הגדרות שרת",
      messageEn: "Server configuration error: missing STRIPE_SECRET_KEY",
    });
  }
  return new Stripe(key, { apiVersion: "2026-02-25.clover" });
}

export const createCheckoutSession = action({
  args: {},
  handler: async (ctx) => {
    const identity = await requireAuth(ctx);

    const user = await ctx.runQuery(internal.users.getUserByClerkId, {
      clerkId: identity.subject,
    });

    if (!user) {
      throw new ConvexError({
        code: "USER_NOT_FOUND",
        message: "משתמש לא נמצא",
        messageEn: "User not found",
      });
    }

    if (user.tier === "paid") {
      throw new ConvexError({
        code: "ALREADY_SUBSCRIBED",
        message: "כבר יש לך מנוי פעיל",
        messageEn: "You already have an active subscription",
      });
    }

    const stripe = getStripeClient();

    const priceId = process.env.STRIPE_PRICE_ID;
    if (!priceId) {
      throw new ConvexError({
        code: "CONFIG_ERROR",
        message: "שגיאת הגדרות שרת",
        messageEn: "Server configuration error: missing STRIPE_PRICE_ID",
      });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Find or create Stripe customer
    let stripeCustomerId: string | undefined;

    // Check if user already has a subscription with a Stripe customer ID
    const existingSub = await ctx.runQuery(
      internal.subscriptions.getSubscriptionByUserId,
      { userId: user._id }
    );
    if (existingSub) {
      stripeCustomerId = existingSub.stripeCustomerId;
    }

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        name: user.name || undefined,
        metadata: { convexUserId: user._id, clerkId: identity.subject },
      });
      stripeCustomerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/editor?subscription=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/editor?subscription=canceled`,
      locale: "he",
      currency: "ils",
      metadata: { convexUserId: user._id, clerkId: identity.subject },
    });

    if (!session.url) {
      throw new ConvexError({
        code: "CHECKOUT_ERROR",
        message: "שגיאה ביצירת דף התשלום",
        messageEn: "Failed to create checkout session URL",
      });
    }

    return { url: session.url };
  },
});

export const fulfillStripeWebhook = internalAction({
  args: {
    signature: v.string(),
    payload: v.string(),
  },
  handler: async (ctx, args) => {
    const stripe = getStripeClient();

    const webhookSecret = process.env.STRIPE_WEBHOOKS_SECRET;
    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOKS_SECRET is not set");
      return { success: false };
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        args.payload,
        args.signature,
        webhookSecret
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Stripe webhook signature verification failed:", message);
      return { success: false };
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription" || !session.subscription) {
          break;
        }

        const clerkId = session.metadata?.clerkId;
        if (!clerkId) {
          console.error("No clerkId in checkout session metadata");
          return { success: false };
        }

        // Verify user still exists before creating subscription
        const user = await ctx.runQuery(internal.users.getUserByClerkId, {
          clerkId,
        });
        if (!user) {
          console.error("User not found for checkout webhook:", clerkId);
          return { success: false };
        }

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        // Idempotency: skip creation if webhook was already processed
        const existingSub = await ctx.runQuery(
          internal.subscriptions.getSubscriptionByStripeId,
          { stripeSubscriptionId: subscription.id }
        );
        if (!existingSub) {
          await ctx.runMutation(internal.subscriptions.createSubscription, {
            userId: user._id,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: subscription.id,
            status: "active",
            currentPeriodEnd: subscription.current_period_end * 1000,
          });
        }

        // Always ensure tier is updated (idempotent)
        await ctx.runMutation(internal.subscriptions.updateUserTier, {
          userId: user._id,
          tier: "paid",
        });

        await ctx.runMutation(internal.analytics.logEvent, {
          userId: user._id,
          event: "subscription.created",
          metadata: {
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: session.customer as string,
          },
        });
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        if (!invoice.subscription) break;

        const subscriptionId =
          typeof invoice.subscription === "string"
            ? invoice.subscription
            : invoice.subscription.id;

        const subscription =
          await stripe.subscriptions.retrieve(subscriptionId);

        await ctx.runMutation(
          internal.subscriptions.updateSubscriptionStatus,
          {
            stripeSubscriptionId: subscriptionId,
            status: "active",
            currentPeriodEnd: subscription.current_period_end * 1000,
          }
        );
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        if (!invoice.subscription) break;

        const subscriptionId =
          typeof invoice.subscription === "string"
            ? invoice.subscription
            : invoice.subscription.id;

        await ctx.runMutation(
          internal.subscriptions.updateSubscriptionStatus,
          {
            stripeSubscriptionId: subscriptionId,
            status: "past_due",
          }
        );
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        await ctx.runMutation(
          internal.subscriptions.updateSubscriptionStatus,
          {
            stripeSubscriptionId: subscription.id,
            status: "canceled",
          }
        );

        // Find the subscription to get the userId and revert tier
        const convexSub = await ctx.runQuery(
          internal.subscriptions.getSubscriptionByStripeId,
          { stripeSubscriptionId: subscription.id }
        );
        if (convexSub) {
          await ctx.runMutation(internal.subscriptions.updateUserTier, {
            userId: convexSub.userId,
            tier: "free",
          });

          await ctx.runMutation(internal.analytics.logEvent, {
            userId: convexSub.userId,
            event: "subscription.canceled",
            metadata: { stripeSubscriptionId: subscription.id },
          });
        }
        break;
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return { success: true };
  },
});

export const cancelSubscription = internalAction({
  args: {
    stripeSubscriptionId: v.string(),
  },
  handler: async (ctx, args) => {
    const stripe = getStripeClient();
    await stripe.subscriptions.cancel(args.stripeSubscriptionId);
  },
});
