/**
 * Admin auth helpers.
 * Token format: "{expiresAt}:{hmac}"
 * where hmac = HMAC-SHA256(expiresAt, ADMIN_PASSWORD)
 *
 * Uses Web Crypto API so it works in both Node.js and Edge runtimes.
 */

const COOKIE_NAME = 'mg-admin-token';
const MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 days

function getSecret(): string {
  const s = process.env.ADMIN_PASSWORD;
  if (!s) throw new Error('ADMIN_PASSWORD env var is not set');
  return s;
}

/** Convert ArrayBuffer to hex string — pure Web Crypto, no Buffer needed */
function arrayBufferToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function hmac(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return arrayBufferToHex(sig);
}

async function hmacVerify(message: string, secret: string, expected: string): Promise<boolean> {
  const actual = await hmac(message, secret);
  // Constant-time compare via encode → compare lengths then content
  if (actual.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < actual.length; i++) diff |= actual.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

/** Create a signed token valid for 7 days */
export async function createToken(): Promise<string> {
  const expiresAt = String(Date.now() + MAX_AGE_SEC * 1000);
  const sig = await hmac(expiresAt, getSecret());
  return `${expiresAt}:${sig}`;
}

/** Verify a token; returns true if valid and not expired */
export async function verifyToken(token: string): Promise<boolean> {
  try {
    const colonIdx = token.indexOf(':');
    if (colonIdx === -1) return false;
    const expiresAt = token.slice(0, colonIdx);
    const sig       = token.slice(colonIdx + 1);
    if (Date.now() > Number(expiresAt)) return false;
    return hmacVerify(expiresAt, getSecret(), sig);
  } catch {
    return false;
  }
}

export { COOKIE_NAME, MAX_AGE_SEC };
