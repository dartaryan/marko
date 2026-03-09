"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export function useSubscriptionReturn() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const subscription = searchParams.get("subscription");
    if (!subscription) return;

    if (subscription === "success") {
      toast.success("התשלום התקבל בהצלחה! המנוי ייופעל תוך רגעים");
    } else if (subscription === "canceled") {
      toast.info("התשלום בוטל. ניתן לנסות שוב בכל עת");
    }

    // Clean up URL params
    const url = new URL(window.location.href);
    url.searchParams.delete("subscription");
    url.searchParams.delete("session_id");
    const cleanUrl = url.search ? url.pathname + url.search : url.pathname;
    router.replace(cleanUrl, { scroll: false });
  }, [searchParams, router]);
}
