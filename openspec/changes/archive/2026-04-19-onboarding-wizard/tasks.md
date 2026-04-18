## 1. Database & API for Popular Banks

- [x] 1.1 Create `popular_banks` table migration SQL: columns `id` (UUID, PK), `name` (TEXT, NOT NULL, UNIQUE), `sort_order` (INTEGER, NOT NULL DEFAULT 0), `created_at` (TIMESTAMPTZ, DEFAULT now()). No RLS needed — public reference data.
- [x] 1.2 Create seed SQL to insert the initial 14 banks: SBI, HDFC Bank, ICICI Bank, Axis Bank, Kotak Mahindra Bank, Bank of Baroda, PNB, Canara Bank, Union Bank, IndusInd Bank, IDFC First Bank, Yes Bank, Federal Bank, Bank of India — with sort_order 1–14
- [x] 1.3 Create `GET /api/banks` route that queries `popular_banks` table ordered by `sort_order` and returns `{ banks: { id, name }[] }`
- [x] 1.4 Create `useBanks` hook in `app/src/hooks/useBanks.ts` that fetches `/api/banks` on mount and returns `{ banks, loaded }`

## 2. Wizard Infrastructure

- [x] 2.1 Create `app/src/components/onboarding/` directory and the parent `OnboardingWizard.tsx` component with step state management, entries accumulation array, Quick Start / Complete Picture path filtering, progress bar, and back/forward navigation
- [x] 2.2 Define the step configuration array with `id`, `component`, `headline`, and `quickStart` flag for each step

## 3. Wizard Step Components

- [x] 3.1 Create `WelcomeStep.tsx` — welcome headline, Quick Start and Complete Picture path selection buttons, "I'll do this later" dismiss option
- [x] 3.2 Create `BankSavingsStep.tsx` — bank picker using `useBanks` hook (select + "Other" free-text fallback), closing balance input, add-another loop, skip option
- [x] 3.3 Create `DepositsStep.tsx` — type picker (Fixed Deposit, PPF, EPF), optional description, amount input, add-another loop, skip option
- [x] 3.4 Create `InvestmentsStep.tsx` — type picker (Mutual Fund, Stock Holdings, Gold/Jewellery), optional description, amount input, add-another loop, skip option
- [x] 3.5 Create `PropertyStep.tsx` — type picker (Real Estate, Vehicle), description, fair market value input, add-another loop, skip option
- [x] 3.6 Create `LoansStep.tsx` — type picker (Home Loan, Personal Loan, Car Loan, Education Loan), optional description, outstanding amount input, add-another loop, skip option
- [x] 3.7 Create `CreditCardsStep.tsx` — card description input, outstanding amount input, subtitle hint "Only outstanding balance, not your credit limit", add-another loop, skip option

## 4. Summary & Save

- [x] 4.1 Create `SummaryStep.tsx` — display total assets, total liabilities, net worth using `computeTotals`, celebratory animation, "Go to Dashboard" CTA
- [x] 4.2 Implement auto-save logic in `SummaryStep` or parent: call `bulkAddStatements` with all collected entries, then `saveSnapshot` with computed totals and today's date, with error handling and retry

## 5. Dashboard Integration

- [x] 5.1 Update `app/src/app/dashboard/page.tsx` to import `OnboardingWizard` instead of `FirstSnapshotOnboarding`, pass `firstName`, `onDismiss`, and required hooks (`useStatements`, `useNetWorthHistory`) as props or consume them inside the wizard
- [x] 5.2 Remove or deprecate `FirstSnapshotOnboarding.tsx` after verifying the wizard is wired in

## 6. Polish & Verification

- [x] 6.1 Add framer-motion `AnimatePresence` transitions between wizard steps (directional slide left/right)
- [x] 6.2 Verify step indicator updates correctly for both Quick Start (3 steps + welcome + summary) and Complete Picture (6 steps + welcome + summary) paths
- [x] 6.3 Verify all `StatementEntry` mappings produce correct `statementType`, `category`, `description`, and `ownershipPercentage: 100` for every entry type
- [x] 6.4 Test end-to-end: complete wizard → entries saved → snapshot created → dashboard renders with data
