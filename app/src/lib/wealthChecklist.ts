import type {
  WealthStage,
  ChecklistItemDef,
  ChecklistResult,
  ChecklistContext,
  ChecklistStatus,
  StageHistoryEntry,
  NetWorthSnapshot,
  AdvancedInputs,
  InsightResult,
} from "@/types";
import { INSIGHT_THRESHOLDS } from "./insightsEngine";
import { classifyWealthStage, ALL_STAGES } from "./wealthStage";
import { parseBalanceSheet } from "./balanceSheet";
import { computeAllInsights } from "./insightsEngine";

// ---------------------------------------------------------------------------
// Evaluator type
// ---------------------------------------------------------------------------

type Evaluator = (ctx: ChecklistContext) => ChecklistResult;

// ---------------------------------------------------------------------------
// Helper: build a result
// ---------------------------------------------------------------------------

function result(
  def: ChecklistItemDef,
  status: ChecklistStatus,
  message: string,
  actionHint?: string
): ChecklistResult {
  const score = status === "done" ? 100 : status === "partial" ? 50 : 0;
  return {
    id: def.id,
    label: def.label,
    category: def.category,
    weight: def.weight,
    status,
    score,
    message,
    actionHint,
  };
}

// ---------------------------------------------------------------------------
// Helper: compute liquid assets from balance sheet
// ---------------------------------------------------------------------------

function liquidAssets(ctx: ChecklistContext): number {
  const bs = ctx.balanceSheet;
  return (bs.assets["sb_hdfc"] ?? 0) +
    (bs.assets["sb_kotak"] ?? 0) +
    (bs.assets["fd"] ?? 0);
}

// ---------------------------------------------------------------------------
// Helper: equity percentage
// ---------------------------------------------------------------------------

function equityPct(ctx: ChecklistContext): number {
  const bs = ctx.balanceSheet;
  const equity = (bs.assets["mf"] ?? 0) + (bs.assets["stocks"] ?? 0);
  return bs.total_assets > 0 ? (equity / bs.total_assets) * 100 : 0;
}

// ---------------------------------------------------------------------------
// Helper: real estate percentage
// ---------------------------------------------------------------------------

function realEstatePct(ctx: ChecklistContext): number {
  const bs = ctx.balanceSheet;
  const re = (bs.assets["real_estate"] ?? 0) + (bs.assets["self_occupied_home"] ?? 0);
  return bs.total_assets > 0 ? (re / bs.total_assets) * 100 : 0;
}

// ---------------------------------------------------------------------------
// FOUNDATION STAGE ITEMS
// ---------------------------------------------------------------------------

const FOUNDATION_ITEMS: ChecklistItemDef[] = [
  { id: "f.emergency-fund", stage: "foundation", label: "Build emergency fund (₹1–3L or 3–6 months expenses)", category: "protection", weight: 3 },
  { id: "f.health-insurance", stage: "foundation", label: "Buy health insurance (min ₹5–10L cover)", category: "protection", weight: 3 },
  { id: "f.term-insurance", stage: "foundation", label: "Buy term insurance (if dependents exist)", category: "protection", weight: 2 },
  { id: "f.high-interest-debt", stage: "foundation", label: "Eliminate high-interest debt (>12–15%)", category: "growth", weight: 3 },
  { id: "f.sip-started", stage: "foundation", label: "Start SIP (even ₹2–5k/month)", category: "behavior", weight: 2 },
  { id: "f.savings-rate", stage: "foundation", label: "Maintain savings rate ≥ 20%", category: "behavior", weight: 2 },
  { id: "f.track-monthly", stage: "foundation", label: "Track all assets & liabilities monthly", category: "behavior", weight: 1 },
];

function evalEmergencyFund(def: ChecklistItemDef): Evaluator {
  return (ctx) => {
    const income = ctx.advancedInputs?.monthly_income;
    if (!income) {
      return result(def, "not_applicable", "Enter your monthly income in Advanced Inputs to evaluate your emergency fund.");
    }
    const liquid = liquidAssets(ctx);
    const months = liquid / income;
    if (months >= 6) return result(def, "done", `Emergency fund covers ${months.toFixed(1)} months of expenses.`);
    if (months >= 1) return result(def, "partial", `Emergency fund covers ${months.toFixed(1)} months. Target: 3–6 months.`, `Build up to ₹${((6 * income) / 100000).toFixed(1)}L`);
    return result(def, "todo", "No meaningful emergency fund detected.", `Start building toward ₹${((3 * income) / 100000).toFixed(1)}L`);
  };
}

function evalHealthInsurance(def: ChecklistItemDef): Evaluator {
  return (ctx) => {
    const prot = ctx.insightResult.advancedResults?.protection;
    if (!prot || prot.health_status === "not_entered") {
      return result(def, "not_applicable", "Enter your health cover amount in Advanced Inputs.");
    }
    if (prot.health_status === "adequate") return result(def, "done", "Health insurance cover is adequate.");
    return result(def, "todo", "Health insurance cover is below recommended minimum.", "Get at least ₹5–10L health cover");
  };
}

