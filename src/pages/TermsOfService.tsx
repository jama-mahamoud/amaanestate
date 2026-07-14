import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, FileText, ArrowLeft, Clock } from 'lucide-react';

export default function TermsOfService() {
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
              <span>Global Technology Compliance Standards</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="space-y-10 text-white/70 text-sm md:text-base leading-relaxed font-light">
          
          <section className="space-y-4">
            <h2 className="text-lg font-display text-white font-medium flex items-center gap-2.5">
              <span className="text-xs font-mono text-luxury-gold">01.</span>
              Acceptance of Terms
            </h2>
            <p className="pl-6 border-l border-luxury-gold/20">
              By accessing, browsing, or utilizing the website, digital guides, reviews, and tool ratings provided by AmaanEstate, you express unreserved agreement with the terms, standards, and legal protocols detailed within this document. If you do not agree to these terms, you must immediately discontinue using our services.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-display text-white font-medium flex items-center gap-2.5">
              <span className="text-xs font-mono text-luxury-gold">02.</span>
              Scope of Services & Editorial Content
            </h2>
            <p className="pl-6 border-l border-luxury-gold/20">
              AmaanEstate is an elite technology media publication, AI software review catalog, and SaaS assessment hub. All content provided—including, but not limited to, reviews, test benchmarks, hardware ratings, configurations, software evaluations, and licensing analyses—is for informational and educational purposes. Our ratings represent the independent editorial opinions and testing frameworks of our experts and do not constitute binding commercial or engineering advice.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-display text-white font-medium flex items-center gap-2.5">
              <span className="text-xs font-mono text-luxury-gold">03.</span>
              Affiliate Relationships & Product Purchases
            </h2>
            <p className="pl-6 border-l border-luxury-gold/20">
              Our service features affiliate and referral links to external software, SaaS, and hardware merchants. Transactions, agreements, and subscriptions initiated via these links are executed exclusively between you and the third-party provider. AmaanEstate is not a party to, nor is it responsible or liable for, any warranty, support, billing, or delivery issues that may arise from purchases made on external merchant networks.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-display text-white font-medium flex items-center gap-2.5">
              <span className="text-xs font-mono text-luxury-gold">04.</span>
              Limitation of Liability & External Links
            </h2>
            <p className="pl-6 border-l border-luxury-gold/20">
              AmaanEstate and its affiliates, contributors, and licensing partners disclaim all liability for any direct, indirect, or consequential damages resulting from your use of software products, SaaS solutions, or tech gear recommended on this platform. We do not guarantee that third-party software products are free of bugs, performance anomalies, or security vulnerabilities. You carry absolute responsibility for performing due diligence, system backups, and cost assessments before deploying any third-party solution.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-display text-white font-medium flex items-center gap-2.5">
              <span className="text-xs font-mono text-luxury-gold">05.</span>
              System Integrity & Network Governance
            </h2>
            <p className="pl-6 border-l border-luxury-gold/20">
              Any attempt to scrape our technology catalogs, reverse-engineer proprietary benchmarking logic, bypass security protocols, or submit illegitimate review scores and spam titles to our CMS will lead to absolute platform revocation, immediate IP blocking, and professional reporting to regulatory authorities.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-display text-white font-medium flex items-center gap-2.5">
              <span className="text-xs font-mono text-luxury-gold">06.</span>
              Inquiries and Support Channels
            </h2>
            <p className="pl-6 border-l border-luxury-gold/20">
              For comprehensive licensing questions, commercial partnership discussions, or compliance pathway clarifications, contact our legal desk directly via:
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
