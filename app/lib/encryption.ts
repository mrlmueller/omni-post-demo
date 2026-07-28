import crypto from "crypto";

// Load the encryption key from environment variables
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
if (!ENCRYPTION_KEY) {
  throw new Error("ENCRYPTION_KEY environment variable is not set");
}

// Convert the encryption key to a Uint8Array
const keyBuffer = Uint8Array.from(Buffer.from(ENCRYPTION_KEY, "base64"));

// Encrypt function
export function encryptToken(token: string): string {
  const iv = Uint8Array.from(crypto.randomBytes(12)); // GCM recommends 12 bytes for IV
  const cipher = crypto.createCipheriv("aes-256-gcm", keyBuffer, iv);

  let encrypted = cipher.update(token, "utf8", "base64");
  encrypted += cipher.final("base64");
  const authTag = cipher.getAuthTag().toString("base64");

  // Convert iv back to base64 for storage
  const ivBase64 = Buffer.from(iv).toString("base64");

  return `${ivBase64}:${encrypted}:${authTag}`;
}
