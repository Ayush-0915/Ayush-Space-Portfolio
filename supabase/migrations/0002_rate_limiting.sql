-- ==============================================================================
-- Migration: 0002_rate_limiting.sql
-- Description: Atomic rate limiting table, cleanup index, and stored procedure
--              for distributed rate limiting across serverless instances.
-- Safe to rerun: YES (idempotent DDL statements)
-- ==============================================================================

-- 1. RATE LIMITS TABLE
CREATE TABLE IF NOT EXISTS rate_limits (
  key VARCHAR(128) PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  expires_at TIMESTAMPTZ NOT NULL
);

-- Index for efficient expired record cleanup
CREATE INDEX IF NOT EXISTS idx_rate_limits_expires_at
  ON rate_limits(expires_at);

-- 2. ROW LEVEL SECURITY (RLS)
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'rate_limits' AND policyname = 'Deny direct public access to rate_limits'
  ) THEN
    CREATE POLICY "Deny direct public access to rate_limits"
      ON rate_limits
      FOR ALL
      TO anon
      USING (false);
  END IF;
END $$;

-- 3. ATOMIC RATE LIMIT CHECK FUNCTION
-- Increments request count for the key within window_seconds, returning whether the request is allowed.
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_key VARCHAR(128),
  p_max_requests INTEGER,
  p_window_seconds INTEGER
)
RETURNS TABLE (
  allowed BOOLEAN,
  remaining INTEGER,
  retry_after INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_now TIMESTAMPTZ := timezone('utc'::text, now());
  v_expires_at TIMESTAMPTZ := v_now + (p_window_seconds || ' seconds')::INTERVAL;
  v_record RECORD;
BEGIN
  -- Remove expired window for this key
  DELETE FROM rate_limits WHERE key = p_key AND expires_at <= v_now;

  -- Insert new counter or increment existing
  INSERT INTO rate_limits (key, count, window_start, expires_at)
  VALUES (p_key, 1, v_now, v_expires_at)
  ON CONFLICT (key) DO UPDATE
  SET count = rate_limits.count + 1
  RETURNING rate_limits.count, rate_limits.expires_at INTO v_record;

  IF v_record.count > p_max_requests THEN
    RETURN QUERY SELECT
      FALSE,
      0,
      GREATEST(1, EXTRACT(EPOCH FROM (v_record.expires_at - v_now))::INTEGER);
  ELSE
    RETURN QUERY SELECT
      TRUE,
      GREATEST(0, p_max_requests - v_record.count),
      0;
  END IF;
END;
$$;

-- 4. CLEANUP HELPER FUNCTION
CREATE OR REPLACE FUNCTION cleanup_expired_rate_limits()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM rate_limits WHERE expires_at < timezone('utc'::text, now());
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;
