import { computeEffectiveValue, computeTotals, formatINR } from "@/lib/computations";
import type { StatementEntry } from "@/types";

describe("computations", () => {
  describe("computeEffectiveValue", () => {
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

    it("returns full value for 100% ownership", () => {
      const entry = {
        id: "1",
        statementType: "Savings",
        description: "",
        category: "asset",
        closingBalance: 5000,
        ownershipPercentage: 100,
      } as StatementEntry;

      expect(computeEffectiveValue(entry)).toBe(5000);
    });

    it("returns zero for 0% ownership", () => {
      const entry = {
        id: "1",
        statementType: "Savings",
        description: "",
        category: "asset",
        closingBalance: 5000,
        ownershipPercentage: 0,
      } as StatementEntry;

      expect(computeEffectiveValue(entry)).toBe(0);
    });

    it("handles decimal ownership percentage", () => {
      const entry = {
        id: "1",
        statementType: "Savings",
        description: "",
        category: "asset",
        closingBalance: 1000,
        ownershipPercentage: 33.33,
      } as StatementEntry;

      expect(computeEffectiveValue(entry)).toBeCloseTo(333.3);
    });

    it("handles negative closing balance", () => {
      const entry = {
        id: "1",
        statementType: "Loan",
        description: "",
        category: "liability",
        closingBalance: -500,
        ownershipPercentage: 100,
      } as StatementEntry;

      expect(computeEffectiveValue(entry)).toBe(-500);
    });

    it("computes effective value with zero balance", () => {
      const entry = {
        id: "1",
        statementType: "Savings",
        description: "",
        category: "asset",
        closingBalance: 0,
        ownershipPercentage: 50,
      } as StatementEntry;

      expect(computeEffectiveValue(entry)).toBe(0);
    });
  });

  describe("computeTotals", () => {
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

    it("computes totals for empty entries array", () => {
      expect(computeTotals([])).toEqual({
        totalAssets: 0,
        totalLiabilities: 0,
        netWorth: 0,
      });
    });

    it("computes totals with multiple assets only", () => {
      const entries: StatementEntry[] = [
        {
          id: "1",
          statementType: "Savings",
          description: "",
          category: "asset",
          closingBalance: 5000,
          ownershipPercentage: 100,
        },
        {
          id: "2",
          statementType: "Property",
          description: "",
          category: "asset",
          closingBalance: 50000,
          ownershipPercentage: 50,
        },
      ];

      expect(computeTotals(entries)).toEqual({
        totalAssets: 30000,
        totalLiabilities: 0,
        netWorth: 30000,
      });
    });

    it("computes totals with multiple liabilities only", () => {
      const entries: StatementEntry[] = [
        {
          id: "1",
          statementType: "Loan",
          description: "",
          category: "liability",
          closingBalance: 10000,
          ownershipPercentage: 100,
        },
        {
          id: "2",
          statementType: "Credit Card",
          description: "",
          category: "liability",
          closingBalance: 5000,
          ownershipPercentage: 50,
        },
      ];

      expect(computeTotals(entries)).toEqual({
        totalAssets: 0,
        totalLiabilities: 12500,
        netWorth: -12500,
      });
    });

    it("handles mixed assets and liabilities with partial ownership", () => {
      const entries: StatementEntry[] = [
        {
          id: "1",
          statementType: "Savings",
          description: "",
          category: "asset",
          closingBalance: 10000,
          ownershipPercentage: 60,
        },
        {
          id: "2",
          statementType: "Loan",
          description: "",
          category: "liability",
          closingBalance: 5000,
          ownershipPercentage: 40,
        },
        {
          id: "3",
          statementType: "Property",
          description: "",
          category: "asset",
          closingBalance: 100000,
          ownershipPercentage: 25,
        },
      ];

      // Assets: 6000 + 25000 = 31000
      // Liabilities: 2000
      // Net Worth: 29000
      expect(computeTotals(entries)).toEqual({
        totalAssets: 31000,
        totalLiabilities: 2000,
        netWorth: 29000,
      });
    });

    it("handles zero entries without errors", () => {
      const entries: StatementEntry[] = [
        {
          id: "1",
          statementType: "Savings",
          description: "",
          category: "asset",
          closingBalance: 0,
          ownershipPercentage: 100,
        },
        {
          id: "2",
          statementType: "Loan",
          description: "",
          category: "liability",
          closingBalance: 0,
          ownershipPercentage: 100,
        },
      ];

      expect(computeTotals(entries)).toEqual({
        totalAssets: 0,
        totalLiabilities: 0,
        netWorth: 0,
      });
    });
  });

  describe("formatINR", () => {
    it("formats INR for positive numbers", () => {
      expect(formatINR(1234567.5)).toBe("₹12,34,567.50");
    });

    it("formats INR for negative numbers", () => {
      expect(formatINR(-10)).toBe("-₹10.00");
    });

    it("formats zero correctly", () => {
      expect(formatINR(0)).toBe("₹0.00");
    });

    it("formats small amounts correctly", () => {
      expect(formatINR(0.99)).toBe("₹0.99");
    });

    it("formats large numbers with proper Indian comma separation", () => {
      expect(formatINR(1000)).toBe("₹1,000.00");
      expect(formatINR(10000)).toBe("₹10,000.00");
      expect(formatINR(100000)).toBe("₹1,00,000.00");
      expect(formatINR(1000000)).toBe("₹10,00,000.00");
      expect(formatINR(10000000)).toBe("₹1,00,00,000.00");
    });

    it("formats numbers less than 1000 without commas", () => {
      expect(formatINR(999)).toBe("₹999.00");
      expect(formatINR(100)).toBe("₹100.00");
    });

    it("handles negative zero as positive zero", () => {
      expect(formatINR(-0)).toBe("₹0.00");
    });

    it("handles decimal precision correctly", () => {
      expect(formatINR(1234.567)).toBe("₹1,234.57");
      // 100.005 -> toFixed(2) = "100.00" due to banker's rounding in JS
      expect(formatINR(100.005)).toBe("₹100.00");
    });
  });
});
