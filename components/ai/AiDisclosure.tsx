"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface AiDisclosureProps {
  open: boolean;
  onAccept: () => void;
  onCancel: () => void;
}

export function AiDisclosure({ open, onAccept, onCancel }: AiDisclosureProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onCancel();
      }}
    >
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>גילוי נאות — שימוש ב-AI</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="flex flex-col gap-3">
              <p>
                בעת שימוש בפעולות AI, תוכן המסמך שלך נשלח לשרתי Anthropic
                לעיבוד.
              </p>
              <p>
                Anthropic לא משתמשת בתוכן שנשלח דרך ה-API שלה לאימון מודלים.
              </p>
              <p>
                Marko לא שומרת את תוכן המסמך שלך בשרתים שלנו — הוא נשלח לעיבוד
                בלבד ולא נשמר.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel
            onClick={(e) => {
              e.preventDefault();
              onCancel();
            }}
            aria-label="ביטול"
          >
            ביטול
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onAccept();
            }}
            aria-label="הבנתי, המשך"
          >
            הבנתי, המשך
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
