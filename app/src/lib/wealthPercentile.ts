/**
 * India Wealth Percentile Engine
 *
 * Logarithmic interpolation against India wealth distribution anchors.
 * All monetary values are in INR.
 */

// --- Types ---

export interface WealthStage {
  name: string;
  minPercentile: number;
}

export interface MilestoneStatus {
  amount: number;
  percentile: number;
  reached: boolean;
  isNext: boolean;
}

export interface WealthPercentileResult {
  netWorth: number;
  percentile: number;
  stage: WealthStage;
  nextMilestone: number | null;
  progressToNext: number;
  insightMessage: string;
  milestonesStatus: MilestoneStatus[];
}

// --- Config ---

const ANCHORS = [
  { netWorth: 300000, percentile: 50 },
  { netWorth: 1000000, percentile: 75 },
  { netWorth: 2500000, percentile: 90 },
  { netWorth: 10000000, percentile: 95 },
  { netWorth: 35000000, percentile: 99 },
];

const MILESTONES = [300000, 1000000, 2500000, 10000000, 35000000, 100000000];

const STAGES: WealthStage[] = [
  { name: "Starting Out", minPercentile: 0 },
  { name: "Building", minPercentile: 25 },
  { name: "Steady", minPercentile: 50 },
  { name: "Flourishing", minPercentile: 70 },
  { name: "Thriving", minPercentile: 85 },
  { name: "Abundant", minPercentile: 95 },
];

// --- Private helpers ---

/**
 * Format a number in Indian shorthand: ₹3L / ₹25L / ₹1Cr / ₹3.5Cr
 */
function formatINR(value: number): string {
  if (value >= 10000000) {
    const cr = value / 10000000;
    return `₹${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(1)}Cr`;
  }
  if (value >= 100000) {
    const l = value / 100000;
    return `₹${l % 1 === 0 ? l.toFixed(0) : l.toFixed(1)}L`;
  }
  if (value >= 1000) {
    const k = value / 1000;
    return `₹${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K`;
  }
  return `₹${value.toFixed(0)}`;
}

/**
 * Get the ordinal suffix for a number (st, nd, rd, th).
 */
function ordinal(n: number): string {
  const rounded = Math.round(n);
  const s = ["th", "st", "nd", "rd"];
  const v = rounded % 100;
  return rounded + (s[(v - 20) % 10] || s[v] || s[0]);
}

// --- Exported functions ---

/**
 * Compute the wealth percentile for a given net worth using logarithmic interpolation.
 *
 * - Between anchors: log interpolation
 * - Below lowest anchor: 0–50 scaled by log ratio
 * - Above highest anchor: slow log growth beyond 99, capped at 99.9
 * - Zero or negative: returns 0
 */
export function getPercentile(netWorth: number): number {
  if (netWorth <= 0) return 0;

  const lowest = ANCHORS[0];
  const highest = ANCHORS[ANCHORS.length - 1];

  // Below lowest anchor
  if (netWorth < lowest.netWorth) {
    return (
      lowest.percentile * (Math.log(netWorth) / Math.log(lowest.netWorth))
    );
  }

  // Above highest anchor
  if (netWorth > highest.netWorth) {
    const extra =
      (Math.log(netWorth) - Math.log(highest.netWorth)) /
      Math.log(highest.netWorth);
    return Math.min(highest.percentile + extra, 99.9);
  }

  // Between anchors — find bracket
  for (let i = 0; i < ANCHORS.length - 1; i++) {
    const a1 = ANCHORS[i];
    const a2 = ANCHORS[i + 1];
    if (netWorth >= a1.netWorth && netWorth <= a2.netWorth) {
      const t =
        (Math.log(netWorth) - Math.log(a1.netWorth)) /
        (Math.log(a2.netWorth) - Math.log(a1.netWorth));
      return a1.percentile + t * (a2.percentile - a1.percentile);
    }
  }

  return 0;
}

/**
 * Return the highest wealth stage whose minPercentile ≤ the given percentile.
 */
export function getWealthStage(percentile: number): WealthStage {
  let result = STAGES[0];
  for (const stage of STAGES) {
    if (percentile >= stage.minPercentile) {
      result = stage;
    }
  }
  return result;
}

/**
 * Return the first milestone greater than the current net worth, or null if beyond all.
 */
export function getNextMilestone(netWorth: number): number | null {
  for (const m of MILESTONES) {
    if (m > netWorth) return m;
  }
  return null;
}

/**
 * Compute progress (0–100) between previous and next milestone.
 * Returns 100 if no next milestone exists.
 */
export function getProgress(netWorth: number): number {
  const next = getNextMilestone(netWorth);
  if (next === null) return 100;

  // Previous milestone is the last milestone <= netWorth, or 0
  let prev = 0;
  for (const m of MILESTONES) {
    if (m <= netWorth) prev = m;
    else break;
  }

  const range = next - prev;
  if (range <= 0) return 100;
  return ((netWorth - prev) / range) * 100;
}

/**
 * Generate a human-readable insight message.
 */
export function getInsightMessage(percentile: number, netWorth: number): string {
  const pRounded = Math.round(percentile);
  const next = getNextMilestone(netWorth);

  if (next === null) {
    return `You're ahead of ${pRounded}% of Indians. You've surpassed all major milestones — exceptional position!`;
  }

  // Find what stage the next milestone's percentile would put them in
  const nextPercentile = getPercentile(next);
  const nextStage = getWealthStage(nextPercentile);
  const currentStage = getWealthStage(percentile);

  if (nextStage.name !== currentStage.name) {
    return `You're ahead of ${pRounded}% of Indians. Reach ${formatINR(next)} to move to ${nextStage.name}.`;
  }

  return `You're ahead of ${pRounded}% of Indians. Next milestone: ${formatINR(next)}.`;
}

/**
 * Compute the full wealth percentile result for a given net worth.
 */
export function getWealthPercentileResult(netWorth: number): WealthPercentileResult {
  const percentile = getPercentile(netWorth);
  const stage = getWealthStage(percentile);
  const nextMilestone = getNextMilestone(netWorth);
  const progressToNext = getProgress(netWorth);
  const insightMessage = getInsightMessage(percentile, netWorth);

  const milestonesStatus: MilestoneStatus[] = MILESTONES.map((amount) => {
    const milestonePercentile = getPercentile(amount);
    const reached = netWorth >= amount;
    const isNext = amount === nextMilestone;
    return {
      amount,
      percentile: Math.round(milestonePercentile),
      reached,
      isNext,
    };
  });

  return {
    netWorth,
    percentile,
    stage,
    nextMilestone,
    progressToNext,
    insightMessage,
    milestonesStatus,
  };
}

// Re-export for component use
export { formatINR as formatINRPublic, ordinal, STAGES };
