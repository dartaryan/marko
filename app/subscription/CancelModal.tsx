"use client";

import { useState } from "react";
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

interface CancelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expirationDate: string;
  onCanceled: () => void;
}

export function CancelModal({
  open,
  onOpenChange,
  expirationDate,
  onCanceled,
}: CancelModalProps) {
  const [isCanceling, setIsCanceling] = useState(false);
  const cancelSubscription = useAction(
    api.subscriptionActions.cancelSubscription
  );

  const handleCancel = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsCanceling(true);
    try {
      await cancelSubscription();
      toast.success("המנוי בוטל בהצלחה");
      onOpenChange(false);
      onCanceled();
    } catch (err: unknown) {
      const errorData = (err as { data?: { message?: string } })?.data;
      toast.error(errorData?.message || "שגיאה בביטול המנוי");
    } finally {
      setIsCanceling(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent data-testid="cancel-subscription-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle>ביטול מנוי</AlertDialogTitle>
          <AlertDialogDescription>
            האם אתה בטוח שברצונך לבטל את המנוי? הגישה שלך תמשיך עד{" "}
            <strong>{expirationDate}</strong>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isCanceling}>חזור</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isCanceling}
            onClick={handleCancel}
            data-testid="confirm-cancel-button"
          >
            {isCanceling ? "מבטל..." : "בטל מנוי"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
