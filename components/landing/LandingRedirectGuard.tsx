"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export const SEEN_KEY = "marko-v2-seen-landing";

export function LandingRedirectGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [show, setShow] = useState(false);
  const decidedRef = useRef(false);

  useEffect(() => {
    if (decidedRef.current) return;
    decidedRef.current = true;

    try {
      const seen = localStorage.getItem(SEEN_KEY);
      const isHomeBypass = searchParams.get("home") === "true";

      if (seen && !isHomeBypass) {
        router.replace("/editor");
        return;
      }

      // Set flag — user is seeing landing now
      localStorage.setItem(SEEN_KEY, "true");
      setShow(true);

      // Clean up ?home=true param so bookmarks/shares don't carry it
      if (isHomeBypass) {
        const cleaned = new URLSearchParams(searchParams.toString());
        cleaned.delete("home");
        const qs = cleaned.toString();
        router.replace(qs ? `/?${qs}` : "/", { scroll: false });
      }
    } catch {
      // localStorage unavailable (Safari strict privacy, storage full, etc.)
      // Safe fallback: show landing page
      setShow(true);
    }
  }, [router, searchParams]);

  if (!show) return null;
  return <>{children}</>;
}
