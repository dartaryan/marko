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

        await ctx.runMutation(internal.users.upsertFromClerk, {
          clerkId: event.data.id,
          email,
          name,
        });
        break;
      }
      case "user.deleted": {
        if (event.data.id) {
          await ctx.runMutation(internal.users.deleteFromClerk, {
            clerkId: event.data.id,
          });
        }
        break;
      }
      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
    }

    return new Response(null, { status: 200 });
  }),
});

export default http;