function evalTermInsurance(def: ChecklistItemDef): Evaluator {
  return (ctx) => {
    const prot = ctx.insightResult.advancedResults?.protection;
    if (!prot || prot.term_status === "not_entered") {
      return result(def, "not_applicable", "Enter your term cover amount in Advanced Inputs.");
    }
    if (prot.term_status === "adequate") return result(def, "done", "Term insurance cover is adequate.");
    if (prot.term_status === "low") return result(def, "partial", "Term cover exists but is below recommended level.", "Increase cover to 10× annual income");
    return result(def, "todo", "No term insurance detected. Critical if you have dependents.", "Get term cover of at least 10× annual income");
  };
}

function evalHighInterestDebt(def: ChecklistItemDef): Evaluator {
  return (ctx) => {
    const dq = ctx.insightResult.advancedResults?.debtQuality;
    if (!dq) {
      // No liabilities at all → done
      if (ctx.balanceSheet.total_liabilities === 0) return result(def, "done", "No liabilities detected — debt-free.");
      return result(def, "partial", "Debt quality analysis unavailable. Ensure no high-interest debt exists.");
    }
    if (dq.credit_card_flag) return result(def, "todo", "Credit card balance detected at 36–42% APR.", "Clear credit card debt before any new investment");
    if (dq.consumptive_pct < 10) return result(def, "done", "No high-interest or consumptive debt detected.");
    return result(def, "partial", `Consumptive debt is ${dq.consumptive_pct.toFixed(0)}% of liabilities.`, "Prioritize paying down vehicle/personal loans");
  };
}

function evalSipStarted(def: ChecklistItemDef): Evaluator {
  return (ctx) => {
    const sip = ctx.advancedInputs?.monthly_investment;
    if (sip == null) return result(def, "not_applicable", "Enter your monthly SIP amount in Advanced Inputs.");
    if (sip >= 2000) return result(def, "done", `SIP of ₹${sip.toLocaleString("en-IN")}/month active. Discipline matters!`);
    if (sip > 0) return result(def, "partial", `SIP of ₹${sip.toLocaleString("en-IN")}/month — consider increasing to ₹2,000+.`, "Increase SIP to at least ₹2,000/month");
    return result(def, "todo", "No SIP detected.", "Start with even ₹500–2,000/month");
  };
}

function evalSavingsRate(def: ChecklistItemDef): Evaluator {
  return (ctx) => {
    const income = ctx.advancedInputs?.monthly_income;
    const investment = ctx.advancedInputs?.monthly_investment;
    if (!income || investment == null) return result(def, "not_applicable", "Enter monthly income and investment in Advanced Inputs.");
    const rate = (investment / income) * 100;
    if (rate >= 20) return result(def, "done", `Savings rate is ${rate.toFixed(0)}% — on track.`);
    if (rate >= 10) return result(def, "partial", `Savings rate is ${rate.toFixed(0)}%. Target: ≥20%.`, "Increase monthly savings to 20%+ of income");
    return result(def, "todo", `Savings rate is only ${rate.toFixed(0)}%.`, "Find ways to save at least 20% of income");
  };
}

function evalTrackMonthly(def: ChecklistItemDef): Evaluator {
  return (ctx) => {
    const snaps = ctx.snapshots;
    if (snaps.length >= 3) {
      // Check if snapshots are roughly monthly
      const sorted = [...snaps].sort((a, b) => a.date.localeCompare(b.date));
      const last3 = sorted.slice(-3);
      const d0 = new Date(last3[0].date);
      const d2 = new Date(last3[2].date);
      const daySpan = (d2.getTime() - d0.getTime()) / (1000 * 60 * 60 * 24);
      if (daySpan <= 100) return result(def, "done", `${snaps.length} snapshots tracked. Great habit!`);
      return result(def, "partial", `${snaps.length} snapshots exist but spacing is irregular.`, "Try to update monthly");
    }
    if (snaps.length >= 1) return result(def, "partial", `${snaps.length} snapshot(s) so far. Keep tracking monthly.`, "Add snapshots each month");
    return result(def, "todo", "No snapshots yet.", "Create your first net worth snapshot");
  };
}

const FOUNDATION_EVALUATORS: Map<string, Evaluator> = new Map([
  ["f.emergency-fund", evalEmergencyFund(FOUNDATION_ITEMS[0])],
  ["f.health-insurance", evalHealthInsurance(FOUNDATION_ITEMS[1])],
  ["f.term-insurance", evalTermInsurance(FOUNDATION_ITEMS[2])],
  ["f.high-interest-debt", evalHighInterestDebt(FOUNDATION_ITEMS[3])],
  ["f.sip-started", evalSipStarted(FOUNDATION_ITEMS[4])],
  ["f.savings-rate", evalSavingsRate(FOUNDATION_ITEMS[5])],
  ["f.track-monthly", evalTrackMonthly(FOUNDATION_ITEMS[6])],
]);

