"use client";

import { m, useReducedMotion } from "framer-motion";

export function ScrollReveal({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <m.div
      initial={shouldReduceMotion ? undefined : { opacity: 0, x: 40 }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, ease: "easeOut" }}
      style={{ overflowX: "clip" }}
    >
      {children}
    </m.div>
  );
}
