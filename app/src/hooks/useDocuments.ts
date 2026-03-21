"use client";

import { useState, useEffect, useCallback } from "react";
import { UploadedDocument } from "@/types";

const STORAGE_KEY = "nwc_documents";

export function useDocuments() {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setDocuments(JSON.parse(stored));
      }
    } catch {
      // ignore parse errors
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
    }
  }, [documents, loaded]);

  const addDocuments = useCallback((docs: UploadedDocument[]) => {
    setDocuments((prev) => [...prev, ...docs]);
  }, []);

  const deleteDocument = useCallback(async (doc: UploadedDocument) => {
    try {
      await fetch(`/api/documents/${doc.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storedPath: doc.storedPath }),
      });
    } catch {
      // continue with local removal even if server delete fails
    }
    setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
  }, []);

  return { documents, addDocuments, deleteDocument, loaded };
}
