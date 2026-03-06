'use client';

import { useState } from 'react';

export default function EmailSignup() {
  const [email, setEmail]   = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) throw new Error('Request failed');
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
    }
  }

  return (
    <section aria-labelledby="signup-heading">
      <h2 id="signup-heading" className="font-serif text-xl text-espresso mb-1">
        No Emails (yet)
      </h2>
      <p className="text-sm text-muted mb-4 leading-relaxed">
        Sign up and I&rsquo;ll let you know when there&rsquo;s something worth reading.
      </p>

      {status === 'success' ? (
        <p className="text-sm text-terracotta font-medium" role="status">
          You&rsquo;re on the list. Talk soon.
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-2"
          noValidate
        >
          <label htmlFor="email-input" className="sr-only">
            Email address
          </label>
          <input
            id="email-input"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-required="true"
            aria-describedby={status === 'error' ? 'email-error' : undefined}
            className="flex-1 min-w-0 bg-linen border border-border rounded px-3 py-2 text-sm text-espresso placeholder-muted focus:outline-none focus:border-tan transition-colors"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="bg-espresso text-sand text-sm px-4 py-2 rounded hover:bg-terracotta disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            {status === 'loading' ? 'Saving…' : 'Save Me A Seat'}
          </button>
        </form>
      )}

      {status === 'error' && (
        <p id="email-error" className="mt-2 text-xs text-terracotta" role="alert">
          Something went wrong. Try again in a moment.
        </p>
      )}
    </section>
  );
}
