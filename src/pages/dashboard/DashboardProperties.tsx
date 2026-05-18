import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit3, Trash2, Eye, MapPin, Building2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'motion/react';
import { listingService } from '@/services/listingService';
import { useAuth } from '@/contexts/AuthContext';
import { Property } from '@/types';
import DashboardEmptyState from '@/components/DashboardEmptyState';
import ListingCreationModal from '@/components/listing/ListingCreationModal';

export default function DashboardProperties() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadUserProperties = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await listingService.getUserListings(user.uid, 'property');
      setProperties(data as Property[]);
    } catch (err: any) {
      setError(err.message || 'Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserProperties();
  }, [user]);

  const filteredProperties = properties.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.subcategory?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h1 className="text-4xl font-display font-bold mb-2 tracking-tight">Property <span className="text-white/20">Portfolio</span></h1>
          <p className="text-white/20 text-xs font-bold uppercase tracking-[0.3em]">Asset Management & Global Distribution</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-luxury-gold text-luxury-black hover:bg-white h-16 px-10 rounded-[2rem] font-bold shadow-2xl shadow-luxury-gold/20 transition-all duration-500 hover:-translate-y-1"
        >
          <Plus size={20} className="mr-3" /> Initialize Listing
        </Button>
      </div>

      <ListingCreationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category="property"
        onSuccess={loadUserProperties}
      />

      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative flex-1 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-luxury-gold transition-colors" size={20} />
          <Input 
            placeholder="Query portfolio database..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white/5 border-0 h-16 pl-16 rounded-2xl text-white placeholder:text-white/10 text-lg focus-visible:ring-luxury-gold/30" 
          />
        </div>
        <Button variant="outline" className="border-white/5 bg-white/5 text-white h-16 px-8 rounded-2xl hover:bg-luxury-gold hover:text-luxury-black transition-all duration-500 font-bold uppercase tracking-widest text-[10px]">
          <Filter size={18} className="mr-3" /> Parameters
        </Button>
      </div>

      <div className="glass-card rounded-[3.5rem] overflow-hidden relative shadow-2xl min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 animate-pulse">
            <Loader2 className="w-12 h-12 text-luxury-gold animate-spin mb-4" />
            <p className="text-white/20 text-[10px] uppercase font-bold tracking-[0.3em]">Querying Global Asset Registry...</p>
          </div>
        ) : properties.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Asset Description</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Status</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Value</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProperties.map((property, i) => (
                  <motion.tr 
                    key={property.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group hover:bg-white/[0.02] transition-all duration-500"
                  >
                    <td className="p-8">
                      <div className="flex items-center gap-6">
                         <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-500 overflow-hidden">
                            {property.images?.[0] ? (
                              <img src={property.images[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Building2 size={24} className="text-luxury-gold opacity-40 group-hover:opacity-100 transition-opacity" />
                            )}
                         </div>
                         <div>
                            <p className="text-lg font-display font-bold text-white mb-1 group-hover:text-luxury-gold transition-colors">{property.title}</p>
                            <div className="flex items-center gap-2 text-white/20 text-[10px] font-bold uppercase tracking-widest">
                               <MapPin size={10} className="text-luxury-gold" /> {property.city}
                            </div>
                         </div>
                      </div>
                    </td>
                    <td className="p-8">
                      <div className="flex items-center gap-3">
                         <div className={`w-1.5 h-1.5 rounded-full ${
                           property.status === 'active' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 
                           property.status === 'pending' ? 'bg-luxury-gold shadow-[0_0_10px_rgba(212,175,55,0.5)]' : 'bg-white/20'
                         }`} />
                         <span className="text-[10px] uppercase font-black tracking-widest text-white/40">{property.status}</span>
                      </div>
                    </td>
                    <td className="p-8">
                      <p className="text-lg font-display font-bold text-white tabular-nums">{displayPrice(property.price)}</p>
                    </td>
                    <td className="p-8 text-right">
                      <div className="flex items-center justify-end gap-3 md:opacity-20 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-white/10 hover:text-white"><Eye size={18} /></Button>
                        <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-white/10 hover:text-luxury-gold"><Edit3 size={18} /></Button>
                        <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-destructive/10 hover:text-destructive"><Trash2 size={18} /></Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <DashboardEmptyState 
            title="Portfolio Initialized" 
            description={error ? "Our asset registry database is temporarily indisposed." : "The asset registry is currently awaiting the first structural input. Begin by initializing a new estate log."} 
            actionLabel="Initialize Listing"
            onAction={() => setIsModalOpen(true)}
            icon={<Building2 size={48} />}
          />
        )}
      </div>
    </div>
  );
}
