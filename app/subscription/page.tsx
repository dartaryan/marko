"use client";

import { useState, useEffect, useCallback } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { BillingHistory } from "./BillingHistory";
import { CancelModal } from "./CancelModal";

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
}

interface SubscriptionInfo {
  status: string;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  paymentMethodSummary: string | null;
  nextBillingAmount: number | null;
  currency: string;
}

export default function SubscriptionPage() {
  const { user, isLoading: isUserLoading, isAuthenticated } = useCurrentUser();
  const router = useRouter();
  const getDetails = useAction(api.subscriptionActions.getSubscriptionDetails);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await getDetails();
      setSubscription(result.subscription);
    } catch (err: unknown) {
      const errorData = (err as { data?: { message?: string } })?.data;
      toast.error(errorData?.message || "שגיאה בטעינת פרטי המנוי");
    } finally {
      setIsLoading(false);
    }
  }, [getDetails]);

  useEffect(() => {
    if (isUserLoading) return;
    if (!isAuthenticated) {
      router.replace("/sign-in");
      return;
    }
    if (user && user.tier !== "paid") {
      router.replace("/editor");
      return;
    }
  }, [user, isUserLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user && user.tier === "paid") {
      loadDetails();
    }
  }, [user, loadDetails]);

  const handleCanceled = useCallback(() => {
    loadDetails();
    setRefreshKey((k) => k + 1);
  }, [loadDetails]);

  if (isUserLoading || !user || user.tier !== "paid") {
    return (
      <main dir="rtl" className="min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-40 bg-muted rounded" />
          </div>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main dir="rtl" className="min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">המנוי שלך</h1>
          <div className="animate-pulse space-y-4">
            <div className="h-40 bg-muted rounded" />
            <div className="h-60 bg-muted rounded" />
          </div>
        </div>
      </main>
    );
  }

  if (!subscription) {
    return (
      <main dir="rtl" className="min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">אין מנוי פעיל</h1>
          <p className="text-muted-foreground mb-4">
            לא נמצא מנוי פעיל בחשבון שלך.
          </p>
          <Button
            onClick={() => router.push("/editor")}
            aria-label="חזור לעורך"
          >
            חזור לעורך
          </Button>
        </div>
      </main>
    );
  }

  const renewalDate = new Date(
    subscription.currentPeriodEnd
  ).toLocaleDateString("he-IL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const amountFormatted =
    subscription.nextBillingAmount != null
      ? formatCurrency(subscription.nextBillingAmount, subscription.currency)
      : null;

  return (
    <main dir="rtl" className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">המנוי שלך</h1>

        <section
          className="rounded-lg border bg-card p-6 mb-6"
          data-testid="subscription-details"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Marko Pro</h2>
            <span
              className={`text-sm px-2 py-1 rounded ${
                subscription.cancelAtPeriodEnd
                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200"
                  : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
              }`}
              data-testid="subscription-status-badge"
            >
              {subscription.cancelAtPeriodEnd ? "בביטול" : "פעיל"}
            </span>
          </div>

          <dl className="grid gap-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">תאריך חידוש</dt>
              <dd data-testid="renewal-date">{renewalDate}</dd>
            </div>

            {subscription.paymentMethodSummary && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">שיטת תשלום</dt>
                <dd dir="ltr" data-testid="payment-method">
                  {subscription.paymentMethodSummary}
                </dd>
              </div>
            )}

            {amountFormatted && !subscription.cancelAtPeriodEnd && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">חיוב הבא</dt>
                <dd data-testid="next-billing-amount">{amountFormatted}</dd>
              </div>
            )}
          </dl>

          {subscription.cancelAtPeriodEnd && (
            <div
              className="mt-4 p-3 rounded bg-yellow-50 dark:bg-yellow-900/20 text-sm"
              data-testid="cancellation-notice"
            >
              <p>
                המנוי שלך יבוטל בתאריך <strong>{renewalDate}</strong>
              </p>
              <p className="text-muted-foreground mt-1">
                הגישה שלך תפוג בתאריך <strong>{renewalDate}</strong>
              </p>
            </div>
          )}

          {!subscription.cancelAtPeriodEnd && (
            <div className="mt-6">
              <Button
                variant="destructive"
                onClick={() => setShowCancelModal(true)}
                aria-label="בטל מנוי"
                data-testid="cancel-subscription-button"
              >
                בטל מנוי
              </Button>
            </div>
          )}
        </section>

        <BillingHistory key={refreshKey} />

        <CancelModal
          open={showCancelModal}
          onOpenChange={setShowCancelModal}
          expirationDate={renewalDate}
          onCanceled={handleCanceled}
        />

        <div className="mt-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/editor")}
            aria-label="חזור לעורך"
          >
            → חזור לעורך
          </Button>
        </div>
      </div>
    </main>
  );
}
