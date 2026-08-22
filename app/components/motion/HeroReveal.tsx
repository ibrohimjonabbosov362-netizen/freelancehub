"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { staggerGroup } from "./variants";

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "tween", duration: 0.5, ease: "easeOut" },
  },
};

export function HeroRevealGroup({ children }: { children: React.ReactNode }) {
  // reduceMotion is null on the server/first paint, so SSR always renders "hidden" —
  // the noscript fallback in layout.tsx keeps content visible if JS never runs.
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      variants={staggerGroup}
      initial={reduceMotion ? false : "hidden"}
      animate="show"
      data-reveal
    >
      {children}
    </motion.div>
  );
}

export function HeroRevealItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={item} className={className} data-reveal>
      {children}
    </motion.div>
  );
}
