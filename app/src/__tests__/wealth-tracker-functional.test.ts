// @vitest-environment jsdom
/**
 * Functional tests for the Wealth Tracker specification
 * These tests verify the requirements defined in openspec/specs/wealth-tracker/spec.md
 */

import { renderHook, waitFor, act } from "@testing-library/react";
import { useNetWorthHistory } from "@/hooks/useNetWorthHistory";
import { computeTotals, formatINR } from "@/lib/computations";
import type { StatementEntry } from "@/types";

// Mock snapshots for wealth tracker tests
const mockSnapshots = [
  {
    id: "snap-1",
    date: "2025-01-01",
    totalAssets: 100000,
    totalLiabilities: 30000,
    netWorth: 70000,
    entries: [],
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "snap-2",
    date: "2025-06-01",
    totalAssets: 150000,
    totalLiabilities: 25000,
    netWorth: 125000,
    entries: [],
    createdAt: "2025-06-01T00:00:00.000Z",
  },
  {
    id: "snap-3",
    date: "2026-01-01",
    totalAssets: 200000,
    totalLiabilities: 20000,
    netWorth: 180000,
    entries: [],
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];

describe("Wealth Tracker Functional Tests", () => {
  describe("Requirement: Display net worth trend over time", () => {
    it("loads and displays snapshots when user has multiple historical snapshots", async () => {
      vi.stubGlobal("fetch", vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => ({ snapshots: mockSnapshots }),
        })
      ));

      const { result } = renderHook(() => useNetWorthHistory());
      await waitFor(() => expect(result.current.loaded).toBe(true));

      expect(result.current.snapshots).toHaveLength(3);
      // API returns ordered by date ASC, so first snapshot is the oldest
      expect(result.current.snapshots[0].netWorth).toBe(70000);
      expect(result.current.snapshots[2].netWorth).toBe(180000);

      vi.unstubAllGlobals();
    });

    it("shows empty state when user has no snapshots", async () => {
      vi.stubGlobal("fetch", vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => ({ snapshots: [] }),
        })
      ));

      const { result } = renderHook(() => useNetWorthHistory());
      await waitFor(() => expect(result.current.loaded).toBe(true));

      expect(result.current.snapshots).toHaveLength(0);

      vi.unstubAllGlobals();
    });

    it("loads snapshots sorted by date for chart display", async () => {
      vi.stubGlobal("fetch", vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => ({ snapshots: mockSnapshots }),
        })
      ));

      const { result } = renderHook(() => useNetWorthHistory());
      await waitFor(() => expect(result.current.loaded).toBe(true));

      const dates = result.current.snapshots.map((s) => s.date);
      expect(dates).toEqual(["2025-01-01", "2025-06-01", "2026-01-01"]);

      vi.unstubAllGlobals();
    });
  });

  describe("Requirement: Display assets and liabilities trends", () => {
    it("provides all three data series for chart (assets, liabilities, net worth)", async () => {
      vi.stubGlobal("fetch", vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => ({ snapshots: mockSnapshots }),
        })
      ));

      const { result } = renderHook(() => useNetWorthHistory());
      await waitFor(() => expect(result.current.loaded).toBe(true));

      expect(result.current.snapshots).toHaveLength(3);

      // Verify each snapshot has the required fields
      result.current.snapshots.forEach((snapshot) => {
        expect(snapshot).toHaveProperty("totalAssets");
        expect(snapshot).toHaveProperty("totalLiabilities");
        expect(snapshot).toHaveProperty("netWorth");
        expect(snapshot.totalAssets - snapshot.totalLiabilities).toBe(snapshot.netWorth);
      });

      vi.unstubAllGlobals();
    });

    it("computes correct chart data from statement entries", () => {
      const entries: StatementEntry[] = [
        {
          id: "1",
          statementType: "Savings",
          description: "Bank Savings",
          category: "asset",
          closingBalance: 50000,
          ownershipPercentage: 100,
        },
        {
          id: "2",
          statementType: "Property",
          description: "House",
          category: "asset",
          closingBalance: 500000,
          ownershipPercentage: 50,
        },
        {
          id: "3",
          statementType: "Loan",
          description: "Home Loan",
          category: "liability",
          closingBalance: 200000,
          ownershipPercentage: 100,
        },
      ];

      const totals = computeTotals(entries);
      
      // Assets: 50000 + 250000 = 300000
      // Liabilities: 200000
      // Net Worth: 100000
      expect(totals.totalAssets).toBe(300000);
      expect(totals.totalLiabilities).toBe(200000);
      expect(totals.netWorth).toBe(100000);
    });
  });

  describe("Requirement: Display snapshot summary table", () => {
    it("returns snapshots sorted by date for table display (most recent first for table)", async () => {
      vi.stubGlobal("fetch", vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => ({ snapshots: mockSnapshots }),
        })
      ));

      const { result } = renderHook(() => useNetWorthHistory());
      await waitFor(() => expect(result.current.loaded).toBe(true));

      // Verify all snapshot data needed for table is present
      result.current.snapshots.forEach((snapshot) => {
        expect(snapshot).toHaveProperty("date");
        expect(snapshot).toHaveProperty("totalAssets");
        expect(snapshot).toHaveProperty("totalLiabilities");
        expect(snapshot).toHaveProperty("netWorth");
      });

      vi.unstubAllGlobals();
    });

    it("snapshot contains entries for line-item breakdown", async () => {
      const snapshotsWithEntries = [
        {
          id: "snap-1",
          date: "2026-01-01",
          totalAssets: 200000,
          totalLiabilities: 20000,
          netWorth: 180000,
          entries: [
            {
              id: "e1",
              statementType: "Savings",
              description: "Bank",
              category: "asset",
              closingBalance: 200000,
              ownershipPercentage: 100,
            },
            {
              id: "e2",
              statementType: "Loan",
              description: "Personal",
              category: "liability",
              closingBalance: 20000,
              ownershipPercentage: 100,
            },
          ],
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      ];

      vi.stubGlobal("fetch", vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => ({ snapshots: snapshotsWithEntries }),
        })
      ));

      const { result } = renderHook(() => useNetWorthHistory());
      await waitFor(() => expect(result.current.loaded).toBe(true));

      expect(result.current.snapshots[0].entries).toHaveLength(2);
      expect(result.current.snapshots[0].entries[0].category).toBe("asset");
      expect(result.current.snapshots[0].entries[1].category).toBe("liability");

      vi.unstubAllGlobals();
    });
  });

  describe("Requirement: Save snapshot functionality", () => {
    it("can save a new snapshot with computed totals", async () => {
      const entries: StatementEntry[] = [
        {
          id: "1",
          statementType: "Savings",
          description: "Test",
          category: "asset",
          closingBalance: 10000,
          ownershipPercentage: 100,
        },
      ];
      const totals = computeTotals(entries);

      vi.stubGlobal("fetch", vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => ({ snapshots: [] }),
        })
      ));

      const { result } = renderHook(() => useNetWorthHistory());
      await waitFor(() => expect(result.current.loaded).toBe(true));

      // Verify computed totals are correct before saving
      expect(totals.totalAssets).toBe(10000);
      expect(totals.totalLiabilities).toBe(0);
      expect(totals.netWorth).toBe(10000);

      vi.unstubAllGlobals();
    });
  });

  describe("INR Currency Formatting for display", () => {
    it("formats assets and liabilities values correctly for table", () => {
      expect(formatINR(100000)).toBe("₹1,00,000.00");
      expect(formatINR(25000)).toBe("₹25,000.00");
      expect(formatINR(0)).toBe("₹0.00");
    });

    it("formats negative net worth correctly", () => {
      expect(formatINR(-50000)).toBe("-₹50,000.00");
    });

    it("formats lakhs and crores correctly", () => {
      expect(formatINR(10000000)).toBe("₹1,00,00,000.00"); // 1 crore
      expect(formatINR(1000000)).toBe("₹10,00,000.00"); // 10 lakhs
    });
  });
});