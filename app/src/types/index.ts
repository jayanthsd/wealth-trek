export type Category = "asset" | "liability";

export interface StatementEntry {
  id: string;
  statementType: string;
  description: string;
  category: Category;
  closingBalance: number;
  ownershipPercentage: number;
  sourceDocumentId?: string;
}

export interface UserProfile {
  fullName: string;
  address: string;
  certificateDate: string;
  asOnDate: string;
}

export interface StatementTypePreset {
  label: string;
  category: Category;
}

export interface UploadedDocument {
  id: string;
  originalName: string;
  storedPath: string;
  fileType: string;
  size: number;
  uploadedAt: string;
}

export interface ExtractedEntry {
  statementType: string;
  description: string;
  category: Category;
  closingBalance: number;
}

export interface NetWorthSnapshot {
  id: string;
  date: string;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  entries: StatementEntry[];
  createdAt: string;
}

export interface FinancialGoal {
  id: string;
  title: string;
  description: string;
  targetAmount?: number;
  targetDate?: string;
  createdAt: string;
  status: "active" | "completed" | "paused";
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  suggestedGoal?: Omit<FinancialGoal, "id" | "createdAt" | "status">;
}

export type InsightDomain = "growth" | "leverage" | "liquidity" | "efficiency" | "risk" | "behavior" | "inflation_audit" | "gap_analysis" | "debt_quality" | "tax_efficiency" | "trajectory" | "protection";
export type InsightSeverity = "critical" | "warning" | "info" | "unavailable";
export type InsightTrend = "up" | "down" | "neutral";

export interface InsightItem {
  id: string;
  domain: InsightDomain;
  title: string;
  /** Short verdict-style headline in plain English (e.g. "You're holding too much idle cash"). Falls back to title if absent. */
  plainTitle?: string;
  description: string;
  /** One-sentence explanation of why this metric matters, written for non-finance users. */
  plainExplanation?: string;
  /** One concrete next step, ideally with a number (e.g. "Move ~₹2L into a liquid fund"). */
  suggestedAction?: string;
  severity: InsightSeverity;
  trend?: InsightTrend;
  metricValue?: number;
  metricLabel?: string;
  /** Thresholds for rendering a healthy/warning/critical gauge. Interpreted as fractions when metricValue is a ratio, or absolute otherwise. */
  benchmark?: {
    warningAt: number;
    criticalAt: number;
    /** If true, lower values are worse (e.g. productive-asset ratio). Default false. */
    inverted?: boolean;
    min?: number;
    max?: number;
  };
  unavailable?: boolean;
  unavailableReason?: string;
}

export interface InsightResult {
  summary: {
    total: number;
    critical: number;
    warnings: number;
    info: number;
  };
  domains: Record<InsightDomain, InsightItem[]>;
  advancedResults: AdvancedDimensionResults;
  computedAt: string;
}

// ---------------------------------------------------------------------------
// Advanced Inputs (collected via optional form)
// ---------------------------------------------------------------------------

export interface AdvancedInputs {
  monthly_income?: number;
  monthly_emi_total?: number;
  monthly_investment?: number;
  current_age?: number;
  retirement_age?: number;
  existing_term_cover?: number;
  existing_health_cover?: number;
  ppf_annual_contribution?: number;
  vpf_contribution?: number;
  monthly_sip_amount?: number;
  has_will_created?: boolean;
  has_international_funds?: boolean;
}

// ---------------------------------------------------------------------------
// Parsed Balance Sheet (extracted from snapshot entries)
// ---------------------------------------------------------------------------

export interface BalanceSheet {
  assets: Record<string, number>;
  liabilities: Record<string, number>;
  total_assets: number;
  total_liabilities: number;
}

// ---------------------------------------------------------------------------
// Dimension 7: Inflation-Adjusted Asset Audit
// ---------------------------------------------------------------------------

export interface InflationAuditAsset {
  key: string;
  label: string;
  balance: number;
  nominal_return: number;
  real_return: number;
  status: "red" | "amber" | "green";
}

export interface InflationAuditResult {
  per_asset: InflationAuditAsset[];
  sub_inflation_pct: number;
  sub_inflation_value: number;
  overall_flag: "ok" | "warn" | "alert";
  primary_alert: string;
}

// ---------------------------------------------------------------------------
// Dimension 8: Instrument Gap Analysis
// ---------------------------------------------------------------------------

export interface GapBucket {
  id: string;
  label: string;
  status: "ok" | "over" | "miss" | "nudge" | "info";
  current_pct: number;
  message: string;
}

export interface GapAnalysisResult {
  buckets: GapBucket[];
  gap_count: number;
  over_count: number;
  summary: string;
}

// ---------------------------------------------------------------------------
// Dimension 9: Debt Quality Score
// ---------------------------------------------------------------------------

export interface DebtBreakdownItem {
  name: string;
  amount: number;
  type: "productive" | "consumptive";
  effective_rate_note: string;
}

export interface DebtQualityResult {
  productive_total: number;
  consumptive_total: number;
  productive_pct: number;
  consumptive_pct: number;
  pdr: number;
  status: "green" | "amber" | "red";
  credit_card_flag: boolean;
  breakdown: DebtBreakdownItem[];
  primary_alert: string;
  secondary_alert: string | null;
}

