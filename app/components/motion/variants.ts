import type { Variants } from "framer-motion";

export const staggerGroup: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};
