import React from 'react';
import { Link } from 'react-router-dom';
import { getCanonicalOrigin, useSEO } from '../hooks/useSEO';

export default function CookiePolicyPage() {
  useSEO({
    title: 'Cookie Policy | AmaanEstate',
    description:
      'Cookie Policy for AmaanEstate (amaanestate.com) detailing essential authentication storage, Google Tag Manager, Google AdSense advertising cookies, and browser controls.',
    url: `${getCanonicalOrigin()}/cookie-policy`,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.amaanestate.com/' },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Cookie Policy',
          item: 'https://www.amaanestate.com/cookie-policy',
        },
      ],
    },
  });

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14 space-y-10">
      <header className="space-y-3 border-b border-[#E5E0D8] pb-8">
        <p className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">
          Privacy &amp; Transparency
        </p>
        <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-[#141413]">
          Cookie Policy &amp; Tracking Technologies
        </h1>
        <p className="text-sm text-[#5C5A55]">
          Last updated: November 13, 2026 · AmaanEstate (amaanestate.com)
        </p>
      </header>

      <div className="space-y-8 text-[15px] sm:text-base text-[#292825] leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
            1. What Cookies &amp; Browser Storage Are
          </h2>
          <p>
            Cookies are small text files placed on your computer, tablet, or mobile device by
            websites or third-party scripts when you browse online. Alongside HTTP cookies, modern
            web applications also use browser storage mechanisms such as{' '}
            <code className="font-mono text-sm bg-[#FAF8F5] px-1.5 py-0.5 rounded border border-[#E5E0D8]">
              localStorage
            </code>{' '}
            to keep you signed in, remember interface state, and maintain session security.
          </p>
          <p>
            This Cookie Policy explains accurately how cookies and similar browser technologies are
            currently used on AmaanEstate (<span className="font-medium text-[#141413]">amaanestate.com</span>)
            and how you can manage or restrict them.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
            2. Technologies Currently Used on AmaanEstate
          </h2>
          <p>
            Based on our current technical implementation, AmaanEstate uses or integrates the
            following categories of storage and cookies:
          </p>

          <div className="space-y-5 pt-1">
            <div className="space-y-1.5">
              <h3 className="text-base font-sans font-semibold text-[#141413]">
                A. Essential Authentication &amp; Core Functionality Storage
              </h3>
              <p className="text-[#3F3D39]">
                When you sign in to a reader, editor, or administrator account, our authentication
                provider (Supabase Auth) stores session tokens and refresh credentials in browser
                storage (<code className="font-mono text-xs bg-[#FAF8F5] px-1 py-0.5 rounded">localStorage</code>)
                so that you remain signed in across page navigation and can access protected pages
                such as your{' '}
                <Link to="/account" className="text-[#1E3A5F] underline">
                  My Account page
                </Link>
                . AmaanEstate&rsquo;s own client application primarily relies on browser storage
                rather than setting custom first-party tracking cookies.
              </p>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-sans font-semibold text-[#141413]">
                B. Preference &amp; Local Application State
              </h3>
              <p className="text-[#3F3D39]">
                In certain fallback or preview environments where a live database connection is not
                active, local browser storage may hold temporary editorial, navigation, or social
                link preferences inside your browser so site components render properly. Search
                filters on our{' '}
                <Link to="/buy" className="text-[#1E3A5F] underline">
                  Buy
                </Link>{' '}
                and{' '}
                <Link to="/rent" className="text-[#1E3A5F] underline">
                  Rent
                </Link>{' '}
                pages are stored in URL query parameters rather than tracking cookies.
              </p>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-sans font-semibold text-[#141413]">
                C. Analytics, Tag Management &amp; Measurement (Google Tag Manager)
              </h3>
              <p className="text-[#3F3D39]">
                AmaanEstate loads Google Tag Manager (<span className="font-mono text-xs">GTM-TGGX2LR5</span>)
                in our page header. Depending on tags actively configured inside Google Tag Manager,
                third-party analytics or measurement tools may set cookies or read browser metadata
                to measure page traffic, referral sources, and reader engagement.
              </p>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-sans font-semibold text-[#141413]">
                D. Advertising &amp; Programmatic Third-Party Cookies (Google AdSense)
              </h3>
              <p className="text-[#3F3D39]">
                AmaanEstate integrates Google AdSense scripts in our page header and editorial ad
                placements. Where programmatic advertising is active, Google and its certified ad
                network partners may place and read third-party cookies, web beacons, or device
                identifiers to deliver advertisements, measure ad impressions, prevent ad fraud,
                and—depending on your settings and regional rules—personalize ads based on your
                visits to amaanestate.com or other websites.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
            3. Cookie Duration &amp; Session Lifecycle
          </h2>
          <p>
            Cookies and browser storage entries vary in lifespan depending on their purpose:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-[#3F3D39]">
            <li>
              <strong className="text-[#141413]">Session Technologies:</strong> Temporary browser
              states exist only during an active browsing session and clear when your browser closes.
            </li>
            <li>
              <strong className="text-[#141413]">Persistent Authentication Storage:</strong>{' '}
              Supabase Auth tokens persist across browser restarts until you explicitly sign out or
              clear browser site data.
            </li>
            <li>
              <strong className="text-[#141413]">Third-Party Analytics &amp; Ad Cookies:</strong>{' '}
              Lifespans for cookies placed by Google Tag Manager or Google AdSense are controlled
              directly by those third-party providers in accordance with Google&rsquo;s cookie
              documentation.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
            4. How You Can Manage or Disable Cookies
          </h2>
          <p>
            You can inspect, block, or delete cookies and browser storage directly through your
            browser or via third-party advertising opt-out controls:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-[#3F3D39]">
            <li>
              <strong className="text-[#141413]">Browser Privacy Controls:</strong> Modern browsers
              (such as Chrome, Safari, Firefox, and Edge) allow you to view stored site data, block
              third-party cookies, block all cookies, or clear cookies and{' '}
              <code className="font-mono text-xs bg-[#FAF8F5] px-1 py-0.5 rounded">localStorage</code>{' '}
              upon exit. Consult your browser&rsquo;s privacy settings documentation for exact steps.
            </li>
            <li>
              <strong className="text-[#141413]">Google Advertising Controls:</strong> To manage or
              opt out of personalized advertising served by Google, visit{' '}
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1E3A5F] underline font-medium"
              >
                Google Ads Settings
              </a>
              .
            </li>
            <li>
              <strong className="text-[#141413]">Industry Advertising Opt-Outs:</strong> Visitors in
              supported regions can also review cross-network ad choices via the{' '}
              <a
                href="https://www.aboutads.info/choices/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1E3A5F] underline font-medium"
              >
                Digital Advertising Alliance (YourAdChoices)
              </a>{' '}
              or{' '}
              <a
                href="https://optout.networkadvertising.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1E3A5F] underline font-medium"
              >
                Network Advertising Initiative opt-out tool
              </a>
              .
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
            5. Effects of Disabling Cookies or Browser Storage
          </h2>
          <p>
            Public reading of articles and browsing property search pages do not require cookies.
            However, disabling essential browser storage (
            <code className="font-mono text-xs bg-[#FAF8F5] px-1 py-0.5 rounded border border-[#E5E0D8]">
              localStorage
            </code>
            ) or blocking all site data
            will prevent account sign-in sessions from persisting and may limit access to the{' '}
            <Link to="/account" className="text-[#1E3A5F] underline">
              My Account
            </Link>{' '}
            or administrative publishing tools. Disabling third-party advertising cookies does not
            prevent pages from loading, though advertisements shown may be less relevant to your
            interests.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
            6. Consent Management Notice &amp; Planned Enhancements
          </h2>
          <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded p-4 text-sm text-[#4A4843] space-y-2">
            <p>
              <strong className="text-[#141413]">Current Site Functionality:</strong> AmaanEstate
              does not currently include an interactive on-site Cookie Consent Banner or Cookie
              Preference Center. Cookie management is presently handled through the browser
              controls and third-party ad opt-out links described in Section 4 above.
            </p>
            <p>
              <strong className="text-[#141413]">Recommended Future Enhancement:</strong> Before
              targeting active advertising or non-essential tracking toward jurisdictions that
              require explicit prior opt-in consent (such as the European Economic Area, the United
              Kingdom, or Switzerland), implementing a Consent Management Platform (CMP) integrated
              with Google Consent Mode is recommended.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
            7. Changes to This Cookie Policy
          </h2>
          <p>
            We may update this Cookie Policy whenever our analytics, consent tools, or advertising
            integrations change. Any revisions will be posted here with an updated &ldquo;Last
            updated&rdquo; date.
          </p>
        </section>

        <section className="space-y-3 border-t border-[#E5E0D8] pt-6">
          <h2 className="text-xl font-serif font-semibold text-[#141413]">8. Contact Information</h2>
          <p>
            For additional details about how data is handled across the platform, please read our{' '}
            <Link to="/privacy-policy" className="text-[#1E3A5F] underline">
              Privacy Policy
            </Link>{' '}
            or{' '}
            <Link to="/advertising-disclosure" className="text-[#1E3A5F] underline">
              Advertising Disclosure
            </Link>
            , or contact us through the{' '}
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
