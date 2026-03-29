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
  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.abs(value));
  return (value < 0 ? "- " : "") + formatted;
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
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{
        y: -4,
        scale: 1.02,
        transition: { duration: 0.2 },
      }}
      className={cn(
        "surface-card rounded-3xl p-6 sm:p-8 transition-shadow hover:shadow-glow",
        className
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-foreground/50">
        Total Net Worth
      </p>
      <p className="mt-3 font-display italic text-4xl sm:text-5xl text-liquid-gold tabular-nums">
        {formatINR(netWorth)}
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium border",
            isPositive
              ? "bg-success/10 text-success border-success/20"
              : "bg-destructive/10 text-destructive border-destructive/20"
          )}
        >
          {isPositive ? (
            <TrendingUp className="h-4 w-4" aria-hidden />
          ) : (
            <TrendingDown className="h-4 w-4" aria-hidden />
          )}
          {isPositive ? "+" : "-"}
          {formatINR(Math.abs(monthlyChange))}
        </span>
        <span
          className={cn(
            "text-sm font-medium italic opacity-80",
            isPositive ? "text-success" : "text-destructive"
          )}
        >
          ({isPositive ? "+" : ""}
          {percentageChange.toFixed(1)}% this month)
        </span>
      </div>
    </motion.div>
  );
}
