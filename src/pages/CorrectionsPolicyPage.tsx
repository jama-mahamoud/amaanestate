import React from 'react';
import { Link } from 'react-router-dom';
import { getCanonicalOrigin, useSEO } from '../hooks/useSEO';

export default function CorrectionsPolicyPage() {
  useSEO({
    title: 'Corrections & Fact-Checking Policy | AmaanEstate',
    description:
      'Comprehensive Corrections and Fact-Checking Policy for AmaanEstate covering primary sourcing, real estate statistics verification, property listing corrections, reader error reports, and editorial accountability.',
    url: `${getCanonicalOrigin()}/corrections-policy`,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.amaanestate.com/' },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Corrections & Fact-Checking Policy',
          item: 'https://www.amaanestate.com/corrections-policy',
        },
      ],
    },
  });

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14 space-y-10">
      <header className="space-y-3 border-b border-[#E5E0D8] pb-8">
        <p className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">
          Editorial Standards &amp; Accountability
        </p>
        <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-[#141413]">
          Corrections &amp; Fact-Checking Policy
        </h1>
        <p className="text-sm text-[#5C5A55]">
          Last updated: November 13, 2026 · AmaanEstate (amaanestate.com)
        </p>
      </header>

      <div className="space-y-8 text-[15px] sm:text-base text-[#292825] leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
            1. Commitment to Factual Accuracy
          </h2>
          <p>
            AmaanEstate is committed to rigorous accuracy, precision, and intellectual honesty
            across all published content—including global real estate news, housing market research,
            investment insights, architectural reporting, construction analysis, and marketplace
            information. Because investors, industry professionals, and homebuyers rely on reliable
            data, we treat verification as a core editorial obligation before publication and maintain
            transparent procedures for correcting errors afterward.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
            2. Pre-Publication Fact-Checking Standards
          </h2>
          <p>
            Prior to publication, contributors and editors review factual claims against verifiable
            documentation. Fact-checking encompasses names, corporate titles, dates, geographic
            locations, property specifications, statutory citations, engineering tolerances, currency
            figures, and quoted statements. When an analysis relies on projections, estimates, or
            assumptions, AmaanEstate endeavors to identify them explicitly as estimates or commentary
            rather than settled historical fact.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
            3. Primary and Secondary Sources
          </h2>
          <p>
            AmaanEstate prioritizes authoritative primary sources wherever accessible, including:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-[#3F3D39]">
            <li>
              Official government housing ministries, central bank releases, census bureaus, land
              registries, and municipal planning or building-code filings.
            </li>
            <li>
              Publicly filed corporate financial disclosures, REIT reports, statutory legislation,
              and institutional research publications.
            </li>
            <li>
              Peer-reviewed architectural, structural engineering, and urban-planning studies,
              alongside direct on-the-record interviews with named practitioners and analysts.
            </li>
          </ul>
          <p>
            Secondary reporting from established news organizations or industry associations may be
            referenced when primary filings are unavailable, and is attributed clearly to the
            originating source. Unverified rumors or anonymous assertions lacking corroboration are
            not published as established fact.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
            4. Verification of Market Statistics &amp; Financial Information
          </h2>
          <p>
            Real estate markets frequently involve differing methodologies—such as median versus
            average pricing, nominal versus inflation-adjusted returns, gross versus net yields, and
            local currency versus US dollar conversions. Where financial or housing statistics are
            cited, AmaanEstate aims to specify the reporting period, geographic scope, currency unit,
            and issuing institution so figures can be evaluated in proper context without misleading
            comparisons.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
            5. Significant Factual Corrections
          </h2>
          <p>
            When a material factual error is confirmed—such as an incorrect statistic, misstated
            regulatory provision, misattributed quotation, wrong geographic or corporate name, or a
            flawed calculation that alters a reader&rsquo;s understanding—AmaanEstate updates the
            article promptly with verified facts and appends a formal correction notice explaining
            what was wrong and how it has been corrected.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
            6. Clarifications &amp; Editorial Updates
          </h2>
          <p>
            Not every post-publication edit arises from an error. Where an article is factually
            accurate as written but benefits from clearer context, additional data released after
            publication, or updated regulatory developments, AmaanEstate may issue a{' '}
            <strong className="text-[#141413]">Clarification</strong> or{' '}
            <strong className="text-[#141413]">Editor&rsquo;s Note / Update</strong> explaining the
            new context or subsequent developments while distinguishing them from corrections of past
            inaccuracies.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
            7. Minor Corrections
          </h2>
          <p>
            Typographical errors, punctuation, spelling mistakes, broken hyperlinks, and minor
            formatting adjustments that do not alter factual meaning, numerical accuracy, or
            editorial interpretation are corrected directly without adding a formal correction
            notice.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
            8. Placement &amp; Transparency of Correction Notices
          </h2>
          <p>
            For significant factual corrections, a clear notice is placed prominently within the
            article (typically at the bottom of the piece or at the point of revision) identifying:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-[#3F3D39]">
            <li>The date the correction was issued.</li>
            <li>What the original article inaccurately stated.</li>
            <li>The verified factual information now reflected in the text.</li>
          </ul>
          <p>
            AmaanEstate does not silently rewrite substantive factual errors in order to conceal a
            mistake.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
            9. How Readers Can Report Errors
          </h2>
          <p>
            We welcome factual feedback from readers, economists, architects, engineers, property
            owners, and public institutions. To report a potential inaccuracy, broken source
            citation, or listing discrepancy, please submit a request through the{' '}
            <Link to="/contact" className="text-[#1E3A5F] underline font-medium">
              AmaanEstate Contact Page
            </Link>{' '}
            (selecting <span className="font-medium">&ldquo;Reader Correction&rdquo;</span> as the
            subject where applicable) and include:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-[#3F3D39]">
            <li>The full title and URL of the article or property listing page.</li>
            <li>The specific statement, figure, image caption, or specification in question.</li>
            <li>
              Supporting primary documentation, official filings, or verifiable evidence
              substantiating the requested change.
            </li>
            <li>Your name and contact details in case clarification is needed.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
            10. Editorial Review of Correction Requests
          </h2>
          <p>
            Every correction request is reviewed by editorial staff against primary records and the
            supporting evidence provided. Submission of a complaint does not automatically guarantee
            an edit if existing published figures match authoritative sources or reflect documented
            commentary; however, where a genuine inaccuracy or material omission is confirmed,
            corrective updates are prioritized promptly.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
            11. Real Estate Market Data &amp; Ongoing Research Updates
          </h2>
          <p>
            Housing indices, central bank rate decisions, construction cost benchmarks, and urban
            policy statistics are periodically revised by statistical agencies themselves (for
            example, preliminary quarterly GDP or housing-starts estimates revised in subsequent
            quarters). When an authoritative issuing body revises historical data, AmaanEstate may
            note the revision in updated coverage rather than treating accurate reporting of earlier
            official releases as an editorial error.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
            12. Property Listing Accuracy &amp; Third-Party Information
          </h2>
          <p>
            Marketplace listings published on AmaanEstate rely on details supplied by property
            owners, developers, agents, brokerages, or external feeds. While AmaanEstate is not a
            brokerage and cannot independently inspect or guarantee every listing attribute (see our{' '}
            <Link to="/terms" className="text-[#1E3A5F] underline">
              Terms of Use
            </Link>
            ), we take listing integrity seriously. If a user or rights holder reports outdated
            availability, mispriced terms, incorrect location metadata, or unauthorized listing
            details via our{' '}
            <Link to="/contact" className="text-[#1E3A5F] underline">
              Contact Page
            </Link>
            , our administrative team will review the listing and update, archive, or remove
            inaccurate records as warranted.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
            13. Images, Charts, Captions &amp; Supporting Materials
          </h2>
          <p>
            Photographs, architectural visualizations, charts, and captions must accurately depict
            the building, location, data series, or engineering subject referenced. Misidentified
            locations, inaccurate chart axes, missing unit labels, or erroneous photo credits are
            treated as factual errors and corrected promptly with appropriate attribution or
            replacement visuals.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
            14. Editorial Independence in Corrections
          </h2>
          <p>
            Decisions to issue, decline, or phrase a correction are made strictly on journalistic
            merit and verifiable evidence. Commercial partners, advertisers, political actors, and
            external organizations may submit factual evidence like any reader, but cannot pressure
            AmaanEstate into altering accurate reporting or deleting inconvenient verified facts. For
            more on commercial separation, see our{' '}
            <Link to="/advertising-disclosure" className="text-[#1E3A5F] underline">
              Advertising Disclosure
            </Link>
            .
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
            15. Requests to Remove Published Content
          </h2>
          <p>
            As a matter of journalistic integrity and historical accuracy, AmaanEstate generally does
            not unpublish or delete accurate editorial articles simply because a subject later
            wishes coverage were unavailable, unless removal is warranted due to legal obligations,
            verified copyright infringement, severe privacy harms, or demonstrably irreparable
            factual defects. Where inaccuracies exist in otherwise valid reporting, our standard
            remedy is transparent correction rather than silent deletion. Property listings that are
            no longer active, sold, leased, or submitted without authorization may be archived or
            removed upon verification.
          </p>
        </section>

        <section className="space-y-3 border-t border-[#E5E0D8] pt-6">
          <h2 className="text-xl font-serif font-semibold text-[#141413]">
            16. Contact &amp; Further Editorial Information
          </h2>
          <p>
            To submit a correction notice, flag inaccurate property data, or inquire about our
            verification standards, please reach our editorial desk via the{' '}
            <Link to="/contact" className="text-[#1E3A5F] underline font-medium">
              AmaanEstate Contact Page
            </Link>
            . You can also review our broader publishing principles in our{' '}
            <Link to="/editorial-policy" className="text-[#1E3A5F] underline font-medium">
              Editorial Policy &amp; Standards
            </Link>
            .
          </p>
        </section>
      </div>
    </article>
  );
}
