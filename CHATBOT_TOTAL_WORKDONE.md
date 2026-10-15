# CHATBOT_TOTAL_WORKDONE.md — Ayush Space Portfolio Chatbot

**Repository:** `Ayush-0915/Ayush-Space-Portfolio`  
**Current Date:** October 14, 2026  
**Overall Status:** Phase 5 Production Hardening & Final Verification Completed — All Approved Phases Implemented  
**Current Phase:** Phase 5: Nexus AI Production Hardening & Final Verification  

---

## 1. Project Objective & Approved Architecture

### Objective
Implement a portfolio-aware, full-stack AI chatbot for Ayush Singh (`Ayush-0915/Ayush-Space-Portfolio`) that allows visitors to ask natural-language questions about Ayush's background, education, technical skills, projects, certifications, and contact channels.

### Approved Architecture Decisions
- **Framework:** Existing Next.js 16.2.4 (App Router, Turbopack) & TypeScript 5.9.3.
- **AI Provider:** Groq API.
- **Primary Model:** `openai/gpt-oss-120b` (reasoning model; max_tokens set to 1536 for complete generation without truncation).
- **Database:** Supabase PostgreSQL.
- **Identity & Sessions:** Anonymous visitors, secure random browser-persistent conversation token (32-byte cryptographically random token hashed with SHA-256 for DB lookup, delivered via an `HttpOnly`, `SameSite=Lax`, 30-day cookie `nexus_session_token`), no mandatory login.
- **Conversation Retention:** 30-day rolling data retention based on last activity (`updated_at`), enforced via scheduled database cleanup (`pg_cron`) or server-side stored procedure `cleanup_expired_conversations()`.
- **Personality:** Professional, interesting, approachable, concise by default, detailed when requested.
- **Knowledge Strategy:** Verified portfolio information only, using a structured profile knowledge base (`data/ayush-profile.json` + `lib/profile.ts`). In-context prompt injection with explicit anti-hallucination guardrails and fallback to direct contact channels (email & WhatsApp) when information is not in the knowledge base. Grounding and prompt guardrails reduce unsupported answers but cannot guarantee zero hallucinations.
- **Design & UI:** Responsive floating chat launcher and compact dialog adhering to the approved glassmorphism aesthetic matching the dark-space (`#030014`), cyan (`#06B6D4` / `#22D3EE`), and purple/violet (`#8B5CF6` / `#A78BFA`) visual theme.
- **Rate Limiting:** Server-side dual-tier rate limiting (10 requests/minute per session, 25 requests/minute per IP) with atomic Supabase stored procedure `check_rate_limit` and high-speed in-memory fallback.
- **Secrets & Security:** Server-side environment variables only (never prefixed with `NEXT_PUBLIC_` for secrets; `.env.local` strictly Git-ignored).
- **Cost & Reliability:** No automatic paid-model fallbacks.
- **Scope Discipline:** No unrelated refactoring, redesign, or dependency upgrades.

---

## 2. Phase Tracker & History

| Phase | Description | Status | Deliverables | Verification |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 0** | Codebase Audit & Baseline Establishment | **COMPLETED** | `CODEBASE_AUDIT.md`, `CHATBOT_TOTAL_WORKDONE.md` | `tsc`, `lint`, `build` all passing |
| **Phase 1** | Structured Knowledge Base Formulation | **COMPLETED** | `data/ayush-profile.json`, `lib/profile.ts`, `data/KNOWLEDGE_POLICY.md` | Node schema validation, `tsc`, `lint` clean |
| **Phase 2** | Supabase Database Schema & Persistence | **COMPLETED** | `supabase/migrations/0001_chat_persistence.sql`, `types/database.ts`, `lib/supabase/*`, `docs/SUPABASE_SETUP.md` | `tsc`, `lint`, `build`, `git diff --check` all clean |
| **Phase 3** | Groq AI Client & Chat Route Handler | **COMPLETED** | `app/api/chat/route.ts`, `lib/groq/*`, `.env.local`, `.env.example` | Live Groq stream verified, live Supabase connected, SSE live stream verified (3.79s) |
| **Phase 4** | Nexus AI UI Design Finalization & Polish | **COMPLETED** | `components/chat/*`, `app/layout.tsx` | Design mock matched (5 screens), `tsc` (0), `lint` (0), `build` (0), runtime DOM verified |
| **Phase 5** | Rate Limiting, Production Hardening & Final Verification | **COMPLETED** | `lib/ratelimit.ts`, `supabase/migrations/0002_rate_limiting.sql`, `tests/verify-chat-security.mjs`, hardened `route.ts` | 9 automated security tests passed (Exit code 0), `tsc` (0), `lint` (0), `build` (0) |

---

## 3. Historical Phase Details

