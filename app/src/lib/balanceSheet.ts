import { NetWorthSnapshot, BalanceSheet } from "@/types";
import {
  STATEMENT_TO_ASSET_KEY,
  STATEMENT_TO_LIABILITY_KEY,
} from "./analyticsConstants";

// ---------------------------------------------------------------------------
// Parse a NetWorthSnapshot into a structured BalanceSheet
// ---------------------------------------------------------------------------

export function parseBalanceSheet(snapshot: NetWorthSnapshot): BalanceSheet {
  const assets: Record<string, number> = {};
  const liabilities: Record<string, number> = {};

  for (const entry of snapshot.entries) {
    const effectiveValue =
      (entry.closingBalance * entry.ownershipPercentage) / 100;

    if (entry.category === "asset") {
      const key =
        STATEMENT_TO_ASSET_KEY[entry.statementType] ?? entry.statementType;
      assets[key] = (assets[key] ?? 0) + effectiveValue;
    } else {
      const key =
        STATEMENT_TO_LIABILITY_KEY[entry.statementType] ?? entry.statementType;
      liabilities[key] = (liabilities[key] ?? 0) + effectiveValue;
    }
  }

  const total_assets = Object.values(assets).reduce((s, v) => s + v, 0);
  const total_liabilities = Object.values(liabilities).reduce(
    (s, v) => s + v,
    0
  );

  return { assets, liabilities, total_assets, total_liabilities };
}
