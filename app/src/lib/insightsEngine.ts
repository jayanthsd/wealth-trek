import {
  NetWorthSnapshot,
  StatementEntry,
  InsightDomain,
  InsightItem,
  InsightResult,
  AdvancedInputs,
  AdvancedDimensionResults,
} from "@/types";
import { parseBalanceSheet } from "./balanceSheet";
import {
  computeInflationAudit,
  computeGapAnalysis,
  computeDebtQuality,
  computeTaxEfficiency,
  computeTrajectory,
  computeProtection,
} from "./advancedDimensions";

// ---------------------------------------------------------------------------
// Thresholds & Configuration
// ---------------------------------------------------------------------------

export const INSIGHT_THRESHOLDS = {
  debtToAssetWarning: 0.4,
  debtToAssetCritical: 0.5,
  debtToNetWorthWarning: 1.5,
  debtToNetWorthCritical: 3.0,
  concentrationWarning: 0.5,
  concentrationCritical: 0.6,
  emergencyFundWarning: 3,
  emergencyFundCritical: 1,
  idleCashThreshold: 0.15,
  productiveAssetThreshold: 0.3,
  snapshotStalenessDays: 45,
  assumedAnnualCPI: 0.06,
  savingsConsistencyCVThreshold: 0.5,
  liquidTypes: ["Savings Bank Account", "Fixed Deposit"],
  shortTermLiabilityTypes: ["Credit Card Outstanding", "Personal Loan"],
  incomeProducingTypes: ["Mutual Fund", "Stock Holdings", "Fixed Deposit"],
  idleCashTypes: ["Savings Bank Account"],
};

export type InsightConfig = typeof INSIGHT_THRESHOLDS;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function computeEffectiveValue(entry: StatementEntry): number {
  return (entry.closingBalance * entry.ownershipPercentage) / 100;
}

function formatINR(value: number): string {
  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.abs(value));
  return (value < 0 ? "-" : "") + formatted;
}

function pct(value: number): string {
  return `${value >= 0 ? "+" : ""}${(value * 100).toFixed(1)}%`;
}

function monthsBetween(dateA: string, dateB: string): number {
  const a = new Date(dateA);
  const b = new Date(dateB);
  return (
    (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth())
  );
}

