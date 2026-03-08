'use client';

import { useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

export default function AdminLogin() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ password }),
      });

      if (res.ok) {
        const next = searchParams.get('next') ?? '/admin/dashboard';
        router.push(next);
      } else {
        const data = await res.json();
        setError(data.error ?? 'Login failed');
      }
    } catch {
      setError('Something went wrong — try again');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
         style={{ background: 'var(--color-sand)' }}>
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/media/website/logo-icon.png"
            alt="Moderate Glutton"
            width={56} height={56}
            style={{ width: 'auto', height: '52px', objectFit: 'contain',
                     filter: 'brightness(0) sepia(1) hue-rotate(-12deg) saturate(1.4) brightness(0.72)' }}
          />
        </div>

        <h1 className="font-serif font-light text-espresso text-2xl text-center mb-1">Admin</h1>
        <p className="text-muted text-xs text-center mb-8">Moderate Glutton</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-xs font-medium text-muted uppercase tracking-widest mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
              className="w-full px-4 py-3 rounded-lg border border-border bg-transparent text-espresso placeholder-muted focus:outline-none focus:border-tan transition-colors text-sm"
              placeholder="Enter admin password"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-terracotta text-white text-sm font-medium hover:bg-terracotta/90 transition-colors disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

      </div>
    </div>
  );
}
