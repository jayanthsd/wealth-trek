import type {
  BalanceSheet,
  AdvancedInputs,
  InflationAuditResult,
  GapAnalysisResult,
  GapBucket,
  DebtQualityResult,
  DebtBreakdownItem,
  TaxEfficiencyResult,
  TaxCheck,
  TrajectoryResult,
  ProjectionScenario,
  ProtectionResult,
} from "@/types";

import {
  INFLATION_RATE,
  ASSET_RETURNS,
  ASSET_LABELS,
  DEBT_CLASSIFICATION,
  LIABILITY_LABELS,
  PPF_MAX_ANNUAL,
  SB_INTEREST_EXEMPTION,
  RETIREMENT_CORPUS_MULTIPLIER,
  MIN_HEALTH_COVER_TIER1,
  MIN_TERM_COVER_INCOME_MULTIPLE,
  PROJECTION_RATES,
  SUB_INFLATION_PORTFOLIO_ALERT,
  REAL_ASSET_MAX,
  CONSUMPTIVE_DEBT_THRESHOLDS,
} from "./analyticsConstants";

// ---------------------------------------------------------------------------
// Helpers
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

// ---------------------------------------------------------------------------
// D7: Inflation-Adjusted Asset Audit
// ---------------------------------------------------------------------------

export function computeInflationAudit(bs: BalanceSheet): InflationAuditResult {
  const perAsset: InflationAuditResult["per_asset"] = [];
  let subInflationValue = 0;

  for (const [key, balance] of Object.entries(bs.assets)) {
    if (balance <= 0) continue;

    const nominalReturn = ASSET_RETURNS[key] ?? 0;
    const realReturn = nominalReturn - INFLATION_RATE;

    let status: "red" | "amber" | "green";
    if (realReturn < 0) status = "red";
    else if (realReturn <= 2) status = "amber";
    else status = "green";

    if (status === "red" || status === "amber") {
      subInflationValue += balance;
    }

    perAsset.push({
      key,
      label: ASSET_LABELS[key] ?? key,
      balance,
      nominal_return: nominalReturn,
      real_return: realReturn,
      status,
    });
  }

  // Sort: red first, then amber, then green; within each group by balance desc
  const statusOrder = { red: 0, amber: 1, green: 2 };
  perAsset.sort(
    (a, b) =>
      statusOrder[a.status] - statusOrder[b.status] ||
      b.balance - a.balance
  );

  const totalAssets = bs.total_assets;
  const subInflationPct =
    totalAssets > 0 ? (subInflationValue / totalAssets) * 100 : 0;

  let overallFlag: "ok" | "warn" | "alert";
  if (subInflationPct > SUB_INFLATION_PORTFOLIO_ALERT) overallFlag = "alert";
  else if (subInflationPct > 25) overallFlag = "warn";
  else overallFlag = "ok";

  // Primary alert message
  let primaryAlert = "";
  const sbAsset = perAsset.find(
    (a) => (a.key === "sb_hdfc" || a.key === "sb_kotak") && a.status === "red"
  );
  if (sbAsset) {
    primaryAlert = `Your savings accounts are losing real value at ${sbAsset.real_return.toFixed(1)}%/yr. Keep only 3–6 months of expenses in savings accounts; move the rest to a higher-returning instrument.`;
  } else if (subInflationPct > SUB_INFLATION_PORTFOLIO_ALERT) {
    primaryAlert = `${subInflationPct.toFixed(0)}% of your portfolio is in assets growing slower than inflation. Your real wealth is shrinking.`;
  } else if (overallFlag === "warn") {
    primaryAlert = `${subInflationPct.toFixed(0)}% of your portfolio sits in sub-inflation assets. Consider rebalancing toward higher real-return instruments.`;
  }

  return {
    per_asset: perAsset,
    sub_inflation_pct: Math.round(subInflationPct * 10) / 10,
    sub_inflation_value: subInflationValue,
    overall_flag: overallFlag,
    primary_alert: primaryAlert,
  };
}

// ---------------------------------------------------------------------------
// D8: Instrument Gap Analysis
// ---------------------------------------------------------------------------

