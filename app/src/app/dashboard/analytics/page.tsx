"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNetWorthHistory } from "@/hooks/useNetWorthHistory";
import { NetWorthSnapshot, StatementEntry, InsightDomain, InsightItem } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { computeAllInsights } from "@/lib/insightsEngine";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import type { PieLabelRenderProps } from "recharts";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  BarChart3,
  Shield,
  Droplets,
  Zap,
  AlertCircle,
  Activity,
  ArrowUpRight,
  ArrowLeft,
  CheckCircle2,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function computeEffectiveValue(entry: StatementEntry): number {
  return (entry.closingBalance * entry.ownershipPercentage) / 100;
}

function formatMetric(value: number): string {
  const abs = Math.abs(value);
  if (abs < 1 && abs > 0) return `${(value * 100).toFixed(1)}%`;
  if (abs >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
  if (abs >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

const PIE_COLORS = [
  "#10B981", "#3B82F6", "#8B5CF6", "#F59E0B",
  "#EF4444", "#EC4899", "#06B6D4", "#84CC16",
];

const DOMAIN_CONFIG: Record<InsightDomain, { label: string; icon: typeof TrendingUp }> = {
  growth: { label: "Growth & Real Wealth", icon: ArrowUpRight },
  leverage: { label: "Leverage & Debt Drag", icon: Shield },
  liquidity: { label: "Liquidity & Resilience", icon: Droplets },
  efficiency: { label: "Efficiency & Cash Utilization", icon: Zap },
  risk: { label: "Risk & Scenario Stress", icon: AlertCircle },
  behavior: { label: "Behavioral Signals", icon: Activity },
};

const DOMAIN_ORDER: InsightDomain[] = [
  "growth", "leverage", "liquidity", "efficiency", "risk", "behavior",
];

interface Movement {
  type: string;
  previousValue: number;
  currentValue: number;
  change: number;
  changePercent: number;
  isNew: boolean;
  isRemoved: boolean;
  category: "asset" | "liability";
}

function detectMovements(prev: NetWorthSnapshot, curr: NetWorthSnapshot): Movement[] {
  const prevByType = new Map<string, { total: number; category: "asset" | "liability" }>();
  const currByType = new Map<string, { total: number; category: "asset" | "liability" }>();

  for (const entry of prev.entries) {
    const key = entry.statementType;
    const existing = prevByType.get(key);
    prevByType.set(key, {
      total: (existing?.total ?? 0) + computeEffectiveValue(entry),
      category: entry.category,
    });
  }
  for (const entry of curr.entries) {
    const key = entry.statementType;
    const existing = currByType.get(key);
    currByType.set(key, {
      total: (existing?.total ?? 0) + computeEffectiveValue(entry),
      category: entry.category,
    });
  }

  const movements: Movement[] = [];
  const allTypes = new Set([...prevByType.keys(), ...currByType.keys()]);
  for (const type of allTypes) {
    const prevData = prevByType.get(type);
    const currData = currByType.get(type);
    const previousValue = prevData?.total ?? 0;
    const currentValue = currData?.total ?? 0;
    const change = currentValue - previousValue;
    const changePercent = previousValue !== 0 ? (change / previousValue) * 100 : currentValue !== 0 ? 100 : 0;
    if (Math.abs(change) > 0) {
      movements.push({
        type,
        previousValue,
        currentValue,
        change,
        changePercent,
        isNew: !prevData,
        isRemoved: !currData,
        category: (currData?.category ?? prevData?.category) as "asset" | "liability",
      });
    }
  }
  movements.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
  return movements;
}

type HealthStatus = "healthy" | "warning" | "critical" | "no-data";

function computeDomainHealth(items: InsightItem[]): { status: HealthStatus; verdict: string } {
  const available = items.filter((i) => !i.unavailable);
  if (available.length === 0) return { status: "no-data", verdict: "not enough data" };
  const critical = available.find((i) => i.severity === "critical");
  if (critical) return { status: "critical", verdict: critical.title.toLowerCase() };
  const warning = available.find((i) => i.severity === "warning");
  if (warning) return { status: "warning", verdict: warning.title.toLowerCase() };
  return { status: "healthy", verdict: "on track" };
}

function computeOverallHealth(
  domainStatuses: { status: HealthStatus }[]
): { status: HealthStatus; label: string; attentionCount: number } {
  const attentionCount = domainStatuses.filter(
    (d) => d.status === "critical" || d.status === "warning"
  ).length;
  if (domainStatuses.some((d) => d.status === "critical")) {
    return { status: "critical", label: "Needs Attention", attentionCount };
  }
  if (domainStatuses.some((d) => d.status === "warning")) {
    return { status: "warning", label: "Mostly Healthy", attentionCount };
  }
  return { status: "healthy", label: "All Clear", attentionCount: 0 };
}

const STATUS_STYLE: Record<HealthStatus, { color: string; bg: string; border: string }> = {
  healthy: { color: "text-success", bg: "bg-success", border: "border-success/20" },
  warning: { color: "text-amber-500", bg: "bg-amber-500", border: "border-amber-500/20" },
  critical: { color: "text-destructive", bg: "bg-destructive", border: "border-destructive/20" },
  "no-data": { color: "text-foreground/30", bg: "bg-foreground/30", border: "border-foreground/10" },
};

const GAUGE_CONFIG: Record<string, { warningAt: number; criticalAt: number; label: string }> = {
  "leverage.debt-to-asset": { warningAt: 0.4, criticalAt: 0.5, label: "Debt-to-Asset" },
  "liquidity.concentration": { warningAt: 0.5, criticalAt: 0.6, label: "Concentration" },
  "efficiency.idle-cash": { warningAt: 0.15, criticalAt: 0.3, label: "Idle Cash" },
};

function OverallHealthBanner({ status, label, attentionCount }: {
  status: HealthStatus;
  label: string;
  attentionCount: number;
}) {
  const Icon = status === "healthy" ? CheckCircle2 : AlertCircle;
  const s = STATUS_STYLE[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("surface-card rounded-3xl p-8 border", s.border)}
    >
      <div className="flex items-center gap-4">
        <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl", `${s.bg}/10`)}>
          <Icon className={cn("h-7 w-7", s.color)} />
        </div>
        <div>
          <h2 className={cn("text-2xl font-bold font-display", s.color)}>{label}</h2>
          <p className="text-foreground/50 text-sm italic font-display mt-0.5">
            {attentionCount > 0
              ? `${attentionCount} area${attentionCount !== 1 ? "s" : ""} need${attentionCount === 1 ? "s" : ""} attention`
              : "Your finances are looking good"}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function HealthRow({ domain, status, verdict, onClick, delay = 0 }: {
  domain: InsightDomain;
  status: HealthStatus;
  verdict: string;
  onClick: () => void;
  delay?: number;
}) {
  const config = DOMAIN_CONFIG[domain];
  const Icon = config.icon;
  const s = STATUS_STYLE[status];

  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-2xl surface-card p-4 border border-white/5 hover:border-primary/20 transition-all group cursor-pointer"
    >
      <div className={cn("h-3 w-3 rounded-full shrink-0", s.bg)} />
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
        <Icon className="h-4 w-4 text-primary" aria-hidden />
      </div>
      <div className="flex-1 text-left">
        <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
          {config.label}
        </h3>
        <p className={cn("text-xs mt-0.5 italic font-display", s.color)}>{verdict}</p>
      </div>
      <ArrowUpRight className="h-4 w-4 text-foreground/20 group-hover:text-primary transition-colors" />
    </motion.button>
  );
}

function DetailGauge({ value, warningAt, criticalAt, label }: {
  value: number;
  warningAt: number;
  criticalAt: number;
  label: string;
}) {
  const pct = Math.min(value * 100, 100);
  const color =
    value >= criticalAt ? "bg-destructive" :
    value >= warningAt ? "bg-amber-500" :
    "bg-success";

  return (
    <div className="mt-3 space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">{label}</span>
        <span className="text-xs font-semibold tabular-nums text-foreground/60">{pct.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/5 border border-white/5 overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-700", color)} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-[9px] text-foreground/30 tabular-nums">
        <span>0%</span>
        <span className="text-amber-500/50">{(warningAt * 100).toFixed(0)}%</span>
        <span className="text-destructive/50">{(criticalAt * 100).toFixed(0)}%</span>
        <span>100%</span>
      </div>
    </div>
  );
}

function DomainDetailView({
  domain,
  items,
  onBack,
}: {
  domain: InsightDomain;
  items: InsightItem[];
  onBack: () => void;
}) {
  const config = DOMAIN_CONFIG[domain];
  const Icon = config.icon;
  const available = items.filter((i) => !i.unavailable);
  const unavailableCount = items.filter((i) => i.unavailable).length;
  const health = computeDomainHealth(items);
  const s = STATUS_STYLE[health.status];

  const verdictText = (() => {
    const critical = available.find((i) => i.severity === "critical");
    if (critical) return critical.description;
    const warning = available.find((i) => i.severity === "warning");
    if (warning) return warning.description;
    if (available.length > 0) return available[0].description;
    return "We don't have enough data to analyse this area yet.";
  })();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-8"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-foreground/40 hover:text-primary transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Overview
      </button>

      <div className={cn("surface-card rounded-3xl p-8 border", s.border)}>
        <div className="flex items-start gap-4">
          <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl", `${s.bg}/10`)}>
            <Icon className={cn("h-6 w-6", s.color)} />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display text-foreground">{config.label}</h2>
            <p className="mt-1 text-sm text-foreground/60 italic font-display leading-relaxed max-w-xl">
              {verdictText}
            </p>
          </div>
        </div>
      </div>

      {available.length > 0 && (
        <div className="space-y-4">
          {available.map((item) => {
            const gauge = GAUGE_CONFIG[item.id];
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="surface-card rounded-2xl p-5 border border-white/5"
              >
                <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                <p className="mt-1 text-sm text-foreground/60 italic font-display leading-relaxed">
                  {item.description}
                </p>
                {item.metricValue !== undefined && (
                  <p className="mt-2 text-xs font-semibold tabular-nums text-foreground/40">
                    {item.metricLabel ? `${item.metricLabel}: ` : ""}{formatMetric(item.metricValue)}
                  </p>
                )}
                {gauge && item.metricValue !== undefined && (
                  <DetailGauge
                    value={item.metricValue}
                    warningAt={gauge.warningAt}
                    criticalAt={gauge.criticalAt}
                    label={gauge.label}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {unavailableCount > 0 && (
        <div className="flex items-center gap-2 rounded-xl p-3 bg-foreground/5 border border-foreground/5">
          <Lock className="h-3.5 w-3.5 text-foreground/25" />
          <p className="text-xs text-foreground/35 italic font-display">
            {unavailableCount} metric{unavailableCount !== 1 ? "s" : ""} need more data to unlock
          </p>
        </div>
      )}
    </motion.div>
  );
}

export default function AnalyticsPage() {
  const { snapshots, loaded } = useNetWorthHistory();
  const [selectedDomain, setSelectedDomain] = useState<InsightDomain | null>(null);

  const sorted = useMemo(
    () => [...snapshots].sort((a, b) => a.date.localeCompare(b.date)),
    [snapshots]
  );

  const insightResult = useMemo(
    () => (loaded ? computeAllInsights(sorted) : null),
    [sorted, loaded]
  );

  const latest = sorted.length > 0 ? sorted[sorted.length - 1] : null;
  const previous = sorted.length >= 2 ? sorted[sorted.length - 2] : null;
  const hasPair = !!latest && !!previous;

  const movements = useMemo(
    () => (hasPair ? detectMovements(previous!, latest!) : []),
    [hasPair, previous, latest]
  );
  const topMovements = movements.slice(0, 5);

  const { assetPieData, liabilityPieData } = useMemo(() => {
    if (!latest) return { assetPieData: [], liabilityPieData: [] };
    const assetBreakdown = new Map<string, number>();
    const liabilityBreakdown = new Map<string, number>();
    for (const entry of latest.entries) {
      const value = computeEffectiveValue(entry);
      if (entry.category === "asset") {
        assetBreakdown.set(entry.statementType, (assetBreakdown.get(entry.statementType) ?? 0) + value);
      } else {
        liabilityBreakdown.set(entry.statementType, (liabilityBreakdown.get(entry.statementType) ?? 0) + value);
      }
    }
    return {
      assetPieData: Array.from(assetBreakdown.entries()).map(([name, value]) => ({ name, value })),
      liabilityPieData: Array.from(liabilityBreakdown.entries()).map(([name, value]) => ({ name, value })),
    };
  }, [latest]);

  const domainHealthMap = useMemo(() => {
    if (!insightResult) return null;
    return DOMAIN_ORDER.map((domain) => ({
      domain,
      ...computeDomainHealth(insightResult.domains[domain]),
    }));
  }, [insightResult]);

  const overallHealth = useMemo(() => {
    if (!domainHealthMap) return null;
    return computeOverallHealth(domainHealthMap);
  }, [domainHealthMap]);

  if (!loaded) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="font-display italic text-foreground/40">Analysing your wealth...</p>
        </div>
      </div>
    );
  }

  if (!latest) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <h1 className="font-display italic text-3xl text-foreground mb-6">Financial Health</h1>
        <Card className="flex flex-col items-center justify-center p-12 text-center surface-card rounded-3xl">
          <BarChart3 className="h-12 w-12 text-foreground/20 mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">No data yet</h2>
          <p className="text-foreground/50 mb-6 max-w-md italic font-display">
            Start by recording your first net worth snapshot in the Calculator. Your financial health check will appear here.
          </p>
          <Link href="/dashboard/calculator">
            <Button>Go to Net Worth Calculator</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (selectedDomain && insightResult) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <DomainDetailView
          domain={selectedDomain}
          items={insightResult.domains[selectedDomain]}
          onBack={() => setSelectedDomain(null)}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 space-y-8">
      <div>
        <h1 className="font-display italic text-3xl sm:text-4xl text-foreground">
          Financial Health
        </h1>
        <p className="mt-2 text-foreground/50 italic font-display">
          {hasPair ? (
            <>Analysis based on your snapshots from <span className="font-semibold not-italic text-foreground/70">{previous!.date}</span> to <span className="font-semibold not-italic text-foreground/70">{latest.date}</span>.</>
          ) : (
            <>Based on your snapshot from <span className="font-semibold not-italic text-foreground/70">{latest.date}</span>. Add more snapshots for deeper analysis.</>
          )}
        </p>
      </div>

      {overallHealth && (
        <OverallHealthBanner
          status={overallHealth.status}
          label={overallHealth.label}
          attentionCount={overallHealth.attentionCount}
        />
      )}

      {domainHealthMap && (
        <div className="space-y-3">
          {domainHealthMap.map((dh, i) => (
            <HealthRow
              key={dh.domain}
              domain={dh.domain}
              status={dh.status}
              verdict={dh.verdict}
              onClick={() => setSelectedDomain(dh.domain)}
              delay={0.1 + i * 0.05}
            />
          ))}
        </div>
      )}

      {!hasPair && (
        <Card className="p-5 surface-card rounded-2xl border border-primary/10">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-primary/50 shrink-0" />
            <p className="text-sm text-foreground/50 italic font-display">
              Add another snapshot to unlock comparative insights like growth trends, debt trajectory, and savings consistency.
            </p>
          </div>
        </Card>
      )}

      {(topMovements.length > 0 || assetPieData.length > 0 || liabilityPieData.length > 0) && (
        <>
          <div className="flex items-center gap-4">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">
              Composition
            </h2>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          {topMovements.length > 0 && (
            <Card className="p-6 surface-card rounded-3xl border border-white/5">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-foreground/50 mb-4">
                Top Movements
              </h3>
              <div className="space-y-3">
                {topMovements.map((m, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-xl border border-white/5 p-3">
                    <div className="mt-0.5">
                      {m.isNew ? (
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                      ) : m.change > 0 && m.category === "asset" ? (
                        <TrendingUp className="h-5 w-5 text-success" />
                      ) : m.change < 0 && m.category === "liability" ? (
                        <TrendingDown className="h-5 w-5 text-success" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-destructive" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {m.isNew ? `New ${m.category}: ${m.type}` : m.isRemoved ? `Removed ${m.category}: ${m.type}` : m.type}
                      </p>
                      <p className="text-sm text-foreground/50">
                        {m.isNew ? formatCurrency(m.currentValue) : `${formatCurrency(m.previousValue)} → ${formatCurrency(m.currentValue)} (${formatPercent(m.changePercent)})`}
                      </p>
                    </div>
                    <span className={cn("text-sm font-semibold tabular-nums",
                      (m.change > 0 && m.category === "asset") || (m.change < 0 && m.category === "liability") ? "text-success" : "text-destructive"
                    )}>
                      {m.change >= 0 ? "+" : ""}{formatCurrency(m.change)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {(assetPieData.length > 0 || liabilityPieData.length > 0) && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {assetPieData.length > 0 && (
                <Card className="p-6 surface-card rounded-3xl border border-white/5">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-foreground/50 mb-4">
                    Asset Breakdown
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={assetPieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={(props: PieLabelRenderProps) =>
                          `${String(props.name ?? "")} (${((Number(props.percent ?? 0)) * 100).toFixed(0)}%)`
                        }
                        labelLine
                      >
                        {assetPieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              )}
              {liabilityPieData.length > 0 && (
                <Card className="p-6 surface-card rounded-3xl border border-white/5">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-foreground/50 mb-4">
                    Liability Breakdown
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={liabilityPieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={(props: PieLabelRenderProps) =>
                          `${String(props.name ?? "")} (${((Number(props.percent ?? 0)) * 100).toFixed(0)}%)`
                        }
                        labelLine
                      >
                        {liabilityPieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
