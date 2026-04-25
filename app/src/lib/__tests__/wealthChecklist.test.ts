import {
  evaluateChecklist,
  computeStageScore,
  getChecklistItems,
} from "@/lib/wealthChecklist";
import { computeAllInsights } from "@/lib/insightsEngine";
import { parseBalanceSheet } from "@/lib/balanceSheet";
import { classifyWealthStage } from "@/lib/wealthStage";
import type {
  NetWorthSnapshot,
  StatementEntry,
  ChecklistContext,
  AdvancedInputs,
} from "@/types";

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

function buildContext(
  snapshots: NetWorthSnapshot[],
  advancedInputs?: AdvancedInputs
): ChecklistContext {
  const sorted = [...snapshots].sort((a, b) => a.date.localeCompare(b.date));
  const latest = sorted[sorted.length - 1];
  const insightResult = computeAllInsights(sorted, undefined, advancedInputs);
  const bs = parseBalanceSheet(latest);
  const stage = classifyWealthStage(latest.netWorth);
  return {
    netWorth: latest.netWorth,
    stage: stage.id,
    balanceSheet: bs,
    advancedInputs,
    insightResult,
    snapshots: sorted,
  };
}

const FOUNDATION_SNAPSHOT = makeSnapshot({
  date: "2025-01-01",
  entries: [
    makeEntry({ statementType: "Savings Bank Account", category: "asset", closingBalance: 300000 }),
    makeEntry({ statementType: "Fixed Deposit", category: "asset", closingBalance: 100000 }),
    makeEntry({ statementType: "Mutual Fund", category: "asset", closingBalance: 50000 }),
    makeEntry({ statementType: "Credit Card Outstanding", category: "liability", closingBalance: 25000 }),
  ],
});

describe("getChecklistItems", () => {
  it("returns at least 5 items per stage", () => {
    const stages = ["foundation", "stability", "acceleration", "optimization", "preservation"] as const;
    for (const stage of stages) {
      const items = getChecklistItems(stage);
      expect(items.length).toBeGreaterThanOrEqual(5);
      items.forEach((item) => {
        expect(item.id).toBeTruthy();
        expect(item.label).toBeTruthy();
        expect(item.weight).toBeGreaterThan(0);
      });
    }
  });
});

describe("evaluateChecklist — foundation", () => {
  it("returns not_applicable for emergency fund when no income provided", () => {
    const ctx = buildContext([FOUNDATION_SNAPSHOT]);
    const results = evaluateChecklist(ctx);
    const ef = results.find((r) => r.id === "f.emergency-fund");
    expect(ef).toBeDefined();
    expect(ef!.status).toBe("not_applicable");
  });

  it("evaluates emergency fund as partial when income is provided and liquid covers 3 months", () => {
    const ctx = buildContext([FOUNDATION_SNAPSHOT], { monthly_income: 100000 });
    const results = evaluateChecklist(ctx);
    const ef = results.find((r) => r.id === "f.emergency-fund");
    expect(ef).toBeDefined();
    // 400k liquid / 100k income = 4 months → partial (1-5 months)
    expect(ef!.status).toBe("partial");
    expect(ef!.score).toBe(50);
  });

  it("evaluates high-interest debt as todo when credit card exists", () => {
    const ctx = buildContext([FOUNDATION_SNAPSHOT]);
    const results = evaluateChecklist(ctx);
    const debt = results.find((r) => r.id === "f.high-interest-debt");
    expect(debt).toBeDefined();
    expect(debt!.status).toBe("todo");
    expect(debt!.score).toBe(0);
  });

  it("evaluates SIP as not_applicable when no sip amount provided", () => {
    const ctx = buildContext([FOUNDATION_SNAPSHOT]);
    const results = evaluateChecklist(ctx);
    const sip = results.find((r) => r.id === "f.sip-started");
    expect(sip).toBeDefined();
    expect(sip!.status).toBe("not_applicable");
  });

  it("evaluates SIP as done when sip amount >= 2000", () => {
    const ctx = buildContext([FOUNDATION_SNAPSHOT], { monthly_investment: 5000 });
    const results = evaluateChecklist(ctx);
    const sip = results.find((r) => r.id === "f.sip-started");
    expect(sip!.status).toBe("done");
    expect(sip!.score).toBe(100);
  });
});

describe("computeStageScore", () => {
  it("returns 0 with insufficientData when all not_applicable", () => {
    const results = [
      { id: "a", label: "A", category: "protection" as const, weight: 1, status: "not_applicable" as const, score: 0, message: "test" },
      { id: "b", label: "B", category: "growth" as const, weight: 1, status: "not_applicable" as const, score: 0, message: "test" },
    ];
    const score = computeStageScore(results);
    expect(score.insufficientData).toBe(true);
    expect(score.value).toBe(0);
  });

  it("computes weighted average for mixed results", () => {
    const results = [
      { id: "a", label: "A", category: "protection" as const, weight: 1, status: "done" as const, score: 100, message: "ok" },
      { id: "b", label: "B", category: "growth" as const, weight: 1, status: "partial" as const, score: 50, message: "ok" },
      { id: "c", label: "C", category: "behavior" as const, weight: 1, status: "todo" as const, score: 0, message: "ok" },
      { id: "d", label: "D", category: "tax" as const, weight: 1, status: "not_applicable" as const, score: 0, message: "na" },
    ];
    const score = computeStageScore(results);
    expect(score.insufficientData).toBe(false);
    // (100 + 50 + 0) / 3 = 50
    expect(score.value).toBe(50);
  });

  it("returns 100 when all applicable items are done", () => {
    const results = [
      { id: "a", label: "A", category: "protection" as const, weight: 2, status: "done" as const, score: 100, message: "ok" },
      { id: "b", label: "B", category: "growth" as const, weight: 3, status: "done" as const, score: 100, message: "ok" },
    ];
    const score = computeStageScore(results);
    expect(score.value).toBe(100);
  });
});
