import { NextRequest, NextResponse } from 'next/server';
import fs   from 'fs';
import path from 'path';

/*
 * Email subscriber storage
 * ─────────────────────────
 * In development  → appends to /data/subscribers.json in the project root.
 * In production   → replace the body of `saveEmail()` with your preferred
 *                   backend, for example:
 *
 *   Neon (free Postgres):
 *     import { neon } from '@neondatabase/serverless';
 *     const sql = neon(process.env.DATABASE_URL!);
 *     await sql`INSERT INTO subscribers (email) VALUES (${email}) ON CONFLICT DO NOTHING`;
 *
 *   Resend audience (free tier):
 *     await fetch('https://api.resend.com/audiences/{id}/contacts', {
 *       method: 'POST',
 *       headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
 *       body: JSON.stringify({ email }),
 *     });
 */

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function saveEmail(email: string): Promise<void> {
  // ── Local / dev: write to data/subscribers.json ──────────────
  if (process.env.NODE_ENV !== 'production') {
    const dataDir  = path.join(process.cwd(), 'data');
    const filePath = path.join(dataDir, 'subscribers.json');

    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

    let existing: string[] = [];
    if (fs.existsSync(filePath)) {
      try { existing = JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch {}
    }

    if (!existing.includes(email)) {
      existing.push(email);
      fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));
    }
    return;
  }

  // ── Production: add your storage backend here ────────────────
  // TODO: see comments above for Neon or Resend examples
  console.log('[subscribe] new subscriber:', email);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    await saveEmail(email);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error('[subscribe]', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
