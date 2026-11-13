import React from 'react';
import { Link } from 'react-router-dom';
import { getCanonicalOrigin, useSEO } from '../hooks/useSEO';

export default function PrivacyPolicyPage() {
  useSEO({
    title: 'Privacy Policy | AmaanEstate',
    description:
      'Privacy Policy for AmaanEstate (amaanestate.com) explaining what personal and technical data is collected, how it is used and stored, and how users can manage privacy preferences.',
    url: `${getCanonicalOrigin()}/privacy-policy`,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.amaanestate.com/' },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Privacy Policy',
          item: 'https://www.amaanestate.com/privacy-policy',
        },
      ],
    },
  });

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14 space-y-10">
      <header className="space-y-3 border-b border-[#E5E0D8] pb-8">
        <p className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">
          Legal &amp; Data Governance
        </p>
        <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-[#141413]">
          Privacy Policy
        </h1>
        <p className="text-sm text-[#5C5A55]">
          Last updated: November 13, 2026 · AmaanEstate (amaanestate.com)
        </p>
      </header>

      <div className="space-y-8 text-[15px] sm:text-base text-[#292825] leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
            1. Introduction &amp; Scope
          </h2>
          <p>
            AmaanEstate (&ldquo;AmaanEstate,&rdquo; &ldquo;we,&rdquo; &ldquo;our,&rdquo; or
            &ldquo;us&rdquo;) operates the website{' '}
            <span className="font-medium text-[#141413]">www.amaanestate.com</span> as a Global Real
            Estate Media, Research &amp; Marketplace platform covering global real estate news,
            housing market research, real estate investment insights, residential and commercial
            markets, architecture, construction, urban development, and international property
            discovery.
          </p>
          <p>
            This Privacy Policy describes the types of information collected when you browse
            amaanestate.com or use its features, how that information is used and stored, when it
            may be disclosed to service providers or third parties, and the options available to you.
            Please review this document alongside our{' '}
            <Link to="/terms" className="text-[#1E3A5F] underline">
              Terms of Use
            </Link>{' '}
            and{' '}
            <Link to="/cookie-policy" className="text-[#1E3A5F] underline">
              Cookie Policy
            </Link>
            .
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
            2. Information You Voluntarily Provide
          </h2>
          <p>
            You can read articles, search market intelligence, and browse public property listings
            on AmaanEstate without registering an account. When you choose to interact with specific
            features, we collect only the information submitted through those forms:
          </p>
          <ul className="list-disc pl-5 space-y-2.5 text-[#3F3D39]">
            <li>
              <strong className="text-[#141413]">Account Registration &amp; Profile Details:</strong>{' '}
              If you create a reader or staff account via our registration page, we collect your full
              name, email address, and password (processed through our authentication provider),
              along with optional profile details you choose to add on your{' '}
              <Link to="/account" className="text-[#1E3A5F] underline">
                Account page
              </Link>
              , such as a short biography or real estate areas of interest.
            </li>
            <li>
              <strong className="text-[#141413]">Newsletter Subscriptions:</strong> When you subscribe
              via the site footer, editorial briefing forms, or the{' '}
              <Link to="/newsletter" className="text-[#1E3A5F] underline">
                Newsletter Management page
              </Link>
              , we collect your email address, your subscription status (subscribed or
              unsubscribed), and the page source from which you subscribed.
            </li>
            <li>
              <strong className="text-[#141413]">Contact Form Submissions:</strong> When you send an
              editorial pitch, research question, correction report, partnership request, or
              privacy inquiry via our{' '}
              <Link to="/contact" className="text-[#1E3A5F] underline">
                Contact Page
              </Link>
              , we collect your name, email address, selected subject, and message content.
            </li>
            <li>
              <strong className="text-[#141413]">Property Marketplace Enquiries:</strong> When you
              submit an enquiry on an active property listing page, we collect the property
              reference, your full name, email address, optional telephone number, and enquiry
              message. Enquiry forms are disabled on illustrative showcase sample listings.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
            3. Technical &amp; Usage Information Collected Automatically
          </h2>
          <p>
            When you visit amaanestate.com, certain technical data is processed automatically by web
            servers, content delivery infrastructure, and integrated third-party scripts:
          </p>
          <ul className="list-disc pl-5 space-y-2.5 text-[#3F3D39]">
            <li>
              <strong className="text-[#141413]">Server &amp; Network Request Metadata:</strong>{' '}
              Standard HTTP request information—including IP address, browser type, device or
              operating system metadata, referring URL, requested path, and timestamps—may be logged
              transiently by hosting infrastructure and API endpoints. For example, our property
              enquiry API temporarily inspects client IP addresses in server memory to prevent
              automated spam and duplicate submissions within short time windows.
            </li>
            <li>
              <strong className="text-[#141413]">Aggregated Article View Metrics:</strong> When an
              article is opened, AmaanEstate increments an aggregate view counter on that article.
              This counter records total article readership and does not store personal reading
              histories tied to individual visitor identities in our database.
            </li>
            <li>
              <strong className="text-[#141413]">Cookies, Browser Storage &amp; Tagging:</strong>{' '}
              Browser storage (
              <code className="font-mono text-xs bg-[#FAF8F5] px-1 py-0.5 rounded border border-[#E5E0D8]">
                localStorage
              </code>
              ) is used for essential session persistence when signed
              in and for site preferences where applicable. Our website header also includes Google
              Tag Manager and Google AdSense integration scripts, which are explained in detail in
              our{' '}
              <Link to="/cookie-policy" className="text-[#1E3A5F] underline">
                Cookie Policy
              </Link>
              .
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
            4. How We Use Information
          </h2>
          <p>AmaanEstate uses collected information strictly for operating and improving the platform:</p>
          <ul className="list-disc pl-5 space-y-2 text-[#3F3D39]">
            <li>To deliver requested editorial briefings and manage newsletter opt-in/opt-out status.</li>
            <li>
              To authenticate registered users, maintain account sessions, and authorize editorial or
              administrative workflows.
            </li>
            <li>
              To receive, log, and respond to reader inquiries, correction requests, press
              communications, and property marketplace enquiries.
            </li>
            <li>
              To protect forms and API endpoints against abuse, spam, or excessive automated
              requests.
            </li>
            <li>
              To evaluate overall readership trends across categories, search queries, and published
              research topics.
            </li>
            <li>
              To support display advertising when enabled via programmatic advertising integrations.
            </li>
          </ul>
          <p>AmaanEstate does not sell personal email lists or subscriber databases to third-party data brokers.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
            5. How Information May Be Shared
          </h2>
          <p>
            Information submitted to AmaanEstate is accessed and processed only where necessary for
            platform operations:
          </p>
          <ul className="list-disc pl-5 space-y-2.5 text-[#3F3D39]">
            <li>
              <strong className="text-[#141413]">Authorized Platform Personnel:</strong> Contact
              submissions, newsletter records, and property marketplace enquiries are accessible only
              to authorized editors and administrators inside the AmaanEstate workspace for review
              and response.
            </li>
            <li>
              <strong className="text-[#141413]">Infrastructure &amp; Service Providers:</strong>{' '}
              Platform data is hosted and processed using cloud application hosting and Supabase
              (PostgreSQL database, authentication, and media storage) infrastructure, subject to
              those providers&rsquo; operational terms.
            </li>
            <li>
              <strong className="text-[#141413]">Property Enquiry Coordination:</strong> When you
              submit an enquiry about a specific property listing, your contact details and message
              may be reviewed internally or relayed to the relevant property owner, representative,
              agent, or brokerage identified on that listing so your request can be addressed.
            </li>
            <li>
              <strong className="text-[#141413]">Advertising &amp; Measurement Services:</strong>{' '}
              Third-party tag management and advertising scripts (such as Google Tag Manager and
              Google AdSense) operate directly between your browser and those third-party providers
              in accordance with their respective privacy terms.
            </li>
            <li>
              <strong className="text-[#141413]">Legal Obligations:</strong> We may disclose
              information if required to do so by applicable law, valid legal process, or to protect
              the security and integrity of the website and its users.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
            6. Data Storage, Security &amp; Retention
          </h2>
          <p>
            User profiles, newsletter subscriptions, contact messages, and property enquiries are
            stored in PostgreSQL database infrastructure managed through Supabase, where Row Level
            Security (RLS) policies restrict administrative and personal submission tables to
            authenticated authorized staff roles and permitted user-owned actions. Account
            authentication is managed through Supabase Authentication.
          </p>
          <p>
            While we apply role-based access controls and standard web transport security (HTTPS in
            production), no internet transmission or electronic storage system can be guaranteed to
            be completely immune from unauthorized access or technical failure.
          </p>
          <p>
            We retain submitted contact messages, property enquiries, and newsletter subscription
            records for as long as needed to handle inquiries, maintain unsubscribe suppression lists,
            support editorial administration, or comply with applicable legal obligations, unless a
            verified deletion request is processed.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
            7. Newsletter Subscriptions &amp; Account Preferences
          </h2>
          <p>
            You may subscribe or unsubscribe from AmaanEstate editorial newsletters at any time using
            the{' '}
            <Link to="/newsletter" className="text-[#1E3A5F] underline">
              Newsletter Management page
            </Link>
            . Unsubscribing updates your subscription status in our database so your address is
            excluded from future editorial mailings.
          </p>
          <p>
            Registered users signed into an account can update their display name, biography, and
            password directly from the{' '}
            <Link to="/account" className="text-[#1E3A5F] underline">
              My Account page
            </Link>
            .
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
            8. User Rights &amp; Privacy Requests
          </h2>
          <p>
            Depending on your country or region of residence, you may have legal rights regarding
            personal information held about you—such as requesting access to your submitted data,
            requesting correction of inaccurate information, opting out of newsletter communications,
            or requesting deletion of contact inquiries, property enquiries, or account records.
          </p>
          <p>
            Because automated self-service account deletion is not currently available within user
            account settings, all requests for data access, correction, export, or deletion must be
            submitted through our{' '}
            <Link to="/contact" className="text-[#1E3A5F] underline">
              Contact Page
            </Link>
            . We may ask you to confirm control of the email address associated with the record
            before fulfilling a privacy request.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
            9. Third-Party Websites &amp; External Links
          </h2>
          <p>
            AmaanEstate articles, research references, and property listings frequently include links
            to external websites—such as institutional research bodies, municipal planning registries,
            property brokerages, listing sources, and social media channels. Once you leave
            amaanestate.com, those external websites operate under their own privacy policies and
            practices, for which AmaanEstate is not responsible.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
            10. International Visitors &amp; Cross-Border Data Considerations
          </h2>
          <p>
            AmaanEstate serves an international audience across multiple regions. Cloud hosting,
            database, analytics, and advertising infrastructure used to operate the website may
            process or store data in jurisdictions outside your own country of residence, where data
            protection laws may differ from local rules. By using amaanestate.com and submitting
            information through our forms, you acknowledge that your information may be transferred
            to and processed on servers supporting our global platform.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
            11. Children&rsquo;s Privacy
          </h2>
          <p>
            AmaanEstate is intended for general adult, professional, and investor audiences and is
            not directed at children under the age of 16 (or the applicable age of digital consent
            in your jurisdiction). We do not knowingly collect personal information from children. If
            you believe a child has submitted personal data through our forms, please notify us via
            our{' '}
            <Link to="/contact" className="text-[#1E3A5F] underline">
              Contact Page
            </Link>{' '}
            so we can review and remove the record.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
            12. Changes to This Privacy Policy
          </h2>
          <p>
            We may revise this Privacy Policy periodically to reflect updates to our website features,
            third-party integrations, or legal practices. Whenever changes are made, we update the
            &ldquo;Last updated&rdquo; date at the top of this page. Continued use of amaanestate.com
            after an update indicates acknowledgment of the revised policy.
          </p>
        </section>

        <section className="space-y-3 border-t border-[#E5E0D8] pt-6">
          <h2 className="text-xl font-serif font-semibold text-[#141413]">
            13. Contact Information &amp; Governance Note
          </h2>
          <p>
            If you have questions about this Privacy Policy, wish to exercise a privacy request, or
            need assistance regarding submitted data, please reach our team through the{' '}
            <Link to="/contact" className="text-[#1E3A5F] underline font-medium">
              AmaanEstate Contact Page
            </Link>
            .
          </p>
          <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded p-4 text-sm text-[#4A4843]">
            <strong className="text-[#141413]">Notice Regarding Jurisdiction &amp; Legal Review:</strong>{' '}
            This Privacy Policy reflects AmaanEstate&rsquo;s current technical implementation and is
            intended for transparent reader disclosure; it does not constitute a certification of
            compliance with every national or regional statute. Specific statutory notices—such as
            the formal operating legal entity name, registered office address, designated Data
            Protection Officer contact (if required), and regional lawful-basis schedules—should be
            confirmed by the website owner with qualified legal counsel prior to formal regulatory
            filings.
          </div>
        </section>
      </div>
    </article>
  );
}
