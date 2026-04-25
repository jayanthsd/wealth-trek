"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  Lock,
  AlertTriangle,
  Trophy,
  ChevronRight,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Zap,
  Info,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { cn } from "@/lib/utils";
import { ALL_STAGES } from "@/lib/wealthStage";
import type {
  JourneyResult,
  ChecklistResult,
  StageConfig,
  StageHistoryEntry,
  WealthStage,
} from "@/types";

// ---------------------------------------------------------------------------
// Color maps per stage
// ---------------------------------------------------------------------------

export const STAGE_COLORS: Record<WealthStage, string> = {
  foundation: "emerald",
  stability: "yellow",
  acceleration: "orange",
  optimization: "blue",
  preservation: "violet",
};

export const STAGE_BG: Record<WealthStage, string> = {
  foundation: "bg-emerald-500/10 border-emerald-500/20",
  stability: "bg-yellow-500/10 border-yellow-500/20",
  acceleration: "bg-orange-500/10 border-orange-500/20",
  optimization: "bg-blue-500/10 border-blue-500/20",
  preservation: "bg-violet-500/10 border-violet-500/20",
};

export const STAGE_TEXT: Record<WealthStage, string> = {
  foundation: "text-emerald-400",
  stability: "text-yellow-400",
  acceleration: "text-orange-400",
  optimization: "text-blue-400",
  preservation: "text-violet-400",
};

export const STAGE_FILL: Record<WealthStage, string> = {
  foundation: "bg-emerald-500",
  stability: "bg-yellow-500",
  acceleration: "bg-orange-500",
  optimization: "bg-blue-500",
  preservation: "bg-violet-500",
};

export const STAGE_CHART_STROKE: Record<WealthStage, string> = {
  foundation: "oklch(0.65 0.18 155)",
  stability: "oklch(0.80 0.15 85)",
  acceleration: "oklch(0.70 0.15 55)",
  optimization: "oklch(0.60 0.15 250)",
  preservation: "oklch(0.55 0.18 290)",
};

// ---------------------------------------------------------------------------
// Status config for checklist items
// ---------------------------------------------------------------------------

export const STATUS_CONFIG = {
  done: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", label: "Done" },
  partial: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10", label: "In Progress" },
  todo: { icon: Circle, color: "text-red-400", bg: "bg-red-500/10", label: "To Do" },
  not_applicable: { icon: Lock, color: "text-foreground/30", bg: "bg-foreground/5", label: "Needs Data" },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function formatINR(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatMonthShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

// ---------------------------------------------------------------------------
// DeltaBanner
// ---------------------------------------------------------------------------

export function DeltaBanner({ delta }: { delta: NonNullable<JourneyResult["delta"]> }) {
  const scoreUp = delta.scoreDelta > 0.5;
  const scoreDown = delta.scoreDelta < -0.5;
  const nwUp = delta.netWorthDelta > 0;
  const ScoreIcon = scoreUp ? TrendingUp : scoreDown ? TrendingDown : Minus;
  const scoreColor = scoreUp ? "text-emerald-400" : scoreDown ? "text-red-400" : "text-muted-foreground";
  const scoreBg = scoreUp
    ? "bg-emerald-500/8 border-emerald-500/15"
    : scoreDown
    ? "bg-red-500/8 border-red-500/15"
    : "bg-foreground/5 border-foreground/10";

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-2xl border px-5 py-3 flex flex-wrap items-center gap-x-5 gap-y-2",
        scoreBg
      )}
    >
      <div className="flex items-center gap-2">
        <ScoreIcon className={cn("h-3.5 w-3.5", scoreColor)} />
        <span className={cn("text-sm font-semibold tabular-nums", scoreColor)}>
          {scoreUp ? "+" : ""}
          {delta.scoreDelta.toFixed(1)} pts
        </span>
        <span className="text-xs text-muted-foreground">stage score</span>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "text-sm font-semibold tabular-nums",
            nwUp ? "text-emerald-400" : "text-red-400"
          )}
        >
          {nwUp ? "+" : ""}
          {formatINR(delta.netWorthDelta)}
        </span>
        <span className="text-xs text-muted-foreground">net worth</span>
      </div>
      <span className="text-xs text-muted-foreground ml-auto">
        since {formatMonthShort(delta.previousDate)}
      </span>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// ProjectionCallout
// ---------------------------------------------------------------------------

