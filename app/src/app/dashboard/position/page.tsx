"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { DashboardPageShell } from "@/components/DashboardPageShell";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { useNetWorthHistory } from "@/hooks/useNetWorthHistory";
import { useAdvancedInputs } from "@/hooks/useAdvancedInputs";
import WealthPercentileSection from "@/components/WealthPercentileSection";
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
import { cn } from "@/lib/utils";
import type { StatementEntry, JourneyResult, StageConfig } from "@/types";
import {
  DeltaBanner,
  ProjectionCallout,
  StageStepper,
  TransitionBanner,
  ProgressChart,
  STAGE_TEXT,
  formatINR,
} from "@/components/WealthStageComponents";

const PIE_COLORS = [
  "#1D9E75", "#378ADD", "#7F77DD", "#EF9F27",
  "#E05C6F", "#EC4899", "#06B6D4", "#84CC16",
];

function computeEffectiveValue(entry: StatementEntry): number {
  return (entry.closingBalance * entry.ownershipPercentage) / 100;
}

function formatCurrency(value: number): string {
  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.abs(value));
  return (value < 0 ? "- " : "") + formatted;
}

function formatMonth(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

function DeltaChips({
  netWorthDelta,
  assetsDelta,
  liabilitiesDelta,
  previousDate,
}: {
  netWorthDelta: number;
  assetsDelta: number;
  liabilitiesDelta: number;
  previousDate: string;
}) {
  const chips = [
    { label: "Net Worth", value: netWorthDelta, invert: false },
    { label: "Assets", value: assetsDelta, invert: false },
    { label: "Liabilities", value: liabilitiesDelta, invert: true },
  ];
  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map(({ label, value, invert }) => {
        const isPositive = invert ? value < 0 : value > 0;
        const isNegative = invert ? value > 0 : value < 0;
        const isZero = value === 0;
        const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
        return (
          <div
            key={label}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold",
              isPositive && "bg-emerald-500/8 border-emerald-500/20 text-emerald-400",
              isNegative && "bg-red-500/8 border-red-500/20 text-red-400",
              isZero && "bg-foreground/5 border-foreground/10 text-muted-foreground"
            )}
          >
            <Icon className="h-3 w-3" />
            <span>{label}</span>
            <span className="tabular-nums">
              {value > 0 ? "+" : ""}
              {formatINR(value)}
            </span>
          </div>
        );
      })}
      <span className="text-xs text-muted-foreground ml-1">
        since {formatMonth(previousDate)}
      </span>
    </div>
  );
}

