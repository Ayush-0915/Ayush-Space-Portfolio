import crypto from "crypto";
import { getServerSupabaseClient } from "./supabase/server";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
  limit: number;
  reason?: "session" | "ip";
}

interface InMemoryBucket {
  count: number;
  resetAt: number;
}

// Global anchor so the rate-limit cache persists across all requests in the Node process
const globalForRateLimit = globalThis as unknown as {
  __nexusRateLimitStore?: Map<string, InMemoryBucket>;
  __nexusRpcSupported?: boolean;
};

const memoryStore =
  globalForRateLimit.__nexusRateLimitStore || new Map<string, InMemoryBucket>();
globalForRateLimit.__nexusRateLimitStore = memoryStore;

// Periodic memory cleanup to prevent unbounded memory growth
if (typeof setInterval !== "undefined") {
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of memoryStore.entries()) {
      if (bucket.resetAt <= now) {
        memoryStore.delete(key);
      }
    }
  }, 60000);

  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }
}

/**
 * Safely extracts client IP address from proxy headers using a documented trust model.
 * Prioritizes direct proxy headers (X-Real-IP, CF-Connecting-IP), then parses X-Forwarded-For.
 */
export function extractClientIp(req: Request): string {
  const headers = req.headers;

  const realIp = headers.get("x-real-ip");
  if (realIp && isValidIp(realIp.trim())) {
    return realIp.trim();
  }

  const cfIp = headers.get("cf-connecting-ip");
  if (cfIp && isValidIp(cfIp.trim())) {
    return cfIp.trim();
  }

  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    // Take the first client IP in the proxy chain
    const clientIp = forwardedFor.split(",")[0]?.trim();
    if (clientIp && isValidIp(clientIp)) {
      return clientIp;
    }
  }

  return "127.0.0.1";
}

function isValidIp(ip: string): boolean {
  const ipv4 = /^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}$/;
  const ipv6 = /^[0-9a-fA-F:]+$/;
  return ipv4.test(ip) || (ipv6.test(ip) && ip.includes(":"));
}

/**
 * Hashes an IP address using SHA-256 so raw visitor IPs are never stored in plain text.
 */
export function hashIp(ip: string): string {
  const salt = process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 16) || "nexus-rate-salt";
  return crypto.createHash("sha256").update(`ip:${ip}:${salt}`).digest("hex");
}

/**
 * Checks in-memory sliding-window bucket.
 */
function checkMemoryRateLimit(key: string, maxRequests: number, windowSeconds: number): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const bucket = memoryStore.get(key);

  if (!bucket || bucket.resetAt <= now) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      retryAfter: 0,
      limit: maxRequests,
    };
  }

  bucket.count += 1;

  if (bucket.count > maxRequests) {
    const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    return {
      allowed: false,
      remaining: 0,
      retryAfter,
      limit: maxRequests,
    };
  }

  return {
    allowed: true,
    remaining: Math.max(0, maxRequests - bucket.count),
    retryAfter: 0,
    limit: maxRequests,
  };
}

/**
 * Checks rate limits via Supabase atomic check_rate_limit stored procedure if available,
 * falling back safely to the in-memory sliding window limiter.
 */
async function checkDistributedRateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  // If we already detected that RPC is not available in Supabase, use high-speed in-memory fallback
  if (globalForRateLimit.__nexusRpcSupported === false) {
    return checkMemoryRateLimit(key, maxRequests, windowSeconds);
  }

  try {
    const supabase = getServerSupabaseClient();
    const { data, error } = await supabase.rpc("check_rate_limit", {
      p_key: key,
      p_max_requests: maxRequests,
      p_window_seconds: windowSeconds,
    });

    if (error) {
      if (error.code === "PGRST202" || error.message?.includes("check_rate_limit")) {
        globalForRateLimit.__nexusRpcSupported = false;
      }
      return checkMemoryRateLimit(key, maxRequests, windowSeconds);
    }

    if (!data || !data.length) {
      return checkMemoryRateLimit(key, maxRequests, windowSeconds);
    }

    globalForRateLimit.__nexusRpcSupported = true;
    const row = data[0];
    return {
      allowed: Boolean(row.allowed),
      remaining: Number(row.remaining),
      retryAfter: Number(row.retry_after),
      limit: maxRequests,
    };
  } catch {
    return checkMemoryRateLimit(key, maxRequests, windowSeconds);
  }
}

/**
 * Dual-tier rate limiting:
 * 1. Session-based limit: 10 requests per 60 seconds
 * 2. IP-based limit: 25 requests per 60 seconds
 */
export async function enforceRateLimits(
  sessionTokenHash: string,
  clientIp: string
): Promise<RateLimitResult> {
  const sessionKey = `sess:${sessionTokenHash}`;
  const ipKey = `ip:${hashIp(clientIp)}`;

  // 1. Check Session Rate Limit (10 requests / 60 seconds)
  const sessionResult = await checkDistributedRateLimit(sessionKey, 10, 60);
  if (!sessionResult.allowed) {
    return {
      ...sessionResult,
      reason: "session",
    };
  }

  // 2. Check IP Rate Limit (25 requests / 60 seconds)
  const ipResult = await checkDistributedRateLimit(ipKey, 25, 60);
  if (!ipResult.allowed) {
    return {
      ...ipResult,
      reason: "ip",
    };
  }

  return {
    allowed: true,
    remaining: Math.min(sessionResult.remaining, ipResult.remaining),
    retryAfter: 0,
    limit: 10,
  };
}

/**
 * Resets memory store (used for test teardown).
 */
export function _resetMemoryStore(): void {
  memoryStore.clear();
}
