"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { staggerGroup } from "./variants";

// box-shadow values below all use the same 4-part offset-x/offset-y/blur/spread
// shape so Framer Motion can interpolate between them instead of snapping.
const item: Variants = {
  hidden: { opacity: 0, y: 30, boxShadow: "0 0 0 0 rgba(0,0,0,0)" },
  show: {
    opacity: 1,
    y: 0,
    boxShadow: "0 1px 3px 0 rgba(0,0,0,0.15)",
    transition: { type: "tween", duration: 0.5, ease: "easeOut" },
  },
};

export function ScrollRevealGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  // reduceMotion is null on the server/first paint, so SSR always renders "hidden" —
  // the noscript fallback in layout.tsx keeps content visible if JS never runs.
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      variants={staggerGroup}
      initial={reduceMotion ? false : "hidden"}
      whileInView={reduceMotion ? undefined : "show"}
      animate={reduceMotion ? "show" : undefined}
      viewport={{ once: true, amount: 0.2 }}
      className={className}
      data-reveal
    >
      {children}
    </motion.div>
  );
}

export function ScrollRevealItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      variants={item}
      whileHover={
        reduceMotion ? undefined : { y: -4, boxShadow: "0 16px 32px -12px rgba(0,0,0,0.45)" }
      }
      transition={{ type: "tween", duration: reduceMotion ? 0 : 0.2, ease: "easeOut" }}
      className={className}
      data-reveal
    >
      {children}
    </motion.div>
  );
}
