"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { DashboardPageShell } from "@/components/DashboardPageShell";
import { SectionContainer } from "@/components/ui/SectionContainer";
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
import type { JourneyResult, StageConfig } from "@/types";
import {
  FocusCard,
  ChecklistCard,
  AdvancedInputsPrompt,
} from "@/components/WealthStageComponents";
import { PriorityFeed } from "@/components/analytics/PriorityFeed";

export default function ActionPlanPage() {
  const { snapshots, loaded: snapsLoaded } = useNetWorthHistory();
  const { inputs: advancedInputs, loaded: inputsLoaded } = useAdvancedInputs();
  const allLoaded = snapsLoaded && inputsLoaded;

  const sorted = useMemo(
    () => [...snapshots].sort((a, b) => a.date.localeCompare(b.date)),
    [snapshots]
  );
  const latest = sorted.length > 0 ? sorted[sorted.length - 1] : null;

  const insightResult = useMemo(() => {
    if (!allLoaded || sorted.length === 0) return null;
    return computeAllInsights(sorted, undefined, advancedInputs);
  }, [sorted, allLoaded, advancedInputs]);

  const allInsightItems = useMemo(() => {
    if (!insightResult) return [];
    return Object.values(insightResult.domains).flat();
  }, [insightResult]);

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

    const insightRes = computeAllInsights(sorted, undefined, advancedInputs);
    const bs = parseBalanceSheet(latest);

    const checklist = evaluateChecklist({
      netWorth: latest.netWorth,
      stage: stage.id,
      balanceSheet: bs,
      advancedInputs,
      insightResult: insightRes,
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
      delta: null,
    };
  }, [allLoaded, snapshots, sorted, latest, advancedInputs]);

  if (!allLoaded) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-muted-foreground">
            Loading your action plan...
          </p>
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
          <h2 className="text-xl font-semibold text-foreground">Your Action Plan Awaits</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            Create your first net worth snapshot to unlock your personalized financial action
            plan.
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
          <h2 className="text-xl font-semibold text-foreground">Your Action Plan Awaits</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            Create your first net worth snapshot to unlock your personalized financial action
            plan.
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

  const naCount = journey.checklist.filter((c) => c.status === "not_applicable").length;
  const doneCount = journey.checklist.filter((c) => c.status === "done").length;
  const totalApplicable = journey.checklist.length - naCount;

  const remainingChecklist = journey.focusItem
    ? journey.checklist.filter((item) => item.id !== journey.focusItem!.id)
    : journey.checklist;

  return (
    <DashboardPageShell variant="default" className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-display italic text-3xl sm:text-4xl text-foreground">
          Action Plan
        </h1>
        <p className="mt-2 text-muted-foreground italic font-display">
          Urgent alerts and stage-specific tasks to move your wealth forward.
        </p>
      </motion.div>

      {/* Section A: Priority Feed (urgent daily alerts) */}
      {insightResult && (
        <SectionContainer delay={0.05}>
          <PriorityFeed items={allInsightItems} max={5} />
        </SectionContainer>
      )}

      {/* Section B: Focus Card (single top action) */}
      {journey.focusItem && (
        <SectionContainer delay={0.1}>
          <FocusCard item={journey.focusItem} stageId={journey.stage.id} />
        </SectionContainer>
      )}

      {/* Section C: Full Stage Checklist */}
      <SectionContainer delay={0.15} className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Stage Checklist — {journey.stage.label}
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
    </DashboardPageShell>
  );
}