// ---------------------------------------------------------------------------
// STABILITY STAGE ITEMS
// ---------------------------------------------------------------------------

const STABILITY_ITEMS: ChecklistItemDef[] = [
  { id: "s.emergency-fund-full", stage: "stability", label: "Emergency fund fully built (6 months expenses)", category: "protection", weight: 3 },
  { id: "s.insurance-optimized", stage: "stability", label: "Insurance optimized (not over/under insured)", category: "protection", weight: 2 },
  { id: "s.sip-25-pct", stage: "stability", label: "SIP contribution ≥ 25–30% of income", category: "behavior", weight: 3 },
  { id: "s.asset-allocation", stage: "stability", label: "Basic asset allocation started (equity/debt/gold)", category: "diversification", weight: 3 },
  { id: "s.no-credit-card", stage: "stability", label: "No credit card rollover", category: "growth", weight: 2 },
  { id: "s.goal-investing", stage: "stability", label: "Start goal-based investing (house, child, etc.)", category: "behavior", weight: 1 },
  { id: "s.no-lifestyle-inflation", stage: "stability", label: "Avoid lifestyle inflation spikes", category: "behavior", weight: 1 },
];

function evalEmergencyFundFull(def: ChecklistItemDef): Evaluator {
  return (ctx) => {
    const income = ctx.advancedInputs?.monthly_income;
    if (!income) return result(def, "not_applicable", "Enter your monthly income in Advanced Inputs.");
    const liquid = liquidAssets(ctx);
    const months = liquid / income;
    if (months >= 6) return result(def, "done", `Emergency fund covers ${months.toFixed(1)} months — fully built.`);
    if (months >= 3) return result(def, "partial", `Emergency fund covers ${months.toFixed(1)} months. Target: 6 months.`, `Add ₹${(((6 - months) * income) / 100000).toFixed(1)}L more`);
    return result(def, "todo", `Emergency fund covers only ${months.toFixed(1)} months.`, "Build up to 6 months of expenses");
  };
}

function evalInsuranceOptimized(def: ChecklistItemDef): Evaluator {
  return (ctx) => {
    const prot = ctx.insightResult.advancedResults?.protection;
    if (!prot || (prot.term_status === "not_entered" && prot.health_status === "not_entered")) {
      return result(def, "not_applicable", "Enter insurance details in Advanced Inputs.");
    }
    const termOk = prot.term_status === "adequate" || prot.term_status === "not_entered";
    const healthOk = prot.health_status === "adequate";
    if (termOk && healthOk) return result(def, "done", "Insurance coverage is well-optimized.");
    if (termOk || healthOk) return result(def, "partial", "One insurance type needs attention.", prot.alerts[0] ?? "Review your insurance gaps");
    return result(def, "todo", "Both term and health insurance need attention.", prot.alerts[0] ?? "Review insurance coverage");
  };
}

function evalSip25Pct(def: ChecklistItemDef): Evaluator {
  return (ctx) => {
    const income = ctx.advancedInputs?.monthly_income;
    const sip = ctx.advancedInputs?.monthly_investment;
    if (!income || sip == null) return result(def, "not_applicable", "Enter monthly income and SIP amount in Advanced Inputs.");
    const pct = (sip / income) * 100;
    if (pct >= 25) return result(def, "done", `SIP is ${pct.toFixed(0)}% of income — excellent consistency.`);
    if (pct >= 15) return result(def, "partial", `SIP is ${pct.toFixed(0)}% of income. Target: 25–30%.`, "Increase SIP gradually toward 25%+ of income");
    return result(def, "todo", `SIP is only ${pct.toFixed(0)}% of income.`, "Aim for 25–30% of income in SIPs");
  };
}

function evalAssetAllocation(def: ChecklistItemDef): Evaluator {
  return (ctx) => {
    const gap = ctx.insightResult.advancedResults?.gapAnalysis;
    if (!gap) return result(def, "partial", "Asset allocation analysis not available. Ensure you have a mix of equity, debt, and gold.");
    if (gap.gap_count === 0) return result(def, "done", "All instrument buckets are adequately covered.");
    if (gap.gap_count <= 2) return result(def, "partial", `${gap.gap_count} allocation gap(s) detected.`, gap.summary);
    return result(def, "todo", `${gap.gap_count} allocation gaps — basic diversification missing.`, "Start with index funds + FD + gold");
  };
}

