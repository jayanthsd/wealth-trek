"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { computeTotals } from "@/lib/computations";
import { formatINR } from "@/lib/computations";
import type { StatementEntry } from "@/types";

interface SummaryStepProps {
  entries: Omit<StatementEntry, "id">[];
  onSave: (data: {
    entries: Omit<StatementEntry, "id">[];
    totalAssets: number;
    totalLiabilities: number;
    netWorth: number;
  }) => Promise<void>;
  onGoToDashboard: () => void;
}

export function SummaryStep({
  entries,
  onSave,
  onGoToDashboard,
}: SummaryStepProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasSaved = useRef(false);

  const totals = computeTotals(
    entries.map((e, i) => ({ ...e, id: `temp-${i}` }))
  );

  const doSave = useCallback(async () => {
    if (hasSaved.current || entries.length === 0) return;
    hasSaved.current = true;
    setSaving(true);
    setError(null);
    try {
      await onSave({
        entries,
        totalAssets: totals.totalAssets,
        totalLiabilities: totals.totalLiabilities,
        netWorth: totals.netWorth,
      });
      setSaved(true);
    } catch (err: any) {
      setError(err.message || "Failed to save snapshot");
      hasSaved.current = false;
    } finally {
      setSaving(false);
    }
  }, [entries, onSave, totals]);

  useEffect(() => {
    doSave();
  }, [doSave]);

  const assetEntries = entries.filter((e) => e.category === "asset");
  const liabilityEntries = entries.filter((e) => e.category === "liability");

  return (
    <div className="flex flex-col items-center text-center">
      {saved && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="mb-6"
        >
          <PartyPopper className="h-16 w-16 text-primary" />
        </motion.div>
      )}

      <h2 className="mb-2 text-2xl font-semibold text-foreground sm:text-3xl">
        {saved
          ? "Here's your financial snapshot!"
          : saving
          ? "Saving your snapshot..."
          : "Your financial summary"}
      </h2>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => {
              hasSaved.current = false;
              doSave();
            }}
          >
            Retry
          </Button>
        </div>
      )}

      <div className="mb-8 w-full max-w-md space-y-4">
        {/* Net Worth Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-primary/30 bg-primary/5 p-6"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-primary/60">
            Net Worth
          </p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-foreground">
            {formatINR(totals.netWorth)}
          </p>
        </motion.div>

        {/* Assets / Liabilities */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-white/8 bg-white/[0.02] p-4"
          >
            <p className="text-xs font-medium text-foreground/40">
              Total Assets
            </p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-success">
              {formatINR(totals.totalAssets)}
            </p>
            <p className="mt-1 text-xs text-foreground/30">
              {assetEntries.length} item{assetEntries.length !== 1 ? "s" : ""}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl border border-white/8 bg-white/[0.02] p-4"
          >
            <p className="text-xs font-medium text-foreground/40">
              Total Liabilities
            </p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-destructive">
              {formatINR(totals.totalLiabilities)}
            </p>
            <p className="mt-1 text-xs text-foreground/30">
              {liabilityEntries.length} item
              {liabilityEntries.length !== 1 ? "s" : ""}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Confetti-like celebration dots */}
      {saved && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{
                opacity: 1,
                x: "50%",
                y: "40%",
                scale: 0,
              }}
              animate={{
                opacity: 0,
                x: `${Math.random() * 100}%`,
                y: `${Math.random() * 100}%`,
                scale: Math.random() * 1.5 + 0.5,
              }}
              transition={{
                duration: 1.5 + Math.random(),
                delay: Math.random() * 0.5,
                ease: "easeOut",
              }}
              className="absolute h-2 w-2 rounded-full"
              style={{
                backgroundColor: [
                  "hsl(var(--primary))",
                  "hsl(var(--success))",
                  "#f59e0b",
                  "#ec4899",
                  "#8b5cf6",
                ][i % 5],
              }}
            />
          ))}
        </div>
      )}

      {saving && (
        <div className="flex items-center gap-3 text-sm text-foreground/50">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Saving your snapshot...
        </div>
      )}

      {saved && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="flex items-center gap-2 text-sm text-success">
            <CheckCircle2 className="h-4 w-4" />
            Snapshot saved successfully
          </div>
          <Button onClick={onGoToDashboard} className="mt-2">
            Go to Dashboard
          </Button>
        </motion.div>
      )}
    </div>
  );
}
