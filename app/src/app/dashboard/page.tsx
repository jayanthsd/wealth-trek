"use client";

import { useState } from "react";
import { StatementEntry, Category, ExtractedEntry, UploadedDocument } from "@/types";
import { useStatements } from "@/hooks/useStatements";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useDocuments } from "@/hooks/useDocuments";
import { Navigation } from "@/components/Navigation";
import { UserProfileForm } from "@/components/UserProfileForm";
import { StatementForm } from "@/components/StatementForm";
import { StatementList } from "@/components/StatementList";
import { NetWorthSummary } from "@/components/NetWorthSummary";
import { DocumentUpload } from "@/components/DocumentUpload";
import { DocumentList } from "@/components/DocumentList";
import { ExtractionReview } from "@/components/ExtractionReview";
import { generateNetWorthPdf } from "@/lib/generatePdf";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { FileDown } from "lucide-react";

export default function Home() {
  const { statements, addStatement, bulkAddStatements, updateStatement, deleteStatement, loaded: statementsLoaded } = useStatements();
  const { profile, updateProfile, loaded: profileLoaded } = useUserProfile();
  const { documents, addDocuments, deleteDocument, loaded: documentsLoaded } = useDocuments();
  const [editingEntry, setEditingEntry] = useState<StatementEntry | null>(null);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [extractingId, setExtractingId] = useState<string | null>(null);
  const [extractionResults, setExtractionResults] = useState<Array<{
    entries: ExtractedEntry[];
    documentName: string;
    sourceDocumentId: string;
  }>>([]);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  async function handleExtract(doc: UploadedDocument) {
    setExtractingId(doc.id);
    setExtractionError(null);
    try {
      const response = await fetch("/api/documents/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storedPath: doc.storedPath,
          fileType: doc.fileType,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Extraction failed");
      }
      setExtractionResults((prev) => [
        ...prev,
        {
          entries: data.entries,
          documentName: doc.originalName,
          sourceDocumentId: doc.id,
        },
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
  }

  function handleGeneratePdf() {
    const errors: Record<string, string> = {};
    if (!profile.fullName.trim()) {
      errors.fullName = "Full name is required";
    }
    if (!profile.asOnDate) {
      errors.asOnDate = "As-on date is required";
    }
    setProfileErrors(errors);

    if (Object.keys(errors).length > 0) return;

    if (statements.length === 0) {
      alert("Please add at least one financial statement entry.");
      return;
    }

    generateNetWorthPdf(profile, statements);
  }

  if (!statementsLoaded || !profileLoaded || !documentsLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <FileDown className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                Net Worth Certificate Generator
              </h1>
              <p className="text-sm text-muted-foreground">
                Track your financial assets and generate professional certificates
              </p>
            </div>
          </div>
        </div>
        <UserProfileForm
          profile={profile}
          onUpdate={(updates) => {
            updateProfile(updates);
            setProfileErrors({});
          }}
          errors={profileErrors}
        />

        <Separator />

        <DocumentUpload onUploaded={addDocuments} />

        <DocumentList
          documents={documents}
          onDelete={deleteDocument}
          onExtract={handleExtract}
          extractingId={extractingId}
        />

        {extractionError && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {extractionError}
          </div>
        )}

        {extractionResults.length > 0 && (
          <ExtractionReview
            extractedDocuments={extractionResults}
            onConfirm={handleConfirmEntries}
            onClose={() => setExtractionResults([])}
          />
        )}

        <Separator />

        <StatementForm
          onAdd={addStatement}
          onUpdate={updateStatement}
          editingEntry={editingEntry}
          onCancelEdit={() => setEditingEntry(null)}
        />

        <StatementList
          statements={statements}
          onEdit={setEditingEntry}
          onDelete={deleteStatement}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <NetWorthSummary statements={statements} />
          <Card className="flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-card to-primary/10 p-8">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">Ready to Generate?</h3>
              <p className="text-sm text-muted-foreground">
                Create a professional PDF certificate of your net worth
              </p>
            </div>
            <Button
              size="lg"
              className="h-12 px-8 text-base shadow-lg hover:shadow-xl transition-all"
              onClick={handleGeneratePdf}
            >
              <FileDown className="mr-2 h-5 w-5" />
              Generate Certificate
            </Button>
          </Card>
        </div>
      </main>

      <footer className="border-t bg-card py-6 text-center">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Net Worth Certificate</span>
          {" "}&mdash;{" "}
          <span className="inline-flex items-center gap-1">
            🔒 All data stays securely in your browser
          </span>
        </p>
      </footer>
    </div>
  );
}
