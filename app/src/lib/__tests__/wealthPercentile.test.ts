import {
  getPercentile,
  getWealthStage,
  getNextMilestone,
  getProgress,
  getInsightMessage,
  getWealthPercentileResult,
} from "../wealthPercentile";

describe("getPercentile", () => {
  it("returns 0 for zero net worth", () => {
    expect(getPercentile(0)).toBe(0);
  });

  it("returns 0 for negative net worth", () => {
    expect(getPercentile(-500000)).toBe(0);
  });

  it("returns 50 at the first anchor (300000)", () => {
    expect(getPercentile(300000)).toBeCloseTo(50, 1);
  });

  it("returns 75 at the second anchor (1000000)", () => {
    expect(getPercentile(1000000)).toBeCloseTo(75, 1);
  });

  it("returns 99 at the highest anchor (35000000)", () => {
    expect(getPercentile(35000000)).toBeCloseTo(99, 1);
  });

  it("interpolates logarithmically between anchors", () => {
    const p = getPercentile(500000);
    expect(p).toBeGreaterThan(50);
    expect(p).toBeLessThan(75);
  });

  it("scales below lowest anchor (0-50)", () => {
    const p = getPercentile(150000);
    expect(p).toBeGreaterThan(0);
    expect(p).toBeLessThan(50);
  });

  it("caps at 99.9 for very high net worth", () => {
    const p = getPercentile(1000000000000); // 1 trillion
    expect(p).toBeLessThanOrEqual(99.9);
  });

  it("grows slowly above highest anchor", () => {
    const p1 = getPercentile(50000000);
    const p2 = getPercentile(100000000);
    expect(p2).toBeGreaterThan(p1);
    expect(p2).toBeLessThanOrEqual(99.9);
  });
});

describe("getWealthStage", () => {
  it("returns 'Starting Out' for percentile 0", () => {
    expect(getWealthStage(0).name).toBe("Starting Out");
  });

  it("returns 'Building' for percentile 30", () => {
    expect(getWealthStage(30).name).toBe("Building");
  });

  it("returns 'Steady' for percentile 50", () => {
    expect(getWealthStage(50).name).toBe("Steady");
  });

  it("returns 'Flourishing' for percentile 82", () => {
    expect(getWealthStage(82).name).toBe("Flourishing");
  });

  it("returns 'Thriving' for percentile 90", () => {
    expect(getWealthStage(90).name).toBe("Thriving");
  });

  it("returns 'Abundant' for percentile 95", () => {
    expect(getWealthStage(95).name).toBe("Abundant");
  });

  it("returns highest matching stage at boundary", () => {
    expect(getWealthStage(85).name).toBe("Thriving");
  });
});

describe("getNextMilestone", () => {
  it("returns first milestone above net worth", () => {
    expect(getNextMilestone(500000)).toBe(1000000);
  });

  it("returns 300000 for low net worth", () => {
    expect(getNextMilestone(100000)).toBe(300000);
  });

  it("returns null when above all milestones", () => {
    expect(getNextMilestone(200000000)).toBeNull();
  });

  it("returns next milestone when at exact milestone value", () => {
    expect(getNextMilestone(1000000)).toBe(2500000);
  });
});

describe("getProgress", () => {
  it("returns 100 when no next milestone", () => {
    expect(getProgress(200000000)).toBe(100);
  });

  it("returns 0 at a milestone boundary", () => {
    expect(getProgress(1000000)).toBeCloseTo(0, 0);
  });

  it("returns midpoint progress", () => {
    // Between 1000000 and 2500000, at 1750000
    const p = getProgress(1750000);
    expect(p).toBeCloseTo(50, 0);
  });

  it("returns progress from 0 when below first milestone", () => {
    const p = getProgress(150000);
    expect(p).toBeCloseTo(50, 0); // 150000 / 300000 * 100
  });
});

describe("getInsightMessage", () => {
  it("includes percentile in message", () => {
    const msg = getInsightMessage(82, 1500000);
    expect(msg).toContain("82%");
  });

  it("returns congratulatory message when beyond all milestones", () => {
    const msg = getInsightMessage(99.5, 200000000);
    expect(msg).toContain("surpassed all major milestones");
  });

  it("mentions next milestone when applicable", () => {
    const msg = getInsightMessage(60, 500000);
    expect(msg).toContain("₹10L");
  });
});

describe("getWealthPercentileResult", () => {
  it("returns complete result object", () => {
    const result = getWealthPercentileResult(1500000);
    expect(result.netWorth).toBe(1500000);
    expect(result.percentile).toBeGreaterThan(75);
    expect(result.percentile).toBeLessThan(90);
    expect(result.stage.name).toBe("Flourishing");
    expect(result.nextMilestone).toBe(2500000);
    expect(result.progressToNext).toBeGreaterThan(0);
    expect(result.progressToNext).toBeLessThan(100);
    expect(result.insightMessage).toBeTruthy();
    expect(result.milestonesStatus).toHaveLength(6);
  });

  it("marks reached milestones correctly", () => {
    const result = getWealthPercentileResult(1500000);
    expect(result.milestonesStatus[0].reached).toBe(true); // 300000
    expect(result.milestonesStatus[1].reached).toBe(true); // 1000000
    expect(result.milestonesStatus[2].reached).toBe(false); // 2500000
  });

  it("marks isNext correctly", () => {
    const result = getWealthPercentileResult(1500000);
    expect(result.milestonesStatus[2].isNext).toBe(true); // 2500000
    expect(result.milestonesStatus[1].isNext).toBe(false);
  });

  it("handles zero net worth", () => {
    const result = getWealthPercentileResult(0);
    expect(result.percentile).toBe(0);
    expect(result.stage.name).toBe("Starting Out");
    expect(result.nextMilestone).toBe(300000);
  });
});
