"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { RefreshCw, TrendingUp } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type {
  WealthPercentileResult,
  WealthStage,
  MilestoneStatus,
} from "@/lib/wealthPercentile";
import { STAGES, formatINRPublic, getWealthStage } from "@/lib/wealthPercentile";

// --- Types ---

interface PercentileResponse extends WealthPercentileResult {
  lastUpdated: string;
}

interface ErrorResponse {
  error: string;
  message?: string;
}

type ApiResult = PercentileResponse | ErrorResponse;

function isError(r: ApiResult): r is ErrorResponse {
  return "error" in r && r.error !== undefined;
}

// --- Main Component ---

export default function WealthPercentileSection() {
  const [data, setData] = useState<PercentileResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch("/api/wealth/percentile");
      const json: ApiResult = await res.json();

      if (isError(json)) {
        setError(json.error);
        setData(null);
      } else {
        setData(json);
        setError(null);
      }
    } catch {
      setError("FETCH_FAILED");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <LoadingSkeleton />;
  if (error === "NO_STATEMENTS") return <EmptyState />;
  if (error || !data) return null;

  return (
    <div className="surface-card rounded-3xl p-6 sm:p-8 border border-border space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="label-caps">Wealth Percentile</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Based on your linked accounts · Updated {data.lastUpdated}
          </p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="h-8 w-8 inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
        >
          <RefreshCw
            className={cn("h-4 w-4", refreshing && "animate-spin")}
          />
        </button>
      </div>

      {/* Gauge + Info Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PercentileGauge percentile={data.percentile} />
        <InfoCard
          percentile={data.percentile}
          stage={data.stage}
          insightMessage={data.insightMessage}
        />
      </div>

      {/* 2-col Metrics */}
      <MetricTiles
        netWorth={data.netWorth}
        nextMilestone={data.nextMilestone}
      />

      {/* Stage Stepper */}
      <StageStepper currentStage={data.stage} />

      {/* Milestones List */}
      <MilestonesList
        milestones={data.milestonesStatus}
        progressToNext={data.progressToNext}
      />
    </div>
  );
}

// --- Loading Skeleton ---

function LoadingSkeleton() {
  return (
    <div className="surface-card rounded-3xl p-6 sm:p-8 border border-border space-y-8 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-3 w-32 bg-muted rounded" />
          <div className="h-2 w-48 bg-muted rounded" />
        </div>
        <div className="h-8 w-8 bg-muted rounded-full" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-48 bg-muted rounded-2xl" />
        <div className="h-48 bg-muted rounded-2xl space-y-4 p-6">
          <div className="h-6 w-24 bg-secondary rounded" />
          <div className="h-4 w-36 bg-secondary rounded" />
          <div className="h-4 w-28 bg-secondary rounded" />
          <div className="h-16 bg-secondary rounded-xl" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-20 bg-muted rounded-2xl" />
        <div className="h-20 bg-muted rounded-2xl" />
      </div>
      <div className="flex items-center justify-between gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="h-4 w-4 bg-muted rounded-full" />
            <div className="h-2 w-12 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Empty State ---

function EmptyState() {
  return (
    <div className="surface-card rounded-3xl p-6 sm:p-8 border border-border">
      <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-border bg-transparent">
        <div className="h-14 w-14 rounded-full bg-primary/5 border border-primary/20 flex items-center justify-center mb-5">
          <TrendingUp className="h-7 w-7 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Connect your accounts to see where you stand
        </h3>
        <p className="text-sm text-muted mb-6 max-w-sm">
          Take your first net worth snapshot to unlock your India wealth
          percentile ranking.
        </p>
        <Link href="/dashboard/snapshot">
          <button className="min-h-10 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:scale-105 active:scale-95">
            Take Snapshot
          </button>
        </Link>
      </Card>
    </div>
  );
}

// --- SVG Gauge ---

function PercentileGauge({ percentile }: { percentile: number }) {
  const radius = 80;
  const strokeWidth = 14;
  const cx = 100;
  const cy = 95;

  // Arc from 180° (left) to 0° (right) — semicircle
  const startAngle = Math.PI;
  const endAngle = 0;
  const fillAngle = startAngle - (percentile / 100) * Math.PI;

  const describeArc = (start: number, end: number) => {
    const x1 = cx + radius * Math.cos(start);
    const y1 = cy - radius * Math.sin(start);
    const x2 = cx + radius * Math.cos(end);
    const y2 = cy - radius * Math.sin(end);
    const largeArc = Math.abs(start - end) > Math.PI ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  const trackPath = describeArc(startAngle, endAngle);
  const fillPath = describeArc(startAngle, fillAngle);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <svg viewBox="0 0 200 110" className="w-full max-w-[240px]">
        {/* Track */}
        <path
          d={trackPath}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="text-muted"
        />
        {/* Fill */}
        <path
          d={fillPath}
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Gradient definition */}
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1D9E75" />
            <stop offset="100%" stopColor="#7F77DD" />
          </linearGradient>
        </defs>
        {/* Center label */}
        <text
          x={cx}
          y={cy - 18}
          textAnchor="middle"
          className="fill-foreground text-[34px] font-bold"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {Math.round(percentile)}
        </text>
        <text
          x={cx}
          y={cy + 2}
          textAnchor="middle"
          className="fill-muted-foreground text-[9px] tracking-wide font-medium"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          out of 100
        </text>
        {/* End labels */}
        <text
          x={cx - radius - 2}
          y={cy + 14}
          textAnchor="middle"
          className="fill-muted-foreground text-[10px] font-medium"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          0
        </text>
        <text
          x={cx + radius + 2}
          y={cy + 14}
          textAnchor="middle"
          className="fill-muted-foreground text-[10px] font-medium"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          100
        </text>
      </svg>
    </div>
  );
}

// --- Info Card ---

function InfoCard({
  percentile,
  stage,
  insightMessage,
}: {
  percentile: number;
  stage: WealthStage;
  insightMessage: string;
}) {
  const pRounded = Math.round(percentile);

  return (
    <div className="flex flex-col justify-center gap-5">
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-1">
          You&apos;re wealthier than
        </p>
        <p className="text-3xl font-bold tracking-tight text-foreground">
          {pRounded}% of Indians
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-lg bg-purple-500/10 px-3 py-2 w-fit">
        <span className="h-2 w-2 rounded-full bg-purple-500" />
        <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
          {stage.name} Stage
        </span>
      </div>

      <div className="rounded-xl bg-secondary border border-border px-4 py-3">
        <p className="text-sm text-foreground/80 leading-relaxed">
          {insightMessage}
        </p>
      </div>
    </div>
  );
}

// --- Metric Tiles ---

function MetricTiles({
  netWorth,
  nextMilestone,
}: {
  netWorth: number;
  nextMilestone: number | null;
}) {
  const distance = nextMilestone ? nextMilestone - netWorth : null;

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="rounded-2xl bg-secondary border border-border p-4">
        <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">
          Net Worth
        </p>
        <p className="text-xl font-bold text-foreground tabular-nums">
          {formatINRPublic(netWorth)}
        </p>
      </div>
      <div className="rounded-2xl bg-secondary border border-border p-4">
        <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">
          Next Milestone
        </p>
        {nextMilestone ? (
          <div>
            <p className="text-xl font-bold text-foreground tabular-nums">
              {formatINRPublic(nextMilestone)}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatINRPublic(distance!)} away
            </p>
          </div>
        ) : (
          <p className="text-sm font-semibold text-success">All reached ✓</p>
        )}
      </div>
    </div>
  );
}