function evalNoCreditCard(def: ChecklistItemDef): Evaluator {
  return (ctx) => {
    const dq = ctx.insightResult.advancedResults?.debtQuality;
    if (!dq) {
      if (ctx.balanceSheet.total_liabilities === 0) return result(def, "done", "No liabilities — no credit card rollover.");
      return result(def, "partial", "Unable to determine credit card status.");
    }
    if (!dq.credit_card_flag) return result(def, "done", "No credit card rollover detected.");
    return result(def, "todo", "Credit card balance detected — this is a fail flag.", "Clear credit card debt immediately");
  };
}

function evalGoalInvesting(def: ChecklistItemDef): Evaluator {
  return (ctx) => {
    // We can't directly check goals from here (they're in localStorage).
    // Use a proxy: if user has multiple asset types, they're likely goal-investing
    const bs = ctx.balanceSheet;
    const assetTypes = Object.keys(bs.assets).filter(k => bs.assets[k] > 0).length;
    if (assetTypes >= 3) return result(def, "done", "Multiple asset types suggest goal-aligned investing.");
    if (assetTypes >= 2) return result(def, "partial", "Consider diversifying into goal-specific investments.");
    return result(def, "todo", "Start mapping investments to specific financial goals.", "Set goals: house deposit, education fund, etc.");
  };
}

function evalNoLifestyleInflation(def: ChecklistItemDef): Evaluator {
  return (ctx) => {
    // Proxy: check savings consistency from behavioral signals
    const behaviorInsights = ctx.insightResult.domains.behavior;
    const consistency = behaviorInsights.find(i => i.id === "behavior.savings-consistency");
    if (!consistency || consistency.unavailable) return result(def, "not_applicable", "Need 3+ snapshots to assess lifestyle patterns.");
    if (consistency.severity === "info") return result(def, "done", "Savings patterns are consistent — no lifestyle inflation detected.");
    return result(def, "partial", "Savings consistency is volatile — possible lifestyle inflation.", "Track month-to-month expenses for spikes");
  };
}

const STABILITY_EVALUATORS: Map<string, Evaluator> = new Map([
  ["s.emergency-fund-full", evalEmergencyFundFull(STABILITY_ITEMS[0])],
  ["s.insurance-optimized", evalInsuranceOptimized(STABILITY_ITEMS[1])],
  ["s.sip-25-pct", evalSip25Pct(STABILITY_ITEMS[2])],
  ["s.asset-allocation", evalAssetAllocation(STABILITY_ITEMS[3])],
  ["s.no-credit-card", evalNoCreditCard(STABILITY_ITEMS[4])],
  ["s.goal-investing", evalGoalInvesting(STABILITY_ITEMS[5])],
  ["s.no-lifestyle-inflation", evalNoLifestyleInflation(STABILITY_ITEMS[6])],
]);

// ---------------------------------------------------------------------------
// ACCELERATION STAGE ITEMS
// ---------------------------------------------------------------------------

const ACCELERATION_ITEMS: ChecklistItemDef[] = [
  { id: "a.equity-exposure", stage: "acceleration", label: "Equity exposure optimized (65–80%)", category: "growth", weight: 3 },
  { id: "a.diversify-funds", stage: "acceleration", label: "Diversify across index/flexi-cap/mid-cap funds", category: "diversification", weight: 2 },
  { id: "a.rebalancing", stage: "acceleration", label: "Annual portfolio rebalancing started", category: "diversification", weight: 2 },
  { id: "a.tax-efficiency", stage: "acceleration", label: "Tax efficiency: ELSS/80C fully utilized", category: "tax", weight: 2 },
  { id: "a.no-concentration", stage: "acceleration", label: "No concentration risk (no asset > 40%)", category: "diversification", weight: 3 },
  { id: "a.cagr-tracked", stage: "acceleration", label: "Net worth CAGR tracked year-over-year", category: "behavior", weight: 1 },
  { id: "a.income-streams", stage: "acceleration", label: "Increase income streams (bonus, side income)", category: "growth", weight: 1 },
];

function evalEquityExposure(def: ChecklistItemDef): Evaluator {
  return (ctx) => {
    const pct = equityPct(ctx);
    if (pct >= 65 && pct <= 80) return result(def, "done", `Equity exposure is ${pct.toFixed(0)}% — well optimized.`);
    if (pct >= 50) return result(def, "partial", `Equity exposure is ${pct.toFixed(0)}%. Target: 65–80%.`, "Shift more toward equity for growth");
    if (pct > 80) return result(def, "partial", `Equity exposure is ${pct.toFixed(0)}% — slightly aggressive.`, "Consider balancing with some debt instruments");
    return result(def, "todo", `Equity exposure is only ${pct.toFixed(0)}%.`, "Increase equity allocation to 65–80% for this stage");
  };
}

