"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Flame,
  Grid3X3,
  Scale,
  Receipt,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Info,
  ArrowRight,
  Lock,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import type {
  AdvancedDimensionResults,
  InflationAuditResult,
  GapAnalysisResult,
  DebtQualityResult,
  TaxEfficiencyResult,
  TrajectoryResult,
  ProtectionResult,
} from "@/types";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function formatINR(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
  if (abs >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

type StatusColor = "green" | "amber" | "red" | "neutral";

const STATUS_DOT: Record<StatusColor, string> = {
  green: "bg-success",
  amber: "bg-amber-500",
  red: "bg-destructive",
  neutral: "bg-foreground/20",
};

const STATUS_BADGE: Record<StatusColor, { bg: string; text: string; label: string }> = {
  green: { bg: "bg-success/10", text: "text-success", label: "Healthy" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-500", label: "Needs Review" },
  red: { bg: "bg-destructive/10", text: "text-destructive", label: "Attention" },
  neutral: { bg: "bg-foreground/5", text: "text-foreground/40", label: "Partial" },
};

function DimensionHeader({
  number,
  title,
  icon: Icon,
  status,
}: {
  number: number;
  title: string;
  icon: typeof Flame;
  status: StatusColor;
}) {
  const badge = STATUS_BADGE[status];
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">
              D{number}
            </span>
            <h3 className="text-sm font-bold text-foreground">{title}</h3>
          </div>
        </div>
      </div>
      <span
        className={cn(
          "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md",
          badge.bg,
          badge.text
        )}
      >
        {badge.label}
      </span>
    </div>
  );
}

function AlertBox({ message, variant = "default" }: { message: string; variant?: "default" | "soft" }) {
  if (!message) return null;
  return (
    <div
      className={cn(
        "mt-4 flex items-start gap-2 rounded-xl p-3 text-xs italic font-display leading-relaxed",
        variant === "soft"
          ? "bg-foreground/5 text-foreground/50"
          : "bg-primary/5 border border-primary/10 text-foreground/60"
      )}
    >
      <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary/40" />
      <span>{message}</span>
    </div>
  );
}

function PartialState({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl p-3 bg-foreground/5 border border-foreground/5">
      <Lock className="h-3.5 w-3.5 text-foreground/25" />
      <p className="text-xs text-foreground/35 italic font-display">{message}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// D7: Inflation-Adjusted Asset Audit
// ---------------------------------------------------------------------------

function InflationAuditCard({ data }: { data: InflationAuditResult }) {
  const statusColor: StatusColor =
    data.overall_flag === "alert" ? "red" : data.overall_flag === "warn" ? "amber" : "green";

  return (
    <Card className="surface-card rounded-3xl p-6 border border-white/5">
      <DimensionHeader number={7} title="Inflation-Adjusted Asset Audit" icon={Flame} status={statusColor} />

      <div className="space-y-2">
        {data.per_asset.map((asset) => {
          const barColor =
            asset.status === "red"
              ? "bg-destructive"
              : asset.status === "amber"
                ? "bg-amber-500"
                : "bg-success";
          const barWidth = Math.min(
            Math.max((asset.balance / (data.sub_inflation_value || data.per_asset.reduce((s, a) => s + a.balance, 0) || 1)) * 100, 8),
            100
          );

          return (
            <div key={asset.key} className="flex items-center gap-3">
              <div className="w-28 text-xs text-foreground/60 truncate">{asset.label}</div>
              <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-700", barColor)}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
              <div className="w-20 text-right">
                <span className={cn("text-xs font-semibold tabular-nums",
                  asset.status === "red" ? "text-destructive" :
                  asset.status === "amber" ? "text-amber-500" : "text-success"
                )}>
                  {asset.real_return >= 0 ? "+" : ""}{asset.real_return.toFixed(1)}%
                </span>
              </div>
              <div className={cn("h-2 w-2 rounded-full shrink-0", STATUS_DOT[asset.status])} />
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-foreground/40">
        <span>Sub-inflation: <strong className="text-foreground/60">{data.sub_inflation_pct.toFixed(0)}%</strong></span>
        <span>Value at risk: <strong className="text-foreground/60">{formatINR(data.sub_inflation_value)}</strong></span>
      </div>

      <AlertBox message={data.primary_alert} />
    </Card>
  );
}

// ---------------------------------------------------------------------------
// D8: Instrument Gap Analysis
// ---------------------------------------------------------------------------

function GapAnalysisCard({ data }: { data: GapAnalysisResult }) {
  const statusColor: StatusColor =
    data.gap_count >= 3 ? "red" : data.gap_count >= 1 || data.over_count >= 1 ? "amber" : "green";

  const bucketIcon = (status: string) => {
    if (status === "ok") return <CheckCircle2 className="h-4 w-4 text-success" />;
    if (status === "over") return <AlertCircle className="h-4 w-4 text-amber-500" />;
    if (status === "miss") return <AlertCircle className="h-4 w-4 text-destructive" />;
    if (status === "nudge") return <ArrowRight className="h-4 w-4 text-primary/50" />;
    return <Info className="h-4 w-4 text-foreground/30" />;
  };

  const bucketBorder = (status: string) => {
    if (status === "ok") return "border-success/20";
    if (status === "over") return "border-amber-500/20";
    if (status === "miss") return "border-destructive/20";
    return "border-white/5";
  };

  return (
    <Card className="surface-card rounded-3xl p-6 border border-white/5">
      <DimensionHeader number={8} title="Instrument Gap Analysis" icon={Grid3X3} status={statusColor} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {data.buckets.map((b) => (
          <div
            key={b.id}
            className={cn(
              "rounded-xl border p-3 space-y-1.5",
              bucketBorder(b.status)
            )}
          >
            <div className="flex items-center gap-2">
              {bucketIcon(b.status)}
              <span className="text-xs font-semibold text-foreground">{b.label}</span>
            </div>
            {b.current_pct > 0 && (
              <span className="text-[10px] font-bold tabular-nums text-foreground/40">
                {b.current_pct.toFixed(1)}% of portfolio
              </span>
            )}
            <p className="text-[11px] text-foreground/50 italic font-display leading-snug">
              {b.message}
            </p>
          </div>
        ))}
      </div>

      <AlertBox message={data.summary} variant="soft" />
    </Card>
  );
}

// ---------------------------------------------------------------------------
// D9: Debt Quality Score
// ---------------------------------------------------------------------------

function DebtQualityCard({ data }: { data: DebtQualityResult }) {
  const statusColor: StatusColor = data.status;
  const totalLiabilities = data.productive_total + data.consumptive_total;

  return (
    <Card className="surface-card rounded-3xl p-6 border border-white/5">
      <DimensionHeader number={9} title="Debt Quality Score" icon={Scale} status={statusColor} />

      {totalLiabilities === 0 ? (
        <p className="text-sm text-foreground/50 italic font-display">
          No liabilities detected — debt-free position.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="rounded-xl bg-success/5 border border-success/10 p-3 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-success/60 mb-1">
                Productive
              </p>
              <p className="text-lg font-bold tabular-nums text-success">
                {data.productive_pct.toFixed(0)}%
              </p>
              <p className="text-[10px] text-foreground/40 tabular-nums">
                {formatINR(data.productive_total)}
              </p>
            </div>
            <div
              className={cn(
                "rounded-xl border p-3 text-center",
                data.status === "red"
                  ? "bg-destructive/5 border-destructive/10"
                  : data.status === "amber"
                    ? "bg-amber-500/5 border-amber-500/10"
                    : "bg-foreground/5 border-foreground/5"
              )}
            >
              <p
                className={cn(
                  "text-[10px] font-bold uppercase tracking-wider mb-1",
                  data.status === "red"
                    ? "text-destructive/60"
                    : data.status === "amber"
                      ? "text-amber-500/60"
                      : "text-foreground/40"
                )}
              >
                Consumptive
              </p>
              <p
                className={cn(
                  "text-lg font-bold tabular-nums",
                  data.status === "red"
                    ? "text-destructive"
                    : data.status === "amber"
                      ? "text-amber-500"
                      : "text-foreground/60"
                )}
              >
                {data.consumptive_pct.toFixed(0)}%
              </p>
              <p className="text-[10px] text-foreground/40 tabular-nums">
                {formatINR(data.consumptive_total)}
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            {data.breakdown.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-xs py-1 border-b border-white/5 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      item.type === "productive" ? "bg-success" : "bg-destructive"
                    )}
                  />
                  <span className="text-foreground/70">{item.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  {item.effective_rate_note && (
                    <span className="text-foreground/30 text-[10px]">
                      {item.effective_rate_note}
                    </span>
                  )}
                  <span className="font-semibold tabular-nums text-foreground/60">
                    {formatINR(item.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <AlertBox message={data.primary_alert} />
      {data.secondary_alert && <AlertBox message={data.secondary_alert} variant="soft" />}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// D10: Tax Efficiency Score
// ---------------------------------------------------------------------------

function TaxEfficiencyCard({ data }: { data: TaxEfficiencyResult }) {
  const statusColor: StatusColor =
    data.grade === "A" ? "green" : data.grade === "B" ? "green" : data.grade === "C" ? "amber" : "red";

  return (
    <Card className="surface-card rounded-3xl p-6 border border-white/5">
      <DimensionHeader number={10} title="Tax Efficiency Score" icon={Receipt} status={statusColor} />

      <div className="flex items-center gap-4 mb-5">
        <div
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold",
            data.grade === "A"
              ? "bg-success/10 text-success"
              : data.grade === "B"
                ? "bg-success/10 text-success"
                : data.grade === "C"
                  ? "bg-amber-500/10 text-amber-500"
                  : "bg-destructive/10 text-destructive"
          )}
        >
          {data.grade}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            {data.score}/4 checks passed
          </p>
          <p className="text-xs text-foreground/40">
            Tax efficiency score: {data.score_pct.toFixed(0)}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {data.checks.map((check) => (
          <div
            key={check.id}
            className={cn(
              "rounded-lg border p-2.5 text-center",
              check.passed
                ? "border-success/20 bg-success/5"
                : "border-destructive/10 bg-destructive/5"
            )}
          >
            {check.passed ? (
              <CheckCircle2 className="h-4 w-4 text-success mx-auto mb-1" />
            ) : (
              <AlertCircle className="h-4 w-4 text-destructive mx-auto mb-1" />
            )}
            <p className="text-[10px] font-semibold text-foreground/70 leading-tight">
              {check.label}
            </p>
          </div>
        ))}
      </div>

      <AlertBox message={data.top_action} />
    </Card>
  );
}

// ---------------------------------------------------------------------------
// D11: Net Worth Trajectory
// ---------------------------------------------------------------------------

function TrajectoryCard({ data }: { data: TrajectoryResult }) {
  const statusColor: StatusColor = data.on_track ? "green" : "amber";

  const scenarios = [
    { label: "Conservative", ...data.projections.conservative, color: "text-foreground/50" },
    { label: "Base", ...data.projections.base, color: "text-primary" },
    { label: "Optimistic", ...data.projections.optimistic, color: "text-success" },
  ];

  const maxCorpus = Math.max(...scenarios.map((s) => s.corpus), data.target_corpus);

  return (
    <Card className="surface-card rounded-3xl p-6 border border-white/5">
      <DimensionHeader number={11} title="Net Worth Trajectory" icon={TrendingUp} status={statusColor} />

      <div className="grid grid-cols-3 gap-3 mb-5">
        {scenarios.map((s) => {
          const barH = maxCorpus > 0 ? (s.corpus / maxCorpus) * 100 : 0;
          return (
            <div key={s.label} className="text-center">
              <div className="h-24 flex items-end justify-center mb-2">
                <div
                  className={cn(
                    "w-8 rounded-t-lg transition-all duration-700",
                    s.label === "Base" ? "bg-primary/60" : s.label === "Optimistic" ? "bg-success/40" : "bg-foreground/10"
                  )}
                  style={{ height: `${Math.max(barH, 4)}%` }}
                />
              </div>
              <p className={cn("text-xs font-bold tabular-nums", s.color)}>
                {formatINR(s.corpus)}
              </p>
              <p className="text-[10px] text-foreground/40">{s.label}</p>
              <p className="text-[10px] text-foreground/30">{s.rate}% return</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
        <div>
          <p className="text-foreground/30 text-[10px] uppercase tracking-wider">Target</p>
          <p className="font-bold tabular-nums text-foreground/70">{formatINR(data.target_corpus)}</p>
        </div>
        <div>
          <p className="text-foreground/30 text-[10px] uppercase tracking-wider">Years Left</p>
          <p className="font-bold tabular-nums text-foreground/70">{data.years_to_retirement}</p>
        </div>
        <div>
          <p className="text-foreground/30 text-[10px] uppercase tracking-wider">Blended Return</p>
          <p className="font-bold tabular-nums text-foreground/70">{data.blended_return.toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-foreground/30 text-[10px] uppercase tracking-wider">Monthly Surplus</p>
          <p className="font-bold tabular-nums text-foreground/70">{formatINR(data.monthly_surplus)}</p>
        </div>
      </div>

      {!data.on_track && data.gap_monthly_sip > 0 && (
        <div className="mt-4 rounded-xl bg-amber-500/5 border border-amber-500/10 p-3 text-center">
          <p className="text-[10px] uppercase tracking-wider text-amber-500/60 mb-1">
            Additional SIP needed
          </p>
          <p className="text-lg font-bold tabular-nums text-amber-500">
            {formatINR(data.gap_monthly_sip)}/mo
          </p>
        </div>
      )}

      <AlertBox message={data.primary_alert} />
    </Card>
  );
}

// ---------------------------------------------------------------------------
// D12: Protection Layer Check
// ---------------------------------------------------------------------------

function ProtectionCard({ data }: { data: ProtectionResult }) {
  const hasIssue =
    data.term_status === "gap" ||
    data.term_status === "low" ||
    data.health_status === "low";
  const statusColor: StatusColor = hasIssue ? "amber" : data.term_status === "adequate" && data.health_status === "adequate" ? "green" : "neutral";

  return (
    <Card className="surface-card rounded-3xl p-6 border border-white/5">
      <DimensionHeader number={12} title="Protection Layer Check" icon={ShieldCheck} status={statusColor} />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        <div className="rounded-xl bg-foreground/5 border border-foreground/5 p-3 text-center">
          <p className="text-[10px] uppercase tracking-wider text-foreground/40 mb-1">
            Recommended Term Cover
          </p>
          <p className="text-sm font-bold tabular-nums text-foreground/70">
            {formatINR(data.recommended_term_cover)}
          </p>
        </div>
        {data.existing_term_cover != null && (
          <div
            className={cn(
              "rounded-xl border p-3 text-center",
              data.term_status === "adequate"
                ? "bg-success/5 border-success/10"
                : "bg-amber-500/5 border-amber-500/10"
            )}
          >
            <p className="text-[10px] uppercase tracking-wider text-foreground/40 mb-1">
              Existing Term Cover
            </p>
            <p className="text-sm font-bold tabular-nums text-foreground/70">
              {formatINR(data.existing_term_cover)}
            </p>
            {data.coverage_pct != null && (
              <p className="text-[10px] text-foreground/30 tabular-nums">
                {data.coverage_pct.toFixed(0)}% of recommended
              </p>
            )}
          </div>
        )}
        <div
          className={cn(
            "rounded-xl border p-3 text-center",
            data.health_status === "adequate"
              ? "bg-success/5 border-success/10"
              : data.health_status === "low"
                ? "bg-amber-500/5 border-amber-500/10"
                : "bg-foreground/5 border-foreground/5"
          )}
        >
          <p className="text-[10px] uppercase tracking-wider text-foreground/40 mb-1">
            Health Cover
          </p>
          <p className="text-sm font-bold tabular-nums text-foreground/70">
            {data.health_status === "not_entered"
              ? "Not entered"
              : data.health_status === "adequate"
                ? "Adequate"
                : "Below min."}
          </p>
        </div>
      </div>

      {data.alerts.map((alert, i) => (
        <AlertBox key={i} message={alert} variant={i === 0 ? "default" : "soft"} />
      ))}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main export: renders all advanced dimension cards
// ---------------------------------------------------------------------------

export function AdvancedDimensionCards({
  results,
}: {
  results?: AdvancedDimensionResults;
}) {
  if (!results) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      <div className="flex items-center gap-4">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">
          Advanced Analysis
        </h2>
        <div className="h-px flex-1 bg-white/5" />
      </div>

      {results.inflationAudit && <InflationAuditCard data={results.inflationAudit} />}
      {results.gapAnalysis && <GapAnalysisCard data={results.gapAnalysis} />}
      {results.debtQuality && <DebtQualityCard data={results.debtQuality} />}
      {results.taxEfficiency && <TaxEfficiencyCard data={results.taxEfficiency} />}
      {results.trajectory ? (
        <TrajectoryCard data={results.trajectory} />
      ) : (
        <Card className="surface-card rounded-3xl p-6 border border-white/5">
          <DimensionHeader number={11} title="Net Worth Trajectory" icon={TrendingUp} status="neutral" />
          <PartialState message="Add monthly income and current age in Advanced Inputs to unlock trajectory projections." />
        </Card>
      )}
      {results.protection ? (
        <ProtectionCard data={results.protection} />
      ) : (
        <Card className="surface-card rounded-3xl p-6 border border-white/5">
          <DimensionHeader number={12} title="Protection Layer Check" icon={ShieldCheck} status="neutral" />
          <PartialState message="Add monthly income in Advanced Inputs to unlock protection analysis." />
        </Card>
      )}
    </motion.div>
  );
}
