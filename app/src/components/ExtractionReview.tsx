"use client";

import { useState, useEffect } from "react";
import {
  ExtractedEntry,
  Category,
  STATEMENT_TYPE_PRESETS,
} from "@/types";
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
import { Check, CheckCheck, Trash2, X, Sparkles, FileText } from "lucide-react";

interface ReviewEntry extends ExtractedEntry {
  ownershipPercentage: number;
  sourceDocumentId: string;
  documentName: string;
}

interface ExtractionReviewProps {
  extractedDocuments: Array<{
    entries: ExtractedEntry[];
    documentName: string;
    sourceDocumentId: string;
  }>;
  onConfirm: (
    entries: Array<{
      statementType: string;
      description: string;
      category: Category;
      closingBalance: number;
      ownershipPercentage: number;
      sourceDocumentId: string;
    }>
  ) => void;
  onClose: () => void;
}

export function ExtractionReview({
  extractedDocuments,
  onConfirm,
  onClose,
}: ExtractionReviewProps) {
  const [reviewEntries, setReviewEntries] = useState<ReviewEntry[]>(
    extractedDocuments.flatMap((doc) =>
      doc.entries.map((e) => ({
        ...e,
        ownershipPercentage: 100,
        sourceDocumentId: doc.sourceDocumentId,
        documentName: doc.documentName,
      }))
    )
  );

  // Sync reviewEntries when extractedDocuments changes
  useEffect(() => {
    // Get set of document IDs already in reviewEntries
    const processedDocIds = new Set(
      reviewEntries.map((entry) => entry.sourceDocumentId)
    );

    // Find new documents that haven't been processed yet
    const newDocuments = extractedDocuments.filter(
      (doc) => !processedDocIds.has(doc.sourceDocumentId)
    );

    // If there are new documents, append their entries
    if (newDocuments.length > 0) {
      const newEntries = newDocuments.flatMap((doc) =>
        doc.entries.map((e) => ({
          ...e,
          ownershipPercentage: 100,
          sourceDocumentId: doc.sourceDocumentId,
          documentName: doc.documentName,
        }))
      );

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setReviewEntries((prev) => [...prev, ...newEntries]);
    }
  }, [extractedDocuments, reviewEntries]);

  function updateEntry(index: number, updates: Partial<ReviewEntry>) {
    setReviewEntries((prev) =>
      prev.map((entry, i) => (i === index ? { ...entry, ...updates } : entry))
    );
  }

  function deleteEntry(index: number) {
    setReviewEntries((prev) => prev.filter((_, i) => i !== index));
  }

  function confirmEntry(index: number) {
    const entry = reviewEntries[index];
    onConfirm([
      {
        statementType: entry.statementType,
        description: entry.description,
        category: entry.category,
        closingBalance: entry.closingBalance,
        ownershipPercentage: entry.ownershipPercentage,
        sourceDocumentId: entry.sourceDocumentId,
      },
    ]);
    
    // If this was the last entry, close the panel
    if (reviewEntries.length === 1) {
      onClose();
    } else {
      deleteEntry(index);
    }
  }

  function confirmAll() {
    onConfirm(
      reviewEntries.map((entry) => ({
        statementType: entry.statementType,
        description: entry.description,
        category: entry.category,
        closingBalance: entry.closingBalance,
        ownershipPercentage: entry.ownershipPercentage,
        sourceDocumentId: entry.sourceDocumentId,
      }))
    );
    onClose();
  }

  if (reviewEntries.length === 0) {
    return (
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="py-6 text-center">
          <p className="text-sm text-muted-foreground">
            No entries to review. All entries have been confirmed or removed.
          </p>
          <Button variant="outline" size="sm" className="mt-2" onClick={onClose}>
            Close
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/30 ring-2 ring-primary/10">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">
                Review Extracted Entries
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {extractedDocuments.length} document(s) &middot; {reviewEntries.length} entries found
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={confirmAll} className="shadow-sm">
              <CheckCheck className="mr-1.5 h-4 w-4" />
              Confirm All ({reviewEntries.length})
            </Button>
            <Button size="icon-sm" variant="ghost" onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reviewEntries.map((entry, index) => (
            <div key={index} className="rounded-xl border bg-muted/20 p-4 transition-colors hover:bg-muted/30">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-xs font-medium text-muted-foreground">
                  {entry.documentName}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
              <div className="space-y-1">
                <Label className="text-xs">Statement Type</Label>
                <Select
                  value={entry.statementType}
                  onValueChange={(value) =>
                    value &&
                    updateEntry(index, {
                      statementType: value,
                      category:
                        STATEMENT_TYPE_PRESETS.find((p) => p.label === value)
                          ?.category ?? entry.category,
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATEMENT_TYPE_PRESETS.map((preset) => (
                      <SelectItem key={preset.label} value={preset.label}>
                        {preset.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Description</Label>
                <Input
                  value={entry.description}
                  onChange={(e) =>
                    updateEntry(index, { description: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Category</Label>
                <Select
                  value={entry.category}
                  onValueChange={(value) =>
                    value &&
                    updateEntry(index, { category: value as Category })
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

              <div className="space-y-1">
                <Label className="text-xs">Closing Balance</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={entry.closingBalance}
                  onChange={(e) =>
                    updateEntry(index, {
                      closingBalance: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Ownership %</Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={entry.ownershipPercentage}
                  onChange={(e) =>
                    updateEntry(index, {
                      ownershipPercentage: parseFloat(e.target.value) || 100,
                    })
                  }
                />
              </div>

              <div className="flex items-end gap-2">
                <Button
                  size="sm"
                  variant="default"
                  className="flex-1 shadow-sm"
                  onClick={() => confirmEntry(index)}
                >
                  <Check className="mr-1.5 h-4 w-4" />
                  Confirm
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => deleteEntry(index)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
