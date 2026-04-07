"use client";

import { cn } from "@/lib/utils";
import type { CSSProperties, ReactNode } from "react";

interface DashboardPageShellProps {
  children: ReactNode;
  /**
   * Controls max-width presets.
   * - "default": 5xl container (dashboard standard)
   * - "wide": 7xl container (overview pages with charts)
   * - "narrow": 3xl container (chat/assistants)
   */
  variant?: "default" | "wide" | "narrow";
  className?: string;
  style?: CSSProperties;
}

const variantClasses: Record<NonNullable<DashboardPageShellProps["variant"]>, string> = {
  default: "max-w-5xl",
  wide: "max-w-7xl",
  narrow: "max-w-3xl",
};

export function DashboardPageShell({
  children,
  variant = "default",
  className,
  style,
}: DashboardPageShellProps) {
  return (
    <div
      style={style}
      className={cn(
        "mx-auto w-full px-4 py-10 sm:px-6",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </div>
  );
}
