"use client";

import { UploadedDocument } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Image, Trash2, Sparkles, Loader2, Files } from "lucide-react";

interface DocumentListProps {
  documents: UploadedDocument[];
  onDelete: (doc: UploadedDocument) => void;
  onExtract: (doc: UploadedDocument) => void;
  extractingId: string | null;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

function FileIcon({ fileType }: { fileType: string }) {
  if (fileType === "application/pdf") {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-500">
        <FileText className="h-5 w-5" />
      </div>
    );
  }
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
      <Image className="h-5 w-5" />
    </div>
  );
}

export function DocumentList({
  documents,
  onDelete,
  onExtract,
  extractingId,
}: DocumentListProps) {
  if (documents.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Files className="h-4 w-4" />
          </div>
          <CardTitle className="text-lg font-semibold">
            Uploaded Documents
            <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-sm font-normal text-muted-foreground">
              {documents.length}
            </span>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-3 rounded-xl border bg-muted/20 p-3 transition-colors hover:bg-muted/40"
            >
              <FileIcon fileType={doc.fileType} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {doc.originalName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(doc.size)} &middot; {formatDate(doc.uploadedAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={extractingId === doc.id ? "secondary" : "default"}
                  onClick={() => onExtract(doc)}
                  disabled={extractingId === doc.id}
                  className="shadow-sm"
                >
                  {extractingId === doc.id ? (
                    <>
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                      Extracting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-1.5 h-4 w-4" />
                      Extract Data
                    </>
                  )}
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => onDelete(doc)}
                  disabled={extractingId === doc.id}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
