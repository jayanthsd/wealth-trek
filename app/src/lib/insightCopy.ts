import type { InsightItem } from "@/types";

type CopyRule = {
  plainTitle?: string | ((item: InsightItem) => string);
  plainExplanation?: string;
  suggestedAction?: string | ((item: InsightItem) => string | undefined);
  benchmark?: InsightItem["benchmark"];
};

const COPY: Record<string, CopyRule> = {
  "growth.nominal-delta": {
    plainTitle: (i) => ((i.metricValue ?? 0) >= 0 ? "Your wealth grew this period" : "Your wealth shrunk this period"),
    plainExplanation:
      "This is the raw change in your total wealth since your last snapshot — before adjusting for inflation.",
    suggestedAction: (i) =>
      (i.metricValue ?? 0) < 0
        ? "Check which assets declined. Market dips are normal, but persistent shrinkage needs a spending review."
        : undefined,
  },

  "growth.real-delta": {
    plainTitle: (i) => ((i.metricValue ?? 0) >= 0 ? "You beat inflation" : "Inflation ate your gains"),
    plainExplanation:
      "Prices rise ~6% a year in India. If your wealth grows slower than that, you're losing purchasing power even when the number on paper looks bigger.",
    suggestedAction: (i) =>
      (i.metricValue ?? 0) < 0
        ? "Shift idle savings into assets that historically beat inflation — equity mutual funds, index funds, or PPF."
        : undefined,
  },

  "growth.cagr": {
    plainTitle: "How fast your wealth is compounding",
    plainExplanation:
      "CAGR smooths your gains into a single yearly percentage. A healthy long-term CAGR for a diversified portfolio is 10–12%.",
  },

  "growth.asset-class-underperformers": {
    plainTitle: "Some investments are lagging",
    plainExplanation:
      "When one part of your portfolio falls while the rest grows, it may be a dated asset or a class that needs rebalancing.",
    suggestedAction:
      "Review whether the dip is temporary market movement or a signal to rebalance toward stronger-performing classes.",
  },

  "growth.asset-class-all-growing": {
    plainTitle: "Every bucket is growing",
    plainExplanation: "All major asset classes you hold moved up together — a sign of broad tailwinds.",
  },

  "leverage.debt-to-asset": {
    plainTitle: "How much of what you own is funded by debt",
    plainExplanation:
      "If debt is more than half of what you own, a job loss or rate hike can squeeze you hard. Below 40% is comfortable.",
    suggestedAction: (i) =>
      (i.metricValue ?? 0) >= 0.5
        ? "Pause new borrowing and aggressively pay down your highest-interest loan first."
        : (i.metricValue ?? 0) >= 0.4
          ? "You're in the caution zone — avoid taking on new loans until this ratio drops."
          : undefined,
    benchmark: { warningAt: 0.4, criticalAt: 0.5, max: 1 },
  },

  "leverage.debt-to-nw": {
    plainTitle: "Debt vs what you've built",
    plainExplanation:
      "This shows how many times over your net worth would be wiped if you had to clear every loan today. Keep it under 1.5×.",
    suggestedAction: (i) =>
      (i.metricValue ?? 0) >= 1.5
        ? "Your debt is outpacing your wealth. Redirect any bonuses or windfalls toward loan prepayment."
        : undefined,
    benchmark: { warningAt: 1.5, criticalAt: 3, max: 5 },
  },

  "leverage.interest-coverage": {
    plainTitle: "Can your income comfortably cover loan interest?",
    plainExplanation:
      "If interest payments swallow too much of your income, you have little left to invest or absorb shocks.",
    suggestedAction: "Add monthly income and total EMIs in Advanced Inputs to unlock this.",
  },

  "leverage.debt-drag": {
    plainTitle: "Are your loans costing more than your investments earn?",
    plainExplanation:
      "If your loan interest is higher than your investment returns, you're effectively losing money by investing instead of prepaying.",
    suggestedAction: "Needs average loan rate and asset yield data — planned for a future update.",
  },

  "liquidity.coverage-ratio": {
    plainTitle: "Can you handle short-term bills without selling investments?",
    plainExplanation:
      "This checks whether cash-like assets cover short-term debts (credit card, personal loan). Below 1× means you could face a cash crunch.",
    suggestedAction: (i) =>
      (i.metricValue ?? Infinity) < 1
        ? "Park 1–2 months of expenses in a savings account or liquid fund before pushing more into long-term investments."
        : undefined,
    benchmark: { warningAt: 1.5, criticalAt: 1, inverted: true, max: 5 },
  },

  "liquidity.emergency-fund": {
    plainTitle: "How many months of expenses you can cover",
    plainExplanation:
      "A solid emergency fund covers 3–6 months of expenses. It's the single biggest protection against a job loss or medical event.",
    suggestedAction: "Add your monthly expenses in Advanced Inputs to see your runway.",
  },

  "liquidity.concentration": {
    plainTitle: "How diversified your portfolio is",
    plainExplanation:
      "If one asset class is more than 60% of your wealth, a downturn in that class can hit you disproportionately hard.",
    suggestedAction: (i) =>
      (i.metricValue ?? 0) >= 0.5
        ? "Gradually trim the largest class — direct new investments into under-represented buckets until it rebalances."
        : undefined,
    benchmark: { warningAt: 0.5, criticalAt: 0.6, max: 1 },
  },

  "efficiency.idle-cash": {
    plainTitle: "Money sleeping in savings accounts",
    plainExplanation:
      "Savings accounts earn ~3%. Liquid funds earn ~6–7% with similar safety. Idle cash quietly loses to inflation.",
    suggestedAction: (i) =>
      (i.metricValue ?? 0) > 0.15
        ? "Keep ~1 month of expenses in savings; move the rest into a liquid mutual fund. Same access, better returns."
        : undefined,
    benchmark: { warningAt: 0.15, criticalAt: 0.3, max: 1 },
  },

  "efficiency.turnover": {
    plainTitle: "How much of your wealth is actively earning",
    plainExplanation:
      "Income-producing assets (mutual funds, stocks, FDs) compound over time. Idle cash and non-earning assets don't.",
    suggestedAction: (i) =>
      (i.metricValue ?? 1) < 0.3
        ? "Aim for 50%+ of your assets in return-generating instruments. Start with an index fund SIP if you're unsure where."
        : undefined,
    benchmark: { warningAt: 0.3, criticalAt: 0.15, inverted: true, max: 1 },
  },

  "risk.ltv": {
    plainTitle: "Are your secured loans under water?",
    plainExplanation:
      "Loan-to-Value checks if your secured loans (home, car) exceed the current value of the asset. High LTV means refinancing risk.",
    suggestedAction: "Needs loan-to-asset mapping — planned for a future update.",
  },

  "risk.insurance-gap": {
    plainTitle: "Are your assets adequately insured?",
    plainExplanation:
      "Compares insured amounts against asset values to spot under-insurance — a silent risk most people carry.",
    suggestedAction: "Needs insurance coverage data — planned for a future update.",
  },

  "behavior.staleness": {
    plainTitle: "How recent your data is",
    plainExplanation:
      "Your insights are only as accurate as your latest snapshot. Monthly updates give the clearest, most actionable picture.",
    suggestedAction: (i) =>
      (i.metricValue ?? 0) > 45
        ? "Take 5 minutes to record a fresh snapshot in the Calculator."
        : undefined,
  },

  "behavior.savings-consistency": {
    plainTitle: "Are you saving steadily or in bursts?",
    plainExplanation:
      "Small consistent deposits compound faster than occasional large ones — and they're easier to sustain through life changes.",
    suggestedAction: (i) =>
      (i.metricValue ?? 0) > 0.5
        ? "Automate a monthly SIP for a fixed amount. Consistency beats amount at every wealth stage."
        : undefined,
  },

  "inflation_audit.summary": {
    plainTitle: "Assets losing to inflation",
    plainExplanation:
      "Some of your holdings earn less than the ~6% inflation rate — meaning you're quietly getting poorer in real terms even as the balance grows.",
    suggestedAction:
      "Shift sub-inflation holdings into equity mutual funds, PPF, or inflation-linked bonds over the next few months.",
  },

  "gap_analysis.summary": {
    plainTitle: "Missing or over-concentrated buckets",
    plainExplanation:
      "A resilient portfolio covers emergencies, equity growth, tax-advantaged savings, and long-term fixed income. Gaps or over-weights create hidden fragility.",
    suggestedAction: "Review the missing buckets below and fill them one at a time — don't try to overhaul everything at once.",
  },

  "debt_quality.summary": {
    plainTitle: "Good debt vs bad debt",
    plainExplanation:
      "Productive debt (home, education) can build wealth over time. Consumptive debt (credit card, personal loan) drains it — often at 3–4× the interest rate.",
    suggestedAction: "Clear consumptive debt first, even if the balance looks small — the interest compounds viciously.",
  },

  "tax_efficiency.summary": {
    plainTitle: "Are you paying more tax than you need to?",
    plainExplanation:
      "Small tax moves — 80C, NPS, HRA, LTCG harvesting — can save lakhs a year without changing what you actually invest in.",
  },

  "trajectory.summary": {
    plainTitle: "Are you on track for retirement?",
    plainExplanation:
      "Projects your current wealth plus monthly savings forward to your target retirement age. If you'll fall short, you need to save more, earn more, or retire later.",
    suggestedAction: "If there's a gap, try increasing your monthly SIP first — even ₹5,000 more now compounds hugely over 20 years.",
  },

  "protection.summary": {
    plainTitle: "Is your family financially safe if something happens to you?",
    plainExplanation:
      "Term insurance should cover 10–15× your annual income. Health insurance protects against medical bankruptcy — India's #1 cause of sudden poverty.",
    suggestedAction:
      "A ₹1 Cr term policy for a healthy 30-year-old costs ~₹10–15k/year. The cheapest high-leverage buy in personal finance.",
  },
};

export function enrichInsight(item: InsightItem): InsightItem {
  const rule = COPY[item.id];
  if (!rule) return item;

  const plainTitle =
    typeof rule.plainTitle === "function" ? rule.plainTitle(item) : rule.plainTitle;
  const suggestedAction =
    typeof rule.suggestedAction === "function"
      ? rule.suggestedAction(item)
      : rule.suggestedAction;

  return {
    ...item,
    plainTitle: plainTitle ?? item.plainTitle,
    plainExplanation: rule.plainExplanation ?? item.plainExplanation,
    suggestedAction: suggestedAction ?? item.suggestedAction,
    benchmark: rule.benchmark ?? item.benchmark,
  };
}
