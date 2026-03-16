"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Trash2, CreditCard } from "lucide-react";
import type { UserTier } from "@/types/user";
import { DeleteAccountDialog } from "./DeleteAccountDialog";

interface UserMenuProps {
  tier: UserTier;
}

export function UserMenu({ tier }: UserMenuProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();

  return (
    <div className="relative inline-flex items-center" data-testid="user-menu">
      <UserButton
        appearance={{
          variables: {
            colorPrimary: "#10B981",
            borderRadius: "12px",
          },
          elements: {
            avatarBox: "size-7 rounded-full",
            card: "rounded-[12px] shadow-[0_10px_40px_rgba(6,78,59,0.15),0_4px_12px_rgba(6,78,59,0.08)] border border-[var(--border)]",
            userButtonPopoverActionButton:
              "rounded-[4px] hover:bg-[var(--primary-ghost)]",
          },
        }}
      >
        <UserButton.MenuItems>
          {tier === "paid" && (
            <UserButton.Action
              label="ניהול מנוי"
              labelIcon={<CreditCard className="h-4 w-4" />}
              onClick={() => router.push("/subscription")}
            />
          )}
          <UserButton.Action
            label="מחיקת חשבון"
            labelIcon={<Trash2 className="h-4 w-4" />}
            onClick={() => setShowDeleteDialog(true)}
          />
        </UserButton.MenuItems>
      </UserButton>
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
