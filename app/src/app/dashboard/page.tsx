"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { NetWorthCard } from "@/components/ui/NetWorthCard";
import { InsightCard } from "@/components/ui/InsightCard";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { useNetWorthHistory } from "@/hooks/useNetWorthHistory";
import { useFinancialGoals } from "@/hooks/useFinancialGoals";
import { useUserProfile } from "@/hooks/useUserProfile";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Plus,
  FileText,
  FlaskConical,
  type LucideIcon,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChartDataPoint {
  month: string;
  assets: number;
  liabilities: number;
}

interface InsightData {
  title: string;
  description: string;
  trend: "up" | "down";
}

interface GoalDisplay {
  name: string;
  status: string;
  targetAmount: number | null;
  color: string;
}

interface QuickAction {
  label: string;
  icon: LucideIcon;
  href: string;
}

// ---------------------------------------------------------------------------
// Sample data — shown when the user has no real data yet
// ---------------------------------------------------------------------------

const SAMPLE_NET_WORTH = { netWorth: 2700000, monthlyChange: 78000, percentageChange: 3.0 };

const SAMPLE_CHART: ChartDataPoint[] = [
  { month: "Jul", assets: 2800000, liabilities: 900000 },
  { month: "Aug", assets: 2950000, liabilities: 880000 },
  { month: "Sep", assets: 3100000, liabilities: 860000 },
  { month: "Oct", assets: 3050000, liabilities: 840000 },
  { month: "Nov", assets: 3250000, liabilities: 820000 },
  { month: "Dec", assets: 3500000, liabilities: 800000 },
];

const SAMPLE_INSIGHTS: InsightData[] = [
  { title: "Savings Increased", description: "You saved ₹20,000 more than last month. Keep the momentum going!", trend: "up" },
  { title: "Liabilities Decreasing", description: "Your total liabilities dropped by 2.4% — steady debt reduction.", trend: "down" },
  { title: "Asset Growth", description: "Mutual fund portfolio grew 7.2% this quarter, outpacing your target.", trend: "up" },
];

const SAMPLE_GOALS: GoalDisplay[] = [
  { name: "₹1Cr Net Worth", status: "active", targetAmount: 10000000, color: "from-purple-500 to-indigo-500" },
  { name: "Emergency Fund", status: "active", targetAmount: 600000, color: "from-emerald-400 to-teal-500" },
  { name: "Home Loan Payoff", status: "active", targetAmount: 2000000, color: "from-amber-400 to-orange-500" },
];

const GOAL_COLORS = [
  "from-purple-500 to-indigo-500",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
  "from-rose-400 to-pink-500",
  "from-blue-400 to-cyan-500",
];

