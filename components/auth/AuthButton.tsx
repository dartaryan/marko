"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { Settings, Phone, Bug, LogIn, User } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AuthButton() {
  const router = useRouter();
  const { openSignIn } = useClerk();

  const handleSignIn = useCallback(async () => {
    try {
      await openSignIn();
    } catch {
      toast.error("שגיאה בטעינת החיבור. נסה לרענן את הדף.");
    }
  }, [openSignIn]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="תפריט אורח"
          title="תפריט אורח"
          className="marko-header-btn marko-user-avatar"
          data-testid="auth-button"
        >
          <span className="flex size-7 items-center justify-center rounded-full border border-[rgba(110,231,183,0.3)] text-[var(--color-emerald-300)]">
            <User className="size-4" aria-hidden="true" />
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={8}
        className="marko-user-menu"
      >
        <DropdownMenuItem
          onSelect={() => setTimeout(() => router.push("/settings"), 0)}
          data-testid="menu-item-settings"
        >
          <span>הגדרות</span>
          <Settings className="size-4 ms-auto" aria-hidden="true" />
        </DropdownMenuItem>

        <DropdownMenuItem
          onSelect={() => setTimeout(() => router.push("/contact"), 0)}
          data-testid="menu-item-contact"
        >
          <span>צור קשר</span>
          <Phone className="size-4 ms-auto" aria-hidden="true" />
        </DropdownMenuItem>

        <DropdownMenuItem
          onSelect={() => setTimeout(() => router.push("/report-bug"), 0)}
          data-testid="menu-item-report-bug"
        >
          <span>דווח על בעיה</span>
          <Bug className="size-4 ms-auto" aria-hidden="true" />
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onSelect={() => setTimeout(() => handleSignIn(), 0)}
          data-testid="menu-item-signin"
        >
          <span>התחבר</span>
          <LogIn className="size-4 ms-auto" aria-hidden="true" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
