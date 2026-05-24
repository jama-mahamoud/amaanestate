import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, FileText, ArrowLeft, Clock } from 'lucide-react';

export default function TermsOfService() {
  const lastUpdated = "May 24, 2026";

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
              <FileText size={20} />
            </div>
            <div>
              <span className="text-[10px] text-luxury-gold uppercase tracking-[0.25em] font-semibold">Regulatory Framework</span>
              <h1 className="text-3xl md:text-4xl font-display font-medium tracking-tight text-white mt-1">Terms of Service</h1>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-6 text-white/40 text-xs font-light">
            <div className="flex items-center gap-1.5">
              <Clock size={12} className="text-luxury-gold/60" />
              <span>Effective Date: {lastUpdated}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield size={12} className="text-luxury-gold/60" />
              <span>Institutional Grade Compliance</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="space-y-10 text-white/70 text-sm md:text-base leading-relaxed font-light">
          
          <section className="space-y-4">
            <h2 className="text-lg font-display text-white font-medium flex items-center gap-2.5">
              <span className="text-xs font-mono text-luxury-gold">01.</span>
              Acceptance of Institutional Terms
            </h2>
            <p className="pl-6 border-l border-luxury-gold/20">
              By accessing the digital interfaces, brokerage catalogs, property registries, and agreement structures provided by AmaanEstate, you express unreserved agreement with the definitions, standards, and legal protocols detailed within this document. High-value property and mobility unit listings require verified verification markers prior to platform deployment.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-display text-white font-medium flex items-center gap-2.5">
              <span className="text-xs font-mono text-luxury-gold">02.</span>
              User Registrations & Verification Protocols
            </h2>
            <p className="pl-6 border-l border-luxury-gold/20">
              Users seeking to utilize the platform for brokerage inquiries, verified digital contracts, or listing generation must undergo multi-tiered safety reviews. Credentials, licensing information, and structural integrity reports submitted with listed assets must represent genuine verifiable facts. Misrepresentation of property layout, location, or ownership results in absolute suspension.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-display text-white font-medium flex items-center gap-2.5">
              <span className="text-xs font-mono text-luxury-gold">03.</span>
              Transaction & Registry Operations
            </h2>
            <p className="pl-6 border-l border-luxury-gold/20">
              AmaanEstate facilitates transparent real-estate and luxury asset matching. Digital land agreements, structural integrity validations, and broker ratings are designed for informational clarity and certified matching. Final ownership transfers and legally executing land transactions remain under local legislative mandates.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-display text-white font-medium flex items-center gap-2.5">
              <span className="text-xs font-mono text-luxury-gold">04.</span>
              Listing Accuracy & Liability Limits
            </h2>
            <p className="pl-6 border-l border-luxury-gold/20">
              While we enforce meticulous structural status reports and certified verification procedures, users acknowledge that real-estate catalog items are subject to dynamic physical conditions. We maintain maximum platform reliability standards but disclaim absolute liability for offline transaction negotiations executed outside established certification badges.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-display text-white font-medium flex items-center gap-2.5">
              <span className="text-xs font-mono text-luxury-gold">05.</span>
              Ecosystem Governance & System Misuse
            </h2>
            <p className="pl-6 border-l border-luxury-gold/20">
              Any attempt to scrape structural database logs, bypass certified broker verification, or inject illegitimate real estate titles into the portal will lead to absolute platform revocation, immediate trust-index blacklisting, and professional reports forwarded directly to regional real-estate authorities.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-display text-white font-medium flex items-center gap-2.5">
              <span className="text-xs font-mono text-luxury-gold">06.</span>
              Inquiries and Support Channels
            </h2>
            <p className="pl-6 border-l border-luxury-gold/20">
              For comprehensive structural audits, dispute processing, or clarification regarding compliance pathways, contact our legal desk directly via:
            </p>
            <div className="mt-4 ml-6 p-6 bg-white/[0.01] border border-white/5 rounded-2xl space-y-3 max-w-sm">
              <div className="text-xs flex justify-between">
                <span className="text-white/40">Legal Desk:</span>
                <span className="text-white font-medium">support@amaanestate.com</span>
              </div>
              <div className="text-xs flex justify-between">
                <span className="text-white/40">Regional HQ:</span>
                <span className="text-white font-medium">Jigjiga, Ethiopia</span>
              </div>
              <div className="text-xs flex justify-between">
                <span className="text-white/40">Compliance Line:</span>
                <span className="text-white font-medium">+251 910 012 794</span>
              </div>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}
