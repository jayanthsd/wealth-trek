"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface NetWorthCardProps {
  netWorth: number;
  monthlyChange: number;
  percentageChange: number;
  className?: string;
}

function formatINR(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function NetWorthCard({
  netWorth,
  monthlyChange,
  percentageChange,
  className,
}: NetWorthCardProps) {
  const isPositive = monthlyChange >= 0;

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
        "rounded-2xl border border-border/60 bg-white/70 p-6 shadow-lg backdrop-blur-md transition-shadow hover:shadow-xl dark:bg-gray-900/70 sm:p-8",
        className
      )}
    >
      <p className="text-sm font-medium text-muted-foreground">
        Total Net Worth
      </p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {formatINR(netWorth)}
      </p>
      <div className="mt-3 flex items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-sm font-semibold",
            isPositive
              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
              : "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
          )}
        >
          {isPositive ? (
            <TrendingUp className="h-4 w-4" aria-hidden />
          ) : (
            <TrendingDown className="h-4 w-4" aria-hidden />
          )}
          {isPositive ? "+" : ""}
          {formatINR(monthlyChange)}
        </span>
        <span
          className={cn(
            "text-sm font-medium",
            isPositive ? "text-emerald-600" : "text-red-600"
          )}
        >
          ({isPositive ? "+" : ""}
          {percentageChange.toFixed(1)}% this month)
        </span>
      </div>
    </motion.div>
  );
}
