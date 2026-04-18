-- Supabase Postgres migration: popular_banks reference table
-- Run this in the Supabase SQL Editor

-- =========================================================================
-- popular_banks (public reference data — no RLS needed)
-- =========================================================================
CREATE TABLE IF NOT EXISTS popular_banks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_popular_banks_sort ON popular_banks(sort_order);

-- =========================================================================
-- Seed data: 14 popular Indian banks
-- =========================================================================
INSERT INTO popular_banks (name, sort_order) VALUES
  ('SBI', 1),
  ('HDFC Bank', 2),
  ('ICICI Bank', 3),
  ('Axis Bank', 4),
  ('Kotak Mahindra Bank', 5),
  ('Bank of Baroda', 6),
  ('PNB', 7),
  ('Canara Bank', 8),
  ('Union Bank', 9),
  ('IndusInd Bank', 10),
  ('IDFC First Bank', 11),
  ('Yes Bank', 12),
  ('Federal Bank', 13),
  ('Bank of India', 14)
ON CONFLICT (name) DO NOTHING;
