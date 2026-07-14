import { motion } from 'framer-motion';
import { 
  Shield, 
  Target, 
  Award, 
  Cpu, 
  Sparkles, 
  BookOpen, 
  Fingerprint, 
  Activity,
  HeartHandshake,
  CheckCircle,
  Globe,
  Flame
} from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-luxury-black pt-28 pb-20 overflow-hidden relative">
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-luxury-gold/[0.02] blur-[150px] rounded-full pointer-events-none -translate-y-1/2"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-luxury-gold/[0.01] blur-[130px] rounded-full pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Story / Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-20 items-center mb-24 md:mb-40">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-12 xl:col-span-7"
          >
            <p className="text-luxury-gold font-bold tracking-[0.3em] md:tracking-[0.4em] uppercase text-[9px] md:text-[10px] mb-4 md:mb-6 underline underline-offset-8 decoration-luxury-gold/30">
              The AmaanEstate Legacy
            </p>
            <h1 className="text-4xl md:text-8xl font-display font-bold text-white mb-8 md:mb-10 tracking-tighter leading-[1.1] md:leading-[0.85]">
              Securing Trust <br />
              <span className="gold-text-gradient">In Your Tech Stack</span>
            </h1>
            <div className="space-y-6 md:space-y-8 max-w-2xl">
              <p className="text-white/60 text-lg md:text-xl leading-relaxed font-light italic">
                "In our heritage, 'Amaan' is a sacred contract of trust, validation, and safety. In the modern era, your 'Estate' is your digital workspace, cloud infrastructure, and software stack. At AmaanEstate, we validate this digital realm."
              </p>
              <p className="text-white/40 text-base md:text-lg leading-relaxed font-light">
                AmaanEstate has evolved into a premier global <strong>Software & Technology Review Authority</strong>. We specialize in demystifying complex enterprise SaaS, evaluating cutting-edge AI utilities, stress-testing tech gear, and compiling strategic technology deployment guides. We bridge the gap between rigorous technical testing and clear, actionable insights for technology decision-makers worldwide.
              </p>
              <p className="text-white/40 text-base md:text-lg leading-relaxed font-light">
                Our reviews are guided by absolute objectivity, complete independence, and meticulous hands-on evaluation. Whether you are scaling a multinational developer team or selecting personal cybersecurity suites, AmaanEstate is your verified compass.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.2 }}
            viewport={{ once: true }}
            className="lg:col-span-12 xl:col-span-5 relative group mt-12 md:mt-0"
          >
            <div className="relative rounded-[2.5rem] md:rounded-[4rem] overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200" 
                alt="Cybersecurity and technology infrastructure monitoring lab" 
                className="w-full aspect-[1/1] md:aspect-[4/5] object-cover transition-all duration-1000 scale-105 hover:scale-100" 
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-x-0 bottom-0 p-8 glass-card border-x-0 border-b-0 border-white/5 rounded-none backdrop-blur-2xl">
                 <div className="text-luxury-gold font-display font-bold text-4xl mb-1 tracking-tighter">Verified</div>
                 <p className="text-white/40 text-[9px] uppercase tracking-[0.3em] font-bold">Anno 2020 • Global Tech Review Authority</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Mission & Vision Section */}
        <div className="mb-24 md:mb-40">
          <div className="text-center mb-16 md:mb-24">
            <p className="text-luxury-gold font-bold tracking-[0.3em] uppercase text-[9px] md:text-[10px] mb-4">Core Imperatives</p>
            <h2 className="text-3xl md:text-6xl font-display font-bold text-white tracking-tight">Mission & Editorial Sovereignty</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <div className="glass-card p-8 md:p-12 rounded-[2.5rem] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-luxury-gold/5 blur-2xl rounded-full" />
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-luxury-gold mb-6">
                <Target size={24} />
              </div>
              <h3 className="text-xl md:text-2xl font-display font-bold text-white mb-4">Our Core Mission</h3>
              <p className="text-white/40 leading-relaxed text-sm md:text-base font-light">
                Our mission is to empower developers, IT architects, businesses, and consumers to purchase technology products with absolute confidence. We strip away the corporate marketing buzzwords to present real, measurable performance indices, usability breakdowns, and software security audits. We exist to be the ultimate benchmark of technology validation.
              </p>
            </div>
            <div className="glass-card p-8 md:p-12 rounded-[2.5rem] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-luxury-gold/5 blur-2xl rounded-full" />
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-luxury-gold mb-6">
                <Globe size={24} />
              </div>
              <h3 className="text-xl md:text-2xl font-display font-bold text-white mb-4">Our Global Vision</h3>
              <p className="text-white/40 leading-relaxed text-sm md:text-base font-light">
                To serve as the world's most trusted node for SaaS licensing, software security profiles, and tech configurations. While our heritage anchors us in Jigjiga, Somali Region, our audience is global. We aim to elevate digital adoption, promote technical literacy, and secure IT investments across emerging markets and developed digital spaces alike.
              </p>
            </div>
          </div>
        </div>

        {/* How We Review Software - Rigorous Methodology */}
        <div className="mb-24 md:mb-40">
          <div className="text-center mb-16 md:mb-24">
            <p className="text-luxury-gold font-bold tracking-[0.3em] uppercase text-[9px] md:text-[10px] mb-4">The Testing Matrix</p>
            <h2 className="text-3xl md:text-6xl font-display font-bold text-white tracking-tight">How We Review Software & Gear</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              { 
                icon: <Cpu size={24} />, 
                title: 'Live Sandboxing', 
                desc: 'We don’t rewrite marketing brochures. We deploy every software suite, AI utility, and database in isolation containers. We test throughput, latency, configuration limits, and UI responsiveness under simulated real-world loads.' 
              },
              { 
                icon: <Shield size={24} />, 
                title: 'Security Auditing', 
                desc: 'In cooperation with professional systems security specialists, we evaluate data governance policies, OAuth configurations, multi-factor support, compliance certifications, and privacy practices before giving our stamp of approval.' 
              },
              { 
                icon: <Activity size={24} />, 
                title: 'Cost-to-Value Indexing', 
                desc: 'Pricing configurations can be intentionally deceptive. We calculate the price-per-seat, scalability cost vectors, free-tier limitations, and premium lock-in scenarios so you know exactly what your long-term commitment represents.' 
              }
            ].map((method, idx) => (
              <div key={idx} className="glass-card p-8 md:p-10 rounded-[2rem] hover:border-luxury-gold/20 transition-all duration-700">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-luxury-gold mb-6">
                  {method.icon}
                </div>
                <h4 className="text-lg md:text-xl font-display font-bold text-white mb-3">{method.title}</h4>
                <p className="text-white/30 text-xs md:text-sm leading-relaxed font-light">{method.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Editorial Standards & Affiliate Disclosure */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-16 items-start mb-24 md:mb-40">
          <div className="lg:col-span-12 xl:col-span-6 space-y-6 md:space-y-8">
            <p className="text-luxury-gold font-bold tracking-[0.3em] uppercase text-[9px] md:text-[10px] underline underline-offset-8 decoration-luxury-gold/30">
              Uncompromising Standards
            </p>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white tracking-tight">
              Independence & Truth Above All
            </h2>
            <p className="text-white/40 text-sm md:text-base leading-relaxed font-light">
              Our reviews are entirely written and compiled under our strict <strong>Editorial Sovereignty Charter</strong>. No software publisher, hardware manufacturer, SaaS marketer, or AI platform operator can purchase positive coverage, modify our diagnostic scores, or bypass our stress testing. Our reviews represent independent editorial opinions, compiled with maximum technical transparency.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-5 h-5 rounded-full bg-luxury-gold/10 flex items-center justify-center text-luxury-gold shrink-0 mt-1">
                  <CheckCircle size={12} />
                </div>
                <p className="text-white/50 text-xs md:text-sm font-light">
                  <strong>Zero Play-to-Play:</strong> No vendor can pay to elevate their ratings or alter editorial conclusions.
                </p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-5 h-5 rounded-full bg-luxury-gold/10 flex items-center justify-center text-luxury-gold shrink-0 mt-1">
                  <CheckCircle size={12} />
                </div>
                <p className="text-white/50 text-xs md:text-sm font-light">
                  <strong>Practical Evaluation:</strong> We reject reviews based on speculation; everything undergoes hands-on testing.
                </p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-5 h-5 rounded-full bg-luxury-gold/10 flex items-center justify-center text-luxury-gold shrink-0 mt-1">
                  <CheckCircle size={12} />
                </div>
                <p className="text-white/50 text-xs md:text-sm font-light">
                  <strong>Continuous Iteration:</strong> If a SaaS product pushes a critical patch or re-engineers its model, we update our review.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-12 xl:col-span-6">
            <div className="glass-card p-8 md:p-12 rounded-[2.5rem] relative overflow-hidden border border-luxury-gold/10 shadow-xl shadow-luxury-gold/5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-gold/[0.03] blur-2xl rounded-full" />
              <div className="w-12 h-12 rounded-xl bg-luxury-gold/5 border border-luxury-gold/10 flex items-center justify-center text-luxury-gold mb-6">
                <HeartHandshake size={24} />
              </div>
              <h3 className="text-xl md:text-2xl font-display font-bold text-white mb-4">Affiliate & Sponsorship Transparency</h3>
              <div className="space-y-4 text-white/40 text-xs md:text-sm font-light leading-relaxed">
                <p>
                  To fund our comprehensive testing environments, pay our specialized systems engineers, and keep our portal free of intrusive programmatic banner ads, AmaanEstate participates in strategic affiliate marketing systems. 
                </p>
                <p>
                  When you click on our recommended product links and subscribe to a software platform or purchase tech gear, we may receive a commission. 
                </p>
                <p className="text-luxury-gold font-normal">
                  Important: This commission does NOT increase the cost of the product for you. Most importantly, it has absolutely zero influence on our evaluations. We frequently criticize products with high-commission affiliate programs and praise open-source or non-paying tools because our first allegiance is to you—the reader.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Global Experts / Team Presence */}
        <div className="relative py-16 md:py-32 rounded-[2.5rem] md:rounded-[5rem] overflow-hidden">
          <div className="absolute inset-0 bg-white/[0.02]"></div>
          <div className="relative text-center mb-16 md:mb-24 px-4">
            <p className="text-luxury-gold font-bold tracking-[0.3em] uppercase text-[9px] md:text-[10px] mb-4">The Global Brain Trust</p>
            <h2 className="text-4xl md:text-7xl font-display font-bold text-white tracking-tighter leading-none">
              Dedicated <span className="text-white/20 italic">Intelligence</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 px-6 md:px-8">
            {[
              { title: 'Jigjiga HQ Lab', desc: 'SaaS evaluation & tech testing.' },
              { title: 'Global Cloud Desk', desc: 'Monitoring infrastructure & AI systems.' },
              { title: 'Systems Research', desc: 'Assessing database & DevOps tools.' },
              { title: 'Security Intelligence', desc: 'Evaluating platform safety protocols.' }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="w-12 h-12 mx-auto rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-luxury-gold mb-6 group-hover:bg-luxury-gold group-hover:text-luxury-black transition-all duration-500">
                  <Fingerprint size={20} />
                </div>
                <h4 className="text-lg md:text-xl font-display font-bold text-white mb-2 tracking-tight">{item.title}</h4>
                <p className="text-white/20 text-[10px] font-light uppercase tracking-widest">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
