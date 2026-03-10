'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// ── Types ─────────────────────────────────────────────────────────
interface AdminRestaurant {
  id:           string;
  name:         string;
  neighborhood: string;
  cuisine:      string;
  price:        string;
  note:         string;
  topRank?:     number;
  isCustom?:    boolean;
  wantToTry?:   boolean;
  distinctions?: {
    michelin?: string;
    jamesBeard?: { type: string; category: string; year: number | number[] }[];
    texasMonthlyBBQ?: boolean;
  };
}

interface AdminPost {
  section:     string;
  slug:        string;
  title:       string;
  description: string;
  date:        string;
  tags:        string[];
}

type Tab = 'restaurants' | 'recipes' | 'posts';

// ── Sub-components ────────────────────────────────────────────────
function SaveButton({ saving, onClick }: { saving: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} disabled={saving}
      className="px-3 py-1.5 text-xs rounded bg-terracotta text-white hover:opacity-90 transition-opacity disabled:opacity-50">
      {saving ? 'Saving…' : 'Save'}
    </button>
  );
}

function CancelButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="px-3 py-1.5 text-xs rounded border border-border text-tan hover:text-espresso transition-colors">
      Cancel
    </button>
  );
}

// ── Add Restaurant Form ───────────────────────────────────────────
function AddRestaurantForm({ onAdded }: { onAdded: (r: AdminRestaurant) => void }) {
  const [open,         setOpen]         = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState('');
  const [name,         setName]         = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [cuisine,      setCuisine]      = useState('');
  const [price,        setPrice]        = useState('$$$');
  const [address,      setAddress]      = useState('');
  const [note,         setNote]         = useState('');
  const [wantToTry,    setWantToTry]    = useState(false);

  function reset() {
    setName(''); setNeighborhood(''); setCuisine('');
    setPrice('$$$'); setAddress(''); setNote(''); setWantToTry(false);
    setError(''); setOpen(false);
  }

  async function submit() {
    if (!name || !neighborhood || !cuisine || !price || !address) {
      setError('Name, neighborhood, cuisine, price, and address are required.');
      return;
    }
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/admin/restaurants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, neighborhood, cuisine, price, address, note, wantToTry }),
      });
      if (!res.ok) throw new Error('Failed');
      const { id } = await res.json();
      onAdded({ id, name, neighborhood, cuisine, price, note, isCustom: true, wantToTry });
      reset();
    } catch {
      setError('Could not save — try again.');
    } finally {
      setSaving(false);
    }
  }

  const inputCls = 'w-full px-3 py-2 text-xs rounded border border-border bg-transparent text-espresso focus:outline-none focus:border-tan';
  const labelCls = 'block text-xs text-muted mb-1';

  return (
    <div className="mb-6">
      {!open ? (
        <button onClick={() => setOpen(true)}
          className="w-full py-2.5 text-xs font-medium rounded-lg border-2 border-dashed border-border text-muted hover:border-tan hover:text-espresso transition-colors">
          + Add Restaurant
        </button>
      ) : (
        <div className="border border-border rounded-xl p-5 space-y-3 bg-linen/30">
          <p className="text-sm font-medium text-espresso mb-1">New Restaurant</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Name *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Restaurant name" />
            </div>
            <div>
              <label className={labelCls}>Neighborhood *</label>
              <input value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} className={inputCls} placeholder="Montrose, Heights, EaDo…" />
            </div>
            <div>
              <label className={labelCls}>Cuisine *</label>
              <input value={cuisine} onChange={(e) => setCuisine(e.target.value)} className={inputCls} placeholder="Japanese, Italian…" />
            </div>
            <div>
              <label className={labelCls}>Price *</label>
              <select value={price} onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded border border-border bg-sand text-espresso focus:outline-none focus:border-tan">
                {['$', '$$', '$$$', '$$$$'].map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Address *</label>
              <input value={address} onChange={(e) => setAddress(e.target.value)} className={inputCls} placeholder="123 Main St, Houston, TX 77002" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Your note</label>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2}
                className={`${inputCls} resize-none`} placeholder="1–2 sentences in your voice…" />
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs text-espresso cursor-pointer">
            <input type="checkbox" checked={wantToTry} onChange={(e) => setWantToTry(e.target.checked)} className="rounded" />
            Add to &quot;On My List&quot; (not yet visited)
          </label>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex gap-2 pt-1">
            <SaveButton saving={saving} onClick={submit} />
            <CancelButton onClick={reset} />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Restaurant row ────────────────────────────────────────────────
function RestaurantRow({ r, onSaved, onDeleted }: {
  r: AdminRestaurant;
  onSaved:   (updated: AdminRestaurant) => void;
  onDeleted: (id: string) => void;
}) {
  const [editing,   setEditing]   = useState(false);
  const [note,      setNote]      = useState(r.note);
  const [saving,    setSaving]    = useState(false);
  const [deleting,  setDeleting]  = useState(false);
  const [confirm,   setConfirm]   = useState(false);
  const [error,     setError]     = useState('');

  async function save() {
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/admin/restaurants', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: r.id, note }),
      });
      if (!res.ok) throw new Error();
      onSaved({ ...r, note }); setEditing(false);
    } catch { setError('Save failed — try again'); }
    finally { setSaving(false); }
  }

  async function deleteRestaurant() {
    setDeleting(true);
    try {
      const res = await fetch('/api/admin/restaurants', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: r.id }),
      });
      if (!res.ok) throw new Error();
      onDeleted(r.id);
    } catch { setError('Delete failed — try again'); setDeleting(false); setConfirm(false); }
  }

  function cancel() { setNote(r.note); setEditing(false); setError(''); setConfirm(false); }

  return (
    <li className="border-b border-border last:border-0 py-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {r.topRank && <span className="text-xs font-semibold text-terracotta">#{r.topRank}</span>}
            <span className="font-medium text-espresso text-sm">{r.name}</span>
            <span className="text-xs text-muted">{r.neighborhood} · {r.cuisine} · {r.price}</span>
            {r.wantToTry && <span className="text-xs text-muted bg-linen px-1.5 py-0.5 rounded">On My List</span>}
            {r.isCustom  && <span className="text-xs text-muted bg-linen px-1.5 py-0.5 rounded">Custom</span>}
          </div>

          {!editing ? (
            <p className="text-xs text-muted mt-1.5 italic line-clamp-2">{r.note || '—'}</p>
          ) : (
            <div className="mt-2 space-y-2">
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
                className="w-full px-3 py-2 text-xs rounded border border-border bg-transparent text-espresso focus:outline-none focus:border-tan resize-none"
                placeholder="1–2 sentences in your voice…" />
              {error && <p className="text-xs text-red-600">{error}</p>}
              <div className="flex gap-2">
                <SaveButton saving={saving} onClick={save} />
                <CancelButton onClick={cancel} />
              </div>
            </div>
          )}
        </div>

        {!editing && (
          <div className="flex items-center gap-3 flex-shrink-0">
            <button onClick={() => setEditing(true)}
              className="text-xs text-muted hover:text-terracotta transition-colors">
              Edit note
            </button>
            {!confirm ? (
              <button onClick={() => setConfirm(true)}
                className="text-xs text-muted hover:text-red-500 transition-colors">
                Delete
              </button>
            ) : (
              <span className="flex items-center gap-1.5">
                <span className="text-xs text-red-600">Sure?</span>
                <button onClick={deleteRestaurant} disabled={deleting}
                  className="text-xs font-medium text-red-600 hover:text-red-800 transition-colors disabled:opacity-50">
                  {deleting ? 'Deleting…' : 'Yes'}
                </button>
                <button onClick={() => setConfirm(false)} className="text-xs text-muted hover:text-espresso">No</button>
              </span>
            )}
          </div>
        )}
      </div>
    </li>
  );
}

