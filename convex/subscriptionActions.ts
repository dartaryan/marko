"use node";

import Stripe from "stripe";
import { action } from "./_generated/server";
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

export const getSubscriptionDetails = action({
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

    const subscription = await ctx.runQuery(
      internal.subscriptions.getSubscriptionByUserId,
      { userId: user._id }
    );

    if (!subscription) {
      return { tier: user.tier, subscription: null };
    }

    const stripe = getStripeClient();

    const stripeSub = await stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId,
      { expand: ["default_payment_method"] }
    );

    let paymentMethodSummary: string | null = null;
    const pm = stripeSub.default_payment_method;
    if (pm && typeof pm === "object" && "card" in pm) {
      const card = (pm as Stripe.PaymentMethod).card;
      if (card) {
        paymentMethodSummary = `${card.brand} **** ${card.last4}`;
      }
    }

    let nextBillingAmount: number | null = null;
    let currency = "ils";
    const priceItem = stripeSub.items?.data?.[0];
    if (priceItem?.price?.unit_amount != null) {
      nextBillingAmount = priceItem.price.unit_amount / 100;
      currency = priceItem.price.currency || "ils";
    }

    return {
      tier: user.tier,
      subscription: {
        status: stripeSub.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
        paymentMethodSummary,
        nextBillingAmount,
        currency,
      },
    };
  },
});

export const listInvoices = action({
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

    const subscription = await ctx.runQuery(
      internal.subscriptions.getSubscriptionByUserId,
      { userId: user._id }
    );

    if (!subscription) {
      return { invoices: [] };
    }

    const stripe = getStripeClient();

    const stripeInvoices = await stripe.invoices.list({
      customer: subscription.stripeCustomerId,
      limit: 20,
    });

    const receipts = await ctx.runQuery(
      internal.receipts.getReceiptsByUserIdInternal,
      { userId: user._id }
    );

    const receiptMap = new Map<
      string,
      { sumitPdfUrl: string; sumitDocumentUrl: string }
    >();
    for (const r of receipts) {
      if (r.stripeInvoiceId && r.status === "success") {
        receiptMap.set(r.stripeInvoiceId, {
          sumitPdfUrl: r.sumitPdfUrl,
          sumitDocumentUrl: r.sumitDocumentUrl,
        });
      }
    }

    const invoices = stripeInvoices.data.map((inv) => {
      const receipt = receiptMap.get(inv.id);
      return {
        id: inv.id,
        date: inv.created * 1000,
        amountPaid: (inv.amount_paid || 0) / 100,
        currency: inv.currency || "ils",
        status: inv.status as string,
        paymentIntent:
          typeof inv.payment_intent === "string"
            ? inv.payment_intent
            : inv.payment_intent?.id || null,
        receiptPdfUrl: receipt?.sumitPdfUrl || null,
      };
    });

    return { invoices };
  },
});

export const cancelSubscription = action({
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

    const subscription = await ctx.runQuery(
      internal.subscriptions.getSubscriptionByUserId,
      { userId: user._id }
    );

    if (!subscription || subscription.status !== "active") {
      throw new ConvexError({
        code: "NO_ACTIVE_SUBSCRIPTION",
        message: "אין מנוי פעיל לביטול",
        messageEn: "No active subscription to cancel",
      });
    }

    const stripe = getStripeClient();

    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    await ctx.runMutation(internal.subscriptions.updateSubscriptionStatus, {
      stripeSubscriptionId: subscription.stripeSubscriptionId,
      status: "active",
      cancelAtPeriodEnd: true,
    });

    await ctx.runMutation(internal.analytics.logEvent, {
      userId: user._id,
      event: "subscription.cancel_requested",
      metadata: { stripeSubscriptionId: subscription.stripeSubscriptionId },
    });

    return { cancelDate: subscription.currentPeriodEnd };
  },
});

export const retryPayment = action({
  args: {
    invoiceId: v.string(),
  },
  handler: async (ctx, args) => {
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

    const subscription = await ctx.runQuery(
      internal.subscriptions.getSubscriptionByUserId,
      { userId: user._id }
    );

    if (!subscription) {
      throw new ConvexError({
        code: "NO_SUBSCRIPTION",
        message: "לא נמצא מנוי",
        messageEn: "No subscription found",
      });
    }

    const stripe = getStripeClient();

    const invoice = await stripe.invoices.retrieve(args.invoiceId);
    if (invoice.customer !== subscription.stripeCustomerId) {
      throw new ConvexError({
        code: "INVOICE_NOT_FOUND",
        message: "החשבונית לא נמצאה",
        messageEn: "Invoice not found for this customer",
      });
    }

    if (invoice.status !== "open") {
      throw new ConvexError({
        code: "INVOICE_NOT_PAYABLE",
        message: "לא ניתן לשלם חשבונית זו",
        messageEn: "Invoice cannot be paid in its current state",
      });
    }

    const paidInvoice = await stripe.invoices.pay(args.invoiceId);

    await ctx.runMutation(internal.analytics.logEvent, {
      userId: user._id,
      event: "subscription.payment_retry",
      metadata: { invoiceId: args.invoiceId, status: paidInvoice.status },
    });

    return {
      success: paidInvoice.status === "paid",
      status: paidInvoice.status,
    };
  },
});
