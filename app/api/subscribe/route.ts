import { NextRequest, NextResponse } from 'next/server';
import fs   from 'fs';
import path from 'path';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Cache the audience ID so we only fetch it once per cold start
let cachedAudienceId: string | null = null;

async function getAudienceId(apiKey: string): Promise<string | null> {
  if (cachedAudienceId) return cachedAudienceId;
  try {
    const res  = await fetch('https://api.resend.com/audiences', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) return null;
    const data = await res.json() as { data: { id: string }[] };
    cachedAudienceId = data.data?.[0]?.id ?? null;
    return cachedAudienceId;
  } catch {
    return null;
  }
}

async function saveEmail(email: string): Promise<void> {
  // ── Production: save to Resend audience ──────────────────────
  if (process.env.NODE_ENV === 'production') {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) { console.error('[subscribe] RESEND_API_KEY not set'); return; }

    const audienceId = await getAudienceId(apiKey);
    if (!audienceId) { console.error('[subscribe] Could not find Resend audience'); return; }

    const res = await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
      method:  'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, unsubscribed: false }),
    });
    if (!res.ok) console.error('[subscribe] Resend error:', res.status, await res.text());
    return;
  }

  // ── Local / dev: write to data/subscribers.json ──────────────
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
}

export async function POST(req: NextRequest) {
  try {
    const body  = await req.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (!email || !isValidEmail(email))
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    await saveEmail(email);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error('[subscribe]', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
