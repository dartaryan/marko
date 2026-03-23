"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import {
  FileText,
  Settings,
  Phone,
  Bug,
  LogOut,
  CreditCard,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UserTier } from "@/types/user";
import { DeleteAccountDialog } from "./DeleteAccountDialog";
import { toast } from "sonner";

interface UserMenuProps {
  tier: UserTier;
}

export function UserMenu({ tier }: UserMenuProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [imgError, setImgError] = useState(false);
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk();

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
    } catch {
      toast.error("שגיאה בהתנתקות. נסה לרענן את הדף.");
    }
  }, [signOut]);

  const initials = user?.firstName
    ? user.firstName.charAt(0).toUpperCase()
    : user?.primaryEmailAddress?.emailAddress?.charAt(0).toUpperCase() ?? "?";

  return (
    <div className="relative inline-flex items-center" data-testid="user-menu">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="תפריט משתמש"
            title="תפריט משתמש"
            className="marko-header-btn marko-user-avatar"
            data-testid="user-menu-trigger"
          >
            {user?.imageUrl && !imgError ? (
              <img
                src={user.imageUrl}
                alt=""
                className="size-7 rounded-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <span className="flex size-7 items-center justify-center rounded-full bg-[var(--color-emerald-500)] text-[12px] font-bold text-emerald-900">
                {initials}
              </span>
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          sideOffset={8}
          className="marko-user-menu"
        >
          <DropdownMenuItem
            onSelect={() => toast("בקרוב — ניהול מסמכים יגיע בגרסה הבאה")}
            data-testid="menu-item-documents"
          >
            <span>המסמכים שלי</span>
            <FileText className="size-4 ms-auto" aria-hidden="true" />
          </DropdownMenuItem>

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

          {tier === "paid" && (
            <DropdownMenuItem
              onSelect={() => setTimeout(() => router.push("/subscription"), 0)}
              data-testid="menu-item-subscription"
            >
              <span>ניהול מנוי</span>
              <CreditCard className="size-4 ms-auto" aria-hidden="true" />
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onSelect={() => setTimeout(() => setShowDeleteDialog(true), 0)}
            data-testid="menu-item-delete-account"
          >
            <span>מחיקת חשבון</span>
            <Trash2 className="size-4 ms-auto" aria-hidden="true" />
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() => setTimeout(() => handleSignOut(), 0)}
            data-testid="menu-item-signout"
          >
            <span>התנתק</span>
            <LogOut className="size-4 ms-auto" aria-hidden="true" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {tier === "paid" && (
        <span
          className="absolute -bottom-0.5 -end-0.5 size-2.5 rounded-full bg-[var(--color-emerald-500)] border-2 border-[var(--background)] shadow-[0_0_6px_rgba(16,185,129,0.4)]"
          role="img"
          aria-label="מנוי פרימיום"
          data-testid="paid-badge"
        />
      )}

      <DeleteAccountDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </div>
  );
}
