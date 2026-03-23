"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import {
  Menu,
  FileText,
  Settings,
  Phone,
  Bug,
  LogOut,
  LogIn,
  CreditCard,
  Trash2,
  User,
  Maximize,
  Type,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { UserTier } from "@/types/user";
import type { DocDirection } from "@/types/editor";
import { DeleteAccountDialog } from "./DeleteAccountDialog";
import { toast } from "sonner";

interface MobileUserSheetProps {
  isAuthenticated: boolean;
  tier: UserTier;
  docDirection?: DocDirection;
  onDirectionChange?: (dir: DocDirection) => void;
  onLoadSample?: () => void;
  onClearEditor?: () => void;
  onEnterPresentation?: () => void;
}

interface SheetMenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  testId?: string;
}

function SheetMenuItem({ icon, label, onClick, testId }: SheetMenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className="marko-sheet-menu-item flex w-full items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-start text-sm text-[var(--color-emerald-50)] transition-colors hover:bg-[rgba(16,185,129,0.2)] hover:text-white"
    >
      <span>{label}</span>
      <span className="ms-auto">{icon}</span>
    </button>
  );
}

function SheetSeparator() {
  return <div className="mx-2 my-1 h-px bg-[rgba(167,243,208,0.15)]" />;
}

const DIRECTION_LABELS: Record<DocDirection, string> = {
  auto: "אוטומטי (BiDi)",
  rtl: "ימין לשמאל",
  ltr: "שמאל לימין",
};
const DIRECTION_CYCLE: DocDirection[] = ["auto", "rtl", "ltr"];

