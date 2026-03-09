export type AiActionType =
  | "summarize"
  | "translate"
  | "extractActions"
  | "improveWriting";

export type AiModel = "haiku" | "sonnet" | "opus";

export interface AiRequestArgs {
  actionType: AiActionType;
  content: string;
  targetLanguage?: "he" | "en";
  forceOpus?: boolean;
}

export interface AiResponse {
  result: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  opusFallback?: boolean;
}
