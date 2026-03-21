"use client";

import { useCallback, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, FileUp } from "lucide-react";
import { UploadedDocument } from "@/types";

const ALLOWED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
];
const MAX_SIZE = 20 * 1024 * 1024; // 20MB

interface DocumentUploadProps {
  onUploaded: (docs: UploadedDocument[]) => void;
}

export function DocumentUpload({ onUploaded }: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFiles = useCallback((files: File[]): string | null => {
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return `File "${file.name}" has unsupported type. Allowed: PDF, PNG, JPG, JPEG.`;
      }
      if (file.size > MAX_SIZE) {
        return `File "${file.name}" exceeds the 20MB size limit.`;
      }
    }
    return null;
  }, []);

  const uploadFiles = useCallback(
    async (files: File[]) => {
      const validationError = validateFiles(files);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);
      setUploading(true);

      try {
        const formData = new FormData();
        for (const file of files) {
          formData.append("files", file);
        }

        const response = await fetch("/api/documents/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Upload failed");
        }

        const data = await response.json();
        onUploaded(data.documents);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [validateFiles, onUploaded]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (files.length > 0) {
        uploadFiles(files);
      }
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [uploadFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        uploadFiles(files);
      }
    },
    [uploadFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileUp className="h-4 w-4" />
          </div>
          <CardTitle className="text-lg font-semibold">Upload Financial Documents</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all duration-200 ${
            dragOver
              ? "border-primary bg-primary/5 scale-[1.01] shadow-lg"
              : "border-border hover:border-primary/50 hover:bg-muted/30"
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Uploading documents...</p>
            </div>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="mb-1 text-sm font-medium text-foreground">
                Drag & drop files here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Supports PDF, PNG, JPG, JPEG (max 20MB each)
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => inputRef.current?.click()}
                className="shadow-sm"
              >
                <Upload className="mr-2 h-4 w-4" />
                Browse Files
              </Button>
              <input
                ref={inputRef}
                type="file"
                multiple
                accept=".pdf,.png,.jpg,.jpeg"
                className="hidden"
                onChange={handleFileChange}
              />
            </>
          )}
        </div>

        {error && (
          <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
