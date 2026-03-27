"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Trend = "up" | "down";

interface InsightCardProps {
  title: string;
  description: string;
  trend?: Trend;
  className?: string;
}

const trendConfig: Record<Trend, { icon: typeof TrendingUp; color: string; bg: string }> = {
  up: {
    icon: TrendingUp,
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
  },
  down: {
    icon: TrendingDown,
    color: "text-red-600",
    bg: "bg-red-50 dark:bg-red-950/40",
  },
};

export function InsightCard({
  title,
  description,
  trend,
  className,
}: InsightCardProps) {
  const config = trend ? trendConfig[trend] : null;
  const TrendIcon = config?.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
      whileHover={{
        y: -4,
        transition: { duration: 0.2 },
      }}
      className={cn(
        "rounded-2xl border border-border/60 bg-white/70 p-5 shadow-lg backdrop-blur-md transition-shadow hover:shadow-xl dark:bg-gray-900/70",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {TrendIcon && config && (
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
              config.bg
            )}
          >
            <TrendIcon className={cn("h-5 w-5", config.color)} aria-hidden />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
