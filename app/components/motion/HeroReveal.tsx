"use client";

import { motion, type Variants } from "framer-motion";

// Faqat hero mount bo'lganda bir marta ishlaydi (whileInView emas) —
// stagger farqi 0.15s, har bir element 0.5s ease-out bilan pastdan chiqadi.
const group: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "tween", duration: 0.5, ease: "easeOut" },
  },
};

export function HeroRevealGroup({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={group} initial="hidden" animate="show">
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
    <motion.div variants={item} className={className}>
      {children}
    </motion.div>
  );
}
