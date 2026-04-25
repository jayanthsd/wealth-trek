"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { HealthGrade, WealthHealthScore } from "@/lib/wealthHealthScore";

interface Props {
  score: WealthHealthScore;
  headline: string;
  delta?: number | null;
  stageLabel?: string | null;
}

const GRADE_COLORS: Record<HealthGrade, { ring: string; text: string; bg: string }> = {
  A: { ring: "#1D9E75", text: "text-success", bg: "bg-success/10" },
  B: { ring: "#5FAE82", text: "text-success", bg: "bg-success/10" },
  C: { ring: "#E6B64C", text: "text-amber-500", bg: "bg-amber-500/10" },
  D: { ring: "#DD8855", text: "text-amber-600", bg: "bg-amber-500/10" },
  F: { ring: "#D64545", text: "text-destructive", bg: "bg-destructive/10" },
};

export function WealthHealthScoreCard({ score, headline, delta, stageLabel }: Props) {
  const grade = GRADE_COLORS[score.grade];

  // Semicircle gauge — 0..100 mapped to 180° arc
  const cx = 110;
  const cy = 110;
  const radius = 90;
  const strokeWidth = 14;

  const startAngle = Math.PI;
  const endAngle = 0;
  const fillAngle = startAngle - (score.score / 100) * Math.PI;

  const describeArc = (start: number, end: number) => {
    const x1 = cx + radius * Math.cos(start);
    const y1 = cy - radius * Math.sin(start);
    const x2 = cx + radius * Math.cos(end);
    const y2 = cy - radius * Math.sin(end);
    const largeArc = Math.abs(start - end) > Math.PI ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="surface-card rounded-3xl p-6 sm:p-8 border border-border"
    >
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 md:gap-8 items-center">
        {/* Gauge */}
        <div className="flex justify-center md:justify-start">
          <svg viewBox="0 0 220 130" className="w-full max-w-[260px]">
            <path
              d={describeArc(startAngle, endAngle)}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              className="text-muted"
            />
            <motion.path
              d={describeArc(startAngle, fillAngle)}
              fill="none"
              stroke={grade.ring}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
            <text
              x={cx}
              y={cy - 10}
              textAnchor="middle"
              className="fill-foreground text-[42px] font-bold"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {score.score}
            </text>
            <text
              x={cx}
              y={cy + 14}
              textAnchor="middle"
              className="fill-muted-foreground text-[11px] tracking-wide font-medium"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              out of 100
            </text>
          </svg>
        </div>

        {/* Content */}
        <div className="text-center md:text-left space-y-3">
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <span
              className={cn(
                "inline-flex items-center justify-center h-10 w-10 rounded-xl text-xl font-bold",
                grade.bg,
                grade.text
              )}
            >
              {score.grade}
            </span>
            <div>
              <h2 className={cn("text-2xl font-bold font-display", grade.text)}>
                Wealth Health
              </h2>
              {stageLabel && (
                <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                  {stageLabel} stage
                </p>
              )}
            </div>
            {delta != null && (
              <span
                className={cn(
                  "ml-auto md:ml-2 text-xs font-semibold px-2 py-1 rounded-full tabular-nums",
                  delta > 0
                    ? "bg-success/10 text-success"
                    : delta < 0
                      ? "bg-destructive/10 text-destructive"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {delta > 0 ? "+" : ""}
                {delta}
              </span>
            )}
          </div>

          <p className="text-sm text-foreground/70 italic font-display leading-relaxed">
            {headline}
          </p>

          <p className="text-xs text-muted-foreground">
            Based on {score.coverage.domainsScored} of {score.coverage.domainsTotal} health areas.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
