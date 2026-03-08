import type { AiActionType } from "./modelRouter";

const SYSTEM_PROMPTS: Record<AiActionType, string> = {
  summarize: `You are a document summarization assistant. Summarize the following document concisely.
- Preserve key points and main arguments
- Output in the SAME LANGUAGE as the input (Hebrew or English)
- Use bullet points for clarity
- Keep the summary under 300 words`,

  translate: `You are a Hebrew-English translation assistant.
- Detect the source language of each paragraph
- Translate Hebrew text to English and English text to Hebrew
- Preserve formatting (Markdown syntax, headers, lists)
- Maintain technical terms where appropriate
- Output only the translated text, no explanations`,

  extractActions: `You are a task extraction assistant.
- Extract all action items, tasks, and to-dos from the document
- Format as a Markdown bullet-point checklist (- [ ] Task)
- Group related tasks if possible
- Output in the SAME LANGUAGE as the input
- If no action items found, state that clearly`,

  improveWriting: `You are a writing improvement assistant.
- Suggest grammar, style, and clarity improvements
- Preserve the author's voice and intent
- Output the improved text with changes highlighted using **bold** for additions
- If the text is in Hebrew, provide suggestions in Hebrew
- Focus on clarity and readability, not length`,
};

export function getSystemPrompt(actionType: AiActionType): string {
  return SYSTEM_PROMPTS[actionType];
}
