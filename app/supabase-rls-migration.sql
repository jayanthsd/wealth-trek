-- =========================================================================
-- RLS Migration: Enable Row Level Security with Clerk Third-Party Auth
-- Run this in the Supabase SQL Editor AFTER setting up Clerk Third-Party Auth
-- =========================================================================
--
-- Setup steps:
-- 1. Configure Clerk instance for Supabase compatibility (use Clerk dashboard)
-- 2. Add Third-Party Auth integration in Supabase dashboard
-- 3. Enable the integration and configure your Clerk domain
--
-- The new integration uses auth.uid() which automatically extracts the user ID
-- from the Clerk session token
-- =========================================================================

-- =========================================================================
-- statements
-- =========================================================================
ALTER TABLE statements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own statements" ON statements;
CREATE POLICY "Users can view own statements"
  ON statements FOR SELECT
  USING ((select auth.jwt() ->> 'sub') = user_id);

DROP POLICY IF EXISTS "Users can insert own statements" ON statements;
CREATE POLICY "Users can insert own statements"
  ON statements FOR INSERT
  WITH CHECK ((select auth.jwt() ->> 'sub') = user_id);

DROP POLICY IF EXISTS "Users can update own statements" ON statements;
CREATE POLICY "Users can update own statements"
  ON statements FOR UPDATE
  USING ((select auth.jwt() ->> 'sub') = user_id)
  WITH CHECK ((select auth.jwt() ->> 'sub') = user_id);

DROP POLICY IF EXISTS "Users can delete own statements" ON statements;
CREATE POLICY "Users can delete own statements"
  ON statements FOR DELETE
  USING ((select auth.jwt() ->> 'sub') = user_id);

-- =========================================================================
-- snapshots
-- =========================================================================
ALTER TABLE snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own snapshots" ON snapshots;
CREATE POLICY "Users can view own snapshots"
  ON snapshots FOR SELECT
  USING ((select auth.jwt() ->> 'sub') = user_id);

DROP POLICY IF EXISTS "Users can insert own snapshots" ON snapshots;
CREATE POLICY "Users can insert own snapshots"
  ON snapshots FOR INSERT
  WITH CHECK ((select auth.jwt() ->> 'sub') = user_id);

DROP POLICY IF EXISTS "Users can update own snapshots" ON snapshots;
CREATE POLICY "Users can update own snapshots"
  ON snapshots FOR UPDATE
  USING ((select auth.jwt() ->> 'sub') = user_id)
  WITH CHECK ((select auth.jwt() ->> 'sub') = user_id);

DROP POLICY IF EXISTS "Users can delete own snapshots" ON snapshots;
CREATE POLICY "Users can delete own snapshots"
  ON snapshots FOR DELETE
  USING ((select auth.jwt() ->> 'sub') = user_id);

-- =========================================================================
-- subscriptions
-- =========================================================================
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING ((select auth.jwt() ->> 'sub') = user_id);

DROP POLICY IF EXISTS "Users can insert own subscriptions" ON subscriptions;
CREATE POLICY "Users can insert own subscriptions"
  ON subscriptions FOR INSERT
  WITH CHECK ((select auth.jwt() ->> 'sub') = user_id);

-- =========================================================================
-- goals
-- =========================================================================
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own goals" ON goals;
CREATE POLICY "Users can view own goals"
  ON goals FOR SELECT
  USING ((select auth.jwt() ->> 'sub') = user_id);

DROP POLICY IF EXISTS "Users can insert own goals" ON goals;
CREATE POLICY "Users can insert own goals"
  ON goals FOR INSERT
  WITH CHECK ((select auth.jwt() ->> 'sub') = user_id);

DROP POLICY IF EXISTS "Users can update own goals" ON goals;
CREATE POLICY "Users can update own goals"
  ON goals FOR UPDATE
  USING ((select auth.jwt() ->> 'sub') = user_id)
  WITH CHECK ((select auth.jwt() ->> 'sub') = user_id);

DROP POLICY IF EXISTS "Users can delete own goals" ON goals;
CREATE POLICY "Users can delete own goals"
  ON goals FOR DELETE
  USING ((select auth.jwt() ->> 'sub') = user_id);

-- =========================================================================
-- chat_messages
-- =========================================================================
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own chat_messages" ON chat_messages;
CREATE POLICY "Users can view own chat_messages"
  ON chat_messages FOR SELECT
  USING ((select auth.jwt() ->> 'sub') = user_id);

DROP POLICY IF EXISTS "Users can insert own chat_messages" ON chat_messages;
CREATE POLICY "Users can insert own chat_messages"
  ON chat_messages FOR INSERT
  WITH CHECK ((select auth.jwt() ->> 'sub') = user_id);

DROP POLICY IF EXISTS "Users can update own chat_messages" ON chat_messages;
CREATE POLICY "Users can update own chat_messages"
  ON chat_messages FOR UPDATE
  USING ((select auth.jwt() ->> 'sub') = user_id)
  WITH CHECK ((select auth.jwt() ->> 'sub') = user_id);

DROP POLICY IF EXISTS "Users can delete own chat_messages" ON chat_messages;
CREATE POLICY "Users can delete own chat_messages"
  ON chat_messages FOR DELETE
  USING ((select auth.jwt() ->> 'sub') = user_id);

-- =========================================================================
-- user_profiles
-- =========================================================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING ((select auth.jwt() ->> 'sub') = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK ((select auth.jwt() ->> 'sub') = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING ((select auth.jwt() ->> 'sub') = user_id)
  WITH CHECK ((select auth.jwt() ->> 'sub') = user_id);
