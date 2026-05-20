import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Edit3, Trash2, Eye, Car, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'motion/react';
import { listingService } from '@/services/listingService';
import { useAuth } from '@/contexts/AuthContext';
import { VehicleListing } from '@/types';
import DashboardEmptyState from '@/components/DashboardEmptyState';
import ListingCreationModal from '@/components/listing/ListingCreationModal';
import { formatPrice } from '@/lib/utils';

export default function DashboardVehicles() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<VehicleListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleListing | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadUserVehicles = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await listingService.getUserListings(user.uid, 'vehicle', 50, profile?.role);
      setVehicles(data as VehicleListing[]);
    } catch (err: any) {
      setError(err.message || 'Failed to load fleet');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadUserVehicles();
    }
  }, [user, profile]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Waa hubaal miyaa inaad delete garayso listing-kan?')) {
      const success = await listingService.deleteListing(id);
      if (success) {
        loadUserVehicles();
      } else {
        alert('Delete failed. Verify permissions or try again.');
      }
    }
  };

  const filteredVehicles = vehicles.filter(v => 
    v.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    v.subcategory?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayPrice = (price: number, currency?: string) => {
    return formatPrice(price, currency);
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h1 className="text-4xl font-display font-bold mb-2 tracking-tight">Mobility <span className="text-white/20">Inventory</span></h1>
          <p className="text-white/20 text-xs font-bold uppercase tracking-[0.3em]">Vehicle Fleet Management Protocal</p>
        </div>
        <Button 
          onClick={() => {
            setSelectedVehicle(null);
            setIsModalOpen(true);
          }}
          className="bg-luxury-gold text-luxury-black hover:bg-white h-16 px-10 rounded-[2rem] font-bold shadow-2xl shadow-luxury-gold/20 transition-all duration-500 hover:-translate-y-1"
        >
          <Plus size={20} className="mr-3" /> Catalog New Unit
        </Button>
      </div>

      <ListingCreationModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedVehicle(null);
        }}
        category="vehicle"
        onSuccess={loadUserVehicles}
        listingToEdit={selectedVehicle}
      />

      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative flex-1 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-luxury-gold transition-colors" size={20} />
          <Input 
            placeholder="Search vehicle registry..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white/5 border-0 h-16 pl-16 rounded-2xl text-white placeholder:text-white/10 text-lg focus-visible:ring-luxury-gold/30" 
          />
        </div>
        <Button variant="outline" className="border-white/5 bg-white/5 text-white h-16 px-8 rounded-2xl hover:bg-luxury-gold hover:text-luxury-black transition-all duration-500 font-bold uppercase tracking-widest text-[10px]">
          <Filter size={18} className="mr-3" /> Fleet Tags
        </Button>
      </div>

      <div className="glass-card rounded-[3.5rem] overflow-hidden relative shadow-2xl min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 animate-pulse">
            <Loader2 className="w-12 h-12 text-luxury-gold animate-spin mb-4" />
            <p className="text-white/20 text-[10px] uppercase font-bold tracking-[0.3em]">Querying Mobile Asset Inventory...</p>
          </div>
        ) : vehicles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Unit Designation</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Lifecycle</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Valuation</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredVehicles.map((vehicle, i) => (
                  <motion.tr 
                    key={vehicle.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group hover:bg-white/[0.02] transition-all duration-500"
                  >
                    <td className="p-8">
                      <div className="flex items-center gap-6">
                         <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-500 overflow-hidden">
                            {vehicle.images?.[0] ? (
                              <img src={vehicle.images[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Car size={24} className="text-luxury-gold opacity-40 group-hover:opacity-100 transition-opacity" />
                            )}
                         </div>
                         <div>
                            <p className="text-lg font-display font-bold text-white group-hover:text-luxury-gold transition-colors">{vehicle.title}</p>
                            <p className="text-white/20 text-[10px] uppercase font-bold tracking-widest">{vehicle.subcategory}</p>
                         </div>
                      </div>
                    </td>
                    <td className="p-8">
                      <div className="flex items-center gap-3">
                         <div className={`w-1.5 h-1.5 rounded-full ${
                           vehicle.status === 'active' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 
                           vehicle.status === 'pending' ? 'bg-luxury-gold shadow-[0_0_10px_rgba(212,175,55,0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                         }`} />
                         <span className="text-[10px] uppercase font-black tracking-widest text-white/40">{vehicle.status}</span>
                      </div>
                    </td>
                    <td className="p-8">
                      <p className="text-lg font-display font-bold text-white tabular-nums">{displayPrice(vehicle.price, vehicle.currency)}</p>
                    </td>
                    <td className="p-8 text-right">
                      <div className="flex items-center justify-end gap-3 md:opacity-20 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="w-10 h-10 rounded-xl hover:bg-white/10 hover:text-white"
                          onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                          title="View"
                        >
                          <Eye size={18} />
                        </Button>
                        
                        {(() => {
                          const currentUser = {
                            uid: user?.uid,
                            role: profile?.role
                          };
                          const canEdit =
                            currentUser?.role === 'admin' ||
                            vehicle.ownerId === currentUser?.uid ||
                            vehicle.createdBy === currentUser?.uid;

                          if (canEdit) {
                            return (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="w-10 h-10 rounded-xl hover:bg-white/10 hover:text-luxury-gold"
                                  onClick={() => {
                                    setSelectedVehicle(vehicle);
                                    setIsModalOpen(true);
                                  }}
                                  title="Edit"
                                >
                                  <Edit3 size={18} />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="w-10 h-10 rounded-xl hover:bg-destructive/10 hover:text-destructive"
                                  onClick={() => handleDelete(vehicle.id)}
                                  title="Delete"
                                >
                                  <Trash2 size={18} />
                                </Button>
                              </>
                            );
                          } else {
                            return (
                              <span className="text-[10px] uppercase font-bold tracking-widest text-[#FF4444] bg-[#FF4444]/10 border border-[#FF4444]/20 px-3 py-1.5 rounded-lg">
                                Access Restricted
                              </span>
                            );
                          }
                        })()}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <DashboardEmptyState 
            title="Fleet Registry Ready" 
            description={error ? "Our mobility registry is temporarily indisposed." : "The mobility database is initialized and ready for input. Catalog the first unit to begin tracking."} 
            actionLabel="Catalog New Unit"
            onAction={() => setIsModalOpen(true)}
            icon={<Car size={48} />}
          />
        )}
      </div>
    </div>
  );
}
