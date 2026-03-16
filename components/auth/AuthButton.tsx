"use client";

import { SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function AuthButton() {
  return (
    <SignInButton mode="modal">
      <Button
        variant="outline"
        size="sm"
        data-testid="auth-button"
        className="border-[rgba(110,231,183,0.3)] text-[#a7f3d0] hover:border-[var(--color-emerald-500)] hover:bg-[var(--color-emerald-500)] hover:text-white"
      >
        הרשמה / התחברות
      </Button>
    </SignInButton>
  );
}
