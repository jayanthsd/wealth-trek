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
  Sparkles,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
// Constants
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
  { name: "₹1Cr Net Worth", status: "active", targetAmount: 10000000, color: "from-primary to-primary/60" },
  { name: "Emergency Fund", status: "active", targetAmount: 600000, color: "from-success to-success/60" },
  { name: "Home Loan Payoff", status: "active", targetAmount: 2000000, color: "from-destructive to-destructive/60" },
];

const GOAL_COLORS = [
  "from-primary to-primary/60",
  "from-success to-success/60",
  "from-destructive to-destructive/60",
  "from-primary/80 to-primary/40",
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
  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.abs(value));
  return (value < 0 ? "- " : "") + formatted;
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
    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-primary italic">
      <FlaskConical className="h-2.5 w-2.5" aria-hidden />
      Simulation Mode
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
    : "Member";

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
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="font-display italic text-foreground/40">Synchronizing vault...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 px-4 py-10 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header + Quick Actions */}
      <SectionContainer>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-display italic text-4xl text-foreground sm:text-5xl">
              Welcome back, {firstName}
            </h1>
            {growthText ? (
              <p className="mt-2 text-foreground/50 italic font-display text-lg">
                Your wealth {growthText.positive ? "ascended" : "receded"}{" "}
                <span
                  className={cn(
                    "font-semibold not-italic tabular-nums",
                    growthText.positive ? "text-success" : "text-destructive"
                  )}
                >
                  {growthText.pct}%
                </span>{" "}
                this period.
              </p>
            ) : (
              <p className="mt-2 text-foreground/50 italic font-display text-lg">
                Begin your documentation to visualize your trajectory.
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {quickActions.map((action) => (
              <Link key={action.label} href={action.href}>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="surface-card group inline-flex items-center gap-3 rounded-2xl px-5 py-3 text-xs font-bold uppercase tracking-widest text-foreground/60 transition-all hover:text-primary hover:border-primary/30"
                >
                  <action.icon className="h-4 w-4 text-primary/50 group-hover:text-primary transition-colors" aria-hidden />
                  {action.label}
                </motion.button>
              </Link>
            ))}
          </div>
        </div>
      </SectionContainer>

      {/* Top row: Net Worth + Goals  |  Chart */}
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-5">
        {/* Left column */}
        <SectionContainer delay={0.1} className="xl:col-span-2 space-y-8">
          <div className="relative group">
            {!hasSnapshots && (
              <div className="absolute right-6 top-6 z-10">
                <SampleBadge />
              </div>
            )}
            <NetWorthCard
              netWorth={netWorthData.netWorth}
              monthlyChange={netWorthData.monthlyChange}
              percentageChange={netWorthData.percentageChange}
              className="shadow-glow"
            />
          </div>

          {/* Goals */}
          <div className="surface-card rounded-3xl p-6 sm:p-8 border border-white/5 relative">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">
                Milestones
              </h2>
              {!hasGoals && <SampleBadge />}
            </div>
            {goalsDisplay.length > 0 ? (
              <div className="space-y-6">
                {goalsDisplay.map((goal) => (
                  <div key={goal.name} className="group/goal">
                    <div className="mb-2.5 flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground/80 group-hover/goal:text-primary transition-colors">
                        {goal.name}
                      </span>
                      {goal.targetAmount && (
                        <span className="text-[10px] font-bold tabular-nums text-foreground/30">
                          {formatLakhsCr(goal.targetAmount)}
                        </span>
                      )}
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5 border border-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{
                          width: goal.targetAmount && hasSnapshots
                            ? `${Math.min(Math.round((netWorthData.netWorth / goal.targetAmount) * 100), 100)}%`
                            : hasGoals
                              ? "0%"
                              : `${Math.min(Math.round((SAMPLE_NET_WORTH.netWorth / (goal.targetAmount ?? 1)) * 100), 100)}%`,
                        }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 1.5,
                          delay: 0.5,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className={cn("h-full rounded-full bg-gradient-to-r shadow-[0_0_10px_rgba(198,165,88,0.2)]", goal.color)}
                      />
                    </div>
                  </div>
                ))}
                {hasGoals && (
                  <Link
                    href="/dashboard/goals"
                    className="mt-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary/60 hover:text-primary transition-colors"
                  >
                    Manage All Goals <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            ) : (
              <div className="py-4 text-center">
                <p className="text-sm text-foreground/40 italic font-display mb-4">
                  Define your targets to activate tracking.
                </p>
                <Link href="/dashboard/chat">
                   <button className="text-[10px] font-bold uppercase tracking-widest text-primary border border-primary/20 px-4 py-2 rounded-full hover:bg-primary/5 transition-colors">
                      Consult Advisor
                   </button>
                </Link>
              </div>
            )}
          </div>
        </SectionContainer>

        {/* Right column — Chart */}
        <SectionContainer delay={0.2} className="xl:col-span-3">
          <div className="surface-card h-full rounded-3xl p-6 sm:p-8 border border-white/5 shadow-glow relative">
            <div className="mb-10 flex items-center justify-between">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">
                Growth Allocation
              </h2>
              {isChartSample && <SampleBadge />}
            </div>
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={chartData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.94 0.008 80)"
                  strokeOpacity={0.05}
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "oklch(0.94 0.008 80)", opacity: 0.4, fontWeight: 500 }}
                  dy={15}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatLakhsCr}
                  tick={{ fontSize: 11, fill: "oklch(0.94 0.008 80)", opacity: 0.4, fontWeight: 500 }}
                  width={40}
                />
                <Tooltip
                  cursor={{ stroke: 'oklch(0.78 0.12 80)', strokeWidth: 1, strokeDasharray: '4 4' }}
                  formatter={(value) => [formatINR(Number(value ?? 0)), ""]}
                  contentStyle={{
                    backgroundColor: "oklch(0.13 0.007 60)",
                    borderRadius: "16px",
                    border: "1px solid oklch(0.78 0.12 80 / 0.2)",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                    fontSize: "12px",
                    color: "oklch(0.94 0.008 80)",
                    padding: "12px",
                  }}
                  labelStyle={{ color: "oklch(0.94 0.008 80 / 0.5)", marginBottom: "4px", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em" }}
                />
                <Legend 
                  verticalAlign="top" 
                  align="right" 
                  iconType="circle"
                  wrapperStyle={{ paddingTop: "0px", paddingBottom: "30px", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, opacity: 0.7 }}
                />
                <Line
                  type="monotone"
                  dataKey="assets"
                  stroke="oklch(0.62 0.14 150)"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "oklch(0.62 0.14 150)", strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  name="Assets"
                  animationDuration={1500}
                />
                <Line
                  type="monotone"
                  dataKey="liabilities"
                  stroke="oklch(0.65 0.15 45)"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "oklch(0.65 0.15 45)", strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  name="Liabilities"
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
            {isChartSample && (
              <div className="mt-8 flex items-center gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                 <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                 <p className="text-[10px] text-primary/70 font-bold uppercase tracking-widest leading-relaxed">
                   Enter real data in the <Link href="/dashboard/calculator" className="underline">Calculator</Link> to unlock personalized velocity projections.
                 </p>
              </div>
            )}
          </div>
        </SectionContainer>
      </div>

      {/* Insights row */}
      <SectionContainer delay={0.3}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">
            Intelligence Feed
          </h2>
          <div className="h-px flex-1 mx-6 bg-white/5" />
          {isInsightsSample && <SampleBadge />}
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {insightsData.map((insight, index) => (
            <SectionContainer key={insight.title} delay={0.35 + index * 0.1}>
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
