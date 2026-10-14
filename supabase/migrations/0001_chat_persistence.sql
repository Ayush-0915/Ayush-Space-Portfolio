-- ==============================================================================
-- Migration: 0001_chat_persistence.sql
-- Description: Chatbot conversation persistence with session hash ownership,
--              Row Level Security, strict constraints, and 30-day retention cleanup.
-- Safe to rerun: YES (idempotent DDL statements)
-- ==============================================================================

-- 1. CONVERSATIONS TABLE
-- Stores anonymous conversation sessions mapped to a cryptographic SHA-256 hash
-- of the visitor's browser session token (the raw bearer token is NEVER stored).
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token_hash VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL DEFAULT 'New Conversation',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- 2. MESSAGES TABLE
-- Stores conversational turns (user queries and assistant responses)
-- Cascades delete when parent conversation is removed.
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 8000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- 3. PERFORMANCE INDEXES
-- Index for rapid lookup of conversations owned by a specific session token hash
CREATE INDEX IF NOT EXISTS idx_conversations_session_token_hash
  ON conversations(session_token_hash);

-- Index for 30-day retention cleanup queries based on updated_at
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at
  ON conversations(updated_at);

-- Composite index for chronological message retrieval per conversation
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id_created_at
  ON messages(conversation_id, created_at ASC);

-- 4. ROW LEVEL SECURITY (RLS)
-- Enable RLS on all tables to prevent unauthorized direct client access.
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Explicitly deny all direct public/anonymous operations via Supabase PostgREST client.
-- The Next.js server-side route handles authentication, session validation, and accesses
-- the database as a trusted mediator using the server-side client.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'conversations' AND policyname = 'Deny direct public access to conversations'
  ) THEN
    CREATE POLICY "Deny direct public access to conversations"
      ON conversations
      FOR ALL
      TO anon
      USING (false);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Deny direct public access to messages'
  ) THEN
    CREATE POLICY "Deny direct public access to messages"
      ON messages
      FOR ALL
      TO anon
      USING (false);
  END IF;
END $$;

-- 5. AUTOMATIC TIMESTAMP UPDATE TRIGGER
-- Keeps updated_at refreshed whenever a conversation record is modified.
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_conversation_timestamp ON conversations;
CREATE TRIGGER trg_update_conversation_timestamp
BEFORE UPDATE ON conversations
FOR EACH ROW
EXECUTE FUNCTION update_conversation_timestamp();

-- 6. THIRTY-DAY RETENTION CLEANUP FUNCTION
-- Deletes conversations inactive for more than 30 days (cascades to all associated messages).
CREATE OR REPLACE FUNCTION cleanup_expired_conversations()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM conversations
  WHERE updated_at < timezone('utc'::text, now()) - INTERVAL '30 days';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- 7. CONDITIONAL PG_CRON SCHEDULER REGISTRATION
-- If the pg_cron extension is active on the Supabase project, schedule daily execution at 03:00 UTC.
-- (If pg_cron is disabled on the free tier, cleanup can be triggered via external cron or server helper).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
  ) THEN
    -- Unsched existing job if present to avoid duplication
    PERFORM cron.unschedule('daily-cleanup-expired-conversations')
    WHERE EXISTS (
      SELECT 1 FROM cron.job WHERE jobname = 'daily-cleanup-expired-conversations'
    );

    PERFORM cron.schedule(
      'daily-cleanup-expired-conversations',
      '0 3 * * *',
      'SELECT cleanup_expired_conversations();'
    );
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'pg_cron registration skipped or not permitted in current role.';
END $$;