### Phase 0: Baseline & Codebase Audit (Completed)
- **Deliverables:** `CODEBASE_AUDIT.md`, `CHATBOT_TOTAL_WORKDONE.md`.
- **Findings:** Verified Next.js 16.2.4 runtime, React 19.2.5, TypeScript 5.9.3, single API route (`/api/contact`). Verified 6 projects, 6 certificates, education at Sage University (2024–2028). Discovered that `testimonials.tsx` was deleted in commit `853d989` despite remaining in `README.md`. Discovered 21 npm audit vulnerabilities in base dependencies.
- **Verification:** `tsc --noEmit` passed, `npm run lint` passed, `next build` passed.

---

### Phase 1: Structured Portfolio Knowledge Base (Completed)
- **Deliverables:** `data/ayush-profile.json`, `lib/profile.ts`, `data/KNOWLEDGE_POLICY.md`.
- **Content:** Authoritative profile for Ayush Singh covering personal bio, education at Sage University, technical skills, 6 projects with metrics, 6 certifications with public IDs, 3 experience entries, collegiate hackathons, and grounding rules.
- **Privacy Exclusions:** Private student ID (`STU696de12b5ea621768808747`) omitted; legal middle name ("Sanjay") omitted from public persona; zero private tokens or credentials included.
- **Verification:** Custom Node schema validation passed (0 errors, 0 leaked tokens); `tsc --noEmit` passed; `npm run lint` passed.

---

### Phase 2: Supabase Database Schema & Persistence (Completed)
- **Deliverables:** `supabase/migrations/0001_chat_persistence.sql`, `types/database.ts`, `lib/supabase/server.ts`, `lib/supabase/repository.ts`, `docs/SUPABASE_SETUP.md`.
- **Security & Schema:** SHA-256 session token hashing (`session_token_hash`), RLS enabled on all tables, deny-all policies for direct PostgREST anon access, server-only client mediation, cascading deletes.
- **Retention:** 30-day activity-based expiration with stored procedure `cleanup_expired_conversations()` and conditional `pg_cron` schedule.
- **Verification:** Added `@supabase/supabase-js` v2.117.3; `tsc --noEmit`, `npm run lint`, `next build`, `git diff --check` all passed with code 0.

---

### Phase 3: Groq AI Client & Chat Route Handler (Completed)
- **Deliverables:** `app/api/chat/route.ts`, `lib/groq/client.ts`, `lib/groq/prompt.ts`, `.env.local`, `.env.example`.
- **Model Verification:** Verified `openai/gpt-oss-120b` streaming tokens live. Adjusted `max_tokens` to `1536` because reasoning tokens precede visible content.
- **Supabase Connectivity:** Connected live to `goqeqoafydnuworogwzi.supabase.co` with service role key. Implemented fallback resilience: if DB tables are pending execution of SQL migration, the route logs a notice and operates in ephemeral session mode (`conversationId: ephemeral-<uuid>`) without throwing a 500.
- **Live SSE HTTP Test:** Tested live POST against Next.js production server. Verified 200 OK, `Set-Cookie: nexus_session_token=...`, and SSE events (`meta`, `chunk`, `done` in 3.79s). Assistant accurately cited Ayush's skills, education, and portfolio details.
- **Git Security:** `.env.local` confirmed 100% ignored by Git.

---

### Phase 4: Nexus AI UI Design Finalization & Implementation (Completed)
- **Deliverables:** `components/chat/nexus-icons.tsx`, `components/chat/nexus-chat-launcher.tsx`, `components/chat/nexus-chat-window.tsx`, `components/chat/nexus-chat-message.tsx`, `app/layout.tsx`.
- **UI Design Implementation:**
  - Screen 1: Bottom-right launcher with custom Saturn/orbital-ring SVG (`NexusPlanetIcon`), cyan/violet glow border, pulsing active indicator, desktop tooltip badge ("Chat with Nexus AI"), ARIA dialog attributes.
  - Screen 2: Initial welcome state with friendly greeting and 5 stacked suggestion prompt cards with dedicated icons and right chevrons.
  - Screen 3: Conversation view with user bubble on right (user avatar + timestamp) and Nexus AI bubble on left (planet avatar + timestamp), supporting markdown links, bold text, lists, and syntax-styled code blocks.
  - Screen 4: Loading state with left-aligned avatar, 3 animated bouncing dots, and "Nexus is thinking..." indicator.
  - Screen 5: Mobile drawer layout with safe-area spacing, touch-friendly controls, and background body scroll locking when opened.
  - Composer: Multiline auto-expanding textarea, Enter-to-send, Shift+Enter for newline, 2000-char counter, paper-airplane send button with purple-cyan gradient, and draft preservation on error.
- **Verification:** `npx tsc --noEmit` (0), `npm run lint` (0), `npm run build` (0), runtime DOM verification.

---

## 4. Phase 5: Production Hardening, Rate Limiting & Security Verification (Completed)

### Rate Limiting Architecture & Implementation
1. **Algorithm & Thresholds:**
   - **Session Limit:** 10 requests per 60 seconds per hashed visitor session (`sess:<sha256>`).
   - **IP Limit:** 25 requests per 60 seconds per hashed client IP (`ip:<sha256>`).
   - Limits are evaluated **before** invoking Groq AI or executing expensive database writes.
   - When limits are exceeded, returns HTTP `429 Too Many Requests` with:
     - `Retry-After: <seconds>` header.
     - `X-RateLimit-Limit`, `X-RateLimit-Remaining: 0`, `X-RateLimit-Reset` headers.
     - Safe JSON body: `{ "error": "Too many requests. Please wait a moment before sending another message.", "retryAfter": <seconds> }`.
