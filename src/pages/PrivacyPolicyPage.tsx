import React from 'react';
import { Link } from 'react-router-dom';
import { getCanonicalOrigin, useSEO } from '../hooks/useSEO';

export default function PrivacyPolicyPage() {
  useSEO({
    title: 'Privacy Policy | AmaanEstate',
    description:
      'Privacy Policy for AmaanEstate (amaanestate.com) covering property marketplace inquiries, newsletter subscriptions, cookies, and advertising.',
    url: `${getCanonicalOrigin()}/privacy-policy`,
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <header className="space-y-3 border-b border-[#E5E0D8] pb-8">
        <p className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">Legal</p>
        <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-[#141413]">Privacy Policy</h1>
        <p className="text-sm text-[#5C5A55]">Effective Date: November 2026 · amaanestate.com</p>
      </header>

      <div className="space-y-6 text-base text-[#292825] leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-xl font-serif font-semibold text-[#141413]">1. Information We Collect</h2>
          <p>
            AMAAN ESTATE collects information you voluntarily provide when subscribing to our editorial newsletter (email address) or submitting an inquiry through our Contact page (name, email address, subject, and message). We also store aggregated article view metrics without personally identifying individual visitors.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-serif font-semibold text-[#141413]">2. How We Use Information</h2>
          <p>
            Subscriber email addresses are used solely to deliver AMAAN ESTATE editorial briefings and manage subscription preferences. Contact submissions are used exclusively to respond to reader, press, or partnership inquiries. We never sell personal email lists to third-party data brokers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-serif font-semibold text-[#141413]">3. Cookies &amp; Advertising Partners</h2>
          <p>
            When advertising services such as Google AdSense are enabled on amaanestate.com, third-party vendors may use cookies to serve relevant advertisements based on prior visits to this or other websites. Readers may opt out of personalized advertising via Google Ads Settings or browser cookie controls.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-serif font-semibold text-[#141413]">4. Data Security &amp; Retention</h2>
          <p>
            Subscriber and inquiry records are hosted on PostgreSQL infrastructure protected by Row Level Security (RLS) policies, restricting administrative access strictly to authorized editors and administrators.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-serif font-semibold text-[#141413]">5. Your Rights</h2>
          <p>
            You may unsubscribe from our newsletter at any time via our{' '}
            <Link to="/newsletter" className="text-[#1E3A5F] underline">
              Newsletter Management page
            </Link>{' '}
            or request deletion of your contact inquiry via our{' '}
            <Link to="/contact" className="text-[#1E3A5F] underline">
              Contact page
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
