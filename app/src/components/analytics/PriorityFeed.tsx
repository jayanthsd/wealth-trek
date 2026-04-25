"use client";

import { motion } from "framer-motion";
import { AlertCircle, ArrowUpRight, Lightbulb, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InsightItem } from "@/types";
import { MetricGauge } from "./MetricGauge";

interface Props {
  items: InsightItem[];
  max?: number;
}

const SEVERITY_ORDER: Record<InsightItem["severity"], number> = {
  critical: 0,
  warning: 1,
  info: 2,
  unavailable: 3,
};

const SEVERITY_STYLE = {
  critical: {
    dot: "bg-destructive",
    text: "text-destructive",
    bg: "bg-destructive/5",
    border: "border-destructive/20",
    icon: AlertCircle,
  },
  warning: {
    dot: "bg-amber-500",
    text: "text-amber-500",
    bg: "bg-amber-500/5",
    border: "border-amber-500/20",
    icon: AlertCircle,
  },
  info: {
    dot: "bg-success",
    text: "text-success",
    bg: "bg-success/5",
    border: "border-success/20",
    icon: TrendingUp,
  },
  unavailable: {
    dot: "bg-muted",
    text: "text-muted-foreground",
    bg: "bg-muted/30",
    border: "border-border",
    icon: AlertCircle,
  },
} as const;

function pickTop(items: InsightItem[], max: number): InsightItem[] {
  return items
    .filter((i) => !i.unavailable && (i.severity === "critical" || i.severity === "warning"))
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])
    .slice(0, max);
}

export function PriorityFeed({ items, max = 5 }: Props) {
  const top = pickTop(items, max);

  if (top.length === 0) {
    return (
      <div className="surface-card rounded-3xl p-8 border border-success/20 bg-success/5 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-success/10 mb-3">
          <TrendingUp className="h-6 w-6 text-success" />
        </div>
        <h3 className="text-lg font-bold font-display text-success">Nothing urgent right now</h3>
        <p className="mt-1 text-sm text-foreground/60 italic font-display">
          No critical or warning items. Keep doing what you&apos;re doing.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-baseline gap-3">
        <h2 className="font-display italic text-2xl text-foreground">What to focus on</h2>
        <span className="text-xs text-muted-foreground">
          Top {top.length} item{top.length === 1 ? "" : "s"} by urgency
        </span>
      </div>

      <div className="space-y-3">
        {top.map((item, idx) => {
          const style = SEVERITY_STYLE[item.severity];
          const Icon = style.icon;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "surface-card rounded-2xl p-5 border",
                style.border,
                style.bg
              )}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                    style.bg
                  )}
                >
                  <Icon className={cn("h-5 w-5", style.text)} />
                </div>

                <div className="flex-1 min-w-0 space-y-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-widest",
                          style.text
                        )}
                      >
                        {item.severity === "critical" ? "Urgent" : "Heads up"}
                      </span>
                      <ArrowUpRight className={cn("h-3 w-3", style.text)} />
                    </div>
                    <h3 className="mt-1 text-base font-semibold text-foreground">
                      {item.plainTitle ?? item.title}
                    </h3>
                  </div>

                  {item.plainExplanation && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                        What this means
                      </p>
                      <p className="text-sm text-foreground/70 leading-relaxed font-display italic">
                        {item.plainExplanation}
                      </p>
                    </div>
                  )}

                  {item.suggestedAction && (
                    <div className="rounded-xl bg-background/50 border border-border p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Lightbulb className="h-3 w-3 text-primary" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
                          Try this
                        </p>
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {item.suggestedAction}
                      </p>
                    </div>
                  )}

                  {item.benchmark && item.metricValue !== undefined && (
                    <MetricGauge
                      value={item.metricValue}
                      benchmark={item.benchmark}
                      label={item.metricLabel}
                    />
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