export function computeGapAnalysis(
  bs: BalanceSheet,
  inputs?: AdvancedInputs
): GapAnalysisResult {
  const totalInvestable =
    bs.total_assets - (bs.assets["self_occupied_home"] ?? 0);
  const monthlyIncome = inputs?.monthly_income ?? 0;
  const currentAge = inputs?.current_age ?? 30;

  const buckets: GapBucket[] = [];

  // 1. Liquid safety net
  const liquidValue =
    (bs.assets["sb_hdfc"] ?? 0) +
    (bs.assets["sb_kotak"] ?? 0) +
    (bs.assets["fd"] ?? 0);
  if (monthlyIncome > 0) {
    const threeMonths = monthlyIncome * 3;
    const sixMonths = monthlyIncome * 6;
    if (liquidValue > sixMonths) {
      buckets.push({
        id: "liquid",
        label: "Liquid safety net",
        status: "over",
        current_pct:
          totalInvestable > 0
            ? Math.round((liquidValue / totalInvestable) * 1000) / 10
            : 0,
        message:
          "Excess liquid balance detected. Amounts beyond 6 months of expenses are losing real value — consider deploying to a better instrument.",
      });
    } else if (liquidValue >= threeMonths) {
      buckets.push({
        id: "liquid",
        label: "Liquid safety net",
        status: "ok",
        current_pct:
          totalInvestable > 0
            ? Math.round((liquidValue / totalInvestable) * 1000) / 10
            : 0,
        message: "Liquid buffer covers 3–6 months of expenses.",
      });
    } else {
      buckets.push({
        id: "liquid",
        label: "Liquid safety net",
        status: "miss",
        current_pct:
          totalInvestable > 0
            ? Math.round((liquidValue / totalInvestable) * 1000) / 10
            : 0,
        message:
          "No adequate liquid buffer. Keep 3–6 months of expenses in instant-access savings.",
      });
    }
  } else {
    buckets.push({
      id: "liquid",
      label: "Liquid safety net",
      status: liquidValue > 0 ? "ok" : "miss",
      current_pct:
        totalInvestable > 0
          ? Math.round((liquidValue / totalInvestable) * 1000) / 10
          : 0,
      message: monthlyIncome === 0
        ? "Add monthly income to evaluate your liquid buffer adequacy."
        : "No liquid assets detected.",
    });
  }

  // 2. Equity growth
  const equityValue = (bs.assets["mf"] ?? 0) + (bs.assets["stocks"] ?? 0);
  const equityPct =
    totalInvestable > 0 ? (equityValue / totalInvestable) * 100 : 0;
  const equityThreshold = currentAge < 50 ? 30 : 20;
  if (equityPct >= equityThreshold) {
    buckets.push({
      id: "equity_growth",
      label: "Equity growth",
      status: "ok",
      current_pct: Math.round(equityPct * 10) / 10,
      message: `Equity exposure is ${equityPct.toFixed(0)}% of investable assets.`,
    });
  } else {
    buckets.push({
      id: "equity_growth",
      label: "Equity growth",
      status: "miss",
      current_pct: Math.round(equityPct * 10) / 10,
      message:
        "No equity growth exposure. For wealth creation above inflation, consider index-based equity mutual funds or diversified large-cap equity — based on your risk appetite.",
    });
  }

  // 3. Debt stability
  const debtStabilityValue =
    (bs.assets["ppf"] ?? 0) + (bs.assets["pf"] ?? 0) + (bs.assets["fd"] ?? 0);
  const debtStabilityPct =
    totalInvestable > 0 ? (debtStabilityValue / totalInvestable) * 100 : 0;
  if (debtStabilityPct >= 20) {
    buckets.push({
      id: "debt_stability",
      label: "Debt stability",
      status: "ok",
      current_pct: Math.round(debtStabilityPct * 10) / 10,
      message: `Debt instrument allocation is ${debtStabilityPct.toFixed(0)}% of investable assets.`,
    });
  } else {
    buckets.push({
      id: "debt_stability",
      label: "Debt stability",
      status: "miss",
      current_pct: Math.round(debtStabilityPct * 10) / 10,
      message:
        "Low debt allocation. Debt instruments provide stability and predictable returns. Consider increasing PPF contribution or voluntary PF.",
    });
  }

  // 4. Real assets
  const realAssetValue =
    (bs.assets["gold"] ?? 0) +
    (bs.assets["silver"] ?? 0) +
    (bs.assets["real_estate"] ?? 0) +
    (bs.assets["self_occupied_home"] ?? 0);
  const realAssetPct =
    totalInvestable > 0 ? (realAssetValue / totalInvestable) * 100 : 0;
  if (realAssetPct > REAL_ASSET_MAX) {
    buckets.push({
      id: "real_assets",
      label: "Real assets",
      status: "over",
      current_pct: Math.round(realAssetPct * 10) / 10,
      message: `Real assets exceed ${realAssetPct.toFixed(0)}% of portfolio. High concentration in illiquid assets reduces financial agility.`,
    });
  } else if (realAssetPct >= 5) {
    buckets.push({
      id: "real_assets",
      label: "Real assets",
      status: "ok",
      current_pct: Math.round(realAssetPct * 10) / 10,
      message: `Real asset allocation at ${realAssetPct.toFixed(0)}% of portfolio.`,
    });
  } else {
    buckets.push({
      id: "real_assets",
      label: "Real assets",
      status: "miss",
      current_pct: Math.round(realAssetPct * 10) / 10,
      message:
        "No real asset exposure. A small allocation to gold (5–10%) acts as a portfolio hedge.",
    });
  }

  // 5. International exposure (always a gap — not in current schema)
  buckets.push({
    id: "international",
    label: "International exposure",
    status: "nudge",
    current_pct: 0,
    message:
      "No international exposure. At meaningful net worth levels, 5–10% in international equity categories provides currency diversification and reduces home-country concentration risk.",
  });

  // 6. Protection layer (pointer to D12)
  buckets.push({
    id: "protection",
    label: "Protection layer",
    status: "info",
    current_pct: 0,
    message: "Insurance coverage not captured. See protection analysis below.",
  });

  const gapCount = buckets.filter(
    (b) => b.status === "miss" || b.status === "nudge"
  ).length;
  const overCount = buckets.filter((b) => b.status === "over").length;

  let summary: string;
  if (gapCount === 0 && overCount === 0) {
    summary = "All instrument buckets are adequately covered.";
  } else {
    const parts: string[] = [];
    if (gapCount > 0) parts.push(`${gapCount} gap${gapCount > 1 ? "s" : ""}`);
    if (overCount > 0)
      parts.push(`${overCount} over-allocation${overCount > 1 ? "s" : ""}`);
    summary = `${parts.join(" and ")} detected across your portfolio.`;
  }

  return { buckets, gap_count: gapCount, over_count: overCount, summary };
}