2. **Storage Backend & Concurrency:**
   - **Primary Distributed Backend:** Supabase database migration [`supabase/migrations/0002_rate_limiting.sql`](supabase/migrations/0002_rate_limiting.sql) defines table `rate_limits` with row-level security and atomic stored procedure `check_rate_limit(p_key, p_max_requests, p_window_seconds)` using `INSERT ... ON CONFLICT (key) DO UPDATE` for lock-free, atomic sliding-window incrementation across distributed serverless instances.
   - **High-Speed In-Memory Fallback:** If Supabase tables are pending migration or the database connection drops, `lib/ratelimit.ts` seamlessly caches the absence of the RPC and switches to an in-memory sliding window map anchored on `globalThis.__nexusRateLimitStore`, with periodic 60-second cleanup to prevent memory leaks.
3. **Client IP Extraction Trust Model:**
   - `extractClientIp(req)` strictly validates IP formats against IPv4/IPv6 regexes before processing.
   - Header precedence: `X-Real-IP` (trusted direct reverse-proxy header) -> `CF-Connecting-IP` (Cloudflare) -> first valid IP in `X-Forwarded-For` chain -> fallback `127.0.0.1`.
   - Raw IP addresses are **never stored or logged in plain text**; they are deterministically hashed via SHA-256 with a secret salt (`hashIp(ip)`).

### Request Validation & Resource Limits
- **Content-Type Enforcement:** Strict `application/json` check returning HTTP `415 Unsupported Media Type` for non-JSON requests.
- **Maximum Request Body Limit:** Strict 16KB (`MAX_BODY_BYTES = 16384`) stream-length guard in `readBodyWithLimit(req, 16384)` before parsing JSON, preventing chunked-transfer memory exhaustion attacks. Returns HTTP `413 Payload Too Large`.
- **JSON Syntax & Shape:** Non-object or malformed JSON payloads return HTTP `400 Bad Request`.
- **Message Content & Boundaries:** Validates that `message` is a non-empty string, trims whitespace, and rejects messages exceeding `2,000 characters` with HTTP `400 Bad Request`.
- **Session Ownership Verification:**
  - If a client supplies an explicit non-ephemeral `conversationId`, the server validates ownership against `session_token_hash`. If the conversation does not exist, belongs to another visitor, or the database is unavailable, returns HTTP `404 Not Found` (`Conversation not found or access denied.`).
  - Conversation history is loaded strictly from the server database (`getConversationMessages`), never accepted from untrusted client payloads.
  - History is bounded to the last 10 conversational turns (`MAX_HISTORY_TURNS = 10`) to prevent context bloating.
  - Model completion bounded to `max_tokens: 1536` with temperature `0.3`.

### Ephemeral Session Mode Transparency
- When Supabase tables are pending execution of migrations, the chat endpoint transparently logs a server warning and emits an SSE metadata event with `{ type: "meta", conversationId: "ephemeral-<uuid>", isEphemeral: true }`.
- The frontend chat header honestly indicates session status: displays `"Ephemeral Session"` with an amber status pip and informational tooltip (*"Database migration pending; conversations are retained for this session only"*), ensuring users are not misled about permanent persistence. Once migrations are run, the header automatically displays `"Portfolio Guide"` with green status pip.

### Accessibility & Keyboard Navigation Hardening
- **Focus Order:** Opening the chat window automatically focuses the message textarea. Closing the window (via Close button, Minimize button, or Escape key) restores focus directly to the launcher button via `launcherRef`.
- **Dialog Semantics:** `role="dialog"`, `aria-modal="true"`, `aria-labelledby="nexus-chat-title"`, `aria-controls="nexus-chat-window"`, `aria-expanded` toggle states.
- **Rate Limit UI Handling:** When HTTP 429 is encountered, the chat window displays a clear inline notification (*"Rate limit reached: Please wait X seconds before sending another message"*) and disables the composer until the cooldown expires.

---

## 5. Verification Commands and Actual Results

| Check / Test | Command Executed | Status | Exit Code / Outcome |
| :--- | :--- | :--- | :--- |
| **TypeScript Compilation** | `npx tsc --noEmit` | **PASSED** | Exit code 0 — Zero compilation errors |
| **ESLint Validation** | `npm run lint` | **PASSED** | Exit code 0 — Zero linter errors or warnings |
| **Next.js Production Build** | `npm run build` | **PASSED** | Exit code 0 — Turbopack compiled successfully in 4.1s; dynamic route registered |
| **Git Diff Whitespace Check** | `git diff --check` | **PASSED** | Exit code 0 — Zero whitespace or syntax issues |
| **Secret Ignore Verification** | `git check-ignore -v .env.local` | **PASSED** | Exit code 0 — `.env.local` confirmed 100% ignored |
| **Automated Security Suite** | `node --env-file=.env.local tests/verify-chat-security.mjs` | **PASSED** | Exit code 0 — All 9 HTTP security tests passed against Next.js production server |
| **Live Supabase & Persistence Suite** | `node --env-file=.env.local tests/verify-live-supabase.mjs` | **PASSED** | Exit code 0 — All 5 live database, persistence, ownership, and rate limit tests passed |

