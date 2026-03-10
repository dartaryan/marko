"use node";

import Stripe from "stripe";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v, ConvexError } from "convex/values";
import { requireAuth } from "./lib/authorization";
import { getStripeClient } from "./lib/stripe";

function wrapStripeError(err: unknown): never {
  if (err instanceof ConvexError) throw err;
  const message =
    err instanceof Error ? err.message : "Unknown Stripe error";
  throw new ConvexError({
    code: "STRIPE_ERROR",
    message: "שגיאה בתקשורת עם ספק התשלומים",
    messageEn: `Payment provider error: ${message}`,
  });
}

interface SubscriptionDetailsResult {
  tier: string;
  subscription: {
    status: string;
    currentPeriodEnd: number;
    cancelAtPeriodEnd: boolean;
    paymentMethodSummary: string | null;
    nextBillingAmount: number | null;
    currency: string;
  } | null;
}

interface InvoiceItem {
  id: string;
  date: number;
  amountPaid: number;
  currency: string;
  status: string;
  paymentIntent: string | null;
  receiptPdfUrl: string | null;
}

export const getSubscriptionDetails = action({
  args: {},
  handler: async (ctx): Promise<SubscriptionDetailsResult> => {
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
      return { tier: user.tier as string, subscription: null };
    }

    const stripe = getStripeClient();

    try {
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
        tier: user.tier as string,
        subscription: {
          status: stripeSub.status,
          currentPeriodEnd: subscription.currentPeriodEnd as number,
          cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
          paymentMethodSummary,
          nextBillingAmount,
          currency,
        },
      };
    } catch (err) {
      wrapStripeError(err);
    }
  },
});

export const listInvoices = action({
  args: {},
  handler: async (ctx): Promise<{ invoices: InvoiceItem[] }> => {
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

    try {
      const stripeInvoices = await stripe.invoices.list({
        customer: subscription.stripeCustomerId as string,
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

      const invoices: InvoiceItem[] = stripeInvoices.data.map((inv: Stripe.Invoice) => {
        const receipt = receiptMap.get(inv.id);
        const pi = (inv as unknown as { payment_intent: string | { id: string } | null }).payment_intent;
        return {
          id: inv.id,
          date: inv.created * 1000,
          amountPaid: (inv.amount_paid || 0) / 100,
          currency: inv.currency || "ils",
          status: inv.status as string,
          paymentIntent:
            typeof pi === "string" ? pi : pi?.id || null,
          receiptPdfUrl: receipt?.sumitPdfUrl || null,
        };
      });

      return { invoices };
    } catch (err) {
      wrapStripeError(err);
    }
  },
});

export const cancelSubscription = action({
  args: {},
  handler: async (ctx): Promise<{ cancelDate: number }> => {
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

    try {
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
    } catch (err) {
      wrapStripeError(err);
    }

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

    return { cancelDate: subscription.currentPeriodEnd as number };
  },
});

export const retryPayment = action({
  args: {
    invoiceId: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: boolean; status: string | null }> => {
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

    let invoice: Stripe.Invoice;
    try {
      invoice = await stripe.invoices.retrieve(args.invoiceId);
    } catch (err) {
      wrapStripeError(err);
    }

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

    let paidInvoice: Stripe.Invoice;
    try {
      paidInvoice = await stripe.invoices.pay(args.invoiceId);
    } catch (err) {
      wrapStripeError(err);
    }

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
