import { Plus, Search, Filter, Edit3, Trash2, Eye, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'motion/react';

import DashboardEmptyState from '@/components/DashboardEmptyState';

const MOCK_VEHICLES: any[] = [];

export default function DashboardVehicles() {
  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h1 className="text-4xl font-display font-bold mb-2 tracking-tight">Mobility <span className="text-white/20">Inventory</span></h1>
          <p className="text-white/20 text-xs font-bold uppercase tracking-[0.3em]">Vehicle Fleet Management Protocal</p>
        </div>
        <Button className="bg-luxury-gold text-luxury-black hover:bg-white h-16 px-10 rounded-[2rem] font-bold shadow-2xl shadow-luxury-gold/20 transition-all duration-500 hover:-translate-y-1">
          <Plus size={20} className="mr-3" /> Catalog New Unit
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative flex-1 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-luxury-gold transition-colors" size={20} />
          <Input 
            placeholder="Search vehicle registry..." 
            className="bg-white/5 border-0 h-16 pl-16 rounded-2xl text-white placeholder:text-white/10 text-lg focus-visible:ring-luxury-gold/30" 
          />
        </div>
        <Button variant="outline" className="border-white/5 bg-white/5 text-white h-16 px-8 rounded-2xl hover:bg-luxury-gold hover:text-luxury-black transition-all duration-500 font-bold uppercase tracking-widest text-[10px]">
          <Filter size={18} className="mr-3" /> Fleet Tags
        </Button>
      </div>

      <div className="glass-card rounded-[3.5rem] overflow-hidden relative shadow-2xl">
        {MOCK_VEHICLES.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Unit Designation</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Lifecycle</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Valuation</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Visibility</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {MOCK_VEHICLES.map((vehicle, i) => (
                  <motion.tr 
                    key={vehicle.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group hover:bg-white/[0.02] transition-all duration-500"
                  >
                    <td className="p-8">
                      <div className="flex items-center gap-6">
                         <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-500">
                            <Car size={24} className="text-luxury-gold opacity-40 group-hover:opacity-100 transition-opacity" />
                         </div>
                         <div>
                            <p className="text-lg font-display font-bold text-white group-hover:text-luxury-gold transition-colors">{vehicle.name}</p>
                         </div>
                      </div>
                    </td>
                    <td className="p-8">
                      <div className="flex items-center gap-3">
                         <div className={`w-1.5 h-1.5 rounded-full ${
                           vehicle.status === 'Published' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                         }`} />
                         <span className="text-[10px] uppercase font-black tracking-widest text-white/40">{vehicle.status}</span>
                      </div>
                    </td>
                    <td className="p-8">
                      <p className="text-lg font-display font-bold text-white tabular-nums">{vehicle.price}</p>
                    </td>
                    <td className="p-8">
                       <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1">Global Views</p>
                       <p className="text-sm font-bold text-white tabular-nums">{vehicle.views}</p>
                    </td>
                    <td className="p-8 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-20 group-hover:opacity-100 transition-opacity">
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
            title="Fleet Registry Ready" 
            description="The mobility database is initialized and ready for input. Catalog the first unit to begin tracking." 
            actionLabel="Catalog New Unit"
            onAction={() => console.log('Init Vehicle')}
            icon={<Car size={48} />}
          />
        )}
      </div>
    </div>
  );
}
