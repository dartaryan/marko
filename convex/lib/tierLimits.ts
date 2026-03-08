import type { UserTier } from "../../types/user";

// TODO: finalize limits in Epic 6
export const FREE_MONTHLY_AI_LIMIT = 10;
// TODO: finalize limits in Epic 6
export const PAID_DAILY_OPUS_LIMIT = 5;

export type AiModel = "sonnet" | "opus";

export function checkAiAccess(
  userTier: UserTier,
  model: AiModel
): { allowed: boolean; message?: string; messageEn?: string } {
  if (userTier === "free" && model === "opus") {
    return {
      allowed: false,
      message: "מודל Opus דורש מנוי בתשלום",
      messageEn: "Opus model requires a paid subscription",
    };
  }

  // Free users can use Sonnet (with limits enforced in Epic 6)
  // Paid users can use both Sonnet and Opus
  return { allowed: true };
}
