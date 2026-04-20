import {
  computeInflationAudit,
  computeGapAnalysis,
  computeDebtQuality,
  computeTaxEfficiency,
  computeTrajectory,
  computeProtection,
} from "@/lib/advancedDimensions";
import { parseBalanceSheet } from "@/lib/balanceSheet";
import { computeAllInsights } from "@/lib/insightsEngine";
import type {
  NetWorthSnapshot,
  StatementEntry,
  BalanceSheet,
  AdvancedInputs,
} from "@/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeEntry(
  overrides: Partial<StatementEntry> & {
    statementType: string;
    category: "asset" | "liability";
    closingBalance: number;
  }
): StatementEntry {
  return {
    id: Math.random().toString(36).slice(2),
    description: "",
    ownershipPercentage: 100,
    ...overrides,
  };
}

function makeSnapshot(
  overrides: Partial<NetWorthSnapshot> & {
    date: string;
    entries: StatementEntry[];
  }
): NetWorthSnapshot {
  const totalAssets = overrides.entries
    .filter((e) => e.category === "asset")
    .reduce(
      (sum, e) => sum + (e.closingBalance * e.ownershipPercentage) / 100,
      0
    );
  const totalLiabilities = overrides.entries
    .filter((e) => e.category === "liability")
    .reduce(
      (sum, e) => sum + (e.closingBalance * e.ownershipPercentage) / 100,
      0
    );
  return {
    id: Math.random().toString(36).slice(2),
    totalAssets,
    totalLiabilities,
    netWorth: totalAssets - totalLiabilities,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeBS(
  assets: Record<string, number>,
  liabilities: Record<string, number> = {}
): BalanceSheet {
  return {
    assets,
    liabilities,
    total_assets: Object.values(assets).reduce((s, v) => s + v, 0),
    total_liabilities: Object.values(liabilities).reduce((s, v) => s + v, 0),
  };
}

// ---------------------------------------------------------------------------
// Case A: Over-liquid, under-invested user
// ---------------------------------------------------------------------------

const CASE_A_ENTRIES = [
  makeEntry({
    statementType: "Savings Bank Account",
    category: "asset",
    closingBalance: 1500000,
  }),
  makeEntry({
    statementType: "Savings Bank Account",
    category: "asset",
    closingBalance: 500000,
  }),
  makeEntry({
    statementType: "PPF",
    category: "asset",
    closingBalance: 100000,
  }),
  makeEntry({
    statementType: "Mutual Fund",
    category: "asset",
    closingBalance: 50000,
  }),
  makeEntry({
    statementType: "Gold/Jewellery",
    category: "asset",
    closingBalance: 200000,
  }),
  makeEntry({
    statementType: "Provident Fund",
    category: "asset",
    closingBalance: 300000,
  }),
];

const CASE_A_SNAPSHOT = makeSnapshot({
  date: "2025-06-01",
  entries: CASE_A_ENTRIES,
});

describe("Case A: Over-liquid, under-invested user", () => {
  const bs = parseBalanceSheet(CASE_A_SNAPSHOT);

  it("D7: flags SB as red (wealth destroyer)", () => {
    const result = computeInflationAudit(bs);
    const sb = result.per_asset.find((a) => a.key === "sb_hdfc");
    expect(sb).toBeDefined();
    expect(sb!.status).toBe("red");
    expect(sb!.real_return).toBeLessThan(0);
    expect(result.overall_flag).not.toBe("ok"); // should be warn or alert
    expect(result.primary_alert).toContain("savings accounts");
  });

  it("D7: sub-inflation percentage is significant", () => {
    const result = computeInflationAudit(bs);
    // SB accounts (2M) are red → sub-inflation should be high
    expect(result.sub_inflation_pct).toBeGreaterThan(40);
  });

  it("D8: flags equity gap", () => {
    const result = computeGapAnalysis(bs, { monthly_income: 100000 });
    const equity = result.buckets.find((b) => b.id === "equity_growth");
    expect(equity).toBeDefined();
    expect(equity!.status).toBe("miss");
  });

  it("D8: flags over-liquid when income provided", () => {
    const result = computeGapAnalysis(bs, { monthly_income: 100000 });
    const liquid = result.buckets.find((b) => b.id === "liquid");
    expect(liquid).toBeDefined();
    // 2M > 6 months * 100k = 600k → over
    expect(liquid!.status).toBe("over");
  });

  it("D9: no liabilities → green", () => {
    const result = computeDebtQuality(bs);
    expect(result.status).toBe("green");
    expect(result.productive_total + result.consumptive_total).toBe(0);
  });

  it("D10: flags PPF underutilisation", () => {
    const result = computeTaxEfficiency(bs, { ppf_annual_contribution: 50000 });
    const ppfCheck = result.checks.find((c) => c.id === "ppf_utilisation");
    expect(ppfCheck).toBeDefined();
    expect(ppfCheck!.passed).toBe(false);
    expect(result.grade).not.toBe("A");
  });
});

// ---------------------------------------------------------------------------
// Case B: High consumptive debt user
// ---------------------------------------------------------------------------

const CASE_B_ENTRIES = [
  makeEntry({
    statementType: "Savings Bank Account",
    category: "asset",
    closingBalance: 100000,
  }),
  makeEntry({
    statementType: "Credit Card Outstanding",
    category: "liability",
    closingBalance: 150000,
  }),
  makeEntry({
    statementType: "Top-up Loan",
    category: "liability",
    closingBalance: 300000,
  }),
  makeEntry({
    statementType: "Car Loan",
    category: "liability",
    closingBalance: 500000,
  }),
  makeEntry({
    statementType: "Bike Loan",
    category: "liability",
    closingBalance: 100000,
  }),
  makeEntry({
    statementType: "Home Loan",
    category: "liability",
    closingBalance: 2000000,
  }),
];

const CASE_B_SNAPSHOT = makeSnapshot({
  date: "2025-06-01",
  entries: CASE_B_ENTRIES,
});

describe("Case B: High consumptive debt user", () => {
  const bs = parseBalanceSheet(CASE_B_SNAPSHOT);

  it("D9: consumptive_pct ~34%, status red, CC flag active", () => {
    const result = computeDebtQuality(bs);
    // consumptive: 150k + 300k + 500k + 100k = 1050k
    // productive: 2000k
    // total: 3050k
    // consumptive_pct = 1050/3050 * 100 ≈ 34.4%
    expect(result.consumptive_pct).toBeGreaterThan(25);
    expect(result.consumptive_pct).toBeLessThan(40);
    expect(result.status).toBe("red");
    expect(result.credit_card_flag).toBe(true);
    expect(result.primary_alert).toContain("Credit card");
  });

  it("D9: breakdown includes all liabilities", () => {
    const result = computeDebtQuality(bs);
    expect(result.breakdown.length).toBe(5);
    const ccItem = result.breakdown.find((b) => b.name === "Credit Card");
    expect(ccItem).toBeDefined();
    expect(ccItem!.type).toBe("consumptive");
  });
});

// ---------------------------------------------------------------------------
// Case C: Well-balanced user
// ---------------------------------------------------------------------------

const CASE_C_ENTRIES = [
  makeEntry({
    statementType: "Savings Bank Account",
    category: "asset",
    closingBalance: 300000,
  }),
  makeEntry({
    statementType: "PPF",
    category: "asset",
    closingBalance: 500000,
  }),
  makeEntry({
    statementType: "Mutual Fund",
    category: "asset",
    closingBalance: 800000,
  }),
  makeEntry({
    statementType: "Stock Holdings",
    category: "asset",
    closingBalance: 600000,
  }),
  makeEntry({
    statementType: "Gold/Jewellery",
    category: "asset",
    closingBalance: 200000,
  }),
  makeEntry({
    statementType: "Provident Fund",
    category: "asset",
    closingBalance: 400000,
  }),
  makeEntry({
    statementType: "Real Estate",
    category: "asset",
    closingBalance: 500000,
  }),
  makeEntry({
    statementType: "Home Loan",
    category: "liability",
    closingBalance: 1500000,
  }),
];

const CASE_C_SNAPSHOT = makeSnapshot({
  date: "2025-06-01",
  entries: CASE_C_ENTRIES,
});

describe("Case C: Well-balanced user", () => {
  const bs = parseBalanceSheet(CASE_C_SNAPSHOT);

  it("D7: mostly green, low sub-inflation %", () => {
    const result = computeInflationAudit(bs);
    const greenCount = result.per_asset.filter(
      (a) => a.status === "green"
    ).length;
    expect(greenCount).toBeGreaterThanOrEqual(3);
    // SB is red but it's small relative to total
    expect(result.overall_flag).not.toBe("alert");
  });

  it("D8: equity > 30%, most buckets ok, international still flagged", () => {
    const result = computeGapAnalysis(bs, { monthly_income: 100000 });
    const equity = result.buckets.find((b) => b.id === "equity_growth");
    expect(equity!.status).toBe("ok");
    const intl = result.buckets.find((b) => b.id === "international");
    expect(intl!.status).toBe("nudge");
  });

  it("D9: only productive debt → green", () => {
    const result = computeDebtQuality(bs);
    expect(result.status).toBe("green");
    expect(result.credit_card_flag).toBe(false);
    expect(result.consumptive_pct).toBe(0);
  });

  it("D10: PPF maxed → check passed", () => {
    const result = computeTaxEfficiency(bs, {
      ppf_annual_contribution: 150000,
    });
    const ppfCheck = result.checks.find((c) => c.id === "ppf_utilisation");
    expect(ppfCheck!.passed).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Unit tests for individual dimensions
// ---------------------------------------------------------------------------

describe("computeInflationAudit", () => {
  it("classifies assets correctly by real return", () => {
    const bs = makeBS({
      sb_hdfc: 100000, // 3% - 5.5% = -2.5% → red
      ppf: 100000, // 7.1% - 5.5% = 1.6% → amber
      stocks: 100000, // 13% - 5.5% = 7.5% → green
    });
    const result = computeInflationAudit(bs);
    const sb = result.per_asset.find((a) => a.key === "sb_hdfc");
    const ppf = result.per_asset.find((a) => a.key === "ppf");
    const stocks = result.per_asset.find((a) => a.key === "stocks");
    expect(sb!.status).toBe("red");
    expect(ppf!.status).toBe("amber");
    expect(stocks!.status).toBe("green");
  });

  it("handles empty assets", () => {
    const bs = makeBS({});
    const result = computeInflationAudit(bs);
    expect(result.per_asset).toHaveLength(0);
    expect(result.overall_flag).toBe("ok");
  });
});

describe("computeDebtQuality", () => {
  it("handles no liabilities", () => {
    const bs = makeBS({ mf: 100000 });
    const result = computeDebtQuality(bs);
    expect(result.status).toBe("green");
    expect(result.breakdown).toHaveLength(0);
  });

  it("classifies mixed debt correctly", () => {
    const bs = makeBS({}, { home_loan: 2000000, credit_card: 50000 });
    const result = computeDebtQuality(bs);
    expect(result.productive_total).toBe(2000000);
    expect(result.consumptive_total).toBe(50000);
    expect(result.credit_card_flag).toBe(true);
  });
});

describe("computeTaxEfficiency", () => {
  it("gives grade A when all checks pass", () => {
    const bs = makeBS({ sb_hdfc: 100000, ppf: 100000, mf: 50000 });
    const result = computeTaxEfficiency(bs, {
      ppf_annual_contribution: 150000,
      vpf_contribution: 5000,
    });
    // SB interest = 100000 * 0.03 = 3000 < 10000 → pass
    // PPF at 150k → pass
    // VPF > 0 → pass
    // equity < 10L → pass
    expect(result.score).toBe(4);
    expect(result.grade).toBe("A");
  });

  it("flags LTCG when equity exceeds 10L", () => {
    const bs = makeBS({ mf: 800000, stocks: 500000 });
    const result = computeTaxEfficiency(bs);
    const ltcg = result.checks.find((c) => c.id === "ltcg_harvesting");
    expect(ltcg!.passed).toBe(false);
  });

  it("flags high SB interest", () => {
    const bs = makeBS({ sb_hdfc: 500000 });
    // Interest = 500000 * 0.03 = 15000 > 10000
    const result = computeTaxEfficiency(bs);
    const sb = result.checks.find((c) => c.id === "sb_interest");
    expect(sb!.passed).toBe(false);
  });
});

describe("computeTrajectory", () => {
  it("returns null without required inputs", () => {
    const bs = makeBS({ mf: 500000 });
    expect(computeTrajectory(bs)).toBeNull();
    expect(computeTrajectory(bs, {})).toBeNull();
  });

  it("computes projections with full inputs", () => {
    const bs = makeBS({
      mf: 500000,
      stocks: 300000,
      ppf: 200000,
      pf: 100000,
    });
    const result = computeTrajectory(bs, {
      monthly_income: 150000,
      current_age: 30,
      retirement_age: 60,
      monthly_investment: 30000,
    });
    expect(result).not.toBeNull();
    expect(result!.years_to_retirement).toBe(30);
    expect(result!.projections.base.corpus).toBeGreaterThan(0);
    expect(result!.projections.optimistic.corpus).toBeGreaterThan(
      result!.projections.base.corpus
    );
    expect(result!.target_corpus).toBeGreaterThan(0);
  });
});

describe("computeProtection", () => {
  it("returns null without monthly income", () => {
    const bs = makeBS({ mf: 100000 });
    expect(computeProtection(bs)).toBeNull();
    expect(computeProtection(bs, {})).toBeNull();
  });

  it("flags not_entered for term cover when not provided", () => {
    const bs = makeBS({}, { home_loan: 2000000 });
    const result = computeProtection(bs, { monthly_income: 100000 });
    expect(result).not.toBeNull();
    expect(result!.term_status).toBe("not_entered");
    expect(result!.recommended_term_cover).toBe(2000000 + 1200000 * 10);
  });

  it("detects adequate term cover", () => {
    const bs = makeBS({}, { home_loan: 1000000 });
    const result = computeProtection(bs, {
      monthly_income: 100000,
      existing_term_cover: 20000000,
    });
    expect(result!.term_status).toBe("adequate");
  });

  it("detects health cover gap", () => {
    const bs = makeBS({});
    const result = computeProtection(bs, {
      monthly_income: 100000,
      existing_health_cover: 500000,
    });
    expect(result!.health_status).toBe("low");
  });
});

describe("computeGapAnalysis", () => {
  it("always flags international exposure as nudge", () => {
    const bs = makeBS({ mf: 500000 });
    const result = computeGapAnalysis(bs);
    const intl = result.buckets.find((b) => b.id === "international");
    expect(intl!.status).toBe("nudge");
  });

  it("detects real asset over-allocation", () => {
    const bs = makeBS({
      gold: 500000,
      real_estate: 2000000,
      mf: 200000,
    });
    const result = computeGapAnalysis(bs);
    const realAssets = result.buckets.find((b) => b.id === "real_assets");
    // real = 2.5M / 2.7M = 92% > 30% → over
    expect(realAssets!.status).toBe("over");
  });
});

// ---------------------------------------------------------------------------
// Integration: computeAllInsights still works with advanced dimensions
// ---------------------------------------------------------------------------

describe("computeAllInsights integration", () => {
  it("returns all 12 domains with insights for Case A", () => {
    const result = computeAllInsights([CASE_A_SNAPSHOT]);
    expect(result.domains.inflation_audit.length).toBeGreaterThanOrEqual(1);
    expect(result.domains.gap_analysis.length).toBeGreaterThanOrEqual(1);
    expect(result.domains.debt_quality.length).toBeGreaterThanOrEqual(1);
    expect(result.domains.tax_efficiency.length).toBeGreaterThanOrEqual(1);
    expect(result.domains.trajectory.length).toBeGreaterThanOrEqual(1);
    expect(result.domains.protection.length).toBeGreaterThanOrEqual(1);
  });

  it("returns advancedResults with rich data", () => {
    const result = computeAllInsights([CASE_A_SNAPSHOT]);
    expect(result.advancedResults).toBeDefined();
    expect(result.advancedResults!.inflationAudit).toBeDefined();
    expect(result.advancedResults!.gapAnalysis).toBeDefined();
    expect(result.advancedResults!.debtQuality).toBeDefined();
    expect(result.advancedResults!.taxEfficiency).toBeDefined();
  });

  it("trajectory and protection are unavailable without advanced inputs", () => {
    const result = computeAllInsights([CASE_A_SNAPSHOT]);
    const trajItem = result.domains.trajectory[0];
    expect(trajItem.unavailable).toBe(true);
    const protItem = result.domains.protection[0];
    expect(protItem.unavailable).toBe(true);
  });

  it("trajectory and protection become available with advanced inputs", () => {
    const result = computeAllInsights([CASE_A_SNAPSHOT], undefined, {
      monthly_income: 100000,
      current_age: 30,
    });
    const trajItem = result.domains.trajectory[0];
    expect(trajItem.unavailable).toBeFalsy();
    const protItem = result.domains.protection[0];
    expect(protItem.unavailable).toBeFalsy();
  });

  it("existing 6 domains still populated (no regressions)", () => {
    const entries = [
      makeEntry({
        statementType: "Savings Bank Account",
        category: "asset",
        closingBalance: 500000,
      }),
      makeEntry({
        statementType: "Mutual Fund",
        category: "asset",
        closingBalance: 1000000,
      }),
      makeEntry({
        statementType: "Home Loan",
        category: "liability",
        closingBalance: 1500000,
      }),
    ];
    const snap1 = makeSnapshot({ date: "2025-01-01", entries });
    const snap2 = makeSnapshot({
      date: "2025-03-01",
      entries: [
        makeEntry({
          statementType: "Savings Bank Account",
          category: "asset",
          closingBalance: 520000,
        }),
        makeEntry({
          statementType: "Mutual Fund",
          category: "asset",
          closingBalance: 1100000,
        }),
        makeEntry({
          statementType: "Home Loan",
          category: "liability",
          closingBalance: 1450000,
        }),
      ],
    });

    const result = computeAllInsights([snap1, snap2]);
    expect(result.domains.growth.length).toBeGreaterThanOrEqual(3);
    expect(result.domains.leverage.length).toBeGreaterThanOrEqual(2);
    expect(result.domains.liquidity.length).toBeGreaterThanOrEqual(2);
    expect(result.domains.efficiency.length).toBeGreaterThanOrEqual(2);
    expect(result.domains.risk.length).toBe(2);
    expect(result.domains.behavior.length).toBe(2);
  });
});

describe("parseBalanceSheet", () => {
  it("maps statement types to balance sheet keys", () => {
    const snap = makeSnapshot({
      date: "2025-06-01",
      entries: [
        makeEntry({
          statementType: "Savings Bank Account",
          category: "asset",
          closingBalance: 100000,
        }),
        makeEntry({
          statementType: "PPF",
          category: "asset",
          closingBalance: 200000,
        }),
        makeEntry({
          statementType: "Home Loan",
          category: "liability",
          closingBalance: 300000,
        }),
      ],
    });
    const bs = parseBalanceSheet(snap);
    expect(bs.assets["sb_hdfc"]).toBe(100000);
    expect(bs.assets["ppf"]).toBe(200000);
    expect(bs.liabilities["home_loan"]).toBe(300000);
    expect(bs.total_assets).toBe(300000);
    expect(bs.total_liabilities).toBe(300000);
  });

  it("aggregates multiple entries of same type", () => {
    const snap = makeSnapshot({
      date: "2025-06-01",
      entries: [
        makeEntry({
          statementType: "Savings Bank Account",
          category: "asset",
          closingBalance: 100000,
        }),
        makeEntry({
          statementType: "Savings Bank Account",
          category: "asset",
          closingBalance: 200000,
        }),
      ],
    });
    const bs = parseBalanceSheet(snap);
    expect(bs.assets["sb_hdfc"]).toBe(300000);
  });
});
