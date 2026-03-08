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
      >
        הרשמה / התחברות
      </Button>
    </SignInButton>
  );
}