// ---------------------------------------------------------------------------
// D9: Debt Quality Score
// ---------------------------------------------------------------------------

export function computeDebtQuality(bs: BalanceSheet): DebtQualityResult {
  let productiveTotal = 0;
  let consumptiveTotal = 0;
  const breakdown: DebtBreakdownItem[] = [];
  let creditCardFlag = false;

  for (const [key, amount] of Object.entries(bs.liabilities)) {
    if (amount <= 0) continue;

    const debtType = DEBT_CLASSIFICATION[key] ?? "consumptive";
    if (debtType === "productive") {
      productiveTotal += amount;
    } else {
      consumptiveTotal += amount;
    }

    if (key === "credit_card") creditCardFlag = true;

    let rateNote = "";
    if (key === "credit_card") rateNote = "36–42% effective APR";
    else if (key === "home_loan") rateNote = "~8.5–9.5% typical";
    else if (key === "car_loan") rateNote = "~9–12% typical";
    else if (key === "personal_loan" || key === "topup_loan")
      rateNote = "~12–18% typical";
    else if (key === "education_loan") rateNote = "~8–11% typical";

    breakdown.push({
      name: LIABILITY_LABELS[key] ?? key,
      amount,
      type: debtType,
      effective_rate_note: rateNote,
    });
  }

  const totalLiabilities = productiveTotal + consumptiveTotal;
  const pdr =
    totalLiabilities > 0 ? (productiveTotal / totalLiabilities) * 100 : 100;
  const consumptivePct =
    totalLiabilities > 0 ? (consumptiveTotal / totalLiabilities) * 100 : 0;
  const productivePct =
    totalLiabilities > 0 ? (productiveTotal / totalLiabilities) * 100 : 100;

  let status: "green" | "amber" | "red";
  if (consumptivePct < CONSUMPTIVE_DEBT_THRESHOLDS.green) status = "green";
  else if (consumptivePct <= CONSUMPTIVE_DEBT_THRESHOLDS.amber) status = "amber";
  else status = "red";

  // If no liabilities at all, it's green
  if (totalLiabilities === 0) status = "green";

  let primaryAlert = "";
  if (creditCardFlag) {
    primaryAlert =
      "Credit card balance detected. At 36–42% effective APR this is your highest-cost liability. Clear this before any new investment.";
  } else if (status === "red") {
    primaryAlert = `Consumptive debt is ${consumptivePct.toFixed(0)}% of your liabilities. Consider accelerating repayment of vehicle loans.`;
  } else if (totalLiabilities === 0) {
    primaryAlert = "No liabilities detected — debt-free position.";
  }

  let secondaryAlert: string | null = null;
  if (
    creditCardFlag &&
    status === "red" &&
    consumptivePct > CONSUMPTIVE_DEBT_THRESHOLDS.amber
  ) {
    secondaryAlert = `Beyond the credit card, consumptive debt is ${consumptivePct.toFixed(0)}% of liabilities. Vehicle loans at reasonable rates may be intentional — evaluate whether accelerating repayment aligns with your current goals.`;
  }

  // Sort breakdown: consumptive first, then by amount desc
  breakdown.sort((a, b) => {
    if (a.type !== b.type) return a.type === "consumptive" ? -1 : 1;
    return b.amount - a.amount;
  });

  return {
    productive_total: productiveTotal,
    consumptive_total: consumptiveTotal,
    productive_pct: Math.round(productivePct * 10) / 10,
    consumptive_pct: Math.round(consumptivePct * 10) / 10,
    pdr: Math.round(pdr * 10) / 10,
    status,
    credit_card_flag: creditCardFlag,
    breakdown,
    primary_alert: primaryAlert,
    secondary_alert: secondaryAlert,
  };
}

