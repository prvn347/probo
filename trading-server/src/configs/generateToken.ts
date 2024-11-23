import crypto from "crypto";
export function generateSecureKey() {
  return crypto.randomBytes(16).toString("hex"); // Generate 16 bytes of random data as hex string
}