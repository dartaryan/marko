"use client";

import { UserButton } from "@clerk/nextjs";
import type { UserTier } from "@/types/user";

interface UserMenuProps {
  tier: UserTier;
}

export function UserMenu({ tier }: UserMenuProps) {
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
      />
      {tier === "paid" && (
        <span
          className="absolute -bottom-0.5 -end-0.5 size-2.5 rounded-full bg-yellow-500 border-2 border-background"
          role="img"
          aria-label="מנוי פרימיום"
          data-testid="paid-badge"
        />
      )}
    </div>
  );
}