export function ProjectionCallout({
  projection,
  nextStageLabel,
  stageId,
}: {
  projection: NonNullable<JourneyResult["projection"]>;
  nextStageLabel: string;
  stageId: WealthStage;
}) {
  if (!projection.projectedDate || projection.monthsToNextStage === null) {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-foreground/8 bg-foreground/3 px-4 py-3">
        <Minus className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
        <p className="text-xs text-muted-foreground">
          No projection yet — your net worth hasn&apos;t grown consistently. Keep adding monthly
          snapshots.
        </p>
      </div>
    );
  }

  const months = projection.monthsToNextStage;
  const timeLabel =
    months <= 1
      ? "next month"
      : months < 12
      ? `in ${months} months`
      : months < 24
      ? "in about a year"
      : `in ~${Math.round(months / 12)} years`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex items-center gap-3 rounded-xl border px-4 py-3", STAGE_BG[stageId])}
    >
      <Zap className={cn("h-4 w-4 flex-shrink-0", STAGE_TEXT[stageId])} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">
          On track to reach{" "}
          <span className={cn("font-bold", STAGE_TEXT[stageId])}>{nextStageLabel}</span>{" "}
          {timeLabel}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Growing {formatINR(Math.abs(projection.avgMonthlyGrowth))}/month avg · projected by{" "}
          {projection.projectedDate}
        </p>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// FocusCard
// ---------------------------------------------------------------------------

