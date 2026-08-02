"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <button
      onClick={() =>
        setTheme(theme === "dark" ? "light" : "dark")
      }
      className="
      h-10
      w-10
      rounded-full
      border
      border-white/10
      bg-white/5
      backdrop-blur-xl
      transition
      hover:scale-110
      "
    >
      {theme === "dark" ? (
        <Sun className="mx-auto h-5 w-5" />
      ) : (
        <Moon className="mx-auto h-5 w-5" />
      )}
    </button>
  );
}