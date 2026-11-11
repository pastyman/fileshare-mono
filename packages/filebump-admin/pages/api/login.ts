import type { NextApiRequest, NextApiResponse } from 'next';
import {
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  checkPassword,
  createSessionToken,
  isAdminConfigured,
} from '../../src/auth';

const FAILED_LOGIN_DELAY_MS = 1000;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!isAdminConfigured()) {
    return res.status(503).json({ error: 'ADMIN_PASSWORD is not configured on the server' });
  }

  if (!(await checkPassword(req.body?.password))) {
    await new Promise((resolve) => setTimeout(resolve, FAILED_LOGIN_DELAY_MS));
    return res.status(401).json({ error: 'Incorrect password' });
  }

  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE}=${await createSessionToken()}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_TTL_SECONDS}${secure}`
  );
  return res.status(200).json({ ok: true });
}
