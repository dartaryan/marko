"use node";

import Stripe from "stripe";
import { ConvexError } from "convex/values";

export function getStripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new ConvexError({
      code: "CONFIG_ERROR",
      message: "שגיאת הגדרות שרת",
      messageEn: "Server configuration error: missing STRIPE_SECRET_KEY",
    });
  }
  return new Stripe(key, { apiVersion: "2026-02-25.clover" as Stripe.LatestApiVersion });
}
