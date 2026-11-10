import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Mail, Phone, MapPin, Award, RefreshCw, Users } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';
import { db, handleFirestoreError, OperationType } from '../services/firestore';
import { Agent } from '../types';

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useSEO({
    title: 'Certified Agents Network | AmaanEstate',
    description: 'Connect with verified real estate specialists and certified brokers in Jigjiga, Somali Region, and East Africa.'
  });

  useEffect(() => {
    async function loadAgents() {
      setLoading(true);
      try {
        const colRef = collection(db, 'agents');
        const snap = await getDocs(colRef);
        const results = snap.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || 'AmaanEstate Agent',
            profileImage: data.profileImage || '',
            phone: data.phone || '+251 911 000000',
            email: data.email || 'info@amaanestate.com',
            bio: data.bio || 'Certified Real Estate Broker matching buyers with premium lands, houses, and commercial opportunities.',
            location: data.location || 'Jigjiga',
            specialization: Array.isArray(data.specialization) ? data.specialization : ['Real Estate Consulting'],
            active: !!data.active,
            createdAt: data.createdAt || new Date().toISOString()
          };
        });
        setAgents(results);
      } catch (err) {
        console.error('Error fetching agents:', err);
        handleFirestoreError(err, OperationType.GET, 'agents');
      } finally {
        setLoading(false);
      }
    }
    loadAgents();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono">
          <span>AmaanEstate</span>
          <span>/</span>
          <span className="text-neutral-300">Agents</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-none">
          Certified Agents Network
        </h1>
        <p className="text-xs text-neutral-400 max-w-lg">
          Meet our licensed, background-checked real estate advisors who verify deeds and lead safe ownership transfers.
        </p>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-4">
          <RefreshCw className="text-cyan-400 animate-spin" size={24} />
          <p className="text-xs font-mono uppercase tracking-widest text-neutral-500 text-center">Loading advisors directory...</p>
        </div>
      ) : agents.length === 0 ? (
        <div className="py-20 text-center max-w-sm mx-auto space-y-4 bg-[#0c0c14] border border-white/[0.04] p-8 rounded-xl">
          <Users className="text-neutral-600 mx-auto" size={40} />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">Advisors List Offline</h3>
            <p className="text-xxs text-neutral-500 leading-relaxed">
              Our central office registry is being updated. Contact support directly at +251 911 000000 for immediate listing allocation.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {agents.map((agent) => (
            <div 
              key={agent.id} 
              className="group flex flex-col justify-between bg-[#0c0c14] border border-white/[0.04] hover:border-cyan-500/20 rounded-xl p-6 transition-all duration-300"
            >
              <div className="space-y-4">
                {/* Header profile portrait info */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-neutral-900 border border-white/[0.04] flex-shrink-0">
                    <img 
                      src={agent.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'} 
                      alt={agent.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{agent.name}</h3>
                    <div className="flex items-center gap-1.5 text-xxs text-neutral-500">
                      <MapPin size={11} className="text-neutral-400" />
                      <span>{agent.location}</span>
                    </div>
                  </div>
                </div>

                {/* Spec Tag lines */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {agent.specialization?.map((spec, idx) => (
                    <span key={idx} className="px-2 py-0.5 text-xxs font-medium rounded-md bg-cyan-500/5 text-cyan-300 border border-cyan-500/10">
                      {spec}
                    </span>
                  ))}
                </div>

                {/* Bio text */}
                <p className="text-xs text-neutral-400 leading-relaxed line-clamp-3 italic">
                  "{agent.bio}"
                </p>
              </div>

              {/* Action and contact footer */}
              <div className="border-t border-white/[0.03] pt-4 mt-6 space-y-2.5 text-xxs text-neutral-500">
                <a href={`tel:${agent.phone}`} className="flex items-center gap-2 hover:text-white transition-colors">
                  <Phone size={13} className="text-neutral-400" />
                  <span>{agent.phone}</span>
                </a>
                <a href={`mailto:${agent.email}`} className="flex items-center gap-2 hover:text-white transition-colors">
                  <Mail size={13} className="text-neutral-400" />
                  <span>{agent.email}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
