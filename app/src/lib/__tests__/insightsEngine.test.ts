import { computeAllInsights, INSIGHT_THRESHOLDS } from "@/lib/insightsEngine";
import type { NetWorthSnapshot, StatementEntry } from "@/types";

function makeEntry(
  overrides: Partial<StatementEntry> & { statementType: string; category: "asset" | "liability"; closingBalance: number }
): StatementEntry {
  return {
    id: Math.random().toString(36).slice(2),
    description: "",
    ownershipPercentage: 100,
    ...overrides,
  };
}

function makeSnapshot(
  overrides: Partial<NetWorthSnapshot> & { date: string; entries: StatementEntry[] }
): NetWorthSnapshot {
  const totalAssets = overrides.entries
    .filter((e) => e.category === "asset")
    .reduce((sum, e) => sum + (e.closingBalance * e.ownershipPercentage) / 100, 0);
  const totalLiabilities = overrides.entries
    .filter((e) => e.category === "liability")
    .reduce((sum, e) => sum + (e.closingBalance * e.ownershipPercentage) / 100, 0);
  return {
    id: Math.random().toString(36).slice(2),
    totalAssets,
    totalLiabilities,
    netWorth: totalAssets - totalLiabilities,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

const FIVE_SNAPSHOTS: NetWorthSnapshot[] = [
  makeSnapshot({
    date: "2025-01-01",
    entries: [
      makeEntry({ statementType: "Savings Bank Account", category: "asset", closingBalance: 500000 }),
      makeEntry({ statementType: "Mutual Fund", category: "asset", closingBalance: 1000000 }),
      makeEntry({ statementType: "Real Estate", category: "asset", closingBalance: 3000000 }),
      makeEntry({ statementType: "Home Loan", category: "liability", closingBalance: 1500000 }),
    ],
  }),
  makeSnapshot({
    date: "2025-03-01",
    entries: [
      makeEntry({ statementType: "Savings Bank Account", category: "asset", closingBalance: 520000 }),
      makeEntry({ statementType: "Mutual Fund", category: "asset", closingBalance: 1100000 }),
      makeEntry({ statementType: "Real Estate", category: "asset", closingBalance: 3000000 }),
      makeEntry({ statementType: "Home Loan", category: "liability", closingBalance: 1450000 }),
    ],
  }),
  makeSnapshot({
    date: "2025-05-01",
    entries: [
      makeEntry({ statementType: "Savings Bank Account", category: "asset", closingBalance: 550000 }),
      makeEntry({ statementType: "Mutual Fund", category: "asset", closingBalance: 1200000 }),
      makeEntry({ statementType: "Real Estate", category: "asset", closingBalance: 3100000 }),
      makeEntry({ statementType: "Home Loan", category: "liability", closingBalance: 1400000 }),
    ],
  }),
  makeSnapshot({
    date: "2025-07-01",
    entries: [
      makeEntry({ statementType: "Savings Bank Account", category: "asset", closingBalance: 600000 }),
      makeEntry({ statementType: "Mutual Fund", category: "asset", closingBalance: 1350000 }),
      makeEntry({ statementType: "Real Estate", category: "asset", closingBalance: 3100000 }),
      makeEntry({ statementType: "Home Loan", category: "liability", closingBalance: 1350000 }),
    ],
  }),
  makeSnapshot({
    date: "2025-09-01",
    entries: [
      makeEntry({ statementType: "Savings Bank Account", category: "asset", closingBalance: 650000 }),
      makeEntry({ statementType: "Mutual Fund", category: "asset", closingBalance: 1500000 }),
      makeEntry({ statementType: "Real Estate", category: "asset", closingBalance: 3200000 }),
      makeEntry({ statementType: "Home Loan", category: "liability", closingBalance: 1300000 }),
    ],
  }),
];

describe("computeAllInsights", () => {
  it("returns all six domains with insights for 5-snapshot happy path", () => {
    const result = computeAllInsights(FIVE_SNAPSHOTS);

    expect(result.domains.growth.length).toBeGreaterThanOrEqual(3);
    expect(result.domains.leverage.length).toBeGreaterThanOrEqual(2);
    expect(result.domains.liquidity.length).toBeGreaterThanOrEqual(2);
    expect(result.domains.efficiency.length).toBeGreaterThanOrEqual(2);
    expect(result.domains.risk.length).toBe(2);
    expect(result.domains.behavior.length).toBe(2);

    expect(result.summary.total).toBeGreaterThanOrEqual(13);
    expect(result.computedAt).toBeTruthy();
  });

  it("computes CAGR correctly for multi-month span", () => {
    const result = computeAllInsights(FIVE_SNAPSHOTS);
    const cagr = result.domains.growth.find((i) => i.id === "growth.cagr");
    expect(cagr).toBeDefined();
    expect(cagr!.unavailable).toBeFalsy();
    expect(cagr!.metricValue).toBeGreaterThan(0);
  });

  it("flags nominal growth direction correctly", () => {
    const result = computeAllInsights(FIVE_SNAPSHOTS);
    const nominal = result.domains.growth.find((i) => i.id === "growth.nominal-delta");
    expect(nominal).toBeDefined();
    expect(nominal!.trend).toBe("up");
    expect(nominal!.metricValue).toBeGreaterThan(0);
  });

  it("handles single-snapshot: computes single-snapshot metrics, marks multi-snapshot as unavailable", () => {
    const single = [FIVE_SNAPSHOTS[0]];
    const result = computeAllInsights(single);

    expect(result.domains.growth.length).toBeGreaterThanOrEqual(1);
    const cagr = result.domains.growth.find((i) => i.id === "growth.cagr");
    expect(cagr?.unavailable).toBe(true);

    const nominalDelta = result.domains.growth.find((i) => i.id === "growth.nominal-delta");
    expect(nominalDelta).toBeUndefined();

    const debtToAsset = result.domains.leverage.find((i) => i.id === "leverage.debt-to-asset");
    expect(debtToAsset).toBeDefined();
    expect(debtToAsset!.unavailable).toBeFalsy();

    const concentration = result.domains.liquidity.find((i) => i.id === "liquidity.concentration");
    expect(concentration).toBeDefined();
    expect(concentration!.unavailable).toBeFalsy();
  });

  it("handles negative net worth: critical severity on debt-to-nw", () => {
    const negativeNW = [
      makeSnapshot({
        date: "2025-01-01",
        entries: [
          makeEntry({ statementType: "Savings Bank Account", category: "asset", closingBalance: 100000 }),
          makeEntry({ statementType: "Personal Loan", category: "liability", closingBalance: 500000 }),
        ],
      }),
    ];
    const result = computeAllInsights(negativeNW);
    const debtNW = result.domains.leverage.find((i) => i.id === "leverage.debt-to-nw");
    expect(debtNW).toBeDefined();
    expect(debtNW!.severity).toBe("critical");
  });

  it("handles zero assets: debt-to-asset unavailable", () => {
    const zeroAssets = [
      makeSnapshot({
        date: "2025-01-01",
        entries: [
          makeEntry({ statementType: "Personal Loan", category: "liability", closingBalance: 100000 }),
        ],
      }),
    ];
    const result = computeAllInsights(zeroAssets);
    const debtToAsset = result.domains.leverage.find((i) => i.id === "leverage.debt-to-asset");
    expect(debtToAsset).toBeDefined();
    expect(debtToAsset!.unavailable).toBe(true);
  });

  it("handles empty entries array", () => {
    const empty = [
      makeSnapshot({
        date: "2025-01-01",
        entries: [],
        totalAssets: 0,
        totalLiabilities: 0,
        netWorth: 0,
      }),
    ];
    const result = computeAllInsights(empty);
    expect(result.summary.total).toBeGreaterThan(0);
    expect(result.domains.risk.length).toBe(2);
    expect(result.domains.risk.every((i) => i.unavailable)).toBe(true);
  });

  it("marks unavailable stubs for interest coverage, debt drag, LTV, insurance gap, emergency fund", () => {
    const result = computeAllInsights(FIVE_SNAPSHOTS);

    const stubs = [
      result.domains.leverage.find((i) => i.id === "leverage.interest-coverage"),
      result.domains.leverage.find((i) => i.id === "leverage.debt-drag"),
      result.domains.risk.find((i) => i.id === "risk.ltv"),
      result.domains.risk.find((i) => i.id === "risk.insurance-gap"),
      result.domains.liquidity.find((i) => i.id === "liquidity.emergency-fund"),
    ];

    for (const stub of stubs) {
      expect(stub).toBeDefined();
      expect(stub!.unavailable).toBe(true);
      expect(stub!.unavailableReason).toBeTruthy();
    }
  });

  it("computes savings consistency for 5 snapshots", () => {
    const result = computeAllInsights(FIVE_SNAPSHOTS);
    const consistency = result.domains.behavior.find((i) => i.id === "behavior.savings-consistency");
    expect(consistency).toBeDefined();
    expect(consistency!.unavailable).toBeFalsy();
    expect(consistency!.metricValue).toBeDefined();
  });
});
