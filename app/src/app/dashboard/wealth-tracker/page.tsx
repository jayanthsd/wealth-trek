"use client";

import { useState } from "react";
import { useNetWorthHistory } from "@/hooks/useNetWorthHistory";
import { NetWorthSnapshot } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Trash2, ChevronDown, ChevronUp, TrendingUp } from "lucide-react";
import Link from "next/link";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function WealthTrackerPage() {
  const { snapshots, deleteSnapshot, loaded } = useNetWorthHistory();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!loaded) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (snapshots.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">
          Wealth Tracker
        </h1>
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <TrendingUp className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">
            No snapshots yet
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Start by calculating your net worth and saving a snapshot. Each
            snapshot becomes a data point on your wealth trend chart.
          </p>
          <Link href="/dashboard/calculator">
            <Button>Go to Net Worth Calculator</Button>
          </Link>
        </Card>
      </div>
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
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Wealth Tracker
        </h1>
        <p className="mt-1 text-muted-foreground">
          Track your assets, liabilities, and net worth over time.
        </p>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Net Worth Trend
        </h2>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(v: number) =>
                new Intl.NumberFormat("en-IN", {
                  notation: "compact",
                  compactDisplay: "short",
                  maximumFractionDigits: 1,
                }).format(v)
              }
            />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value ?? 0))}
              labelStyle={{ fontWeight: 600 }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="Total Assets"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="Total Liabilities"
              stroke="#F59E0B"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="Net Worth"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Snapshot History
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-3 pr-4 font-medium">Date</th>
                <th className="pb-3 pr-4 font-medium text-right">
                  Total Assets
                </th>
                <th className="pb-3 pr-4 font-medium text-right">
                  Total Liabilities
                </th>
                <th className="pb-3 pr-4 font-medium text-right">Net Worth</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
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
      </Card>
    </div>
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
        className="border-b hover:bg-muted/50 cursor-pointer transition-colors"
        onClick={onToggle}
      >
        <td className="py-3 pr-4">
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
            {snapshot.date}
          </div>
        </td>
        <td className="py-3 pr-4 text-right text-emerald-600 font-medium">
          {formatCurrency(snapshot.totalAssets)}
        </td>
        <td className="py-3 pr-4 text-right text-amber-600 font-medium">
          {formatCurrency(snapshot.totalLiabilities)}
        </td>
        <td className="py-3 pr-4 text-right font-semibold">
          {formatCurrency(snapshot.netWorth)}
        </td>
        <td className="py-3 text-right">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={5} className="bg-muted/30 px-4 py-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h4 className="text-sm font-semibold text-emerald-700 mb-2">
                  Assets ({assets.length})
                </h4>
                {assets.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No assets</p>
                ) : (
                  <ul className="space-y-1">
                    {assets.map((entry) => (
                      <li
                        key={entry.id}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-foreground">
                          {entry.description || entry.statementType}
                        </span>
                        <span className="text-emerald-600 font-medium">
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
                <h4 className="text-sm font-semibold text-amber-700 mb-2">
                  Liabilities ({liabilities.length})
                </h4>
                {liabilities.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No liabilities
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {liabilities.map((entry) => (
                      <li
                        key={entry.id}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-foreground">
                          {entry.description || entry.statementType}
                        </span>
                        <span className="text-amber-600 font-medium">
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
          </td>
        </tr>
      )}
    </>
  );
}
