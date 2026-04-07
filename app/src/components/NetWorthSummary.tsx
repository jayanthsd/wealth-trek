"use client";

import { StatementEntry } from "@/types";
import { computeTotals, formatINR } from "@/lib/computations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";

interface NetWorthSummaryProps {
  statements: StatementEntry[];
  className?: string;
}

export function NetWorthSummary({ statements, className }: NetWorthSummaryProps) {
  const { totalAssets, totalLiabilities, netWorth } = computeTotals(statements);
  const assetPercentage = totalAssets + totalLiabilities > 0 
    ? (totalAssets / (totalAssets + totalLiabilities)) * 100 
    : 50;

  return (
    <Card className={cn("bg-gradient-to-br from-card via-card to-primary/[0.03]", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Landmark className="h-4 w-4" />
          </div>
          <CardTitle>Net Worth Summary</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Assets & Liabilities — stacked labels + compact value */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">Assets</span>
            </div>
            <p className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400 leading-none">
              {formatINR(totalAssets)}
            </p>
          </div>
          <div className="rounded-xl bg-rose-50 dark:bg-rose-950/30 p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingDown className="h-3.5 w-3.5 text-rose-600" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-rose-700 dark:text-rose-400">Liabilities</span>
            </div>
            <p className="text-2xl font-bold tabular-nums text-rose-600 dark:text-rose-400 leading-none">
              {formatINR(totalLiabilities)}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Assets</span>
            <span>{assetPercentage.toFixed(0)}% / {(100 - assetPercentage).toFixed(0)}%</span>
            <span>Liabilities</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-rose-200 dark:bg-rose-900/40">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${assetPercentage}%` }}
            />
          </div>
        </div>

        {/* Net Worth hero */}
        <div className={`rounded-xl p-4 text-center ${netWorth >= 0 ? "bg-primary/8 border border-primary/15" : "bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900"}`}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
            Net Worth
          </p>
          <p className={`text-3xl font-bold tabular-nums leading-none ${netWorth >= 0 ? "text-primary" : "text-rose-600"}`}>
            {formatINR(netWorth)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
