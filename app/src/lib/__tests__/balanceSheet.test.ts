import { parseBalanceSheet } from "@/lib/balanceSheet";
import type { NetWorthSnapshot, StatementEntry } from "@/types";

function makeSnapshot(entries: Partial<StatementEntry>[]): NetWorthSnapshot {
  return {
    id: "snap1",
    date: "2026-01-01",
    totalAssets: 0,
    totalLiabilities: 0,
    netWorth: 0,
    createdAt: "2026-01-01T00:00:00Z",
    entries: entries.map((e, i) => ({
      id: `e${i}`,
      statementType: "Savings Bank Account",
      description: "",
      category: "asset",
      closingBalance: 0,
      ownershipPercentage: 100,
      ...e,
    })),
  };
}

describe("parseBalanceSheet", () => {
  it("returns empty balance sheet for snapshot with no entries", () => {
    const result = parseBalanceSheet(makeSnapshot([]));
    expect(result.assets).toEqual({});
    expect(result.liabilities).toEqual({});
    expect(result.total_assets).toBe(0);
    expect(result.total_liabilities).toBe(0);
  });

  it("maps Savings Bank Account to sb_hdfc asset key", () => {
    const result = parseBalanceSheet(
      makeSnapshot([{ statementType: "Savings Bank Account", closingBalance: 100000, ownershipPercentage: 100, category: "asset" }])
    );
    expect(result.assets.sb_hdfc).toBe(100000);
    expect(result.total_assets).toBe(100000);
  });

  it("maps Mutual Fund to mf asset key", () => {
    const result = parseBalanceSheet(
      makeSnapshot([{ statementType: "Mutual Fund", closingBalance: 500000, ownershipPercentage: 100, category: "asset" }])
    );
    expect(result.assets.mf).toBe(500000);
  });

  it("applies ownership percentage correctly", () => {
    const result = parseBalanceSheet(
      makeSnapshot([{ statementType: "Real Estate", closingBalance: 10000000, ownershipPercentage: 50, category: "asset" }])
    );
    expect(result.assets.real_estate).toBe(5000000);
  });

  it("maps Home Loan to home_loan liability key", () => {
    const result = parseBalanceSheet(
      makeSnapshot([{ statementType: "Home Loan", closingBalance: 3000000, ownershipPercentage: 100, category: "liability" }])
    );
    expect(result.liabilities.home_loan).toBe(3000000);
    expect(result.total_liabilities).toBe(3000000);
  });

  it("maps Credit Card Outstanding to credit_card liability key", () => {
    const result = parseBalanceSheet(
      makeSnapshot([{ statementType: "Credit Card Outstanding", closingBalance: 50000, ownershipPercentage: 100, category: "liability" }])
    );
    expect(result.liabilities.credit_card).toBe(50000);
  });

  it("aggregates multiple entries of the same type", () => {
    const result = parseBalanceSheet(
      makeSnapshot([
        { statementType: "Mutual Fund", closingBalance: 200000, ownershipPercentage: 100, category: "asset" },
        { statementType: "Mutual Fund", closingBalance: 300000, ownershipPercentage: 100, category: "asset" },
      ])
    );
    expect(result.assets.mf).toBe(500000);
    expect(result.total_assets).toBe(500000);
  });

  it("handles mixed assets and liabilities correctly", () => {
    const result = parseBalanceSheet(
      makeSnapshot([
        { statementType: "Mutual Fund", closingBalance: 1000000, ownershipPercentage: 100, category: "asset" },
        { statementType: "PPF", closingBalance: 500000, ownershipPercentage: 100, category: "asset" },
        { statementType: "Home Loan", closingBalance: 2000000, ownershipPercentage: 100, category: "liability" },
        { statementType: "Car Loan", closingBalance: 300000, ownershipPercentage: 100, category: "liability" },
      ])
    );
    expect(result.total_assets).toBe(1500000);
    expect(result.total_liabilities).toBe(2300000);
    expect(result.assets.ppf).toBe(500000);
    expect(result.liabilities.car_loan).toBe(300000);
  });

  it("falls back to the raw statementType as key when not in mapping", () => {
    const result = parseBalanceSheet(
      makeSnapshot([{ statementType: "UnknownAssetType", closingBalance: 10000, ownershipPercentage: 100, category: "asset" }])
    );
    expect(result.assets["UnknownAssetType"]).toBe(10000);
  });

  it("handles Gold/Jewellery mapped to gold key", () => {
    const result = parseBalanceSheet(
      makeSnapshot([{ statementType: "Gold/Jewellery", closingBalance: 800000, ownershipPercentage: 100, category: "asset" }])
    );
    expect(result.assets.gold).toBe(800000);
  });
});
