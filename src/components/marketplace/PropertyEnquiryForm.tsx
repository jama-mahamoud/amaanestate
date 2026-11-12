import React, { useState } from 'react';
import { CheckCircle2, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Property } from '../../types';
import { formatPropertyPrice, submitPropertyEnquiry } from '../../services/propertyService';

interface PropertyEnquiryFormProps {
  property: Property;
}

export default function PropertyEnquiryForm({ property }: PropertyEnquiryFormProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState(
    `I would like to request verified information regarding ${property.title}.`
  );
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedMsg, setSubmittedMsg] = useState<string | null>(null);

  const isShowcase = Boolean(property.is_sample) || property.source_name === 'showcase_sample';
  const listingRef = property.source_listing_id || property.slug;
  const priceLabel = formatPropertyPrice(
    property.price,
    property.currency,
    property.transaction_type,
    property.rental_period
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isShowcase) return;

    setErrorMsg(null);
    setSubmittedMsg(null);

    if (fullName.trim().length < 2) {
      setErrorMsg('Please enter your full name (at least 2 characters).');
      return;
    }
    if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (message.trim().length < 10) {
      setErrorMsg('Please include an enquiry message of at least 10 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitPropertyEnquiry({
        property_id: property.id,
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        message: message.trim(),
      });

      if (!result.success) {
        setErrorMsg(result.error || 'Unable to submit enquiry. Please review your details.');
      } else {
        setSubmittedMsg(
          result.message || 'Your enquiry has been submitted and logged for review.'
        );
        setFullName('');
        setEmail('');
        setPhone('');
      }
    } catch {
      setErrorMsg('Unable to submit your enquiry right now. Please try again shortly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-[#E5E0D8] rounded p-6 space-y-5">
      <div className="border-b border-[#E5E0D8] pb-4 space-y-1">
        <p className="text-[11px] uppercase tracking-widest font-semibold text-[#8C4A27]">
          {isShowcase ? 'Showcase Property' : 'Property Enquiry'}
        </p>
        <h2 className="text-xl font-serif font-semibold text-[#141413]">
          {isShowcase ? 'Illustrative Sample' : 'Request Verified Information'}
        </h2>
        <p className="text-xs text-[#5C5A55]">
          {priceLabel} · Ref <span className="font-mono">{listingRef}</span>
        </p>
      </div>

      {isShowcase ? (
        <div className="bg-[#FAF8F5] border border-[#D6CEBE] rounded p-5 space-y-4 text-sm text-[#4A4843]">
          <div className="flex items-start gap-3">
            <Info size={20} className="shrink-0 text-[#8C4A27] mt-0.5" />
            <p className="text-xs leading-relaxed">
              These are illustrative property examples for presentation purposes and are not confirmed active market listings. Commercial enquiries are disabled for showcase portfolio items as they are not active inventory.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to={property.transaction_type === 'rent' ? '/rent' : '/buy'}
              className="inline-block w-full text-center py-2.5 px-4 bg-[#1E3A5F] hover:bg-[#142944] text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors"
            >
              Browse Active {property.transaction_type === 'rent' ? 'Rental' : 'Sale'} Listings
            </Link>
          </div>
        </div>
      ) : submittedMsg ? (
        <div className="bg-[#FAF8F5] border border-[#D6CEBE] rounded p-4 space-y-2.5 text-sm">
          <div className="flex items-start gap-2.5 text-[#14532D]">
            <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Enquiry Recorded</p>
              <p className="text-xs text-[#4A4843] leading-relaxed">{submittedMsg}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSubmittedMsg(null)}
            className="text-xs font-semibold text-[#1E3A5F] hover:underline cursor-pointer"
          >
            Send another message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div
              role="alert"
              className="bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] rounded px-3.5 py-2.5 text-xs"
            >
              {errorMsg}
            </div>
          )}

          <div>
            <label htmlFor="enquiry-ref" className="block text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55] mb-1">
              Property Reference
            </label>
            <input
              id="enquiry-ref"
              type="text"
              readOnly
              value={`${property.title} (${listingRef})`}
              className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#E5E0D8] rounded text-xs font-mono text-[#5C5A55]"
            />
          </div>

          <div>
            <label htmlFor="enquiry-name" className="block text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55] mb-1">
              Full Name *
            </label>
            <input
              id="enquiry-name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              className="w-full h-10 px-3 bg-white border border-[#D6CEBE] rounded text-sm text-[#141413] placeholder:text-[#7A7770] focus:outline-none focus:border-[#1E3A5F]"
            />
          </div>

          <div>
            <label htmlFor="enquiry-email" className="block text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55] mb-1">
              Email Address *
            </label>
            <input
              id="enquiry-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full h-10 px-3 bg-white border border-[#D6CEBE] rounded text-sm text-[#141413] placeholder:text-[#7A7770] focus:outline-none focus:border-[#1E3A5F]"
            />
          </div>

          <div>
            <label htmlFor="enquiry-phone" className="block text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55] mb-1">
              Phone Number
            </label>
            <input
              id="enquiry-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Optional"
              className="w-full h-10 px-3 bg-white border border-[#D6CEBE] rounded text-sm text-[#141413] placeholder:text-[#7A7770] focus:outline-none focus:border-[#1E3A5F]"
            />
          </div>

          <div>
            <label htmlFor="enquiry-message" className="block text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55] mb-1">
              Enquiry Message *
            </label>
            <textarea
              id="enquiry-message"
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 bg-white border border-[#D6CEBE] rounded text-sm text-[#141413] placeholder:text-[#7A7770] focus:outline-none focus:border-[#1E3A5F]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-11 bg-[#1E3A5F] hover:bg-[#142944] text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'Submitting Enquiry...' : 'Submit Enquiry'}
          </button>
        </form>
      )}
    </div>
  );
}
