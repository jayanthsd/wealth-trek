"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface Step {
  number: number;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    number: 1,
    title: "Add what you own",
    description: "Savings, investments, property, gold, EPF — anything of value.",
  },
  {
    number: 2,
    title: "Add what you owe",
    description: "Home loan, personal loan, credit card outstanding.",
  },
  {
    number: 3,
    title: "See your net worth instantly",
    description:
      "We'll also ask if you have last year's numbers — that unlocks insights right away.",
  },
];

interface FirstSnapshotOnboardingProps {
  firstName: string;
  onDismiss: () => void;
}

export function FirstSnapshotOnboarding({
  firstName,
  onDismiss,
}: FirstSnapshotOnboardingProps) {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="surface-card w-full max-w-xl rounded-3xl border border-white/8 p-8 sm:p-10 shadow-glow"
      >
        {/* Welcome badge */}
        <div className="mb-7">
          <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
            Welcome, {firstName}
          </span>
        </div>

        {/* Headline */}
        <h1 className="mb-3 text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
          Let's build your first financial snapshot
        </h1>

        {/* Sub-copy */}
        <p className="mb-8 text-base leading-relaxed text-foreground/55">
          Takes about 5 minutes. Once done, we'll show you exactly where you
          stand — your real net worth, not just your bank balance.
        </p>

        {/* Steps */}
        <ol className="mb-9 space-y-6">
          {STEPS.map((step, i) => (
            <motion.li
              key={step.number}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.1, ease: "easeOut" }}
              className="flex gap-4"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-sm font-bold text-primary">
                {step.number}
              </div>
              <div className="pt-0.5">
                <p className="font-semibold text-foreground">{step.title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-foreground/50">
                  {step.description}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>

        {/* CTAs */}
        <div className="space-y-3">
          <Link href="/dashboard/snapshot" className="block">
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.97 }}
              className="w-full rounded-2xl border border-primary/40 bg-primary/10 py-4 text-base font-semibold text-primary transition-colors hover:bg-primary/20 hover:border-primary/60"
            >
              Build my first snapshot
            </motion.button>
          </Link>

          <motion.button
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.97 }}
            onClick={onDismiss}
            className="w-full rounded-2xl border border-white/8 py-4 text-base font-semibold text-foreground/50 transition-colors hover:border-white/15 hover:text-foreground/70"
          >
            I'll do this later
          </motion.button>
        </div>

        {/* Footer note */}
        <p className="mt-6 text-center text-xs text-foreground/30">
          Takes about 5 minutes · Your data stays private
        </p>
      </motion.div>
    </div>
  );
}
