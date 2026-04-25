"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, LayoutGrid, ArrowRight } from "lucide-react";

interface ModeCard {
  mode: "quick" | "complete";
  icon: typeof Zap;
  title: string;
  time: string;
  tagline: string;
  items: string[];
  href: string;
}

const MODES: ModeCard[] = [
  {
    mode: "quick",
    icon: Zap,
    title: "Quick Start",
    time: "~2 minutes",
    tagline: "The essentials — enough to see your real net worth right now.",
    items: [
      "Savings Bank Accounts",
      "Fixed Deposits",
      "Real Estate (Home / Plot)",
      "Car & Bike Loans",
      "Home Loan",
      "Credit Card Outstanding",
    ],
    href: "/dashboard/snapshot?mode=quick",
  },
  {
    mode: "complete",
    icon: LayoutGrid,
    title: "Complete Picture",
    time: "~5 minutes",
    tagline: "Every asset class — the full view of your financial life.",
    items: [
      "Everything in Quick Start",
      "PPF & Provident Fund",
      "Mutual Funds & Stocks",
      "Gold / Jewellery",
      "Personal & Education Loans",
    ],
    href: "/dashboard/snapshot?mode=complete",
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
        className="w-full max-w-2xl"
      >
        {/* Welcome badge */}
        <div className="mb-7 text-center">
          <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
            Welcome, {firstName}
          </span>
        </div>

        {/* Headline */}
        <h1 className="mb-3 text-center text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
          Build your first financial snapshot
        </h1>

        {/* Sub-copy */}
        <p className="mb-8 text-center text-base leading-relaxed text-foreground/55">
          Choose how much detail you want to start with. You can always add more later.
        </p>

        {/* Mode cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {MODES.map((card, i) => (
            <motion.div
              key={card.mode}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.1, ease: "easeOut" }}
            >
              <Link href={card.href} className="block h-full">
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="surface-card group flex h-full cursor-pointer flex-col rounded-3xl border border-white/8 p-6 shadow-glow transition-colors hover:border-primary/30"
                >
                  {/* Icon + time */}
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 transition-colors group-hover:bg-primary/15">
                      <card.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="rounded-full border border-white/8 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-foreground/40">
                      {card.time}
                    </span>
                  </div>

                  {/* Title + tagline */}
                  <h2 className="mb-1.5 text-lg font-semibold text-foreground">
                    {card.title}
                  </h2>
                  <p className="mb-5 text-sm leading-relaxed text-foreground/50">
                    {card.tagline}
                  </p>

                  {/* Items */}
                  <ul className="mb-6 flex-1 space-y-2">
                    {card.items.map((item) => (
                      <li key={item} className="flex items-center gap-2.5 text-sm text-foreground/60">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary/40 group-hover:bg-primary/60 transition-colors" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary/60 group-hover:text-primary transition-colors">
                      Start now
                    </span>
                    <ArrowRight className="h-4 w-4 text-primary/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Dismiss */}
        <div className="mt-5 text-center">
          <motion.button
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.97 }}
            onClick={onDismiss}
            className="rounded-2xl border border-white/8 px-8 py-3 text-sm font-semibold text-foreground/40 transition-colors hover:border-white/15 hover:text-foreground/60"
          >
            I'll do this later
          </motion.button>
        </div>

        {/* Footer note */}
        <p className="mt-5 text-center text-xs text-foreground/30">
          Your data stays private · Add more items anytime
        </p>
      </motion.div>
    </div>
  );
}