export function MobileUserSheet({
  isAuthenticated,
  tier,
  docDirection,
  onDirectionChange,
  onLoadSample,
  onClearEditor,
  onEnterPresentation,
}: MobileUserSheetProps) {
  const [open, setOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [imgError, setImgError] = useState(false);
  const router = useRouter();
  const { user } = useUser();
  const { signOut, openSignIn } = useClerk();

  const navigate = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  const handleSignOut = useCallback(async () => {
    setOpen(false);
    try {
      await signOut();
    } catch {
      toast.error("שגיאה בהתנתקות. נסה לרענן את הדף.");
    }
  }, [signOut]);

  const handleSignIn = useCallback(async () => {
    setOpen(false);
    try {
      await openSignIn();
    } catch {
      toast.error("שגיאה בטעינת החיבור. נסה לרענן את הדף.");
    }
  }, [openSignIn]);

  const initials = user?.firstName
    ? user.firstName.charAt(0).toUpperCase()
    : user?.primaryEmailAddress?.emailAddress?.charAt(0).toUpperCase() ?? "?";

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            aria-label="תפריט ניווט"
            title="תפריט ניווט"
            className="marko-header-btn marko-mobile-menu-trigger"
            data-testid="mobile-menu-trigger"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
        </SheetTrigger>

        <SheetContent
          side="right"
          className="marko-mobile-sheet w-[280px] border-s-[rgba(167,243,208,0.15)]"
        >
          <SheetHeader className="border-b border-[rgba(167,243,208,0.15)] pb-3">
            <SheetTitle className="flex items-center gap-3 text-[var(--color-emerald-50)]">
              {isAuthenticated ? (
                <>
                  {user?.imageUrl && !imgError ? (
                    <img
                      src={user.imageUrl}
                      alt=""
                      className="size-8 rounded-full object-cover"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <span className="flex size-8 items-center justify-center rounded-full bg-[var(--color-emerald-500)] text-[13px] font-bold text-emerald-900">
                      {initials}
                    </span>
                  )}
                  <span className="text-sm font-medium">
                    {user?.firstName ?? user?.primaryEmailAddress?.emailAddress ?? "משתמש"}
                  </span>
                </>
              ) : (
                <>
                  <span className="flex size-8 items-center justify-center rounded-full border border-[rgba(110,231,183,0.3)] text-[var(--color-emerald-300)]">
                    <User className="size-4" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-medium">אורח</span>
                </>
              )}
            </SheetTitle>
          </SheetHeader>

          <nav className="flex flex-col gap-0.5 p-2" aria-label="תפריט ניווט">
            {isAuthenticated && (
              <SheetMenuItem
                icon={<FileText className="size-4" aria-hidden="true" />}
                label="המסמכים שלי"
                onClick={() => {
                  setOpen(false);
                  toast("בקרוב — ניהול מסמכים יגיע בגרסה הבאה");
                }}
                testId="mobile-menu-documents"
              />
            )}

            <SheetMenuItem
              icon={<Settings className="size-4" aria-hidden="true" />}
              label="הגדרות"
              onClick={() => navigate("/settings")}
              testId="mobile-menu-settings"
            />

            <SheetMenuItem
              icon={<Phone className="size-4" aria-hidden="true" />}
              label="צור קשר"
              onClick={() => navigate("/contact")}
              testId="mobile-menu-contact"
            />

            <SheetMenuItem
              icon={<Bug className="size-4" aria-hidden="true" />}
              label="דווח על בעיה"
              onClick={() => navigate("/report-bug")}
              testId="mobile-menu-report-bug"
            />

            {isAuthenticated && tier === "paid" && (
              <SheetMenuItem
                icon={<CreditCard className="size-4" aria-hidden="true" />}
                label="ניהול מנוי"
                onClick={() => navigate("/subscription")}
                testId="mobile-menu-subscription"
              />
            )}

            {/* Overflow menu items (editor actions) */}
            {(onLoadSample || onClearEditor || onEnterPresentation) && (
              <>
                <SheetSeparator />
                {onLoadSample && (
                  <SheetMenuItem
                    icon={<FileText className="size-4" aria-hidden="true" />}
                    label="מסמך לדוגמה"
                    onClick={() => { setOpen(false); onLoadSample(); }}
                    testId="mobile-menu-load-sample"
                  />
                )}
                {onClearEditor && (
                  <SheetMenuItem
                    icon={<Trash2 className="size-4" aria-hidden="true" />}
                    label="נקה עורך"
                    onClick={() => { setOpen(false); onClearEditor(); }}
                    testId="mobile-menu-clear-editor"
                  />
                )}
                {onEnterPresentation && (
                  <SheetMenuItem
                    icon={<Maximize className="size-4" aria-hidden="true" />}
                    label="מצגת"
                    onClick={() => { setOpen(false); onEnterPresentation(); }}
                    testId="mobile-menu-presentation"
                  />
                )}
                {docDirection && onDirectionChange && (
                  <SheetMenuItem
                    icon={<Type className="size-4" aria-hidden="true" />}
                    label={`כיוון: ${DIRECTION_LABELS[docDirection]}`}
                    onClick={() => {
                      const idx = DIRECTION_CYCLE.indexOf(docDirection);
                      const next = DIRECTION_CYCLE[(idx + 1) % DIRECTION_CYCLE.length];
                      onDirectionChange(next);
                    }}
                    testId="mobile-menu-direction"
                  />
                )}
              </>
            )}

            <SheetSeparator />

            {isAuthenticated ? (
              <>
                <SheetMenuItem
                  icon={<Trash2 className="size-4" aria-hidden="true" />}
                  label="מחיקת חשבון"
                  onClick={() => {
                    setOpen(false);
                    setShowDeleteDialog(true);
                  }}
                  testId="mobile-menu-delete-account"
                />
                <SheetMenuItem
                  icon={<LogOut className="size-4" aria-hidden="true" />}
                  label="התנתק"
                  onClick={handleSignOut}
                  testId="mobile-menu-signout"
                />
              </>
            ) : (
              <SheetMenuItem
                icon={<LogIn className="size-4" aria-hidden="true" />}
                label="התחבר"
                onClick={handleSignIn}
                testId="mobile-menu-signin"
              />
            )}
          </nav>
        </SheetContent>
      </Sheet>

      {isAuthenticated && (
        <DeleteAccountDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
        />
      )}
    </>
  );
}
