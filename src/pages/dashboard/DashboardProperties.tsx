import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function DashboardProperties() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold mb-2">My <span className="text-white/40">Properties</span></h1>
          <p className="text-white/40 font-medium">Manage and monitor your real estate portfolio.</p>
        </div>
        <Button className="bg-luxury-gold text-luxury-black hover:bg-white h-14 px-8 rounded-2xl font-bold">
          <Plus size={20} className="mr-2" /> Add Property
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-luxury-gold transition-colors" size={18} />
          <Input placeholder="Filter your listings..." className="bg-luxury-charcoal/40 border-white/5 h-14 pl-12 rounded-2xl text-white placeholder:text-white/20" />
        </div>
        <Button variant="outline" className="border-white/10 text-white h-14 px-6 rounded-2xl hover:bg-white/5">
          <Filter size={18} className="mr-2" /> Filters
        </Button>
      </div>

      <div className="h-96 w-full rounded-[3rem] border border-white/5 bg-luxury-charcoal/20 flex flex-col items-center justify-center text-center p-10">
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 text-white/20">
          <Plus size={40} />
        </div>
        <h3 className="text-2xl font-display font-bold text-white mb-2">No Active Listings</h3>
        <p className="text-white/40 max-w-xs mb-8">You haven't added any properties to your portfolio yet. Begin by adding your first luxury listing.</p>
        <Button className="bg-white/5 text-white hover:bg-white/10 font-bold h-12 px-8 rounded-xl border border-white/10">
          Add Listing
        </Button>
      </div>
    </div>
  );
}
