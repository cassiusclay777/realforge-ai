import crypto from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;

function getEncryptionKey(): Buffer {
  const raw =
    process.env.ENCRYPTION_KEY ||
    process.env.SECRET_KEY ||
    process.env.NEXTAUTH_SECRET;
  if (!raw) {
    throw new Error(
      "Missing ENCRYPTION_KEY, SECRET_KEY or NEXTAUTH_SECRET for API key encryption"
    );
  }
  if (raw.length >= KEY_LENGTH) {
    return Buffer.from(raw.slice(0, KEY_LENGTH), "utf8");
  }
  return crypto.scryptSync(raw, "realforge-integration-salt", KEY_LENGTH);
}

/**
 * Encrypt a plaintext string (e.g. API key) for storage in DB.
 */
export function encryptApiKey(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const enc = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, enc]).toString("base64");
}

/**
 * Decrypt a value stored by encryptApiKey.
 */
export function decryptApiKey(encryptedBase64: string): string {
  const key = getEncryptionKey();
  const buf = Buffer.from(encryptedBase64, "base64");
  if (buf.length < IV_LENGTH + AUTH_TAG_LENGTH) {
    throw new Error("Invalid encrypted payload");
  }
  const iv = buf.subarray(0, IV_LENGTH);
  const authTag = buf.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const enc = buf.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  return decipher.update(enc) + decipher.final("utf8");
}
