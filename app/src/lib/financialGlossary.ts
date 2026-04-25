export interface GlossaryEntry {
  term: string;
  short: string;
  example?: string;
}

export const GLOSSARY: Record<string, GlossaryEntry> = {
  cagr: {
    term: "CAGR",
    short:
      "Compound Annual Growth Rate — a yearly percentage that smooths out your total return, as if it grew evenly every year.",
    example: "Going from ₹10L to ₹16L in 4 years is a CAGR of about 12%.",
  },
  "debt-to-asset": {
    term: "Debt-to-Asset",
    short:
      "The share of your assets that's funded by debt. Below 40% is comfortable; above 50% is risky.",
  },
  "debt-to-net-worth": {
    term: "Debt-to-Net-Worth",
    short:
      "How many times over your net worth would be wiped out if you had to clear every loan today.",
  },
  ltv: {
    term: "LTV (Loan-to-Value)",
    short:
      "The loan balance divided by the current value of the asset it's secured against. Lower is safer.",
  },
  pdr: {
    term: "PDR (Productive Debt Ratio)",
    short:
      "The share of your total debt that's productive (home, education) vs consumptive (credit card, personal loan).",
  },
  "idle-cash": {
    term: "Idle Cash",
    short:
      "Money sitting in low-yield places like savings accounts, earning less than inflation.",
  },
  "liquid-fund": {
    term: "Liquid Fund",
    short:
      "A mutual fund that invests in short-term bonds. Similar safety to a savings account but earns ~6–7% instead of ~3%.",
  },
  concentration: {
    term: "Concentration Risk",
    short:
      "Having too much of your wealth in one asset class. A downturn in that class hits you harder than a diversified portfolio.",
  },
  sip: {
    term: "SIP (Systematic Investment Plan)",
    short:
      "A fixed monthly investment into a mutual fund. Consistency beats timing the market.",
  },
  ppf: {
    term: "PPF (Public Provident Fund)",
    short:
      "A government-backed savings scheme with ~7% tax-free returns and a 15-year lock-in.",
  },
  "80c": {
    term: "Section 80C",
    short:
      "A tax deduction of up to ₹1.5 lakh a year for investments in PPF, ELSS, EPF, and a few others.",
  },
  nps: {
    term: "NPS (National Pension System)",
    short:
      "A retirement scheme with an extra ₹50,000 tax deduction on top of 80C. Returns are market-linked.",
  },
  hra: {
    term: "HRA (House Rent Allowance)",
    short:
      "A portion of salary that's tax-exempt if you pay rent and meet specific conditions.",
  },
  ltcg: {
    term: "LTCG (Long-Term Capital Gains)",
    short:
      "Profit on assets held for 1+ year (equity) or 2–3+ years (real estate, debt). Taxed at lower rates than short-term gains.",
  },
  "term-insurance": {
    term: "Term Insurance",
    short:
      "Pure life cover — pays out only if you die during the policy term. Cheapest form of life insurance; ideal cover is 10–15× annual income.",
  },
  "sub-inflation": {
    term: "Sub-Inflation Asset",
    short:
      "An asset earning less than the ~6% inflation rate, meaning it's losing purchasing power over time.",
  },
  "real-return": {
    term: "Real Return",
    short:
      "Your nominal return minus inflation. A 9% FD during 6% inflation is a 3% real return.",
  },
  "interest-coverage": {
    term: "Interest Coverage",
    short:
      "How many times over your income covers the interest on your loans. Higher is safer.",
  },
  "emergency-fund": {
    term: "Emergency Fund",
    short:
      "Cash (or liquid fund) covering 3–6 months of expenses. Your first line of defense against shocks.",
  },
  "productive-asset": {
    term: "Productive Asset",
    short:
      "An asset that actively earns returns (mutual funds, stocks, FDs) rather than sitting idle (excess cash, some jewellery).",
  },
};

export function lookupGlossary(key: string): GlossaryEntry | undefined {
  return GLOSSARY[key.toLowerCase()];
}
