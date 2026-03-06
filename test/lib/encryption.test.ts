import { describe, it, expect, beforeEach } from "vitest";
import { encryptApiKey, decryptApiKey } from "@/lib/encryption";

describe("encryption", () => {
  beforeEach(() => {
    process.env.ENCRYPTION_KEY = "a".repeat(32);
  });

  it("encrypts and decrypts API key roundtrip", () => {
    const plain = "sk-test-deepseek-api-key-12345";
    const encrypted = encryptApiKey(plain);
    expect(encrypted).toBeTruthy();
    expect(encrypted).not.toBe(plain);
    expect(encrypted.length).toBeGreaterThan(plain.length);

    const decrypted = decryptApiKey(encrypted);
    expect(decrypted).toBe(plain);
  });

  it("produces different ciphertext each time (IV is random)", () => {
    const plain = "same-key";
    const e1 = encryptApiKey(plain);
    const e2 = encryptApiKey(plain);
    expect(e1).not.toBe(e2);
    expect(decryptApiKey(e1)).toBe(plain);
    expect(decryptApiKey(e2)).toBe(plain);
  });

  it("throws when decrypting invalid payload", () => {
    expect(() => decryptApiKey("not-valid-base64!!!")).toThrow();
    expect(() => decryptApiKey(Buffer.from("short").toString("base64"))).toThrow(/Invalid/);
  });

  it("uses NEXTAUTH_SECRET when ENCRYPTION_KEY is unset", () => {
    delete process.env.ENCRYPTION_KEY;
    process.env.NEXTAUTH_SECRET = "test-secret-at-least-32-characters-long!!";

    const plain = "sk-key";
    const encrypted = encryptApiKey(plain);
    expect(decryptApiKey(encrypted)).toBe(plain);

    process.env.ENCRYPTION_KEY = "a".repeat(32);
  });

  it("simulates key persistence: encrypt -> store -> load -> decrypt", () => {
    const apiKey = "sk-real-key-from-ui";
    const encrypted = encryptApiKey(apiKey);
    const stored = { apiKey: encrypted };
    expect(stored.apiKey).toBeTruthy();

    const loaded = stored.apiKey;
    const decrypted = decryptApiKey(loaded);
    expect(decrypted).toBe(apiKey);
  });
});