function evalDiversifyFunds(def: ChecklistItemDef): Evaluator {
  return (ctx) => {
    const gap = ctx.insightResult.advancedResults?.gapAnalysis;
    if (!gap) return result(def, "partial", "Gap analysis unavailable. Ensure fund diversity.");
    if (gap.gap_count === 0 && gap.over_count === 0) return result(def, "done", "Portfolio is well diversified across fund types.");
    if (gap.gap_count <= 1) return result(def, "partial", `${gap.gap_count} gap — room for improvement.`, gap.summary);
    return result(def, "todo", `${gap.gap_count} gaps in diversification.`, "Add index funds, flexi-cap, or mid-cap exposure");
  };
}

function evalRebalancing(def: ChecklistItemDef): Evaluator {
  return (ctx) => {
    // Proxy: if user has 12+ months of snapshots, check allocation drift
    const sorted = [...ctx.snapshots].sort((a, b) => a.date.localeCompare(b.date));
    if (sorted.length < 4) return result(def, "not_applicable", "Need 4+ snapshots to assess rebalancing patterns.");
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const monthSpan = ((new Date(last.date).getTime() - new Date(first.date).getTime()) / (1000 * 60 * 60 * 24 * 30));
    if (monthSpan < 6) return result(def, "not_applicable", "Need 6+ months of history to assess rebalancing.");
    // If the user has regular snapshots over 12+ months, assume rebalancing awareness
    if (monthSpan >= 12 && sorted.length >= 6) return result(def, "done", "Regular tracking over 12+ months suggests rebalancing awareness.");
    return result(def, "partial", "Start an annual rebalancing discipline.", "Review your asset allocation at least once a year");
  };
}

function evalTaxEfficiency(def: ChecklistItemDef): Evaluator {
  return (ctx) => {
    const tax = ctx.insightResult.advancedResults?.taxEfficiency;
    if (!tax) return result(def, "not_applicable", "Tax efficiency requires advanced inputs (PPF, VPF contributions).");
    if (tax.grade === "A") return result(def, "done", "Tax efficiency grade A — all checks passed.");
    if (tax.grade === "B") return result(def, "partial", `Tax efficiency grade ${tax.grade}. ${tax.top_action}`, tax.top_action);
    return result(def, "todo", `Tax efficiency grade ${tax.grade}. ${tax.top_action}`, tax.top_action);
  };
}

function evalNoConcentration(def: ChecklistItemDef): Evaluator {
  return (ctx) => {
    const concInsight = ctx.insightResult.domains.liquidity.find(i => i.id === "liquidity.concentration");
    if (!concInsight || concInsight.unavailable) return result(def, "not_applicable", "Concentration analysis requires asset data.");
    if (concInsight.severity === "info") return result(def, "done", "No single asset class dominates your portfolio.");
    if (concInsight.severity === "warning") return result(def, "partial", concInsight.description, "Reduce allocation to dominant asset class below 40%");
    return result(def, "todo", concInsight.description, "Urgently diversify — single asset > 60% of portfolio");
  };
}

function evalCagrTracked(def: ChecklistItemDef): Evaluator {
  return (ctx) => {
    const cagrInsight = ctx.insightResult.domains.growth.find(i => i.id === "growth.cagr");
    if (!cagrInsight || cagrInsight.unavailable) return result(def, "not_applicable", "Need 2+ snapshots spanning 2+ months for CAGR.");
    return result(def, "done", `Net worth CAGR: ${((cagrInsight.metricValue ?? 0) * 100).toFixed(1)}% — tracked.`);
  };
}

function evalIncomeStreams(def: ChecklistItemDef): Evaluator {
  return (ctx) => {
    // Proxy: check if income-producing assets ratio is healthy
    const effInsight = ctx.insightResult.domains.efficiency.find(i => i.id === "efficiency.asset-turnover");
    if (!effInsight || effInsight.unavailable) return result(def, "partial", "Consider diversifying income sources beyond salary.");
    if (effInsight.severity === "info") return result(def, "done", "Productive assets form a healthy share of your portfolio.");
    return result(def, "partial", "Productive asset ratio is low.", "Consider side income or increasing investment in return-generating assets");
  };
}

const ACCELERATION_EVALUATORS: Map<string, Evaluator> = new Map([
  ["a.equity-exposure", evalEquityExposure(ACCELERATION_ITEMS[0])],
  ["a.diversify-funds", evalDiversifyFunds(ACCELERATION_ITEMS[1])],
  ["a.rebalancing", evalRebalancing(ACCELERATION_ITEMS[2])],
  ["a.tax-efficiency", evalTaxEfficiency(ACCELERATION_ITEMS[3])],
  ["a.no-concentration", evalNoConcentration(ACCELERATION_ITEMS[4])],
  ["a.cagr-tracked", evalCagrTracked(ACCELERATION_ITEMS[5])],
  ["a.income-streams", evalIncomeStreams(ACCELERATION_ITEMS[6])],
]);

// ---------------------------------------------------------------------------
// OPTIMIZATION STAGE ITEMS
// ---------------------------------------------------------------------------

