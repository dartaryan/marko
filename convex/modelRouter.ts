export type AiActionType =
  | "summarize"
  | "translate"
  | "extractActions"
  | "improveWriting";

type AiModel = "haiku" | "sonnet" | "opus";

export const MODEL_IDS: Record<AiModel, string> = {
  haiku: "claude-haiku-4-5-20251001",
  sonnet: "claude-sonnet-4-5-20250929",
  opus: "claude-opus-4-6",
};

/**
 * Select the appropriate Claude model for a given action type and user tier.
 * Phase 1: All user-facing actions → Sonnet. Opus reserved for Phase 2 (paid tier).
 */
export function getModelForAction(
  actionType: AiActionType,
  _userTier: "free" | "paid"
): string {
  // Phase 1: All user-facing actions use Sonnet
  // Classification/internal tasks (future) would use Haiku
  // Opus is Phase 2, paid tier only — returns Sonnet for now
  switch (actionType) {
    case "summarize":
    case "translate":
    case "extractActions":
    case "improveWriting":
      return MODEL_IDS.sonnet;
    default:
      return MODEL_IDS.sonnet;
  }
}

const COST_PER_MILLION: Record<string, { input: number; output: number }> = {
  "claude-haiku-4-5-20251001": { input: 0.8, output: 4.0 },
  "claude-sonnet-4-5-20250929": { input: 3.0, output: 15.0 },
  "claude-opus-4-6": { input: 15.0, output: 75.0 },
};

export function getTokenCostForModel(
  modelId: string,
  inputTokens: number,
  outputTokens: number
): number {
  const costs = COST_PER_MILLION[modelId];
  if (!costs) return 0;
  return (
    (inputTokens / 1_000_000) * costs.input +
    (outputTokens / 1_000_000) * costs.output
  );
}
