"use client";

import React, { useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

const CONFIRMATION_WORD = "מחק";

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteAccountDialog({
  open,
  onOpenChange,
}: DeleteAccountDialogProps) {
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const { signOut } = useClerk();
  const deleteMyAccount = useAction(api.users.deleteMyAccount);

  const isConfirmed = confirmText === CONFIRMATION_WORD;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent Radix AlertDialogAction from auto-closing
    setIsDeleting(true);
    try {
      await deleteMyAccount();
      await signOut();
      toast.success("החשבון נמחק בהצלחה");
      onOpenChange(false);
    } catch {
      toast.error("שגיאה במחיקת החשבון. נסה שוב.");
    } finally {
      setIsDeleting(false);
      setConfirmText("");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        dir="rtl"
        data-testid="delete-account-dialog"
        className="bg-surface shadow-[var(--shadow-4)] dark:border-[var(--border)]"
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[18px] font-bold text-foreground">
            מחיקת חשבון
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[14px] text-foreground-muted">
            פעולה זו תמחק את החשבון שלך ואת כל הנתונים לצמיתות. לא ניתן לבטל
            פעולה זו.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-4">
          <label htmlFor="delete-confirm" className="text-[14px] text-foreground-muted">
            הקלד <span className="font-semibold text-destructive">{CONFIRMATION_WORD}</span> לאישור:
          </label>
          <Input
            id="delete-confirm"
            data-testid="delete-confirm-input"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            dir="rtl"
            disabled={isDeleting}
            className="border-border-strong focus-visible:border-destructive focus-visible:ring-[3px] focus-visible:ring-destructive/20"
          />
        </div>
        <AlertDialogFooter className="border-t border-border-subtle pt-4">
          <AlertDialogCancel disabled={isDeleting}>ביטול</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={!isConfirmed || isDeleting}
            onClick={handleDelete}
            data-testid="delete-confirm-button"
          >
            {isDeleting ? "מוחק..." : "מחיקת חשבון"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
