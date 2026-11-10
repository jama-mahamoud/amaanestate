import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';
import { submitContactMessage } from '../services/editorialService';
import { toast } from 'sonner';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Editorial Tip / Press Inquiry');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  useSEO({
    title: 'Contact Editorial & Business Desk',
    description:
      'Contact AMAAN ESTATE for editorial pitches, research collaborations, advertising partnerships, or reader corrections.',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await submitContactMessage({ name, email, subject, message });
    setSubmitting(false);

    if (res.success) {
      setName('');
      setEmail('');
      setMessage('');
      setSent(true);
      toast.success('Your message has been delivered to the AMAAN ESTATE desk.');
    } else {
      toast.error(res.error || 'Unable to send message. Please verify your details.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <header className="space-y-4 border-b border-[#E5E0D8] pb-8">
        <p className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">
          Contact &amp; Inquiries
        </p>
        <h1 className="text-3xl sm:text-5xl font-serif font-semibold text-[#141413]">
          Reach the AMAAN ESTATE Desk
        </h1>
        <p className="text-base text-[#4A4843] max-w-2xl leading-relaxed">
          For editorial pitches, architectural press kits, research inquiries, corrections, or sponsorship partnerships, please submit your message below.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-[#E5E0D8] rounded p-6 space-y-5">
            <h2 className="text-xl font-serif font-semibold text-[#141413]">Direct Channels</h2>
            <dl className="space-y-4 text-sm">
              <div className="border-b border-[#E5E0D8] pb-3">
                <dt className="text-xs uppercase tracking-widest text-[#5C5A55] font-semibold">Editorial Desk</dt>
                <dd className="text-[#141413] font-medium mt-1">editorial@amaanestate.com</dd>
              </div>
              <div className="border-b border-[#E5E0D8] pb-3">
                <dt className="text-xs uppercase tracking-widest text-[#5C5A55] font-semibold">Research &amp; Syndication</dt>
                <dd className="text-[#141413] font-medium mt-1">research@amaanestate.com</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-widest text-[#5C5A55] font-semibold">Advertising &amp; Partnerships</dt>
                <dd className="text-[#141413] font-medium mt-1">partnerships@amaanestate.com</dd>
              </div>
            </dl>
            <p className="text-xs text-[#5C5A55] leading-relaxed">
              Before pitching an article, please review our{' '}
              <Link to="/editorial-policy" className="text-[#1E3A5F] underline">
                Editorial Policy
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="lg:col-span-7 bg-white border border-[#E5E0D8] rounded p-6 sm:p-8">
          {sent ? (
            <div className="py-8 space-y-4">
              <h2 className="text-2xl font-serif font-semibold text-[#141413]">Message Received</h2>
              <p className="text-sm text-[#4A4843] leading-relaxed">
                Thank you for contacting AMAAN ESTATE. Our editorial or partnerships coordinator will review your submission and respond promptly.
              </p>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="px-5 py-2.5 bg-[#1E3A5F] text-white text-sm font-semibold rounded cursor-pointer"
              >
                Send Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h2 className="text-xl font-serif font-semibold text-[#141413]">Send a Message</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="contact-name" className="text-xs font-semibold uppercase tracking-wider text-[#5C5A55] block">
                    Full Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    minLength={2}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full h-11 px-3.5 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm text-[#141413] focus:outline-none focus:border-[#1E3A5F]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="contact-email" className="text-xs font-semibold uppercase tracking-wider text-[#5C5A55] block">
                    Email Address
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@organization.com"
                    className="w-full h-11 px-3.5 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm text-[#141413] focus:outline-none focus:border-[#1E3A5F]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="contact-subject" className="text-xs font-semibold uppercase tracking-wider text-[#5C5A55] block">
                  Subject
                </label>
                <select
                  id="contact-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full h-11 px-3.5 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm text-[#141413] focus:outline-none focus:border-[#1E3A5F]"
                >
                  <option value="Editorial Tip / Press Inquiry">Editorial Tip / Press Inquiry</option>
                  <option value="Architecture Submission">Architecture Submission</option>
                  <option value="Research & Data Collaboration">Research &amp; Data Collaboration</option>
                  <option value="Advertising & Sponsorship">Advertising &amp; Sponsorship</option>
                  <option value="Reader Correction">Reader Correction</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="contact-message" className="text-xs font-semibold uppercase tracking-wider text-[#5C5A55] block">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  required
                  minLength={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share your inquiry, architectural project notes, or research topic..."
                  className="w-full p-3.5 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm text-[#141413] focus:outline-none focus:border-[#1E3A5F] resize-y"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="h-11 px-6 bg-[#1E3A5F] hover:bg-[#162C49] disabled:opacity-60 text-white text-sm font-semibold rounded transition-colors cursor-pointer"
              >
                {submitting ? 'Delivering...' : 'Submit Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
