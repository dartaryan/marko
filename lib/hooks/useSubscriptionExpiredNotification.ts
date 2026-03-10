"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "./useCurrentUser";
import { toast } from "sonner";

const NOTIFICATION_KEY_PREFIX = "marko_subscription_expired_seen_";

export function useSubscriptionExpiredNotification() {
  const { user } = useCurrentUser();
  const subscription = useQuery(api.subscriptions.getMySubscription);
  const notifiedRef = useRef(false);

  useEffect(() => {
    if (notifiedRef.current) return;
    if (!user || user.tier !== "free") return;
    if (subscription === undefined) return;
    if (!subscription || subscription.status !== "canceled") return;

    const key = `${NOTIFICATION_KEY_PREFIX}${subscription._id}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "true");
    } catch {
      // sessionStorage unavailable (SSR, private browsing)
    }

    notifiedRef.current = true;
    toast.info("המנוי שלך הסתיים. ניתן לשדרג מחדש בכל עת.", {
      duration: 8000,
    });
  }, [user, subscription]);
}
