"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  BadgeCheck,
  ChevronDown,
  Lock,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { InsightDomain, InsightItem } from "@/types";
import { MetricGauge } from "./MetricGauge";

export interface DomainGroupConfig {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  domains: InsightDomain[];
}

interface Props {
  config: DomainGroupConfig;
  items: InsightItem[];
  defaultOpen?: boolean;
}

type HealthTone = "healthy" | "warning" | "critical" | "empty";

function toneOf(items: InsightItem[]): HealthTone {
  const avail = items.filter((i) => !i.unavailable);
  if (avail.length === 0) return "empty";
  if (avail.some((i) => i.severity === "critical")) return "critical";
  if (avail.some((i) => i.severity === "warning")) return "warning";
  return "healthy";
}

const TONE_STYLE: Record<HealthTone, { bar: string; text: string; label: string }> = {
  healthy: { bar: "bg-success", text: "text-success", label: "On track" },
  warning: { bar: "bg-amber-500", text: "text-amber-500", label: "Needs attention" },
  critical: { bar: "bg-destructive", text: "text-destructive", label: "Urgent" },
  empty: { bar: "bg-muted-foreground/30", text: "text-muted-foreground", label: "No data yet" },
};

function computeFillPct(items: InsightItem[]): number {
  const avail = items.filter((i) => !i.unavailable);
  if (avail.length === 0) return 0;
  const score = avail.reduce((acc, i) => {
    if (i.severity === "critical") return acc + 15;
    if (i.severity === "warning") return acc + 55;
    return acc + 100;
  }, 0);
  return Math.round(score / avail.length);
}

export function DomainGroup({ config, items, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const Icon = config.icon;
  const tone = toneOf(items);
  const toneStyle = TONE_STYLE[tone];
  const fill = computeFillPct(items);
  const available = items.filter((i) => !i.unavailable);
  const unavailableCount = items.length - available.length;

  return (
    <div className="surface-card rounded-2xl border border-border overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-4 p-5 hover:bg-muted/30 transition-colors text-left"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
          <Icon className="h-5 w-5 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">{config.label}</h3>
            <span className={cn("text-[10px] font-bold uppercase tracking-widest", toneStyle.text)}>
              · {toneStyle.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground italic font-display mt-0.5">
            {config.description}
          </p>

          <div className="mt-2 h-1 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-700", toneStyle.bar)}
              style={{ width: `${fill}%` }}
            />
          </div>
        </div>

        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground shrink-0 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-border"
          >
            <div className="p-5 space-y-3 bg-muted/10">
              {available.length === 0 && (
                <p className="text-sm text-foreground/50 italic font-display">
                  No insights available for this area yet — add more snapshots or advanced inputs
                  to unlock.
                </p>
              )}

              {available.map((item) => {
                const s =
                  item.severity === "critical"
                    ? "text-destructive"
                    : item.severity === "warning"
                      ? "text-amber-500"
                      : "text-success";
                return (
                  <div
                    key={item.id}
                    className="rounded-xl bg-background border border-border p-4"
                  >
                    <div className="flex items-start gap-3">
                      {item.severity === "info" ? (
                        <BadgeCheck className={cn("h-4 w-4 mt-0.5 shrink-0", s)} />
                      ) : (
                        <ArrowUpRight className={cn("h-4 w-4 mt-0.5 shrink-0", s)} />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-foreground">
                          {item.plainTitle ?? item.title}
                        </h4>
                        <p className="mt-1 text-xs text-foreground/60 italic font-display leading-relaxed">
                          {item.plainExplanation ?? item.description}
                        </p>
                        {item.suggestedAction && item.severity !== "info" && (
                          <p className="mt-2 text-xs text-primary/90 leading-relaxed">
                            → {item.suggestedAction}
                          </p>
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
                  </div>
                );
              })}

              {unavailableCount > 0 && (
                <div className="flex items-center gap-2 rounded-xl p-3 bg-foreground/5 border border-foreground/5">
                  <Lock className="h-3.5 w-3.5 text-foreground/25" />
                  <p className="text-xs text-foreground/35 italic font-display">
                    {unavailableCount} more insight{unavailableCount !== 1 ? "s" : ""} unlock with
                    more data
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
