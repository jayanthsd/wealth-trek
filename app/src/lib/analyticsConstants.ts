// ---------------------------------------------------------------------------
// Analytics Constants — single source of truth for all dimension thresholds
// ---------------------------------------------------------------------------

export const INFLATION_RATE = 5.5; // percent, Indian CPI benchmark

export const ASSET_RETURNS: Record<string, number> = {
  sb_hdfc: 3.0,
  sb_kotak: 3.0,
  ppf: 7.1,
  mf: 12.5,
  gold: 8.5,
  silver: 7.5,
  self_occupied_home: 0, // consumption asset, not return-generating
  real_estate: 7.0,
  stocks: 13.0,
  pf: 8.15,
  fd: 6.5, // fixed deposits (not in original spec but present in app)
};

export const ASSET_LABELS: Record<string, string> = {
  sb_hdfc: "SB Account (HDFC)",
  sb_kotak: "SB Account (Kotak)",
  ppf: "PPF",
  mf: "Mutual Funds",
  gold: "Gold",
  silver: "Silver",
  self_occupied_home: "Self-Occupied Home",
  real_estate: "Real Estate",
  stocks: "Stocks",
  pf: "Provident Fund",
  fd: "Fixed Deposit",
};

export const DEBT_CLASSIFICATION: Record<string, "productive" | "consumptive"> = {
  home_loan: "productive",
  mortgage_loan: "productive",
  credit_card: "consumptive",
  topup_loan: "consumptive",
  car_loan: "consumptive",
  bike_loan: "consumptive",
  personal_loan: "consumptive",
  education_loan: "productive",
};

export const LIABILITY_LABELS: Record<string, string> = {
  home_loan: "Home Loan",
  mortgage_loan: "Mortgage Loan",
  credit_card: "Credit Card",
  topup_loan: "Top-up Loan",
  car_loan: "Car Loan",
  bike_loan: "Bike Loan",
  personal_loan: "Personal Loan",
  education_loan: "Education Loan",
};

export const PPF_MAX_ANNUAL = 150000;
export const LTCG_FREE_THRESHOLD = 125000;
export const SB_INTEREST_EXEMPTION = 10000; // 50000 for seniors
export const RETIREMENT_CORPUS_MULTIPLIER = 25;
export const MIN_HEALTH_COVER_TIER1 = 1000000;
export const MIN_TERM_COVER_INCOME_MULTIPLE = 10;

export const PROJECTION_RATES = {
  conservative: 6.0,
  base: 10.0,
  optimistic: 13.0,
};

export const REAL_RETURN_THRESHOLDS = {
  red: 0, // real return below 0% → wealth destroyer
  amber: 2.0, // real return 0–2% → weak
  green: 2.0, // real return above 2% → healthy
};

export const CONSUMPTIVE_DEBT_THRESHOLDS = {
  green: 10, // consumptive debt < 10% of total liabilities
  amber: 25, // 10–25%
  red: 25, // above 25%
};

export const SUB_INFLATION_PORTFOLIO_ALERT = 40;
// alert if more than 40% of total assets (by value) sit in red+amber assets

export const REAL_ASSET_MAX = 30;
// alert if real assets (gold + silver + real_estate + self_occupied_home)
// exceed 30% of total investable assets

// ---------------------------------------------------------------------------
// Statement type → balance sheet key mapping
// ---------------------------------------------------------------------------

export const STATEMENT_TO_ASSET_KEY: Record<string, string> = {
  "Savings Bank Account": "sb_hdfc", // combined SB — same return rate
  "Fixed Deposit": "fd",
  PPF: "ppf",
  "Mutual Fund": "mf",
  "Stock Holdings": "stocks",
  "Real Estate": "real_estate",
  "Gold/Jewellery": "gold",
  Silver: "silver",
  "Provident Fund": "pf",
  "Self-Occupied Home": "self_occupied_home",
};

export const STATEMENT_TO_LIABILITY_KEY: Record<string, string> = {
  "Home Loan": "home_loan",
  "Credit Card Outstanding": "credit_card",
  "Car Loan": "car_loan",
  "Bike Loan": "bike_loan",
  "Top-up Loan": "topup_loan",
  "Mortgage Loan": "mortgage_loan",
  "Personal Loan": "personal_loan",
  "Education Loan": "education_loan",
};
