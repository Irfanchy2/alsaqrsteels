"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Direction the content travels in from. Default "up". */
  from?: "up" | "down" | "left" | "right" | "none";
  /** Stagger index — multiplies into a small delay so sibling Reveals cascade. */
  index?: number;
  delay?: number;
  duration?: number;
  /** Re-play every time it scrolls into view instead of once. */
  repeat?: boolean;
  amount?: number;
};

const DISTANCE = 28;

function offsetFor(from: RevealProps["from"]) {
  switch (from) {
    case "down":
      return { y: -DISTANCE };
    case "left":
      return { x: DISTANCE };
    case "right":
      return { x: -DISTANCE };
    case "none":
      return {};
    case "up":
    default:
      return { y: DISTANCE };
  }
}

/**
 * Fades + slides content in once it scrolls into view. Renders children at
 * rest with no animation when the viewer has requested reduced motion.
 */
export default function Reveal({
  children,
  className,
  from = "up",
  index = 0,
  delay = 0,
  duration = 0.6,
  repeat = false,
  amount = 0.2,
}: RevealProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const variants: Variants = {
    hidden: { opacity: 0, ...offsetFor(from) },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration,
        delay: delay + index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: !repeat, amount }}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}
