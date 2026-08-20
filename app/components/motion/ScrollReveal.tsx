"use client";

import { motion, type Variants } from "framer-motion";

// viewport: { once: true } — faqat birinchi ko'rinishda ishlaydi, qayta emas.
const group: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 30, boxShadow: "0 0 0 rgba(0,0,0,0)" },
  show: {
    opacity: 1,
    y: 0,
    boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
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
  return (
    <motion.div
      variants={group}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      className={className}
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
  return (
    <motion.div
      variants={item}
      whileHover={{
        y: -4,
        boxShadow: "0 16px 32px -12px rgba(0,0,0,0.45)",
      }}
      transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
