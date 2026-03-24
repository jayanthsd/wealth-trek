import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "networth.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS statements (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      statement_type TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL CHECK(category IN ('asset', 'liability')),
      closing_balance REAL NOT NULL CHECK(closing_balance >= 0),
      ownership_percentage REAL NOT NULL CHECK(ownership_percentage >= 1 AND ownership_percentage <= 100),
      source_document_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS snapshots (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      total_assets REAL NOT NULL,
      total_liabilities REAL NOT NULL,
      net_worth REAL NOT NULL,
      entries_json TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_snapshots_user_date ON snapshots(user_id, date);
    CREATE INDEX IF NOT EXISTS idx_statements_user ON statements(user_id);
  `);

  return db;
}
