import React from 'react';
import { Link } from 'react-router-dom';
import { getCanonicalOrigin, useSEO } from '../hooks/useSEO';

export default function AdvertisingDisclosurePage() {
  useSEO({
    title: 'Advertising & Commercial Disclosure | AmaanEstate',
    description:
      'AmaanEstate advertising policy, sponsored content guidelines, property marketplace disclosures, and programmatic ad standards.',
    url: `${getCanonicalOrigin()}/advertising-disclosure`,
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <header className="space-y-3 border-b border-[#E5E0D8] pb-8">
        <p className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">Transparency</p>
        <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-[#141413]">
          Advertising &amp; Commercial Disclosure
        </h1>
        <p className="text-sm text-[#5C5A55]">Last updated: November 2026</p>
      </header>

      <div className="space-y-6 text-base text-[#292825] leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-xl font-serif font-semibold text-[#141413]">1. Editorial Integrity &amp; Independence</h2>
          <p>
            AMAAN ESTATE operates as an independent real estate research and editorial publication. Our journalists, analysts, and architectural contributors produce content free from commercial influence. Advertisers and sponsors have no input into our research methodologies, article selection, or editorial evaluations.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-serif font-semibold text-[#141413]">2. Display &amp; Programmatic Advertising</h2>
          <p>
            We display banner advertisements served by trusted programmatic networks, including Google AdSense. Display ads are explicitly identified with labels such as &ldquo;Advertisement&rdquo; or &ldquo;Sponsored&rdquo; and are visually separated from independent editorial prose.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-serif font-semibold text-[#141413]">3. Sponsored Content &amp; Briefings</h2>
          <p>
            When content is produced in partnership with or paid for by an external organization, it is clearly designated at the top of the page with prominent disclaimers (e.g., &ldquo;Sponsored Briefing&rdquo; or &ldquo;Partner Content&rdquo;). We do not accept native advertising that misleads readers into confusing promotional material with independent reporting.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-serif font-semibold text-[#141413]">4. Affiliate Links &amp; Referral Disclosure</h2>
          <p>
            Certain external resource links on AMAAN ESTATE may contain affiliate referral tags. If you make a purchase or register through an affiliate link, AMAAN ESTATE may receive a small commission at no additional cost to you. Affiliate links never influence our technical reviews or market analyses.
          </p>
        </section>

        <section className="space-y-2 border-t border-[#E5E0D8] pt-6 text-sm text-[#5C5A55]">
          <p>
            Questions regarding commercial partnerships or advertising policy may be directed to our editorial desk via our{' '}
            <Link to="/contact" className="text-[#1E3A5F] underline font-medium">
              Contact Page
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