// ---------------------------------------------------------------------------
// D10: Tax Efficiency Score
// ---------------------------------------------------------------------------

export function computeTaxEfficiency(
  bs: BalanceSheet,
  inputs?: AdvancedInputs
): TaxEfficiencyResult {
  const checks: TaxCheck[] = [];

  // CHECK 1: PPF utilisation
  const ppfContribution = inputs?.ppf_annual_contribution ?? 0;
  const ppfPassed = ppfContribution >= PPF_MAX_ANNUAL * 0.8;
  checks.push({
    id: "ppf_utilisation",
    label: "PPF Utilisation",
    passed: ppfPassed,
    message: ppfPassed
      ? `PPF contribution of ${formatINR(ppfContribution)} is near or at the ₹1.5L limit.`
      : "PPF contribution is below ₹1.5L annual limit. PPF is EEE-taxed — contributions, growth, and withdrawal are all tax-free. Maximising this is one of the safest tax optimisations available.",
  });

  // CHECK 2: Voluntary PF (VPF)
  const vpfContribution = inputs?.vpf_contribution ?? 0;
  const vpfPassed = vpfContribution > 0;
  checks.push({
    id: "vpf_contribution",
    label: "Voluntary PF",
    passed: vpfPassed,
    message: vpfPassed
      ? `VPF contribution of ${formatINR(vpfContribution)} detected.`
      : "No Voluntary PF contribution detected. VPF earns the same 8.15% as PF with EEE tax treatment. Consider contributing beyond the mandatory 12% if you have surplus income.",
  });

  // CHECK 3: LTCG harvesting opportunity
  const equityPortfolio = (bs.assets["mf"] ?? 0) + (bs.assets["stocks"] ?? 0);
  const ltcgPassed = equityPortfolio < 1000000;
  checks.push({
    id: "ltcg_harvesting",
    label: "LTCG Harvesting",
    passed: ltcgPassed,
    message: ltcgPassed
      ? "Equity portfolio is below ₹10L — LTCG harvesting is not material yet."
      : "Your equity portfolio (MF + Stocks) exceeds ₹10L. Consider booking up to ₹1.25L in long-term gains each financial year — this resets your cost basis tax-free. Consult your tax advisor for the exact amount applicable to your holdings.",
  });

  // CHECK 4: SB interest exposure
  const totalSB = (bs.assets["sb_hdfc"] ?? 0) + (bs.assets["sb_kotak"] ?? 0);
  const annualSBInterest = totalSB * 0.03;
  const sbPassed = annualSBInterest <= SB_INTEREST_EXEMPTION;
  checks.push({
    id: "sb_interest",
    label: "SB Interest Exposure",
    passed: sbPassed,
    message: sbPassed
      ? `Savings account interest of ${formatINR(annualSBInterest)}/yr is within the ₹10,000 tax-free limit.`
      : `Your savings account balances generate ${formatINR(annualSBInterest)} in annual interest, which exceeds the ₹10,000 tax-free limit. The excess is taxable at your slab rate. Reducing idle SB balance also improves your real return.`,
  });

  const score = checks.filter((c) => c.passed).length;
  const scorePct = (score / 4) * 100;

  let grade: "A" | "B" | "C" | "D";
  if (score === 4) grade = "A";
  else if (score === 3) grade = "B";
  else if (score === 2) grade = "C";
  else grade = "D";

  // Top action: pick the fail with highest monetary impact
  const failedChecks = checks.filter((c) => !c.passed);
  let topAction = "All tax efficiency checks passed.";
  if (failedChecks.length > 0) {
    // Priority: LTCG > PPF > SB interest > VPF
    const priority = ["ltcg_harvesting", "ppf_utilisation", "sb_interest", "vpf_contribution"];
    const topFail = priority
      .map((id) => failedChecks.find((c) => c.id === id))
      .find((c) => c !== undefined);
    if (topFail) topAction = topFail.message;
  }

  return { checks, score, score_pct: scorePct, grade, top_action: topAction };
}

