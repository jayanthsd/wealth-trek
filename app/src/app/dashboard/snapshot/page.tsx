"use client";

import { useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import { SnapshotTemplateWizard } from "@/components/SnapshotTemplateWizard";
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
  Trash2,
} from "lucide-react";
import { computeTotals } from "@/lib/computations";
import { DashboardPageShell } from "@/components/DashboardPageShell";
import { NetWorthSnapshot } from "@/types";
import { cn } from "@/lib/utils";

export default function SnapshotPage() {
  const { statements, addStatement, bulkAddStatements, updateStatement, deleteStatement, loaded: statementsLoaded } = useStatements();
  const { profile, updateProfile, loaded: profileLoaded } = useUserProfile();
  const { documents, addDocuments, deleteDocument, loaded: documentsLoaded } = useDocuments();
  const { saveSnapshot, snapshots, deleteSnapshot } = useNetWorthHistory();

  const searchParams = useSearchParams();
  const router = useRouter();
  const modeParam = searchParams.get("mode");
  const templateMode = (modeParam === "quick" || modeParam === "complete") ? modeParam : null;
  const [wizardDismissed, setWizardDismissed] = useState(false);

  const showWizard = !!templateMode && !wizardDismissed && statements.length === 0;

  const handleWizardApply = useCallback(
    async (
      entries: Array<{
        statementType: string;
        description: string;
        category: Category;
        closingBalance: number;
        ownershipPercentage: number;
      }>
    ) => {
      await bulkAddStatements(entries);
      setWizardDismissed(true);
      router.replace("/dashboard/snapshot");
    },
    [bulkAddStatements, router]
  );

  const handleWizardSkip = useCallback(() => {
    setWizardDismissed(true);
    router.replace("/dashboard");
  }, [router]);

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
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { totalAssets, totalLiabilities, netWorth } = computeTotals(statements);

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

  function handleSaveSnapshot() {
    if (!profile.asOnDate) {
      setSnapshotStatus({ type: "error", message: "Set a snapshot date before saving." });
      setTimeout(() => setSnapshotStatus(null), 4000);
      return;
    }
    if (statements.length === 0) {
      setSnapshotStatus({ type: "error", message: "Add at least one entry before saving." });
      setTimeout(() => setSnapshotStatus(null), 4000);
      return;
    }
    const existing = snapshots.find((s) => s.date === profile.asOnDate);
    if (existing) {
      const confirmed = window.confirm(`A snapshot for ${profile.asOnDate} already exists. Overwrite it?`);
      if (!confirmed) return;
    }
    saveSnapshot({ date: profile.asOnDate, totalAssets, totalLiabilities, netWorth, entries: statements });
    setSnapshotStatus({ type: "success", message: `Snapshot saved for ${profile.asOnDate}.` });
    setTimeout(() => setSnapshotStatus(null), 4000);
  }

  function handleGeneratePdf() {
    const errors: Record<string, string> = {};
    if (!profile.fullName.trim()) errors.fullName = "Full name is required";
    if (!profile.asOnDate) errors.asOnDate = "Snapshot date is required";
    setProfileErrors(errors);
    if (Object.keys(errors).length > 0) return;
    if (statements.length === 0) {
      setSnapshotStatus({ type: "error", message: "Add at least one entry to generate a certificate." });
      setTimeout(() => setSnapshotStatus(null), 4000);
      return;
    }
    generateNetWorthPdf(profile, statements);
  }

  if (!statementsLoaded || !profileLoaded || !documentsLoaded) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-muted-foreground">Loading studio...</p>
        </div>
      </div>
    );
  }

  if (showWizard && templateMode) {
    return (
      <SnapshotTemplateWizard
        mode={templateMode}
        onApply={handleWizardApply}
        onSkip={handleWizardSkip}
      />
    );
  }

  return (
    <DashboardPageShell variant="wide" className="px-4 py-10 sm:px-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-semibold text-brand-gradient">Snapshot</h1>
          <p className="mt-2 text-muted-foreground">
            Build your financial picture. Save a snapshot when you're ready.
          </p>
        </div>

        {/* Import from Statement toggle */}
        <div className="mb-6">
          <button
            onClick={() => setUploadOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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

          {/* ── Net Worth Summary (top for quick visibility) ── */}
          <NetWorthSummary className="w-full" statements={statements} />

          {/* ── Asset & Liability lists ── */}
          <StatementList
            statements={statements}
            onEdit={openEditDialog}
            onDelete={deleteStatement}
            onAddAsset={() => openAddDialog("asset")}
            onAddLiability={() => openAddDialog("liability")}
          />

          {/* ── Snapshot Details + Actions (compact bar) ── */}
          <div className="surface-card rounded-2xl border border-border p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              {/* Fields */}
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="space-y-1 flex-1">
                  <Label htmlFor="asOnDate" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
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
                <div className="space-y-1 flex-1">
                  <Label htmlFor="fullName" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Full Name <span className="text-[9px] font-medium normal-case tracking-normal text-muted-foreground/70">(for certificate)</span>
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

              {/* Action buttons */}
              <div className="flex gap-3 shrink-0">
                <button
                  onClick={handleSaveSnapshot}
                  className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Save className="h-4 w-4" />
                  Save
                </button>
                <button
                  onClick={handleGeneratePdf}
                  className="flex items-center gap-2 rounded-xl border border-border bg-secondary px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-muted active:scale-[0.98]"
                >
                  <FileDown className="h-4 w-4" />
                  Certificate
                </button>
              </div>
            </div>

            {/* Status feedback */}
            {snapshotStatus && (
              <div className={`mt-3 flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium ${
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

          {/* ── Snapshot History ── */}
          {snapshots.length > 0 && (
            <SnapshotHistory
              snapshots={snapshots}
              deleteSnapshot={deleteSnapshot}
              expandedId={expandedId}
              setExpandedId={setExpandedId}
            />
          )}
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

// --- Helpers ---

function formatCurrency(value: number): string {
  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.abs(value));
  return (value < 0 ? "- " : "") + formatted;
}

// --- Snapshot History ---

function SnapshotHistory({
  snapshots,
  deleteSnapshot,
  expandedId,
  setExpandedId,
}: {
  snapshots: NetWorthSnapshot[];
  deleteSnapshot: (id: string) => void;
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
}) {
  const sortedDesc = [...snapshots].sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  return (
    <div className="surface-card rounded-3xl p-6 sm:p-8 border border-border">
      <h2 className="label-caps mb-8">Snapshot History</h2>
      <div className="overflow-x-auto -mx-6 sm:mx-0">
        <table className="w-full text-sm border-separate border-spacing-y-2">
          <thead>
            <tr className="text-left text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              <th className="pb-4 px-4 font-bold">Date</th>
              <th className="pb-4 px-4 font-bold text-right">Total Assets</th>
              <th className="pb-4 px-4 font-bold text-right">Total Liabilities</th>
              <th className="pb-4 px-4 font-bold text-right">Net Worth</th>
              <th className="pb-4 px-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="space-y-2">
            {sortedDesc.map((snapshot) => (
              <SnapshotRow
                key={snapshot.id}
                snapshot={snapshot}
                isExpanded={expandedId === snapshot.id}
                onToggle={() =>
                  setExpandedId(
                    expandedId === snapshot.id ? null : snapshot.id
                  )
                }
                onDelete={() => deleteSnapshot(snapshot.id)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SnapshotRow({
  snapshot,
  isExpanded,
  onToggle,
  onDelete,
}: {
  snapshot: NetWorthSnapshot;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const assets = snapshot.entries.filter((e) => e.category === "asset");
  const liabilities = snapshot.entries.filter(
    (e) => e.category === "liability"
  );

  return (
    <>
      <tr
        className={cn(
          "group transition-all duration-300 cursor-pointer border border-transparent",
          isExpanded ? "bg-secondary border-border" : "hover:bg-secondary"
        )}
        onClick={onToggle}
      >
        <td className="py-4 px-4 rounded-l-2xl">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center border border-border group-hover:border-primary/20 transition-colors">
              {isExpanded ? (
                <ChevronUp className="h-3 w-3 text-primary" />
              ) : (
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
            <span className="font-medium tracking-tight">{snapshot.date}</span>
          </div>
        </td>
        <td className="py-4 px-4 text-right text-success font-semibold tabular-nums">
          {formatCurrency(snapshot.totalAssets)}
        </td>
        <td className="py-4 px-4 text-right text-destructive font-semibold tabular-nums">
          {formatCurrency(snapshot.totalLiabilities)}
        </td>
        <td className="py-4 px-4 text-right font-semibold text-foreground tabular-nums">
          {formatCurrency(snapshot.netWorth)}
        </td>
        <td className="py-4 px-4 text-right rounded-r-2xl">
          <button
            className="h-9 w-9 inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all active:scale-90"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={5} className="px-4 pb-4">
            <div className="surface-card rounded-2xl p-6 border border-border animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-success mb-4 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    Asset Distribution ({assets.length})
                  </h4>
                  {assets.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No asset entries detected.</p>
                  ) : (
                    <ul className="space-y-2">
                      {assets.map((entry) => (
                        <li
                          key={entry.id}
                          className="flex justify-between text-sm group/item"
                        >
                          <span className="text-muted-foreground group-hover/item:text-foreground transition-colors">
                            {entry.description || entry.statementType}
                          </span>
                          <span className="text-success font-semibold tabular-nums">
                            {formatCurrency(
                              (entry.closingBalance * entry.ownershipPercentage) /
                                100
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-destructive mb-4 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                    Liability Portfolio ({liabilities.length})
                  </h4>
                  {liabilities.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No liabilities recorded.</p>
                  ) : (
                    <ul className="space-y-2">
                      {liabilities.map((entry) => (
                        <li
                          key={entry.id}
                          className="flex justify-between text-sm group/item"
                        >
                          <span className="text-muted-foreground group-hover/item:text-foreground transition-colors">
                            {entry.description || entry.statementType}
                          </span>
                          <span className="text-destructive font-semibold tabular-nums">
                            {formatCurrency(
                              (entry.closingBalance * entry.ownershipPercentage) /
                                100
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
