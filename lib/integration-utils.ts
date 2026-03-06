import { prisma } from "@/lib/prisma";
import { decryptApiKey } from "@/lib/encryption";

const FIELD_MAP: Record<string, "apiKey" | "srealityApiKey" | "poskiApiKey"> = {
  DEEPSEEK: "apiKey",
  SREALITY: "srealityApiKey",
  POSKI: "poskiApiKey",
};

/**
 * Get decrypted API key for an integration type.
 * 1. Try DB (user-specific).
 * 2. For DEEPSEEK only: fallback to process.env.DEEPSEEK_API_KEY.
 */
export async function getApiKey(
  type: string,
  userId: string
): Promise<string | null> {
  const field = type in FIELD_MAP ? FIELD_MAP[type as keyof typeof FIELD_MAP] : null;
  if (!field) return null;

  const integration = await prisma.integration.findFirst({
    where: { userId, name: type, enabled: true },
    select: { apiKey: true, srealityApiKey: true, poskiApiKey: true },
  });

  const encrypted = integration?.[field];
  if (encrypted) {
    try {
      return decryptApiKey(encrypted);
    } catch (err) {
      console.error(`Failed to decrypt ${type} API key:`, err);
      return null;
    }
  }

  if (type === "DEEPSEEK") {
    return process.env.DEEPSEEK_API_KEY ?? null;
  }

  return null;
}

/**
 * Get DeepSeek API key: 1) DB (user-specific if userId, else any), 2) fallback .env.
 * DeepSeek in .env is never overwritten; UI-saved key in DB takes precedence when present.
 */
export async function getDeepSeekApiKey(userId?: string): Promise<string | null> {
  try {
    const where = userId
      ? { userId, name: "DEEPSEEK" as const, enabled: true }
      : { name: "DEEPSEEK" as const, enabled: true };
    const row = await prisma.integration.findFirst({
      where,
      select: { apiKey: true },
    });
    if (row?.apiKey) {
      return decryptApiKey(row.apiKey);
    }
  } catch (err) {
    console.error("Failed to load DeepSeek key from DB:", err);
  }
  return process.env.DEEPSEEK_API_KEY ?? null;
}
