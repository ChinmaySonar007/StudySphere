"use client";

import { type ReactNode, useRef } from "react";
import {
  motion,
  useInView,
  type Variants,
  type Transition,
} from "framer-motion";

/* ──────────────────── Animation presets ──────────────────── */

const presets = {
  "fade-up": {
    hidden: { opacity: 0, y: 48 },
    visible: { opacity: 1, y: 0 },
  },
  "fade-down": {
    hidden: { opacity: 0, y: -48 },
    visible: { opacity: 1, y: 0 },
  },
  "fade-left": {
    hidden: { opacity: 0, x: -48 },
    visible: { opacity: 1, x: 0 },
  },
  "fade-right": {
    hidden: { opacity: 0, x: 48 },
    visible: { opacity: 1, x: 0 },
  },
  zoom: {
    hidden: { opacity: 0, scale: 0.85 },
    visible: { opacity: 1, scale: 1 },
  },
  blur: {
    hidden: { opacity: 0, filter: "blur(12px)" },
    visible: { opacity: 1, filter: "blur(0px)" },
  },
} as const satisfies Record<string, Variants>;

export type ScrollRevealPreset = keyof typeof presets;

/* ──────────────────── Component ──────────────────── */

interface ScrollRevealProps {
  children: ReactNode;
  /** Animation type — defaults to "fade-up" */
  variant?: ScrollRevealPreset;
  /** Extra delay in seconds (added on top of stagger) */
  delay?: number;
  /** Animation duration in seconds */
  duration?: number;
  /** InView threshold — 0 to 1 */
  threshold?: number;
  /** Re-trigger animation when element scrolls back out */
  once?: boolean;
  /** Wrapping element */
  as?: "div" | "section" | "article" | "header" | "footer" | "span";
  className?: string;
}

export default function ScrollReveal({
  children,
  variant = "fade-up",
  delay = 0,
  duration = 0.7,
  threshold = 0.15,
  once = true,
  as = "div",
  className,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: threshold });

  const MotionTag = motion.create(as);

  const transition: Transition = {
    duration,
    delay,
    ease: [0.25, 0.1, 0.25, 1], // cubic-bezier ease-out
  };

  return (
    <MotionTag
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={presets[variant]}
      transition={transition}
      className={className}
    >
      {children}
    </MotionTag>
  );
}

/* ──────────── Staggered Container + Item ──────────── */

interface StaggerContainerProps {
  children: ReactNode;
  /** Delay between each child */
  stagger?: number;
  /** Base delay for the group */
  delay?: number;
  /** InView threshold */
  threshold?: number;
  once?: boolean;
  className?: string;
}

const containerVariants: Variants = {
  hidden: {},
  visible: (custom: { stagger: number; delay: number }) => ({
    transition: {
      staggerChildren: custom.stagger,
      delayChildren: custom.delay,
    },
  }),
};

export function StaggerContainer({
  children,
  stagger = 0.12,
  delay = 0,
  threshold = 0.1,
  once = true,
  className,
}: StaggerContainerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: threshold });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      custom={{ stagger, delay }}
      variants={containerVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ──────────── Stagger Item ──────────── */

interface StaggerItemProps {
  children: ReactNode;
  variant?: ScrollRevealPreset;
  duration?: number;
  className?: string;
}

export function StaggerItem({
  children,
  variant = "fade-up",
  duration = 0.6,
  className,
}: StaggerItemProps) {
  return (
    <motion.div
      variants={presets[variant]}
      transition={{ duration, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ──────────── Counter Animation ──────────── */

interface CountUpProps {
  value: string;
  className?: string;
}

export function CountUp({ value, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  // Extract the numeric part and suffix (e.g. "1000+" → num=1000, suffix="+")
  const match = value.match(/^([\d,.]+)(.*)$/);
  const numStr = match?.[1]?.replace(/,/g, "") ?? "0";
  const suffix = match?.[2] ?? "";
  const target = parseFloat(numStr);

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={
        isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }
      }
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
    >
      {isInView ? (
        <Counter target={target} suffix={suffix} />
      ) : (
        `0${suffix}`
      )}
    </motion.span>
  );
}

/* Animated number counter */
function Counter({ target, suffix }: { target: number; suffix: string }) {
  return (
    <motion.span>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <InnerCounter target={target} />
        {suffix}
      </motion.span>
    </motion.span>
  );
}

function InnerCounter({ target }: { target: number }) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  // Use a spring-driven motionValue to animate from 0 → target
  return (
    <motion.span
      ref={nodeRef}
      initial={{ "--counter": 0 } as Record<string, number>}
      animate={{ "--counter": target } as Record<string, number>}
      transition={{ duration: 1.8, ease: "easeOut" }}
      onUpdate={(latest) => {
        if (!nodeRef.current) return;
        const val = latest["--counter"] as number | undefined;
        if (val !== undefined) {
          nodeRef.current.textContent =
            Math.round(val).toLocaleString();
          if (Math.round(val) === target) hasAnimated.current = true;
        }
      }}
    >
      0
    </motion.span>
  );
}
