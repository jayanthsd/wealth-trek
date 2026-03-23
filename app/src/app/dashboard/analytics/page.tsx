"use client";

import { useNetWorthHistory } from "@/hooks/useNetWorthHistory";
import { NetWorthSnapshot, StatementEntry } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
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
import type { PieLabelRenderProps } from "recharts";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Sparkles,
  BarChart3,
} from "lucide-react";
import Link from "next/link";

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

const PIE_COLORS = [
  "#10B981",
  "#3B82F6",
  "#8B5CF6",
  "#F59E0B",
  "#EF4444",
  "#EC4899",
  "#06B6D4",
  "#84CC16",
];

interface Movement {
  type: string;
  description: string;
  previousValue: number;
  currentValue: number;
  change: number;
  changePercent: number;
  isNew: boolean;
  isRemoved: boolean;
  category: "asset" | "liability";
}

function computeEffectiveValue(entry: StatementEntry): number {
  return (entry.closingBalance * entry.ownershipPercentage) / 100;
}

function detectMovements(
  prev: NetWorthSnapshot,
  curr: NetWorthSnapshot
): Movement[] {
  const movements: Movement[] = [];

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

  const allTypes = new Set([...prevByType.keys(), ...currByType.keys()]);

  for (const type of allTypes) {
    const prevData = prevByType.get(type);
    const currData = currByType.get(type);
    const previousValue = prevData?.total ?? 0;
    const currentValue = currData?.total ?? 0;
    const change = currentValue - previousValue;
    const changePercent =
      previousValue !== 0 ? (change / previousValue) * 100 : currentValue !== 0 ? 100 : 0;

    if (Math.abs(change) > 0) {
      movements.push({
        type,
        description: type,
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

function generateSuggestions(
  snapshots: NetWorthSnapshot[],
  movements: Movement[]
): string[] {
  const suggestions: string[] = [];

  if (snapshots.length >= 2) {
    const latest = snapshots[snapshots.length - 1];
    const previous = snapshots[snapshots.length - 2];
    const liabilityIncrease =
      latest.totalLiabilities - previous.totalLiabilities;

    if (liabilityIncrease > 0 && latest.netWorth < previous.netWorth) {
      suggestions.push(
        `Your liabilities increased by ${formatCurrency(liabilityIncrease)}, resulting in lower net worth. Consider restructuring your loans or prioritizing debt repayment.`
      );
    }

    const newLiabilities = movements.filter(
      (m) => m.isNew && m.category === "liability"
    );
    for (const m of newLiabilities) {
      suggestions.push(
        `New liability detected: ${m.type} of ${formatCurrency(m.currentValue)}. Factor this into your monthly budget planning.`
      );
    }
  }

  if (snapshots.length >= 3) {
    const last3 = snapshots.slice(-3);
    const allPositive =
      last3[2].netWorth > last3[1].netWorth &&
      last3[1].netWorth > last3[0].netWorth;
    if (allPositive) {
      suggestions.push(
        "Your net worth has increased in the last 3 consecutive snapshots. Keep up the momentum!"
      );
    }
  }

  if (suggestions.length === 0 && snapshots.length >= 2) {
    suggestions.push(
      "Keep tracking your net worth regularly to build better financial habits and identify trends early."
    );
  }

  return suggestions;
}

export default function AnalyticsPage() {
  const { snapshots, loaded } = useNetWorthHistory();

  if (!loaded) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (snapshots.length < 2) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">
          Analytics
        </h1>
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Insufficient data
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            You need at least 2 net worth snapshots to see analytics. Currently
            you have {snapshots.length}.
          </p>
          <Link href="/dashboard/calculator">
            <Button>Go to Net Worth Calculator</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const latest = snapshots[snapshots.length - 1];
  const previous = snapshots[snapshots.length - 2];
  const netWorthChange = latest.netWorth - previous.netWorth;
  const netWorthChangePercent =
    previous.netWorth !== 0
      ? (netWorthChange / Math.abs(previous.netWorth)) * 100
      : 0;

  const movements = detectMovements(previous, latest);
  const suggestions = generateSuggestions(snapshots, movements);
  const topMovements = movements.slice(0, 5);

  const assetBreakdown = new Map<string, number>();
  const liabilityBreakdown = new Map<string, number>();
  for (const entry of latest.entries) {
    const value = computeEffectiveValue(entry);
    if (entry.category === "asset") {
      assetBreakdown.set(
        entry.statementType,
        (assetBreakdown.get(entry.statementType) ?? 0) + value
      );
    } else {
      liabilityBreakdown.set(
        entry.statementType,
        (liabilityBreakdown.get(entry.statementType) ?? 0) + value
      );
    }
  }

  const assetPieData = Array.from(assetBreakdown.entries()).map(
    ([name, value]) => ({ name, value })
  );
  const liabilityPieData = Array.from(liabilityBreakdown.entries()).map(
    ([name, value]) => ({ name, value })
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Analytics
        </h1>
        <p className="mt-1 text-muted-foreground">
          Insights on your financial movements between{" "}
          <span className="font-medium">{previous.date}</span> and{" "}
          <span className="font-medium">{latest.date}</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Net Worth Change</p>
          <p
            className={`text-2xl font-bold mt-1 ${
              netWorthChange >= 0 ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {netWorthChange >= 0 ? "+" : ""}
            {formatCurrency(netWorthChange)}
          </p>
          <p
            className={`text-sm mt-1 ${
              netWorthChange >= 0 ? "text-emerald-500" : "text-red-500"
            }`}
          >
            {formatPercent(netWorthChangePercent)}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Assets Change</p>
          <p className="text-2xl font-bold mt-1 text-emerald-600">
            {formatCurrency(latest.totalAssets)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            was {formatCurrency(previous.totalAssets)}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Liabilities Change</p>
          <p className="text-2xl font-bold mt-1 text-amber-600">
            {formatCurrency(latest.totalLiabilities)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            was {formatCurrency(previous.totalLiabilities)}
          </p>
        </Card>
      </div>

      {topMovements.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Top Movements
          </h2>
          <div className="space-y-3">
            {topMovements.map((m, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg border p-3"
              >
                <div className="mt-0.5">
                  {m.isNew ? (
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  ) : m.change > 0 && m.category === "asset" ? (
                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                  ) : m.change < 0 && m.category === "liability" ? (
                    <TrendingDown className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {m.isNew
                      ? `New ${m.category}: ${m.type}`
                      : m.isRemoved
                        ? `Removed ${m.category}: ${m.type}`
                        : m.type}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {m.isNew
                      ? formatCurrency(m.currentValue)
                      : `${formatCurrency(m.previousValue)} → ${formatCurrency(m.currentValue)} (${formatPercent(m.changePercent)})`}
                  </p>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    (m.change > 0 && m.category === "asset") ||
                    (m.change < 0 && m.category === "liability")
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  {m.change >= 0 ? "+" : ""}
                  {formatCurrency(m.change)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {suggestions.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Suggestions
          </h2>
          <div className="space-y-3">
            {suggestions.map((s, i) => (
              <div key={i} className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                <p className="text-sm text-amber-900">{s}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {assetPieData.length > 0 && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Asset Breakdown
            </h2>
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
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}
        {liabilityPieData.length > 0 && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Liability Breakdown
            </h2>
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
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>
    </div>
  );
}
