import React from 'react';
import { getCanonicalOrigin, useSEO } from '../hooks/useSEO';

export default function TermsPage() {
  useSEO({
    title: 'Terms of Use | AmaanEstate',
    description:
      'Terms of Use governing access to AmaanEstate real estate news, housing research, property marketplace listings, and digital services.',
    url: `${getCanonicalOrigin()}/terms`,
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <header className="space-y-3 border-b border-[#E5E0D8] pb-8">
        <p className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">Legal</p>
        <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-[#141413]">Terms of Use</h1>
        <p className="text-sm text-[#5C5A55]">Effective Date: November 2026 · amaanestate.com</p>
      </header>

      <div className="space-y-6 text-base text-[#292825] leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-xl font-serif font-semibold text-[#141413]">1. Acceptance of Terms</h2>
          <p>
            By accessing or reading AMAAN ESTATE (amaanestate.com), you agree to abide by these Terms of Use and all applicable laws and regulations.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-serif font-semibold text-[#141413]">2. Intellectual Property</h2>
          <p>
            All original articles, research analyses, photography, and editorial graphics published on AMAAN ESTATE are protected by copyright. Brief excerpts with clear attribution and a canonical link to the original article are permitted; full reproduction or automated scraping requires prior written permission.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-serif font-semibold text-[#141413]">3. Informational Disclaimer</h2>
          <p>
            Articles covering real estate investment, finance, architecture, and construction engineering represent independent journalism and research. Readers should consult licensed financial, legal, or structural professionals before undertaking capital or construction commitments.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-serif font-semibold text-[#141413]">4. Changes to Terms</h2>
          <p>
            AMAAN ESTATE may revise these Terms of Use periodically. Continued use of the publication following updates constitutes acceptance of the revised terms.
          </p>
        </section>
      </div>
    </div>
  );
}
