"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Trend = "up" | "down";

interface InsightCardProps {
  title: string;
  description: string;
  trend?: Trend;
  className?: string;
}

const trendConfig: Record<Trend, { icon: any; color: string; bg: string }> = {
  up: {
    icon: TrendingUp,
    color: "text-success",
    bg: "bg-success/10 border-success/20",
  },
  down: {
    icon: TrendingDown,
    color: "text-destructive",
    bg: "bg-destructive/10 border-destructive/20",
  },
};

export function InsightCard({
  title,
  description,
  trend,
  className,
}: InsightCardProps) {
  const config = trend ? trendConfig[trend] : null;
  const TrendIcon = config?.icon || Sparkles;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{
        y: -4,
        scale: 1.02,
        transition: { duration: 0.2 },
      }}
      className={cn(
        "surface-card rounded-2xl p-5 transition-shadow hover:shadow-glow",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
            config?.bg || "bg-primary/10 border-primary/20"
          )}
        >
          <TrendIcon className={cn("h-5 w-5", config?.color || "text-primary")} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">{title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-foreground/60 italic font-display">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
