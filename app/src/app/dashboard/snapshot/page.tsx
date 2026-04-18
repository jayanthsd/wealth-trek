"use client";

import { useState, useCallback } from "react";
import { StatementEntry, Category, ExtractedEntry, UploadedDocument } from "@/types";
import { useStatements } from "@/hooks/useStatements";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useDocuments } from "@/hooks/useDocuments";
import { useNetWorthHistory } from "@/hooks/useNetWorthHistory";
import { StatementForm } from "@/components/StatementForm";
import { StatementList } from "@/components/StatementList";
import { NetWorthSummary } from "@/components/NetWorthSummary";
import { DocumentUpload } from "@/components/DocumentUpload";
import { DocumentList } from "@/components/DocumentList";
import { ExtractionReview } from "@/components/ExtractionReview";
import { generateNetWorthPdf } from "@/lib/generatePdf";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileDown,
  Save,
  Upload,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { computeTotals } from "@/lib/computations";
import { DashboardPageShell } from "@/components/DashboardPageShell";

export default function SnapshotPage() {
  const { statements, addStatement, bulkAddStatements, updateStatement, deleteStatement, loaded: statementsLoaded } = useStatements();
  const { profile, updateProfile, loaded: profileLoaded } = useUserProfile();
  const { documents, addDocuments, deleteDocument, loaded: documentsLoaded } = useDocuments();
  const { saveSnapshot, snapshots, deleteSnapshot } = useNetWorthHistory();

  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);

  const workingStatements = statements.filter((s) => !pendingDeleteIds.includes(s.id));

  const handleLocalDelete = useCallback((id: string) => {
    setPendingDeleteIds((prev) => [...prev, id]);
  }, []);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogDefaultCategory, setDialogDefaultCategory] = useState<Category>("asset");
  const [editingEntry, setEditingEntry] = useState<StatementEntry | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [extractingId, setExtractingId] = useState<string | null>(null);
  const [extractionResults, setExtractionResults] = useState<Array<{
    entries: ExtractedEntry[];
    documentName: string;
    sourceDocumentId: string;
  }>>([]);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [snapshotStatus, setSnapshotStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});

  const { totalAssets, totalLiabilities, netWorth } = computeTotals(workingStatements);

  function openAddDialog(category: Category) {
    setEditingEntry(null);
    setDialogDefaultCategory(category);
    setDialogOpen(true);
  }

  function openEditDialog(entry: StatementEntry) {
    setEditingEntry(entry);
    setDialogDefaultCategory(entry.category);
    setDialogOpen(true);
  }

  function handleFormAdd(entry: Omit<StatementEntry, "id">) {
    addStatement(entry);
    setDialogOpen(false);
  }

  function handleFormUpdate(id: string, updates: Partial<Omit<StatementEntry, "id">>) {
    updateStatement(id, updates);
    setDialogOpen(false);
    setEditingEntry(null);
  }

  async function handleExtract(doc: UploadedDocument) {
    setExtractingId(doc.id);
    setExtractionError(null);
    try {
      const response = await fetch("/api/documents/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storedPath: doc.storedPath, fileType: doc.fileType }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Extraction failed");
      setExtractionResults((prev) => [
        ...prev,
        { entries: data.entries, documentName: doc.originalName, sourceDocumentId: doc.id },
      ]);
    } catch (err) {
      setExtractionError(err instanceof Error ? err.message : "Extraction failed");
    } finally {
      setExtractingId(null);
    }
  }

  function handleConfirmEntries(
    entries: Array<{
      statementType: string;
      description: string;
      category: Category;
      closingBalance: number;
      ownershipPercentage: number;
      sourceDocumentId: string;
    }>
  ) {
    bulkAddStatements(entries);
    setExtractionResults([]);
  }

  async function handleSaveSnapshot() {
    if (!profile.asOnDate) {
      setSnapshotStatus({ type: "error", message: "Set a snapshot date before saving." });
      setTimeout(() => setSnapshotStatus(null), 4000);
      return;
    }
    if (workingStatements.length === 0) {
      setSnapshotStatus({ type: "error", message: "Add at least one entry before saving." });
      setTimeout(() => setSnapshotStatus(null), 4000);
      return;
    }
    const existing = snapshots.find((s) => s.date === profile.asOnDate);
    if (existing) {
      const confirmed = window.confirm(`A snapshot for ${profile.asOnDate} already exists. Overwrite it?`);
      if (!confirmed) return;
    }

    // Flush pending deletions to DB
    for (const id of pendingDeleteIds) {
      await deleteStatement(id);
    }
    setPendingDeleteIds([]);

    saveSnapshot({ date: profile.asOnDate, totalAssets, totalLiabilities, netWorth, entries: workingStatements });
    setSnapshotStatus({ type: "success", message: `Snapshot saved for ${profile.asOnDate}.` });
    setTimeout(() => setSnapshotStatus(null), 4000);
  }

  function handleGeneratePdf() {
    const errors: Record<string, string> = {};
    if (!profile.fullName.trim()) errors.fullName = "Full name is required";
    if (!profile.asOnDate) errors.asOnDate = "Snapshot date is required";
    setProfileErrors(errors);
    if (Object.keys(errors).length > 0) return;
    if (workingStatements.length === 0) {
      setSnapshotStatus({ type: "error", message: "Add at least one entry to generate a certificate." });
      setTimeout(() => setSnapshotStatus(null), 4000);
      return;
    }
    generateNetWorthPdf(profile, workingStatements);
  }

  if (!statementsLoaded || !profileLoaded || !documentsLoaded) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-foreground/40">Loading studio...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardPageShell variant="wide" className="px-4 py-10 sm:px-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-semibold text-brand-gradient">Snapshot</h1>
          <p className="mt-2 text-foreground/50">
            Build your financial picture. Save a snapshot when you're ready.
          </p>
        </div>

        {/* Import from Statement toggle */}
        <div className="mb-6">
          <button
            onClick={() => setUploadOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-foreground/70 transition-colors hover:bg-white/8 hover:text-foreground"
          >
            <Upload className="h-4 w-4" />
            Import from Statement
            {uploadOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        {/* Main workspace - single column centered */}
        <div className="space-y-6">
          {uploadOpen && (
            <div className="space-y-4">
              <DocumentUpload onUploaded={addDocuments} />
              {documents.length > 0 && (
                <DocumentList
                  documents={documents}
                  onDelete={deleteDocument}
                  onExtract={handleExtract}
                  extractingId={extractingId}
                />
              )}
              {extractionError && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                  {extractionError}
                </div>
              )}
            </div>
          )}

          {extractionResults.length > 0 && (
            <div>
              <ExtractionReview
                extractedDocuments={extractionResults}
                onConfirm={handleConfirmEntries}
                onClose={() => setExtractionResults([])}
              />
            </div>
          )}

          {/* ── Asset & Liability lists ── */}
          <StatementList
            statements={workingStatements}
            onEdit={openEditDialog}
            onDelete={handleLocalDelete}
            onAddAsset={() => openAddDialog("asset")}
            onAddLiability={() => openAddDialog("liability")}
          />

          {/* ── BELOW: NetWorth Summary + Snapshot Details side-by-side ── */}
          <div className="grid grid-cols-1 gap-5 items-stretch lg:grid-cols-[0.7fr_0.3fr]">
            {/* Left: NetWorth Summary */}
            <NetWorthSummary className="h-full" statements={workingStatements} />
            
            {/* Right: Snapshot Details with buttons below */}
            <div className="flex h-full flex-col gap-4">
              <div className="surface-card rounded-2xl border border-white/8 p-5 flex-1 space-y-4">
                <p className="label-caps">Snapshot Details</p>

                <div className="space-y-1.5">
                  <Label htmlFor="asOnDate" className="text-sm font-medium text-foreground/70">
                    As on Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="asOnDate"
                    type="date"
                    value={profile.asOnDate}
                    onChange={(e) => { updateProfile({ asOnDate: e.target.value }); setProfileErrors({}); }}
                    className={profileErrors.asOnDate ? "border-destructive" : ""}
                  />
                  {profileErrors.asOnDate && (
                    <p className="text-xs text-destructive">{profileErrors.asOnDate}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-sm font-medium text-foreground/70">
                    Full Name <span className="text-xs text-foreground/30">(for certificate)</span>
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="Your full name"
                    value={profile.fullName}
                    onChange={(e) => { updateProfile({ fullName: e.target.value }); setProfileErrors({}); }}
                    className={profileErrors.fullName ? "border-destructive" : ""}
                  />
                  {profileErrors.fullName && (
                    <p className="text-xs text-destructive">{profileErrors.fullName}</p>
                  )}
                </div>
              </div>

              {/* Buttons below Snapshot Details */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleSaveSnapshot}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Save className="h-4 w-4" />
                  Save Snapshot
                </button>
                <button
                  onClick={handleGeneratePdf}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <FileDown className="h-4 w-4" />
                  Generate Certificate
                </button>
              </div>

              {/* Status feedback */}
              {snapshotStatus && (
                <div className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium ${
                  snapshotStatus.type === "success"
                    ? "bg-success/10 border border-success/20 text-success"
                    : "bg-destructive/10 border border-destructive/20 text-destructive"
                }`}>
                  {snapshotStatus.type === "success"
                    ? <CheckCircle2 className="h-4 w-4 shrink-0" />
                    : <AlertCircle className="h-4 w-4 shrink-0" />}
                  {snapshotStatus.message}
                </div>
              )}
            </div>
          </div>
        </div>

      {/* Add / Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingEntry(null);
        }}
      >
        <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {editingEntry ? "Edit Entry" : `Add ${dialogDefaultCategory === "asset" ? "Asset" : "Liability"}`}
            </DialogTitle>
          </DialogHeader>
          <StatementForm
            key={`${dialogDefaultCategory}-${editingEntry?.id ?? "new"}`}
            onAdd={handleFormAdd}
            onUpdate={handleFormUpdate}
            editingEntry={editingEntry}
            defaultCategory={dialogDefaultCategory}
            compact
            onCancelEdit={() => { setDialogOpen(false); setEditingEntry(null); }}
          />
        </DialogContent>
      </Dialog>
    </DashboardPageShell>
  );
}
