"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type GradientVariant = "gold" | "charcoal" | "mixed";

interface GradientBackgroundProps {
  children: ReactNode;
  variant?: GradientVariant;
  blur?: boolean;
  className?: string;
}

const gradientMap: Record<GradientVariant, string> = {
  gold:
    "bg-[radial-gradient(circle_at_20%_0%,oklch(0.78_0.12_80_/_0.15),transparent_50%),radial-gradient(circle_at_85%_10%,oklch(0.65_0.15_45_/_0.10),transparent_40%)]",
  charcoal:
    "bg-[radial-gradient(circle_at_20%_0%,oklch(0.18_0.008_60_/_0.2),transparent_50%),radial-gradient(circle_at_85%_10%,oklch(0.13_0.007_60_/_0.15),transparent_40%)]",
  mixed:
    "bg-[radial-gradient(circle_at_20%_0%,oklch(0.78_0.12_80_/_0.12),transparent_50%),radial-gradient(circle_at_85%_10%,oklch(0.30_0.08_260_/_0.10),transparent_50%)]",
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
          blur && "backdrop-blur-3xl saturate-150"
        )}
      />
      <div
        className={cn(
          "relative",
          blur && "bg-background/80"
        )}
      >
        {children}
      </div>
    </div>
  );
}
