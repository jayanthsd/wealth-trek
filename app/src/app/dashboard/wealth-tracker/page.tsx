"use client";

import { useState } from "react";
import { useNetWorthHistory } from "@/hooks/useNetWorthHistory";
import { NetWorthSnapshot } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
} from "recharts";
import { Trash2, ChevronDown, ChevronUp, TrendingUp, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

function formatCurrency(value: number): string {
  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.abs(value));
  return (value < 0 ? "- " : "") + formatted;
}

export default function WealthTrackerPage() {
  const { snapshots, deleteSnapshot, loaded } = useNetWorthHistory();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!loaded) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-foreground/40">Accessing private ledger...</p>
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
        <Card className="flex flex-col items-center justify-center p-16 text-center border-dashed border-white/10">
          <div className="h-16 w-16 rounded-full bg-primary/5 border border-primary/20 flex items-center justify-center mb-6">
            <TrendingUp className="h-8 w-8 text-primary/40" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Initial Snapshot Pending
          </h2>
          <p className="text-foreground/50 mb-8 max-w-md">
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

  const chartData = snapshots.map((s) => ({
    date: s.date,
    "Total Assets": s.totalAssets,
    "Total Liabilities": s.totalLiabilities,
    "Net Worth": s.netWorth,
  }));

  const sortedDesc = [...snapshots].sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  return (
    <DashboardPageShell variant="wide" className="space-y-10">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-brand-gradient">
            Wealth Tracker
          </h1>
          <p className="mt-2 text-foreground/50">
            A comprehensive overview of your financial velocity.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 rounded-full bg-primary/5 border border-primary/10 px-4 py-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="label-caps !text-primary">Live Insights</span>
        </div>
      </div>

      <div className="surface-card rounded-3xl p-6 sm:p-8 border border-white/5 shadow-glow">
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
              cursor={{ stroke: 'var(--primary)', strokeWidth: 1, strokeDasharray: '4 4', opacity: 0.4 }}
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
              stroke="oklch(0.62 0.14 150)"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "oklch(0.62 0.14 150)", strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              name="Assets"
            />
            <Line
              type="monotone"
              dataKey="Total Liabilities"
              stroke="oklch(0.65 0.15 45)"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "oklch(0.65 0.15 45)", strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              name="Liabilities"
            />
            <Line
              type="monotone"
              dataKey="Net Worth"
              stroke="oklch(0.78 0.12 80)"
              strokeWidth={3}
              dot={{ r: 5, fill: "oklch(0.78 0.12 80)", strokeWidth: 0 }}
              activeDot={{ r: 8, strokeWidth: 0 }}
              name="Net Worth"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="surface-card rounded-3xl p-6 sm:p-8 border border-white/5">
        <h2 className="label-caps mb-8">
          Snapshot History
        </h2>
        <div className="overflow-x-auto -mx-6 sm:mx-0">
          <table className="w-full text-sm border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-[10px] font-bold uppercase tracking-widest text-foreground/30">
                <th className="pb-4 px-4 font-bold">Date</th>
                <th className="pb-4 px-4 font-bold text-right">Total Assets</th>
                <th className="pb-4 px-4 font-bold text-right">Total Liabilities</th>
                <th className="pb-4 px-4 font-bold text-right">Net Worth</th>
                <th className="pb-4 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="space-y-2">
              {sortedDesc.map((snapshot) => (
                <SnapshotRow
                  key={snapshot.id}
                  snapshot={snapshot}
                  isExpanded={expandedId === snapshot.id}
                  onToggle={() =>
                    setExpandedId(
                      expandedId === snapshot.id ? null : snapshot.id
                    )
                  }
                  onDelete={() => deleteSnapshot(snapshot.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardPageShell>
  );
}

function SnapshotRow({
  snapshot,
  isExpanded,
  onToggle,
  onDelete,
}: {
  snapshot: NetWorthSnapshot;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const assets = snapshot.entries.filter((e) => e.category === "asset");
  const liabilities = snapshot.entries.filter(
    (e) => e.category === "liability"
  );

  return (
    <>
      <tr
        className={cn(
          "group transition-all duration-300 cursor-pointer border border-transparent",
          isExpanded ? "bg-white/5 border-white/10" : "hover:bg-white/5"
        )}
        onClick={onToggle}
      >
        <td className="py-4 px-4 rounded-l-2xl">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-primary/20 transition-colors">
              {isExpanded ? (
                <ChevronUp className="h-3 w-3 text-primary" />
              ) : (
                <ChevronDown className="h-3 w-3 text-foreground/40" />
              )}
            </div>
            <span className="font-medium tracking-tight">{snapshot.date}</span>
          </div>
        </td>
        <td className="py-4 px-4 text-right text-success font-semibold tabular-nums">
          {formatCurrency(snapshot.totalAssets)}
        </td>
        <td className="py-4 px-4 text-right text-destructive font-semibold tabular-nums">
          {formatCurrency(snapshot.totalLiabilities)}
        </td>
        <td className="py-4 px-4 text-right font-semibold text-foreground tabular-nums">
          {formatCurrency(snapshot.netWorth)}
        </td>
        <td className="py-4 px-4 text-right rounded-r-2xl">
          <button
            className="h-9 w-9 inline-flex items-center justify-center rounded-full text-foreground/20 hover:text-destructive hover:bg-destructive/10 transition-all active:scale-90"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={5} className="px-4 pb-4">
            <div className="surface-card rounded-2xl p-6 border border-white/10 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-success mb-4 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    Asset Distribution ({assets.length})
                  </h4>
                  {assets.length === 0 ? (
                    <p className="text-sm text-foreground/30">No asset entries detected.</p>
                  ) : (
                    <ul className="space-y-2">
                      {assets.map((entry) => (
                        <li
                          key={entry.id}
                          className="flex justify-between text-sm group/item"
                        >
                          <span className="text-foreground/70 group-hover/item:text-foreground transition-colors">
                            {entry.description || entry.statementType}
                          </span>
                          <span className="text-success font-semibold tabular-nums">
                            {formatCurrency(
                              (entry.closingBalance * entry.ownershipPercentage) /
                                100
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-destructive mb-4 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                    Liability Portfolio ({liabilities.length})
                  </h4>
                  {liabilities.length === 0 ? (
                    <p className="text-sm text-foreground/30">No liabilities recorded.</p>
                  ) : (
                    <ul className="space-y-2">
                      {liabilities.map((entry) => (
                        <li
                          key={entry.id}
                          className="flex justify-between text-sm group/item"
                        >
                          <span className="text-foreground/70 group-hover/item:text-foreground transition-colors">
                            {entry.description || entry.statementType}
                          </span>
                          <span className="text-destructive font-semibold tabular-nums">
                            {formatCurrency(
                              (entry.closingBalance * entry.ownershipPercentage) /
                                100
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
