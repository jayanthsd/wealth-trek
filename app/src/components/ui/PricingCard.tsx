"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  name: string;
  price: string;
  billing: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  ctaAction?: ReactNode;
  className?: string;
}

export function PricingCard({
  name,
  price,
  billing,
  description,
  features,
  cta,
  highlighted = false,
  ctaAction,
  className,
}: PricingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -6,
        transition: { duration: 0.2 },
      }}
      className={cn(
        "relative flex h-full flex-col rounded-2xl border bg-white/70 p-1 shadow-lg backdrop-blur-md transition-shadow hover:shadow-xl dark:bg-gray-900/70",
        highlighted
          ? "border-transparent bg-gradient-to-b from-purple-500/20 via-indigo-500/10 to-transparent ring-2 ring-purple-500/30"
          : "border-border/60",
        className
      )}
    >
      {highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 px-4 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-white shadow-md">
            Most Popular
          </span>
        </div>
      )}

      <div className="flex flex-1 flex-col rounded-xl bg-white p-6 dark:bg-gray-950">
        <div className="text-center">
          <h3 className="text-xl font-semibold tracking-tight text-foreground">
            {name}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          <div className="mt-4">
            <span className="text-4xl font-bold tabular-nums tracking-tight text-foreground">
              {price}
            </span>
            <span className="text-sm text-muted-foreground">/{billing}</span>
          </div>
        </div>

        <ul className="mt-6 flex-1 space-y-3">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-950/40">
                <Check
                  className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400"
                  aria-hidden
                />
              </div>
              <span className="text-sm leading-relaxed text-muted-foreground">
                {feature}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-6">
          {ctaAction ? (
            ctaAction
          ) : (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "w-full rounded-xl px-6 py-3 text-sm font-semibold transition-colors",
                highlighted
                  ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md hover:from-purple-600 hover:to-indigo-600"
                  : "border border-border bg-background text-foreground hover:bg-accent"
              )}
            >
              {cta}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
