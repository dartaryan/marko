"use client";

import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { AuthButton } from "./AuthButton";
import { UserMenu } from "./UserMenu";

export function AuthGate() {
  const { user, isLoading, isAuthenticated } = useCurrentUser();

  if (isLoading) {
    return (
      <div
        className="size-7 animate-pulse rounded-full bg-muted"
        data-testid="auth-loading"
      />
    );
  }

  if (!isAuthenticated) {
    return <AuthButton />;
  }

  return <UserMenu tier={user?.tier ?? "free"} />;
}
