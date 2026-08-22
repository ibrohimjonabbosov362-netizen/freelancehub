"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

const MotionLink = motion.create(Link);

/** Asosiy CTA tugmalar uchun: hover'da sal kattalashadi, bosilganda sal kichrayadi va pastga suriladi. */
export default function CtaLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <MotionLink
      href={href}
      className={className}
      whileHover={reduceMotion ? undefined : { scale: 1.03 }}
      whileTap={reduceMotion ? undefined : { scale: 0.97, y: 1 }}
      transition={{ type: "tween", duration: reduceMotion ? 0 : 0.15, ease: "easeOut" }}
    >
      {children}
    </MotionLink>
  );
}
