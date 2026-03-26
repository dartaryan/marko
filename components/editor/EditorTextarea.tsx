'use client';
import { forwardRef, useCallback } from 'react';
import type { DocDirection } from '@/types/editor';

const SLASH_COMMANDS = ['/ai', '/בינה'] as const;

interface EditorTextareaProps {
  value: string;
  onChange: (value: string) => void;
  dir?: DocDirection;
  onSlashCommand?: (cursorTop: number, cursorLeft: number) => void;
}

export const EditorTextarea = forwardRef<HTMLTextAreaElement, EditorTextareaProps>(
  function EditorTextarea({ value, onChange, dir = 'rtl', onSlashCommand }, ref) {
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const textarea = e.target;
        const newValue = textarea.value;
        const cursorPos = textarea.selectionStart;

        // Check for slash commands ending with space or at cursor
        for (const cmd of SLASH_COMMANDS) {
          const cmdWithSpace = cmd + ' ';
          const textBeforeCursor = newValue.slice(
            Math.max(0, cursorPos - cmdWithSpace.length),
            cursorPos
          );

          if (textBeforeCursor === cmdWithSpace) {
            const cmdStart = cursorPos - cmdWithSpace.length;
            // Only trigger at line start or after whitespace
            const charBefore = cmdStart > 0 ? newValue[cmdStart - 1] : '\n';
            if (charBefore !== '\n' && charBefore !== ' ' && charBefore !== '\t') continue;

            const cleaned = newValue.slice(0, cmdStart) + newValue.slice(cursorPos);
            onChange(cleaned);

            if (onSlashCommand) {
              const rect = textarea.getBoundingClientRect();
              const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight) || 24;
              const lines = cleaned.slice(0, cmdStart).split('\n').length - 1;
              const cursorTop = rect.top + (lines * lineHeight) - textarea.scrollTop;
              onSlashCommand(cursorTop, rect.left + rect.width / 2);
            }
            return;
          }
        }

        onChange(newValue);
      },
      [onChange, onSlashCommand]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key !== 'Enter') return;
        const textarea = e.currentTarget;
        const cursorPos = textarea.selectionStart;
        const textBeforeCursor = textarea.value.slice(0, cursorPos);

        for (const cmd of SLASH_COMMANDS) {
          if (textBeforeCursor.endsWith(cmd)) {
            const cmdStart = cursorPos - cmd.length;
            // Only trigger at line start or after whitespace
            const charBefore = cmdStart > 0 ? textarea.value[cmdStart - 1] : '\n';
            if (charBefore !== '\n' && charBefore !== ' ' && charBefore !== '\t') continue;

            e.preventDefault();
            const cleaned = textarea.value.slice(0, cmdStart) + textarea.value.slice(cursorPos);
            onChange(cleaned);

            if (onSlashCommand) {
              const rect = textarea.getBoundingClientRect();
              const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight) || 24;
              const lines = cleaned.slice(0, cmdStart).split('\n').length - 1;
              const cursorTop = rect.top + (lines * lineHeight) - textarea.scrollTop;
              onSlashCommand(cursorTop, rect.left + rect.width / 2);
            }
            return;
          }
        }
      },
      [onChange, onSlashCommand]
    );

    return (
      <textarea
        ref={ref}
        className="h-full w-full resize-none bg-surface p-4 font-mono text-sm text-foreground
                   placeholder:text-muted-foreground focus:outline-none"
        style={{ fontSize: 'var(--editor-font-size, 16px)' }}
        dir={dir}
        lang="he"
        aria-label="תוכן מארקדאון לעריכה"
        aria-multiline="true"
        placeholder="התחל לכתוב..."
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        suppressHydrationWarning
      />
    );
  }
);
