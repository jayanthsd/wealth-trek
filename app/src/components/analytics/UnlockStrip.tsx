"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdvancedInputsForm } from "@/components/AdvancedInputsForm";
import type { AdvancedInputs } from "@/types";

interface Props {
  inputs: AdvancedInputs;
  onSave: (inputs: AdvancedInputs) => void;
}

const TOTAL_FIELDS = 11; // 9 numeric + 2 boolean

function countFilled(inputs: AdvancedInputs): number {
  let filled = 0;
  if (inputs.monthly_income != null) filled++;
  if (inputs.monthly_emi_total != null) filled++;
  if (inputs.monthly_investment != null) filled++;
  if (inputs.current_age != null) filled++;
  if (inputs.retirement_age != null) filled++;
  if (inputs.existing_term_cover != null) filled++;
  if (inputs.existing_health_cover != null) filled++;
  if (inputs.ppf_annual_contribution != null) filled++;
  if (inputs.vpf_contribution != null) filled++;
  if (inputs.has_will_created != null) filled++;
  if (inputs.has_international_funds != null) filled++;
  return filled;
}

export function UnlockStrip({ inputs, onSave }: Props) {
  const [open, setOpen] = useState(false);
  const filled = countFilled(inputs);
  const pct = Math.round((filled / TOTAL_FIELDS) * 100);
  const isComplete = filled === TOTAL_FIELDS;

  if (isComplete && !open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-between gap-3 rounded-2xl border border-success/20 bg-success/5 px-5 py-3 hover:bg-success/10 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="h-4 w-4 text-success" />
          <span className="text-sm font-medium text-foreground">
            All advanced inputs complete — edit
          </span>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl border overflow-hidden",
        filled === 0
          ? "border-primary/30 bg-primary/5"
          : "border-border bg-background"
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors text-left"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground">
            {filled === 0
              ? "Unlock deeper insights"
              : `${filled} of ${TOTAL_FIELDS} advanced inputs filled`}
          </h3>
          <p className="text-xs text-muted-foreground italic font-display mt-0.5">
            {filled === 0
              ? "Answer a few questions to unlock retirement trajectory, tax efficiency, and protection checks."
              : filled < TOTAL_FIELDS
                ? `Fill ${TOTAL_FIELDS - filled} more to unlock every insight.`
                : "Expand to edit."}
          </p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground shrink-0 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-border"
          >
            <div className="p-4">
              <AdvancedInputsForm inputs={inputs} onSave={onSave} startExpanded />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