export function FocusCard({
  item,
  stageId,
}: {
  item: ChecklistResult;
  stageId: WealthStage;
}) {
  const config = STATUS_CONFIG[item.status];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("rounded-2xl border p-5", STAGE_BG[stageId])}
    >
      <div className="flex items-center gap-2 mb-3">
        <Target className={cn("h-3.5 w-3.5", STAGE_TEXT[stageId])} />
        <span
          className={cn(
            "text-[10px] font-bold uppercase tracking-widest",
            STAGE_TEXT[stageId]
          )}
        >
          Focus This Month
        </span>
      </div>
      <div className="flex gap-3 items-start">
        <div className={cn("mt-0.5 flex-shrink-0 rounded-full p-1.5", config.bg)}>
          <Icon className={cn("h-3.5 w-3.5", config.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{item.label}</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.message}</p>
          {item.actionHint && (
            <p
              className={cn(
                "text-xs font-semibold mt-2 flex items-center gap-1",
                STAGE_TEXT[stageId]
              )}
            >
              <ChevronRight className="h-3 w-3" />
              {item.actionHint}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// StageStepper
// ---------------------------------------------------------------------------

export function StageStepper({
  currentStage,
  progress,
}: {
  currentStage: StageConfig;
  progress: number;
}) {
  return (
    <div className="flex items-center gap-1 w-full">
      {ALL_STAGES.map((stage, idx) => {
        const isCurrent = stage.id === currentStage.id;
        const isCompleted = stage.stageIndex < currentStage.stageIndex;
        const isFuture = stage.stageIndex > currentStage.stageIndex;

        return (
          <div key={stage.id} className="flex-1 flex flex-col items-center gap-1.5">
            <div
              className={cn(
                "w-full h-2 rounded-full relative overflow-hidden transition-all",
                isCompleted && STAGE_FILL[stage.id],
                isCurrent && "bg-foreground/10",
                isFuture && "bg-foreground/5"
              )}
            >
              {isCurrent && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  className={cn("h-full rounded-full", STAGE_FILL[stage.id])}
                />
              )}
            </div>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold border-2 transition-all",
                  isCompleted && cn(STAGE_FILL[stage.id], "border-transparent text-white"),
                  isCurrent &&
                    cn(
                      "border-2",
                      `border-${STAGE_COLORS[stage.id]}-500`,
                      STAGE_TEXT[stage.id],
                      "bg-transparent"
                    ),
                  isFuture && "border-foreground/10 text-foreground/20 bg-transparent"
                )}
              >
                {isCompleted ? "✓" : idx + 1}
              </div>
              <span
                className={cn(
                  "text-[9px] font-semibold mt-0.5 text-center leading-tight",
                  isCurrent && STAGE_TEXT[stage.id],
                  isCompleted && "text-muted-foreground",
                  isFuture && "text-foreground/30"
                )}
              >
                {stage.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ScoreGauge
// ---------------------------------------------------------------------------

export function ScoreGauge({
  score,
  label,
  stageId,
  insufficientData,
}: {
  score: number;
  label: string;
  stageId: WealthStage;
  insufficientData: boolean;
}) {
  const circumference = 2 * Math.PI * 45;
  const pct = insufficientData ? 0 : score;
  const strokeOffset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            className="text-foreground/5"
            strokeWidth="8"
            fill="none"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            className={STAGE_TEXT[stageId]}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: strokeOffset }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {insufficientData ? (
            <span className="text-xs text-muted-foreground">N/A</span>
          ) : (
            <>
              <motion.span
                className={cn("text-2xl font-bold tabular-nums", STAGE_TEXT[stageId])}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {Math.round(score)}
              </motion.span>
              <span className="text-[9px] text-muted-foreground">/ 100</span>
            </>
          )}
        </div>
      </div>
      <span className="text-xs font-semibold text-muted-foreground text-center">{label}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ChecklistCard
// ---------------------------------------------------------------------------

export function ChecklistCard({ item }: { item: ChecklistResult }) {
  const config = STATUS_CONFIG[item.status];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "surface-card rounded-xl border p-4 flex gap-3 items-start transition-all hover:border-foreground/10",
        item.status === "not_applicable" && "opacity-60"
      )}
    >
      <div className={cn("mt-0.5 flex-shrink-0 rounded-full p-1.5", config.bg)}>
        <Icon className={cn("h-3.5 w-3.5", config.color)} />
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground truncate">{item.label}</span>
          <span
            className={cn(
              "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full",
              config.bg,
              config.color
            )}
          >
            {config.label}
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{item.message}</p>
        {item.actionHint && item.status !== "done" && (
          <p className="text-xs font-medium text-primary/70 flex items-center gap-1">
            <ChevronRight className="h-3 w-3" />
            {item.actionHint}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// TransitionBanner
// ---------------------------------------------------------------------------

export function TransitionBanner({
  from,
  to,
}: {
  from: StageConfig;
  to: StageConfig;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn("rounded-2xl border p-5 flex items-center gap-4", STAGE_BG[to.id])}
    >
      <Trophy className={cn("h-8 w-8", STAGE_TEXT[to.id])} />
      <div>
        <p className={cn("text-sm font-bold", STAGE_TEXT[to.id])}>Stage Advancement!</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          You moved from <span className="font-semibold">{from.label}</span> to{" "}
          <span className={cn("font-semibold", STAGE_TEXT[to.id])}>{to.label}</span>. Keep
          building!
        </p>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// AdvancedInputsPrompt
// ---------------------------------------------------------------------------

export function AdvancedInputsPrompt({ count }: { count: number }) {
  if (count < 3) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center gap-3"
    >
      <Info className="h-4 w-4 text-primary/60 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-xs text-foreground/80">
          Fill in your financial details to unlock{" "}
          <span className="font-bold text-primary">{count} more checklist items</span>.
        </p>
      </div>
      <Link
        href="/dashboard/health"
        className="text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary/80 whitespace-nowrap"
      >
        Open Advanced Inputs →
      </Link>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// ProgressChart
// ---------------------------------------------------------------------------

export function ProgressChart({
  history,
  currentStageId,
}: {
  history: StageHistoryEntry[];
  currentStageId: WealthStage;
}) {
  if (history.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center">
        <Sparkles className="h-6 w-6 text-foreground/25 mb-2" />
        <p className="text-xs text-muted-foreground">
          Track your progress over time by adding more snapshots.
        </p>
      </div>
    );
  }

  const data = history.map((h) => ({
    date: new Date(h.date).toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
    score: h.score,
    stage: h.stage,
  }));

  const transitions: number[] = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i].stage !== data[i - 1].stage) transitions.push(i);
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 4, bottom: 0 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border)"
          strokeOpacity={0.5}
          vertical={false}
        />
        <XAxis
          dataKey="date"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
        />
        <YAxis
          domain={[0, 100]}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          width={30}
        />
        <Tooltip
          formatter={(value) => [`${Number(value ?? 0).toFixed(1)}`, "Score"]}
          contentStyle={{
            backgroundColor: "var(--card)",
            borderRadius: "12px",
            border: "1px solid var(--border)",
            fontSize: "11px",
          }}
        />
        {transitions.map((idx) => (
          <ReferenceLine
            key={idx}
            x={data[idx].date}
            stroke="var(--primary)"
            strokeDasharray="4 4"
            strokeOpacity={0.4}
          />
        ))}
        <Line
          type="monotone"
          dataKey="score"
          stroke={STAGE_CHART_STROKE[currentStageId]}
          strokeWidth={2.5}
          dot={{ r: 3, fill: STAGE_CHART_STROKE[currentStageId], strokeWidth: 0 }}
          activeDot={{ r: 5, strokeWidth: 0 }}
          animationDuration={1500}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
