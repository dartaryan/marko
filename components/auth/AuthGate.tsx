"use client";

import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import type { DocDirection } from "@/types/editor";
import { AuthButton } from "./AuthButton";
import { UserMenu } from "./UserMenu";
import { MobileUserSheet } from "./MobileUserSheet";

interface AuthGateProps {
  docDirection?: DocDirection;
  onDirectionChange?: (dir: DocDirection) => void;
  onLoadSample?: () => void;
  onClearEditor?: () => void;
  onEnterPresentation?: () => void;
}

export function AuthGate({
  docDirection,
  onDirectionChange,
  onLoadSample,
  onClearEditor,
  onEnterPresentation,
}: AuthGateProps = {}) {
  const { user, isLoading, isAuthenticated } = useCurrentUser();

  if (isLoading) {
    return (
      <div
        className="size-7 animate-pulse rounded-full bg-[rgba(110,231,183,0.15)]"
        data-testid="auth-loading"
      />
    );
  }

  const tier = user?.tier ?? "free";

  return (
    <>
      {/* Desktop: dropdown menus (hidden <768px via CSS) */}
      <div className="marko-user-desktop">
        {!isAuthenticated ? (
          <AuthButton />
        ) : (
          <UserMenu tier={tier} />
        )}
      </div>

      {/* Mobile: hamburger sheet (visible <768px via CSS) */}
      <div className="marko-user-mobile">
        <MobileUserSheet
          isAuthenticated={isAuthenticated}
          tier={tier}
          docDirection={docDirection}
          onDirectionChange={onDirectionChange}
          onLoadSample={onLoadSample}
          onClearEditor={onClearEditor}
          onEnterPresentation={onEnterPresentation}
        />
      </div>
    </>
  );
}
