import React from 'react';
import { ShieldCheck, Users, Globe, Landmark } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';

export default function AboutPage() {
  useSEO({
    title: 'About Us | AmaanEstate',
    description: 'Learn about AmaanEstate, the premier digital real estate technology company in Jigjiga, Somali Region, and East Africa.'
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-widest text-cyan-400 font-mono font-bold">About AmaanEstate</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Pioneering Digital Real Estate in East Africa
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
          AmaanEstate is a location-centric digital catalog and property discovery platform designed for Jigjiga, the Somali Region, and East Africa, helping users browse, filter, and discover available real estate listing opportunities.
        </p>
      </div>

      {/* Core Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
        <div className="p-6 rounded-xl bg-[#0c0c14] border border-white/[0.04] space-y-4">
          <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-500/25 flex items-center justify-center text-blue-400">
            <ShieldCheck size={20} />
          </div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Structured Catalog</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Every listing uploaded to our marketplace is structured for simple location-centric navigation and clean detailed exploration.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-[#0c0c14] border border-white/[0.04] space-y-4">
          <div className="w-10 h-10 rounded-lg bg-cyan-600/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400">
            <Landmark size={20} />
          </div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Location Native</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Designed first for the local Somali Region, building detailed neighborhood-by-neighborhood district databases.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-[#0c0c14] border border-white/[0.04] space-y-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-600/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
            <Users size={20} />
          </div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Reputable Directory</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Connecting buyers and tenants directly with local agents to browse available properties without hidden commission structures.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-[#0c0c14] border border-white/[0.04] space-y-4">
          <div className="w-10 h-10 rounded-lg bg-purple-600/10 border border-purple-500/25 flex items-center justify-center text-purple-400">
            <Globe size={20} />
          </div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Digital First</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Combining direct category searches, custom filtering options, and convenient communication channels with representatives.
          </p>
        </div>
      </div>
    </div>
  );
}
