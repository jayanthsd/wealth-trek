"use client";

import { useEffect } from "react";
import { migrateLocalStorageToDb, needsMigration } from "@/utils/migrateLocalStorageToDb";

/**
 * Client component to run localStorage to database migration
 * This runs once on app initialization if localStorage has data
 */
export function MigrationRunner() {
  useEffect(() => {
    if (!needsMigration()) return;

    // Run migration
    migrateLocalStorageToDb().then((result) => {
      if (result.success) {
        console.log("Migration completed:", result.migrated);
      } else {
        console.error("Migration errors:", result.errors);
      }
    });
  }, []);

  return null; // This component doesn't render anything
}
