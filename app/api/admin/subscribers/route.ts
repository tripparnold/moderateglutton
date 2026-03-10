import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, COOKIE_NAME } from '@/lib/admin-auth';
import fs   from 'fs';
import path from 'path';

async function isAuth(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  return !!token && await verifyToken(token);
}

// ── Helpers ──────────────────────────────────────────────────────

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
  } catch { return null; }
}

// Local dev: read/write subscribers.json
function readLocalSubscribers(): { email: string }[] {
  const filePath = path.join(process.cwd(), 'data', 'subscribers.json');
  if (!fs.existsSync(filePath)) return [];
  try {
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (Array.isArray(raw) && typeof raw[0] === 'string') {
      return raw.map((e: string) => ({ email: e }));
    }
    return raw;
  } catch { return []; }
}

function writeLocalSubscribers(list: { email: string }[]) {
  const dir      = path.join(process.cwd(), 'data');
  const filePath = path.join(dir, 'subscribers.json');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(list.map((s) => s.email), null, 2));
}

// ── GET — list all subscribers ─────────────────────────────────

export async function GET(req: NextRequest) {
  if (!await isAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (process.env.NODE_ENV !== 'production') {
    return NextResponse.json(readLocalSubscribers());
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'RESEND_API_KEY not set' }, { status: 500 });

  const audienceId = await getAudienceId(apiKey);
  if (!audienceId) return NextResponse.json({ error: 'No Resend audience found' }, { status: 500 });

  const res  = await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) return NextResponse.json({ error: 'Resend error' }, { status: 502 });
  const data = await res.json() as { data: { id: string; email: string; created_at: string; unsubscribed: boolean }[] };
  return NextResponse.json(data.data ?? []);
}

// ── POST — add a subscriber ────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!await isAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { email } = await req.json() as { email?: string };
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });

  if (process.env.NODE_ENV !== 'production') {
    const list = readLocalSubscribers();
    if (!list.find((s) => s.email === email)) list.push({ email });
    writeLocalSubscribers(list);
    return NextResponse.json({ ok: true });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'RESEND_API_KEY not set' }, { status: 500 });

  const audienceId = await getAudienceId(apiKey);
  if (!audienceId) return NextResponse.json({ error: 'No Resend audience found' }, { status: 500 });

  const res = await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
    method:  'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify({ email, unsubscribed: false }),
  });
  if (!res.ok) return NextResponse.json({ error: 'Resend error' }, { status: 502 });
  return NextResponse.json({ ok: true });
}

// ── DELETE — remove a subscriber ───────────────────────────────

export async function DELETE(req: NextRequest) {
  if (!await isAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, email } = await req.json() as { id?: string; email?: string };

  if (process.env.NODE_ENV !== 'production') {
    const list = readLocalSubscribers().filter((s) => s.email !== email);
    writeLocalSubscribers(list);
    return NextResponse.json({ ok: true });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'RESEND_API_KEY not set' }, { status: 500 });

  const audienceId = await getAudienceId(apiKey);
  if (!audienceId) return NextResponse.json({ error: 'No Resend audience found' }, { status: 500 });

  // Resend requires contact ID for deletion
  const contactId = id;
  if (!contactId) return NextResponse.json({ error: 'Contact id required' }, { status: 400 });

  const res = await fetch(`https://api.resend.com/audiences/${audienceId}/contacts/${contactId}`, {
    method:  'DELETE',
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) return NextResponse.json({ error: 'Resend error' }, { status: 502 });
  return NextResponse.json({ ok: true });
}
