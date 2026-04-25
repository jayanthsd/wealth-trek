"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Lock,
  AlertTriangle,
  Trophy,
  ChevronRight,
  Sparkles,
  Info,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Zap,
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
import { DashboardPageShell } from "@/components/DashboardPageShell";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useNetWorthHistory } from "@/hooks/useNetWorthHistory";
import { useAdvancedInputs } from "@/hooks/useAdvancedInputs";
import { computeAllInsights } from "@/lib/insightsEngine";
import { parseBalanceSheet } from "@/lib/balanceSheet";
import {
  classifyWealthStage,
  detectStageTransition,
  computeStageProgress,
  ALL_STAGES,
} from "@/lib/wealthStage";
import {
  evaluateChecklist,
  computeStageScore,
  computeStageHistory,
} from "@/lib/wealthChecklist";
import type {
  JourneyResult,
  ChecklistResult,
  StageConfig,
  StageHistoryEntry,
  WealthStage,
} from "@/types";

// ---------------------------------------------------------------------------
// Color map per stage
// ---------------------------------------------------------------------------

const STAGE_COLORS: Record<WealthStage, string> = {
  foundation: "emerald",
  stability: "yellow",
  acceleration: "orange",
  optimization: "blue",
  preservation: "violet",
};

const STAGE_BG: Record<WealthStage, string> = {
  foundation: "bg-emerald-500/10 border-emerald-500/20",
  stability: "bg-yellow-500/10 border-yellow-500/20",
  acceleration: "bg-orange-500/10 border-orange-500/20",
  optimization: "bg-blue-500/10 border-blue-500/20",
  preservation: "bg-violet-500/10 border-violet-500/20",
};

const STAGE_TEXT: Record<WealthStage, string> = {
  foundation: "text-emerald-400",
  stability: "text-yellow-400",
  acceleration: "text-orange-400",
  optimization: "text-blue-400",
  preservation: "text-violet-400",
};

const STAGE_FILL: Record<WealthStage, string> = {
  foundation: "bg-emerald-500",
  stability: "bg-yellow-500",
  acceleration: "bg-orange-500",
  optimization: "bg-blue-500",
  preservation: "bg-violet-500",
};

const STAGE_CHART_STROKE: Record<WealthStage, string> = {
  foundation: "oklch(0.65 0.18 155)",
  stability: "oklch(0.80 0.15 85)",
  acceleration: "oklch(0.70 0.15 55)",
  optimization: "oklch(0.60 0.15 250)",
  preservation: "oklch(0.55 0.18 290)",
};

// ---------------------------------------------------------------------------
// Status config for checklist items
// ---------------------------------------------------------------------------

