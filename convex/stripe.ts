"use node";

import Stripe from "stripe";
import { action, internalAction } from "./_generated/server";
import type { ActionCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { v, ConvexError } from "convex/values";
import { requireAuth } from "./lib/authorization";

export function getStripeClient(): Stripe {
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

async function generateAndStoreReceipt(
  ctx: ActionCtx,
  args: {
    userId: string;
    subscriptionId: string | undefined;
    stripeSessionId: string | undefined;
    stripeInvoiceId: string | undefined;
    amountCents: number;
    currency: string;
    customerName: string;
    customerEmail: string;
    description: string;
  }
) {
  const {
    userId,
    subscriptionId,
    stripeSessionId,
    stripeInvoiceId,
    amountCents,
    currency,
    customerName,
    customerEmail,
    description,
  } = args;
  try {
    // Check idempotency
    if (stripeSessionId) {
      const existing = await ctx.runQuery(
        internal.receipts.getReceiptByStripeSessionId,
        { stripeSessionId }
      );
      if (existing) return;
    }
    if (stripeInvoiceId) {
      const existing = await ctx.runQuery(
        internal.receipts.getReceiptByStripeInvoiceId,
        { stripeInvoiceId }
      );
      if (existing) return;
    }

    // Convert Stripe amount (cents) to ILS
    const amountIls = amountCents / 100;

    // Call Sumit API to generate receipt
    const sumitResult = await ctx.runAction(internal.sumit.generateReceipt, {
      customerName,
      customerEmail,
      amount: amountIls,
      currency,
      description,
      stripeReference: stripeSessionId || stripeInvoiceId || "unknown",
    });

    // Store receipt in database
    if (sumitResult.success) {
      await ctx.runMutation(internal.receipts.createReceipt, {
        userId,
        subscriptionId,
        stripeSessionId,
        stripeInvoiceId,
        sumitDocumentId: sumitResult.documentId,
        sumitDocumentNumber: sumitResult.documentNumber,
        sumitDocumentUrl: sumitResult.documentUrl,
        sumitPdfUrl: sumitResult.pdfUrl,
        amount: amountIls,
        currency,
        status: "success",
      });

      await ctx.runMutation(internal.analytics.logEvent, {
        userId,
        event: "receipt.generated",
        metadata: {
          sumitDocumentId: sumitResult.documentId,
          stripeSessionId,
          stripeInvoiceId,
          amount: amountIls,
        },
      });
    } else {
      // Store failed receipt for audit trail
      await ctx.runMutation(internal.receipts.createReceipt, {
        userId,
        subscriptionId,
        stripeSessionId,
        stripeInvoiceId,
        sumitDocumentId: "",
        sumitDocumentNumber: "",
        sumitDocumentUrl: "",
        sumitPdfUrl: "",
        amount: amountIls,
        currency,
        status: "failed",
        errorMessage: sumitResult.error,
      });

      await ctx.runMutation(internal.analytics.logEvent, {
        userId,
        event: "receipt.generation_failed",
        metadata: {
          error: sumitResult.error,
          stripeSessionId,
          stripeInvoiceId,
        },
      });

      console.error(
        "Failed to generate receipt for user",
        userId,
        ":",
        sumitResult.error
      );
    }
  } catch (error) {
    // Catch any errors and log them - never fail the webhook
    console.error(
      "Error in receipt generation flow:",
      error instanceof Error ? error.message : error
    );

    try {
      await ctx.runMutation(internal.analytics.logEvent, {
        userId,
        event: "receipt.generation_failed",
        metadata: {
          error: error instanceof Error ? error.message : "Unknown error",
          stripeSessionId,
          stripeInvoiceId,
        },
      });
    } catch {
      // Swallow — analytics logging must never break the webhook
    }
  }
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
        let convexSubId: string | undefined;
        const existingSub = await ctx.runQuery(
          internal.subscriptions.getSubscriptionByStripeId,
          { stripeSubscriptionId: subscription.id }
        );
        if (existingSub) {
          convexSubId = existingSub._id;
        } else {
          convexSubId = await ctx.runMutation(internal.subscriptions.createSubscription, {
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

        // Generate receipt for initial payment (non-blocking)
        const customerName = session.customer_details?.name || user.name || "Customer";
        const customerEmail = session.customer_details?.email || user.email || "";
        const description = `Monthly Subscription - Marko Pro - ${new Date(session.created * 1000).toLocaleDateString("he-IL")}`;

        await generateAndStoreReceipt(ctx, {
          userId: user._id,
          subscriptionId: convexSubId,
          stripeSessionId: session.id,
          stripeInvoiceId: undefined,
          amountCents: session.amount_total || 0,
          currency: session.currency || "ils",
          customerName,
          customerEmail,
          description,
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

        // Generate receipt for renewal payment (non-blocking)
        const convexSub = await ctx.runQuery(
          internal.subscriptions.getSubscriptionByStripeId,
          { stripeSubscriptionId: subscriptionId }
        );

        if (convexSub) {
          const customerName = invoice.customer_name || "Customer";
          const customerEmail = invoice.customer_email || "";
          const description = `Monthly Subscription - Marko Pro - ${new Date(invoice.created * 1000).toLocaleDateString("he-IL")}`;

          await generateAndStoreReceipt(ctx, {
            userId: convexSub.userId,
            subscriptionId: convexSub._id,
            stripeSessionId: undefined,
            stripeInvoiceId: invoice.id,
            amountCents: invoice.amount_paid || 0,
            currency: invoice.currency || "ils",
            customerName,
            customerEmail,
            description,
          });
        }
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
        console.log("Subscription deleted:", subscription.id);

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