const OPTIMIZATION_ITEMS: ChecklistItemDef[] = [
  { id: "o.multi-asset", stage: "optimization", label: "Portfolio diversification across asset classes", category: "diversification", weight: 3 },
  { id: "o.international", stage: "optimization", label: "International diversification (5–15%)", category: "diversification", weight: 2 },
  { id: "o.tax-optimization", stage: "optimization", label: "Tax optimization strategies active", category: "tax", weight: 2 },
  { id: "o.estate-planning", stage: "optimization", label: "Estate planning started (will creation)", category: "protection", weight: 2 },
  { id: "o.no-re-overexposure", stage: "optimization", label: "No overexposure to real estate (< 50%)", category: "diversification", weight: 3 },
  { id: "o.risk-audit", stage: "optimization", label: "Risk audit: \"What can wipe me out?\"", category: "protection", weight: 2 },
];

function evalMultiAsset(def: ChecklistItemDef): Evaluator {
  return (ctx) => {
    const gap = ctx.insightResult.advancedResults?.gapAnalysis;
    const bs = ctx.balanceSheet;
    const assetTypes = Object.keys(bs.assets).filter(k => bs.assets[k] > 0).length;
    if (gap && gap.gap_count === 0 && assetTypes >= 4) return result(def, "done", `${assetTypes} asset classes with no allocation gaps.`);
    if (assetTypes >= 3) return result(def, "partial", `${assetTypes} asset classes. ${gap ? `${gap.gap_count} gap(s) remain.` : ""}`, "Add missing asset classes for full diversification");
    return result(def, "todo", `Only ${assetTypes} asset class(es).`, "Diversify across equity, debt, gold, and optionally real estate");
  };
}

function evalInternational(def: ChecklistItemDef): Evaluator {
  return (ctx) => {
    const hasIntl = ctx.advancedInputs?.has_international_funds;
    if (hasIntl == null) return result(def, "not_applicable", "Indicate if you hold international funds in Advanced Inputs.");
    if (hasIntl) return result(def, "done", "International diversification in place.");
    return result(def, "todo", "No international diversification.", "Consider allocating 5–15% to international index funds");
  };
}

function evalTaxOptimization(def: ChecklistItemDef): Evaluator {
  return (ctx) => {
    const tax = ctx.insightResult.advancedResults?.taxEfficiency;
    if (!tax) return result(def, "not_applicable", "Tax analysis requires advanced inputs.");
    if (tax.grade === "A") return result(def, "done", "Tax optimization is excellent.");
    if (tax.grade === "B") return result(def, "partial", `Tax grade ${tax.grade}. Consider: ${tax.top_action}`, tax.top_action);
    return result(def, "todo", `Tax grade ${tax.grade}. ${tax.top_action}`, tax.top_action);
  };
}

function evalEstatePlanning(def: ChecklistItemDef): Evaluator {
  return (ctx) => {
    const hasWill = ctx.advancedInputs?.has_will_created;
    if (hasWill == null) return result(def, "not_applicable", "Indicate if you have a will in Advanced Inputs.");
    if (hasWill) return result(def, "done", "Will created — estate planning initiated.");
    return result(def, "todo", "No will detected.", "Create a will and update nominees on all accounts");
  };
}

function evalNoReOverexposure(def: ChecklistItemDef): Evaluator {
  return (ctx) => {
    const rePct = realEstatePct(ctx);
    if (rePct < 30) return result(def, "done", `Real estate is ${rePct.toFixed(0)}% of assets — well within range.`);
    if (rePct < 50) return result(def, "partial", `Real estate is ${rePct.toFixed(0)}% of assets. Getting close to 50% limit.`, "Avoid adding more real estate exposure");
    return result(def, "todo", `Real estate is ${rePct.toFixed(0)}% of assets — overexposed.`, "Rebalance away from real estate");
  };
}

function evalRiskAudit(def: ChecklistItemDef): Evaluator {
  return (ctx) => {
    const prot = ctx.insightResult.advancedResults?.protection;
    const dq = ctx.insightResult.advancedResults?.debtQuality;
    const concInsight = ctx.insightResult.domains.liquidity.find(i => i.id === "liquidity.concentration");
    // Composite check: insurance + debt + concentration
    let issues = 0;
    if (prot && (prot.term_status === "gap" || prot.health_status === "low")) issues++;
    if (dq && dq.credit_card_flag) issues++;
    if (concInsight && concInsight.severity === "critical") issues++;
    if (issues === 0) return result(def, "done", "Risk audit clean — no major vulnerabilities detected.");
    if (issues === 1) return result(def, "partial", `1 risk factor identified.`, "Address insurance gaps, debt, or concentration");
    return result(def, "todo", `${issues} risk factors need attention.`, "Review insurance, debt quality, and concentration risk");
  };
}

