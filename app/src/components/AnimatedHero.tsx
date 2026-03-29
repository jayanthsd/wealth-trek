"use client";

import { type ReactNode, useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

interface AnimatedHeroProps {
  children: ReactNode;
}

export function AnimatedHero({ children }: AnimatedHeroProps) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative overflow-hidden py-20 sm:py-32">
      {/* Atmospheric Glow Blobs */}
      <motion.div 
        style={{ y, opacity }}
        className="pointer-events-none absolute inset-0 z-0"
      >
        <div className="absolute top-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[10%] left-[-5%] h-[400px] w-[400px] rounded-full bg-primary/5 blur-[100px]" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        {children}
      </motion.div>
    </section>
  );
}

export function ProductReveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.4], [35, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.4], [0.8, 1]);

  const springRotateX = useSpring(rotateX, { stiffness: 100, damping: 30 });
  const springScale = useSpring(scale, { stiffness: 100, damping: 30 });

  return (
    <div ref={ref} className="perspective-1000 py-20 px-4">
      <motion.div
        style={{
          rotateX: springRotateX,
          scale: springScale,
          opacity: 1,
        }}
        className="mx-auto w-full max-w-6xl rounded-[4rem] border-4 border-[#c6a558] bg-[#0a0a0a] shadow-[0_0_80px_rgba(198,165,88,0.3)] preserve-3d"
      >
        {children}
      </motion.div>
    </div>
  );
}

export function CardReveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [0, 1]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.85, 1]);

  const springY = useSpring(y, { stiffness: 80, damping: 25 });
  const springScale = useSpring(scale, { stiffness: 80, damping: 25 });

  return (
    <div ref={ref}>
      <motion.div
        style={{
          y: springY,
          scale: springScale,
          opacity,
        }}
      >
        {children}
      </motion.div>
    </div>
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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.22, 1, 0.36, 1],
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

export function AnimatedCTAButton({ children, className, ...props }: AnimatedCTAButtonProps & any) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
