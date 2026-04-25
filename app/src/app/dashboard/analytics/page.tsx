"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  BarChart3,
  Shield,
  TrendingUp,
  Scale,
  Zap,
} from "lucide-react";

import { useNetWorthHistory } from "@/hooks/useNetWorthHistory";
import { useAdvancedInputs } from "@/hooks/useAdvancedInputs";
import type { InsightDomain, InsightItem } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { computeAllInsights } from "@/lib/insightsEngine";
import {
  computeWealthHealthScore,
  scoreHeadline,
} from "@/lib/wealthHealthScore";
import { classifyWealthStage } from "@/lib/wealthStage";

import { WealthHealthScoreCard } from "@/components/analytics/WealthHealthScore";
import { PriorityFeed } from "@/components/analytics/PriorityFeed";
import { DomainGroup, type DomainGroupConfig } from "@/components/analytics/DomainGroup";
import { UnlockStrip } from "@/components/analytics/UnlockStrip";

const DOMAIN_GROUPS: DomainGroupConfig[] = [
  {
    id: "growing",
    label: "Growing",
    description: "How your wealth is compounding over time",
    icon: TrendingUp,
    domains: ["growth", "trajectory", "behavior"],
  },
  {
    id: "protecting",
    label: "Protecting",
    description: "Your safety nets against shocks and emergencies",
    icon: Shield,
    domains: ["liquidity", "protection", "risk"],
  },
  {
    id: "optimizing",
    label: "Optimizing",
    description: "Making every rupee work harder",
    icon: Zap,
    domains: ["efficiency", "tax_efficiency", "inflation_audit"],
  },
  {
    id: "borrowing",
    label: "Borrowing wisely",
    description: "Leverage and debt quality",
    icon: Scale,
    domains: ["leverage", "debt_quality", "gap_analysis"],
  },
];

function flattenForGroup(
  group: DomainGroupConfig,
  domains: Record<InsightDomain, InsightItem[]>
): InsightItem[] {
  return group.domains.flatMap((d) => domains[d]);
}

export default function AnalyticsPage() {
  const { snapshots, loaded } = useNetWorthHistory();
  const { inputs: advancedInputs, save: saveAdvancedInputs, loaded: advLoaded } =
    useAdvancedInputs();

  const sorted = useMemo(
    () => [...snapshots].sort((a, b) => a.date.localeCompare(b.date)),
    [snapshots]
  );

  const insightResult = useMemo(
    () =>
      loaded && advLoaded ? computeAllInsights(sorted, undefined, advancedInputs) : null,
    [sorted, loaded, advLoaded, advancedInputs]
  );

  const latest = sorted.length > 0 ? sorted[sorted.length - 1] : null;
  const previous = sorted.length >= 2 ? sorted[sorted.length - 2] : null;
  const hasPair = !!latest && !!previous;

  const healthScore = useMemo(() => {
    if (!insightResult) return null;
    return computeWealthHealthScore(insightResult, latest?.netWorth ?? null);
  }, [insightResult, latest]);

  const previousScore = useMemo(() => {
    if (!previous || sorted.length < 2) return null;
    const priorSnapshots = sorted.slice(0, -1);
    const prevInsights = computeAllInsights(priorSnapshots, undefined, advancedInputs);
    return computeWealthHealthScore(prevInsights, previous.netWorth);
  }, [sorted, previous, advancedInputs]);

  const allInsightItems = useMemo(() => {
    if (!insightResult) return [];
    return Object.values(insightResult.domains).flat();
  }, [insightResult]);

  const stageLabel = latest
    ? classifyWealthStage(latest.netWorth).label
    : null;

  if (!loaded) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="font-display italic text-muted-foreground">
            Analysing your wealth...
          </p>
        </div>
      </div>
    );
  }

  if (!latest) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <h1 className="font-display italic text-3xl text-foreground mb-6">
          Financial Health
        </h1>
        <Card className="flex flex-col items-center justify-center p-12 text-center surface-card rounded-3xl">
          <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">No data yet</h2>
          <p className="text-muted-foreground mb-6 max-w-md italic font-display">
            Start by recording your first net worth snapshot in the Calculator. Your
            financial health check will appear here.
          </p>
          <Link href="/dashboard/calculator">
            <Button>Go to Net Worth Calculator</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const delta =
    healthScore && previousScore ? healthScore.score - previousScore.score : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-display italic text-3xl sm:text-4xl text-foreground">
          Financial Health
        </h1>
        <p className="mt-2 text-muted-foreground italic font-display">
          {hasPair ? (
            <>
              Analysis based on your snapshots from{" "}
              <span className="font-semibold not-italic text-foreground">
                {previous!.date}
              </span>{" "}
              to{" "}
              <span className="font-semibold not-italic text-foreground">
                {latest.date}
              </span>
              .
            </>
          ) : (
            <>
              Based on your snapshot from{" "}
              <span className="font-semibold not-italic text-foreground">
                {latest.date}
              </span>
              . Add more snapshots for deeper analysis.
            </>
          )}
        </p>
      </motion.div>

      {/* Unlock strip (advanced inputs) */}
      <UnlockStrip inputs={advancedInputs} onSave={saveAdvancedInputs} />

      {/* Hero: Wealth Health Score */}
      {healthScore && (
        <WealthHealthScoreCard
          score={healthScore}
          headline={scoreHeadline(healthScore)}
          delta={delta}
          stageLabel={stageLabel}
        />
      )}

      {/* Priority Feed — top attention items across all domains */}
      {insightResult && <PriorityFeed items={allInsightItems} max={5} />}

      {/* 4 Domain Groups */}
      {insightResult && (
        <div>
          <div className="flex items-baseline gap-3 mb-4">
            <h2 className="font-display italic text-2xl text-foreground">
              Full breakdown
            </h2>
            <span className="text-xs text-muted-foreground">
              Click any area to expand
            </span>
          </div>

          <div className="space-y-3">
            {DOMAIN_GROUPS.map((group) => (
              <DomainGroup
                key={group.id}
                config={group}
                items={flattenForGroup(group, insightResult.domains)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Encouragement when only 1 snapshot */}
      {!hasPair && (
        <Card className="p-5 surface-card rounded-2xl border border-primary/10">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-primary/50 shrink-0" />
            <p className="text-sm text-foreground/50 italic font-display">
              Add another snapshot to unlock comparative insights — growth trends, debt
              trajectory, and savings consistency.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
