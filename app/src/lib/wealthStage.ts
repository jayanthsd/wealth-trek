import { StageConfig, WealthStage } from "@/types";

// ---------------------------------------------------------------------------
// Stage Definitions
// ---------------------------------------------------------------------------

export const ALL_STAGES: StageConfig[] = [
  {
    id: "foundation",
    label: "Foundation",
    range: [0, 1_000_000],
    color: "emerald",
    mindset: "Avoid financial fragility",
    goal: "Build safety nets and eliminate toxic debt",
    stageIndex: 0,
    scoreLabel: "Financial Stability Score",
  },
  {
    id: "stability",
    label: "Stability",
    range: [1_000_000, 2_500_000],
    color: "yellow",
    mindset: "Don't derail progress",
    goal: "Build consistency and protect downside",
    stageIndex: 1,
    scoreLabel: "Consistency Score",
  },
  {
    id: "acceleration",
    label: "Acceleration",
    range: [2_500_000, 10_000_000],
    color: "orange",
    mindset: "Time in market matters now",
    goal: "Compound aggressively with discipline",
    stageIndex: 2,
    scoreLabel: "Compounding Rate Score",
  },
  {
    id: "optimization",
    label: "Optimization",
    range: [10_000_000, 35_000_000],
    color: "blue",
    mindset: "You can lose big now if careless",
    goal: "Protect and optimize growth",
    stageIndex: 3,
    scoreLabel: "Diversification Score",
  },
  {
    id: "preservation",
    label: "Preservation",
    range: [35_000_000, 100_000_000],
    color: "violet",
    mindset: "Don't give back what you've built",
    goal: "Preserve capital and reduce volatility",
    stageIndex: 4,
    scoreLabel: "Capital Preservation Score",
  },
];

// ---------------------------------------------------------------------------
// Classification
// ---------------------------------------------------------------------------

export function classifyWealthStage(netWorth: number): StageConfig {
  if (netWorth < ALL_STAGES[0].range[1]) return ALL_STAGES[0]; // foundation
  if (netWorth < ALL_STAGES[1].range[1]) return ALL_STAGES[1]; // stability
  if (netWorth < ALL_STAGES[2].range[1]) return ALL_STAGES[2]; // acceleration
  if (netWorth < ALL_STAGES[3].range[1]) return ALL_STAGES[3]; // optimization
  return ALL_STAGES[4]; // preservation (includes >= 10Cr)
}

// ---------------------------------------------------------------------------
// Transition Detection
// ---------------------------------------------------------------------------

export function detectStageTransition(
  currentNW: number,
  previousNW: number
): {
  currentStage: StageConfig;
  previousStage: StageConfig;
  transitioned: boolean;
} {
  const currentStage = classifyWealthStage(currentNW);
  const previousStage = classifyWealthStage(previousNW);
  return {
    currentStage,
    previousStage,
    transitioned: currentStage.id !== previousStage.id,
  };
}

// ---------------------------------------------------------------------------
// Progress Toward Next Stage
// ---------------------------------------------------------------------------

export function computeStageProgress(netWorth: number): number {
  const stage = classifyWealthStage(netWorth);

  // Final stage → 100%
  if (stage.stageIndex === ALL_STAGES.length - 1) return 100;

  const nextStage = ALL_STAGES[stage.stageIndex + 1];
  const rangeMin = stage.range[0];
  const rangeMax = nextStage.range[0]; // next stage's min = current stage's effective max

  if (rangeMax <= rangeMin) return 100;

  const progress = ((netWorth - rangeMin) / (rangeMax - rangeMin)) * 100;
  return Math.max(0, Math.min(100, Math.round(progress * 10) / 10));
}
