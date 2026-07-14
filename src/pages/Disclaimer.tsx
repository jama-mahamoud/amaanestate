import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Scale, ArrowLeft, Clock } from 'lucide-react';

export default function Disclaimer() {
  const lastUpdated = "July 12, 2026";

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
              <span>Global Technology Media Disclosure Standard</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="space-y-12 text-white/70 text-sm md:text-base leading-relaxed font-light">
          
          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-lg font-display text-white font-medium flex items-center gap-2.5">
              <span className="text-xs font-mono text-[#C5A059]">01.</span>
              Editorial and Testing Opinions Disclaimer
            </h2>
            <p className="pl-6 border-l border-[#C5A059]/20">
              All software reviews, performance benchmarks, AI tool ratings, hardware comparisons, and SaaS evaluations published on AmaanEstate represent the editorial opinions of our writers and technical testers. While we make every effort to test products extensively and provide objective feedback, technology products change rapidly. Features, pricing models, limits, and compatibility are subject to sudden change. AmaanEstate makes no warranties regarding the accuracy, currency, or compatibility of software featured on this platform.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-lg font-display text-white font-medium flex items-center gap-2.5">
              <span className="text-xs font-mono text-[#C5A059]">02.</span>
              Affiliate and Referral Disclosure
            </h2>
            <p className="pl-6 border-l border-[#C5A059]/20">
              AmaanEstate utilizes affiliate marketing and sponsored links to monetize our in-depth content. This means that if you click on a product link (such as an AI tool, software product, SaaS subscription, or hardware device) and complete a transaction on the merchant's site, we may receive a commission. We only recommend products we believe add value, but our affiliate partnerships do not alter our commitment to honest, critical evaluations. We disclaim any liability for billing disputes, customer support issues, or service delivery failures from our affiliate partners.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="text-lg font-display text-white font-medium flex items-center gap-2.5">
              <span className="text-xs font-mono text-[#C5A059]">03.</span>
              System Configuration and Tech Deployments
            </h2>
            <p className="pl-6 border-l border-[#C5A059]/20">
              Our technology guides, configuration snippets, deployment scripts, and architectural patterns are provided strictly as general guidelines. It is your responsibility to test software setups, APIs, configurations, and systems in sandboxed or staging environments. Deploying recommended SaaS platforms, code, or systems on your production servers is done at your own risk. AmaanEstate refuses all liability for system downtime, security breaches, data loss, or server failure resulting from our technology reviews or tutorials.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="text-lg font-display text-white font-medium flex items-center gap-2.5">
              <span className="text-xs font-mono text-[#C5A059]">04.</span>
              External Links and Third-Party Sites
            </h2>
            <p className="pl-6 border-l border-[#C5A059]/20">
              AmaanEstate contains dynamic links to third-party software marketplaces, SaaS portals, and technology retailers that are not owned or controlled by our company. We hold no authority over, and assume no responsibility for, the content, security, data handling procedures, cookie practices, or business operations of external sites. Visiting outside websites is governed entirely by their respective terms and conditions.
            </p>
          </section>

          {/* Support Info Box */}
          <section className="space-y-4 pt-4">
            <h2 className="text-lg font-display text-white font-medium flex items-center gap-2.5">
              <span className="text-xs font-mono text-[#C5A059]">05.</span>
              Judicial Inquiries & Compliance Channel
            </h2>
            <p className="pl-6 border-l border-[#C5A059]/20">
              For editorial corrections, affiliate reporting questions, or general compliance inquiries, please contact our legal and risk advisory division directly at:
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
