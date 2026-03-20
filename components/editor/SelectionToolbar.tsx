"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Sparkles } from "lucide-react";

interface SelectionToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onAiClick: (selectedText: string, rect: { top: number; left: number }) => void;
}

/** Estimate the viewport-relative top position of a character offset in a textarea. */
function estimateCursorTop(textarea: HTMLTextAreaElement, offset: number): number {
  const rect = textarea.getBoundingClientRect();
  const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight) || 24;
  const textBefore = textarea.value.slice(0, offset);
  const linesBefore = textBefore.split("\n").length - 1;
  return rect.top + linesBefore * lineHeight - textarea.scrollTop;
}

export function SelectionToolbar({ textareaRef, onAiClick }: SelectionToolbarProps) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const toolbarRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const sel = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (sel === end) {
      setVisible(false);
      return;
    }

    const rect = textarea.getBoundingClientRect();
    const top = estimateCursorTop(textarea, sel);
    // Clamp: don't render above viewport
    const clampedTop = Math.max(8, top - 44);

    setPosition({
      top: clampedTop,
      left: rect.left + rect.width / 2,
    });
    setVisible(true);
  }, [textareaRef]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    function handleMouseUp() {
      setTimeout(updatePosition, 10);
    }

    function handleKeyUp(e: KeyboardEvent) {
      if (e.shiftKey) {
        updatePosition();
      }
    }

    textarea.addEventListener("mouseup", handleMouseUp);
    textarea.addEventListener("keyup", handleKeyUp);

    return () => {
      textarea.removeEventListener("mouseup", handleMouseUp);
      textarea.removeEventListener("keyup", handleKeyUp);
    };
  }, [textareaRef, updatePosition]);

  // Hide when clicking outside — but not when clicking inside the textarea (let mouseup handle that)
  useEffect(() => {
    if (!visible) return;
    function handleMouseDown(e: MouseEvent) {
      const target = e.target as Node;
      if (toolbarRef.current?.contains(target)) return;
      if (textareaRef.current?.contains(target)) return;
      setVisible(false);
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [visible, textareaRef]);

  function handleClick() {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const selected = textarea.value.slice(
      textarea.selectionStart,
      textarea.selectionEnd
    );
    if (selected) {
      // Recalculate position at click time to avoid stale coordinates after scroll
      const rect = textarea.getBoundingClientRect();
      const top = estimateCursorTop(textarea, textarea.selectionStart);
      const freshPos = {
        top: Math.max(8, top - 44),
        left: rect.left + rect.width / 2,
      };
      onAiClick(selected, freshPos);
      setVisible(false);
    }
  }

  if (!visible) return null;

  return (
    <div
      ref={toolbarRef}
      dir="rtl"
      className="marko-selection-toolbar animate-scale-in"
      style={{
        position: "fixed",
        top: `${position.top}px`,
        // Physical left is correct for fixed positioning (viewport coords from getBoundingClientRect)
        left: `${position.left}px`,
        transform: "translateX(-50%)",
        zIndex: "var(--z-dropdown)" as unknown as number,
      }}
      role="toolbar"
      aria-label="כלי בחירת טקסט"
    >
      <button
        type="button"
        onClick={handleClick}
        aria-label="פעולת AI על הטקסט הנבחר"
        className="marko-selection-toolbar-btn"
        data-testid="selection-ai-btn"
      >
        <Sparkles className="size-4" />
      </button>
    </div>
  );
}
