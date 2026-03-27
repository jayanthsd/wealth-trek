"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";

interface AnimatedHeroProps {
  children: ReactNode;
}

export function AnimatedHero({ children }: AnimatedHeroProps) {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24">
      {/* Glassmorphism gradient backdrop */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(139,92,246,0.18),transparent_42%),radial-gradient(circle_at_85%_10%,rgba(99,102,241,0.12),transparent_36%)]" />
      <div className="pointer-events-none absolute inset-0 backdrop-blur-[2px]" />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        {children}
      </motion.div>
    </section>
  );
}

interface AnimatedTextBlockProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function AnimatedTextBlock({
  children,
  delay = 0,
  className,
}: AnimatedTextBlockProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedCTAButtonProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedCTAButton({ children, className }: AnimatedCTAButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
