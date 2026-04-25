"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";
import { Category } from "@/types";

// ---------------------------------------------------------------------------
// Banks list
// ---------------------------------------------------------------------------

const INDIAN_BANKS = [
  "State Bank of India (SBI)",
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "Punjab National Bank (PNB)",
  "Bank of Baroda",
  "Canara Bank",
  "Union Bank of India",
  "Bank of India",
  "IndusInd Bank",
  "IDFC First Bank",
  "Yes Bank",
  "Federal Bank",
  "RBL Bank",
  "Bandhan Bank",
  "Indian Bank",
  "Central Bank of India",
  "Indian Overseas Bank",
  "UCO Bank",
  "Bank of Maharashtra",
  "South Indian Bank",
  "Karur Vysya Bank",
  "City Union Bank",
  "AU Small Finance Bank",
  "Equitas Small Finance Bank",
  "Jana Small Finance Bank",
  "Other",
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Row = Record<string, string>;

interface EntryOut {
  statementType: string;
  description: string;
  category: Category;
  closingBalance: number;
  ownershipPercentage: number;
}

interface FieldDef {
  key: string;
  label: string;
  type: "text" | "number" | "select";
  options?: string[];
  placeholder?: string;
  optional?: boolean;
}

interface StepDef {
  id: string;
  title: string;
  subtitle: string;
  rowLabel: string;
  addLabel: string;
  fields: FieldDef[];
  toEntries: (rows: Row[]) => EntryOut[];
}

// ---------------------------------------------------------------------------
// Step Definitions
// ---------------------------------------------------------------------------

const BANK_STEP: StepDef = {
  id: "bank",
  title: "Let's start with your bank savings",
  subtitle: "Add each bank account you hold with its closing balance.",
  rowLabel: "Account",
  addLabel: "Add another account",
  fields: [
    { key: "bank", label: "Bank", type: "select", options: INDIAN_BANKS, optional: true },
    { key: "balance", label: "Closing Balance (₹)", type: "number", placeholder: "0" },
  ],
  toEntries: (rows) =>
    rows
      .filter((r) => Number(r.balance) > 0)
      .map((r) => ({
        statementType: "Savings Bank Account",
        description: r.bank?.trim() || "Bank Account",
        category: "asset",
        closingBalance: Number(r.balance),
        ownershipPercentage: 100,
      })),
};

// Quick Start: Fixed Deposits only (no PPF/PF)
const FD_QUICK_STEP: StepDef = {
  id: "fds-quick",
  title: "Any fixed deposits?",
  subtitle: "Add each FD with its current value.",
  rowLabel: "FD",
  addLabel: "Add another FD",
  fields: [
    { key: "description", label: "Description (optional)", type: "text", placeholder: "e.g. SBI FD", optional: true },
    { key: "balance", label: "Balance (₹)", type: "number", placeholder: "0" },
  ],
  toEntries: (rows) =>
    rows
      .filter((r) => Number(r.balance) > 0)
      .map((r) => ({
        statementType: "Fixed Deposit",
        description: r.description?.trim() || "Fixed Deposit",
        category: "asset",
        closingBalance: Number(r.balance),
        ownershipPercentage: 100,
      })),
};

// Quick Start: Real Estate only (Home / Plot)
const REAL_ESTATE_QUICK_STEP: StepDef = {
  id: "real-estate-quick",
  title: "Any real estate or property?",
  subtitle: "Home or plot — enter the current market value.",
  rowLabel: "Property",
  addLabel: "Add another property",
  fields: [
    {
      key: "type",
      label: "Type",
      type: "select",
      options: ["Self-Occupied Home", "Real Estate"],
    },
    { key: "description", label: "Description (optional)", type: "text", placeholder: "e.g. 2BHK Whitefield", optional: true },
    { key: "value", label: "Market Value (₹)", type: "number", placeholder: "0" },
  ],
  toEntries: (rows) =>
    rows
      .filter((r) => r.type && Number(r.value) > 0)
      .map((r) => ({
        statementType: r.type,
        description: r.description?.trim() || r.type,
        category: "asset",
        closingBalance: Number(r.value),
        ownershipPercentage: 100,
      })),
};

// Quick Start: Loans = Home / Car / Bike only
const LOANS_QUICK_STEP: StepDef = {
  id: "loans-quick",
  title: "Now let's record any loans",
  subtitle: "Add outstanding loan balances.",
  rowLabel: "Loan",
  addLabel: "Add another loan",
  fields: [
    {
      key: "type",
      label: "Type",
      type: "select",
      options: ["Home Loan", "Car Loan", "Bike Loan"],
    },
    { key: "description", label: "Description (optional)", type: "text", placeholder: "e.g. HDFC Home Loan", optional: true },
    { key: "outstanding", label: "Outstanding Amount (₹)", type: "number", placeholder: "0" },
  ],
  toEntries: (rows) =>
    rows
      .filter((r) => r.type && Number(r.outstanding) > 0)
      .map((r) => ({
        statementType: r.type,
        description: r.description?.trim() || r.type,
        category: "liability",
        closingBalance: Number(r.outstanding),
        ownershipPercentage: 100,
      })),
};

const CREDIT_CARDS_STEP: StepDef = {
  id: "credit-cards",
  title: "Any credit card balances you're carrying?",
  subtitle: "Only outstanding balance, not your credit limit.",
  rowLabel: "Card",
  addLabel: "Add another card",
  fields: [
    { key: "description", label: "Card Description", type: "text", placeholder: "e.g. HDFC Regalia" },
    { key: "outstanding", label: "Outstanding Amount (₹)", type: "number", placeholder: "0" },
  ],
  toEntries: (rows) =>
    rows
      .filter((r) => Number(r.outstanding) > 0)
      .map((r) => ({
        statementType: "Credit Card Outstanding",
        description: r.description?.trim() || "Credit Card",
        category: "liability",
        closingBalance: Number(r.outstanding),
        ownershipPercentage: 100,
      })),
};

// Complete Picture: FD + PPF + PF
const FD_SAVINGS_STEP: StepDef = {
  id: "fds-savings",
  title: "Fixed deposits & savings schemes",
  subtitle: "PPF, EPF, FDs — add current balances.",
  rowLabel: "Entry",
  addLabel: "Add another",
  fields: [
    { key: "type", label: "Type", type: "select", options: ["Fixed Deposit", "PPF", "Provident Fund"] },
    { key: "description", label: "Description (optional)", type: "text", placeholder: "e.g. SBI FD", optional: true },
    { key: "balance", label: "Balance (₹)", type: "number", placeholder: "0" },
  ],
  toEntries: (rows) =>
    rows
      .filter((r) => r.type && Number(r.balance) > 0)
      .map((r) => ({
        statementType: r.type,
        description: r.description?.trim() || r.type,
        category: "asset",
        closingBalance: Number(r.balance),
        ownershipPercentage: 100,
      })),
};

// Complete Picture: Mutual Funds, Stocks, Gold
const INVESTMENTS_STEP: StepDef = {
  id: "investments",
  title: "Any investments?",
  subtitle: "Mutual funds, stocks, gold — add them here.",
  rowLabel: "Entry",
  addLabel: "Add another",
  fields: [
    {
      key: "type",
      label: "Type",
      type: "select",
      options: ["Mutual Fund", "Stock Holdings", "Gold/Jewellery"],
    },
    { key: "description", label: "Description (optional)", type: "text", placeholder: "e.g. HDFC Balanced Fu", optional: true },
    { key: "amount", label: "Amount (₹)", type: "number", placeholder: "0" },
  ],
  toEntries: (rows) =>
    rows
      .filter((r) => r.type && Number(r.amount) > 0)
      .map((r) => ({
        statementType: r.type,
        description: r.description?.trim() || r.type,
        category: "asset",
        closingBalance: Number(r.amount),
        ownershipPercentage: 100,
      })),
};

// Complete Picture: Real Estate with more options
const REAL_ESTATE_COMPLETE_STEP: StepDef = {
  id: "real-estate-complete",
  title: "Real estate & property",
  subtitle: "Current market value of any property you own.",
  rowLabel: "Property",
  addLabel: "Add another property",
  fields: [
    { key: "type", label: "Type", type: "select", options: ["Self-Occupied Home", "Real Estate"] },
    { key: "description", label: "Description (optional)", type: "text", placeholder: "e.g. 2BHK Whitefield", optional: true },
    { key: "value", label: "Market Value (₹)", type: "number", placeholder: "0" },
  ],
  toEntries: (rows) =>
    rows
      .filter((r) => r.type && Number(r.value) > 0)
      .map((r) => ({
        statementType: r.type,
        description: r.description?.trim() || r.type,
        category: "asset",
        closingBalance: Number(r.value),
        ownershipPercentage: 100,
      })),
};

// Complete Picture: All loan types
const LOANS_COMPLETE_STEP: StepDef = {
  id: "loans-complete",
  title: "Now let's record any loans",
  subtitle: "Add outstanding loan balances.",
  rowLabel: "Loan",
  addLabel: "Add another loan",
  fields: [
    {
      key: "type",
      label: "Type",
      type: "select",
      options: ["Home Loan", "Car Loan", "Bike Loan", "Personal Loan", "Education Loan", "Mortgage Loan"],
    },
    { key: "description", label: "Description (optional)", type: "text", placeholder: "e.g. HDFC Home Loan", optional: true },
    { key: "outstanding", label: "Outstanding Amount (₹)", type: "number", placeholder: "0" },
  ],
  toEntries: (rows) =>
    rows
      .filter((r) => r.type && Number(r.outstanding) > 0)
      .map((r) => ({
        statementType: r.type,
        description: r.description?.trim() || r.type,
        category: "liability",
        closingBalance: Number(r.outstanding),
        ownershipPercentage: 100,
      })),
};

// Quick Start: Bank → FD → Real Estate → Loans (Home/Car/Bike) → Credit Cards
const QUICK_STEPS: StepDef[] = [
  BANK_STEP,
  FD_QUICK_STEP,
  REAL_ESTATE_QUICK_STEP,
  LOANS_QUICK_STEP,
  CREDIT_CARDS_STEP,
];

// Complete Picture: Bank → FD+PPF+PF → Investments → Real Estate → Loans (all) → Credit Cards
const COMPLETE_STEPS: StepDef[] = [
  BANK_STEP,
  FD_SAVINGS_STEP,
  INVESTMENTS_STEP,
  REAL_ESTATE_COMPLETE_STEP,
  LOANS_COMPLETE_STEP,
  CREDIT_CARDS_STEP,
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SnapshotTemplateWizardProps {
  mode: "quick" | "complete";
  onApply: (
    entries: Array<{
      statementType: string;
      description: string;
      category: Category;
      closingBalance: number;
      ownershipPercentage: number;
    }>
  ) => void;
  onSkip: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SnapshotTemplateWizard({ mode, onApply, onSkip }: SnapshotTemplateWizardProps) {
  const steps = mode === "quick" ? QUICK_STEPS : COMPLETE_STEPS;
  const total = steps.length;
  const modeLabel = mode === "quick" ? "Quick Start" : "Complete Picture";

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [stepData, setStepData] = useState<Row[][]>(() => steps.map(() => [{}]));

  const step = steps[currentStep];
  const rows = stepData[currentStep];
  const progress = ((currentStep + 1) / total) * 100;
  const isLastStep = currentStep === total - 1;

  const updateRow = useCallback(
    (rowIdx: number, key: string, value: string) => {
      setStepData((prev) =>
        prev.map((stepRows, si) =>
          si !== currentStep
            ? stepRows
            : stepRows.map((r, ri) => (ri === rowIdx ? { ...r, [key]: value } : r))
        )
      );
    },
    [currentStep]
  );

  const addRow = useCallback(() => {
    setStepData((prev) =>
      prev.map((stepRows, si) => (si === currentStep ? [...stepRows, {}] : stepRows))
    );
  }, [currentStep]);

  const removeRow = useCallback(
    (rowIdx: number) => {
      setStepData((prev) =>
        prev.map((stepRows, si) => {
          if (si !== currentStep) return stepRows;
          const filtered = stepRows.filter((_, i) => i !== rowIdx);
          return filtered.length > 0 ? filtered : [{}];
        })
      );
    },
    [currentStep]
  );

  function advance(data: Row[][]) {
    if (currentStep === total - 1) {
      const allEntries = steps.flatMap((s, i) => s.toEntries(data[i]));
      if (allEntries.length === 0) {
        onSkip();
      } else {
        onApply(allEntries);
      }
    } else {
      setDirection(1);
      setCurrentStep((s) => s + 1);
    }
  }

  function goNext() {
    advance(stepData);
  }

  function goBack() {
    if (currentStep === 0) {
      onSkip();
    } else {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
    }
  }

  function skipStep() {
    const cleared = stepData.map((s, i) => (i === currentStep ? [{}] : s));
    setStepData(cleared);
    advance(cleared);
  }

  const gridCols =
    step.fields.length === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : "grid-cols-1 sm:grid-cols-3";

  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col px-4 py-8 sm:py-12">
      {/* Progress header */}
      <div className="mx-auto w-full max-w-2xl mb-8">
        <div className="mb-3 flex items-center justify-between text-xs font-semibold text-foreground/55">
          <span>Step {currentStep + 1} of {total}</span>
          <span>{modeLabel}</span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/8">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Step card */}
      <div className="mx-auto w-full max-w-2xl flex-1">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={{
              enter: (d: number) => ({ opacity: 0, x: d * 48 }),
              center: { opacity: 1, x: 0 },
              exit: (d: number) => ({ opacity: 0, x: d * -48 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="surface-card rounded-3xl border border-white/8 shadow-glow p-7 sm:p-9"
          >
            {/* Title */}
            <h2 className="mb-1.5 text-2xl font-semibold text-foreground">{step.title}</h2>
            <p className="mb-8 text-sm leading-relaxed text-foreground/60">{step.subtitle}</p>

            {/* Rows */}
            <div className="space-y-7">
              {rows.map((row, rowIdx) => (
                <div key={rowIdx}>
                  <div className="mb-2.5 flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">
                      {step.rowLabel} {rowIdx + 1}
                    </p>
                    {rows.length > 1 && (
                      <button
                        onClick={() => removeRow(rowIdx)}
                        aria-label="Remove row"
                        className="flex h-6 w-6 items-center justify-center rounded-full text-foreground/35 transition-colors hover:bg-white/5 hover:text-foreground/70"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <div className={`grid gap-3 ${gridCols}`}>
                    {step.fields.map((field) => (
                      <FieldInput
                        key={field.key}
                        field={field}
                        value={row[field.key] ?? ""}
                        onChange={(v) => updateRow(rowIdx, field.key, v)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Add another row */}
            <button
              onClick={addRow}
              className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-primary/70 transition-colors hover:text-primary"
            >
              <Plus className="h-4 w-4" />
              {step.addLabel}
            </button>

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6">
              <button
                onClick={goBack}
                className="text-sm font-semibold text-foreground/55 transition-colors hover:text-foreground/85"
              >
                {currentStep === 0 ? "Cancel" : "Back"}
              </button>
              <div className="flex items-center gap-5">
                <button
                  onClick={skipStep}
                  className="text-sm text-foreground/45 transition-colors hover:text-foreground/70"
                >
                  I don't have any
                </button>
                <button
                  onClick={goNext}
                  className="rounded-2xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isLastStep ? "Finish" : "Next"}
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <p className="mt-8 text-center text-xs text-foreground/35">
        Your data stays private · You can edit later from the Snapshot page
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FieldInput
// ---------------------------------------------------------------------------

const INPUT_BASE =
  "w-full rounded-xl border border-white/8 bg-white/4 py-2.5 px-3 text-sm text-foreground placeholder:text-foreground/30 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-colors";

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-foreground/65">{field.label}</label>
      {field.type === "select" ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${INPUT_BASE} cursor-pointer`}
          style={{ appearance: "auto" }}
        >
          <option value="">Select…</option>
          {field.options?.map((o) => (
            <option key={o} value={o} className="bg-background text-foreground">
              {o}
            </option>
          ))}
        </select>
      ) : field.type === "number" ? (
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-foreground/45">
            ₹
          </span>
          <input
            type="number"
            min="0"
            placeholder={field.placeholder ?? "0"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`${INPUT_BASE} pl-7`}
          />
        </div>
      ) : (
        <input
          type="text"
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={INPUT_BASE}
        />
      )}
    </div>
  );
}
