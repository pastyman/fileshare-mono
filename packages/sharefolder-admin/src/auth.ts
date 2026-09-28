/** Owner-only session. Edge-safe (Web Crypto) so middleware can verify it too. */

export const SESSION_COOKIE = 'sf_admin';
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

const encoder = new TextEncoder();

function sessionSecret(): string | undefined {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function hmac(secret: string, value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return toHex(await crypto.subtle.sign('HMAC', key, encoder.encode(value)));
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function createSessionToken(): Promise<string> {
  const secret = sessionSecret();
  if (!secret) throw new Error('ADMIN_PASSWORD is not configured');
  const expires = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  return `${expires}.${await hmac(secret, String(expires))}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  const secret = sessionSecret();
  if (!secret || !token) return false;
  const [expires, signature] = token.split('.');
  if (!expires || !signature) return false;
  if (Number(expires) < Math.floor(Date.now() / 1000)) return false;
  return constantTimeEqual(signature, await hmac(secret, expires));
}

export async function checkPassword(candidate: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || typeof candidate !== 'string') return false;
  const key = 'sharefolder-admin-password';
  return constantTimeEqual(await hmac(key, candidate), await hmac(key, expected));
}
