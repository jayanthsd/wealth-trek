import type {
  InsightDomain,
  InsightItem,
  InsightResult,
  WealthStage,
} from "@/types";
import { classifyWealthStage } from "./wealthStage";

export type HealthGrade = "A" | "B" | "C" | "D" | "F";

export interface DomainHealth {
  domain: InsightDomain;
  /** 0-100, or null when the domain has no usable insights. */
  score: number | null;
  /** Raw count of critical/warning/info available insights. */
  counts: { critical: number; warning: number; info: number; unavailable: number };
}

export interface WealthHealthScore {
  /** 0-100 overall score. */
  score: number;
  grade: HealthGrade;
  /** Domains contributing to this score, with their individual scores + weights applied. */
  domainHealths: DomainHealth[];
  /** Weights used for each domain, summing to 1. */
  weights: Record<InsightDomain, number>;
  /** The life stage used to derive the weights, if any. */
  stage: WealthStage | null;
  /** Count of unavailable domains (no data) — for UI messaging. */
  coverage: {
    domainsScored: number;
    domainsTotal: number;
  };
}

// ---------------------------------------------------------------------------
// Life-stage weighting
// ---------------------------------------------------------------------------

const EQUAL_WEIGHTS: Record<InsightDomain, number> = {
  growth: 1,
  leverage: 1,
  liquidity: 1,
  efficiency: 1,
  risk: 1,
  behavior: 1,
  inflation_audit: 1,
  gap_analysis: 1,
  debt_quality: 1,
  tax_efficiency: 1,
  trajectory: 1,
  protection: 1,
};

const STAGE_WEIGHTS: Record<WealthStage, Record<InsightDomain, number>> = {
  // Early career: protect the downside, clear bad debt, build habits.
  foundation: {
    liquidity: 3,
    debt_quality: 3,
    protection: 3,
    behavior: 2,
    leverage: 2,
    gap_analysis: 2,
    growth: 1,
    efficiency: 1,
    risk: 1,
    inflation_audit: 1,
    tax_efficiency: 1,
    trajectory: 1,
  },
  // Stability: keep consistency, start compounding, avoid drag.
  stability: {
    behavior: 3,
    protection: 3,
    gap_analysis: 2,
    liquidity: 2,
    debt_quality: 2,
    efficiency: 2,
    growth: 2,
    leverage: 2,
    inflation_audit: 1,
    tax_efficiency: 1,
    trajectory: 2,
    risk: 1,
  },
  // Acceleration: compounding matters most; tax + trajectory become critical.
  acceleration: {
    growth: 3,
    trajectory: 3,
    tax_efficiency: 3,
    efficiency: 2,
    inflation_audit: 2,
    protection: 2,
    gap_analysis: 2,
    behavior: 2,
    leverage: 2,
    debt_quality: 2,
    liquidity: 1,
    risk: 1,
  },
  // Optimization: protect and fine-tune.
  optimization: {
    tax_efficiency: 3,
    protection: 3,
    trajectory: 3,
    risk: 3,
    inflation_audit: 2,
    gap_analysis: 2,
    efficiency: 2,
    liquidity: 2,
    leverage: 2,
    debt_quality: 1,
    growth: 2,
    behavior: 1,
  },
  // Preservation: don't give back what's been built.
  preservation: {
    risk: 3,
    protection: 3,
    liquidity: 3,
    tax_efficiency: 3,
    inflation_audit: 2,
    trajectory: 2,
    leverage: 2,
    efficiency: 1,
    gap_analysis: 1,
    debt_quality: 1,
    growth: 1,
    behavior: 1,
  },
};

