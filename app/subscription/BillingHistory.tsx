"use client";

import { useState, useEffect, useCallback } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Invoice {
  id: string;
  date: number;
  amountPaid: number;
  currency: string;
  status: string;
  paymentIntent: string | null;
  receiptPdfUrl: string | null;
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
}

// Stripe invoice status "open" = payment pending/failed (maps to AC#6 "past_due" concept).
// Stripe invoice status "uncollectible" = payment permanently failed.
function isUnpaid(status: string): boolean {
  return status === "open" || status === "uncollectible";
}

function getStatusLabel(status: string): string {
  if (status === "paid") return "שולם";
  if (status === "open") return "ממתין לתשלום";
  if (status === "uncollectible") return "תשלום נכשל";
  return status;
}

export function BillingHistory() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const fetchInvoices = useAction(api.subscriptionActions.listInvoices);
  const retryPaymentAction = useAction(api.subscriptionActions.retryPayment);

  const loadInvoices = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await fetchInvoices();
      setInvoices(result.invoices);
    } catch (err: unknown) {
      const errorData = (err as { data?: { message?: string } })?.data;
      toast.error(errorData?.message || "שגיאה בטעינת היסטוריית חיובים");
    } finally {
      setIsLoading(false);
    }
  }, [fetchInvoices]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const handleRetry = async (invoiceId: string) => {
    setRetryingId(invoiceId);
    try {
      const result = await retryPaymentAction({ invoiceId });
      if (result.success) {
        toast.success("התשלום בוצע בהצלחה");
        loadInvoices();
      } else {
        toast.error("התשלום נכשל. נסה שוב מאוחר יותר.");
      }
    } catch (err: unknown) {
      const errorData = (err as { data?: { message?: string } })?.data;
      toast.error(errorData?.message || "שגיאה בניסיון חוזר לתשלום");
    } finally {
      setRetryingId(null);
    }
  };

  if (isLoading) {
    return (
      <section className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">היסטוריית חיובים</h2>
        <div className="animate-pulse space-y-3">
          <div className="h-10 bg-muted rounded" />
          <div className="h-10 bg-muted rounded" />
          <div className="h-10 bg-muted rounded" />
        </div>
      </section>
    );
  }

  if (invoices.length === 0) {
    return (
      <section
        className="rounded-lg border bg-card p-6"
        data-testid="billing-history"
      >
        <h2 className="text-lg font-semibold mb-4">היסטוריית חיובים</h2>
        <p className="text-sm text-muted-foreground">אין חיובים עדיין.</p>
      </section>
    );
  }

  return (
    <section
      className="rounded-lg border bg-card p-6"
      data-testid="billing-history"
    >
      <h2 className="text-lg font-semibold mb-4">היסטוריית חיובים</h2>
      <div className="space-y-3">
        {invoices.map((inv) => {
          const date = new Date(inv.date).toLocaleDateString("he-IL", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
          const amount = formatCurrency(inv.amountPaid, inv.currency);
          const unpaid = isUnpaid(inv.status);
          const isPaid = inv.status === "paid";
          const canRetry = inv.status === "open";

          return (
            <div
              key={inv.id}
              className={`flex items-center justify-between p-3 rounded text-sm ${
                unpaid
                  ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                  : "bg-muted/50"
              }`}
              data-testid={`invoice-${inv.id}`}
            >
              <div className="flex items-center gap-3">
                <span>{date}</span>
                <span className="font-medium">{amount}</span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    isPaid
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                      : unpaid
                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {getStatusLabel(inv.status)}
                </span>

                {isPaid && inv.receiptPdfUrl && (
                  <a
                    href={inv.receiptPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                    aria-label="צפה בקבלה"
                  >
                    קבלה
                  </a>
                )}

                {canRetry && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRetry(inv.id)}
                    disabled={retryingId === inv.id}
                    aria-label="נסה שוב לשלם"
                    data-testid={`retry-payment-${inv.id}`}
                  >
                    {retryingId === inv.id ? "מעבד..." : "נסה שוב"}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
