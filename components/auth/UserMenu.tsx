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
            colorPrimary: "hsl(var(--primary))",
          },
          elements: {
            avatarBox: "size-7",
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
          className="absolute -bottom-0.5 -end-0.5 size-2.5 rounded-full bg-yellow-500 border-2 border-background"
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
