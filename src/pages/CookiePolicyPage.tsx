import React from 'react';
import { Link } from 'react-router-dom';
import { getCanonicalOrigin, useSEO } from '../hooks/useSEO';

export default function CookiePolicyPage() {
  useSEO({
    title: 'Cookie Policy & Consent Settings | AmaanEstate',
    description:
      'AmaanEstate Cookie Policy detailing strictly necessary, analytical, and third-party advertising cookies including Google AdSense.',
    url: `${getCanonicalOrigin()}/cookie-policy`,
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <header className="space-y-3 border-b border-[#E5E0D8] pb-8">
        <p className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">Privacy &amp; Transparency</p>
        <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-[#141413]">
          Cookie Policy &amp; Tracking Technologies
        </h1>
        <p className="text-sm text-[#5C5A55]">Last updated: November 2026</p>
      </header>

      <div className="space-y-6 text-base text-[#292825] leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-xl font-serif font-semibold text-[#141413]">1. What Are Cookies</h2>
          <p>
            Cookies are small text files stored on your device when you visit websites. AMAAN ESTATE uses cookies and similar browser storage technologies to enhance site navigation, measure audience engagement, and deliver relevant editorial content and programmatic advertisements.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-serif font-semibold text-[#141413]">2. Categories of Cookies We Use</h2>
          <ul className="list-disc pl-5 space-y-2 text-sm text-[#4A4843]">
            <li>
              <strong>Essential Cookies:</strong> Required for secure user authentication, account access, and core website functionality.
            </li>
            <li>
              <strong>Performance &amp; Analytics Cookies:</strong> Measure visitor traffic, page load metrics, and popular research topics to improve our publishing experience.
            </li>
            <li>
              <strong>Advertising &amp; Targeting Cookies:</strong> Delivered by third-party advertising networks (such as Google AdSense) to serve advertisements tailored to reader interests.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-serif font-semibold text-[#141413]">3. Third-Party Advertising &amp; Google Cookies</h2>
          <p>
            Third-party vendors, including Google, use cookies to serve ads based on a user&rsquo;s prior visits to AMAAN ESTATE or other websites. Google&rsquo;s use of advertising cookies enables it and its partners to serve ads based on your visit to our publication and/or other sites on the Internet.
          </p>
          <p>
            Users may opt out of personalized advertising by visiting{' '}
            <a
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noreferrer"
              className="text-[#1E3A5F] underline font-medium"
            >
              Google Ads Settings
            </a>{' '}
            or through the{' '}
            <a
              href="https://www.aboutads.info/choices/"
              target="_blank"
              rel="noreferrer"
              className="text-[#1E3A5F] underline font-medium"
            >
              Network Advertising Initiative opt-out page
            </a>
            .
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-serif font-semibold text-[#141413]">4. How to Manage or Disable Cookies</h2>
          <p>
            Most web browsers allow you to manage cookie preferences through browser settings. You can choose to block or delete cookies; however, blocking essential cookies may affect authentication or account features on AMAAN ESTATE.
          </p>
        </section>

        <section className="space-y-2 border-t border-[#E5E0D8] pt-6 text-sm text-[#5C5A55]">
          <p>
            For further privacy details, read our full{' '}
            <Link to="/privacy-policy" className="text-[#1E3A5F] underline">
              Privacy Policy
            </Link>{' '}
            or contact our editorial desk via our{' '}
            <Link to="/contact" className="text-[#1E3A5F] underline">
              Contact Page
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
