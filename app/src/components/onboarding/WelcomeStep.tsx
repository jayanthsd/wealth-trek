"use client";

import { motion } from "framer-motion";
import { Zap, ClipboardList } from "lucide-react";

export type OnboardingPath = "quick" | "complete";

interface WelcomeStepProps {
  onSelectPath: (path: OnboardingPath) => void;
  onDismiss: () => void;
}

export function WelcomeStep({ onSelectPath, onDismiss }: WelcomeStepProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <h1 className="mb-3 text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
        You&apos;ve taken a great step toward building wealth.
        <br />
        Let&apos;s see where you stand today.
      </h1>
      <p className="mb-10 text-sm text-foreground/50">
        Both paths end with your net worth number. You can always add more later
        from the Snapshot page.
      </p>

      <div className="grid w-full gap-4 sm:grid-cols-2">
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelectPath("quick")}
          className="group flex flex-col items-center gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-6 text-left transition-colors hover:bg-primary/10 hover:border-primary/50"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-foreground">
              Quick Start
            </p>
            <p className="mt-1 text-xs text-foreground/45">
              ~2 min · Savings, loans & credit cards
            </p>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelectPath("complete")}
          className="group flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-left transition-colors hover:bg-white/[0.04] hover:border-white/20"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5">
            <ClipboardList className="h-6 w-6 text-foreground/60" />
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-foreground">
              Complete Picture
            </p>
            <p className="mt-1 text-xs text-foreground/45">
              ~5 min · All assets & liabilities
            </p>
          </div>
        </motion.button>
      </div>

      <motion.button
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.97 }}
        onClick={onDismiss}
        className="mt-8 text-sm font-medium text-foreground/40 transition-colors hover:text-foreground/60"
      >
        I&apos;ll do this later
      </motion.button>
    </div>
  );
}
