import { computeEffectiveValue, computeTotals, formatINR } from "@/lib/computations";
import type { StatementEntry } from "@/types";

describe("computations", () => {
  it("computes effective value using ownership percentage", () => {
    const entry = {
      id: "1",
      statementType: "Savings",
      description: "",
      category: "asset",
      closingBalance: 1000,
      ownershipPercentage: 25,
    } as StatementEntry;

    expect(computeEffectiveValue(entry)).toBe(250);
  });

  it("computes totals for assets and liabilities", () => {
    const entries: StatementEntry[] = [
      {
        id: "1",
        statementType: "Savings",
        description: "",
        category: "asset",
        closingBalance: 1000,
        ownershipPercentage: 100,
      },
      {
        id: "2",
        statementType: "Loan",
        description: "",
        category: "liability",
        closingBalance: 300,
        ownershipPercentage: 100,
      },
    ];

    expect(computeTotals(entries)).toEqual({
      totalAssets: 1000,
      totalLiabilities: 300,
      netWorth: 700,
    });
  });

  it("formats INR for positive and negative numbers", () => {
    expect(formatINR(1234567.5)).toBe("₹12,34,567.50");
    expect(formatINR(-10)).toBe("-₹10.00");
  });
});
