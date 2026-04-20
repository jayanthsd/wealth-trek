"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Settings2 } from "lucide-react";
import type { AdvancedInputs } from "@/types";
import { cn } from "@/lib/utils";

interface AdvancedInputsFormProps {
  inputs: AdvancedInputs;
  onSave: (inputs: AdvancedInputs) => void;
}

const FIELDS: {
  key: keyof AdvancedInputs;
  label: string;
  placeholder: string;
  suffix?: string;
}[] = [
  {
    key: "monthly_income",
    label: "Monthly Take-Home Income",
    placeholder: "e.g. 150000",
    suffix: "/mo",
  },
  {
    key: "monthly_emi_total",
    label: "Total Monthly EMIs",
    placeholder: "Sum of all EMIs",
    suffix: "/mo",
  },
  {
    key: "monthly_investment",
    label: "Monthly SIP / Investment",
    placeholder: "Recurring investment amount",
    suffix: "/mo",
  },
  {
    key: "current_age",
    label: "Current Age",
    placeholder: "e.g. 30",
    suffix: "yrs",
  },
  {
    key: "retirement_age",
    label: "Target Retirement Age",
    placeholder: "Default: 60",
    suffix: "yrs",
  },
  {
    key: "ppf_annual_contribution",
    label: "PPF Annual Contribution",
    placeholder: "e.g. 150000",
    suffix: "/yr",
  },
  {
    key: "vpf_contribution",
    label: "VPF Monthly Contribution",
    placeholder: "0 if none",
    suffix: "/mo",
  },
  {
    key: "existing_term_cover",
    label: "Existing Term Life Cover",
    placeholder: "Leave blank if unknown",
  },
  {
    key: "existing_health_cover",
    label: "Existing Health Cover",
    placeholder: "Leave blank if unknown",
  },
];

export function AdvancedInputsForm({
  inputs,
  onSave,
}: AdvancedInputsFormProps) {
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>(() => {
    const d: Record<string, string> = {};
    for (const f of FIELDS) {
      const val = inputs[f.key];
      d[f.key] = val !== undefined && val !== null ? String(val) : "";
    }
    return d;
  });

  function handleSave() {
    const result: AdvancedInputs = {};
    for (const f of FIELDS) {
      const raw = draft[f.key]?.trim();
      if (raw && !isNaN(Number(raw))) {
        (result as Record<string, number>)[f.key] = Number(raw);
      }
    }
    onSave(result);
  }

  return (
    <Card className="surface-card rounded-2xl border border-white/5 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 p-4 hover:bg-primary/5 transition-colors cursor-pointer"
      >
        <Settings2 className="h-4 w-4 text-primary/60" />
        <div className="flex-1 text-left">
          <span className="text-sm font-semibold text-foreground">
            Advanced Inputs
          </span>
          <span className="ml-2 text-xs text-foreground/40 italic font-display">
            Add these for richer projections and protection analysis
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-foreground/30" />
        ) : (
          <ChevronDown className="h-4 w-4 text-foreground/30" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FIELDS.map((f) => (
              <div key={f.key} className="space-y-1.5">
                <Label className="text-xs text-foreground/60">
                  {f.label}
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder={f.placeholder}
                    value={draft[f.key] ?? ""}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        [f.key]: e.target.value,
                      }))
                    }
                    className={cn(
                      "text-sm tabular-nums",
                      f.suffix && "pr-12"
                    )}
                  />
                  {f.suffix && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-foreground/30">
                      {f.suffix}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <Button size="sm" onClick={handleSave}>
              Save & Recompute
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
