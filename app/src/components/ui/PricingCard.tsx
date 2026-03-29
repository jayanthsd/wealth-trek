"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
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
        y: -8,
        scale: 1.02,
        transition: { duration: 0.3, ease: "easeOut" },
      }}
      className={cn(
        "relative flex h-full flex-col rounded-3xl p-px transition-all duration-500 overflow-hidden",
        highlighted
          ? "bg-gradient-to-b from-primary/50 via-primary/20 to-transparent shadow-glow"
          : "bg-white/5 border border-white/10",
        className
      )}
    >
      {highlighted && (
        <div className="absolute top-0 right-0 p-4">
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
        </div>
      )}

      <div className="flex flex-1 flex-col rounded-[23px] surface-card p-6 sm:p-8">
        <div className="text-left">
          <h3 className="font-display italic text-2xl text-foreground">
            {name}
          </h3>
          <p className="mt-2 text-sm text-foreground/60 leading-relaxed">{description}</p>
          <div className="mt-6 flex items-baseline gap-1">
            <span className="text-4xl font-bold tabular-nums tracking-tight text-liquid-gold">
              {price}
            </span>
            <span className="text-sm text-foreground/40 italic">/{billing}</span>
          </div>
        </div>

        <ul className="mt-8 flex-1 space-y-4">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <div className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                <Check
                  className="h-2.5 w-2.5 text-primary"
                  aria-hidden
                />
              </div>
              <span className="text-sm leading-relaxed text-foreground/70">
                {feature}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-10">
          {ctaAction ? (
            ctaAction
          ) : (
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(198,165,88,0.3)" }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "w-full rounded-full px-6 py-4 text-sm font-semibold transition-all duration-300",
                highlighted
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10"
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
