import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { useListings } from '@/hooks/useListings';
import PropertyCard from '@/components/PropertyCard';
import LatestNews from '@/components/LatestNews';
import { Property } from '@/types';
import { Loader2 } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

export default function Home() {
  const { listings: featuredListings, loading: listingsLoading } = useListings({ category: 'property', limit: 6 });
  const { t } = useSettings();

  return (
    <div className="min-h-screen bg-luxury-black text-white">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-luxury-black via-luxury-black/90 to-luxury-gold/5"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-display font-bold mb-6 tracking-tight"
          >
            Amaan<span className="text-luxury-gold">Estate</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-white/60 mb-10 max-w-2xl mx-auto"
          >
            The Premier Gateway to Verified Real Estate, High-End Mobility, and Professional Intelligence in the Somali Region.
          </motion.p>
          <Button asChild size="lg" className="bg-luxury-gold text-luxury-black font-bold h-14 px-10 rounded-xl">
              <Link to="/properties">{t('Browse Properties')}</Link>
          </Button>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 bg-luxury-black/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-display font-bold text-white mb-12">Featured Listings</h2>
          {listingsLoading ? (
             <div className="flex justify-center py-12"><Loader2 className="animate-spin text-luxury-gold" size={40} /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredListings.map(prop => <PropertyCard key={prop.id} property={prop as Property} />)}
            </div>
          )}
        </div>
      </section>

      {/* Trust & CTA */}
      <LatestNews />
      
      <section className="py-20 bg-luxury-charcoal/20">
         <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-display font-bold text-white mb-6">Why Choose AmaanEstate?</h2>
            <p className="text-white/60 mb-12 max-w-xl mx-auto">We bring trust, speed, and verification to real estate transactions in the Somali Region.</p>
            <Button asChild className="bg-luxury-gold text-luxury-black font-bold px-8 py-4 rounded-xl">
                <Link to="/contact">Get in Touch</Link>
            </Button>
         </div>
      </section>
    </div>
  );
}
