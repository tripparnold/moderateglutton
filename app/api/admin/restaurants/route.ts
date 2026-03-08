import { NextRequest, NextResponse } from 'next/server';
import fs   from 'fs';
import path from 'path';
import { RESTAURANTS } from '@/data/restaurants';
import { verifyToken, COOKIE_NAME } from '@/lib/admin-auth';

export const runtime = 'nodejs';

const NOTES_PATH = path.join(process.cwd(), 'data', 'restaurant-notes.json');

function readNotes(): Record<string, string> {
  try {
    return JSON.parse(fs.readFileSync(NOTES_PATH, 'utf8'));
  } catch {
    return {};
  }
}

function writeNotes(notes: Record<string, string>) {
  fs.writeFileSync(NOTES_PATH, JSON.stringify(notes, null, 2) + '\n', 'utf8');
}

async function isAuth(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  return !!token && await verifyToken(token);
}

/** GET /api/admin/restaurants — returns all restaurants merged with note overrides */
export async function GET(req: NextRequest) {
  if (!await isAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const notes = readNotes();
  const data  = RESTAURANTS.map((r) => ({
    id:           r.id,
    name:         r.name,
    neighborhood: r.neighborhood,
    cuisine:      r.cuisine,
    price:        r.price,
    note:         notes[r.id] ?? r.note,
    topRank:      r.topRank,
    distinctions: r.distinctions,
  }));
  return NextResponse.json(data);
}

/** PATCH /api/admin/restaurants — update note for one restaurant */
export async function PATCH(req: NextRequest) {
  if (!await isAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, note } = await req.json() as { id?: string; note?: string };
  if (!id || typeof note !== 'string') {
    return NextResponse.json({ error: 'id and note are required' }, { status: 400 });
  }
  const notes  = readNotes();
  notes[id]    = note;
  writeNotes(notes);
  return NextResponse.json({ ok: true });
}