// ── Post row ──────────────────────────────────────────────────────
function PostRow({ p, onSaved }: { p: AdminPost; onSaved: (updated: AdminPost) => void }) {
  const [editing,     setEditing]     = useState(false);
  const [title,       setTitle]       = useState(p.title);
  const [description, setDescription] = useState(p.description);
  const [tagsStr,     setTagsStr]     = useState(p.tags.join(', '));
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState('');

  async function save() {
    setSaving(true); setError('');
    try {
      const tags = tagsStr.split(',').map((t) => t.trim()).filter(Boolean);
      const res  = await fetch('/api/admin/posts', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: p.section, slug: p.slug, title, description, tags }),
      });
      if (!res.ok) throw new Error();
      onSaved({ ...p, title, description, tags }); setEditing(false);
    } catch { setError('Save failed — try again'); }
    finally { setSaving(false); }
  }

  function cancel() { setTitle(p.title); setDescription(p.description); setTagsStr(p.tags.join(', ')); setEditing(false); setError(''); }

  const formatted = p.date
    ? new Date(p.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })
    : '';

  return (
    <li className="border-b border-border last:border-0 py-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs px-1.5 py-0.5 rounded bg-linen text-muted uppercase tracking-wider font-medium">{p.section}</span>
            {formatted && <span className="text-xs text-muted">{formatted}</span>}
          </div>
          {!editing ? (
            <>
              <p className="font-medium text-espresso text-sm mt-1">{p.title}</p>
              {p.description && <p className="text-xs text-muted mt-0.5 line-clamp-1">{p.description}</p>}
              {p.tags.length > 0 && (
                <p className="text-xs text-muted mt-1">
                  {p.tags.map((t) => <span key={t} className="inline-block bg-linen rounded px-1.5 py-0.5 mr-1 mb-1">{t}</span>)}
                </p>
              )}
            </>
          ) : (
            <div className="mt-2 space-y-2">
              <div>
                <label className="block text-xs text-muted mb-1">Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded border border-border bg-transparent text-espresso focus:outline-none focus:border-tan" />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Description</label>
                <input value={description} onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded border border-border bg-transparent text-espresso focus:outline-none focus:border-tan" />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Tags (comma-separated)</label>
                <input value={tagsStr} onChange={(e) => setTagsStr(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded border border-border bg-transparent text-espresso focus:outline-none focus:border-tan"
                  placeholder="beef, weeknight, quick" />
              </div>
              {error && <p className="text-xs text-red-600">{error}</p>}
              <div className="flex gap-2">
                <SaveButton saving={saving} onClick={save} />
                <CancelButton onClick={cancel} />
              </div>
            </div>
          )}
        </div>
        {!editing && (
          <button onClick={() => setEditing(true)}
            className="text-xs text-muted hover:text-terracotta transition-colors flex-shrink-0">
            Edit
          </button>
        )}
      </div>
    </li>
  );
}

// ── Main dashboard ─────────────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter();
  const [tab,         setTab]         = useState<Tab>('restaurants');
  const [restaurants, setRestaurants] = useState<AdminRestaurant[]>([]);
  const [posts,       setPosts]       = useState<AdminPost[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadRestaurants = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/restaurants');
      if (res.status === 401) { router.push('/admin'); return; }
      setRestaurants(await res.json());
    } finally { setLoading(false); }
  }, [router]);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/posts');
      if (res.status === 401) { router.push('/admin'); return; }
      setPosts(await res.json());
    } finally { setLoading(false); }
  }, [router]);

  useEffect(() => {
    if (tab === 'restaurants') loadRestaurants();
    else loadPosts();
  }, [tab, loadRestaurants, loadPosts]);

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
  }

  const filteredRestaurants = restaurants.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return r.name.toLowerCase().includes(q) || r.neighborhood.toLowerCase().includes(q) || r.cuisine.toLowerCase().includes(q);
  });

  const recipes = posts.filter((p) => p.section === 'recipes');
  const spills  = posts.filter((p) => p.section === 'spills');
  const filteredPosts = (tab === 'recipes' ? recipes : spills).filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.title.toLowerCase().includes(q) || p.tags.join(' ').toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-sand)' }}>
      <header className="border-b border-border px-4 sm:px-6 h-14 flex items-center justify-between">
        <h1 className="font-serif font-medium text-espresso text-lg">Admin</h1>
        <button onClick={logout} className="text-xs text-muted hover:text-terracotta transition-colors">Sign out</button>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Tab bar */}
        <div className="flex gap-1 mb-6 border border-border rounded-lg p-1 bg-linen/40">
          {(['restaurants', 'recipes', 'posts'] as Tab[]).map((t) => (
            <button key={t} onClick={() => { setTab(t); setSearchQuery(''); }}
              className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-colors capitalize ${
                tab === t ? 'bg-white shadow-sm text-espresso' : 'text-muted hover:text-espresso'
              }`}>
              {t}
              {t === 'restaurants' && restaurants.length > 0 && <span className="ml-1 text-muted font-normal">({restaurants.length})</span>}
              {t === 'recipes'     && recipes.length > 0     && <span className="ml-1 text-muted font-normal">({recipes.length})</span>}
              {t === 'posts'       && spills.length > 0      && <span className="ml-1 text-muted font-normal">({spills.length})</span>}
            </button>
          ))}
        </div>

        {/* Search */}
        <input type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={tab === 'restaurants' ? 'Search restaurants…' : 'Search posts…'}
          className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-transparent text-espresso placeholder-muted focus:outline-none focus:border-tan transition-colors mb-6" />

        {/* Content */}
        {loading ? (
          <p className="text-muted text-sm text-center py-12">Loading…</p>
        ) : tab === 'restaurants' ? (
          <>
            <AddRestaurantForm onAdded={(r) => setRestaurants((prev) => [...prev, r])} />
            {filteredRestaurants.length === 0
              ? <p className="text-muted text-sm text-center py-12">No results</p>
              : (
                <ul>
                  {filteredRestaurants.map((r) => (
                    <RestaurantRow key={r.id} r={r}
                      onSaved={(updated) => setRestaurants((prev) => prev.map((x) => x.id === updated.id ? updated : x))}
                      onDeleted={(id) => setRestaurants((prev) => prev.filter((x) => x.id !== id))}
                    />
                  ))}
                </ul>
              )}
          </>
        ) : (
          <>
            {filteredPosts.length === 0
              ? <p className="text-muted text-sm text-center py-12">No results</p>
              : (
                <ul>
                  {filteredPosts.map((p) => (
                    <PostRow key={`${p.section}/${p.slug}`} p={p}
                      onSaved={(updated) => setPosts((prev) => prev.map((x) => x.section === updated.section && x.slug === updated.slug ? updated : x))}
                    />
                  ))}
                </ul>
              )}
          </>
        )}
      </div>
    </div>
  );
}