// ---------------------------------------------------------------------------
// D11: Net Worth Trajectory
// ---------------------------------------------------------------------------

export function computeTrajectory(
  bs: BalanceSheet,
  inputs?: AdvancedInputs
): TrajectoryResult | null {
  const monthlyIncome = inputs?.monthly_income;
  const currentAge = inputs?.current_age;

  if (!monthlyIncome || !currentAge) return null;

  const retirementAge = inputs?.retirement_age ?? 60;
  const monthlyEmi = inputs?.monthly_emi_total ?? 0;

  const currentNetWorth = bs.total_assets - bs.total_liabilities;
  const investableNW =
    (bs.assets["sb_hdfc"] ?? 0) +
    (bs.assets["sb_kotak"] ?? 0) +
    (bs.assets["ppf"] ?? 0) +
    (bs.assets["mf"] ?? 0) +
    (bs.assets["gold"] ?? 0) +
    (bs.assets["silver"] ?? 0) +
    (bs.assets["stocks"] ?? 0) +
    (bs.assets["pf"] ?? 0) +
    (bs.assets["real_estate"] ?? 0) +
    (bs.assets["fd"] ?? 0);

  const yearsToRetirement = Math.max(retirementAge - currentAge, 1);

  // Monthly surplus = income - EMIs - 40% living expenses
  const livingExpenses = monthlyIncome * 0.4;
  const monthlySurplus = monthlyIncome - monthlyEmi - livingExpenses;

  const monthlyInvestment =
    inputs?.monthly_investment ?? Math.max(monthlySurplus * 0.5, 0);

  // Blended portfolio return
  let weightedReturn = 0;
  for (const [key, value] of Object.entries(bs.assets)) {
    const returnRate = ASSET_RETURNS[key] ?? 0;
    weightedReturn += value * returnRate;
  }
  const blendedReturn =
    bs.total_assets > 0 ? weightedReturn / bs.total_assets : 0;

  // Projections
  function projectCorpus(rate: number): ProjectionScenario {
    const r = rate / 100;
    const years = yearsToRetirement;
    const lumpSum = investableNW * Math.pow(1 + r, years);
    const annuity =
      r > 0
        ? monthlyInvestment * 12 * ((Math.pow(1 + r, years) - 1) / r)
        : monthlyInvestment * 12 * years;
    const corpus = lumpSum + annuity;
    return { rate, corpus: Math.round(corpus), vs_target_pct: 0 };
  }

  const annualExpensesEstimate =
    (monthlyIncome - monthlyEmi) * 12 * 0.7;
  const targetCorpus = annualExpensesEstimate * RETIREMENT_CORPUS_MULTIPLIER;

  const conservative = projectCorpus(PROJECTION_RATES.conservative);
  const base = projectCorpus(PROJECTION_RATES.base);
  const optimistic = projectCorpus(PROJECTION_RATES.optimistic);

  conservative.vs_target_pct =
    targetCorpus > 0
      ? Math.round((conservative.corpus / targetCorpus) * 1000) / 10
      : 0;
  base.vs_target_pct =
    targetCorpus > 0
      ? Math.round((base.corpus / targetCorpus) * 1000) / 10
      : 0;
  optimistic.vs_target_pct =
    targetCorpus > 0
      ? Math.round((optimistic.corpus / targetCorpus) * 1000) / 10
      : 0;

  const onTrack = base.vs_target_pct >= 90;
  const gapAmount = onTrack ? 0 : Math.max(targetCorpus - base.corpus, 0);

  // Gap SIP: monthly SIP needed to close gap using base rate
  let gapMonthlySip = 0;
  if (gapAmount > 0) {
    const monthlyRate = PROJECTION_RATES.base / 1200;
    const totalMonths = yearsToRetirement * 12;
    const factor =
      monthlyRate > 0
        ? (Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate
        : totalMonths;
    gapMonthlySip = factor > 0 ? Math.round(gapAmount / factor) : 0;
  }

  let primaryAlert: string;
  if (onTrack) {
    primaryAlert = `On the base case (${PROJECTION_RATES.base}% return), your projected corpus covers ${base.vs_target_pct.toFixed(0)}% of your retirement target. You are on track.`;
  } else {
    primaryAlert = `On the base case, your projected corpus falls ${formatINR(gapAmount)} short of the target. An additional SIP of ${formatINR(gapMonthlySip)}/month could close this gap.`;
  }

  return {
    current_net_worth: currentNetWorth,
    investable_net_worth: investableNW,
    years_to_retirement: yearsToRetirement,
    monthly_surplus: monthlySurplus,
    blended_return: Math.round(blendedReturn * 10) / 10,
    projections: { conservative, base, optimistic },
    target_corpus: Math.round(targetCorpus),
    on_track: onTrack,
    gap_amount: gapAmount,
    gap_monthly_sip: gapMonthlySip,
    primary_alert: primaryAlert,
  };
}

// ---------------------------------------------------------------------------
// D12: Protection Layer Check
// ---------------------------------------------------------------------------

export function computeProtection(
  bs: BalanceSheet,
  inputs?: AdvancedInputs
): ProtectionResult | null {
  const monthlyIncome = inputs?.monthly_income;
  if (!monthlyIncome) return null;

  const totalLiabilities = bs.total_liabilities;
  const annualIncome = monthlyIncome * 12;
  const recommendedTermCover =
    totalLiabilities + annualIncome * MIN_TERM_COVER_INCOME_MULTIPLE;

  // Term cover
  let termCoverGap: number | null = null;
  let coveragePct: number | null = null;
  let termStatus: ProtectionResult["term_status"] = "not_entered";
  const existingTermCover = inputs?.existing_term_cover ?? null;

  if (existingTermCover !== null && existingTermCover !== undefined) {
    termCoverGap = Math.max(0, recommendedTermCover - existingTermCover);
    coveragePct =
      recommendedTermCover > 0
        ? Math.round((existingTermCover / recommendedTermCover) * 1000) / 10
        : 100;
    if (termCoverGap === 0) termStatus = "adequate";
    else if (coveragePct >= 70) termStatus = "low";
    else termStatus = "gap";
  }

  // Health cover
  let healthStatus: ProtectionResult["health_status"] = "not_entered";
  const existingHealthCover = inputs?.existing_health_cover ?? null;
  if (existingHealthCover !== null && existingHealthCover !== undefined) {
    if (existingHealthCover >= MIN_HEALTH_COVER_TIER1) {
      healthStatus = "adequate";
    } else {
      healthStatus = "low";
    }
  }

  // Build alerts
  const alerts: string[] = [];
  if (termStatus === "not_entered") {
    alerts.push(
      `Add your term life cover amount to complete this analysis. Minimum recommended: ${formatINR(recommendedTermCover)} (total liabilities + 10× annual income).`
    );
  } else if (termStatus === "gap" || termStatus === "low") {
    alerts.push(
      `Your term cover of ${formatINR(existingTermCover!)} is ${formatINR(termCoverGap!)} short of the recommended ${formatINR(recommendedTermCover)}. Review your policy coverage.`
    );
  } else {
    alerts.push(
      "Term cover appears adequate. Review every 3 years or after major life events."
    );
  }

  if (healthStatus === "not_entered") {
    alerts.push(
      "Health insurance not captured. Minimum recommended: ₹10L family floater for Bengaluru. Medical inflation runs at 12–14% annually — under-insurance is a major balance sheet risk."
    );
  } else if (healthStatus === "low") {
    alerts.push(
      `Health cover of ${formatINR(existingHealthCover!)} is below the ₹10L recommended minimum for Bengaluru. Consider topping up with a super top-up plan.`
    );
  }

  return {
    total_liabilities: totalLiabilities,
    annual_income: annualIncome,
    recommended_term_cover: recommendedTermCover,
    existing_term_cover: existingTermCover,
    term_cover_gap: termCoverGap,
    coverage_pct: coveragePct,
    term_status: termStatus,
    health_status: healthStatus,
    alerts,
  };
}
