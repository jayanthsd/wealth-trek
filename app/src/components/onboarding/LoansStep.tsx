"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { StatementEntry } from "@/types";

const LOAN_TYPES = [
  "Home Loan",
  "Personal Loan",
  "Car Loan",
  "Education Loan",
] as const;

interface LoanRow {
  type: string;
  description: string;
  amount: string;
}

const emptyRow = (): LoanRow => ({ type: "", description: "", amount: "" });

interface LoansStepProps {
  initialEntries: Omit<StatementEntry, "id">[];
  onNext: (entries: Omit<StatementEntry, "id">[]) => void;
  onBack: () => void;
}

export function LoansStep({
  initialEntries,
  onNext,
  onBack,
}: LoansStepProps) {
  const [rows, setRows] = useState<LoanRow[]>(() => {
    if (initialEntries.length > 0) {
      return initialEntries.map((e) => ({
        type: e.statementType,
        description: e.description,
        amount: String(e.closingBalance),
      }));
    }
    return [emptyRow()];
  });

  const updateRow = (index: number, updates: Partial<LoanRow>) => {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, ...updates } : r))
    );
  };

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);
  const removeRow = (index: number) =>
    setRows((prev) => prev.filter((_, i) => i !== index));

  const handleNext = () => {
    const entries: Omit<StatementEntry, "id">[] = rows
      .filter((r) => r.type && parseFloat(r.amount) > 0)
      .map((r) => ({
        statementType: r.type,
        description: r.description || r.type,
        category: "liability" as const,
        closingBalance: parseFloat(r.amount),
        ownershipPercentage: 100,
      }));
    onNext(entries);
  };

  return (
    <div className="flex flex-col">
      <h2 className="mb-1 text-2xl font-semibold text-foreground">
        Now let&apos;s record any loans
      </h2>
      <p className="mb-8 text-sm text-foreground/45">
        Add outstanding loan balances.
      </p>

      <div className="space-y-4">
        {rows.map((row, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3 rounded-xl border border-white/8 bg-white/[0.02] p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground/40">
                Loan {index + 1}
              </span>
              {rows.length > 1 && (
                <button
                  onClick={() => removeRow(index)}
                  className="text-foreground/30 hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground/50">
                  Type
                </label>
                <select
                  value={row.type}
                  onChange={(e) => updateRow(index, { type: e.target.value })}
                  className="min-h-11 w-full rounded-xl border border-input bg-card px-3 py-2 text-sm shadow-sm transition-all outline-none hover:border-primary/35 focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select type</option>
                  {LOAN_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground/50">
                  Description (optional)
                </label>
                <Input
                  placeholder="e.g. HDFC Home Loan"
                  value={row.description}
                  onChange={(e) =>
                    updateRow(index, { description: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground/50">
                  Outstanding Amount (₹)
                </label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={row.amount}
                  onChange={(e) =>
                    updateRow(index, { amount: e.target.value })
                  }
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <button
        onClick={addRow}
        className="mt-4 flex items-center gap-2 self-start text-sm font-medium text-primary/70 transition-colors hover:text-primary"
      >
        <Plus className="h-4 w-4" />
        Add another
      </button>

      <div className="mt-8 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          Back
        </Button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNext([])}
            className="text-sm font-medium text-foreground/40 transition-colors hover:text-foreground/60"
          >
            I don&apos;t have any
          </button>
          <Button onClick={handleNext}>Next</Button>
        </div>
      </div>
    </div>
  );
}