// ---------------------------------------------------------------------------
// Dimension 10: Tax Efficiency Score
// ---------------------------------------------------------------------------

export interface TaxCheck {
  id: string;
  label: string;
  passed: boolean;
  message: string;
}

export interface TaxEfficiencyResult {
  checks: TaxCheck[];
  score: number;
  score_pct: number;
  grade: "A" | "B" | "C" | "D";
  top_action: string;
}

// ---------------------------------------------------------------------------
// Dimension 11: Net Worth Trajectory
// ---------------------------------------------------------------------------

export interface ProjectionScenario {
  rate: number;
  corpus: number;
  vs_target_pct: number;
}

export interface TrajectoryResult {
  current_net_worth: number;
  investable_net_worth: number;
  years_to_retirement: number;
  monthly_surplus: number;
  blended_return: number;
  projections: {
    conservative: ProjectionScenario;
    base: ProjectionScenario;
    optimistic: ProjectionScenario;
  };
  target_corpus: number;
  on_track: boolean;
  gap_amount: number;
  gap_monthly_sip: number;
  primary_alert: string;
}

// ---------------------------------------------------------------------------
// Dimension 12: Protection Layer Check
// ---------------------------------------------------------------------------

export interface ProtectionResult {
  total_liabilities: number;
  annual_income: number;
  recommended_term_cover: number;
  existing_term_cover: number | null;
  term_cover_gap: number | null;
  coverage_pct: number | null;
  term_status: "adequate" | "low" | "gap" | "not_entered";
  health_status: "adequate" | "low" | "not_entered";
  alerts: string[];
}

// ---------------------------------------------------------------------------
// Combined advanced dimension results
// ---------------------------------------------------------------------------

export interface AdvancedDimensionResults {
  inflationAudit?: InflationAuditResult;
  gapAnalysis?: GapAnalysisResult;
  debtQuality?: DebtQualityResult;
  taxEfficiency?: TaxEfficiencyResult;
  trajectory?: TrajectoryResult;
  protection?: ProtectionResult;
}

// ---------------------------------------------------------------------------
// Wealth Journey — Stage Classification & Checklists
// ---------------------------------------------------------------------------

export type WealthStage = "foundation" | "stability" | "acceleration" | "optimization" | "preservation";

export interface StageConfig {
  id: WealthStage;
  label: string;
  range: [number, number];
  color: string;
  mindset: string;
  goal: string;
  stageIndex: number;
  scoreLabel: string;
}

export type ChecklistCategory = "protection" | "growth" | "behavior" | "tax" | "diversification";
export type ChecklistStatus = "done" | "partial" | "todo" | "not_applicable";

export interface ChecklistItemDef {
  id: string;
  stage: WealthStage;
  label: string;
  category: ChecklistCategory;
  weight: number;
}

export interface ChecklistResult {
  id: string;
  label: string;
  category: ChecklistCategory;
  weight: number;
  status: ChecklistStatus;
  score: number;
  message: string;
  actionHint?: string;
}

export interface ChecklistContext {
  netWorth: number;
  stage: WealthStage;
  balanceSheet: BalanceSheet;
  advancedInputs?: AdvancedInputs;
  insightResult: InsightResult;
  snapshots: NetWorthSnapshot[];
}

export interface StageHistoryEntry {
  date: string;
  stage: WealthStage;
  score: number;
}

export interface JourneyProjection {
  monthsToNextStage: number | null;
  projectedDate: string | null;
  avgMonthlyGrowth: number;
}

export interface JourneyResult {
  stage: StageConfig | null;
  previousStage?: StageConfig;
  transitioned: boolean;
  progress: number;
  checklist: ChecklistResult[];
  score: { value: number; label: string; insufficientData: boolean };
  stageHistory: StageHistoryEntry[];
  focusItem: ChecklistResult | null;
  projection: JourneyProjection | null;
  delta: { scoreDelta: number; netWorthDelta: number; previousDate: string } | null;
}

// ---------------------------------------------------------------------------
// Statement Type Presets
// ---------------------------------------------------------------------------

export const STATEMENT_TYPE_PRESETS: StatementTypePreset[] = [
  { label: "Savings Bank Account", category: "asset" },
  { label: "Fixed Deposit", category: "asset" },
  { label: "PPF", category: "asset" },
  { label: "Provident Fund", category: "asset" },
  { label: "Mutual Fund", category: "asset" },
  { label: "Stock Holdings", category: "asset" },
  { label: "Real Estate", category: "asset" },
  { label: "Self-Occupied Home", category: "asset" },
  { label: "Gold/Jewellery", category: "asset" },
  { label: "Silver", category: "asset" },
  { label: "Other Asset", category: "asset" },
  { label: "Home Loan", category: "liability" },
  { label: "Mortgage Loan", category: "liability" },
  { label: "Personal Loan", category: "liability" },
  { label: "Top-up Loan", category: "liability" },
  { label: "Car Loan", category: "liability" },
  { label: "Bike Loan", category: "liability" },
  { label: "Credit Card Outstanding", category: "liability" },
  { label: "Education Loan", category: "liability" },
  { label: "Other Liability", category: "liability" },
];