function BreakdownCard({
  title,
  data,
  total,
}: {
  title: string;
  data: { name: string; value: number }[];
  total: number;
}) {
  return (
    <div className="surface-card rounded-3xl p-6 sm:p-8 border border-border">
      <h2 className="label-caps mb-6">{title}</h2>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="w-[180px] h-[180px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
                stroke="var(--background)"
                strokeWidth={2}
              >
                {data.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [formatCurrency(Number(value ?? 0)), ""]}
                contentStyle={{
                  backgroundColor: "var(--card)",
                  borderRadius: "12px",
                  border: "1px solid var(--border)",
                  fontSize: "12px",
                  fontFamily: "var(--font-sans)",
                  color: "var(--card-foreground)",
                  padding: "8px 12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-2 w-full">
          {data.map((item, i) => {
            const pct = total > 0 ? ((item.value / total) * 100).toFixed(0) : "0";
            return (
              <div key={item.name} className="flex items-center gap-3 text-sm">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                />
                <span className="flex-1 text-foreground truncate">{item.name}</span>
                <span className="text-muted-foreground tabular-nums text-xs font-medium">
                  {pct}%
                </span>
                <span className="text-foreground font-semibold tabular-nums text-xs shrink-0 whitespace-nowrap text-right">
                  {formatCurrency(item.value)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function MyPositionPage() {
  const { snapshots, loaded: snapsLoaded } = useNetWorthHistory();
  const { inputs: advancedInputs, loaded: inputsLoaded } = useAdvancedInputs();
  const allLoaded = snapsLoaded && inputsLoaded;

  const sorted = useMemo(
    () => [...snapshots].sort((a, b) => a.date.localeCompare(b.date)),
    [snapshots]
  );
  const latest = sorted.length > 0 ? sorted[sorted.length - 1] : null;
  const previous = sorted.length > 1 ? sorted[sorted.length - 2] : null;

  const snapshotDelta = useMemo(() => {
    if (!latest || !previous) return null;
    return {
      netWorthDelta: latest.netWorth - previous.netWorth,
      assetsDelta: latest.totalAssets - previous.totalAssets,
      liabilitiesDelta: latest.totalLiabilities - previous.totalLiabilities,
      previousDate: previous.date,
    };
  }, [latest, previous]);

  const { assetPieData, liabilityPieData } = useMemo(() => {
    if (!latest) return { assetPieData: [], liabilityPieData: [] };
    const assetMap = new Map<string, number>();
    const liabilityMap = new Map<string, number>();
    for (const entry of latest.entries) {
      const value = computeEffectiveValue(entry);
      const map = entry.category === "asset" ? assetMap : liabilityMap;
      map.set(entry.statementType, (map.get(entry.statementType) ?? 0) + value);
    }
    return {
      assetPieData: Array.from(assetMap.entries()).map(([name, value]) => ({ name, value })),
      liabilityPieData: Array.from(liabilityMap.entries()).map(([name, value]) => ({
        name,
        value,
      })),
    };
  }, [latest]);

  const journey: JourneyResult | null = useMemo(() => {
    if (!allLoaded || snapshots.length === 0 || !latest) return null;

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

    const focusItem =
      checklist
        .filter((item) => item.status !== "done" && item.status !== "not_applicable")
        .sort((a, b) =>
          b.weight !== a.weight ? b.weight - a.weight : a.score - b.score
        )[0] ?? null;

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
          projection = { monthsToNextStage: null, projectedDate: null, avgMonthlyGrowth };
        }
      }
    }

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
  }, [allLoaded, snapshots, sorted, latest, advancedInputs]);

  if (!allLoaded) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-muted-foreground">Computing your position...</p>
        </div>
      </div>
    );
  }

  if (snapshots.length === 0) {
    return (
      <DashboardPageShell
        variant="default"
        className="flex flex-col items-center justify-center min-h-[50vh] gap-6 text-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5">
          <Sparkles className="h-7 w-7 text-primary/40" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Track Your Position</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            Create your first net worth snapshot to see your wealth stage, percentile ranking,
            and portfolio breakdown.
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

  if (!journey || !journey.stage) {
    return (
      <DashboardPageShell
        variant="default"
        className="flex flex-col items-center justify-center min-h-[50vh] gap-6 text-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5">
          <Sparkles className="h-7 w-7 text-primary/40" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Track Your Position</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            Create your first net worth snapshot to see your wealth stage, percentile ranking,
            and portfolio breakdown.
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

  const nextStage =
    journey.stage.stageIndex < ALL_STAGES.length - 1
      ? ALL_STAGES[journey.stage.stageIndex + 1]
      : null;

  return (
    <DashboardPageShell variant="default" className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-display italic text-3xl sm:text-4xl text-foreground">
          My Position
        </h1>
        <p className="mt-2 text-muted-foreground italic font-display">
          Where you stand, how far you&apos;ve come, and where you&apos;re headed.
        </p>
      </motion.div>

      {/* Delta Banner */}
      <AnimatePresence>
        {journey.delta && (
          <SectionContainer delay={0}>
            <DeltaBanner delta={journey.delta} />
          </SectionContainer>
        )}
      </AnimatePresence>

      {/* Section A: Percentile & Milestones */}
      <SectionContainer delay={0.05}>
        <WealthPercentileSection />
      </SectionContainer>

      {/* Section B: Wealth Stage */}
      <SectionContainer delay={0.08}>
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-8">
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
              Your Wealth Stage
            </p>
            <h2 className={cn("text-3xl font-bold", STAGE_TEXT[journey.stage.id])}>
              {journey.stage.label}
            </h2>
            <p className="text-sm text-muted-foreground mt-1 italic">
              &ldquo;{journey.stage.mindset}&rdquo;
            </p>
            <p className="text-xs text-foreground/60 mt-2">{journey.stage.goal}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground font-medium">Net Worth</p>
            <p className="text-lg font-bold tabular-nums text-foreground">
              {formatINR(latest?.netWorth ?? 0)}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              {journey.progress.toFixed(0)}% toward next stage
            </p>
          </div>
        </div>
      </SectionContainer>

      <SectionContainer delay={0.1}>
        <StageStepper currentStage={journey.stage} progress={journey.progress} />
      </SectionContainer>

      {journey.projection && nextStage && (
        <SectionContainer delay={0.12}>
          <ProjectionCallout
            projection={journey.projection}
            nextStageLabel={nextStage.label}
            stageId={journey.stage.id}
          />
        </SectionContainer>
      )}

      <AnimatePresence>
        {journey.transitioned && journey.previousStage && (
          <SectionContainer delay={0.14}>
            <TransitionBanner from={journey.previousStage} to={journey.stage} />
          </SectionContainer>
        )}
      </AnimatePresence>

      {/* Section D: Delta Chips + Portfolio Breakdown */}
      {snapshotDelta && (
        <SectionContainer delay={0.16}>
          <DeltaChips {...snapshotDelta} />
        </SectionContainer>
      )}

      {(assetPieData.length > 0 || liabilityPieData.length > 0) && (
        <SectionContainer delay={0.18}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {assetPieData.length > 0 && (
              <BreakdownCard
                title="Asset Breakdown"
                data={assetPieData}
                total={latest!.totalAssets}
              />
            )}
            {liabilityPieData.length > 0 && (
              <BreakdownCard
                title="Liability Breakdown"
                data={liabilityPieData}
                total={latest!.totalLiabilities}
              />
            )}
          </div>
        </SectionContainer>
      )}

      {/* Section E: Score History */}
      <SectionContainer delay={0.2}>
        <Card className="surface-card rounded-2xl border border-border p-5">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
            Stage Score History
          </h3>
          <ProgressChart
            history={journey.stageHistory}
            currentStageId={journey.stage.id}
          />
        </Card>
      </SectionContainer>
    </DashboardPageShell>
  );
}
