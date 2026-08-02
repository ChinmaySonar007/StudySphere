"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

export default function MouseGlow() {
  const mouseX = useMotionValue(-600);
  const mouseY = useMotionValue(-600);
  const [hasMoved, setHasMoved] = useState(false);

  // Layer 1 — outer ambient glow (slow, dreamy trailing)
  const x1 = useSpring(mouseX, { stiffness: 60, damping: 40 });
  const y1 = useSpring(mouseY, { stiffness: 60, damping: 40 });

  // Layer 2 — mid glow (medium response)
  const x2 = useSpring(mouseX, { stiffness: 120, damping: 28 });
  const y2 = useSpring(mouseY, { stiffness: 120, damping: 28 });

  // Layer 3 — core glow (snappy, follows cursor tightly)
  const x3 = useSpring(mouseX, { stiffness: 250, damping: 22 });
  const y3 = useSpring(mouseY, { stiffness: 250, damping: 22 });

  // Derive a subtle rotation from cursor velocity for the outer orb
  const rotate = useTransform(x2, (latest) => (latest % 360) * 0.05);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!hasMoved) setHasMoved(true);
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [mouseX, mouseY, hasMoved]);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[1] overflow-hidden"
      style={{ opacity: hasMoved ? 1 : 0, transition: "opacity 0.8s ease" }}
    >
      {/* Layer 1 — large ambient aurora (700px, heavy blur) */}
      <motion.div
        style={{
          x: useTransform(x1, (v) => v - 350),
          y: useTransform(y1, (v) => v - 350),
          rotate,
        }}
        className="
          absolute h-[700px] w-[700px] rounded-full
          bg-[radial-gradient(circle,rgba(99,102,241,0.30)_0%,rgba(139,92,246,0.20)_35%,rgba(6,182,212,0.15)_70%,transparent_100%)]
          blur-[180px]
        "
      />

      {/* Layer 2 — mid orb (450px, vivid gradient) */}
      <motion.div
        style={{
          x: useTransform(x2, (v) => v - 225),
          y: useTransform(y2, (v) => v - 225),
        }}
        className="
          absolute h-[450px] w-[450px] rounded-full
          bg-[radial-gradient(circle,rgba(129,140,248,0.35)_0%,rgba(167,139,250,0.25)_30%,rgba(34,211,238,0.18)_65%,transparent_100%)]
          blur-[100px]
        "
      />

      {/* Layer 3 — bright core (250px, punchy) */}
      <motion.div
        style={{
          x: useTransform(x3, (v) => v - 125),
          y: useTransform(y3, (v) => v - 125),
        }}
        className="
          absolute h-[250px] w-[250px] rounded-full
          bg-[radial-gradient(circle,rgba(99,102,241,0.40)_0%,rgba(129,140,248,0.28)_40%,rgba(139,92,246,0.12)_70%,transparent_100%)]
          blur-[60px]
        "
      />

      {/* Layer 4 — hot center dot (100px, saturated) */}
      <motion.div
        style={{
          x: useTransform(x3, (v) => v - 50),
          y: useTransform(y3, (v) => v - 50),
        }}
        className="
          absolute h-[100px] w-[100px] rounded-full
          bg-[radial-gradient(circle,rgba(79,70,229,0.50)_0%,rgba(99,102,241,0.30)_50%,transparent_100%)]
          blur-[30px]
        "
      />

      {/* Pulsating ring — breathes life into the glow */}
      <motion.div
        style={{
          x: useTransform(x2, (v) => v - 200),
          y: useTransform(y2, (v) => v - 200),
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.2, 0.35, 0.2],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          absolute h-[400px] w-[400px] rounded-full
          border border-indigo-400/20
          bg-[radial-gradient(circle,transparent_55%,rgba(99,102,241,0.15)_100%)]
          blur-[30px]
        "
      />
    </div>
  );
}