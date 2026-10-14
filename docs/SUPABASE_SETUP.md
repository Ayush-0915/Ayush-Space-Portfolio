# Supabase Database Setup & Configuration Guide

**Project:** `Ayush-Space-Portfolio` Chatbot Persistence  
**Phase:** Phase 2 — Supabase Database Schema & Persistence  
**Migration Path:** `supabase/migrations/0001_chat_persistence.sql`  

This document outlines the setup, schema migration, Row Level Security (RLS) policies, 30-day retention scheduling, and verification procedures for the portfolio chatbot's Supabase PostgreSQL database.

---

## 1. Required Environment Variables

Configure these variables in your local `.env.local` file (for local development) and in your deployment dashboard (e.g. Vercel, Netlify):

| Variable Name | Exposure | Required By | Description |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | **Public** (Browser & Server) | Frontend & Backend | Your Supabase Project URL (`https://<project-ref>.supabase.co`). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Public** (Browser & Server) | Frontend Fallback | Standard anonymous public key. Protected by Row Level Security. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server-Side ONLY** | Server Routes / Repository | Privileged key with administrative access. **NEVER** prefix with `NEXT_PUBLIC_` and never expose to client bundles. |

> [!WARNING]
> The `SUPABASE_SERVICE_ROLE_KEY` bypasses PostgreSQL Row Level Security. It must only be referenced in server-side modules (`lib/supabase/server.ts`, route handlers) and must never be exposed to the browser. Every server-side repository function independently validates session token hash ownership before returning or modifying any data.

---

## 2. Applying the Database Migration

You can apply the migration using either the **Supabase Web Dashboard SQL Editor** or the **Supabase CLI**.

### Method A: Supabase Web Dashboard (Recommended for Quick Setup)
1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open your project and navigate to the **SQL Editor** from the left-hand menu.
3. Click **New Query**.
4. Copy the entire contents of [`supabase/migrations/0001_chat_persistence.sql`](file:///c:/Users/ayush/Desktop/Private/Space-Portfolio/supabase/migrations/0001_chat_persistence.sql).
5. Paste the SQL into the editor and click **Run**.
6. Ensure the result pane reports `"Success. No rows returned"` or confirms DDL execution.

### Method B: Supabase CLI (For CI/CD or Local Development)
If you have the Supabase CLI installed:
```bash
supabase db push
# or to link and execute directly:
supabase link --project-ref <your-project-ref>
supabase db remote commit
```

---

## 3. Database Schema Overview

### Tables Created
1. **`conversations`:**
   - `id` (UUID, Primary Key, generated via `gen_random_uuid()`).
   - `session_token_hash` (`VARCHAR(64)`, NOT NULL): SHA-256 hash of the visitor's random session token.
   - `title` (`VARCHAR(255)`, default `'New Conversation'`).
   - `created_at` (`TIMESTAMPTZ`, UTC).
   - `updated_at` (`TIMESTAMPTZ`, UTC): Refreshed on every message turn to track session activity.
   - `metadata` (`JSONB`, default `'{}'`).

2. **`messages`:**
   - `id` (UUID, Primary Key, generated via `gen_random_uuid()`).
   - `conversation_id` (UUID, Foreign Key referencing `conversations(id)` with `ON DELETE CASCADE`).
   - `role` (`VARCHAR(20)`, CHECK constraint: `role IN ('user', 'assistant')`).
   - `content` (`TEXT`, CHECK constraint: `char_length(content) > 0 AND char_length(content) <= 8000`).
   - `created_at` (`TIMESTAMPTZ`, UTC).
   - `metadata` (`JSONB`, default `'{}'`).

### Performance Indexes
- `idx_conversations_session_token_hash` on `conversations(session_token_hash)`.
- `idx_conversations_updated_at` on `conversations(updated_at)`.
- `idx_messages_conversation_id_created_at` on `messages(conversation_id, created_at ASC)`.

---

## 4. Row Level Security (RLS) Verification

RLS is enabled on both `conversations` and `messages`. Direct public access via PostgREST is denied by default to prevent client-side data tampering:
- Policy: `"Deny direct public access to conversations"` for role `anon` (`USING (false)`).
- Policy: `"Deny direct public access to messages"` for role `anon` (`USING (false)`).

### Verifying RLS in Supabase Dashboard
1. Go to **Authentication > Policies** or **Table Editor > Table Settings**.
2. Confirm that **Row Level Security (RLS)** is marked **Enabled (Green)** for both `conversations` and `messages`.

---

## 5. Thirty-Day Retention & Expiration Cleanup

Conversations are retained for **30 days from their last activity** (`updated_at`). When a conversation is deleted, all associated messages are deleted atomically via `ON DELETE CASCADE`.

### Automated Database Scheduler (`pg_cron`)
The migration defines a stored procedure:
```sql
SELECT cleanup_expired_conversations();
```

If the `pg_cron` extension is active in your Supabase project (available in **Database > Extensions**), the migration automatically schedules a daily cron job at `03:00 UTC`:
```sql
cron.schedule('daily-cleanup-expired-conversations', '0 3 * * *', 'SELECT cleanup_expired_conversations();');
```

### Manual / Dashboard Alternative (if `pg_cron` is disabled)
If your Supabase project tier does not permit `pg_cron`:
1. The server persistence module provides `deleteExpiredConversations()`.
2. This can be invoked periodically via an external cron ping (e.g. Vercel Cron or GitHub Action).

---

## 6. Local Connection Smoke Test

To verify connectivity once environment variables are added to `.env.local`:
1. Ensure `.env.local` contains:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
   ```
2. Run the quick validation script:
   ```bash
   node -e "
   const { createClient } = require('@supabase/supabase-js');
   require('dotenv').config({ path: '.env.local' });
   const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
   client.from('conversations').select('count', { count: 'exact', head: true })
     .then(res => console.log('Supabase Connection Test:', res.error ? res.error.message : 'SUCCESS (table accessible)'))
     .catch(err => console.error('Connection failed:', err.message));
   "
   ```

---

## 7. Outstanding Manual Setup Steps for Project Owner

1. **Create Supabase Project:** If not already created, set up a project at [supabase.com](https://supabase.com).
2. **Execute Migration:** Run [`supabase/migrations/0001_chat_persistence.sql`](file:///c:/Users/ayush/Desktop/Private/Space-Portfolio/supabase/migrations/0001_chat_persistence.sql) in the Supabase SQL Editor.
3. **Copy Credentials:** Copy Project URL and Service Role Key from **Project Settings > API** into `.env.local` and your hosting dashboard (Netlify/Vercel).
4. **Confirm `pg_cron`:** In **Database > Extensions**, enable `pg_cron` if available.
