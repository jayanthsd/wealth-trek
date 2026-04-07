"use client";

import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, BarChart3, MessageCircle, Target, FileDown, Lock } from "lucide-react";

const IconMap: Record<string, LucideIcon> = {
  TrendingUp,
  BarChart3,
  MessageCircle,
  Target,
  FileDown,
  Lock,
};

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
  delay?: number;
}

export function FeatureCard({ title, description, icon, delay = 0 }: FeatureCardProps) {
  const Icon = IconMap[icon] || Lock;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="group relative rounded-xl border border-border/40 bg-card p-6 transition-colors duration-200 hover:border-primary/25 hover:bg-primary/[0.02] cursor-default"
    >
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/8 transition-colors duration-200 group-hover:border-primary/35 group-hover:bg-primary/15">
        <Icon className="h-5 w-5 text-primary" />
      </div>

      <h3 className="mb-3 text-base font-semibold tracking-tight text-foreground transition-colors duration-200 group-hover:text-primary">
        {title}
      </h3>

      <p className="text-sm leading-relaxed text-foreground/55 transition-all duration-200 sm:translate-y-1 sm:opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
        {description}
      </p>
    </motion.div>
  );
}
