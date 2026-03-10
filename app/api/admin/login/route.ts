import { NextRequest, NextResponse } from 'next/server';
import { createToken, COOKIE_NAME, MAX_AGE_SEC } from '@/lib/admin-auth';

// In-memory attempt tracker (best-effort; resets on cold start, which is fine)
const attempts = new Map<string, { count: number; lockedUntil: number }>();

const MAX_ATTEMPTS  = 10;      // lock after 10 failures
const LOCKOUT_MS    = 15 * 60 * 1000; // 15 minutes
const FAIL_DELAY_MS = 1000;    // 1 second delay on every failure

function getIP(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
}

export async function POST(req: NextRequest) {
  const ip    = getIP(req);
  const now   = Date.now();
  const state = attempts.get(ip) ?? { count: 0, lockedUntil: 0 };

  // Locked out?
  if (state.lockedUntil > now) {
    const mins = Math.ceil((state.lockedUntil - now) / 60000);
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${mins} minute${mins === 1 ? '' : 's'}.` },
      { status: 429 },
    );
  }

  const body = await req.json().catch(() => ({})) as { password?: string };
  const { password } = body;

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    // Artificial delay to slow brute force
    await new Promise((r) => setTimeout(r, FAIL_DELAY_MS));

    state.count += 1;
    if (state.count >= MAX_ATTEMPTS) {
      state.lockedUntil = now + LOCKOUT_MS;
      state.count       = 0;
    }
    attempts.set(ip, state);

    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  }

  // Success — clear failed attempts for this IP
  attempts.delete(ip);

  const token = await createToken();
  const res   = NextResponse.json({ ok: true });

  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   MAX_AGE_SEC,
    path:     '/',
  });

  return res;
}
