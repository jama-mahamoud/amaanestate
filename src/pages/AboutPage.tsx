import React from 'react';
import { Link } from 'react-router-dom';
import { getCanonicalOrigin, useSEO } from '../hooks/useSEO';
import { resolveEditorialImage } from '../lib/editorialImages';
import NewsletterBox from '../components/editorial/NewsletterBox';

export default function AboutPage() {
  useSEO({
    title: 'About AmaanEstate | Global Real Estate Media, Research & Marketplace',
    description:
      'AmaanEstate is a global real estate platform providing property market news, housing research, real estate investment insights, market analysis, and property discovery.',
    url: `${getCanonicalOrigin()}/about`,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.amaanestate.com/' },
        { '@type': 'ListItem', position: 2, name: 'About', item: 'https://www.amaanestate.com/about' },
      ],
    },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
      <header className="space-y-4 border-b border-[#E5E0D8] pb-10">
        <p className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">
          About AmaanEstate
        </p>
        <h1 className="text-3xl sm:text-5xl font-serif font-semibold text-[#141413] max-w-3xl leading-tight">
          Global Real Estate Media, Research &amp; Property Marketplace
        </h1>
        <p className="text-base sm:text-lg text-[#4A4843] leading-relaxed max-w-2xl">
          AmaanEstate (amaanestate.com) is a global real estate platform providing property market news, housing research, real estate investment insights, market analysis, industry developments, and international property discovery.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-7 space-y-6 text-base text-[#292825] leading-relaxed">
          <h2 className="text-2xl font-serif font-semibold text-[#141413]">Our Editorial &amp; Marketplace Mission</h2>
          <p>
            The global property industry spans trillions of dollars in infrastructure, residential housing, commercial architecture, and building technology—yet public discourse is often fragmented between brokerage marketing and short-lived headlines.
          </p>
          <p>
            AmaanEstate bridges that gap by uniting financial rigor, housing market research, architectural criticism, construction reporting, and global property discovery under a single English-first international platform.
          </p>

          <h2 className="text-2xl font-serif font-semibold text-[#141413] pt-4">Who Reads AMAAN ESTATE</h2>
          <ul className="list-disc pl-5 space-y-2 text-[#4A4843]">
            <li>Institutional and private real estate investors evaluating market fundamentals.</li>
            <li>Architects, urban designers, and spatial planners exploring climate-responsive craft.</li>
            <li>Structural engineers, contractors, and material scientists advancing low-carbon construction.</li>
            <li>Homeowners seeking durable architectural renovations and smart energy systems.</li>
            <li>Policy researchers and industry analysts tracking global zoning and regulatory shifts.</li>
          </ul>
        </div>

        <aside className="lg:col-span-5 space-y-6">
          <div className="aspect-[4/3] overflow-hidden rounded bg-[#EBE6DF]">
            <img
              src={resolveEditorialImage('architecture-pavilion')}
              alt="Minimalist contemporary architectural residence"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="bg-white border border-[#E5E0D8] rounded p-6 space-y-3">
            <h3 className="text-lg font-serif font-semibold text-[#141413]">Editorial Governance</h3>
            <p className="text-sm text-[#5C5A55] leading-relaxed">
              Every research briefing and feature adheres to our published standards for source verification, conflict-of-interest disclosure, and factual corrections.
            </p>
            <div className="flex flex-wrap gap-4 pt-1 text-xs font-semibold text-[#1E3A5F]">
              <Link to="/editorial-policy" className="hover:underline">Editorial Policy &rarr;</Link>
              <Link to="/contact" className="hover:underline">Contact Editorial Desk &rarr;</Link>
            </div>
          </div>
        </aside>
      </div>

      <NewsletterBox source="about" />
    </div>
  );
}
