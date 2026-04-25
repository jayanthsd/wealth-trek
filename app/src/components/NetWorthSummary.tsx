"use client";

import { StatementEntry } from "@/types";
import { computeTotals, formatINR } from "@/lib/computations";
import { cn } from "@/lib/utils";

interface NetWorthSummaryProps {
  statements: StatementEntry[];
  className?: string;
}

export function NetWorthSummary({ statements, className }: NetWorthSummaryProps) {
  const { totalAssets, totalLiabilities, netWorth } = computeTotals(statements);
  const assetPct = totalAssets + totalLiabilities > 0
    ? (totalAssets / (totalAssets + totalLiabilities)) * 100
    : 50;

  return (
    <div className={cn(
      "rounded-2xl border p-4 sm:p-5",
      netWorth >= 0
        ? "bg-primary/5 border-primary/20"
        : "bg-destructive/5 border-destructive/20",
      className
    )}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
        {/* Net Worth — primary metric, highlighted */}
        <div className="flex items-center gap-3 shrink-0">
          <div className={cn(
            "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
            netWorth >= 0 ? "bg-primary/10" : "bg-destructive/10"
          )}>
            <span className={cn(
              "text-sm font-bold",
              netWorth >= 0 ? "text-primary" : "text-destructive"
            )}>₹</span>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Net Worth</p>
            <p className={cn(
              "text-xl font-bold tabular-nums leading-tight",
              netWorth >= 0 ? "text-primary" : "text-destructive"
            )}>
              {formatINR(netWorth)}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className={cn(
          "hidden sm:block h-10 w-px",
          netWorth >= 0 ? "bg-primary/15" : "bg-destructive/15"
        )} />

        {/* Assets / Liabilities row + bar */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-success">Assets</p>
              <p className="text-sm font-semibold tabular-nums text-foreground">{formatINR(totalAssets)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-destructive">Liabilities</p>
              <p className="text-sm font-semibold tabular-nums text-foreground">{formatINR(totalLiabilities)}</p>
            </div>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-destructive/15">
            <div
              className="h-full bg-success rounded-full transition-all duration-500"
              style={{ width: `${assetPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
