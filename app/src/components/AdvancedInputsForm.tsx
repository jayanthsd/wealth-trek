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
  startExpanded?: boolean;
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

const TOGGLE_FIELDS: { key: keyof AdvancedInputs; label: string }[] = [
  { key: "has_will_created", label: "Will / estate plan created" },
  { key: "has_international_funds", label: "Hold international funds" },
];

export function AdvancedInputsForm({
  inputs,
  onSave,
  startExpanded = false,
}: AdvancedInputsFormProps) {
  const [expanded, setExpanded] = useState(startExpanded);
  const [draft, setDraft] = useState<Record<string, string>>(() => {
    const d: Record<string, string> = {};
    for (const f of FIELDS) {
      const val = inputs[f.key];
      d[f.key] = val !== undefined && val !== null ? String(val) : "";
    }
    return d;
  });
  const [toggles, setToggles] = useState<Record<string, boolean>>(() => {
    const t: Record<string, boolean> = {};
    for (const f of TOGGLE_FIELDS) {
      t[f.key] = !!inputs[f.key];
    }
    return t;
  });

  function handleSave() {
    const result: AdvancedInputs = {};
    for (const f of FIELDS) {
      const raw = draft[f.key]?.trim();
      if (raw && !isNaN(Number(raw))) {
        (result as Record<string, number>)[f.key] = Number(raw);
      }
    }
    for (const f of TOGGLE_FIELDS) {
      (result as Record<string, boolean>)[f.key] = !!toggles[f.key];
    }
    onSave(result);
  }

  return (
    <Card className="surface-card rounded-2xl border border-border overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2.5 px-4 py-2.5 hover:bg-primary/5 transition-colors cursor-pointer"
      >
        <Settings2 className="h-3.5 w-3.5 text-primary/60" />
        <span className="flex-1 text-left text-xs font-semibold text-foreground">
          Advanced Inputs
          <span className="ml-1.5 font-normal text-muted-foreground italic font-display">
            — for richer projections
          </span>
        </span>
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-3 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {FIELDS.map((f) => (
              <div key={f.key} className="space-y-1">
                <Label className="text-[10px] font-medium text-muted-foreground">
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
                      "text-xs tabular-nums h-8",
                      f.suffix && "pr-10"
                    )}
                  />
                  {f.suffix && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      {f.suffix}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          {TOGGLE_FIELDS.length > 0 && (
            <div className="flex flex-wrap gap-3 pt-1">
              {TOGGLE_FIELDS.map((f) => (
                <label
                  key={f.key}
                  className="flex items-center gap-2 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={!!toggles[f.key]}
                    onChange={(e) =>
                      setToggles((prev) => ({
                        ...prev,
                        [f.key]: e.target.checked,
                      }))
                    }
                    className="h-3.5 w-3.5 rounded border-border accent-primary"
                  />
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {f.label}
                  </span>
                </label>
              ))}
            </div>
          )}
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
