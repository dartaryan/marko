import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Webhook } from "svix";
import { internal } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const svixId = request.headers.get("svix-id");
    const svixTimestamp = request.headers.get("svix-timestamp");
    const svixSignature = request.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response("Missing svix headers", { status: 400 });
    }

    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("CLERK_WEBHOOK_SECRET is not set");
      return new Response("Server configuration error", { status: 500 });
    }

    const body = await request.text();

    let payload: unknown;
    try {
      const wh = new Webhook(webhookSecret);
      payload = wh.verify(body, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      });
    } catch {
      console.error("Webhook signature verification failed");
      return new Response("Invalid webhook signature", { status: 400 });
    }

    const event = payload as {
      type: string;
      data: {
        id: string;
        email_addresses?: Array<{ id: string; email_address: string }>;
        primary_email_address_id?: string | null;
        first_name?: string | null;
        last_name?: string | null;
      };
    };

    switch (event.type) {
      case "user.created":
      case "user.updated": {
        const primaryId = event.data.primary_email_address_id;
        const primaryEmail = primaryId
          ? event.data.email_addresses?.find((e) => e.id === primaryId)
          : undefined;
        const email =
          primaryEmail?.email_address ??
          event.data.email_addresses?.[0]?.email_address;
        const nameParts = [event.data.first_name, event.data.last_name]
          .filter(Boolean)
          .join(" ");
        const name = nameParts || undefined;

        const userId = await ctx.runMutation(internal.users.upsertFromClerk, {
          clerkId: event.data.id,
          email,
          name,
        });

        // Analytics: log signup (only for user.created, not user.updated)
        if (event.type === "user.created") {
          await ctx.runMutation(internal.analytics.logEvent, {
            userId,
            event: "auth.signup",
            metadata: { clerkId: event.data.id },
          });
        }
        break;
      }
      case "user.deleted": {
        if (event.data.id) {
          // Look up user BEFORE deletion to get userId for analytics
          const deletedUser = await ctx.runQuery(internal.users.getUserByClerkId, {
            clerkId: event.data.id,
          });

          await ctx.runMutation(internal.users.deleteFromClerk, {
            clerkId: event.data.id,
          });

          // Log deletion event (if user existed)
          if (deletedUser) {
            await ctx.runMutation(internal.analytics.logEvent, {
              userId: deletedUser._id,
              event: "auth.delete",
              metadata: { clerkId: event.data.id },
            });
          }
        }
        break;
      }
      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
    }

    return new Response(null, { status: 200 });
  }),
});

http.route({
  path: "/stripe-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return new Response("Missing stripe-signature header", { status: 400 });
    }
    const payload = await request.text();
    const result = await ctx.runAction(internal.stripe.fulfillStripeWebhook, {
      signature,
      payload,
    });
    return new Response(null, { status: result.success ? 200 : 400 });
  }),
});

export default http;