function daysSince(dateStr: string): number {
  const d = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

function assetClassTotals(
  snapshot: NetWorthSnapshot
): Map<string, number> {
  const map = new Map<string, number>();
  for (const entry of snapshot.entries) {
    if (entry.category === "asset") {
      const key = entry.statementType;
      map.set(key, (map.get(key) ?? 0) + computeEffectiveValue(entry));
    }
  }
  return map;
}

function sumByTypes(
  snapshot: NetWorthSnapshot,
  types: string[],
  category: "asset" | "liability"
): number {
  let total = 0;
  for (const entry of snapshot.entries) {
    if (entry.category === category && types.includes(entry.statementType)) {
      total += computeEffectiveValue(entry);
    }
  }
  return total;
}

// ---------------------------------------------------------------------------
// Domain 1: Growth & Real Wealth
// ---------------------------------------------------------------------------

export function computeNominalDelta(
  latest: NetWorthSnapshot,
  previous: NetWorthSnapshot
): InsightItem {
  const delta = latest.netWorth - previous.netWorth;
  const isPositive = delta >= 0;
  return {
    id: "growth.nominal-delta",
    domain: "growth",
    title: isPositive ? "Net Worth Grew" : "Net Worth Declined",
    description: `Your net worth ${isPositive ? "increased" : "decreased"} by ${formatINR(Math.abs(delta))} since your last snapshot.`,
    severity: isPositive ? "info" : "warning",
    trend: isPositive ? "up" : "down",
    metricValue: delta,
    metricLabel: "Nominal Change",
  };
}

export function computeRealDelta(
  latest: NetWorthSnapshot,
  previous: NetWorthSnapshot,
  config: InsightConfig = INSIGHT_THRESHOLDS
): InsightItem {
  const nominalDelta = latest.netWorth - previous.netWorth;
  const months = Math.max(monthsBetween(previous.date, latest.date), 1);
  const periodCPI = (config.assumedAnnualCPI / 12) * months;
  const inflationErosion = periodCPI * previous.netWorth;
  const realDelta = nominalDelta - inflationErosion;
  const isPositive = realDelta >= 0;

  return {
    id: "growth.real-delta",
    domain: "growth",
    title: isPositive ? "Real Wealth Grew" : "Inflation Erosion",
    description: isPositive
      ? `After adjusting for ~${(config.assumedAnnualCPI * 100).toFixed(0)}% annual inflation, your wealth grew by ${formatINR(Math.abs(realDelta))} in real terms.`
      : `Nominal growth of ${formatINR(Math.abs(nominalDelta))} was wiped out by inflation (${formatINR(inflationErosion)} erosion at ${(config.assumedAnnualCPI * 100).toFixed(0)}% CPI). Real wealth shrank by ${formatINR(Math.abs(realDelta))}.`,
    severity: isPositive ? "info" : "warning",
    trend: isPositive ? "up" : "down",
    metricValue: realDelta,
    metricLabel: "Real Change",
  };
}

export function computeNetWorthCAGR(
  snapshots: NetWorthSnapshot[],
  _config: InsightConfig = INSIGHT_THRESHOLDS
): InsightItem {
  if (snapshots.length < 2) {
    return {
      id: "growth.cagr",
      domain: "growth",
      title: "Net Worth CAGR",
      description: "Need at least 2 snapshots spanning multiple months to compute CAGR.",
      severity: "info",
      trend: "neutral",
      unavailable: true,
      unavailableReason: "Requires 2+ snapshots spanning at least 2 months",
    };
  }

  const earliest = snapshots[0];
  const latest = snapshots[snapshots.length - 1];
  const months = monthsBetween(earliest.date, latest.date);

  if (months < 2) {
    return {
      id: "growth.cagr",
      domain: "growth",
      title: "Net Worth CAGR",
      description: "Your snapshots don't span enough time yet to compute a meaningful CAGR.",
      severity: "info",
      trend: "neutral",
      unavailable: true,
      unavailableReason: "Snapshots must span at least 2 months",
    };
  }

  if (earliest.netWorth <= 0) {
    return {
      id: "growth.cagr",
      domain: "growth",
      title: "Net Worth CAGR",
      description: "CAGR cannot be computed when the starting net worth is zero or negative.",
      severity: "info",
      trend: "neutral",
      unavailable: true,
      unavailableReason: "Starting net worth must be positive",
    };
  }

  const cagr = Math.pow(latest.netWorth / earliest.netWorth, 12 / months) - 1;
  const isPositive = cagr >= 0;

  return {
    id: "growth.cagr",
    domain: "growth",
    title: "Net Worth CAGR",
    description: `Your net worth has compounded at ${pct(cagr)} annualised over the last ${months} months.`,
    severity: "info",
    trend: isPositive ? "up" : "down",
    metricValue: cagr,
    metricLabel: "CAGR",
  };
}

export function computeAssetGrowthPerClass(
  latest: NetWorthSnapshot,
  previous: NetWorthSnapshot
): InsightItem[] {
  const prevClasses = assetClassTotals(previous);
  const currClasses = assetClassTotals(latest);
  const overallGrowth =
    previous.totalAssets > 0
      ? (latest.totalAssets - previous.totalAssets) / previous.totalAssets
      : 0;

  const results: InsightItem[] = [];
  const underperformers: string[] = [];

  const allClasses = new Set([...prevClasses.keys(), ...currClasses.keys()]);
  for (const cls of allClasses) {
    const prev = prevClasses.get(cls) ?? 0;
    const curr = currClasses.get(cls) ?? 0;
    if (prev === 0) continue;
    const growth = (curr - prev) / prev;
    if (growth <= 0 && overallGrowth > 0) {
      underperformers.push(cls);
    }
  }

  if (underperformers.length > 0) {
    results.push({
      id: "growth.asset-class-underperformers",
      domain: "growth",
      title: "Underperforming Assets",
      description: `While overall assets grew ${pct(overallGrowth)}, these classes lagged: ${underperformers.join(", ")}. Consider reviewing their allocation.`,
      severity: "warning",
      trend: "down",
      metricValue: overallGrowth,
      metricLabel: "Overall Asset Growth",
    });
  } else {
    results.push({
      id: "growth.asset-class-all-growing",
      domain: "growth",
      title: "All Asset Classes Growing",
      description:
        overallGrowth > 0
          ? `Every asset class showed positive growth this period. Overall assets grew ${pct(overallGrowth)}.`
          : "No individual asset class underperformed relative to the overall trend.",
      severity: "info",
      trend: overallGrowth > 0 ? "up" : "neutral",
      metricValue: overallGrowth,
      metricLabel: "Overall Asset Growth",
    });
  }

  return results;
}

// ---------------------------------------------------------------------------
// Domain 2: Leverage & Debt Drag
// ---------------------------------------------------------------------------

export function computeDebtToAssetRatio(
  snapshot: NetWorthSnapshot,
  config: InsightConfig = INSIGHT_THRESHOLDS
): InsightItem {
  if (snapshot.totalAssets === 0) {
    return {
      id: "leverage.debt-to-asset",
      domain: "leverage",
      title: "Debt-to-Asset Ratio",
      description: "Cannot compute ratio — total assets are zero.",
      severity: "critical",
      trend: "neutral",
      metricLabel: "Debt-to-Asset",
      unavailable: true,
      unavailableReason: "Total assets are zero",
    };
  }

  const ratio = snapshot.totalLiabilities / snapshot.totalAssets;
  const severity =
    ratio >= config.debtToAssetCritical
      ? "critical"
      : ratio >= config.debtToAssetWarning
        ? "warning"
        : "info";

  return {
    id: "leverage.debt-to-asset",
    domain: "leverage",
    title: "Debt-to-Asset Ratio",
    description:
      severity === "critical"
        ? `Your liabilities are ${(ratio * 100).toFixed(0)}% of your assets — this is above the ${(config.debtToAssetCritical * 100).toFixed(0)}% critical threshold. Prioritise debt reduction.`
        : severity === "warning"
          ? `Debt-to-asset ratio is ${(ratio * 100).toFixed(0)}%, approaching the ${(config.debtToAssetCritical * 100).toFixed(0)}% critical threshold. Keep an eye on new borrowing.`
          : `Debt-to-asset ratio is a healthy ${(ratio * 100).toFixed(0)}%.`,
    severity,
    trend: severity === "info" ? "down" : "up",
    metricValue: ratio,
    metricLabel: "Debt-to-Asset",
  };
}

export function computeDebtToNetWorthRatio(
  snapshot: NetWorthSnapshot
): InsightItem {
  if (snapshot.netWorth <= 0) {
    return {
      id: "leverage.debt-to-nw",
      domain: "leverage",
      title: "Debt-to-Net-Worth Ratio",
      description:
        snapshot.netWorth === 0
          ? "Your net worth is zero — liabilities fully offset your assets."
          : "Your liabilities exceed your assets, resulting in negative net worth. Focus on debt repayment.",
      severity: "critical",
      trend: "down",
      metricLabel: "Debt-to-Net-Worth",
    };
  }

  const ratio = snapshot.totalLiabilities / snapshot.netWorth;
  const severity =
    ratio >= INSIGHT_THRESHOLDS.debtToNetWorthCritical
      ? "critical"
      : ratio >= INSIGHT_THRESHOLDS.debtToNetWorthWarning
        ? "warning"
        : "info";

  return {
    id: "leverage.debt-to-nw",
    domain: "leverage",
    title: "Debt-to-Net-Worth Ratio",
    description:
      severity === "info"
        ? `Your liabilities are ${ratio.toFixed(1)}× your net worth — within a comfortable range.`
        : `Your liabilities are ${ratio.toFixed(1)}× your net worth. ${severity === "critical" ? "This is critically high — focus on reducing debt." : "Consider limiting new borrowing."}`,
    severity,
    trend: severity === "info" ? "neutral" : "up",
    metricValue: ratio,
    metricLabel: "Debt-to-Net-Worth",
  };
}

export function computeInterestCoverageProxy(): InsightItem {
  return {
    id: "leverage.interest-coverage",
    domain: "leverage",
    title: "Interest Coverage Proxy",
    description:
      "This metric compares your income to estimated interest payments, helping gauge debt serviceability.",
    severity: "info",
    trend: "neutral",
    unavailable: true,
    unavailableReason: "Requires income and interest rate data",
  };
}

export function computeDebtDrag(): InsightItem {
  return {
    id: "leverage.debt-drag",
    domain: "leverage",
    title: "Debt Drag",
    description:
      "Debt drag measures whether your borrowing costs exceed your investment returns.",
    severity: "info",
    trend: "neutral",
    unavailable: true,
    unavailableReason: "Requires average liability rate and asset yield data",
  };
}

// ---------------------------------------------------------------------------
// Domain 3: Liquidity & Resilience
// ---------------------------------------------------------------------------

export function computeLiquidCoverageRatio(
  snapshot: NetWorthSnapshot,
  config: InsightConfig = INSIGHT_THRESHOLDS
): InsightItem {
  const liquidAssets = sumByTypes(snapshot, config.liquidTypes, "asset");
  const shortTermLiabilities = sumByTypes(
    snapshot,
    config.shortTermLiabilityTypes,
    "liability"
  );

  if (shortTermLiabilities === 0) {
    return {
      id: "liquidity.coverage-ratio",
      domain: "liquidity",
      title: "Liquid Coverage Ratio",
      description:
        liquidAssets > 0
          ? `You have ${formatINR(liquidAssets)} in liquid assets and no short-term liabilities — excellent position.`
          : "No liquid assets or short-term liabilities detected.",
      severity: "info",
      trend: "neutral",
      metricLabel: "Liquid Coverage",
    };
  }

  const ratio = liquidAssets / shortTermLiabilities;
  const severity = ratio < 1 ? "critical" : "info";

  return {
    id: "liquidity.coverage-ratio",
    domain: "liquidity",
    title: "Liquid Coverage Ratio",
    description:
      severity === "critical"
        ? `Your liquid assets (${formatINR(liquidAssets)}) cover only ${(ratio * 100).toFixed(0)}% of short-term liabilities (${formatINR(shortTermLiabilities)}). You may face a liquidity squeeze.`
        : `Liquid assets cover ${ratio.toFixed(1)}× your short-term liabilities — healthy liquidity.`,
    severity,
    trend: severity === "critical" ? "down" : "up",
    metricValue: ratio,
    metricLabel: "Liquid Coverage",
  };
}

export function computeEmergencyFundMonths(): InsightItem {
  return {
    id: "liquidity.emergency-fund",
    domain: "liquidity",
    title: "Emergency Fund Months",
    description:
      "To estimate your emergency runway, divide your liquid assets by your monthly expenses. Aim for 3–6 months of coverage.",
    severity: "info",
    trend: "neutral",
    unavailable: true,
    unavailableReason: "Requires monthly expense data",
  };
}

export function computeAssetConcentration(
  snapshot: NetWorthSnapshot,
  config: InsightConfig = INSIGHT_THRESHOLDS
): InsightItem {
  if (snapshot.totalAssets === 0) {
    return {
      id: "liquidity.concentration",
      domain: "liquidity",
      title: "Asset Concentration",
      description: "No assets to analyse for concentration.",
      severity: "info",
      trend: "neutral",
      metricLabel: "Max Concentration",
    };
  }

  const classes = assetClassTotals(snapshot);
  let maxClass = "";
  let maxValue = 0;
  for (const [cls, val] of classes) {
    if (val > maxValue) {
      maxClass = cls;
      maxValue = val;
    }
  }

  const concentration = maxValue / snapshot.totalAssets;
  const severity =
    concentration >= config.concentrationCritical
      ? "critical"
      : concentration >= config.concentrationWarning
        ? "warning"
        : "info";

  return {
    id: "liquidity.concentration",
    domain: "liquidity",
    title: "Asset Concentration",
    description:
      severity === "info"
        ? `Your portfolio is well-diversified — no single class exceeds ${(config.concentrationWarning * 100).toFixed(0)}% of total assets.`
        : `"${maxClass}" makes up ${(concentration * 100).toFixed(0)}% of your assets. ${severity === "critical" ? "This is a significant concentration risk." : "Consider diversifying."}`,
    severity,
    trend: severity === "info" ? "neutral" : "up",
    metricValue: concentration,
    metricLabel: "Max Concentration",
  };
}

// ---------------------------------------------------------------------------
// Domain 4: Efficiency & Cash Utilization
// ---------------------------------------------------------------------------

export function computeIdleCashShare(
  snapshot: NetWorthSnapshot,
  config: InsightConfig = INSIGHT_THRESHOLDS
): InsightItem {
  if (snapshot.totalAssets === 0) {
    return {
      id: "efficiency.idle-cash",
      domain: "efficiency",
      title: "Idle Cash Share",
      description: "No assets to analyse.",
      severity: "info",
      trend: "neutral",
      metricLabel: "Idle Cash %",
    };
  }

  const idleCash = sumByTypes(snapshot, config.idleCashTypes, "asset");
  const ratio = idleCash / snapshot.totalAssets;
  const isHigh = ratio > config.idleCashThreshold;

  return {
    id: "efficiency.idle-cash",
    domain: "efficiency",
    title: "Idle Cash Share",
    description: isHigh
      ? `${(ratio * 100).toFixed(0)}% of your assets (${formatINR(idleCash)}) sit in low-yield accounts. Consider redeploying into higher-return instruments.`
      : `Only ${(ratio * 100).toFixed(0)}% of assets are in low-yield accounts — your cash is well-deployed.`,
    severity: isHigh ? "warning" : "info",
    trend: isHigh ? "down" : "neutral",
    metricValue: ratio,
    metricLabel: "Idle Cash %",
  };
}

export function computeAssetTurnoverProxy(
  snapshot: NetWorthSnapshot,
  config: InsightConfig = INSIGHT_THRESHOLDS
): InsightItem {
  if (snapshot.totalAssets === 0) {
    return {
      id: "efficiency.turnover",
      domain: "efficiency",
      title: "Productive Asset Ratio",
      description: "No assets to analyse.",
      severity: "info",
      trend: "neutral",
      metricLabel: "Productive %",
    };
  }

  const productive = sumByTypes(
    snapshot,
    config.incomeProducingTypes,
    "asset"
  );
  const ratio = productive / snapshot.totalAssets;
  const isLow = ratio < config.productiveAssetThreshold;

  return {
    id: "efficiency.turnover",
    domain: "efficiency",
    title: "Productive Asset Ratio",
    description: isLow
      ? `Only ${(ratio * 100).toFixed(0)}% of your assets are in income-producing instruments. A large portion of your wealth may be sitting idle.`
      : `${(ratio * 100).toFixed(0)}% of your assets are income-producing — good wealth activation.`,
    severity: isLow ? "warning" : "info",
    trend: isLow ? "down" : "up",
    metricValue: ratio,
    metricLabel: "Productive %",
  };
}

// ---------------------------------------------------------------------------
// Domain 5: Risk & Scenario Stress
// ---------------------------------------------------------------------------

export function computeLoanToValue(): InsightItem {
  return {
    id: "risk.ltv",
    domain: "risk",
    title: "Loan-to-Value (LTV)",
    description:
      "LTV compares each secured loan balance against the asset it's backed by. High LTV signals refinancing risk.",
    severity: "info",
    trend: "neutral",
    unavailable: true,
    unavailableReason: "Requires loan-to-asset mapping data",
  };
}

export function computeInsuranceGap(): InsightItem {
  return {
    id: "risk.insurance-gap",
    domain: "risk",
    title: "Insurance Gap",
    description:
      "This metric compares insured amounts against asset values to identify under-insurance risk.",
    severity: "info",
    trend: "neutral",
    unavailable: true,
    unavailableReason: "Requires insurance coverage data",
  };
}

// ---------------------------------------------------------------------------
// Domain 6: Behavioral Signals
// ---------------------------------------------------------------------------

export function computeSnapshotStaleness(
  snapshots: NetWorthSnapshot[],
  config: InsightConfig = INSIGHT_THRESHOLDS
): InsightItem {
  if (snapshots.length === 0) {
    return {
      id: "behavior.staleness",
      domain: "behavior",
      title: "Snapshot Freshness",
      description: "No snapshots recorded yet. Start by adding your first net worth snapshot.",
      severity: "warning",
      trend: "neutral",
      metricLabel: "Days Since Update",
    };
  }

  const latest = snapshots[snapshots.length - 1];
  const days = daysSince(latest.date);
  const isStale = days > config.snapshotStalenessDays;

  return {
    id: "behavior.staleness",
    domain: "behavior",
    title: "Snapshot Freshness",
    description: isStale
      ? `It's been ${days} days since your last snapshot. Regular updates (every 30–45 days) keep your insights accurate.`
      : `Your data is fresh — last updated ${days} day${days === 1 ? "" : "s"} ago.`,
    severity: isStale ? "warning" : "info",
    trend: isStale ? "down" : "up",
    metricValue: days,
    metricLabel: "Days Since Update",
  };
}

export function computeSavingsConsistency(
  snapshots: NetWorthSnapshot[],
  _config: InsightConfig = INSIGHT_THRESHOLDS
): InsightItem {
  if (snapshots.length < 3) {
    return {
      id: "behavior.savings-consistency",
      domain: "behavior",
      title: "Savings Consistency",
      description:
        "Need at least 3 snapshots to analyse your savings pattern. Keep tracking!",
      severity: "info",
      trend: "neutral",
      unavailable: true,
      unavailableReason: "Requires at least 3 snapshots",
    };
  }

  const deltas: number[] = [];
  for (let i = 1; i < snapshots.length; i++) {
    deltas.push(snapshots[i].netWorth - snapshots[i - 1].netWorth);
  }

  const mean = deltas.reduce((a, b) => a + b, 0) / deltas.length;
  const variance =
    deltas.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / deltas.length;
  const stdDev = Math.sqrt(variance);
  const cv = mean !== 0 ? Math.abs(stdDev / mean) : Infinity;
  const isVolatile = cv > INSIGHT_THRESHOLDS.savingsConsistencyCVThreshold;

  return {
    id: "behavior.savings-consistency",
    domain: "behavior",
    title: "Savings Consistency",
    description: isVolatile
      ? `Your net worth additions vary significantly (CV: ${cv.toFixed(2)}). Consistent monthly contributions build wealth faster than sporadic large sums.`
      : `Your savings pattern is steady (CV: ${cv.toFixed(2)}). Consistent discipline is a strong wealth builder.`,
    severity: isVolatile ? "warning" : "info",
    trend: isVolatile ? "down" : "up",
    metricValue: cv,
    metricLabel: "Coefficient of Variation",
  };
}

// ---------------------------------------------------------------------------
// Orchestrator
// ---------------------------------------------------------------------------

function emptyDomains(): Record<InsightDomain, InsightItem[]> {
  return {
    growth: [],
    leverage: [],
    liquidity: [],
    efficiency: [],
    risk: [],
    behavior: [],
    inflation_audit: [],
    gap_analysis: [],
    debt_quality: [],
    tax_efficiency: [],
    trajectory: [],
    protection: [],
  };
}

export function computeAllInsights(
  snapshots: NetWorthSnapshot[],
  config: InsightConfig = INSIGHT_THRESHOLDS,
  advancedInputs?: AdvancedInputs
): InsightResult {
  const domains = emptyDomains();

  const sorted = [...snapshots].sort((a, b) => a.date.localeCompare(b.date));
  const latest = sorted.length > 0 ? sorted[sorted.length - 1] : null;
  const previous = sorted.length >= 2 ? sorted[sorted.length - 2] : null;

  // --- Growth & Real Wealth ---
  if (latest && previous) {
    domains.growth.push(computeNominalDelta(latest, previous));
    domains.growth.push(computeRealDelta(latest, previous, config));
    domains.growth.push(...computeAssetGrowthPerClass(latest, previous));
  }
  domains.growth.push(computeNetWorthCAGR(sorted, config));

  // --- Leverage & Debt Drag ---
  if (latest) {
    domains.leverage.push(computeDebtToAssetRatio(latest, config));
    domains.leverage.push(computeDebtToNetWorthRatio(latest));
  }
  domains.leverage.push(computeInterestCoverageProxy());
  domains.leverage.push(computeDebtDrag());

  // --- Liquidity & Resilience ---
  if (latest) {
    domains.liquidity.push(computeLiquidCoverageRatio(latest, config));
    domains.liquidity.push(computeAssetConcentration(latest, config));
  }
  domains.liquidity.push(computeEmergencyFundMonths());

  // --- Efficiency & Cash Utilization ---
  if (latest) {
    domains.efficiency.push(computeIdleCashShare(latest, config));
    domains.efficiency.push(computeAssetTurnoverProxy(latest, config));
  }

  // --- Risk & Scenario Stress ---
  domains.risk.push(computeLoanToValue());
  domains.risk.push(computeInsuranceGap());

  // --- Behavioral Signals ---
  domains.behavior.push(computeSnapshotStaleness(sorted, config));
  domains.behavior.push(computeSavingsConsistency(sorted, config));

  // --- Advanced Dimensions (D7–D12) ---
  const advancedResults: AdvancedDimensionResults = {};

  if (latest) {
    const bs = parseBalanceSheet(latest);

    // D7: Inflation-Adjusted Asset Audit
    const inflationAudit = computeInflationAudit(bs);
    advancedResults.inflationAudit = inflationAudit;
    const d7Severity: InsightItem["severity"] =
      inflationAudit.overall_flag === "alert" ? "critical" :
      inflationAudit.overall_flag === "warn" ? "warning" : "info";
    domains.inflation_audit.push({
      id: "inflation_audit.summary",
      domain: "inflation_audit",
      title: "Inflation-Adjusted Asset Audit",
      description: inflationAudit.primary_alert || `${inflationAudit.sub_inflation_pct.toFixed(0)}% of assets are sub-inflation.`,
      severity: d7Severity,
      trend: d7Severity === "info" ? "up" : "down",
      metricValue: inflationAudit.sub_inflation_pct / 100,
      metricLabel: "Sub-inflation %",
    });

    // D8: Instrument Gap Analysis
    const gapAnalysis = computeGapAnalysis(bs, advancedInputs);
    advancedResults.gapAnalysis = gapAnalysis;
    const d8Severity: InsightItem["severity"] =
      gapAnalysis.gap_count >= 3 ? "critical" :
      gapAnalysis.gap_count >= 1 || gapAnalysis.over_count >= 1 ? "warning" : "info";
    domains.gap_analysis.push({
      id: "gap_analysis.summary",
      domain: "gap_analysis",
      title: "Instrument Gap Analysis",
      description: gapAnalysis.summary,
      severity: d8Severity,
      trend: d8Severity === "info" ? "neutral" : "down",
      metricValue: gapAnalysis.gap_count,
      metricLabel: "Gaps found",
    });

    // D9: Debt Quality Score
    const debtQuality = computeDebtQuality(bs);
    advancedResults.debtQuality = debtQuality;
    const d9Severity: InsightItem["severity"] =
      debtQuality.status === "red" || debtQuality.credit_card_flag ? "critical" :
      debtQuality.status === "amber" ? "warning" : "info";
    domains.debt_quality.push({
      id: "debt_quality.summary",
      domain: "debt_quality",
      title: "Debt Quality Score",
      description: debtQuality.primary_alert || `Productive debt ratio: ${debtQuality.pdr.toFixed(0)}%.`,
      severity: d9Severity,
      trend: d9Severity === "info" ? "up" : "down",
      metricValue: debtQuality.consumptive_pct / 100,
      metricLabel: "Consumptive debt %",
    });

    // D10: Tax Efficiency Score
    const taxEfficiency = computeTaxEfficiency(bs, advancedInputs);
    advancedResults.taxEfficiency = taxEfficiency;
    const d10Severity: InsightItem["severity"] =
      taxEfficiency.grade === "D" ? "critical" :
      taxEfficiency.grade === "C" ? "warning" : "info";
    domains.tax_efficiency.push({
      id: "tax_efficiency.summary",
      domain: "tax_efficiency",
      title: "Tax Efficiency Score",
      description: taxEfficiency.top_action,
      severity: d10Severity,
      trend: d10Severity === "info" ? "up" : "down",
      metricValue: taxEfficiency.score_pct / 100,
      metricLabel: `Grade: ${taxEfficiency.grade}`,
    });

    // D11: Net Worth Trajectory
    const trajectory = computeTrajectory(bs, advancedInputs);
    if (trajectory) {
      advancedResults.trajectory = trajectory;
      const d11Severity: InsightItem["severity"] = trajectory.on_track ? "info" : "warning";
      domains.trajectory.push({
        id: "trajectory.summary",
        domain: "trajectory",
        title: "Net Worth Trajectory",
        description: trajectory.primary_alert,
        severity: d11Severity,
        trend: trajectory.on_track ? "up" : "down",
        metricValue: trajectory.projections.base.vs_target_pct / 100,
        metricLabel: "vs Target",
      });
    } else {
      domains.trajectory.push({
        id: "trajectory.summary",
        domain: "trajectory",
        title: "Net Worth Trajectory",
        description: "Add monthly income and current age in Advanced Inputs to unlock trajectory projections.",
        severity: "info",
        trend: "neutral",
        unavailable: true,
        unavailableReason: "Requires monthly income and current age",
      });
    }

    // D12: Protection Layer Check
    const protection = computeProtection(bs, advancedInputs);
    if (protection) {
      advancedResults.protection = protection;
      const hasGap = protection.term_status === "gap" || protection.term_status === "low" || protection.health_status === "low";
      const notEntered = protection.term_status === "not_entered" || protection.health_status === "not_entered";
      const d12Severity: InsightItem["severity"] =
        hasGap ? "warning" : notEntered ? "info" : "info";
      domains.protection.push({
        id: "protection.summary",
        domain: "protection",
        title: "Protection Layer Check",
        description: protection.alerts[0] ?? "Protection analysis complete.",
        severity: d12Severity,
        trend: hasGap ? "down" : "neutral",
        metricValue: protection.coverage_pct != null ? protection.coverage_pct / 100 : undefined,
        metricLabel: protection.coverage_pct != null ? "Term coverage" : undefined,
      });
    } else {
      domains.protection.push({
        id: "protection.summary",
        domain: "protection",
        title: "Protection Layer Check",
        description: "Add monthly income in Advanced Inputs to unlock protection analysis.",
        severity: "info",
        trend: "neutral",
        unavailable: true,
        unavailableReason: "Requires monthly income",
      });
    }
  }

  // --- Summary ---
  let total = 0;
  let critical = 0;
  let warnings = 0;
  for (const items of Object.values(domains)) {
    for (const item of items) {
      total++;
      if (item.severity === "critical") critical++;
      if (item.severity === "warning") warnings++;
    }
  }

  return {
    domains,
    advancedResults,
    summary: { total, critical, warnings, info: total - critical - warnings },
    computedAt: new Date().toISOString(),
  };
}