// --- Stage Stepper ---

function StageStepper({ currentStage }: { currentStage: WealthStage }) {
  const currentIdx = STAGES.findIndex(
    (s) => s.name === currentStage.name
  );

  return (
    <div className="w-full">
      <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-4">
        Journey Stage
      </p>
      <div className="flex items-center justify-between relative">
        {/* Connector line */}
        <div className="absolute top-[9px] left-4 right-4 h-0.5 bg-border" />
        <div
          className="absolute top-[9px] left-4 h-0.5 bg-gradient-to-r from-green-500 to-purple-500 transition-all duration-500"
          style={{
            width: `${(currentIdx / (STAGES.length - 1)) * 100}%`,
            maxWidth: "calc(100% - 32px)",
          }}
        />

        {STAGES.map((stage, i) => {
          const isPast = i < currentIdx;
          const isActive = i === currentIdx;
          const isFuture = i > currentIdx;

          return (
            <div
              key={stage.name}
              className="flex flex-col items-center gap-1.5 relative z-10"
            >
              <div
                className={cn(
                  "h-[18px] w-[18px] rounded-full border-2 transition-all",
                  isPast && "bg-green-500 border-green-500",
                  isActive &&
                    "bg-purple-500 border-purple-500 ring-4 ring-purple-500/20",
                  isFuture && "bg-transparent border-border"
                )}
              />
              <span
                className={cn(
                  "text-[9px] font-semibold text-center whitespace-nowrap leading-tight",
                  isPast && "text-green-600",
                  isActive && "text-purple-600",
                  isFuture && "text-muted-foreground/60"
                )}
              >
                {stage.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- Milestones List ---

function MilestonesList({
  milestones,
  progressToNext,
}: {
  milestones: MilestoneStatus[];
  progressToNext: number;
}) {
  return (
    <div className="space-y-3">
      <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
        Milestones
      </p>
      <div className="space-y-2">
        {milestones.map((m) => (
          <div
            key={m.amount}
            className="flex items-center gap-3 rounded-xl px-4 py-2.5 bg-secondary border border-border"
          >
            {/* Status dot */}
            <div
              className={cn(
                "h-2.5 w-2.5 rounded-full flex-shrink-0",
                m.reached && "bg-green-500",
                m.isNext && "bg-purple-500",
                !m.reached && !m.isNext && "bg-muted"
              )}
            />

            {/* Amount + stage */}
            <div className="flex-1 min-w-0">
              <span
                className={cn(
                  "text-sm font-semibold",
                  m.reached && "text-foreground",
                  m.isNext && "text-foreground",
                  !m.reached && !m.isNext && "text-muted-foreground"
                )}
              >
                {formatINRPublic(m.amount)}
              </span>
              <span className="text-xs text-muted-foreground ml-2">
                — {getWealthStage(m.percentile).name}
              </span>
            </div>

            {/* Status label / progress */}
            <div className="flex-shrink-0">
              {m.reached && (
                <span className="text-xs font-semibold text-green-600">
                  Reached
                </span>
              )}
              {m.isNext && (
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full transition-all"
                      style={{ width: `${Math.min(progressToNext, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-purple-600 tabular-nums">
                    {Math.round(progressToNext)}%
                  </span>
                </div>
              )}
              {!m.reached && !m.isNext && (
                <span className="text-xs text-muted-foreground/70">Upcoming</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
