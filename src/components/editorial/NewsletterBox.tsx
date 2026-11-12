import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { subscribeNewsletter } from '../../services/editorialService';

interface NewsletterBoxProps {
  source?: string;
}

export default function NewsletterBox({ source = 'homepage' }: NewsletterBoxProps) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    const res = await subscribeNewsletter(email, source);
    setSubmitting(false);
    if (res.success) {
      setEmail('');
      setFeedback({ type: 'success', text: res.message });
    } else {
      setFeedback({ type: 'error', text: res.message });
    }
  };

  return (
    <section
      aria-labelledby="newsletter-heading"
      className="bg-white border border-[#E5E0D8] rounded p-8 sm:p-12"
    >
      <div className="max-w-3xl mx-auto text-center space-y-5">
        <p className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">
          Global Real Estate Briefing
        </p>
        <h2
          id="newsletter-heading"
          className="text-2xl sm:text-3xl font-serif font-semibold text-[#141413]"
        >
          Stay Informed. Think Globally.
        </h2>
        <p className="text-sm sm:text-base text-[#5C5A55] max-w-xl mx-auto leading-relaxed">
          Receive selected property research, market insights and international real estate developments in your inbox.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto pt-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            aria-label="Email address for newsletter"
            className="flex-1 h-11 px-4 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm text-[#141413] placeholder:text-[#7A7770] focus:outline-none focus:border-[#1E3A5F]"
          />
          <button
            type="submit"
            disabled={submitting}
            className="h-11 px-6 bg-[#1E3A5F] hover:bg-[#162C49] disabled:opacity-60 text-white text-sm font-semibold rounded transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            {submitting ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>

        {feedback && (
          <p
            role="status"
            className={`text-sm font-medium ${
              feedback.type === 'success' ? 'text-[#14532D]' : 'text-[#991B1B]'
            }`}
          >
            {feedback.text}
          </p>
        )}

        <p className="text-xs text-[#7A7770]">
          Read our{' '}
          <Link to="/privacy-policy" className="underline hover:text-[#141413]">
            Privacy Policy
          </Link>{' '}
          or{' '}
          <Link to="/newsletter" className="underline hover:text-[#141413]">
            manage your subscription
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