function normalizeWeights(raw: Record<InsightDomain, number>): Record<InsightDomain, number> {
  const total = Object.values(raw).reduce((a, b) => a + b, 0);
  const out = {} as Record<InsightDomain, number>;
  for (const k of Object.keys(raw) as InsightDomain[]) {
    out[k] = total > 0 ? raw[k] / total : 0;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Per-item & per-domain scoring
// ---------------------------------------------------------------------------

const SEVERITY_SCORE: Record<InsightItem["severity"], number> = {
  info: 100,
  warning: 55,
  critical: 15,
  unavailable: 0, // ignored
};

function scoreDomain(items: InsightItem[]): DomainHealth["score"] {
  const available = items.filter((i) => !i.unavailable && i.severity !== "unavailable");
  if (available.length === 0) return null;
  const sum = available.reduce((acc, i) => acc + SEVERITY_SCORE[i.severity], 0);
  return Math.round(sum / available.length);
}

function countByStatus(items: InsightItem[]): DomainHealth["counts"] {
  const counts = { critical: 0, warning: 0, info: 0, unavailable: 0 };
  for (const i of items) {
    if (i.unavailable) counts.unavailable++;
    else if (i.severity === "critical") counts.critical++;
    else if (i.severity === "warning") counts.warning++;
    else if (i.severity === "info") counts.info++;
  }
  return counts;
}

// ---------------------------------------------------------------------------
// Grading
// ---------------------------------------------------------------------------

export function scoreToGrade(score: number): HealthGrade {
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 55) return "C";
  if (score >= 40) return "D";
  return "F";
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

export function computeWealthHealthScore(
  insightResult: InsightResult,
  netWorth: number | null
): WealthHealthScore {
  const stage = netWorth != null && netWorth > 0 ? classifyWealthStage(netWorth).id : null;
  const rawWeights = stage ? STAGE_WEIGHTS[stage] : EQUAL_WEIGHTS;
  const weights = normalizeWeights(rawWeights);

  const domainHealths: DomainHealth[] = (Object.keys(insightResult.domains) as InsightDomain[]).map(
    (domain) => ({
      domain,
      score: scoreDomain(insightResult.domains[domain]),
      counts: countByStatus(insightResult.domains[domain]),
    })
  );

  // Weighted average over domains that have a score, renormalising weights
  // across only the contributing domains so unavailable domains don't drag the score.
  let weightedSum = 0;
  let weightTotal = 0;
  for (const dh of domainHealths) {
    if (dh.score == null) continue;
    const w = weights[dh.domain];
    weightedSum += dh.score * w;
    weightTotal += w;
  }

  const score = weightTotal > 0 ? Math.round(weightedSum / weightTotal) : 0;
  const domainsScored = domainHealths.filter((d) => d.score != null).length;

  return {
    score,
    grade: scoreToGrade(score),
    domainHealths,
    weights,
    stage,
    coverage: {
      domainsScored,
      domainsTotal: domainHealths.length,
    },
  };
}

// ---------------------------------------------------------------------------
// Human-friendly summary sentence
// ---------------------------------------------------------------------------

export function scoreHeadline(score: WealthHealthScore): string {
  const criticals = score.domainHealths.reduce((a, d) => a + d.counts.critical, 0);
  const warnings = score.domainHealths.reduce((a, d) => a + d.counts.warning, 0);

  if (score.score >= 85) {
    return warnings === 0
      ? "Your finances are firing on all cylinders."
      : "Your finances are in great shape overall, with a few small optimizations available.";
  }
  if (score.score >= 70) {
    return criticals > 0
      ? `Solid foundation, but ${criticals} area${criticals === 1 ? "" : "s"} need${criticals === 1 ? "s" : ""} urgent attention.`
      : "You're in a healthy position — a handful of tweaks will push this higher.";
  }
  if (score.score >= 55) {
    return `Mixed picture — ${criticals + warnings} area${criticals + warnings === 1 ? "" : "s"} are quietly costing you money.`;
  }
  if (score.score >= 40) {
    return "Several areas need attention. Focus on the Priority list below, one at a time.";
  }
  return "Your finances need urgent attention. Start with the top two priorities below.";
}
