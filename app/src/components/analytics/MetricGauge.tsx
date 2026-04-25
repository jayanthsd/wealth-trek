"use client";

import { cn } from "@/lib/utils";
import type { InsightItem } from "@/types";

interface MetricGaugeProps {
  value: number;
  benchmark: NonNullable<InsightItem["benchmark"]>;
  label?: string;
}

/**
 * Generalized horizontal gauge that works for both:
 *  - ratios (0..max), where higher is worse (default)
 *  - inverted metrics, where lower is worse
 */
export function MetricGauge({ value, benchmark, label }: MetricGaugeProps) {
  const { warningAt, criticalAt, inverted = false, max = 1 } = benchmark;
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);

  const isCritical = inverted ? value <= criticalAt : value >= criticalAt;
  const isWarning =
    !isCritical && (inverted ? value <= warningAt : value >= warningAt);

  const color = isCritical ? "bg-destructive" : isWarning ? "bg-amber-500" : "bg-success";

  // Display value: if max is 1 treat as percentage, else raw number
  const displayValue =
    max <= 1 ? `${(value * 100).toFixed(0)}%` : value.toFixed(1);

  const warnPct = Math.min((warningAt / max) * 100, 100);
  const critPct = Math.min((criticalAt / max) * 100, 100);

  return (
    <div className="mt-3 space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {label}
          </span>
          <span className="text-xs font-semibold tabular-nums text-foreground/60">
            {displayValue}
          </span>
        </div>
      )}
      <div className="relative h-1.5 w-full rounded-full bg-muted border border-border overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="relative h-3 text-[9px] text-muted-foreground/70 tabular-nums">
        <span className="absolute left-0">0</span>
        <span
          className="absolute -translate-x-1/2 text-amber-500/70"
          style={{ left: `${inverted ? critPct : warnPct}%` }}
        >
          {inverted ? `${(criticalAt * (max <= 1 ? 100 : 1)).toFixed(0)}${max <= 1 ? "%" : ""}` : `${(warningAt * (max <= 1 ? 100 : 1)).toFixed(0)}${max <= 1 ? "%" : ""}`}
        </span>
        <span
          className="absolute -translate-x-1/2 text-destructive/70"
          style={{ left: `${inverted ? warnPct : critPct}%` }}
        >
          {inverted ? `${(warningAt * (max <= 1 ? 100 : 1)).toFixed(0)}${max <= 1 ? "%" : ""}` : `${(criticalAt * (max <= 1 ? 100 : 1)).toFixed(0)}${max <= 1 ? "%" : ""}`}
        </span>
        <span className="absolute right-0">{max <= 1 ? "100%" : max}</span>
      </div>
    </div>
  );
}
