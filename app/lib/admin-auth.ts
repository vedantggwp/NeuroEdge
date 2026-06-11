import { createHmac, timingSafeEqual } from "node:crypto";

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function hmacHex(data: string, secret: string): string {
  return createHmac("sha256", secret).update(data).digest("hex");
}

/**
 * Issue a signed token: `${expiry}.${hmac}`.
 * Expiry is an epoch-ms timestamp ~7 days from now.
 * The HMAC is computed over the string form of the expiry using ADMIN_PASSWORD as the secret.
 */
export function issueToken(): string {
  const exp = String(Date.now() + TOKEN_TTL_MS);
  const secret = process.env.ADMIN_PASSWORD ?? "";
  const mac = hmacHex(exp, secret);
  return `${exp}.${mac}`;
}

/**
 * Verify a signed admin token.
 * Returns false if ADMIN_PASSWORD is unset, token is missing/malformed, HMAC is invalid, or token is expired.
 */
export function verifyToken(token: string | undefined): boolean {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return false;
  if (!token) return false;

  const dotIndex = token.indexOf(".");
  if (dotIndex === -1) return false;

  const expStr = token.slice(0, dotIndex);
  const mac = token.slice(dotIndex + 1);

  if (!expStr || !mac) return false;

  const exp = Number(expStr);
  if (!Number.isFinite(exp)) return false;

  const expected = hmacHex(expStr, secret);

  // Timing-safe comparison — both must be equal length buffers
  const macBuf = Buffer.from(mac, "hex");
  const expectedBuf = Buffer.from(expected, "hex");
  if (macBuf.length !== expectedBuf.length) return false;

  const macMatches = timingSafeEqual(macBuf, expectedBuf);
  const notExpired = Date.now() < exp;

  return macMatches && notExpired;
}
