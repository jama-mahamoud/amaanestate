import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, ChevronRight, User, Building2, Lock, Award, ArrowLeft, Sparkles, Network, Briefcase, Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AgentOnboardingSelection() {
  const navigate = useNavigate();

  return (
    <div className="pt-28 pb-24 min-h-screen bg-[#050505] text-white px-4 md:px-8 relative overflow-hidden font-sans selection:bg-[#C5A059]/20 flex flex-col justify-center">
      {/* Background Ambience Luxury Shaders */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-[#C5A059]/[0.02] via-transparent to-transparent pointer-events-none rounded-b-[4rem]"></div>
      <div className="absolute top-[30%] left-[10%] w-96 h-96 bg-gradient-to-r from-[#C5A059]/[0.01] to-[#C5A059]/[0.02] blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-4xl mx-auto w-full relative z-10">
        
        {/* Nav Back Button */}
        <div className="mb-8 text-center sm:text-left">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-white/40 hover:text-[#C5A059] text-[11px] font-bold uppercase tracking-wider transition-colors duration-300"
          >
            <ArrowLeft size={14} />
            <span>Return to Home</span>
          </Link>
        </div>

        {/* Premium Core Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/20 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em]"
          >
            <ShieldCheck size={14} className="stroke-[2.5]" />
            <span>Partner Onboarding Portal</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-display font-medium tracking-tight text-white"
          >
            Join AmaanEstate Network
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/50 text-sm md:text-base leading-relaxed tracking-wide max-w-lg mx-auto font-light"
          >
            Choose how you want to grow your real estate business
          </motion.p>
        </div>

        {/* Multi-role selection boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch mb-12">
          
          {/* Card 1: Real Estate Agent */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => navigate('/agent-register')}
            className="group p-8 rounded-[2rem] border border-white/5 bg-[#0a0a0a]/90 hover:border-[#C5A059]/40 hover:shadow-2xl hover:shadow-[#C5A059]/5 transition-all duration-500 cursor-pointer flex flex-col justify-between relative overflow-hidden text-left"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#C5A059] opacity-[0.02] rounded-bl-full pointer-events-none group-hover:opacity-[0.05] transition-opacity duration-500" />
            
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-[#C5A059]/10 border border-[#C5A059]/20 flex items-center justify-center text-[#C5A059] group-hover:bg-[#C5A059] group-hover:text-black transition-all duration-500 shadow-lg">
                <User size={24} className="stroke-[2]" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white group-hover:text-[#C5A059] transition-colors">Real Estate Agent</h3>
                <p className="text-white/45 text-sm leading-relaxed font-light">
                  For individual agents, property marketers, or neighborhood representatives who coordinate client showings, build portfolios, and earn direct buyer leads.
                </p>
              </div>

              {/* Bullet highlights */}
              <ul className="space-y-2 pt-2 border-t border-white/5 text-xs text-white/50">
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-[#C5A059]" />
                  Verified agent directory badge
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-[#C5A059]" />
                  Direct customer WhatsApp lead forwarding
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-[#C5A059]" />
                  Upload verified residential and stay listings
                </li>
              </ul>
            </div>

            <div className="pt-8 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#C5A059]/70 group-hover:text-[#C5A059] transition-colors">
              <span>Apply as Agent</span>
              <ChevronRight size={16} className="transform group-hover:translate-x-1.5 transition-transform" />
            </div>
          </motion.div>

          {/* Card 2: Broker / Agency Owner */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => navigate('/broker-register')}
            className="group p-8 rounded-[2rem] border border-white/5 bg-[#0a0a0a]/90 hover:border-[#C5A059]/40 hover:shadow-2xl hover:shadow-[#C5A059]/5 transition-all duration-500 cursor-pointer flex flex-col justify-between relative overflow-hidden text-left"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#C5A059] opacity-[0.02] rounded-bl-full pointer-events-none group-hover:opacity-[0.05] transition-opacity duration-500" />
            
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-[#C5A059]/10 border border-[#C5A059]/20 flex items-center justify-center text-[#C5A059] group-hover:bg-[#C5A059] group-hover:text-black transition-all duration-500 shadow-lg">
                <Building2 size={24} className="stroke-[2]" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white group-hover:text-[#C5A059] transition-colors">Broker / Agency Owner</h3>
                <p className="text-white/45 text-sm leading-relaxed font-light">
                  For licensed brokerages, real-estate firms, and developers seeking enterprise credentials, municipal alignment lookups, and multi-listing corporate profiles.
                </p>
              </div>

              {/* Bullet highlights */}
              <ul className="space-y-2 pt-2 border-t border-white/5 text-xs text-white/50">
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-[#C5A059]" />
                  Licensed brokerage registry listing
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-[#C5A059]" />
                  Double-allocation compliance validation
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-[#C5A059]" />
                  Branded watermarks & corporate profile tags
                </li>
              </ul>
            </div>

            <div className="pt-8 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#C5A059]/70 group-hover:text-[#C5A059] transition-colors">
              <span>Apply as Broker</span>
              <ChevronRight size={16} className="transform group-hover:translate-x-1.5 transition-transform" />
            </div>
          </motion.div>

        </div>

        {/* Small footer note about audit registry safety */}
        <div className="text-center pt-4 border-t border-white/5">
          <p className="text-white/30 text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
            <Lock size={12} className="text-[#C5A059]" />
            <span>Backed by AmaanEstate land integrity standards</span>
          </p>
        </div>

      </div>
    </div>
  );
}
