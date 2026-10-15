import { NextResponse } from "next/server";
import crypto from "crypto";
import { getGroqClient, PRIMARY_GROQ_MODEL } from "@/lib/groq/client";
import { buildNexusSystemPrompt } from "@/lib/groq/prompt";
import {
  createConversation,
  getConversation,
  getConversationMessages,
  addMessage,
  deleteConversation,
  hashSessionToken,
} from "@/lib/supabase/repository";
import { enforceRateLimits, extractClientIp } from "@/lib/ratelimit";
import type { MessageRole } from "@/types/database";

export const runtime = "nodejs";
export const maxDuration = 60;

const SESSION_COOKIE_NAME = "nexus_session_token";
const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_TURNS = 10;
const MAX_BODY_BYTES = 16384; // 16 KB strict body limit

/**
 * Extracts or generates a cryptographically secure 64-char hex session token.
 */
function resolveSessionToken(req: Request): { sessionToken: string; isNewSession: boolean } {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE_NAME}=([^;]+)`));
  const existingToken = match ? match[1].trim() : null;

  if (existingToken && existingToken.length >= 32 && /^[a-f0-9]+$/i.test(existingToken)) {
    return { sessionToken: existingToken, isNewSession: false };
  }

  const newToken = crypto.randomBytes(32).toString("hex");
  return { sessionToken: newToken, isNewSession: true };
}

/**
 * Safely reads the request body stream up to maxBytes to guard against oversized payloads
 * and unbounded chunked transfer flooding.
 */
async function readBodyWithLimit(req: Request, maxBytes: number): Promise<string> {
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > maxBytes) {
    throw new Error("PAYLOAD_TOO_LARGE");
  }

  if (!req.body) {
    return "";
  }

  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      totalBytes += value.length;
      if (totalBytes > maxBytes) {
        throw new Error("PAYLOAD_TOO_LARGE");
      }
      chunks.push(value);
    }
  }

  const merged = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }

  return new TextDecoder().decode(merged);
}

export async function POST(req: Request) {
  try {
    // 1. Content-Type Enforcement
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("application/json")) {
      return NextResponse.json(
        { error: "Unsupported media type. Content-Type must be application/json." },
        { status: 415 }
      );
    }

    // 2. Body Size Enforcement (Max 16KB) & JSON Parsing
    let rawText: string;
    try {
      rawText = await readBodyWithLimit(req, MAX_BODY_BYTES);
    } catch (readErr) {
      if (readErr instanceof Error && readErr.message === "PAYLOAD_TOO_LARGE") {
        return NextResponse.json(
          { error: "Payload too large. Maximum request body size is 16KB." },
          { status: 413 }
        );
      }
      return NextResponse.json({ error: "Failed to read request body." }, { status: 400 });
    }

    let body: unknown;
    try {
      body = JSON.parse(rawText);
    } catch {
      return NextResponse.json({ error: "Malformed JSON request body." }, { status: 400 });
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Request body must be a valid JSON object." }, { status: 400 });
    }

    const { message, conversationId } = body as {
      message?: unknown;
      conversationId?: unknown;
    };

    // 3. Message Validation & Character Boundary (Max 2,000 chars)
    if (typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message cannot be empty." }, { status: 400 });
    }

    const cleanMessage = message.trim();
    if (cleanMessage.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Message exceeds maximum allowed length of ${MAX_MESSAGE_LENGTH} characters.` },
        { status: 400 }
      );
    }

    // 4. Resolve Anonymous Session Token & Client IP
    const { sessionToken, isNewSession } = resolveSessionToken(req);
    const sessionTokenHash = hashSessionToken(sessionToken);
    const clientIp = extractClientIp(req);

    // 5. Enforce Server-Side Rate Limiting BEFORE Database or AI Calls
    const rateLimit = await enforceRateLimits(sessionTokenHash, clientIp);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Too many requests. Please wait a moment before sending another message.",
          retryAfter: rateLimit.retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": rateLimit.retryAfter.toString(),
            "X-RateLimit-Limit": rateLimit.limit.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateLimit.retryAfter.toString(),
          },
        }
      );
    }

    // Correlation ID and timing for safe diagnostics
    const reqId = `req_${crypto.randomBytes(4).toString("hex")}`;
    const startTime = Date.now();
    const logStage = (stage: string, message: string, extra?: Record<string, unknown>) => {
      const elapsed = Date.now() - startTime;
      const meta = extra ? " " + JSON.stringify(extra) : "";
      console.log(`[Nexus AI][${reqId}][${stage}][${elapsed}ms] ${message}${meta}`);
    };

    // 6. Resolve or Create Conversation with Resilient Persistence & Ownership Verification
    let activeConversationId: string;
    let pastHistory: Array<{ role: MessageRole; content: string }> = [];
    let isEphemeral = false;
    let isNewConversation = false;

    if (
      typeof conversationId === "string" &&
      conversationId.trim().length > 0
    ) {
      const cleanConvId = conversationId.trim();
      if (!cleanConvId.startsWith("ephemeral-")) {
        // Explicit stored conversation ID requested: strictly verify ownership
        try {
          const existing = await getConversation(cleanConvId, sessionToken);
          if (!existing) {
            return NextResponse.json(
              { error: "Conversation not found or access denied." },
              { status: 404 }
            );
          }
          activeConversationId = existing.id;
          const messages = await getConversationMessages(activeConversationId, sessionToken);

          // Retry Deduplication: if the last stored message is already an identical user turn
          // with no assistant answer yet (due to previous provider failure), reuse it
          const lastMsg = messages[messages.length - 1];
          const isRetry = lastMsg && lastMsg.role === "user" && lastMsg.content.trim() === cleanMessage;

          if (isRetry) {
            logStage("db_reuse", "Reusing pending user message from uncompleted prior attempt");
            pastHistory = messages.slice(0, -1).map((m) => ({ role: m.role, content: m.content }));
          } else {
            pastHistory = messages.map((m) => ({ role: m.role, content: m.content }));
            await addMessage(activeConversationId, sessionToken, "user", cleanMessage);
          }
        } catch {
          // If conversation lookup fails due to missing table or unowned record, reject with 404
          return NextResponse.json(
            { error: "Conversation not found or access denied." },
            { status: 404 }
          );
        }
      } else {
        // Ephemeral conversation ID continuation
        isEphemeral = true;
        activeConversationId = cleanConvId;
      }
    } else {
      // New conversation initialization
      try {
        const summaryTitle = cleanMessage.slice(0, 40).replace(/[\r\n]+/g, " ");
        const newConversation = await createConversation(sessionToken, summaryTitle);
        activeConversationId = newConversation.id;
        isNewConversation = true;
        await addMessage(activeConversationId, sessionToken, "user", cleanMessage);
      } catch (dbError) {
        const errMsg = dbError instanceof Error ? dbError.message : "Database error";
        console.warn("Supabase persistence notice (operating in ephemeral session mode):", errMsg);
        isEphemeral = true;
        activeConversationId = `ephemeral-${crypto.randomUUID()}`;
      }
    }

    // 7. Initialize Groq AI Client
    let groq;
    try {
      groq = getGroqClient();
    } catch (groqErr) {
      logStage("groq_init", "Groq client initialization error", {
        error: groqErr instanceof Error ? groqErr.message : "Initialization failure",
      });
      if (isNewConversation && !isEphemeral) {
        await deleteConversation(activeConversationId, sessionToken).catch(() => {});
      }
      return NextResponse.json(
        {
          error:
            "Nexus AI service configuration issue. Please check system credentials.",
          code: "UPSTREAM_CONFIG_ERROR",
        },
        { status: 503 }
      );
    }

    // 8. Build Grounded Context & History Window (Bounded to last 10 turns)
    const systemPrompt = buildNexusSystemPrompt();
    const recentHistory = pastHistory.slice(-MAX_HISTORY_TURNS);

    const groqMessages = [
      { role: "system" as const, content: systemPrompt },
      ...recentHistory.map((h) => ({
        role: h.role === "assistant" ? ("assistant" as const) : ("user" as const),
        content: h.content,
      })),
      { role: "user" as const, content: cleanMessage },
    ];

    // 9. Invoke Groq Streaming Completion (Restricted tokens & low temperature)
    let groqStream;
    try {
      logStage("groq_request", `Invoking Groq stream with model=${PRIMARY_GROQ_MODEL}`);
      groqStream = await groq.chat.completions.create({
        model: PRIMARY_GROQ_MODEL,
        messages: groqMessages,
        temperature: 0.3,
        max_tokens: 1536,
        stream: true,
      });
    } catch (apiError: unknown) {
      const err = apiError as {
        status?: number;
        message?: string;
        code?: string;
        error?: { message?: string; type?: string; code?: string };
      };
      const status = err.status || 500;
      const errMsg = err.error?.message || err.message || "Provider failure";
      const errCode = err.error?.code || err.code || "unknown";

      logStage("groq_error", "Groq API completion failure", {
        status,
        errCode,
        sanitizedMsg: errMsg.slice(0, 160),
      });

      // Clean up orphaned new conversation so no empty conversation rows linger in Supabase
      if (isNewConversation && !isEphemeral) {
        await deleteConversation(activeConversationId, sessionToken).catch(() => {});
      }

      // A. Quota exhaustion or upstream rate limit (HTTP 429)
      const isRateLimit =
        status === 429 ||
        errCode === "rate_limit_exceeded" ||
        /rate limit|quota|tokens per day|tpd/i.test(errMsg);

      if (isRateLimit) {
        let retrySec = 60;
        const matchCooldown = errMsg.match(/try again in (?:(\d+)m)?\s*(?:([\d.]+)s)?/i);
        if (matchCooldown) {
          const m = parseInt(matchCooldown[1] || "0", 10);
          const s = Math.ceil(parseFloat(matchCooldown[2] || "0"));
          retrySec = Math.max(1, m * 60 + s);
        }

        return NextResponse.json(
          {
            error:
              "Nexus AI is temporarily at capacity. The AI provider's token quota has been reached. Please try again in a few moments or contact Ayush directly.",
            retryAfter: retrySec,
            code: "UPSTREAM_RATE_LIMIT",
          },
          {
            status: 429,
            headers: {
              "Retry-After": retrySec.toString(),
            },
          }
        );
      }

      // B. Authentication failure (HTTP 401)
      if (status === 401 || /invalid api key|unauthorized/i.test(errMsg)) {
        return NextResponse.json(
          {
            error: "Nexus AI service configuration issue. Please check API credentials.",
            code: "UPSTREAM_AUTH_ERROR",
          },
          { status: 503 }
        );
      }

      // C. Model unavailable (HTTP 404 or 400 model not found)
      if (status === 404 || (status === 400 && /model/i.test(errMsg))) {
        return NextResponse.json(
          {
            error: "Nexus AI configured model is currently unavailable.",
            code: "UPSTREAM_MODEL_ERROR",
          },
          { status: 503 }
        );
      }

      // D. Upstream outage, gateway error, or timeout (500/502/503/504)
      return NextResponse.json(
        {
          error:
            "Nexus AI encountered an upstream service issue. Please try again in a few moments.",
          code: "UPSTREAM_SERVICE_ERROR",
        },
        { status: 502 }
      );
    }

    // 10. Setup Server-Sent Events (SSE) Stream
    const encoder = new TextEncoder();
    let accumulatedResponse = "";

    const readable = new ReadableStream({
      async start(controller) {
        try {
          // Emit initial metadata event
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "meta",
                conversationId: activeConversationId,
                isEphemeral,
              })}\n\n`
            )
          );

          // Stream individual token chunks
          for await (const chunk of groqStream) {
            const textChunk = chunk.choices[0]?.delta?.content || "";
            if (textChunk) {
              accumulatedResponse += textChunk;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: "chunk", text: textChunk })}\n\n`)
              );
            }
          }

          // Persist the completed assistant response only if non-empty and persistence is active
          if (!isEphemeral && accumulatedResponse.trim().length > 0) {
            try {
              await addMessage(
                activeConversationId,
                sessionToken,
                "assistant",
                accumulatedResponse.trim()
              );
            } catch (saveError) {
              logStage("db_save_error", "Failed to persist assistant response", {
                error: saveError instanceof Error ? saveError.message : "Save error",
              });
            }
          }

          // Emit completion event
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "done",
                conversationId: activeConversationId,
                isEphemeral,
              })}\n\n`
            )
          );
          controller.close();
        } catch (streamError) {
          logStage("stream_error", "Streaming generation interrupted", {
            error: streamError instanceof Error ? streamError.message : "Stream error",
          });
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                message: "An interruption occurred while streaming the response. Please try again.",
              })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    const responseHeaders = new Headers({
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-RateLimit-Limit": rateLimit.limit.toString(),
      "X-RateLimit-Remaining": rateLimit.remaining.toString(),
    });

    if (isNewSession) {
      const isProd = process.env.NODE_ENV === "production";
      responseHeaders.append(
        "Set-Cookie",
        `${SESSION_COOKIE_NAME}=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${
          30 * 24 * 60 * 60
        }${isProd ? "; Secure" : ""}`
      );
    }

    return new Response(readable, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Unhandled Chat API Exception:", error);
    return NextResponse.json(
      { error: "An unexpected internal server error occurred." },
      { status: 500 }
    );
  }
}
