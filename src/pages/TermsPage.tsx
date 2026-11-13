import React from 'react';
import { Link } from 'react-router-dom';
import { getCanonicalOrigin, useSEO } from '../hooks/useSEO';

export default function TermsPage() {
  useSEO({
    title: 'Terms of Use | AmaanEstate',
    description:
      'Terms of Use for AmaanEstate (amaanestate.com) covering editorial content, real estate research disclaimers, property marketplace listings, intellectual property, and acceptable use.',
    url: `${getCanonicalOrigin()}/terms`,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.amaanestate.com/' },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Terms of Use',
          item: 'https://www.amaanestate.com/terms',
        },
      ],
    },
  });

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14 space-y-10">
      <header className="space-y-3 border-b border-[#E5E0D8] pb-8">
        <p className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">
          Legal &amp; Platform Rules
        </p>
        <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-[#141413]">
          Terms of Use
        </h1>
        <p className="text-sm text-[#5C5A55]">
          Last updated: November 13, 2026 · AmaanEstate (amaanestate.com)
        </p>
      </header>

      <div className="space-y-8 text-[15px] sm:text-base text-[#292825] leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
            1. Acceptance of Terms
          </h2>
          <p>
            Welcome to AmaanEstate (<span className="font-medium text-[#141413]">www.amaanestate.com</span>),
            a Global Real Estate Media, Research &amp; Marketplace platform providing real estate news,
            housing market research, real estate investment insights, residential and commercial
            property market commentary, architecture and construction coverage, and international
            property discovery.
          </p>
          <p>
            By accessing, browsing, registering an account, submitting an enquiry, or otherwise
            using any part of amaanestate.com, you agree to be bound by these Terms of Use and our
            related policies, including our{' '}
            <Link to="/privacy-policy" className="text-[#1E3A5F] underline">
              Privacy Policy
            </Link>{' '}
            and{' '}
            <Link to="/cookie-policy" className="text-[#1E3A5F] underline">
              Cookie Policy
            </Link>
            . If you do not agree to these Terms, please discontinue use of the website.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
            2. Eligibility &amp; Permitted Use
          </h2>
          <p>
            You may use AmaanEstate only if you have the legal capacity to enter into binding terms
            under the laws applicable to you, and you agree to use the website strictly for lawful
            personal, research, informational, or authorized commercial discovery purposes. You may
            not use the platform in any manner that violates local, national, or international laws
            or regulations.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
            3. Platform Role: Information &amp; Property Discovery Only
          </h2>
          <p>
            AmaanEstate operates strictly as an independent real estate media publication, market
            research platform, and online property discovery directory.{' '}
            <strong className="text-[#141413]">
              AmaanEstate is not a licensed real estate broker, real estate agent, property manager,
              escrow service, payment processor, mortgage lender, fiduciary, financial adviser,
              legal counsel, or structural engineering inspector.
            </strong>
          </p>
          <p>
            AmaanEstate does not represent buyers, sellers, landlords, or tenants in real estate
            transactions, does not negotiate contracts, does not hold client funds or deposits, and
            does not facilitate on-platform property purchases or lease executions. Any transaction,
            viewing, lease agreement, or property acquisition is conducted independently off-platform
            between you and the applicable property owner, developer, licensed agent, or brokerage.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
            4. Editorial Content &amp; Real Estate Research Disclaimers
          </h2>
          <p>
            Articles, housing market reports, investment commentary, architectural case studies, and
            construction analyses published on AmaanEstate are provided strictly for general
            informational, journalistic, and educational purposes. Although our editorial desk
            follows rigorous sourcing practices outlined in our{' '}
            <Link to="/editorial-policy" className="text-[#1E3A5F] underline">
              Editorial Policy
            </Link>{' '}
            and{' '}
            <Link to="/corrections-policy" className="text-[#1E3A5F] underline">
              Corrections &amp; Fact-Checking Policy
            </Link>
            , real estate markets, interest rates, zoning regulations, and construction costs change
            rapidly.
          </p>
          <p>
            Nothing published on AmaanEstate constitutes personalized financial, investment, tax,
            legal, valuation, or engineering advice. Readers should perform independent due
            diligence and consult qualified licensed professionals before making property, capital, or
            development commitments.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
            5. Property Listings, Third-Party Data &amp; Showcase Examples
          </h2>
          <p>
            Property listings displayed in the AmaanEstate Buy and Rent marketplace may include
            entries published directly via administrative tools, listings attributed to third-party
            agents, brokerages, or external feeds, and clearly marked illustrative portfolio showcase
            examples provided solely for platform demonstration.
          </p>
          <ul className="list-disc pl-5 space-y-2.5 text-[#3F3D39]">
            <li>
              <strong className="text-[#141413]">No Guarantee of Accuracy or Availability:</strong>{' '}
              Publication of a property listing on AmaanEstate does not guarantee ownership, legal
              title, zoning compliance, pricing accuracy, square footage, amenity condition, current
              availability, or the legitimacy of any underlying transaction.
            </li>
            <li>
              <strong className="text-[#141413]">Independent Verification Required:</strong> Users
              must independently verify all property specifications, legal title records, rental
              terms, regulatory permits, and representative credentials directly with the listing
              provider and qualified local professionals prior to signing any agreement or
              transferring funds.
            </li>
            <li>
              <strong className="text-[#141413]">Illustrative Showcase Listings:</strong> Showcase
              portfolio items are labeled on the platform as illustrative examples for presentation
              purposes and are not active market inventory available for enquiry or transaction.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
            6. Property Enquiries &amp; Communications with Third Parties
          </h2>
          <p>
            When you submit a property enquiry on an active listing, AmaanEstate records your message
            so it may be reviewed and, where applicable, routed or relayed to the property owner,
            representative, agent, or brokerage associated with that listing. AmaanEstate does not
            guarantee response times, listing availability, or the conduct, licensing, or
            representations of any third-party representative or listing provider. You are solely
            responsible for exercising prudent judgment and anti-fraud precautions when communicating
            with third parties.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
            7. User Accounts &amp; Account Responsibilities
          </h2>
          <p>
            If you create an account on AmaanEstate, you are responsible for providing accurate
            registration details, safeguarding your password, and all activity occurring under your
            credentials. Account privileges are personal and may not be shared or transferred without
            authorization. Please notify us promptly via our{' '}
            <Link to="/contact" className="text-[#1E3A5F] underline">
              Contact Page
            </Link>{' '}
            if you suspect unauthorized access to your account.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
            8. Intellectual Property &amp; Copyright
          </h2>
          <p>
            All original articles, research analyses, editorial prose, site branding, logos, layout
            design, and original media created or licensed by AmaanEstate are protected by copyright,
            trademark, and related intellectual property laws. Property photographs and third-party
            listing details remain the property of their respective owners, photographers, or
            licensors.
          </p>
          <p>
            You may read, share links to, and quote brief attributed excerpts of AmaanEstate
            articles with a clear canonical link back to the original page. Reproducing full
            articles, republishing research datasets commercially, mirroring listings, or using
            AmaanEstate trademarks without prior written authorization is prohibited.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
            9. User-Submitted Information &amp; Inquiries
          </h2>
          <p>
            When you submit contact messages, editorial tips, correction evidence, or property
            enquiries, you represent that the information you provide is accurate, lawful, and does
            not infringe the rights of any third party. You grant AmaanEstate a non-exclusive right
            to review, store, process, and act upon such submissions for editorial evaluation,
            correction verification, inquiry response, or platform administration.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
            10. Prohibited Activities &amp; Misuse
          </h2>
          <p>You agree not to engage in any of the following while using amaanestate.com:</p>
          <ul className="list-disc pl-5 space-y-2 text-[#3F3D39]">
            <li>
              Automated scraping, crawling beyond standard search engine indexing, harvesting email
              or listing data, or bypassing API rate limits.
            </li>
            <li>
              Submitting false, misleading, defamatory, fraudulent, or spam enquiries through
              contact or property enquiry forms.
            </li>
            <li>
              Attempting unauthorized access to administrative panels, databases, user accounts, or
              server infrastructure.
            </li>
            <li>
              Interfering with website performance, injecting malicious code, or misrepresenting your
              affiliation with AmaanEstate.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
            11. External Links &amp; Third-Party Services
          </h2>
          <p>
            The platform includes links to third-party websites, institutional sources, listing
            origins, and external services, as well as third-party tag and advertising services.
            AmaanEstate does not control or endorse the content, availability, or practices of
            external websites and assumes no responsibility for your interactions with them.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
            12. Service Availability, Warranties &amp; Limitation of Liability
          </h2>
          <p>
            AmaanEstate provides the website and its content on an &ldquo;as is&rdquo; and &ldquo;as
            available&rdquo; basis. We may modify, suspend, update, or remove features, articles, or
            property listings at any time without prior notice.
          </p>
          <p>
            To the fullest extent permitted by applicable law, AmaanEstate and its contributors,
            editors, and operators disclaim all implied warranties (including merchantability, fitness
            for a particular purpose, accuracy, or non-infringement) and shall not be liable for any
            indirect, incidental, consequential, special, or financial damages arising from your use
            of—or inability to use—the website, reliance on editorial or market data, or any
            off-platform property enquiry or transaction. Certain jurisdictions do not allow the
            exclusion of specific warranties or liabilities, so parts of this limitation may not
            apply to you to the extent prohibited by mandatory local law.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
            13. Indemnification &amp; Access Termination
          </h2>
          <p>
            Where permitted by applicable law, you agree to indemnify and hold harmless AmaanEstate
            and its operators from claims, losses, or expenses arising out of your unlawful use of
            the platform, breach of these Terms of Use, or violation of any third-party rights.
          </p>
          <p>
            We reserve the right to restrict, suspend, or terminate access to accounts or platform
            features if we reasonably believe a user has violated these Terms or engaged in abusive
            or fraudulent activity.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
            14. Governing Law &amp; Changes to Terms
          </h2>
          <p>
            These Terms of Use shall be governed by and interpreted in accordance with the
            applicable laws of the jurisdiction in which the website operator maintains its primary
            legal establishment, without prejudice to any mandatory consumer protection provisions
            that apply in your place of residence. Any disputes should first be raised with
            AmaanEstate for good-faith resolution via our{' '}
            <Link to="/contact" className="text-[#1E3A5F] underline">
              Contact Page
            </Link>
            .
          </p>
          <p>
            We may update these Terms of Use periodically and will update the &ldquo;Last
            updated&rdquo; date above when changes take effect. Continued use of amaanestate.com
            constitutes acceptance of the updated Terms.
          </p>
        </section>

        <section className="space-y-3 border-t border-[#E5E0D8] pt-6">
          <h2 className="text-xl font-serif font-semibold text-[#141413]">
            15. Contact Information &amp; Legal Review Note
          </h2>
          <p>
            Questions regarding these Terms of Use, copyright permissions, or listing concerns can
            be submitted via the{' '}
            <Link to="/contact" className="text-[#1E3A5F] underline font-medium">
              AmaanEstate Contact Page
            </Link>
            .
          </p>
          <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded p-4 text-sm text-[#4A4843]">
            <strong className="text-[#141413]">Notice Regarding Legal Review:</strong> Specific
            corporate entity details, registered business address, designated governing-law
            jurisdiction, and arbitration or court venue clauses should be confirmed and inserted by
            the website owner in consultation with qualified legal counsel.
          </div>
        </section>
      </div>
    </article>
  );
}
