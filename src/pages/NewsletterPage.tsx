import React, { useState } from 'react';
import { useSEO } from '../hooks/useSEO';
import { subscribeNewsletter, unsubscribeNewsletter } from '../services/editorialService';

export default function NewsletterPage() {
  const [mode, setMode] = useState<'subscribe' | 'unsubscribe'>('subscribe');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useSEO({
    title: 'Newsletter & Subscription Management',
    description: 'Subscribe to AMAAN ESTATE weekly real estate briefings or manage your existing email preferences.',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    const res =
      mode === 'subscribe'
        ? await subscribeNewsletter(email, 'newsletter-page')
        : await unsubscribeNewsletter(email);

    setLoading(false);
    setStatusMessage({ ok: res.success, text: res.message });
    if (res.success) {
      setEmail('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
      <header className="space-y-3 border-b border-[#E5E0D8] pb-6">
        <p className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">
          Reader Preferences
        </p>
        <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-[#141413]">
          Newsletter Subscription Management
        </h1>
        <p className="text-sm text-[#5C5A55] leading-relaxed">
          Subscribe to our weekly digest covering global real estate capital markets, architecture, and construction technology, or opt out below.
        </p>
      </header>

      <div className="bg-white border border-[#E5E0D8] rounded p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-1 p-1 bg-[#EFECE6] rounded w-fit">
          <button
            type="button"
            onClick={() => {
              setMode('subscribe');
              setStatusMessage(null);
            }}
            className={`px-4 py-2 text-xs font-semibold rounded transition-colors cursor-pointer ${
              mode === 'subscribe' ? 'bg-white text-[#141413] shadow-xs' : 'text-[#5C5A55]'
            }`}
          >
            Subscribe
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('unsubscribe');
              setStatusMessage(null);
            }}
            className={`px-4 py-2 text-xs font-semibold rounded transition-colors cursor-pointer ${
              mode === 'unsubscribe' ? 'bg-white text-[#141413] shadow-xs' : 'text-[#5C5A55]'
            }`}
          >
            Unsubscribe
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="newsletter-email" className="text-xs font-semibold uppercase tracking-wider text-[#5C5A55] block">
              Email Address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="reader@organization.com"
              className="w-full h-11 px-3.5 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm text-[#141413] focus:outline-none focus:border-[#1E3A5F]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="h-11 px-6 bg-[#1E3A5F] hover:bg-[#162C49] text-white text-sm font-semibold rounded transition-colors cursor-pointer"
          >
            {loading
              ? 'Processing...'
              : mode === 'subscribe'
              ? 'Confirm Subscription'
              : 'Unsubscribe Email'}
          </button>
        </form>

        {statusMessage && (
          <p
            role="status"
            className={`text-sm font-medium ${statusMessage.ok ? 'text-[#14532D]' : 'text-[#991B1B]'}`}
          >
            {statusMessage.text}
          </p>
        )}
      </div>
    </div>
  );
}
