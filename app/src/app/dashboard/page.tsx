"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { NetWorthCard } from "@/components/ui/NetWorthCard";
import { InsightCard } from "@/components/ui/InsightCard";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { DashboardPageShell } from "@/components/DashboardPageShell";
import { useNetWorthHistory } from "@/hooks/useNetWorthHistory";
import { useUserProfile } from "@/hooks/useUserProfile";
import { FirstSnapshotOnboarding } from "@/components/FirstSnapshotOnboarding";
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
  Sparkles,
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

interface QuickAction {
  label: string;
  icon: LucideIcon;
  href: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const EMPTY_NET_WORTH = { netWorth: 0, monthlyChange: 0, percentageChange: 0 };

const quickActions: QuickAction[] = [
  { label: "Add Asset", icon: Plus, href: "/dashboard/snapshot" },
  { label: "Add Liability", icon: Plus, href: "/dashboard/snapshot" },
  { label: "Generate Report", icon: FileText, href: "/dashboard/snapshot" },
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
// Component
// ---------------------------------------------------------------------------

export default function DashboardHub() {
  const { snapshots, loaded: snapshotsLoaded } = useNetWorthHistory();
  const { profile, loaded: profileLoaded } = useUserProfile();
  const [dismissed, setDismissed] = useState(false);

  const allLoaded = snapshotsLoaded && profileLoaded;

  // --- Derived: snapshots → net worth card ----------------------------------
  const hasSnapshots = snapshots.length > 0;
  const sortedSnapshots = useMemo(
    () => [...snapshots].sort((a, b) => a.date.localeCompare(b.date)),
    [snapshots]
  );

  const netWorthData = useMemo(() => {
    if (!hasSnapshots) return EMPTY_NET_WORTH;
    const latest = sortedSnapshots[sortedSnapshots.length - 1];
    const prev = sortedSnapshots.length >= 2 ? sortedSnapshots[sortedSnapshots.length - 2] : null;
    const monthlyChange = prev ? latest.netWorth - prev.netWorth : 0;
    const percentageChange = prev ? pctChange(prev.netWorth, latest.netWorth) : 0;
    return { netWorth: latest.netWorth, monthlyChange, percentageChange };
  }, [sortedSnapshots, hasSnapshots]);

  // --- Derived: snapshots → chart data --------------------------------------
  const chartData: ChartDataPoint[] = useMemo(() => {
    if (sortedSnapshots.length < 2) return [];
    return sortedSnapshots.map((s) => ({
      month: shortMonth(s.date),
      assets: s.totalAssets,
      liabilities: s.totalLiabilities,
    }));
  }, [sortedSnapshots]);

  // --- Derived: snapshots → insights ----------------------------------------
  const insightsData: InsightData[] = useMemo(() => {
    if (sortedSnapshots.length < 2) return [];
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

  // --- Onboarding: no snapshots yet, not dismissed -------------------------
  if (allLoaded && !hasSnapshots && !dismissed) {
    return (
      <FirstSnapshotOnboarding
        firstName={firstName}
        onDismiss={() => setDismissed(true)}
      />
    );
  }

  // --- Loading state --------------------------------------------------------
  if (!allLoaded) {
    return (
      <DashboardPageShell
        variant="wide"
        className="flex min-h-[50vh] items-center justify-center"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-foreground/40">Synchronizing vault...</p>
        </div>
      </DashboardPageShell>
    );
  }

  return (
    <DashboardPageShell variant="wide" className="space-y-10">
      {/* Header + Quick Actions */}
      <SectionContainer>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-semibold text-brand-gradient">
              Welcome back, {firstName}
            </h1>
            {growthText ? (
              <p className="mt-2 text-foreground/50 text-lg">
                Your wealth {growthText.positive ? "ascended" : "receded"}{" "}
                <span
                  className={cn(
                    "font-semibold tabular-nums",
                    growthText.positive ? "text-success" : "text-destructive"
                  )}
                >
                  {growthText.pct}%
                </span>{" "}
                this period.
              </p>
            ) : (
              <p className="mt-2 text-foreground/50 text-lg">
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

      {/* Top row: Net Worth  |  Chart */}
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-5">
        {/* Left column */}
        <SectionContainer delay={0.1} className="xl:col-span-2">
          <div className="relative group">
            <NetWorthCard
              netWorth={netWorthData.netWorth}
              monthlyChange={netWorthData.monthlyChange}
              percentageChange={netWorthData.percentageChange}
              className="shadow-glow"
            />
          </div>
        </SectionContainer>

        {/* Right column — Chart */}
        <SectionContainer delay={0.2} className="xl:col-span-3">
          <div className="surface-card h-full rounded-3xl p-6 sm:p-8 border border-white/5 shadow-glow relative">
            <div className="mb-10 flex items-center justify-between">
              <h2 className="label-caps">
                Growth Allocation
              </h2>
            </div>
            {chartData.length >= 2 ? (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={chartData} margin={{ top: 0, right: 16, left: 4, bottom: 24 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    strokeOpacity={0.8}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)", fontWeight: 500, fontFamily: "var(--font-sans)" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={formatLakhsCr}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)", fontWeight: 500, fontFamily: "var(--font-sans)" }}
                    width={40}
                  />
                  <Tooltip
                    cursor={{ stroke: 'var(--primary)', strokeWidth: 1, strokeDasharray: '4 4', opacity: 0.4 }}
                    formatter={(value) => [formatINR(Number(value ?? 0)), ""]}
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
            ) : (
              <div className="flex h-[400px] flex-col items-center justify-center gap-5 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5">
                  <Sparkles className="h-6 w-6 text-primary/40" />
                </div>
                <div>
                  <p className="text-foreground/40">
                    Your growth chart appears after your first snapshot.
                  </p>
                  <p className="mt-1 text-xs text-foreground/25">
                    Add at least two snapshots to see trends.
                  </p>
                </div>
                <Link href="/dashboard/snapshot">
                  <button className="rounded-full border border-primary/30 bg-primary/8 px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-primary transition-colors hover:bg-primary/15">
                    Open Snapshot
                  </button>
                </Link>
              </div>
            )}
          </div>
        </SectionContainer>
      </div>

      {/* Insights row */}
      <SectionContainer delay={0.3}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="label-caps">
            Intelligence Feed
          </h2>
          <div className="h-px flex-1 mx-6 bg-white/5" />
        </div>
        {insightsData.length > 0 ? (
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
        ) : (
          <div className="surface-card rounded-3xl border border-white/5 p-8 text-center">
            <p className="text-foreground/35">
              Insights unlock once you have two or more snapshots to compare.
            </p>
            <Link href="/dashboard/snapshot" className="mt-4 inline-block text-xs font-bold uppercase tracking-widest text-primary/60 hover:text-primary transition-colors">
              {snapshots.length === 0 ? "Build your first snapshot →" : "Add another snapshot →"}
            </Link>
          </div>
        )}
      </SectionContainer>

    </DashboardPageShell>
  );
}
