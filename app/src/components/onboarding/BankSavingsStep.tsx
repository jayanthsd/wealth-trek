"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useBanks } from "@/hooks/useBanks";
import type { StatementEntry } from "@/types";

interface BankAccount {
  bank: string;
  isOther: boolean;
  customBank: string;
  balance: string;
}

const emptyAccount = (): BankAccount => ({
  bank: "",
  isOther: false,
  customBank: "",
  balance: "",
});

interface BankSavingsStepProps {
  initialEntries: Omit<StatementEntry, "id">[];
  onNext: (entries: Omit<StatementEntry, "id">[]) => void;
  onBack: () => void;
}

export function BankSavingsStep({
  initialEntries,
  onNext,
  onBack,
}: BankSavingsStepProps) {
  const { banks, loaded } = useBanks();

  const [accounts, setAccounts] = useState<BankAccount[]>(() => {
    if (initialEntries.length > 0) {
      return initialEntries.map((e) => {
        const bankName = e.description;
        const isKnown = banks.some((b) => b.name === bankName);
        return {
          bank: isKnown ? bankName : "Other",
          isOther: !isKnown,
          customBank: isKnown ? "" : bankName,
          balance: String(e.closingBalance),
        };
      });
    }
    return [emptyAccount()];
  });

  const updateAccount = (index: number, updates: Partial<BankAccount>) => {
    setAccounts((prev) =>
      prev.map((a, i) => (i === index ? { ...a, ...updates } : a))
    );
  };

  const addAccount = () => setAccounts((prev) => [...prev, emptyAccount()]);

  const removeAccount = (index: number) => {
    setAccounts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    const entries: Omit<StatementEntry, "id">[] = accounts
      .filter((a) => {
        const name = a.isOther ? a.customBank.trim() : a.bank;
        return name && parseFloat(a.balance) > 0;
      })
      .map((a) => ({
        statementType: "Savings Bank Account",
        description: a.isOther ? a.customBank.trim() : a.bank,
        category: "asset" as const,
        closingBalance: parseFloat(a.balance),
        ownershipPercentage: 100,
      }));
    onNext(entries);
  };

  const handleSkip = () => onNext([]);

  return (
    <div className="flex flex-col">
      <h2 className="mb-1 text-2xl font-semibold text-foreground">
        Let&apos;s start with your bank savings
      </h2>
      <p className="mb-8 text-sm text-foreground/45">
        Add each bank account you hold with its closing balance.
      </p>

      <div className="space-y-4">
        {accounts.map((account, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3 rounded-xl border border-white/8 bg-white/[0.02] p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground/40">
                Account {index + 1}
              </span>
              {accounts.length > 1 && (
                <button
                  onClick={() => removeAccount(index)}
                  className="text-foreground/30 hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground/50">
                  Bank
                </label>
                {loaded ? (
                  <select
                    value={account.isOther ? "Other" : account.bank}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "Other") {
                        updateAccount(index, {
                          bank: "Other",
                          isOther: true,
                        });
                      } else {
                        updateAccount(index, {
                          bank: val,
                          isOther: false,
                          customBank: "",
                        });
                      }
                    }}
                    className="min-h-11 w-full rounded-xl border border-input bg-card px-3 py-2 text-sm shadow-sm transition-all outline-none hover:border-primary/35 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Select a bank</option>
                    {banks.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <Input
                    placeholder="Enter bank name"
                    value={account.customBank}
                    onChange={(e) =>
                      updateAccount(index, {
                        customBank: e.target.value,
                        isOther: true,
                      })
                    }
                  />
                )}
                {account.isOther && loaded && (
                  <Input
                    className="mt-2"
                    placeholder="Enter bank name"
                    value={account.customBank}
                    onChange={(e) =>
                      updateAccount(index, { customBank: e.target.value })
                    }
                  />
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground/50">
                  Closing Balance (₹)
                </label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={account.balance}
                  onChange={(e) =>
                    updateAccount(index, { balance: e.target.value })
                  }
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <button
        onClick={addAccount}
        className="mt-4 flex items-center gap-2 self-start text-sm font-medium text-primary/70 transition-colors hover:text-primary"
      >
        <Plus className="h-4 w-4" />
        Add another account
      </button>

      <div className="mt-8 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          Back
        </Button>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSkip}
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
