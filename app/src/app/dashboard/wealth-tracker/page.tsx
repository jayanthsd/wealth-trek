"use client";

import { useMemo } from "react";
import { useNetWorthHistory } from "@/hooks/useNetWorthHistory";
import { StatementEntry } from "@/types";
import { Card } from "@/components/ui/card";
import { DashboardPageShell } from "@/components/DashboardPageShell";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import WealthPercentileSection from "@/components/WealthPercentileSection";

const PIE_COLORS = [
  "#1D9E75", "#378ADD", "#7F77DD", "#EF9F27",
  "#E05C6F", "#EC4899", "#06B6D4", "#84CC16",
];

// Net worth milestones (mirrors wealthPercentile.ts anchors + upper range)
const MILESTONES = [300_000, 1_000_000, 2_500_000, 10_000_000, 35_000_000, 100_000_000];
const MILESTONE_LABELS: Record<number, string> = {
  300_000: "₹3L",
  1_000_000: "₹10L",
  2_500_000: "₹25L",
  10_000_000: "₹1Cr",
  35_000_000: "₹3.5Cr",
  100_000_000: "₹10Cr",
};

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

function formatINR(value: number): string {
  if (Math.abs(value) >= 10_000_000) return `₹${(value / 10_000_000).toFixed(1)}Cr`;
  if (Math.abs(value) >= 100_000) return `₹${(value / 100_000).toFixed(1)}L`;
  if (Math.abs(value) >= 1_000) return `₹${(value / 1_000).toFixed(0)}K`;
  return formatCurrency(value);
}

