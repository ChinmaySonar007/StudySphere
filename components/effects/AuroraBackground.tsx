"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AuroraBackgroundProps {
  children: ReactNode;
}

export default function AuroraBackground({
  children,
}: AuroraBackgroundProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* Ambient Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Blob 1 */}
        <motion.div
          animate={{
            x: [0, 80, -40, 0],
            y: [0, -60, 30, 0],
            scale: [1, 1.08, 1.05, 1],
          }}
          transition={{
            duration: 24,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -left-40 -top-40
            h-[700px] w-[700px]
            rounded-full
            bg-sky-200/30
            blur-[220px]"
        />

        {/* Blob 2 */}
        <motion.div
          animate={{
            x: [0, -60, 40, 0],
            y: [0, 70, -50, 0],
            scale: [1.05, 1, 1.08, 1],
          }}
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -right-32 top-10
            h-[650px] w-[650px]
            rounded-full
            bg-indigo-200/25
            blur-[220px]"
        />

        {/* Blob 3 */}
        <motion.div
          animate={{
            x: [0, 40, -40, 0],
            y: [0, -40, 60, 0],
            scale: [1, 1.05, 1, 1.08],
          }}
          transition={{
            duration: 26,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-[-180px] left-1/3
            h-[750px] w-[750px]
            rounded-full
            bg-cyan-100/30
            blur-[240px]"
        />

        {/* Soft white center glow */}
        <div
          className="absolute left-1/2 top-1/2
            h-[900px] w-[900px]
            -translate-x-1/2 -translate-y-1/2
            rounded-full
            bg-white/40
            blur-[260px]"
        />
      </div>

      {/* Page Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}