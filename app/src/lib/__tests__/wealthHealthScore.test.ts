import { describe, it, expect } from "vitest";
import {
  computeWealthHealthScore,
  scoreToGrade,
  scoreHeadline,
} from "@/lib/wealthHealthScore";
import type { InsightDomain, InsightItem, InsightResult } from "@/types";

function makeItem(
  id: string,
  domain: InsightDomain,
  severity: InsightItem["severity"],
  opts: Partial<InsightItem> = {}
): InsightItem {
  return {
    id,
    domain,
    title: id,
    description: "",
    severity,
    ...opts,
  };
}

function makeResult(
  domainItems: Partial<Record<InsightDomain, InsightItem[]>>
): InsightResult {
  const allDomains: InsightDomain[] = [
    "growth",
    "leverage",
    "liquidity",
    "efficiency",
    "risk",
    "behavior",
    "inflation_audit",
    "gap_analysis",
    "debt_quality",
    "tax_efficiency",
    "trajectory",
    "protection",
  ];
  const domains = {} as Record<InsightDomain, InsightItem[]>;
  for (const d of allDomains) domains[d] = domainItems[d] ?? [];
  return {
    domains,
    summary: { total: 0, critical: 0, warnings: 0, info: 0 },
    advancedResults: {},
    computedAt: new Date().toISOString(),
  };
}

describe("scoreToGrade", () => {
  it("maps boundaries correctly", () => {
    expect(scoreToGrade(100)).toBe("A");
    expect(scoreToGrade(85)).toBe("A");
    expect(scoreToGrade(84)).toBe("B");
    expect(scoreToGrade(70)).toBe("B");
    expect(scoreToGrade(55)).toBe("C");
    expect(scoreToGrade(40)).toBe("D");
    expect(scoreToGrade(39)).toBe("F");
    expect(scoreToGrade(0)).toBe("F");
  });
});

describe("computeWealthHealthScore", () => {
  it("returns score 100 when every insight is info (healthy)", () => {
    const result = makeResult({
      growth: [makeItem("g1", "growth", "info")],
      leverage: [makeItem("l1", "leverage", "info")],
      liquidity: [makeItem("ll1", "liquidity", "info")],
    });
    const score = computeWealthHealthScore(result, 500_000);
    expect(score.score).toBe(100);
    expect(score.grade).toBe("A");
  });

  it("applies life-stage weighting when netWorth is provided", () => {
    // In foundation stage, liquidity/debt_quality/protection have weight 3 (heaviest).
    // Put critical in a heavily-weighted domain and info in a light one — score should be low.
    const result = makeResult({
      liquidity: [makeItem("ll1", "liquidity", "critical")],
      growth: [makeItem("g1", "growth", "info")],
    });
    const score = computeWealthHealthScore(result, 500_000); // foundation stage
    expect(score.stage).toBe("foundation");
    // Weighted average: (15 * 3 + 100 * 1) / (3 + 1) = 145/4 ≈ 36
    expect(score.score).toBeLessThan(50);
  });

  it("falls back to equal weights when netWorth is null", () => {
    const result = makeResult({
      liquidity: [makeItem("ll1", "liquidity", "critical")],
      growth: [makeItem("g1", "growth", "info")],
    });
    const score = computeWealthHealthScore(result, null);
    expect(score.stage).toBeNull();
    // Equal weights: (15 + 100) / 2 ≈ 58
    expect(score.score).toBeGreaterThanOrEqual(55);
    expect(score.score).toBeLessThan(65);
  });

  it("ignores unavailable insights when scoring a domain", () => {
    const result = makeResult({
      growth: [
        makeItem("g1", "growth", "info"),
        makeItem("g2", "growth", "unavailable", { unavailable: true }),
      ],
    });
    const score = computeWealthHealthScore(result, null);
    expect(score.score).toBe(100);
  });

  it("skips domains with no available insights without dragging score", () => {
    const result = makeResult({
      growth: [makeItem("g1", "growth", "info")],
      // all other domains empty
    });
    const score = computeWealthHealthScore(result, null);
    expect(score.coverage.domainsScored).toBe(1);
    expect(score.score).toBe(100);
  });

  it("weights sum to 1 (normalized)", () => {
    const result = makeResult({
      growth: [makeItem("g1", "growth", "info")],
    });
    const score = computeWealthHealthScore(result, 500_000);
    const totalWeight = Object.values(score.weights).reduce((a, b) => a + b, 0);
    expect(totalWeight).toBeCloseTo(1, 5);
  });

  it("produces lower score for acceleration stage when trajectory is critical", () => {
    const result = makeResult({
      trajectory: [makeItem("t1", "trajectory", "critical")],
      liquidity: [makeItem("ll1", "liquidity", "info")],
    });
    // Acceleration stage (₹50L) weights trajectory at 3, liquidity at 1.
    const score = computeWealthHealthScore(result, 5_000_000);
    expect(score.stage).toBe("acceleration");
    // (15*3 + 100*1) / 4 ≈ 36
    expect(score.score).toBeLessThan(50);
  });
});

describe("scoreHeadline", () => {
  it("returns a positive message for A-grade scores", () => {
    const result = makeResult({
      growth: [makeItem("g1", "growth", "info")],
    });
    const score = computeWealthHealthScore(result, null);
    expect(scoreHeadline(score)).toMatch(/firing|great shape|healthy/i);
  });

  it("mentions urgency for low scores", () => {
    const result = makeResult({
      growth: [makeItem("g1", "growth", "critical")],
      leverage: [makeItem("l1", "leverage", "critical")],
    });
    const score = computeWealthHealthScore(result, null);
    expect(score.score).toBeLessThan(40);
    expect(scoreHeadline(score)).toMatch(/urgent|attention/i);
  });
});