const STATUS_CONFIG = {
  done: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", label: "Done" },
  partial: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10", label: "In Progress" },
  todo: { icon: Circle, color: "text-red-400", bg: "bg-red-500/10", label: "To Do" },
  not_applicable: { icon: Lock, color: "text-foreground/30", bg: "bg-foreground/5", label: "Needs Data" },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatINR(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatMonth(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

// ---------------------------------------------------------------------------
// Delta Banner — "What changed since last snapshot"
// ---------------------------------------------------------------------------

function DeltaBanner({
  delta,
}: {
  delta: NonNullable<JourneyResult["delta"]>;
}) {
  const scoreUp = delta.scoreDelta > 0.5;
  const scoreDown = delta.scoreDelta < -0.5;
  const nwUp = delta.netWorthDelta > 0;

  const ScoreIcon = scoreUp ? TrendingUp : scoreDown ? TrendingDown : Minus;
  const scoreColor = scoreUp ? "text-emerald-400" : scoreDown ? "text-red-400" : "text-muted-foreground";
  const scoreBg = scoreUp ? "bg-emerald-500/8 border-emerald-500/15" : scoreDown ? "bg-red-500/8 border-red-500/15" : "bg-foreground/5 border-foreground/10";

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("rounded-2xl border px-5 py-3 flex flex-wrap items-center gap-x-5 gap-y-2", scoreBg)}
    >
      <div className="flex items-center gap-2">
        <ScoreIcon className={cn("h-3.5 w-3.5", scoreColor)} />
        <span className={cn("text-sm font-semibold tabular-nums", scoreColor)}>
          {scoreUp ? "+" : ""}{delta.scoreDelta.toFixed(1)} pts
        </span>
        <span className="text-xs text-muted-foreground">stage score</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={cn("text-sm font-semibold tabular-nums", nwUp ? "text-emerald-400" : "text-red-400")}>
          {nwUp ? "+" : ""}{formatINR(delta.netWorthDelta)}
        </span>
        <span className="text-xs text-muted-foreground">net worth</span>
      </div>
      <span className="text-xs text-muted-foreground ml-auto">
        since {formatMonth(delta.previousDate)}
      </span>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Projection Callout — "Where you're headed"
// ---------------------------------------------------------------------------

function ProjectionCallout({
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
          No projection yet — your net worth hasn&apos;t grown consistently. Keep adding monthly snapshots.
        </p>
      </div>
    );
  }

  const months = projection.monthsToNextStage;
  const timeLabel = months <= 1 ? "next month" : months < 12 ? `in ${months} months` : months < 24 ? "in about a year" : `in ~${Math.round(months / 12)} years`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex items-center gap-3 rounded-xl border px-4 py-3", STAGE_BG[stageId])}
    >
      <Zap className={cn("h-4 w-4 flex-shrink-0", STAGE_TEXT[stageId])} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">
          On track to reach <span className={cn("font-bold", STAGE_TEXT[stageId])}>{nextStageLabel}</span> {timeLabel}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Growing {formatINR(Math.abs(projection.avgMonthlyGrowth))}/month avg · projected by {projection.projectedDate}
        </p>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Focus Card — "What to do next"
// ---------------------------------------------------------------------------

function FocusCard({
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
        <span className={cn("text-[10px] font-bold uppercase tracking-widest", STAGE_TEXT[stageId])}>
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
            <p className={cn("text-xs font-semibold mt-2 flex items-center gap-1", STAGE_TEXT[stageId])}>
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
// Stage Stepper
// ---------------------------------------------------------------------------

function StageStepper({
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
                  isCurrent && cn("border-2", `border-${STAGE_COLORS[stage.id]}-500`, STAGE_TEXT[stage.id], "bg-transparent"),
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
// Score Gauge
// ---------------------------------------------------------------------------

function ScoreGauge({
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
            cx="50" cy="50" r="45"
            stroke="currentColor"
            className="text-foreground/5"
            strokeWidth="8"
            fill="none"
          />
          <motion.circle
            cx="50" cy="50" r="45"
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
// Checklist Card
// ---------------------------------------------------------------------------

function ChecklistCard({ item }: { item: ChecklistResult }) {
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
          <span className={cn("text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full", config.bg, config.color)}>
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
// Stage Transition Banner
// ---------------------------------------------------------------------------

function TransitionBanner({
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
      className={cn(
        "rounded-2xl border p-5 flex items-center gap-4",
        STAGE_BG[to.id]
      )}
    >
      <Trophy className={cn("h-8 w-8", STAGE_TEXT[to.id])} />
      <div>
        <p className={cn("text-sm font-bold", STAGE_TEXT[to.id])}>
          Stage Advancement!
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          You moved from <span className="font-semibold">{from.label}</span> to{" "}
          <span className={cn("font-semibold", STAGE_TEXT[to.id])}>{to.label}</span>.
          Keep building!
        </p>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Advanced Inputs Prompt
// ---------------------------------------------------------------------------

function AdvancedInputsPrompt({ count }: { count: number }) {
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
          Fill in your financial details to unlock <span className="font-bold text-primary">{count} more checklist items</span>.
        </p>
      </div>
      <Link
        href="/dashboard/analytics"
        className="text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary/80 whitespace-nowrap"
      >
        Open Advanced Inputs →
      </Link>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Historical Progress Chart
// ---------------------------------------------------------------------------

function ProgressChart({
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

// ---------------------------------------------------------------------------
// Loading Skeleton
// ---------------------------------------------------------------------------

function Skeleton() {
  return (
    <DashboardPageShell variant="default" className="space-y-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-4 w-24 bg-foreground/5 rounded animate-pulse" />
      </div>
      <div className="h-10 w-64 bg-foreground/5 rounded-xl animate-pulse" />
      <div className="flex gap-2 w-full">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex-1 h-2 bg-foreground/5 rounded-full animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-foreground/5 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-48 bg-foreground/5 rounded-xl animate-pulse" />
      </div>
    </DashboardPageShell>
  );
}

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <DashboardPageShell variant="default" className="flex flex-col items-center justify-center min-h-[50vh] gap-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5">
        <Sparkles className="h-7 w-7 text-primary/40" />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-foreground">Start Your Wealth Journey</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-md">
          Create your first net worth snapshot to see which wealth stage you&apos;re in and get a personalized checklist.
        </p>
      </div>
      <Link href="/dashboard/snapshot">
        <button className="rounded-full border border-primary/30 bg-primary/8 px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-primary transition-colors hover:bg-primary/15">
          Create Snapshot
        </button>
      </Link>
    </DashboardPageShell>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function WealthJourneyPage() {
  const { snapshots, loaded: snapsLoaded } = useNetWorthHistory();
  const { inputs: advancedInputs, loaded: inputsLoaded } = useAdvancedInputs();

  const allLoaded = snapsLoaded && inputsLoaded;

  const journey: JourneyResult | null = useMemo(() => {
    if (!allLoaded || snapshots.length === 0) return null;

    const sorted = [...snapshots].sort((a, b) => a.date.localeCompare(b.date));
    const latest = sorted[sorted.length - 1];
    const stage = classifyWealthStage(latest.netWorth);
    const progress = computeStageProgress(latest.netWorth);

    let previousStage: StageConfig | undefined;
    let transitioned = false;
    if (sorted.length >= 2) {
      const prev = sorted[sorted.length - 2];
      const t = detectStageTransition(latest.netWorth, prev.netWorth);
      transitioned = t.transitioned;
      previousStage = t.previousStage;
    }

    const insightResult = computeAllInsights(sorted, undefined, advancedInputs);
    const bs = parseBalanceSheet(latest);

    const checklist = evaluateChecklist({
      netWorth: latest.netWorth,
      stage: stage.id,
      balanceSheet: bs,
      advancedInputs,
      insightResult,
      snapshots: sorted,
    });

    const scoreRaw = computeStageScore(checklist);
    const score = {
      value: scoreRaw.value,
      label: stage.scoreLabel,
      insufficientData: scoreRaw.insufficientData,
    };

    const stageHistory = computeStageHistory(sorted, advancedInputs);

    // Focus item: highest-weight non-done, non-na item
    const focusItem =
      checklist
        .filter((item) => item.status !== "done" && item.status !== "not_applicable")
        .sort((a, b) => {
          if (b.weight !== a.weight) return b.weight - a.weight;
          return a.score - b.score; // lower score = more urgent (todo=0 before partial=50)
        })[0] ?? null;

    // Projection: time to next stage based on recent growth velocity
    let projection: JourneyResult["projection"] = null;
    if (stage.stageIndex < ALL_STAGES.length - 1 && sorted.length >= 2) {
      const nextStageMin = ALL_STAGES[stage.stageIndex + 1].range[0];
      const gap = nextStageMin - latest.netWorth;
      const recentSnaps = sorted.slice(-6);
      const msPerMonth = 30.44 * 24 * 60 * 60 * 1000;
      const timeDiffMs =
        new Date(recentSnaps[recentSnaps.length - 1].date).getTime() -
        new Date(recentSnaps[0].date).getTime();
      const monthsDiff = timeDiffMs / msPerMonth;

      if (monthsDiff >= 0.5) {
        const nwDiff =
          recentSnaps[recentSnaps.length - 1].netWorth - recentSnaps[0].netWorth;
        const avgMonthlyGrowth = nwDiff / monthsDiff;

        if (avgMonthlyGrowth > 0 && gap > 0) {
          const monthsToNextStage = Math.ceil(gap / avgMonthlyGrowth);
          const projDate = new Date();
          projDate.setMonth(projDate.getMonth() + monthsToNextStage);
          projection = {
            monthsToNextStage,
            projectedDate: projDate.toLocaleDateString("en-IN", {
              month: "long",
              year: "numeric",
            }),
            avgMonthlyGrowth,
          };
        } else {
          projection = {
            monthsToNextStage: null,
            projectedDate: null,
            avgMonthlyGrowth,
          };
        }
      }
    }

    // Delta: score and net worth change since last snapshot (skip if stage changed)
    let delta: JourneyResult["delta"] = null;
    if (!transitioned && stageHistory.length >= 2 && sorted.length >= 2) {
      const prevHistory = stageHistory[stageHistory.length - 2];
      const currHistory = stageHistory[stageHistory.length - 1];
      const prevSnap = sorted[sorted.length - 2];
      delta = {
        scoreDelta: currHistory.score - prevHistory.score,
        netWorthDelta: latest.netWorth - prevSnap.netWorth,
        previousDate: prevSnap.date,
      };
    }

    return {
      stage,
      previousStage,
      transitioned,
      progress,
      checklist,
      score,
      stageHistory,
      focusItem,
      projection,
      delta,
    };
  }, [allLoaded, snapshots, advancedInputs]);

  if (!allLoaded) return <Skeleton />;
  if (snapshots.length === 0) return <EmptyState />;
  if (!journey || !journey.stage) return <EmptyState />;

  const naCount = journey.checklist.filter((c) => c.status === "not_applicable").length;
  const doneCount = journey.checklist.filter((c) => c.status === "done").length;
  const totalApplicable = journey.checklist.length - naCount;
  const nextStage =
    journey.stage.stageIndex < ALL_STAGES.length - 1
      ? ALL_STAGES[journey.stage.stageIndex + 1]
      : null;

  // Remaining checklist items (exclude the focus item to avoid duplication)
  const remainingChecklist = journey.focusItem
    ? journey.checklist.filter((item) => item.id !== journey.focusItem!.id)
    : journey.checklist;

  return (
    <DashboardPageShell variant="default" className="space-y-6">
      {/* Back nav */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Dashboard
      </Link>

      {/* Delta Banner — what changed */}
      <AnimatePresence>
        {journey.delta && (
          <SectionContainer delay={0}>
            <DeltaBanner delta={journey.delta} />
          </SectionContainer>
        )}
      </AnimatePresence>

      {/* Stage Header */}
      <SectionContainer delay={0.05}>
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-8">
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
              Your Wealth Stage
            </p>
            <h1 className={cn("text-3xl font-bold", STAGE_TEXT[journey.stage.id])}>
              {journey.stage.label}
            </h1>
            <p className="text-sm text-muted-foreground mt-1 italic">
              &ldquo;{journey.stage.mindset}&rdquo;
            </p>
            <p className="text-xs text-foreground/60 mt-2">{journey.stage.goal}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground font-medium">Net Worth</p>
            <p className="text-lg font-bold tabular-nums text-foreground">
              {formatINR(snapshots[snapshots.length - 1]?.netWorth ?? 0)}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              {journey.progress.toFixed(0)}% toward next stage
            </p>
          </div>
        </div>
      </SectionContainer>

      {/* Stage Stepper */}
      <SectionContainer delay={0.08}>
        <StageStepper currentStage={journey.stage} progress={journey.progress} />
      </SectionContainer>

      {/* Projection Callout — where you're headed */}
      {journey.projection && nextStage && (
        <SectionContainer delay={0.1}>
          <ProjectionCallout
            projection={journey.projection}
            nextStageLabel={nextStage.label}
            stageId={journey.stage.id}
          />
        </SectionContainer>
      )}

      {/* Transition Banner */}
      <AnimatePresence>
        {journey.transitioned && journey.previousStage && (
          <SectionContainer delay={0.12}>
            <TransitionBanner from={journey.previousStage} to={journey.stage} />
          </SectionContainer>
        )}
      </AnimatePresence>

      {/* Focus Card — top action */}
      {journey.focusItem && (
        <SectionContainer delay={0.14}>
          <FocusCard item={journey.focusItem} stageId={journey.stage.id} />
        </SectionContainer>
      )}

      {/* Main content: Checklist + Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checklist */}
        <SectionContainer delay={0.18} className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Full Checklist
            </h2>
            <span className="text-[10px] font-bold tabular-nums text-muted-foreground">
              {doneCount}/{totalApplicable} completed
            </span>
          </div>

          <AdvancedInputsPrompt count={naCount} />

          <div className="space-y-2">
            {remainingChecklist.map((item) => (
              <ChecklistCard key={item.id} item={item} />
            ))}
          </div>
        </SectionContainer>

        {/* Right column: Score + History */}
        <SectionContainer delay={0.22} className="space-y-6">
          {/* Score */}
          <Card className="surface-card rounded-2xl border border-border p-6 flex flex-col items-center">
            <ScoreGauge
              score={journey.score.value}
              label={journey.score.label}
              stageId={journey.stage.id}
              insufficientData={journey.score.insufficientData}
            />
          </Card>

          {/* Historical Progress */}
          <Card className="surface-card rounded-2xl border border-border p-5">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
              Progress Over Time
            </h3>
            <ProgressChart
              history={journey.stageHistory}
              currentStageId={journey.stage.id}
            />
          </Card>
        </SectionContainer>
      </div>
    </DashboardPageShell>
  );
}
