'use client';
import { FileText, Trash2, Maximize, Type, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import type { DocDirection } from '@/types/editor';

interface OverflowMenuProps {
  docDirection: DocDirection;
  onDirectionChange: (dir: DocDirection) => void;
  onLoadSample: () => void;
  onClearEditor: () => void;
  onEnterPresentation: () => void;
}

const directionOptions: { value: DocDirection; label: string }[] = [
  { value: 'auto', label: 'אוטומטי' },
  { value: 'rtl', label: 'ימין לשמאל' },
  { value: 'ltr', label: 'שמאל לימין' },
];

export function OverflowMenu({
  docDirection,
  onDirectionChange,
  onLoadSample,
  onClearEditor,
  onEnterPresentation,
}: OverflowMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="תפריט נוסף"
          title="תפריט נוסף"
          className="marko-header-btn"
        >
          <MoreHorizontal className="size-5" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={8}
        className="marko-overflow-menu"
      >
        <DropdownMenuItem onSelect={() => setTimeout(onLoadSample, 0)}>
          <FileText className="size-4" aria-hidden="true" />
          <span>מסמך לדוגמה</span>
        </DropdownMenuItem>

        <DropdownMenuItem onSelect={() => setTimeout(onClearEditor, 0)}>
          <Trash2 className="size-4" aria-hidden="true" />
          <span>נקה עורך</span>
        </DropdownMenuItem>

        <DropdownMenuItem onSelect={() => setTimeout(onEnterPresentation, 0)}>
          <Maximize className="size-4" aria-hidden="true" />
          <span>מצגת</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Type className="size-4" aria-hidden="true" />
            <span>כיוון טקסט</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="marko-overflow-menu">
            <DropdownMenuRadioGroup
              value={docDirection}
              onValueChange={(val) => onDirectionChange(val as DocDirection)}
            >
              {directionOptions.map((opt) => (
                <DropdownMenuRadioItem key={opt.value} value={opt.value}>
                  {opt.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
