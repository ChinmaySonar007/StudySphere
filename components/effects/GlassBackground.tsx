"use client";

import { ReactNode } from "react";

export default function GlassBackground({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">

      {/* Soft Blob */}
      <div className="absolute left-20 top-20 h-[500px] w-[500px] rounded-full bg-sky-200/30 blur-[160px]" />

      {/* Soft Blob */}
      <div className="absolute right-10 top-40 h-[450px] w-[450px] rounded-full bg-indigo-200/20 blur-[160px]" />

      {/* Soft Blob */}
      <div className="absolute bottom-10 left-1/2 h-[400px] w-[400px] rounded-full bg-cyan-100/30 blur-[160px]" />

      {children}
    </div>
  );
}