const quickActions: QuickAction[] = [
  { label: "Add Asset", icon: Plus, href: "/dashboard/calculator" },
  { label: "Add Liability", icon: Plus, href: "/dashboard/calculator" },
  { label: "Generate Report", icon: FileText, href: "/dashboard/calculator" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatINR(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatLakhsCr(value: number): string {
  if (value >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
  return `${(value / 1000).toFixed(0)}K`;
}

function shortMonth(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { month: "short" });
}

function pctChange(prev: number, curr: number): number {
  if (prev === 0) return 0;
  return ((curr - prev) / Math.abs(prev)) * 100;
}

// ---------------------------------------------------------------------------
// Sample data badge
// ---------------------------------------------------------------------------

function SampleBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
      <FlaskConical className="h-3 w-3" aria-hidden />
      Sample Data
    </span>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DashboardHub() {
  const { snapshots, loaded: snapshotsLoaded } = useNetWorthHistory();
  const { goals: rawGoals, loaded: goalsLoaded } = useFinancialGoals();
  const { profile, loaded: profileLoaded } = useUserProfile();

  const allLoaded = snapshotsLoaded && goalsLoaded && profileLoaded;

  // --- Derived: snapshots → net worth card ----------------------------------
  const hasSnapshots = snapshots.length > 0;
  const sortedSnapshots = useMemo(
    () => [...snapshots].sort((a, b) => a.date.localeCompare(b.date)),
    [snapshots]
  );

  const netWorthData = useMemo(() => {
    if (!hasSnapshots) return SAMPLE_NET_WORTH;
    const latest = sortedSnapshots[sortedSnapshots.length - 1];
    const prev = sortedSnapshots.length >= 2 ? sortedSnapshots[sortedSnapshots.length - 2] : null;
    const monthlyChange = prev ? latest.netWorth - prev.netWorth : 0;
    const percentageChange = prev ? pctChange(prev.netWorth, latest.netWorth) : 0;
    return { netWorth: latest.netWorth, monthlyChange, percentageChange };
  }, [sortedSnapshots, hasSnapshots]);

  // --- Derived: snapshots → chart data --------------------------------------
  const chartData: ChartDataPoint[] = useMemo(() => {
    if (sortedSnapshots.length < 2) return SAMPLE_CHART;
    return sortedSnapshots.map((s) => ({
      month: shortMonth(s.date),
      assets: s.totalAssets,
      liabilities: s.totalLiabilities,
    }));
  }, [sortedSnapshots]);
  const isChartSample = sortedSnapshots.length < 2;

  // --- Derived: snapshots → insights ----------------------------------------
  const insightsData: InsightData[] = useMemo(() => {
    if (sortedSnapshots.length < 2) return SAMPLE_INSIGHTS;
    const latest = sortedSnapshots[sortedSnapshots.length - 1];
    const prev = sortedSnapshots[sortedSnapshots.length - 2];
    const result: InsightData[] = [];

    const nwChange = latest.netWorth - prev.netWorth;
    result.push({
      title: nwChange >= 0 ? "Net Worth Grew" : "Net Worth Dipped",
      description: `Your net worth ${nwChange >= 0 ? "increased" : "decreased"} by ${formatINR(Math.abs(nwChange))} since your last snapshot.`,
      trend: nwChange >= 0 ? "up" : "down",
    });

    const assetPct = pctChange(prev.totalAssets, latest.totalAssets);
    result.push({
      title: assetPct >= 0 ? "Assets Growing" : "Assets Declined",
      description: `Total assets ${assetPct >= 0 ? "rose" : "fell"} by ${Math.abs(assetPct).toFixed(1)}% compared to last snapshot.`,
      trend: assetPct >= 0 ? "up" : "down",
    });

    const liabChange = latest.totalLiabilities - prev.totalLiabilities;
    result.push({
      title: liabChange <= 0 ? "Liabilities Decreasing" : "Liabilities Increased",
      description: liabChange <= 0
        ? `Great progress — liabilities reduced by ${formatINR(Math.abs(liabChange))}.`
        : `Liabilities went up by ${formatINR(Math.abs(liabChange))}. Review your debts.`,
      trend: liabChange <= 0 ? "down" : "up",
    });

    return result;
  }, [sortedSnapshots]);
  const isInsightsSample = sortedSnapshots.length < 2;

  // --- Derived: goals -------------------------------------------------------
  const hasGoals = rawGoals.length > 0;
  const activeGoals = useMemo(
    () => rawGoals.filter((g) => g.status === "active"),
    [rawGoals]
  );
  const goalsDisplay: GoalDisplay[] = useMemo(() => {
    if (!hasGoals) return SAMPLE_GOALS;
    return activeGoals.slice(0, 5).map((g, i) => ({
      name: g.title,
      status: g.status,
      targetAmount: g.targetAmount ?? null,
      color: GOAL_COLORS[i % GOAL_COLORS.length],
    }));
  }, [activeGoals, hasGoals]);

  // --- Derived: user greeting -----------------------------------------------
  const firstName = profile.fullName
    ? profile.fullName.split(" ")[0]
    : "there";

  // --- Derived: growth text in header ---------------------------------------
  const growthText = useMemo(() => {
    if (!hasSnapshots) return null;
    const pct = netWorthData.percentageChange;
    if (pct === 0) return null;
    return { pct: Math.abs(pct).toFixed(1), positive: pct > 0 };
  }, [hasSnapshots, netWorthData.percentageChange]);

  // --- Loading state --------------------------------------------------------
  if (!allLoaded) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header + Quick Actions */}
      <SectionContainer>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Welcome back, {firstName} 👋
            </h1>
            {growthText ? (
              <p className="mt-1 text-muted-foreground">
                Your wealth {growthText.positive ? "grew" : "dipped"}{" "}
                <span
                  className={`font-semibold ${growthText.positive ? "text-emerald-600" : "text-red-600"}`}
                >
                  {growthText.pct}%
                </span>{" "}
                since last snapshot
              </p>
            ) : (
              <p className="mt-1 text-muted-foreground">
                Start tracking to see your wealth trend here.
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <Link key={action.label} href={action.href}>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-white/70 px-4 py-2 text-sm font-semibold text-foreground shadow-sm backdrop-blur-md transition-shadow hover:shadow-md dark:bg-gray-900/70"
                >
                  <action.icon className="h-4 w-4" aria-hidden />
                  {action.label}
                </motion.button>
              </Link>
            ))}
          </div>
        </div>
      </SectionContainer>

      {/* Top row: Net Worth + Goals  |  Chart */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        {/* Left column */}
        <SectionContainer delay={0.1} className="xl:col-span-2">
          <div className="flex h-full flex-col gap-6">
            <div className="relative">
              {!hasSnapshots && (
                <div className="absolute right-4 top-4 z-10">
                  <SampleBadge />
                </div>
              )}
              <NetWorthCard
                netWorth={netWorthData.netWorth}
                monthlyChange={netWorthData.monthlyChange}
                percentageChange={netWorthData.percentageChange}
              />
            </div>

            {/* Goals */}
            <Card className="relative flex-1 rounded-2xl p-5 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Goals
                </h2>
                {!hasGoals && <SampleBadge />}
              </div>
              {goalsDisplay.length > 0 ? (
                <div className="space-y-3.5">
                  {goalsDisplay.map((goal) => (
                    <div key={goal.name}>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">
                          {goal.name}
                        </span>
                        {goal.targetAmount && (
                          <span className="text-xs font-semibold text-muted-foreground">
                            {formatLakhsCr(goal.targetAmount)}
                          </span>
                        )}
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: goal.targetAmount && hasSnapshots
                              ? `${Math.min(Math.round((netWorthData.netWorth / goal.targetAmount) * 100), 100)}%`
                              : hasGoals
                                ? "0%"
                                : `${Math.min(Math.round((SAMPLE_NET_WORTH.netWorth / (goal.targetAmount ?? 1)) * 100), 100)}%`,
                          }}
                          transition={{
                            duration: 1,
                            delay: 0.3,
                            ease: [0.21, 0.47, 0.32, 0.98],
                          }}
                          className={`h-full rounded-full bg-gradient-to-r ${goal.color}`}
                        />
                      </div>
                    </div>
                  ))}
                  {hasGoals && (
                    <Link
                      href="/dashboard/goals"
                      className="mt-2 block text-xs font-medium text-purple-600 hover:underline"
                    >
                      View all goals →
                    </Link>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No active goals.{" "}
                  <Link href="/dashboard/chat" className="font-medium text-purple-600 hover:underline">
                    Chat with your advisor
                  </Link>{" "}
                  to set one.
                </p>
              )}
            </Card>
          </div>
        </SectionContainer>

        {/* Right column — Chart */}
        <SectionContainer delay={0.2} className="xl:col-span-3">
          <Card className="relative h-full rounded-2xl p-5 shadow-lg sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Assets vs Liabilities
              </h2>
              {isChartSample && <SampleBadge />}
            </div>
            <ResponsiveContainer width="100%" height={340}>
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="currentColor"
                  strokeOpacity={0.08}
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "currentColor", opacity: 0.5 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatLakhsCr}
                  tick={{ fontSize: 12, fill: "currentColor", opacity: 0.5 }}
                  width={48}
                />
                <Tooltip
                  formatter={(value) =>
                    new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                      maximumFractionDigits: 0,
                    }).format(Number(value ?? 0))
                  }
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid rgba(0,0,0,0.08)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    fontSize: "13px",
                  }}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="assets"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={false}
                  name="Assets"
                  animationDuration={1200}
                  animationEasing="ease-out"
                />
                <Line
                  type="monotone"
                  dataKey="liabilities"
                  stroke="#F59E0B"
                  strokeWidth={3}
                  dot={false}
                  name="Liabilities"
                  animationDuration={1200}
                  animationEasing="ease-out"
                />
              </LineChart>
            </ResponsiveContainer>
            {isChartSample && (
              <p className="mt-3 text-xs text-muted-foreground">
                Save at least 2 snapshots in the{" "}
                <Link href="/dashboard/calculator" className="font-medium text-purple-600 hover:underline">
                  Calculator
                </Link>{" "}
                to see your real trend here.
              </p>
            )}
          </Card>
        </SectionContainer>
      </div>

      {/* Insights row */}
      <SectionContainer delay={0.3}>
        <div className="mb-3 flex items-center gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Insights
          </h2>
          {isInsightsSample && <SampleBadge />}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {insightsData.map((insight, index) => (
            <SectionContainer key={insight.title} delay={0.35 + index * 0.08}>
              <InsightCard
                title={insight.title}
                description={insight.description}
                trend={insight.trend}
              />
            </SectionContainer>
          ))}
        </div>
      </SectionContainer>
    </div>
  );
}
