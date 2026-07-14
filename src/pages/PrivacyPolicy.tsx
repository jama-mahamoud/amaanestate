import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, Clock, Eye } from 'lucide-react';

export default function PrivacyPolicy() {
  const lastUpdated = "July 12, 2026";

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-36 pb-24 relative overflow-hidden font-sans">
      {/* Background visual elements */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-luxury-gold/[0.02] blur-[150px] rounded-full pointer-events-none -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-luxury-gold/[0.01] blur-[120px] rounded-full pointer-events-none translate-y-1/3"></div>

      <div className="container mx-auto max-w-4xl px-6 relative z-10">
        
        {/* Navigation Indicator */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-white/40 hover:text-luxury-gold text-xs uppercase tracking-widest font-bold mb-12 transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Portal
        </Link>

        {/* Header Block */}
        <div className="border-b border-white/5 pb-10 mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-luxury-gold/5 border border-luxury-gold/10 flex items-center justify-center text-luxury-gold shadow-lg shadow-luxury-gold/5">
              <Shield size={20} />
            </div>
            <div>
              <span className="text-[10px] text-luxury-gold uppercase tracking-[0.25em] font-semibold">Information Security</span>
              <h1 className="text-3xl md:text-4xl font-display font-medium tracking-tight text-white mt-1">Privacy Policy</h1>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-6 text-white/40 text-xs font-light">
            <div className="flex items-center gap-1.5">
              <Clock size={12} className="text-luxury-gold/60" />
              <span>Effective Date: {lastUpdated}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Eye size={12} className="text-luxury-gold/60" />
              <span>Global Data Protection Standards</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="space-y-10 text-white/70 text-sm md:text-base leading-relaxed font-light">
          
          <section className="space-y-4">
            <h2 className="text-lg font-display text-white font-medium flex items-center gap-2.5">
              <span className="text-xs font-mono text-luxury-gold">01.</span>
              Commitment to Transparency
            </h2>
            <p className="pl-6 border-l border-luxury-gold/20">
              At AmaanEstate, we treat user privacy as a cornerstone of editorial and analytical trust. Operating as a premier Software & Technology Review Authority, this Privacy Policy documents how we collect, govern, process, and protect your information across our website, newsletter, and review platforms. We are committed to safeguarding the privacy of our readers, subscribers, and community members in accordance with global data protection standards.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-display text-white font-medium flex items-center gap-2.5">
              <span className="text-xs font-mono text-luxury-gold">02.</span>
              Information We Collect
            </h2>
            <p className="pl-6 border-l border-luxury-gold/20">
              We collect information to provide rigorous software analysis, hardware benchmarks, and tailored technology guides. This occurs through several channels:
            </p>
            <ul className="pl-12 list-disc space-y-2 text-white/60 text-sm font-light">
              <li><strong>User-Provided Data:</strong> Email addresses submitted for newsletters, information submitted via contact forms, system settings profiles, and reviews or feedback posted directly to our platform.</li>
              <li><strong>Usage & Tech Analytics:</strong> Anonymous diagnostic information such as browser type, operating system, referring URL, pages viewed, device type, and duration of visits to measure platform performance and guide editorial focus.</li>
              <li><strong>Cookies and Tracking Technologies:</strong> We use essential, analytical, and marketing cookies to enhance user experience, remember user preferences, and monitor affiliate link referrals.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-display text-white font-medium flex items-center gap-2.5">
              <span className="text-xs font-mono text-luxury-gold">03.</span>
              Affiliate Tracking and Advertising
            </h2>
            <p className="pl-6 border-l border-luxury-gold/20">
              AmaanEstate participates in affiliate marketing programs, which means we receive commissions on purchases made through links to third-party merchant sites (such as SaaS providers, software marketplaces, and hardware retailers). When you click an affiliate link, a temporary tracking cookie is placed on your browser to attribute commissions properly. These cookies comply with the privacy frameworks of our affiliate networks and merchants, and contain no personally identifiable details.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-display text-white font-medium flex items-center gap-2.5">
              <span className="text-xs font-mono text-luxury-gold">04.</span>
              Data Protection & Third-Party Services
            </h2>
            <p className="pl-6 border-l border-luxury-gold/20">
              Your structural security files, data inputs, and profile parameters are encrypted during transit and stored on enterprise-grade cloud environments. We never sell, trade, or lease your personal information. We utilize trusted third-party services for newsletter delivery, website analytics (such as Google Analytics), and database hosting. These service providers process data in strict accordance with confidentiality and data protection agreements.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-display text-white font-medium flex items-center gap-2.5">
              <span className="text-xs font-mono text-luxury-gold">05.</span>
              Your Rights and Global Compliance
            </h2>
            <p className="pl-6 border-l border-luxury-gold/20">
              Depending on your location, you may have legal rights regarding your personal data (including under CCPA, GDPR, and other frameworks). These rights include:
            </p>
            <ul className="pl-12 list-disc space-y-2 text-white/60 text-sm font-light">
              <li>The right to access and receive a copy of the personal data we hold about you.</li>
              <li>The right to request rectification of inaccurate data or complete deletion of your records.</li>
              <li>The right to opt-out of newsletter communications and cookies at any time via integrated unsubscribe links or browser settings.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-display text-white font-medium flex items-center gap-2.5">
              <span className="text-xs font-mono text-luxury-gold">06.</span>
              Inquiries and Compliance Desk
            </h2>
            <p className="pl-6 border-l border-luxury-gold/20">
              For privacy audits, data access requests, or regulatory inquiries, contact our secure compliance desk:
            </p>
            <div className="mt-4 ml-6 p-6 bg-white/[0.01] border border-white/5 rounded-2xl space-y-3 max-w-sm">
              <div className="text-xs flex justify-between">
                <span className="text-white/40">Compliance Officer:</span>
                <span className="text-white font-medium">support@amaanestate.com</span>
              </div>
              <div className="text-xs flex justify-between">
                <span className="text-white/40">Headquarters Desk:</span>
                <span className="text-white font-medium">Jigjiga, Ethiopia</span>
              </div>
              <div className="text-xs flex justify-between">
                <span className="text-white/40">Secured Line:</span>
                <span className="text-white font-medium">+251 910 012 794</span>
              </div>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}
