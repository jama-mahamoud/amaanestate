import React from 'react';
import { Link } from 'react-router-dom';
import { getCanonicalOrigin, useSEO } from '../hooks/useSEO';

export default function AdvertisingDisclosurePage() {
  useSEO({
    title: 'Advertising Disclosure | AmaanEstate',
    description:
      'Advertising and Commercial Disclosure for AmaanEstate (amaanestate.com), explaining editorial independence, display advertising, sponsored content labeling, featured property listings, and commercial separation.',
    url: `${getCanonicalOrigin()}/advertising-disclosure`,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.amaanestate.com/' },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Advertising Disclosure',
          item: 'https://www.amaanestate.com/advertising-disclosure',
        },
      ],
    },
  });

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14 space-y-10">
      <header className="space-y-3 border-b border-[#E5E0D8] pb-8">
        <p className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">
          Commercial Transparency
        </p>
        <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-[#141413]">
          Advertising &amp; Commercial Disclosure
        </h1>
        <p className="text-sm text-[#5C5A55]">
          Last updated: November 13, 2026 · AmaanEstate (amaanestate.com)
        </p>
      </header>

      <div className="space-y-8 text-[15px] sm:text-base text-[#292825] leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
            1. Commitment to Editorial Independence
          </h2>
          <p>
            AmaanEstate operates as a Global Real Estate Media, Research &amp; Marketplace platform
            serving investors, property professionals, architects, builders, homeowners, and
            researchers worldwide. Reader trust depends on clear boundaries between independent
            journalism and commercial placements.
          </p>
          <p>
            Editorial decisions regarding news coverage, housing market research, investment
            insights, architectural reporting, and urban development commentary are made
            independently by our editorial desk. Advertisers, commercial sponsors, developers, and
            property listing providers do not control, edit, or dictate our editorial conclusions.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
            2. Clear Distinction Between Content &amp; Commercial Categories
          </h2>
          <p>
            To avoid ambiguity, AmaanEstate separates editorial journalism from commercial or
            promotional material across five distinct categories:
          </p>

          <div className="space-y-5 pt-1">
            <div className="space-y-1.5">
              <h3 className="text-base font-sans font-semibold text-[#141413]">
                1. Independent Editorial Content
              </h3>
              <p className="text-[#3F3D39]">
                Articles, market analyses, and briefings published across Investment, Architecture,
                Construction, Home &amp; Living, and Global News represent independent reporting and
                research governed by our{' '}
                <Link to="/editorial-policy" className="text-[#1E3A5F] underline">
                  Editorial Policy
                </Link>{' '}
                and{' '}
                <Link to="/corrections-policy" className="text-[#1E3A5F] underline">
                  Corrections &amp; Fact-Checking Policy
                </Link>
                . No external company pays to influence or secure positive coverage in independent
                editorial articles.
              </p>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-sans font-semibold text-[#141413]">
                2. Sponsored Content &amp; Paid Partnerships
              </h3>
              <p className="text-[#3F3D39]">
                If AmaanEstate publishes articles, market briefings, or partnership features produced
                in collaboration with or funded by a commercial sponsor—such as a real estate
                developer, brokerage, building-materials company, or financial institution—any such
                item is required under our policy to be explicitly labeled at the top of the page
                (for example, &ldquo;Sponsored Briefing&rdquo; or &ldquo;Partner Content&rdquo;) so
                readers can distinguish it immediately from independent journalism.
              </p>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-sans font-semibold text-[#141413]">
                3. Display &amp; Programmatic Advertising Placements
              </h3>
              <p className="text-[#3F3D39]">
                AmaanEstate includes dedicated display advertising placements integrated with Google
                AdSense. Every advertising container renders inside an explicit{' '}
                <span className="font-medium text-[#141413]">&ldquo;Advertisement&rdquo;</span>{' '}
                label and is visually separated in an independent bordered block from article prose.
                Programmatic display advertisements are served automatically by the ad network and
                do not represent an endorsement by AmaanEstate of any advertised product, project,
                or service.
              </p>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-sans font-semibold text-[#141413]">
                4. Featured &amp; Promoted Property Listings
              </h3>
              <p className="text-[#3F3D39]">
                The AmaanEstate marketplace supports &ldquo;Featured&rdquo; property designations
                that highlight selected listings in designated marketplace sections (such as the
                Featured International Properties showcase or top search sorting). Featured or
                promoted placement—whether curated by platform administrators or arranged
                commercially with real estate companies, developers, or agents—indicates heightened
                visibility only. It is not an appraisal, investment recommendation, or guarantee of
                title, condition, or price fairness. Illustrative showcase properties are separately
                and explicitly labeled as non-active demonstration examples.
              </p>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-sans font-semibold text-[#141413]">
                5. Affiliate &amp; Referral Links
              </h3>
              <p className="text-[#3F3D39]">
                AmaanEstate does <strong className="text-[#141413]">not</strong> currently operate
                an affiliate marketing program or embed affiliate commission tags across editorial
                articles or marketplace references. Should AmaanEstate introduce affiliate or paid
                referral relationships in the future, any qualifying links or pages will display a
                clear, prominent disclosure prior to the link explaining the referral arrangement.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
            3. Separation Between Editorial &amp; Commercial Interests
          </h2>
          <p>
            Commercial inquiries—including programmatic display sponsorships, developer spotlights,
            or marketplace partnership discussions—are handled separately from editorial reporting.
            Entering into an advertising or partnership discussion with AmaanEstate does not grant
            any advertiser pre-publication approval rights over independent articles, alter research
            methodologies, or exempt any claim from factual verification.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
            4. Third-Party Advertising &amp; External Websites
          </h2>
          <p>
            Clicking on a display advertisement or external partner link takes you outside
            amaanestate.com to third-party websites governed by their own terms, privacy policies,
            and commercial offers. AmaanEstate does not guarantee claims made by third-party
            advertisers and encourages visitors to conduct independent due diligence before engaging
            with any external vendor or real estate service provider. For details on how third-party
            ad cookies operate, please review our{' '}
            <Link to="/cookie-policy" className="text-[#1E3A5F] underline">
              Cookie Policy
            </Link>
            .
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
            5. How Readers Can Identify Promotional Material
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-[#3F3D39]">
            <li>
              Display ad units appear in separated containers marked{' '}
              <strong className="text-[#141413]">&ldquo;Advertisement&rdquo;</strong>.
            </li>
            <li>
              Any paid partner or sponsored editorial briefing will carry an explicit top-of-page
              disclosure such as <strong className="text-[#141413]">&ldquo;Sponsored Briefing&rdquo;</strong>{' '}
              or <strong className="text-[#141413]">&ldquo;Partner Content&rdquo;</strong>.
            </li>
            <li>
              Illustrative architectural listings carry explicit portfolio notices clarifying they
              are demonstration examples rather than active inventory.
            </li>
          </ul>
        </section>

        <section className="space-y-3 border-t border-[#E5E0D8] pt-6">
          <h2 className="text-xl font-serif font-semibold text-[#141413]">6. Contact Information</h2>
          <p>
            For questions regarding commercial partnerships, advertising labeling, or concerns about
            potential conflicts of interest, please reach our team through the{' '}
            <Link to="/contact" className="text-[#1E3A5F] underline font-medium">
              AmaanEstate Contact Page
            </Link>
            .
          </p>
        </section>
      </div>
    </article>
  );
}