const OPTIMIZATION_EVALUATORS: Map<string, Evaluator> = new Map([
  ["o.multi-asset", evalMultiAsset(OPTIMIZATION_ITEMS[0])],
  ["o.international", evalInternational(OPTIMIZATION_ITEMS[1])],
  ["o.tax-optimization", evalTaxOptimization(OPTIMIZATION_ITEMS[2])],
  ["o.estate-planning", evalEstatePlanning(OPTIMIZATION_ITEMS[3])],
  ["o.no-re-overexposure", evalNoReOverexposure(OPTIMIZATION_ITEMS[4])],
  ["o.risk-audit", evalRiskAudit(OPTIMIZATION_ITEMS[5])],
]);

// ---------------------------------------------------------------------------
// PRESERVATION STAGE ITEMS
// ---------------------------------------------------------------------------

const PRESERVATION_ITEMS: ChecklistItemDef[] = [
  { id: "p.risk-adjusted", stage: "preservation", label: "Risk-adjusted allocation (equity 40–60%)", category: "diversification", weight: 3 },
  { id: "p.advanced-diversification", stage: "preservation", label: "Advanced diversification (international/REITs)", category: "diversification", weight: 2 },
  { id: "p.tax-planning", stage: "preservation", label: "Structured tax planning active", category: "tax", weight: 2 },
  { id: "p.liquidity-buffer", stage: "preservation", label: "Liquidity buffer: 2–3 years expenses in low-risk", category: "protection", weight: 3 },
  { id: "p.estate-finalized", stage: "preservation", label: "Estate planning finalized (will + succession)", category: "protection", weight: 2 },
  { id: "p.professional-review", stage: "preservation", label: "Periodic professional review (CA/fee-only advisor)", category: "behavior", weight: 1 },
  { id: "p.no-ego-investing", stage: "preservation", label: "Avoid ego investing (no large risky bets)", category: "behavior", weight: 2 },
];

function evalRiskAdjustedAllocation(def: ChecklistItemDef): Evaluator {
  return (ctx) => {
    const pct = equityPct(ctx);
    if (pct >= 40 && pct <= 60) return result(def, "done", `Equity at ${pct.toFixed(0)}% — risk-adjusted for preservation.`);
    if (pct >= 30 && pct <= 70) return result(def, "partial", `Equity at ${pct.toFixed(0)}%. Target: 40–60% for this stage.`, "Rebalance toward 40–60% equity");
    return result(def, "todo", `Equity at ${pct.toFixed(0)}% — outside recommended range.`, "Significantly rebalance to 40–60% equity for capital preservation");
  };
}

function evalAdvancedDiversification(def: ChecklistItemDef): Evaluator {
  return (ctx) => {
    const hasIntl = ctx.advancedInputs?.has_international_funds;
    if (hasIntl == null) return result(def, "not_applicable", "Indicate if you hold international funds/REITs in Advanced Inputs.");
    if (hasIntl) return result(def, "done", "Advanced diversification (international/REITs) in place.");
    return result(def, "todo", "No international or REIT exposure.", "Add international funds and consider REITs/INVITs");
  };
}

function evalTaxPlanning(def: ChecklistItemDef): Evaluator {
  return (ctx) => {
    const tax = ctx.insightResult.advancedResults?.taxEfficiency;
    if (!tax) return result(def, "not_applicable", "Tax analysis requires advanced inputs.");
    if (tax.grade === "A") return result(def, "done", "Structured tax planning grade A.");
    return result(def, "partial", `Tax grade ${tax.grade}. ${tax.top_action}`, "Consider family structures and trust planning");
  };
}

function evalLiquidityBuffer(def: ChecklistItemDef): Evaluator {
  return (ctx) => {
    const income = ctx.advancedInputs?.monthly_income;
    if (!income) return result(def, "not_applicable", "Enter monthly income in Advanced Inputs.");
    const liquid = liquidAssets(ctx);
    const months = liquid / income;
    if (months >= 24) return result(def, "done", `Liquidity buffer covers ${months.toFixed(0)} months — excellent.`);
    if (months >= 12) return result(def, "partial", `Liquidity buffer covers ${months.toFixed(0)} months. Target: 24–36 months.`, "Build low-risk reserves to 2–3 years of expenses");
    return result(def, "todo", `Only ${months.toFixed(0)} months of liquidity.`, "Significantly increase low-risk reserves");
  };
}

function evalEstateFinalized(def: ChecklistItemDef): Evaluator {
  return (ctx) => {
    const hasWill = ctx.advancedInputs?.has_will_created;
    if (hasWill == null) return result(def, "not_applicable", "Indicate if you have a will in Advanced Inputs.");
    if (hasWill) return result(def, "done", "Estate planning finalized with will + succession.");
    return result(def, "todo", "Estate planning not finalized.", "Finalize will, update nominees, consider trust structures");
  };
}

function evalProfessionalReview(def: ChecklistItemDef): Evaluator {
  return () => {
    // Cannot determine this from data — always partial as a nudge
    return result(def, "partial", "Consider engaging a fee-only financial advisor for periodic reviews.", "Schedule an annual review with a certified financial planner");
  };
}