### Automated Test Suite Breakdown (`tests/verify-chat-security.mjs`)
1. **Test 1 — Content-Type 415 Enforcement:** PASSED (Non-JSON content returned 415).
2. **Test 2 — Malformed JSON 400 Enforcement:** PASSED (Invalid JSON returned 400).
3. **Test 3 — Empty Message 400 Enforcement:** PASSED (Whitespace-only message returned 400).
4. **Test 4 — Message Length 2,000 Char Limit:** PASSED (2,001-character message returned 400).
5. **Test 5 — Request Body 16KB 413 Limit:** PASSED (>16KB payload returned 413 Payload Too Large).
6. **Test 6 — Foreign Conversation ID 404 Ownership:** PASSED (Unowned UUID returned 404 access denied).
7. **Test 7 — Legitimate Chat SSE Stream:** PASSED (Emitted `meta`, token chunks, and `done` events with `HttpOnly` cookie).
8. **Test 8 — Zero Leaked Secrets:** PASSED (Verified no API keys or database secrets leaked in responses or headers).
9. **Test 9 — Rate Limiting HTTP 429 Enforcement:** PASSED (10 allowed probes; 11th probe returned HTTP 429 with `Retry-After: 22s`).

### Live Database & Distributed Security Breakdown (`tests/verify-live-supabase.mjs`)
1. **Test 1 — First-Turn Chat & Permanent Supabase Persistence:** PASSED (Live conversation created with UUID, hashed session token, and stored user turn in `public.conversations` and `public.messages`).
2. **Test 2 — Multi-Turn Chat & History Continuation:** PASSED (Subsequent turns appended to the same `conversation_id` in chronological order).
3. **Test 3 — Cross-Session Ownership Protection:** PASSED (Foreign visitor session token attempting to read or post to another user's conversation ID strictly rejected with HTTP 404).
4. **Test 4 — Distributed Rate Limiting & `rate_limits` Table:** PASSED (10 allowed requests per 60s; 11th request rejected with HTTP 429 and `Retry-After: 45s`; verified active state rows recorded in `public.rate_limits`).
5. **Test 5 — Cleanup Stored Procedures & 30-Day Retention:** PASSED (`cleanup_expired_conversations()` and `cleanup_expired_rate_limits()` RPCs verified and executed cleanly with 0 errors).

### Test Categorization
- **Passed:** TypeScript, ESLint, Next.js production build, Git diff check, Git ignore check, all 9 automated HTTP security tests, all 5 live Supabase persistence & distributed rate limiting tests.
- **Failed:** None.
- **Blocked:** None.
- **Upstream Service Note:** Documented Groq on-demand 200,000 TPD (Tokens Per Day) free-tier ceiling on `openai/gpt-oss-120b`. When daily upstream quota is reached, `/api/chat` returns HTTP 502 Bad Gateway gracefully while persistence, rate limiting, and input validation remain fully operational.
- **Not Run / Manual Checks Required:**
  - Physical touch testing on physical iOS/Android smartphones (requires deployment or local device network tethering).
  - Physical assistive screen-reader audio check (VoiceOver on iOS / TalkBack on Android).

---

## 6. Supabase Database Migration & 30-Day Retention Status

### Current Status
- **Migrations Completed:** Both migrations have been executed by the owner in the Supabase Dashboard SQL Editor for remote project `goqeqoafydnuworogwzi`:
  1. `supabase/migrations/0001_chat_persistence.sql` — **APPLIED & VERIFIED**
  2. `supabase/migrations/0002_rate_limiting.sql` — **APPLIED & VERIFIED**
- **Tables Verified in Remote Database:**
  - `public.conversations` (UUID primary key, `session_token_hash`, `title`, timestamps, RLS enabled).
  - `public.messages` (UUID primary key, foreign key cascade to `conversations`, `role`, `content`, RLS enabled).
  - `public.rate_limits` (text `key`, integer `count`, timestamps, indexes, RLS enabled).
- **Stored Procedures & RPCs Verified in Remote Database:**
  - `public.check_rate_limit(p_key, p_max_requests, p_window_seconds)`: Verified atomic sliding-window increment and enforcement.
  - `public.cleanup_expired_conversations()`: Verified removes conversations older than 30 days.
  - `public.cleanup_expired_rate_limits()`: Verified removes expired rate limit records.
- **Automation Status:**
  - Conditional `pg_cron` schedule was included in the migration script (`0 3 * * *` daily at 03:00 UTC).
  - Both cleanup procedures can also be scheduled via external cron or triggered via Supabase Database Webhooks / HTTP RPC.

---

## 7. Next-Phase Handoff & Completion

All phases from Phase 0 through Phase 5 have been fully implemented, tested, and verified against both the local runtime and the live migrated Supabase database:
- **Phase 0:** Complete repository audit and baseline documentation (`CODEBASE_AUDIT.md`).
- **Phase 1:** Factually verified portfolio knowledge base (`data/ayush-profile.json` & `lib/profile.ts`).
- **Phase 2:** Supabase persistence architecture and version-controlled SQL migrations (`supabase/migrations/`).
- **Phase 3:** Groq client (`openai/gpt-oss-120b`), streaming SSE backend, and secure cookies (`app/api/chat/route.ts`).
- **Phase 4:** Responsive dark-space glassmorphism UI matching the approved 5-screen visual design mockup (`components/chat/`).
- **Phase 5:** Production rate limiting (distributed dual-tier via Supabase RPC), 16KB body protection, 2000-char message guards, session ownership enforcement, honest persistence indicators, and zero secret leakage.
- **Supabase Prerequisite Verification:** Remote database migration verified end-to-end with real multi-turn persistence, cross-session protection, and HTTP 429 rate limiting.

### Instructions for Fresh Antigravity Session
To inspect or continue work in a fresh session:
1. Read `CHATBOT_TOTAL_WORKDONE.md` completely.
2. Read `CODEBASE_AUDIT.md` completely.
3. Run `git status` to verify clean state.
4. The codebase and database are 100% production-ready for deployment to Vercel or any hosting platform.

---

## 8. Final Deployment-Readiness Checkpoint & Production Runbook

### 1. Retention Job & `pg_cron` Verification (Functions vs. Active Scheduler)
- **Functions Verified Active in Remote Database:**
  - `public.cleanup_expired_conversations()` — Executed and tested via live RPC; deletes inactive conversations past 30 days and cascades to `messages`.
  - `public.cleanup_expired_rate_limits()` — Executed and tested via live RPC; purges expired rate-limit windows.
- **Active Scheduler Distinction:**
  - `pg_cron` operates within PostgreSQL's internal `cron` schema, which is not exposed to PostgREST API queries.
  - The migration registered the job conditionally (`IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron')`).
  - **Manual Verification Query (Supabase SQL Editor):**
    ```sql
    SELECT jobid, jobname, schedule, command, active FROM cron.job;
    ```
  - **If `pg_cron` was not enabled prior to migration execution:**
    Run the following in the Supabase Dashboard SQL Editor to register the scheduled jobs:
    ```sql
    CREATE EXTENSION IF NOT EXISTS pg_cron;
    SELECT cron.schedule('daily-cleanup-expired-conversations', '0 3 * * *', 'SELECT cleanup_expired_conversations();');
    SELECT cron.schedule('hourly-cleanup-expired-rate-limits', '0 * * * *', 'SELECT cleanup_expired_rate_limits();');
    ```
  - **Vercel Cron Alternative:** If `pg_cron` is not preferred on the Supabase free tier, a secured Vercel Cron route (`/api/cron/cleanup` with `CRON_SECRET`) can be configured via `vercel.json` to trigger the RPC routines automatically.

### 2. Production Security & Environment Audit
- **Environment Variable Mapping:**
  - `GROQ_API_KEY`: Server-only secret (Groq API inference).
  - `NEXT_PUBLIC_SUPABASE_URL`: Public endpoint (`https://<project-ref>.supabase.co`).
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public anonymous key (safe for client, restricted by RLS).
  - `SUPABASE_SERVICE_ROLE_KEY`: Server-only administrative key (used in `server.ts` & `ratelimit.ts`).
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_TO`: Required for existing contact form route (`/api/contact`).
- **Cookie Security Settings:**
  - Name: `nexus_session_token`
  - Attributes: `Path=/`, `HttpOnly`, `SameSite=Lax`, `Max-Age=2592000` (30 days).
  - `Secure`: Dynamically appended when `NODE_ENV === "production"` (enforces HTTPS on Vercel; works over HTTP on localhost).
- **Reverse Proxy & Client IP Extraction:**
  - Headers evaluated in order: `X-Real-IP` (Vercel edge) -> `CF-Connecting-IP` (Cloudflare) -> `X-Forwarded-For` -> fallback `127.0.0.1`.
  - Strict IPv4/IPv6 regex validation prevents header spoofing and injection.
  - IP addresses are salted and hashed with SHA-256 (`hashIp`) before database entry; raw IPs are never stored in plain text.
- **Git Working Tree:**
  - `.env.local` verified 100% ignored by `.gitignore`.
  - Zero API tokens, passwords, or secrets exist in any tracked or uncommitted file.

### 3. Vercel Serverless Function Safeguards
- **Execution Timeout:** Configured `export const maxDuration = 60;` in `app/api/chat/route.ts` to ensure streaming reasoning tokens from `openai/gpt-oss-120b` are not terminated by Vercel Hobby's default 15-second timeout.
- **Runtime:** Configured `export const runtime = "nodejs";` for full compatibility with cryptographic primitives (`crypto.randomBytes`, `crypto.createHash`) and Supabase connection pooling.

### 4. Remaining Risks & Operational Constraints
- **Groq On-Demand Free Tier Ceiling (200,000 TPD):**
  - Groq enforces a rolling 24-hour limit of 200,000 tokens per day on `openai/gpt-oss-120b`.
  - If high visitor traffic or sustained queries exhaust this quota, `/api/chat` returns HTTP 502 Bad Gateway until the daily token window replenishes.
  - *Recommendation:* If portfolio traffic increases significantly, upgrade to Groq Dev Tier (pay-as-you-go).
- **Existing Contact Form SMTP Credentials:**
  - Ensure Gmail App Password or SMTP credentials for `/api/contact` are also added to Vercel environment variables alongside chatbot secrets.

### 5. Step-by-Step Vercel Deployment Runbook

#### Step 1: Push Changes to GitHub
```bash
git add .
git commit -m "feat(nexus-ai): complete full-stack portfolio chatbot with supabase persistence & rate limiting"
git push origin main
```

#### Step 2: Import into Vercel
1. Log into [Vercel Dashboard](https://vercel.com/new).
2. Select repository: `Ayush-0915/Ayush-Space-Portfolio`.
3. Framework Preset: **Next.js** (auto-detected).
4. Build Command: `next build` (default).
5. Output Directory: `.next` (default).

#### Step 3: Configure Environment Variables in Vercel Project Settings
Under **Project Settings -> Environment Variables**, add:
| Key | Value / Source | Scope |
| :--- | :--- | :--- |
| `GROQ_API_KEY` | Your Groq API Key | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://goqeqoafydnuworogwzi.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Anon Key | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase Service Role Key | Production, Preview, Development |
| `SMTP_HOST` | `smtp.gmail.com` (or your host) | Production, Preview |
| `SMTP_PORT` | `587` | Production, Preview |
| `SMTP_SECURE` | `false` | Production, Preview |
| `SMTP_USER` | Your email address | Production, Preview |
| `SMTP_PASS` | Your email app password | Production, Preview |
| `MAIL_TO` | Target recipient email | Production, Preview |
| `MAIL_FROM` | Sender email address | Production, Preview |

#### Step 4: Deploy & Smoke Test
1. Click **Deploy**.
2. Visit the live deployment URL.
3. Verify the floating Nexus AI launcher appears at the bottom-right corner.
4. Verify the status indicator displays `"Portfolio Guide"` with a green pip.
5. Send a test message ("What projects has Ayush built?") and verify streaming SSE response.
6. Check Developer Tools Application tab -> Cookies -> `nexus_session_token` has `Secure; HttpOnly; SameSite=Lax`.

---

## 9. Phase 6A: Diagnose and Fix Upstream Service Errors (Completed)

### 1. Root Cause & Evidence
- **User Symptom:**
  - Asking *"Tell me about Ayush's education and technical experience."* resulted in the UI displaying:
    `"Nexus AI encountered an upstream service issue. Please try again in a few moments."`
- **Root Cause Identified:**
  - Direct execution against the Groq API revealed that the free-tier daily token ceiling for `openai/gpt-oss-120b` was temporarily reached during extensive verification runs:
    `Status: 429`
    `Error message: Rate limit reached for model openai/gpt-oss-120b in organization org_01kt8mvks0ec9br1rtw2dbdvme service tier on_demand on tokens per day (TPD): Limit 200000, Used 199847, Requested 1303. Please try again in 8m16.8s.`
  - In `app/api/chat/route.ts`, the previous `catch (apiError)` block converted all Groq failures into a generic HTTP `502 Bad Gateway` with the message *"Nexus AI encountered an upstream service issue. Please try again in a few moments."*, obscuring the actual quota/rate-limit status.
  - When the user retried, the previous implementation inserted a second duplicate `user` message into the Supabase `messages` table before Groq was called, creating consecutive unanswered user turns and orphaning 1-message conversations in `conversations`.
  - In `components/chat/nexus-chat-window.tsx`, an error event emitted inside the SSE stream (`payload.type === "error"`) was inadvertently swallowed by the `try ... catch` block intended only for skipping partial JSON lines.

### 2. Targeted Fixes Implemented
1. **Granular Groq Error Classification (`app/api/chat/route.ts`):**
   - **HTTP 429 (Provider Quota / Rate Limit):** Parses cooldown duration from provider message, returns HTTP 429 with `code: "UPSTREAM_RATE_LIMIT"`, `Retry-After: <seconds>`, and a clear, user-friendly explanation (*"Nexus AI is temporarily at capacity. The AI provider's token quota has been reached. Please try again in a few moments or contact Ayush directly."*).
   - **HTTP 401 (Authentication Failure):** Returns HTTP 503 with `code: "UPSTREAM_AUTH_ERROR"` and safe message.
   - **HTTP 404 / 400 (Model Unavailable):** Returns HTTP 503 with `code: "UPSTREAM_MODEL_ERROR"`.
   - **HTTP 500 / 502 / 503 / 504 (Outage / Timeout):** Returns HTTP 502 with `code: "UPSTREAM_SERVICE_ERROR"`.
2. **Retry Deduplication & Conversation Consistency (`app/api/chat/route.ts`):**
   - For existing conversations: inspects the last message in `messages`. If it is already an identical `user` message without an assistant reply, reuses it without inserting a duplicate DB row or sending duplicate user turns to Groq.
   - For new conversations: if Groq fails before streaming starts, automatically deletes the newly created empty conversation row from Supabase so no orphaned conversations linger.
   - For SSE streams: if a stream is interrupted mid-transfer, emits `{ type: "error" }` and avoids persisting a truncated half-sentence as a completed assistant reply.
3. **Structured Safe Diagnostics (`app/api/chat/route.ts`):**
   - Added request correlation ID (`reqId`) and `logStage(stage, message, meta)`.
   - Logs timestamped duration and sanitized error codes (`status`, `errCode`, `sanitizedMsg`).
   - Strictly redacts raw API keys, bearer tokens, cookies, and sensitive payload text.
4. **Stream Parser Hardening (`components/chat/nexus-chat-window.tsx`):**
   - Isolated `JSON.parse` in its own `try/catch` for partial chunks.
   - Handled `payload.type === "error"` cleanly outside the JSON parse catch, displaying the error in the chat UI.
5. **Configurable Model Override (`lib/groq/client.ts`):**
   - Added `process.env.GROQ_MODEL` fallback (defaulting to the approved primary model `openai/gpt-oss-120b`).
   - Added `_resetGroqClient()` for unit test isolation.

### 3. Verification & Actual Results
| Check / Test | Command Executed | Result | Details |
| :--- | :--- | :--- | :--- |
| **TypeScript Compilation** | `npx tsc --noEmit` | **PASSED** | Exit code 0 — 0 errors |
| **ESLint Validation** | `npm run lint` | **PASSED** | Exit code 0 — 0 errors |
| **Next.js Production Build** | `npm run build` | **PASSED** | Exit code 0 — Turbopack compiled successfully in 4.6s |
| **Security Test Suite** | `node --env-file=.env.local tests/verify-chat-security.mjs` | **PASSED** | Exit code 0 — All 9 security tests passed |
| **Live Supabase & Persistence Suite** | `node --env-file=.env.local tests/verify-live-supabase.mjs` | **PASSED** | Exit code 0 — All 5 tests passed; retry deduplication verified (exactly 1 user row stored on retry) |
| **Live Query Verification** | Real HTTP probe with *"Tell me about Ayush's education and technical experience."* | **PASSED** | HTTP 200 SSE stream completed in 3.85s (44,910 bytes streamed with full education & technical details) |

### 4. Remaining Operational Constraints & Next Steps
- **Groq Free-Tier Daily Quota (200,000 TPD):** The daily token limit on `openai/gpt-oss-120b` is an external Groq provider limitation. Under high visitor volume, requests will receive HTTP 429 with informative cooldown guidance and alternative contact links. To expand token limits for production traffic, upgrade to Groq Dev Tier.
- **Deployment Status:** No deployment, commit, or push was performed. Code is verified locally and ready for user review.

---

## 10. Phase 7: Production Validation & Optimization (Completed)

### 1. Production Deployment & Live Infrastructure Inspection
- **Live Production URL:** `https://ayush-space-portfolio.vercel.app`
- **Active Production Git Commit:** `57d8829` (`feat(nexus-ai): complete portfolio chatbot with supabase persistence, rate limiting & vercel readiness`)
- **Hosting Platform:** Vercel (Production Region: `iad1` / Edge Pop: `bom1`)
- **Discrepancy vs Local Working Tree:**
  - Production is running commit `57d8829` (Phase 5). Core chatbot features (SSE streaming, Supabase persistence `isEphemeral: false`, cookie security `HttpOnly; Secure; SameSite=Lax`) are active and verified working.
  - The local repository contains uncommitted Phase 6A/7 improvements: granular Groq error mapping (HTTP 429 `UPSTREAM_RATE_LIMIT` instead of generic 502), retry deduplication (`[db_reuse]`), orphaned conversation cleanup, and client-side SSE error parsing. Deploying these changes is recommended to bring production up to date.

### 2. Live Production End-to-End Test Results (`tests/test-production-live.mjs`)
Direct automated requests were executed against `https://ayush-space-portfolio.vercel.app`:

| Test / Check | Target Endpoint | Status / Result | Verification Details |
| :--- | :--- | :--- | :--- |
| **Root Page & Launcher** | `GET /` | **PASSED (200 OK)** | Serves portfolio HTML with `<NexusChatLauncher />` and tooltip badge mounted. |
| **Media Type Enforcement** | `POST /api/chat` (text/plain) | **PASSED (415)** | Returns HTTP 415 Unsupported Media Type for non-JSON requests. |
| **Payload Size Limit** | `POST /api/chat` (>16KB) | **PASSED (413)** | Returns HTTP 413 Payload Too Large when body exceeds 16,384 bytes. |
| **Cross-Session Isolation** | `POST /api/chat` (foreign convId) | **PASSED (404)** | Rejects attempts to access conversations belonging to another session with HTTP 404 Not Found. |
| **Security Cookie Attributes** | `POST /api/chat` (new session) | **PASSED** | Live cookie header: `nexus_session_token=...; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000; Secure`. |
| **Live Knowledge Grounding** | `POST /api/chat` ("What university does Ayush attend...?") | **PASSED (200 SSE)** | Streamed accurate, grounded response citing **Sage University, Indore** and **Bachelor of Technology in Artificial Intelligence and Machine Learning (2024–2028)**. |
| **Multi-Turn Continuity** | `POST /api/chat` ("What are his key featured projects?") | **PASSED (200 SSE)** | Maintained conversation continuity using existing `conversationId`; accurately cited verified projects (**Car Evaluation, Brain Tumor Detection, Netflix Data Analysis**). |
| **Database Hygiene** | Supabase `conversations` | **PASSED** | Probe test conversations generated during validation were safely deleted via admin client. |

### 3. Security, Privacy, and Environment Review
1. **Secret & Key Isolation:**
   - `.env.local` is git-ignored (`git check-ignore .env.local` confirmed).
   - Server-only secrets (`GROQ_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) are never exposed via `NEXT_PUBLIC_` prefixes.
   - Client-side bundles contain zero secret keys, database credentials, or private identifiers.
   - Request and error logs redact all keys, tokens, session hashes, and cookies.
2. **Session Security & Privacy:**
   - Anonymous visitor sessions use a cryptographically random 256-bit token (`crypto.randomBytes(32)`).
   - Only the SHA-256 hash of the session token is stored in Supabase (`session_token_hash`). Raw tokens are never persisted in the database.
   - Cookie settings: `HttpOnly; Secure; SameSite=Lax; Max-Age=2592000` (30 days).
3. **Database Security & RLS:**
   - Server-side database access uses `SUPABASE_SERVICE_ROLE_KEY` inside server-only route handlers.
   - Remote RLS policies restrict public access; all visitor operations are scoped strictly by session ownership.
   - Attempted access to foreign or non-existent conversation IDs returns HTTP 404 without leaking conversation existence.

### 4. Database Maintenance & Cleanup
- **30-Day Retention Policy:** Stored procedures `cleanup_expired_conversations()` and `cleanup_expired_rate_limits()` are deployed and active on Supabase PostgreSQL.
- **RPC Verification:** Executed both functions directly; completed cleanly with 0 SQL errors.
- **Automation Status:** Supabase `cron.job` runs daily at 03:00 UTC when `pg_cron` is enabled. For zero-dashboard maintenance, an optional Vercel Cron or GitHub Action can call these RPCs periodically.

### 5. Reliability & Usability Verification
- **Mobile Responsiveness:** Chat window adapts to 92vw with safe-area padding on mobile devices, floating above page navigation.
- **Accessibility:** ARIA attributes (`role="dialog"`, `aria-expanded`, `aria-controls`, `aria-label`, `aria-live`) verified; Escape key dismisses the window; focus returns to the launcher button.
- **Reduced Motion:** All CSS animations and pulse indicators honor `prefers-reduced-motion: reduce`.
- **Token Efficiency:** System prompt is strictly bounded; temperature is clamped to `0.3`; max response tokens capped at `1536` to prevent runaway generation.

### 6. Local Quality & Test Suite Summary
| Check / Test Suite | Command | Result | Notes |
| :--- | :--- | :--- | :--- |
| **TypeScript Compiler** | `npx tsc --noEmit` | **PASSED** | 0 type errors across codebase |
| **ESLint Validation** | `npm run lint` | **PASSED** | 0 lint warnings or errors |
| **Production Build** | `npm run build` | **PASSED** | Turbopack compiled successfully |
| **Security Suite (9 tests)** | `node --env-file=.env.local tests/verify-chat-security.mjs` | **PASSED** | 415, 400, 413, 404, SSE streaming, rate limiting, zero leaked secrets |
| **Live Supabase Suite (5 tests)** | `node --env-file=.env.local tests/verify-live-supabase.mjs` | **PASSED** | First-turn, retry deduplication (`[db_reuse]`), cross-session 404, distributed rate limiting, cleanup RPCs |
| **Production E2E Suite (6 tests)** | `node tests/test-production-live.mjs` | **PASSED** | Live production deployment verified against `https://ayush-space-portfolio.vercel.app` |

### 7. Recommendations & Next Steps
1. **Commit and Push:** Stage and commit the Phase 6A/7 enhancements (`app/api/chat/route.ts`, `components/chat/nexus-chat-window.tsx`, `lib/groq/client.ts`, test suites, and documentation) to `origin/main` to trigger Vercel's automatic production deployment.
2. **Groq Tier Consideration:** The current free-tier quota (200,000 TPD) handles approximately 50-60 multi-turn conversations per day. For higher traffic portfolios, consider upgrading to the Groq Developer tier.


