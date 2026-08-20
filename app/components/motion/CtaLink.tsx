"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const MotionLink = motion.create(Link);

/** Asosiy CTA tugmalar uchun: hover'da sal kattalashadi, bosilganda sal kichrayadi. */
export default function CtaLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <MotionLink
      href={href}
      className={className}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "tween", duration: 0.15, ease: "easeOut" }}
    >
      {children}
    </MotionLink>
  );
}
