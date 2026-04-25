import {
  classifyWealthStage,
  detectStageTransition,
  computeStageProgress,
  ALL_STAGES,
} from "@/lib/wealthStage";

describe("classifyWealthStage", () => {
  it("returns foundation for net worth 500,000", () => {
    const stage = classifyWealthStage(500_000);
    expect(stage.id).toBe("foundation");
    expect(stage.label).toBe("Foundation");
    expect(stage.color).toBe("emerald");
    expect(stage.mindset).toBe("Avoid financial fragility");
  });

  it("returns stability at exactly ₹10L boundary", () => {
    expect(classifyWealthStage(1_000_000).id).toBe("stability");
  });

  it("returns acceleration for ₹50L", () => {
    expect(classifyWealthStage(5_000_000).id).toBe("acceleration");
  });

  it("returns optimization for ₹2Cr", () => {
    expect(classifyWealthStage(20_000_000).id).toBe("optimization");
  });

  it("returns preservation for ₹5Cr", () => {
    expect(classifyWealthStage(50_000_000).id).toBe("preservation");
  });

  it("returns foundation for negative net worth", () => {
    expect(classifyWealthStage(-200_000).id).toBe("foundation");
  });

  it("returns preservation for net worth above ₹10Cr", () => {
    expect(classifyWealthStage(150_000_000).id).toBe("preservation");
  });

  it("returns foundation for zero net worth", () => {
    expect(classifyWealthStage(0).id).toBe("foundation");
  });

  it("returns stability at upper boundary (just below ₹25L)", () => {
    expect(classifyWealthStage(2_499_999).id).toBe("stability");
  });

  it("returns acceleration at exactly ₹25L", () => {
    expect(classifyWealthStage(2_500_000).id).toBe("acceleration");
  });

  it("returns optimization at exactly ₹1Cr", () => {
    expect(classifyWealthStage(10_000_000).id).toBe("optimization");
  });

  it("returns preservation at exactly ₹3.5Cr", () => {
    expect(classifyWealthStage(35_000_000).id).toBe("preservation");
  });

  it("returns correct stageIndex for all stages", () => {
    expect(classifyWealthStage(500_000).stageIndex).toBe(0);
    expect(classifyWealthStage(1_500_000).stageIndex).toBe(1);
    expect(classifyWealthStage(5_000_000).stageIndex).toBe(2);
    expect(classifyWealthStage(20_000_000).stageIndex).toBe(3);
    expect(classifyWealthStage(50_000_000).stageIndex).toBe(4);
  });
});

describe("detectStageTransition", () => {
  it("detects stage advancement from foundation to stability", () => {
    const result = detectStageTransition(1_100_000, 900_000);
    expect(result.transitioned).toBe(true);
    expect(result.previousStage.id).toBe("foundation");
    expect(result.currentStage.id).toBe("stability");
  });

  it("returns false when stage unchanged", () => {
    const result = detectStageTransition(800_000, 500_000);
    expect(result.transitioned).toBe(false);
    expect(result.currentStage.id).toBe("foundation");
    expect(result.previousStage.id).toBe("foundation");
  });

  it("detects downward transition", () => {
    const result = detectStageTransition(900_000, 1_100_000);
    expect(result.transitioned).toBe(true);
    expect(result.previousStage.id).toBe("stability");
    expect(result.currentStage.id).toBe("foundation");
  });
});

describe("computeStageProgress", () => {
  it("returns 50% for halfway through foundation", () => {
    expect(computeStageProgress(500_000)).toBe(50);
  });

  it("returns 95% near stability boundary", () => {
    expect(computeStageProgress(950_000)).toBe(95);
  });

  it("returns 100% for preservation stage", () => {
    expect(computeStageProgress(50_000_000)).toBe(100);
  });

  it("returns 0% at start of a stage", () => {
    expect(computeStageProgress(0)).toBe(0);
  });

  it("clamps to 0% for negative net worth", () => {
    expect(computeStageProgress(-200_000)).toBe(0);
  });
});

describe("ALL_STAGES", () => {
  it("contains exactly 5 stages ordered by stageIndex", () => {
    expect(ALL_STAGES).toHaveLength(5);
    ALL_STAGES.forEach((stage, i) => {
      expect(stage.stageIndex).toBe(i);
    });
  });

  it("all stages have non-empty required fields", () => {
    ALL_STAGES.forEach((stage) => {
      expect(stage.id).toBeTruthy();
      expect(stage.label).toBeTruthy();
      expect(stage.color).toBeTruthy();
      expect(stage.mindset).toBeTruthy();
      expect(stage.goal).toBeTruthy();
      expect(stage.scoreLabel).toBeTruthy();
      expect(stage.range).toHaveLength(2);
    });
  });
});
