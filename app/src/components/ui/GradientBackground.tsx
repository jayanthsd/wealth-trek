"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type GradientVariant = "purple" | "emerald" | "mixed";

interface GradientBackgroundProps {
  children: ReactNode;
  variant?: GradientVariant;
  blur?: boolean;
  className?: string;
}

const gradientMap: Record<GradientVariant, string> = {
  purple:
    "bg-[radial-gradient(circle_at_20%_0%,rgba(139,92,246,0.18),transparent_42%),radial-gradient(circle_at_85%_10%,rgba(99,102,241,0.12),transparent_36%)]",
  emerald:
    "bg-[radial-gradient(circle_at_20%_0%,rgba(16,185,129,0.16),transparent_42%),radial-gradient(circle_at_85%_10%,rgba(20,184,166,0.10),transparent_36%)]",
  mixed:
    "bg-[radial-gradient(circle_at_20%_0%,rgba(139,92,246,0.16),transparent_42%),radial-gradient(circle_at_85%_10%,rgba(16,185,129,0.10),transparent_36%)]",
};

export function GradientBackground({
  children,
  variant = "mixed",
  blur = true,
  className,
}: GradientBackgroundProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div
        className={cn(
          "pointer-events-none absolute inset-0",
          gradientMap[variant],
          blur && "backdrop-blur-md"
        )}
      />
      <div
        className={cn(
          "relative",
          blur && "bg-white/70 dark:bg-gray-900/70"
        )}
      >
        {children}
      </div>
    </div>
  );
}
