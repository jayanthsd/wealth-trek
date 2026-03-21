"use client";

import { useState, useEffect } from "react";
import { StatementEntry, Category, STATEMENT_TYPE_PRESETS } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Save, X, PlusCircle, Edit3 } from "lucide-react";

interface StatementFormProps {
  onAdd: (entry: Omit<StatementEntry, "id">) => void;
  onUpdate?: (id: string, updates: Partial<Omit<StatementEntry, "id">>) => void;
  editingEntry?: StatementEntry | null;
  onCancelEdit?: () => void;
}

const emptyForm = {
  statementType: "",
  description: "",
  category: "asset" as Category,
  closingBalance: "",
  ownershipPercentage: "100",
};

export function StatementForm({
  onAdd,
  onUpdate,
  editingEntry,
  onCancelEdit,
}: StatementFormProps) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingEntry) {
      setForm({
        statementType: editingEntry.statementType,
        description: editingEntry.description,
        category: editingEntry.category,
        closingBalance: String(editingEntry.closingBalance),
        ownershipPercentage: String(editingEntry.ownershipPercentage),
      });
      setErrors({});
    }
  }, [editingEntry]);

  function handleStatementTypeChange(value: string) {
    const preset = STATEMENT_TYPE_PRESETS.find((p) => p.label === value);
    setForm((prev) => ({
      ...prev,
      statementType: value,
      category: preset ? preset.category : prev.category,
    }));
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!form.statementType.trim()) {
      newErrors.statementType = "Statement type is required";
    }
    const balance = parseFloat(form.closingBalance);
    if (isNaN(balance) || balance < 0) {
      newErrors.closingBalance = "Closing balance must be a non-negative number";
    }
    const ownership = parseFloat(form.ownershipPercentage);
    if (isNaN(ownership) || ownership < 1 || ownership > 100) {
      newErrors.ownershipPercentage = "Ownership must be between 1 and 100";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;

    const entry = {
      statementType: form.statementType.trim(),
      description: form.description.trim(),
      category: form.category,
      closingBalance: parseFloat(form.closingBalance),
      ownershipPercentage: parseFloat(form.ownershipPercentage),
    };

    if (editingEntry && onUpdate) {
      onUpdate(editingEntry.id, entry);
      onCancelEdit?.();
    } else {
      onAdd(entry);
    }
    setForm(emptyForm);
    setErrors({});
  }

  function handleCancel() {
    setForm(emptyForm);
    setErrors({});
    onCancelEdit?.();
  }

  return (
    <Card className={editingEntry ? "border-primary/30 ring-2 ring-primary/10" : ""}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${editingEntry ? "bg-amber-100 text-amber-600" : "bg-primary/10 text-primary"}`}>
            {editingEntry ? <Edit3 className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
          </div>
          <CardTitle className="text-lg font-semibold">
            {editingEntry ? "Edit Statement" : "Add Statement"}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label>
              Statement Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.statementType}
              onValueChange={(value) => value && handleStatementTypeChange(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {STATEMENT_TYPE_PRESETS.map((preset) => (
                  <SelectItem key={preset.label} value={preset.label}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.statementType && (
              <p className="text-sm text-destructive">{errors.statementType}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              placeholder="e.g., SBI Savings A/c"
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={form.category}
              onValueChange={(value) =>
                value && setForm((prev) => ({ ...prev, category: value as Category }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asset">Asset</SelectItem>
                <SelectItem value="liability">Liability</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              Closing Balance <span className="text-destructive">*</span>
            </Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.closingBalance}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, closingBalance: e.target.value }))
              }
            />
            {errors.closingBalance && (
              <p className="text-sm text-destructive">{errors.closingBalance}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>
              Ownership % <span className="text-destructive">*</span>
            </Label>
            <Input
              type="number"
              min="1"
              max="100"
              value={form.ownershipPercentage}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  ownershipPercentage: e.target.value,
                }))
              }
            />
            {errors.ownershipPercentage && (
              <p className="text-sm text-destructive">
                {errors.ownershipPercentage}
              </p>
            )}
          </div>

          <div className="flex items-end gap-2">
            <Button onClick={handleSubmit} className="flex-1">
              {editingEntry ? (
                <>
                  <Save className="mr-2 h-4 w-4" /> Update
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" /> Add
                </>
              )}
            </Button>
            {editingEntry && (
              <Button variant="outline" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" /> Cancel
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
