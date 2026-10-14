import crypto from "crypto";
import { getServerSupabaseClient } from "./server";
import type { ConversationRecord, MessageRecord, MessageRole, Json } from "@/types/database";

/**
 * Computes a deterministic SHA-256 hex digest of a visitor's session token.
 * Raw session bearer tokens are NEVER persisted or logged.
 */
export function hashSessionToken(token: string): string {
  if (!token || typeof token !== "string" || token.trim().length === 0) {
    throw new Error("Invalid session token provided for hashing.");
  }
  return crypto.createHash("sha256").update(token.trim()).digest("hex");
}

/**
 * Creates a new anonymous conversation session associated with the hashed visitor token.
 */
export async function createConversation(
  sessionToken: string,
  title = "New Conversation"
): Promise<ConversationRecord> {
  const tokenHash = hashSessionToken(sessionToken);
  const supabase = getServerSupabaseClient();

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      session_token_hash: tokenHash,
      title: title.slice(0, 255),
    })
    .select()
    .single();

  if (error || !data) {
    console.error("Failed to create conversation in Supabase:", error?.message);
    throw new Error("Unable to create conversation session.");
  }

  return data as unknown as ConversationRecord;
}

/**
 * Retrieves a single conversation by ID, strictly enforcing session token ownership.
 * Returns null if the conversation does not exist or belongs to another session.
 */
export async function getConversation(
  conversationId: string,
  sessionToken: string
): Promise<ConversationRecord | null> {
  const tokenHash = hashSessionToken(sessionToken);
  const supabase = getServerSupabaseClient();

  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .eq("session_token_hash", tokenHash)
    .maybeSingle();

  if (error) {
    console.error("Failed to retrieve conversation:", error.message);
    throw new Error("Unable to retrieve conversation.");
  }

  return data ? (data as unknown as ConversationRecord) : null;
}

/**
 * Lists all active conversations owned by the caller's session token hash, ordered by recent activity.
 */
export async function listConversations(
  sessionToken: string,
  limit = 20
): Promise<ConversationRecord[]> {
  const tokenHash = hashSessionToken(sessionToken);
  const supabase = getServerSupabaseClient();

  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("session_token_hash", tokenHash)
    .order("updated_at", { ascending: false })
    .limit(Math.min(limit, 50));

  if (error) {
    console.error("Failed to list conversations:", error.message);
    throw new Error("Unable to list conversations.");
  }

  return (data as unknown as ConversationRecord[]) || [];
}

/**
 * Retrieves the full chronological message history for a conversation after validating ownership.
 */
export async function getConversationMessages(
  conversationId: string,
  sessionToken: string
): Promise<MessageRecord[]> {
  // Enforce session ownership verification before fetching messages
  const conversation = await getConversation(conversationId, sessionToken);
  if (!conversation) {
    throw new Error("Conversation not found or access denied.");
  }

  const supabase = getServerSupabaseClient();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to load conversation messages:", error.message);
    throw new Error("Unable to load messages.");
  }

  return (data as unknown as MessageRecord[]) || [];
}

/**
 * Appends a message to a conversation after validating ownership and updates the parent activity timestamp.
 */
export async function addMessage(
  conversationId: string,
  sessionToken: string,
  role: MessageRole,
  content: string,
  metadata: Json = {}
): Promise<MessageRecord> {
  const trimmed = content.trim();
  if (!trimmed) {
    throw new Error("Message content cannot be empty.");
  }

  if (trimmed.length > 8000) {
    throw new Error("Message content exceeds maximum allowed length of 8000 characters.");
  }

  // Validate session ownership
  const conversation = await getConversation(conversationId, sessionToken);
  if (!conversation) {
    throw new Error("Conversation not found or access denied.");
  }

  const supabase = getServerSupabaseClient();

  // Insert message record
  const { data: message, error: messageError } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      role,
      content: trimmed,
      metadata,
    })
    .select()
    .single();

  if (messageError || !message) {
    console.error("Failed to persist message:", messageError?.message);
    throw new Error("Unable to save message.");
  }

  // Update conversation updated_at to reset 30-day retention clock
  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  return message as unknown as MessageRecord;
}

/**
 * Deletes a conversation and all its cascaded messages after validating ownership.
 */
export async function deleteConversation(
  conversationId: string,
  sessionToken: string
): Promise<boolean> {
  const tokenHash = hashSessionToken(sessionToken);
  const supabase = getServerSupabaseClient();

  const { error } = await supabase
    .from("conversations")
    .delete()
    .eq("id", conversationId)
    .eq("session_token_hash", tokenHash);

  if (error) {
    console.error("Failed to delete conversation:", error.message);
    throw new Error("Unable to delete conversation.");
  }

  return true;
}

/**
 * Invokes the database cleanup function to purge conversations inactive for > 30 days.
 * Returns the number of purged conversations.
 */
export async function deleteExpiredConversations(): Promise<number> {
  const supabase = getServerSupabaseClient();

  // First try the dedicated stored procedure
  const { data, error } = await supabase.rpc("cleanup_expired_conversations");

  if (!error && typeof data === "number") {
    return data;
  }

  // Fallback: direct delete query if stored function is unavailable
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { count, error: deleteError } = await supabase
    .from("conversations")
    .delete({ count: "exact" })
    .lt("updated_at", thirtyDaysAgo);

  if (deleteError) {
    console.error("Failed to purge expired conversations:", deleteError.message);
    throw new Error("Failed to execute retention cleanup.");
  }

  return count ?? 0;
}
