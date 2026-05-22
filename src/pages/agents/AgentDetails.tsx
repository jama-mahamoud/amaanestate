import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { brokerService } from '@/services/brokerService';
import { useListings } from '@/hooks/useListings';
import { Broker } from '@/types';
import { ShieldCheck, MapPin, Building2, CheckCircle2, MessageCircle, Phone, Mail, Home as HomeIcon, Award, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PropertyCard from '@/components/PropertyCard';
import { motion } from 'motion/react';

export default function AgentDetails() {
  const { id } = useParams<{ id: string }>();
  const [broker, setBroker] = useState<Broker | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch agent listings
  const { listings: agentListings, loading: listingsLoading } = useListings(broker?.userId ? { ownerId: broker.userId } : { associatedBrokerId: id });

  useEffect(() => {
    const fetchBroker = async () => {
      if (!id) return;
      try {
        const brokers = await brokerService.getVerifiedBrokers();
        const found = brokers.find(b => b.id === id);
        if (found) setBroker(found);
      } catch (error) {
        console.error("Failed to load broker details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBroker();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-luxury-black flex items-center justify-center pt-24 pb-20">
        <div className="w-8 h-8 rounded-full border-2 border-[#C5A059] border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!broker) {
    return (
      <div className="min-h-screen bg-luxury-black flex items-center justify-center pt-24 pb-20 text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Agent Profile Not Found</h2>
          <Button asChild className="bg-[#C5A059] text-black hover:bg-white transition-colors">
            <Link to="/agents">Back to Directory</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-black pt-24 pb-20 text-white">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Profile Header */}
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 md:p-10 mb-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#C5A059]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="flex flex-col md:flex-row gap-8 relative z-10">
            {/* Photo */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-32 h-32 md:w-48 md:h-48 rounded-2xl overflow-hidden bg-white/10 shrink-0 border-2 border-white/10 relative"
            >
              {broker.profilePhotoUrl ? (
                <img src={broker.profilePhotoUrl} alt={broker.fullName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/40 font-bold text-4xl uppercase">
                  {broker.fullName.substring(0,2)}
                </div>
              )}
              {broker.isVerified && (
                <div className="absolute bottom-2 right-2 w-8 h-8 bg-emerald-500 rounded-full border-[3px] border-luxury-black z-10 flex items-center justify-center shadow-lg">
                  <CheckCircle2 size={18} className="text-white" />
                </div>
              )}
            </motion.div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-2">{broker.fullName}</h1>
                  {broker.companyName && (
                    <div className="flex items-center gap-2 text-white/80 text-lg md:text-xl font-medium mb-3">
                      <Building2 size={20} className="text-[#C5A059]" />
                      <span>{broker.companyName}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-white/50 text-sm md:text-base mb-4">
                    <MapPin size={16} />
                    <span>{broker.officeAddress || broker.city + ', ' + broker.region}</span>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-col gap-2">
                  <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck size={14} /> Certified Compliant
                  </div>
                  <div className="text-white/40 text-[10px] uppercase font-bold tracking-widest text-right">
                    ID Ref: {broker.id}
                  </div>
                </div>
              </div>

              {/* Bio & Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 my-6 border-y border-white/5">
                <div>
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold block mb-1">Experience</span>
                  <div className="text-white text-lg font-bold flex items-center gap-2">
                    <Award size={18} className="text-[#C5A059]" />
                    {broker.yearsOfExperience || 4}+ Years Professional
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold block mb-1">Target Sectors</span>
                  <div className="text-white text-lg font-bold flex items-center gap-2">
                    <Briefcase size={18} className="text-[#C5A059]" />
                    {broker.propertySpecialization?.join(', ') || 'Residential Land / Luxury'}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold block mb-1">Active Portfolio</span>
                  <div className="text-white text-lg font-bold flex items-center gap-2">
                    <HomeIcon size={18} className="text-[#C5A059]" />
                    {agentListings.length} Active Listings
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mt-8">
                <Button className="bg-[#C5A059] text-black hover:bg-white px-8 h-12 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center gap-2" asChild>
                  <a href={`https://wa.me/${broker.whatsapp.replace(/\D/g,'')}?text=Hello%20${broker.fullName},%20I%20saw%20your%20AmaanEstate%20profile.`} target="_blank" rel="noopener noreferrer">
                    <MessageCircle size={16} /> WhatsApp Direct Chat
                  </a>
                </Button>
                <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 h-12 rounded-xl text-xs font-bold uppercase tracking-widest" asChild>
                  <a href={`tel:${broker.phone}`}>
                    <Phone size={14} className="mr-2" /> Call Agent
                  </a>
                </Button>
                <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 h-12 rounded-xl text-xs font-bold uppercase tracking-widest" asChild>
                  <a href={`mailto:${broker.email}`}>
                    <Mail size={14} className="mr-2" /> Send Email
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Listings Section */}
        <div>
          <h2 className="text-2xl font-display font-bold text-white mb-8 flex items-center gap-2">
            <HomeIcon className="text-[#C5A059]" size={24} />
            <span>Exclusive Listings By {broker.fullName}</span>
          </h2>
          
          {listingsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl h-80 animate-pulse" />
              ))}
            </div>
          ) : agentListings.length === 0 ? (
            <div className="text-center py-16 bg-white/[0.02] border border-white/5 rounded-[2rem]">
              <p className="text-white/40 text-sm uppercase tracking-widest font-bold">This agent currently has no active marketplace inventory listed.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {agentListings.map(listing => (
                <PropertyCard key={listing.id} property={listing as any} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
