import React from 'react';
import { Link } from 'react-router-dom';
import { getCanonicalOrigin, useSEO } from '../hooks/useSEO';

export default function CorrectionsPolicyPage() {
  useSEO({
    title: 'Corrections & Fact-Checking Policy | AmaanEstate',
    description:
      'AmaanEstate fact-checking methodology, real estate research standards, error report workflow, and corrections policy.',
    url: `${getCanonicalOrigin()}/corrections-policy`,
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <header className="space-y-3 border-b border-[#E5E0D8] pb-8">
        <p className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">Editorial Standards</p>
        <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-[#141413]">
          Corrections &amp; Fact-Checking Policy
        </h1>
        <p className="text-sm text-[#5C5A55]">Last updated: November 2026</p>
      </header>

      <div className="space-y-6 text-base text-[#292825] leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-xl font-serif font-semibold text-[#141413]">1. Commitment to Accuracy</h2>
          <p>
            AMAAN ESTATE strives for rigorous factual accuracy across all published articles, research reports, market analyses, and technical briefings. When factual errors occur, we correct them promptly, transparently, and unhesitatingly.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-serif font-semibold text-[#141413]">2. How Corrections Are Handled</h2>
          <p>
            When a significant factual error is verified:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm text-[#4A4843]">
            <li>The text in the article is updated directly with verified facts.</li>
            <li>
              A clear correction notice is added to the bottom of the article specifying what was updated, the original inaccuracy, and the date of correction.
            </li>
            <li>Minor grammatical, spelling, or formatting edits that do not alter factual meaning are corrected quietly without a formal note.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-serif font-semibold text-[#141413]">3. How Readers Can Report Errors</h2>
          <p>
            We welcome error reports from readers, research institutions, and industry professionals. If you identify a factual error, statistical inaccuracy, or broken source link, please submit a correction report via our{' '}
            <Link to="/contact" className="text-[#1E3A5F] underline font-medium">
              Contact Page
            </Link>
            . Please include:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-[#4A4843]">
            <li>Article title and URL.</li>
            <li>Specific sentence or data point in question.</li>
            <li>Verifiable primary source or documentation substantiating the correction.</li>
          </ul>
        </section>

        <section className="space-y-2 border-t border-[#E5E0D8] pt-6 text-sm text-[#5C5A55]">
          <p>
            Learn more about our standards in our full{' '}
            <Link to="/editorial-policy" className="text-[#1E3A5F] underline">
              Editorial Policy
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
