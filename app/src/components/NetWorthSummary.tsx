"use client";

import { StatementEntry } from "@/types";
import { computeTotals, formatINR } from "@/lib/computations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Calculator } from "lucide-react";

interface NetWorthSummaryProps {
  statements: StatementEntry[];
}

export function NetWorthSummary({ statements }: NetWorthSummaryProps) {
  const { totalAssets, totalLiabilities, netWorth } = computeTotals(statements);
  const assetPercentage = totalAssets + totalLiabilities > 0 
    ? (totalAssets / (totalAssets + totalLiabilities)) * 100 
    : 50;

  return (
    <Card className="bg-gradient-to-br from-card via-card to-primary/[0.03]">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Calculator className="h-4 w-4" />
          </div>
          <CardTitle className="text-lg font-semibold">Net Worth Summary</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-emerald-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-medium uppercase tracking-wide text-emerald-700">Total Assets</span>
            </div>
            <p className="text-xl font-bold tabular-nums text-emerald-600">
              {formatINR(totalAssets)}
            </p>
          </div>
          <div className="rounded-xl bg-rose-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-rose-600" />
              <span className="text-xs font-medium uppercase tracking-wide text-rose-700">Total Liabilities</span>
            </div>
            <p className="text-xl font-bold tabular-nums text-rose-600">
              {formatINR(totalLiabilities)}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Assets vs Liabilities</span>
            <span>{assetPercentage.toFixed(0)}% / {(100 - assetPercentage).toFixed(0)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-rose-200">
            <div 
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${assetPercentage}%` }}
            />
          </div>
        </div>

        <div className={`rounded-xl p-5 text-center ${netWorth >= 0 ? "bg-primary/5" : "bg-rose-50"}`}>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
            Your Net Worth
          </p>
          <p className={`text-3xl font-bold tabular-nums ${netWorth >= 0 ? "text-primary" : "text-rose-600"}`}>
            {formatINR(netWorth)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
