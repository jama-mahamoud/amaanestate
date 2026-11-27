import React from 'react';
import { Link } from 'react-router-dom';
import { getCanonicalOrigin, useSEO } from '../hooks/useSEO';
import { STATIC_ROUTE_SEO_META } from '../lib/seoUtils';

export default function EditorialPolicyPage() {
  const origin = getCanonicalOrigin();
  const meta = STATIC_ROUTE_SEO_META['/editorial-policy'];

  useSEO({
    title: meta.title,
    description: meta.description,
    url: `${origin}/editorial-policy`,
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: meta.pageName,
        description: meta.description,
        url: `${origin}/editorial-policy`,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Editorial Policy & Standards',
            item: `${origin}/editorial-policy`,
          },
        ],
      },
    ],
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 sm:space-y-8 break-words [overflow-wrap:anywhere]">
      <header className="space-y-3 border-b border-[#E5E0D8] pb-6 sm:pb-8">
        <p className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">Governance</p>
        <h1 className="text-2xl sm:text-4xl font-serif font-semibold text-[#141413]">
          Editorial Policy &amp; Standards
        </h1>
        <p className="text-sm text-[#5C5A55]">Last updated: November 2026</p>
      </header>

      <div className="space-y-6 text-[15px] sm:text-base text-[#292825] leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-xl font-serif font-semibold text-[#141413]">1. Editorial Independence</h2>
          <p>
            AMAAN ESTATE maintains strict separation between editorial reporting and commercial partnerships. Coverage decisions in Investment, Architecture, Construction, Home &amp; Living, and Global News are made solely by our editorial desk based on reader value, analytical rigor, and industry significance.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-serif font-semibold text-[#141413]">2. Verification &amp; Sourcing</h2>
          <p>
            Market statistics, engineering specifications, and regulatory analyses are checked against primary filings, municipal codes, peer-reviewed research, or named institutional sources. Anonymous attribution is used only when verifiable information cannot otherwise be placed on the public record.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-serif font-semibold text-[#141413]">3. Corrections &amp; Updates</h2>
          <p>
            When factual errors are identified, AMAAN ESTATE corrects the article promptly and transparently. Readers may submit correction requests at any time through our{' '}
            <Link to="/contact" className="text-[#1E3A5F] underline">
              Contact page
            </Link>
            .
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-serif font-semibold text-[#141413]">4. Advertising &amp; Sponsored Content</h2>
          <p>
            Display advertisements (including programmatic advertising such as Google AdSense) are clearly labeled &ldquo;Advertisement&rdquo; and visually separated from editorial prose. Any future sponsored briefings are explicitly disclosed.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-serif font-semibold text-[#141413]">5. No Personalized Financial Advice</h2>
          <p>
            Content published on AMAAN ESTATE is provided for informational, research, and educational purposes only and does not constitute personalized investment, legal, architectural, or structural engineering advice.
          </p>
        </section>
      </div>
    </div>
  );
}