function evalNoEgoInvesting(def: ChecklistItemDef): Evaluator {
  return (ctx) => {
    const concInsight = ctx.insightResult.domains.liquidity.find(i => i.id === "liquidity.concentration");
    if (!concInsight || concInsight.unavailable) return result(def, "partial", "Monitor for outsized risky positions.");
    if (concInsight.severity === "info") return result(def, "done", "No outsized positions detected — disciplined allocation.");
    return result(def, "partial", concInsight.description, "Avoid concentrating more than 20% in any single bet");
  };
}

const PRESERVATION_EVALUATORS: Map<string, Evaluator> = new Map([
  ["p.risk-adjusted", evalRiskAdjustedAllocation(PRESERVATION_ITEMS[0])],
  ["p.advanced-diversification", evalAdvancedDiversification(PRESERVATION_ITEMS[1])],
  ["p.tax-planning", evalTaxPlanning(PRESERVATION_ITEMS[2])],
  ["p.liquidity-buffer", evalLiquidityBuffer(PRESERVATION_ITEMS[3])],
  ["p.estate-finalized", evalEstateFinalized(PRESERVATION_ITEMS[4])],
  ["p.professional-review", evalProfessionalReview(PRESERVATION_ITEMS[5])],
  ["p.no-ego-investing", evalNoEgoInvesting(PRESERVATION_ITEMS[6])],
]);

// ---------------------------------------------------------------------------
// Stage → Items/Evaluators registry
// ---------------------------------------------------------------------------

const STAGE_ITEMS: Record<WealthStage, ChecklistItemDef[]> = {
  foundation: FOUNDATION_ITEMS,
  stability: STABILITY_ITEMS,
  acceleration: ACCELERATION_ITEMS,
  optimization: OPTIMIZATION_ITEMS,
  preservation: PRESERVATION_ITEMS,
};

const STAGE_EVALUATORS: Record<WealthStage, Map<string, Evaluator>> = {
  foundation: FOUNDATION_EVALUATORS,
  stability: STABILITY_EVALUATORS,
  acceleration: ACCELERATION_EVALUATORS,
  optimization: OPTIMIZATION_EVALUATORS,
  preservation: PRESERVATION_EVALUATORS,
};

// ---------------------------------------------------------------------------
// Public API: get checklist items for a stage
// ---------------------------------------------------------------------------

export function getChecklistItems(stage: WealthStage): ChecklistItemDef[] {
  return STAGE_ITEMS[stage];
}

// ---------------------------------------------------------------------------
// Public API: evaluate all checklist items for a context
// ---------------------------------------------------------------------------

export function evaluateChecklist(ctx: ChecklistContext): ChecklistResult[] {
  const items = STAGE_ITEMS[ctx.stage];
  const evaluators = STAGE_EVALUATORS[ctx.stage];
  return items.map((item) => {
    const evaluator = evaluators.get(item.id);
    if (!evaluator) {
      return result(item, "not_applicable", "Evaluator not found.");
    }
    return evaluator(ctx);
  });
}

// ---------------------------------------------------------------------------
// Public API: compute composite stage score
// ---------------------------------------------------------------------------

export function computeStageScore(
  results: ChecklistResult[]
): { value: number; label: string; insufficientData: boolean } {
  const applicable = results.filter((r) => r.status !== "not_applicable");
  if (applicable.length === 0) {
    return { value: 0, label: "", insufficientData: true };
  }

  const totalWeight = applicable.reduce((sum, r) => sum + r.weight, 0);
  const weightedSum = applicable.reduce((sum, r) => sum + r.weight * r.score, 0);
  const value = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 10) / 10 : 0;

  return { value, label: "", insufficientData: false };
}

// ---------------------------------------------------------------------------
// Public API: compute stage history across all snapshots
// ---------------------------------------------------------------------------

export function computeStageHistory(
  snapshots: NetWorthSnapshot[],
  advancedInputs?: AdvancedInputs
): StageHistoryEntry[] {
  const sorted = [...snapshots].sort((a, b) => a.date.localeCompare(b.date));

  return sorted.map((snap, idx) => {
    const stage = classifyWealthStage(snap.netWorth);
    const snapshotsUpToNow = sorted.slice(0, idx + 1);
    const insightResult = computeAllInsights(snapshotsUpToNow, undefined, advancedInputs);
    const bs = parseBalanceSheet(snap);

    const ctx: ChecklistContext = {
      netWorth: snap.netWorth,
      stage: stage.id,
      balanceSheet: bs,
      advancedInputs,
      insightResult,
      snapshots: snapshotsUpToNow,
    };

    const results = evaluateChecklist(ctx);
    const score = computeStageScore(results);

    return {
      date: snap.date,
      stage: stage.id,
      score: score.value,
    };
  });
}
