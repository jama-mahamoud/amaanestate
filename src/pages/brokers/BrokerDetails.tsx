import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { brokerService } from '@/services/brokerService';
import { useListings } from '@/hooks/useListings';
import { Broker, Property } from '@/types';
import { ShieldCheck, MapPin, Building2, CheckCircle2, MessageCircle, Phone, Mail, Home as HomeIcon, Award, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PropertyCard from '@/components/PropertyCard';
import { motion } from 'motion/react';

export default function BrokerDetails() {
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
        // Since we don't have a direct getBrokerById in the stub right now, we find from all.
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
      <div className="min-h-screen bg-luxury-black flex items-center justify-center pt-24 pb-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Agent Not Found</h2>
          <Button asChild className="bg-[#C5A059] text-black">
            <Link to="/brokers">Back to Directory</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-black pt-24 pb-20">
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
                  
                  {broker.isVerified && (
                    <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg text-sm font-bold uppercase tracking-wider">
                      <ShieldCheck size={16} />
                      <span>Verified Request & Identity Checked</span>
                    </div>
                  )}
                </div>

                {/* Contact Actions */}
                <div className="flex flex-col gap-3 w-full md:w-auto">
                  <Button className="bg-emerald-600 hover:bg-emerald-500 text-white h-12 px-6 rounded-xl transition-all w-full md:w-auto" asChild>
                    <a href={`https://wa.me/${broker.whatsapp.replace(/\D/g,'')}?text=Hello%20${broker.fullName},%20I%20saw%20your%20profile%20on%20AmaanEstate`} target="_blank" rel="noopener noreferrer">
                      <MessageCircle size={18} className="mr-2" />
                      Chat on WhatsApp
                    </a>
                  </Button>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 h-12 px-6 rounded-xl transition-all w-full md:w-auto" asChild>
                    <a href={`tel:${broker.phone?.replace(/\D/g,'')}`}>
                      <Phone size={18} className="mr-2" />
                      Call {broker.phone}
                    </a>
                  </Button>
                </div>
              </div>

              {broker.bio && (
                <div className="mt-6 mb-2">
                  <h3 className="text-white/40 uppercase tracking-widest font-bold text-xs mb-2">About Appointed Agent</h3>
                  <p className="text-white/80 text-base leading-relaxed max-w-3xl">
                    {broker.bio}
                  </p>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/5">
                <div>
                  <span className="flex items-center gap-2 text-white/40 uppercase tracking-widest font-bold text-xs mb-1">
                    <Briefcase size={12} />
                    Experience
                  </span>
                  <p className="text-white text-xl font-semibold">{broker.yearsOfExperience} Years</p>
                </div>
                <div>
                  <span className="flex items-center gap-2 text-white/40 uppercase tracking-widest font-bold text-xs mb-1">
                    <MapPin size={12} />
                    Coverage
                  </span>
                  <p className="text-white text-xl font-semibold truncate" title={broker.areasOfOperation?.join(', ')}>{broker.areasOfOperation?.[0] || 'Regional'}</p>
                </div>
                <div>
                  <span className="flex items-center gap-2 text-white/40 uppercase tracking-widest font-bold text-xs mb-1">
                    <Award size={12} />
                    Specialties
                  </span>
                  <p className="text-white text-xl font-semibold truncate" title={broker.propertySpecialization?.join(', ')}>{broker.propertySpecialization?.[0] || 'All Types'}</p>
                </div>
                <div>
                  <span className="flex items-center gap-2 text-white/40 uppercase tracking-widest font-bold text-xs mb-1">
                    <HomeIcon size={12} />
                    Active Listings
                  </span>
                  <p className="text-white text-xl font-semibold">{broker.activeListingsCount || agentListings.length || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Listings Section */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-display font-bold text-white">
              Listings by <span className="text-[#C5A059]">{broker.fullName.split(' ')[0]}</span>
            </h2>
          </div>

          {listingsLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 rounded-full border-2 border-[#C5A059] border-t-transparent animate-spin"></div>
            </div>
          ) : agentListings.length === 0 ? (
            <div className="py-20 text-center bg-white/[0.02] border border-white/5 rounded-3xl">
              <HomeIcon size={48} className="mx-auto text-white/10 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Active Listings</h3>
              <p className="text-white/40">This agent currently doesn't have any published listings.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agentListings.map(listing => (
                <PropertyCard key={listing.id} property={listing as Property} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
