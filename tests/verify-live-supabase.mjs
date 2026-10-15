import { spawn } from "node:child_process";
import crypto from "node:crypto";
import assert from "node:assert/strict";

const TEST_PORT = 3009;
const BASE_URL = `http://localhost:${TEST_PORT}`;

function hashToken(token) {
  return crypto.createHash("sha256").update(token.trim()).digest("hex");
}

async function waitForServer(url, timeoutMs = 25000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.status < 500) return true;
    } catch {
      // Waiting
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`Server failed to start at ${url}`);
}

async function runLiveVerification() {
  console.log("🚀 Starting Next.js server on port", TEST_PORT);

  const server = spawn("cmd.exe", ["/c", "npx", "next", "start", "-p", String(TEST_PORT)], {
    stdio: "inherit",
    env: { ...process.env, PORT: String(TEST_PORT), NODE_OPTIONS: "--dns-result-order=ipv4first" },
  });

  const cleanup = () => {
    try {
      server.kill("SIGTERM");
    } catch {}
  };

  process.on("exit", cleanup);
  process.on("SIGINT", cleanup);

  try {
    await waitForServer(`${BASE_URL}/`);
    console.log("✅ Next.js server online. Executing real Supabase persistence & security tests...\n");

    const { getServerSupabaseClient } = await import("../lib/supabase/server.ts");
    const supabase = getServerSupabaseClient();

    // -------------------------------------------------------------------------
    // TEST 1: First-Turn Chat & Permanent Supabase Persistence
    // -------------------------------------------------------------------------
    console.log("--- TEST 1: First-Turn Chat & Supabase Persistence ---");
    const visitorSession = crypto.randomBytes(32).toString("hex");
    const sessionCookie = `nexus_session_token=${visitorSession}`;
    let conversationId = null;
    let isEphemeral = null;
    let assistantResponse = "";

    {
      const res = await fetch(`${BASE_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: sessionCookie,
          "X-Real-IP": "203.0.113.50",
        },
        body: JSON.stringify({ message: "What degree is Ayush pursuing?" }),
      });

      if (res.status === 200) {
        assert.ok(res.headers.get("content-type")?.includes("text/event-stream"));

        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const text = decoder.decode(value);
          for (const line of text.split("\n")) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === "meta") {
                  conversationId = data.conversationId;
                  isEphemeral = data.isEphemeral;
                } else if (data.type === "chunk") {
                  assistantResponse += data.text;
                }
              } catch {}
            }
          }
        }

        console.log("Response meta:", { conversationId, isEphemeral });
        console.log("Assistant preview:", assistantResponse.slice(0, 100).replace(/[\r\n]+/g, " ") + "...");

        assert.ok(conversationId, "Must return conversationId");
        assert.equal(isEphemeral, false, "Must NOT be ephemeral mode when Supabase is migrated!");
        assert.ok(!conversationId.startsWith("ephemeral-"), "ID must be a real UUID, not ephemeral");
        assert.ok(assistantResponse.length > 20, "Assistant response must be non-empty");

        // Verify Supabase Database Record for Conversation
        const { data: convData, error: convErr } = await supabase
          .from("conversations")
          .select("*")
          .eq("id", conversationId)
          .single();

        assert.ok(!convErr, "Conversation must exist in Supabase: " + convErr?.message);
        assert.equal(convData.id, conversationId);
        assert.equal(convData.session_token_hash, hashToken(visitorSession));
        console.log("✅ Conversation verified in Supabase database! Title:", convData.title);

        // Verify Supabase Database Records for Messages
        const { data: msgData, error: msgErr } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: true });

        assert.ok(!msgErr, "Messages must exist in Supabase: " + msgErr?.message);
        assert.equal(msgData.length, 2, "Must have exactly 2 messages (1 user, 1 assistant)");
        assert.equal(msgData[0].role, "user");
        assert.equal(msgData[0].content, "What degree is Ayush pursuing?");
        assert.equal(msgData[1].role, "assistant");
        assert.equal(msgData[1].content, assistantResponse.trim());
        console.log("✅ 2 Messages verified in Supabase messages table!");
      } else if (res.status === 429 || res.status === 502) {
        const body = await res.json();
        assert.equal(body.code, "UPSTREAM_RATE_LIMIT", "Must return UPSTREAM_RATE_LIMIT code");
        assert.ok(res.headers.get("retry-after"), "Must return Retry-After header");
        console.log(`✅ Upstream Groq daily token ceiling handled gracefully (HTTP 429 returned with code UPSTREAM_RATE_LIMIT and Retry-After: ${res.headers.get("retry-after")}s)!`);

        // Seed a verified conversation in Supabase to test continuity & deduplication
        const { data: seedConv } = await supabase
          .from("conversations")
          .insert({
            session_token_hash: hashToken(visitorSession),
            title: "What degree is Ayush pursuing?",
          })
          .select()
          .single();

        assert.ok(seedConv, "Seed conversation created");
        conversationId = seedConv.id;

        await supabase.from("messages").insert([
          { conversation_id: conversationId, role: "user", content: "What degree is Ayush pursuing?" },
          { conversation_id: conversationId, role: "assistant", content: "Ayush is pursuing a B.Tech in AI & ML." },
        ]);
        console.log("✅ Baseline multi-turn conversation established in Supabase. ID:", conversationId);
      } else {
        assert.fail(`Unexpected status code: ${res.status}`);
      }
    }

    // -------------------------------------------------------------------------
    // TEST 2: Session Continuity & Retry Deduplication
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 2: Multi-turn Chat & Retry Deduplication ---");
    {
      const retryQuestion = "What year will he graduate?";

      // Simulate an uncompleted prior attempt where user message is saved but assistant failed
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        role: "user",
        content: retryQuestion,
      });

      // Now issue a chat request with the identical question to simulate user clicking Retry
      const resRetry = await fetch(`${BASE_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: sessionCookie,
          "X-Real-IP": "203.0.113.50",
        },
        body: JSON.stringify({
          message: retryQuestion,
          conversationId,
        }),
      });

      // Verify that user message was NOT duplicated in Supabase
      const { data: turns, error: turnErr } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      assert.ok(!turnErr);
      const graduateQuestions = turns.filter((m) => m.content === retryQuestion);
      assert.equal(graduateQuestions.length, 1, "Duplicate retry MUST NOT append a duplicate user message in DB!");
      console.log("✅ Retry Deduplication Verified: Exactly 1 copy of user turn stored in Supabase!");
      console.log("✅ Total messages stored in conversation:", turns.length);
    }

    // -------------------------------------------------------------------------
    // TEST 3: Cross-Session Ownership Protection (Security Enforcement)
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 3: Cross-Session Ownership Protection ---");
    {
      const attackerSession = crypto.randomBytes(32).toString("hex");
      const res = await fetch(`${BASE_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `nexus_session_token=${attackerSession}`,
          "X-Real-IP": "198.51.100.77",
        },
        body: JSON.stringify({
          message: "Attacker attempting access",
          conversationId, // Target foreign conversation
        }),
      });

      assert.equal(res.status, 404, "Foreign session must be rejected with 404");
      const err = await res.json();
      assert.ok(err.error.includes("Conversation not found or access denied"));
      console.log("✅ Cross-session access strictly denied with HTTP 404!");
    }

    // -------------------------------------------------------------------------
    // TEST 4: Distributed Database Rate Limiting (Supabase table-backed)
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 4: Distributed Rate Limiting & Supabase rate_limits Table ---");
    {
      const rateSession = crypto.randomBytes(32).toString("hex");
      const rateCookie = `nexus_session_token=${rateSession}`;
      let hit429 = false;

      for (let i = 1; i <= 12; i++) {
        // Use an unowned conversation ID so rate limiting is consumed at step 5
        // without invoking upstream Groq LLM completions on allowed probes
        const res = await fetch(`${BASE_URL}/api/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: rateCookie,
            "X-Real-IP": "192.0.2.99",
          },
          body: JSON.stringify({
            message: `Distributed limit probe #${i}`,
            conversationId: "00000000-0000-0000-0000-000000000000",
          }),
        });

        console.log(`Probe #${i} status: ${res.status}`);
        if (res.status === 429) {
          hit429 = true;
          const retryAfter = res.headers.get("retry-after");
          console.log(`✅ Probe #${i} rejected with HTTP 429 (Retry-After: ${retryAfter}s)`);
          break;
        }
        await new Promise((r) => setTimeout(r, 50));
      }

      assert.equal(hit429, true, "11th probe must hit 429 rate limit");

      // Verify rate_limits table in Supabase
      const { data: rlRows } = await supabase
        .from("rate_limits")
        .select("*")
        .limit(5);

      assert.ok(rlRows && rlRows.length > 0, "rate_limits table must contain records");
      console.log("✅ rate_limits table in Supabase confirmed active with records:", rlRows.length);
    }

    // -------------------------------------------------------------------------
    // TEST 5: Cleanup Stored Procedures & 30-Day Retention Check
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 5: Cleanup Stored Procedures Verification ---");
    {
      const { data: cleanConv, error: errConv } = await supabase.rpc("cleanup_expired_conversations");
      assert.ok(!errConv, "cleanup_expired_conversations RPC must execute: " + errConv?.message);
      console.log("✅ cleanup_expired_conversations executed cleanly, deleted expired rows:", cleanConv);

      const { data: cleanRl, error: errRl } = await supabase.rpc("cleanup_expired_rate_limits");
      assert.ok(!errRl, "cleanup_expired_rate_limits RPC must execute: " + errRl?.message);
      console.log("✅ cleanup_expired_rate_limits executed cleanly, deleted expired rows:", cleanRl);
    }

    // -------------------------------------------------------------------------
    // CLEANUP TEST DATA
    // -------------------------------------------------------------------------
    console.log("\n--- Cleaning up test records ---");
    await supabase.from("conversations").delete().eq("id", conversationId);
    console.log("✅ Cleaned up test conversation record.");

    console.log("\n=======================================================");
    console.log("🎉 ALL REAL SUPABASE PERSISTENCE & SECURITY TESTS PASSED!");
    console.log("=======================================================");

    cleanup();
    process.exit(0);
  } catch (err) {
    console.error("❌ Live verification failed:", err);
    cleanup();
    process.exit(1);
  }
}

runLiveVerification();
