"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-9 w-9 rounded-full border border-border bg-muted animate-pulse" />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-foreground/60 transition-all hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <Sun
        className="h-4 w-4 transition-all scale-100 rotate-0 dark:scale-0 dark:-rotate-90 absolute"
        aria-hidden
      />
      <Moon
        className="h-4 w-4 transition-all scale-0 rotate-90 dark:scale-100 dark:rotate-0 absolute"
        aria-hidden
      />
    </button>
  );
}
