import Anthropic from "@anthropic-ai/sdk";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { ConvexError, v } from "convex/values";
import { requireAuth } from "./lib/authorization";
import { FREE_MONTHLY_AI_LIMIT, PAID_DAILY_OPUS_LIMIT } from "./lib/tierLimits";
import { getModelForAction, getTokenCostForModel } from "./modelRouter";
import { getSystemPrompt } from "./prompts";

const MAX_INPUT_CHARS = 100_000;

function sanitizeInput(content: string): string {
  const trimmed = content.trim();
  if (trimmed.length === 0) {
    throw new ConvexError({
      code: "AI_INPUT_EMPTY",
      message: "לא ניתן לעבד מסמך ריק",
      messageEn: "Cannot process empty document",
    });
  }
  return trimmed.length > MAX_INPUT_CHARS
    ? trimmed.slice(0, MAX_INPUT_CHARS)
    : trimmed;
}

export const callAnthropicApi = action({
  args: {
    actionType: v.union(
      v.literal("summarize"),
      v.literal("translate"),
      v.literal("extractActions"),
      v.literal("improveWriting")
    ),
    content: v.string(),
    targetLanguage: v.optional(v.union(v.literal("he"), v.literal("en"))),
    forceOpus: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // 1. Auth verification (requireTier() excluded — it needs QueryCtx/MutationCtx,
    // not ActionCtx. Tier-based limits are enforced manually below.)
    const identity = await requireAuth(ctx);

    // 2. Get user from DB (actions can't query DB directly)
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

    // 3. Check usage limits for free tier
    if (user.tier === "free") {
      const monthlyCount = await ctx.runQuery(
        internal.usage.getMonthlyUsageCount,
        { userId: user._id }
      );

      if (monthlyCount >= FREE_MONTHLY_AI_LIMIT) {
        await ctx.runMutation(internal.analytics.logEvent, {
          userId: user._id,
          event: "ai.limit_reached",
          metadata: { monthlyCount, limit: FREE_MONTHLY_AI_LIMIT },
        });
        throw new ConvexError({
          code: "AI_LIMIT_REACHED",
          message: "הגעת למגבלת השימוש החודשית ב-AI",
          messageEn: "Monthly AI usage limit reached",
        });
      }
    }

    // 3.5. Check Opus daily limit for paid users requesting forceOpus
    let opusFallback = false;
    if (args.forceOpus && user.tier === "paid") {
      const dailyOpusCount = await ctx.runQuery(
        internal.usage.getDailyOpusUsageCount,
        { userId: user._id }
      );
      if (dailyOpusCount >= PAID_DAILY_OPUS_LIMIT) {
        opusFallback = true; // Will use Sonnet instead
      }
    }

    // 4. Sanitize input
    const sanitizedContent = sanitizeInput(args.content);

    // 5. Select model — pass effective forceOpus (false if fallback or free user)
    const effectiveForceOpus = args.forceOpus === true && user.tier === "paid" && !opusFallback;
    const modelId = getModelForAction(args.actionType, user.tier, effectiveForceOpus);

    // 6. Build prompt
    const systemPrompt = getSystemPrompt(args.actionType);

    // 7. Call Anthropic API
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new ConvexError({
        code: "AI_CONFIG_ERROR",
        message: "שגיאת הגדרות שרת",
        messageEn: "Server configuration error: missing API key",
      });
    }

    let response;
    try {
      const client = new Anthropic({ apiKey });

      let userMessage = sanitizedContent;
      if (
        args.actionType === "translate" &&
        args.targetLanguage
      ) {
        userMessage = `Target language: ${args.targetLanguage === "he" ? "Hebrew" : "English"}\n\n${sanitizedContent}`;
      }

      response = await client.messages.create({
        model: modelId,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      });
    } catch (error) {
      const detail =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Anthropic API error:", detail);
      throw new ConvexError({
        code: "AI_UNAVAILABLE",
        message: "AI לא זמין כרגע. נסה שוב מאוחר יותר",
        messageEn: `AI is currently unavailable. Please try again later`,
        detail,
      });
    }

    // 8. Extract result
    const textBlock = response.content.find((block) => block.type === "text");
    const result = textBlock ? textBlock.text : "";
    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;

    // 9. Log usage
    const cost = getTokenCostForModel(modelId, inputTokens, outputTokens);
    await ctx.runMutation(internal.usage.logAiUsage, {
      userId: user._id,
      model: modelId,
      inputTokens,
      outputTokens,
      cost,
      actionType: args.actionType,
    });

    await ctx.runMutation(internal.analytics.logEvent, {
      userId: user._id,
      event: "ai.call",
      metadata: { model: modelId, actionType: args.actionType },
    });

    // 9.5. Log Opus-specific events
    if (effectiveForceOpus) {
      await ctx.runMutation(internal.analytics.logEvent, {
        userId: user._id,
        event: "ai.opus_used",
        metadata: { actionType: args.actionType },
      });
    }

    if (opusFallback) {
      await ctx.runMutation(internal.analytics.logEvent, {
        userId: user._id,
        event: "ai.opus_fallback",
        metadata: { actionType: args.actionType },
      });
    }

    // 10. Return result
    return {
      result,
      model: modelId,
      inputTokens,
      outputTokens,
      opusFallback,
    };
  },
});
