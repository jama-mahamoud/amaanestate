import React, { useState } from 'react';
import { subscribeNewsletter } from '../../services/editorialService';
import { toast } from 'sonner';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    const res = await subscribeNewsletter(email, 'homepage-section');
    setSubmitting(false);

    if (res.success) {
      toast.success(res.message || 'Thank you for subscribing to AMAAN ESTATE briefings.');
      setEmail('');
    } else {
      toast.error(res.message || 'Unable to complete subscription.');
    }
  };

  return (
    <section
      aria-labelledby="homepage-newsletter-heading"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <div className="bg-white border border-[#E5E0D8] rounded-md p-6 sm:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-6 space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#8C4A27]">
              Global Real Estate Briefing
            </p>
            <h2
              id="homepage-newsletter-heading"
              className="text-2xl sm:text-3xl font-serif font-semibold text-[#141413]"
            >
              Stay Informed. Think Globally.
            </h2>
            <p className="text-sm text-[#5C5A55] max-w-lg leading-relaxed">
              Receive selected property research, market insights and international real estate developments in your inbox.
            </p>
          </div>

          <div className="lg:col-span-6 min-w-0">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-2.5 max-w-lg lg:ml-auto"
            >
              <input
                type="email"
                required
                aria-label="Email address for briefing newsletter"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 min-w-0 w-full h-11 px-4 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm text-[#141413] placeholder:text-[#7A7770] focus:outline-none focus:border-[#1E3A5F]"
              />
              <button
                type="submit"
                disabled={submitting}
                className="h-11 px-6 bg-[#1E3A5F] hover:bg-[#141413] text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0 w-full sm:w-auto"
              >
                {submitting ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
