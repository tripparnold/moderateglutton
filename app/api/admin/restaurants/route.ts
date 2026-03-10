import { NextRequest, NextResponse } from 'next/server';
import fs   from 'fs';
import path from 'path';
import { RESTAURANTS, WANT_TO_TRY } from '@/data/restaurants';
import { verifyToken, COOKIE_NAME } from '@/lib/admin-auth';

export const runtime = 'nodejs';

const NOTES_PATH  = path.join(process.cwd(), 'data', 'restaurant-notes.json');
const CUSTOM_PATH = path.join(process.cwd(), 'data', 'restaurant-custom.json');

function readNotes(): Record<string, string> {
  try { return JSON.parse(fs.readFileSync(NOTES_PATH, 'utf8')); }
  catch { return {}; }
}
function writeNotes(notes: Record<string, string>) {
  fs.writeFileSync(NOTES_PATH, JSON.stringify(notes, null, 2) + '\n', 'utf8');
}

interface CustomEntry {
  id: string; name: string; neighborhood: string; cuisine: string;
  cuisineTags: string[]; price: string; note: string;
  address: string; lat: number; lng: number; wantToTry?: boolean;
}
interface CustomData { added: CustomEntry[]; deleted: string[]; }

function readCustom(): CustomData {
  try { return JSON.parse(fs.readFileSync(CUSTOM_PATH, 'utf8')); }
  catch { return { added: [], deleted: [] }; }
}
function writeCustom(data: CustomData) {
  fs.writeFileSync(CUSTOM_PATH, JSON.stringify(data, null, 2) + '\n', 'utf8');
}
function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
async function isAuth(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  return !!token && await verifyToken(token);
}

/** GET — all restaurants merged */
export async function GET(req: NextRequest) {
  if (!await isAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const notes      = readNotes();
  const custom     = readCustom();
  const deletedSet = new Set(custom.deleted);

  const staticList = [...RESTAURANTS, ...WANT_TO_TRY]
    .filter((r) => !deletedSet.has(r.id))
    .map((r) => ({
      id: r.id, name: r.name, neighborhood: r.neighborhood,
      cuisine: r.cuisine, price: r.price,
      note: notes[r.id] ?? r.note,
      topRank: r.topRank, distinctions: r.distinctions,
      isCustom: false,
      wantToTry: !RESTAURANTS.find((x) => x.id === r.id),
    }));

  const customList = custom.added
    .filter((r) => !deletedSet.has(r.id))
    .map((r) => ({
      id: r.id, name: r.name, neighborhood: r.neighborhood,
      cuisine: r.cuisine, price: r.price,
      note: notes[r.id] ?? r.note,
      topRank: undefined, distinctions: undefined,
      isCustom: true, wantToTry: r.wantToTry ?? false,
    }));

  return NextResponse.json([...staticList, ...customList]);
}

/** PATCH — update note */
export async function PATCH(req: NextRequest) {
  if (!await isAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, note } = await req.json() as { id?: string; note?: string };
  if (!id || typeof note !== 'string') return NextResponse.json({ error: 'id and note required' }, { status: 400 });
  const notes = readNotes();
  notes[id] = note;
  writeNotes(notes);
  return NextResponse.json({ ok: true });
}

/** POST — add new restaurant */
export async function POST(req: NextRequest) {
  if (!await isAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json() as Partial<CustomEntry>;
  const { name, neighborhood, cuisine, price, address } = body;
  if (!name || !neighborhood || !cuisine || !price || !address)
    return NextResponse.json({ error: 'name, neighborhood, cuisine, price, address required' }, { status: 400 });

  const custom = readCustom();
  let id = slugify(name), i = 2;
  const taken = new Set([
    ...RESTAURANTS.map((r) => r.id),
    ...WANT_TO_TRY.map((r) => r.id),
    ...custom.added.map((r) => r.id),
  ]);
  while (taken.has(id)) id = `${slugify(name)}-${i++}`;

  custom.added.push({
    id, name: name.trim(), neighborhood: neighborhood.trim(),
    cuisine: cuisine.trim(), cuisineTags: body.cuisineTags ?? [cuisine.trim()],
    price, note: body.note?.trim() ?? '', address: address.trim(),
    lat: body.lat ?? 29.7604, lng: body.lng ?? -95.3698,
    wantToTry: body.wantToTry ?? false,
  });
  writeCustom(custom);
  return NextResponse.json({ ok: true, id });
}

/** DELETE — remove restaurant */
export async function DELETE(req: NextRequest) {
  if (!await isAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await req.json() as { id?: string };
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const custom = readCustom();
  const idx = custom.added.findIndex((r) => r.id === id);
  if (idx !== -1) custom.added.splice(idx, 1);
  else if (!custom.deleted.includes(id)) custom.deleted.push(id);
  writeCustom(custom);
  return NextResponse.json({ ok: true });
}
