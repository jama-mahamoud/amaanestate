import React from 'react';
import { MapPin, TrendingUp, Landmark, ShieldAlert } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';

export default function LocationsPage() {
  useSEO({
    title: 'Popular Investment Locations | AmaanEstate',
    description: 'Discover popular real estate investment neighborhoods, commercial zones, and residential quarters in Jigjiga and the Somali Region.'
  });

  const locations = [
    {
      city: 'Jigjiga',
      neighborhood: 'Kebele 06 (Airport Road)',
      region: 'Somali Region',
      type: 'Premium Residential & Commercial',
      growth: '+18% YoY',
      description: 'The absolute commercial core of Jigjiga, featuring high-traffic properties, major banking hubs, and new apartment complexes.'
    },
    {
      city: 'Jigjiga',
      neighborhood: 'Kebele 04 (Guryaha Cadcad)',
      region: 'Somali Region',
      type: 'Luxury Villa Zone',
      growth: '+14% YoY',
      description: 'Highly quiet and peaceful elite residential enclave with premium spacious estates and verified property values.'
    },
    {
      city: 'Jigjiga',
      neighborhood: 'Sheik Abdi (University Quarter)',
      region: 'Somali Region',
      type: 'Middle-Income & Student Rentals',
      growth: '+12% YoY',
      description: 'A booming area near Jigjiga University with consistent residential demand, high occupancy rates, and student lodgings.'
    },
    {
      city: 'Jigjiga',
      neighborhood: 'Fafan Zone Outer Ring',
      region: 'Somali Region',
      type: 'Agricultural & Land Expansion',
      growth: '+22% YoY',
      description: 'A massive industrial expansion corridor, offering excellent opportunities for purchasing raw commercial plots and warehouses.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono">
          <span>AmaanEstate</span>
          <span>/</span>
          <span className="text-neutral-300">Locations</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-none">
          Popular Investment Zones
        </h1>
        <p className="text-xs text-neutral-400 max-w-lg">
          Explore growth indicators, zoning descriptions, and average valuation metrics for verified neighborhoods across Jigjiga.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {locations.map((loc, idx) => (
          <div 
            key={idx} 
            className="p-6 rounded-xl bg-[#0c0c14] border border-white/[0.04] flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-mono font-bold">
                    <MapPin size={13} />
                    <span>{loc.neighborhood}</span>
                  </div>
                  <h3 className="text-base font-bold text-white">{loc.city}, {loc.region}</h3>
                </div>
                <span className="px-2 py-0.5 text-xxs font-mono font-bold text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 rounded-md flex items-center gap-1">
                  <TrendingUp size={11} />
                  <span>{loc.growth}</span>
                </span>
              </div>

              <div className="text-xxs uppercase tracking-widest text-neutral-500 font-mono">
                Primary Zone Type: <span className="text-neutral-300">{loc.type}</span>
              </div>

              <p className="text-xs text-neutral-400 leading-relaxed">
                {loc.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
