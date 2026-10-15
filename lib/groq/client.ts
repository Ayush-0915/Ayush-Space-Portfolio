import Groq from "groq-sdk";

export const PRIMARY_GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

let groqClientInstance: Groq | null = null;

/**
 * Returns a singleton instance of the Groq SDK client.
 * Strictly server-side only. Throws if GROQ_API_KEY is not configured.
 */
export function getGroqClient(): Groq {
  if (groqClientInstance) {
    return groqClientInstance;
  }

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error(
      "GROQ_CONFIG_ERROR: GROQ_API_KEY is not set. Please configure it in .env.local."
    );
  }

  groqClientInstance = new Groq({
    apiKey: apiKey.trim(),
  });

  return groqClientInstance;
}

/**
 * Resets the singleton instance (used for testing configuration changes).
 */
export function _resetGroqClient(): void {
  groqClientInstance = null;
}
