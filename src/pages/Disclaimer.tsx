import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Scale, ArrowLeft, Clock } from 'lucide-react';

export default function Disclaimer() {
  const lastUpdated = "June 16, 2026";

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-36 pb-24 relative overflow-hidden font-sans">
      {/* Background design accents */}
      <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-luxury-gold/[0.03] blur-[150px] rounded-full pointer-events-none -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-luxury-gold/[0.01] blur-[120px] rounded-full pointer-events-none translate-y-1/3"></div>

      <div className="container mx-auto max-w-4xl px-6 relative z-10">
        
        {/* Navigation Link back */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-white/40 hover:text-[#C5A059] text-xs uppercase tracking-widest font-bold mb-12 transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Portal
        </Link>

        {/* Header Block */}
        <div className="border-b border-white/5 pb-10 mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#C5A059]/5 border border-[#C5A059]/10 flex items-center justify-center text-[#C5A059] shadow-lg shadow-[#C5A059]/5">
              <ShieldAlert size={20} />
            </div>
            <div>
              <span className="text-[10px] text-[#C5A059] uppercase tracking-[0.25em] font-semibold">
                Legal Framework & Risk Disclosure
              </span>
              <h1 className="text-3xl md:text-4xl font-display font-medium tracking-tight text-white mt-1">
                Disclaimer
              </h1>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-6 text-white/40 text-xs font-light">
            <div className="flex items-center gap-1.5">
              <Clock size={12} className="text-[#C5A059]/60" />
              <span>Effective Date: {lastUpdated}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Scale size={12} className="text-[#C5A059]/60" />
              <span>Institutional Risk Management Standards</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="space-y-12 text-white/70 text-sm md:text-base leading-relaxed font-light">
          
          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-lg font-display text-white font-medium flex items-center gap-2.5">
              <span className="text-xs font-mono text-[#C5A059]">01.</span>
              Nature of Platform Information & Listings Data
            </h2>
            <p className="pl-6 border-l border-[#C5A059]/20">
              All coordinates, structural specifications, architectural indices, pricing formulas, and accessibility updates listed on the AmaanEstate portal are generated for generalized informational references. While we enforce rigid title validation guidelines and verification checks across our premium partner networks, AmaanEstate does not serve as an absolute guarantor representing the immediate dynamic availability, ownership titles, or structural status values of listed real estate or automotive assets.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-lg font-display text-white font-medium flex items-center gap-2.5">
              <span className="text-xs font-mono text-[#C5A059]">02.</span>
              Institutional Digital Drafts & Contract Generators
            </h2>
            <p className="pl-6 border-l border-[#C5A059]/20">
              The customized transaction structures, automated lease agreements, land transfer blueprints, and automotive sales deeds generated through the platform's digital wizards serve strictly as technological toolkits tailored for initial draft preparation and operational speed. It does not constitute binding judicial, tax, or legal advice, nor does it substitute official municipal registries, institutional notary verifications, or legislative property transfer filings.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="text-lg font-display text-white font-medium flex items-center gap-2.5">
              <span className="text-xs font-mono text-[#C5A059]">03.</span>
              Independent Capital & Investment Risk Disclosure
            </h2>
            <p className="pl-6 border-l border-[#C5A059]/20">
              High-value capital acquisitions, real-estate trades, long-term rentals, and premium mobility agreements involve substantial financial and physical exposure. Users carry absolute, standalone responsibility for executing rigorous due diligence checks, physical title verifications, and secure escrow arrangements. AmaanEstate refuses all liability for capital losses, dynamic depreciation, or commercial disputes arising from independent offline contracts or transactions.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="text-lg font-display text-white font-medium flex items-center gap-2.5">
              <span className="text-xs font-mono text-[#C5A059]">04.</span>
              Verification Badges & Partner Network Ratings
            </h2>
            <p className="pl-6 border-l border-[#C5A059]/20">
              Ecosystem integrity markers (Verified Agency tags, Trust Index scores, and Broker Registry indices) constitute a performance rating derived from verified municipal compliance, licensing reports, and active user feedback history. These markers serve as structural trust transparency guides and do not represent a legal warranty regarding future conduct, reliability, or solvency of any partner.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <h2 className="text-lg font-display text-white font-medium flex items-center gap-2.5">
              <span className="text-xs font-mono text-[#C5A059]">05.</span>
              Ecosystem Connectivity & External Integrations
            </h2>
            <p className="pl-6 border-l border-[#C5A059]/20">
              The AmaanEstate digital marketplace provides directory pointers, real-time communication routes, and external map coordinates linking users to independent entities. Engagements, financial escrow deliveries, and documentation transactions executed offline via these external avenues represent direct, exclusive covenants operating outside the liability structures of AmaanEstate.
            </p>
          </section>

          {/* Support Info Box */}
          <section className="space-y-4 pt-4">
            <h2 className="text-lg font-display text-white font-medium flex items-center gap-2.5">
              <span className="text-xs font-mono text-[#C5A059]">06.</span>
              Judicial Inquiries & Compliance Channel
            </h2>
            <p className="pl-6 border-l border-[#C5A059]/20">
              For absolute structural legal auditing checks, formal regulatory compliance submissions, or judicial clarification concerning platform indices, please contact our legal and risk advisory division directly at:
            </p>
            
            <div className="mt-6 ml-6 p-6 bg-white/[0.01] border border-white/5 rounded-2xl space-y-3 max-w-sm">
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