function formatMonth(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

// ---------------------------------------------------------------------------
// Delta Chips — "What changed since last snapshot"
// ---------------------------------------------------------------------------

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
    { label: "Liabilities", value: liabilitiesDelta, invert: true }, // down = good
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
              {value > 0 ? "+" : ""}{formatINR(value)}
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

// ---------------------------------------------------------------------------
// Momentum Card — "Where you're headed"
// ---------------------------------------------------------------------------

function MomentumCard({
  avgMonthlyGrowth,
  nextMilestoneLabel,
  monthsToMilestone,
  projectedDate,
}: {
  avgMonthlyGrowth: number;
  nextMilestoneLabel: string;
  monthsToMilestone: number | null;
  projectedDate: string | null;
}) {
  const growing = avgMonthlyGrowth > 0;

  return (
    <div className={cn(
      "rounded-3xl border p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-5",
      growing ? "surface-card border-border shadow-glow" : "bg-foreground/3 border-foreground/8"
    )}>
      {/* Icon */}
      <div className={cn(
        "flex-shrink-0 h-12 w-12 rounded-2xl flex items-center justify-center",
        growing ? "bg-primary/10 border border-primary/20" : "bg-foreground/5 border border-foreground/10"
      )}>
        <Zap className={cn("h-5 w-5", growing ? "text-primary" : "text-muted-foreground")} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="label-caps mb-1">Momentum</p>
        {growing ? (
          <>
            <p className="text-lg font-bold text-foreground">
              Growing <span className="text-primary">{formatINR(avgMonthlyGrowth)}/month</span> avg
            </p>
            {projectedDate && monthsToMilestone !== null ? (
              <p className="text-sm text-muted-foreground mt-1">
                At this pace, you&apos;ll reach{" "}
                <span className="font-semibold text-foreground">{nextMilestoneLabel}</span>{" "}
                by <span className="font-semibold text-foreground">{projectedDate}</span>
                {monthsToMilestone <= 3 && (
                  <span className="ml-2 text-emerald-400 font-semibold text-xs">— very close!</span>
                )}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground mt-1">
                Already past {nextMilestoneLabel} — great work.
              </p>
            )}
          </>
        ) : (
          <>
            <p className="text-base font-semibold text-foreground">
              Net worth has declined recently
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {formatINR(Math.abs(avgMonthlyGrowth))}/month avg decrease. Review your liabilities and savings rate.
            </p>
          </>
        )}
      </div>

      {/* Metric tile */}
      {growing && monthsToMilestone !== null && (
        <div className="flex-shrink-0 text-center sm:text-right">
          <p className="text-3xl font-bold tabular-nums text-foreground">{monthsToMilestone}</p>
          <p className="text-xs text-muted-foreground mt-0.5">months to<br />{nextMilestoneLabel}</p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function WealthTrackerPage() {
  const { snapshots, loaded } = useNetWorthHistory();

  const sorted = useMemo(
    () => [...snapshots].sort((a, b) => a.date.localeCompare(b.date)),
    [snapshots]
  );

  const latest = sorted.length > 0 ? sorted[sorted.length - 1] : null;
  const previous = sorted.length > 1 ? sorted[sorted.length - 2] : null;

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
      liabilityPieData: Array.from(liabilityMap.entries()).map(([name, value]) => ({ name, value })),
    };
  }, [latest]);

  // Snapshot delta
  const snapshotDelta = useMemo(() => {
    if (!latest || !previous) return null;
    return {
      netWorthDelta: latest.netWorth - previous.netWorth,
      assetsDelta: latest.totalAssets - previous.totalAssets,
      liabilitiesDelta: latest.totalLiabilities - previous.totalLiabilities,
      previousDate: previous.date,
    };
  }, [latest, previous]);

  // Velocity & projection
  const momentum = useMemo(() => {
    if (sorted.length < 2 || !latest) return null;

    const recentSnaps = sorted.slice(-6);
    const oldest = recentSnaps[0];
    const newest = recentSnaps[recentSnaps.length - 1];
    const msPerMonth = 30.44 * 24 * 60 * 60 * 1000;
    const monthsDiff =
      (new Date(newest.date).getTime() - new Date(oldest.date).getTime()) / msPerMonth;

    if (monthsDiff < 0.5) return null;

    const avgMonthlyGrowth = (newest.netWorth - oldest.netWorth) / monthsDiff;
    const nextMilestone = MILESTONES.find((m) => m > latest.netWorth) ?? null;

    if (!nextMilestone) return { avgMonthlyGrowth, nextMilestoneAmount: null, nextMilestoneLabel: null, monthsToMilestone: null, projectedDate: null };

    const gap = nextMilestone - latest.netWorth;
    let monthsToMilestone: number | null = null;
    let projectedDate: string | null = null;

    if (avgMonthlyGrowth > 0 && gap > 0) {
      monthsToMilestone = Math.ceil(gap / avgMonthlyGrowth);
      const d = new Date();
      d.setMonth(d.getMonth() + monthsToMilestone);
      projectedDate = d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    }

    return {
      avgMonthlyGrowth,
      nextMilestoneAmount: nextMilestone,
      nextMilestoneLabel: MILESTONE_LABELS[nextMilestone],
      monthsToMilestone,
      projectedDate,
    };
  }, [sorted, latest]);

  if (!loaded) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-muted-foreground">Accessing private ledger...</p>
        </div>
      </div>
    );
  }

  if (snapshots.length === 0) {
    return (
      <DashboardPageShell variant="wide" className="space-y-6">
        <h1 className="text-4xl font-semibold text-brand-gradient mb-6">
          Wealth Tracker
        </h1>
        <Card className="flex flex-col items-center justify-center p-16 text-center border-dashed border-border">
          <div className="h-16 w-16 rounded-full bg-primary/5 border border-primary/20 flex items-center justify-center mb-6">
            <TrendingUp className="h-8 w-8 text-primary/60" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Initial Snapshot Pending
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md">
            Begin your journey by documenting your current assets and liabilities. Your growth story starts with the first entry.
          </p>
          <Link href="/dashboard/snapshot">
            <button className="min-h-12 rounded-full bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:scale-105 active:scale-95">
              Open Snapshot
            </button>
          </Link>
        </Card>
      </DashboardPageShell>
    );
  }

  const chartData = sorted.map((s) => ({
    date: s.date,
    "Total Assets": s.totalAssets,
    "Total Liabilities": s.totalLiabilities,
    "Net Worth": s.netWorth,
  }));

  return (
    <DashboardPageShell variant="wide" className="space-y-10">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-brand-gradient">
            Wealth Tracker
          </h1>
          <p className="mt-2 text-muted-foreground">
            A comprehensive overview of your financial velocity.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 rounded-full bg-primary/5 border border-primary/10 px-4 py-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="label-caps !text-primary">Live Insights</span>
        </div>
      </div>

      {/* Delta Chips — what changed since last snapshot */}
      {snapshotDelta && (
        <DeltaChips
          netWorthDelta={snapshotDelta.netWorthDelta}
          assetsDelta={snapshotDelta.assetsDelta}
          liabilitiesDelta={snapshotDelta.liabilitiesDelta}
          previousDate={snapshotDelta.previousDate}
        />
      )}

      {/* Wealth Percentile Section */}
      <WealthPercentileSection />

      {/* Momentum Card — velocity & projection */}
      {momentum && (
        <MomentumCard
          avgMonthlyGrowth={momentum.avgMonthlyGrowth}
          nextMilestoneLabel={momentum.nextMilestoneLabel ?? ""}
          monthsToMilestone={momentum.monthsToMilestone}
          projectedDate={momentum.projectedDate}
        />
      )}

      {/* Net Worth Trend */}
      <div className="surface-card rounded-3xl p-6 sm:p-8 border border-border shadow-glow">
        <h2 className="label-caps mb-8">
          Net Worth Trend
        </h2>
        <ResponsiveContainer width="100%" height={340}>
          <LineChart data={chartData} margin={{ top: 0, right: 16, left: 4, bottom: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.8} vertical={false} />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)", fontWeight: 500, fontFamily: "var(--font-sans)" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)", fontWeight: 500, fontFamily: "var(--font-sans)" }}
              tickFormatter={(v: number) =>
                new Intl.NumberFormat("en-IN", {
                  notation: "compact",
                  compactDisplay: "short",
                  maximumFractionDigits: 1,
                }).format(v)
              }
              width={40}
            />
            <Tooltip
              cursor={{ stroke: "var(--primary)", strokeWidth: 1, strokeDasharray: "4 4", opacity: 0.4 }}
              formatter={(value) => [formatCurrency(Number(value ?? 0)), ""]}
              contentStyle={{
                backgroundColor: "var(--card)",
                borderRadius: "16px",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow-soft)",
                fontSize: "12px",
                fontFamily: "var(--font-sans)",
                color: "var(--card-foreground)",
                padding: "12px",
              }}
              labelStyle={{ color: "var(--muted-foreground)", marginBottom: "4px", fontSize: "10px", fontFamily: "var(--font-sans)", textTransform: "uppercase", letterSpacing: "0.1em" }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingTop: "0px", paddingBottom: "30px", fontSize: "10px", fontFamily: "var(--font-sans)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, opacity: 0.7 }}
            />
            <Line
              type="monotone"
              dataKey="Total Assets"
              stroke="#1D9E75"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#1D9E75", strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              name="Assets"
            />
            <Line
              type="monotone"
              dataKey="Total Liabilities"
              stroke="#EF9F27"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#EF9F27", strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              name="Liabilities"
            />
            <Line
              type="monotone"
              dataKey="Net Worth"
              stroke="#378ADD"
              strokeWidth={3}
              dot={{ r: 5, fill: "#378ADD", strokeWidth: 0 }}
              activeDot={{ r: 8, strokeWidth: 0 }}
              name="Net Worth"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Asset & Liability Breakdown */}
      {(assetPieData.length > 0 || liabilityPieData.length > 0) && (
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
      )}
    </DashboardPageShell>
  );
}

// ---------------------------------------------------------------------------
// Breakdown Pie Card
// ---------------------------------------------------------------------------

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
                <span className="text-muted-foreground tabular-nums text-xs font-medium">{pct}%</span>
                <span className="text-foreground font-semibold tabular-nums text-xs w-20 text-right">
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
