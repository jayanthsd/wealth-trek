"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, TrendingUp, BarChart3, MessageCircle, Target, FileDown, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [isFlipped, setIsFlipped] = useState(false);
  const Icon = IconMap[icon] || Lock;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      className="group relative h-[200px] w-full perspective-1000"
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative h-full w-full preserve-3d"
      >
        {/* Front Side */}
        <div className="absolute inset-0 backface-hidden">
          <Card className="h-full border-white/5 bg-card/40 transition-colors group-hover:border-primary/20">
            <CardContent className="flex h-full flex-col items-center justify-center gap-4 p-6">
              <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center transition-colors group-hover:bg-primary/20">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold uppercase tracking-widest text-foreground/90 group-hover:text-primary transition-colors text-center">
                {title}
              </h3>
            </CardContent>
          </Card>
        </div>

        {/* Back Side */}
        <div className="absolute inset-0 backface-hidden rotate-y-180">
          <Card className="h-full border-primary/20 bg-primary/5 backdrop-blur-sm">
            <CardContent className="flex h-full flex-col justify-center gap-3 p-6 text-center">
              <p className="text-lg leading-relaxed text-foreground/90 font-display">
                {description}
              </p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
}
