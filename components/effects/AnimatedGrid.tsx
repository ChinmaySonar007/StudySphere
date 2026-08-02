"use client";

export default function AnimatedGrid() {
  return (
    <div
      className="
      pointer-events-none
      absolute
      inset-0
      -z-10
      opacity-20
      [background-size:50px_50px]
      [background-image:
      linear-gradient(to_right,#ffffff10_1px,transparent_1px),
      linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)]
      "
    />
  );
}