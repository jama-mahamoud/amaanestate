import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, Edit3, Trash2, Globe, ExternalLink,
  X, Save, Tag, Settings, Link as LinkIcon, DollarSign,
  Briefcase, Percent, Check, AlertCircle, ShoppingBag, Eye, EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { dealService, TechGearDeal } from '@/services/dealService';
import { techGearService, TechGearProduct } from '@/services/techGearService';
import { toast } from 'sonner';

const STOCK_IMAGE_PRESETS = [
  { name: 'SaaS / AI App', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800' },
  { name: 'Developer Tool', url: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&q=80&w=800' },
  { name: 'Luxury Hardware/Gear', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800' },
  { name: 'Creative Software', url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800' },
];

export default function DashboardDeals() {
  const [deals, setDeals] = useState<TechGearDeal[]>([]);
  const [products, setProducts] = useState<TechGearProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // View states: 'list', 'create', 'edit'
  const [viewState, setViewState] = useState<'list' | 'create' | 'edit'>('list');
  const [editingDeal, setEditingDeal] = useState<Partial<TechGearDeal> | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load both Deals and Tech Gear Products (for resolution/import helper)
      const dealsData = await dealService.getAllDeals(false);
      const productsData = await techGearService.getAllProducts(false);
      setDeals(dealsData);
      setProducts(productsData);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load Reviews content');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    const newDeal: Partial<TechGearDeal> = {
      dealTitle: '',
      productName: '',
      featuredImage: STOCK_IMAGE_PRESETS[0].url,
      category: 'Software Solutions',
      dealType: 'Lifetime Deal',
      originalPrice: 0,
      discountAmount: 0,
      dealPrice: 0,
      finalPrice: 0,
      promoCode: '',
      dealDescription: '',
      affiliateUrl: '',
      affiliateLink: '',
      status: 'published',
      badge: 'EXCLUSIVE',
      publishDate: new Date().toISOString().split('T')[0],
      publishedAt: new Date().toISOString(),
      productId: ''
    };
    setEditingDeal(newDeal);
    setViewState('create');
  };

  const handleEdit = (deal: TechGearDeal) => {
    // Fill all compatibility fields
    setEditingDeal({
      ...deal,
      finalPrice: deal.finalPrice || deal.dealPrice || 0,
      originalPrice: deal.originalPrice || 0,
      discountAmount: deal.discountAmount || 0,
      affiliateLink: deal.affiliateLink || deal.affiliateUrl || ''
    });
    setViewState('edit');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this promotional Deal? This cannot be undone.")) {
      try {
        await dealService.deleteDeal(id);
        toast.success("Deal deleted successfully");
        loadData();
      } catch (error) {
        toast.error("Failed to delete deal");
      }
    }
  };

  const toggleStatus = async (deal: TechGearDeal) => {
    const newStatus = deal.status === 'published' ? 'draft' : 'published';
    try {
      await dealService.updateDeal(deal.id, { 
        status: newStatus as any,
        publishedAt: newStatus === 'published' ? new Date().toISOString() : deal.publishedAt
      });
      toast.success(`Deal status set to ${newStatus}`);
      loadData();
    } catch (error) {
      toast.error("Failed to toggle deal status");
    }
  };

  const cancelEdit = () => {
    setViewState('list');
    setEditingDeal(null);
  };

  const filteredDeals = useMemo(() => {
    return deals.filter(d => {
      const titleMatches = d.dealTitle.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (d.productName || '').toLowerCase().includes(searchQuery.toLowerCase());
      if (statusFilter === 'all') return titleMatches;
      return titleMatches && d.status === statusFilter;
    });
  }, [deals, searchQuery, statusFilter]);

  // Statistics summaries
  const stats = useMemo(() => {
    return {
      total: deals.length,
      published: deals.filter(d => d.status === 'published').length,
      drafts: deals.filter(d => d.status === 'draft').length,
    };
  }, [deals]);

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto min-h-screen text-white rounded-3xl border border-white/5 shadow-2xl bg-[#07070a]">
      {/* Top Header Block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-display font-light text-white flex items-center gap-2">
            <Tag className="text-[#C5A059]" size={28} /> Reviews CMS
          </h1>
          <p className="text-white/40 text-xs uppercase tracking-widest font-mono mt-1">
            Publishing Desk • Sourcing & Campaign Syndication Panel
          </p>
        </div>
        
        {viewState === 'list' && (
          <Button 
            onClick={handleCreateNew}
            className="bg-[#C5A059] text-black hover:bg-white transition-colors h-12 px-6 rounded-xl font-bold tracking-widest uppercase text-[10px]"
          >
            <Plus size={16} className="mr-2" /> Publish New Campaign
          </Button>
        )}
      </div>

      {viewState === 'list' ? (
        <>
          {/* Statistics Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-[#0a0a0f] border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-[#C5A059]/20 transition-all">
              <span className="text-white/30 text-[10px] font-mono uppercase tracking-wider block">Total Campaigns Logged</span>
              <span className="text-3xl font-bold mt-2 block font-display">{stats.total}</span>
              <div className="absolute right-4 bottom-4 text-white/5 group-hover:scale-115 transition-transform"><ShoppingBag size={48} /></div>
            </div>
            <div className="bg-[#0a0a0f] border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/20 transition-all">
              <span className="text-white/30 text-[10px] font-mono uppercase tracking-wider block">Live on Homepage</span>
              <span className="text-3xl font-bold mt-2 text-emerald-400 block font-display">{stats.published}</span>
              <div className="absolute right-4 bottom-4 text-emerald-500/10 group-hover:scale-115 transition-transform"><Check size={48} /></div>
            </div>
            <div className="bg-[#0a0a0f] border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-amber-500/20 transition-all">
              <span className="text-white/30 text-[10px] font-mono uppercase tracking-wider block">Offline / Drafts</span>
              <span className="text-3xl font-bold mt-2 text-amber-500 block font-display">{stats.drafts}</span>
              <div className="absolute right-4 bottom-4 text-amber-500/10 group-hover:scale-115 transition-transform"><AlertCircle size={48} /></div>
            </div>
          </div>

          {/* List Views Filter Block */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
              <Input 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search deals by title or product name..."
                className="bg-white/[0.02] border-white/5 rounded-xl pl-11 h-12 text-white placeholder:text-white/20 select-all"
              />
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => setStatusFilter('all')} 
                className={`px-4 h-12 rounded-xl text-xs uppercase tracking-wider font-mono font-bold transition-all border ${
                  statusFilter === 'all' 
                    ? 'bg-[#C5A059] text-black border-[#C5A059]' 
                    : 'bg-transparent border-white/10 text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                All Statuses
              </button>
              <button 
                onClick={() => setStatusFilter('published')} 
                className={`px-4 h-12 rounded-xl text-xs uppercase tracking-wider font-mono font-bold transition-all border ${
                  statusFilter === 'published' 
                    ? 'bg-emerald-500 text-black border-emerald-500' 
                    : 'bg-transparent border-white/10 text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                Published
              </button>
              <button 
                onClick={() => setStatusFilter('draft')} 
                className={`px-4 h-12 rounded-xl text-xs uppercase tracking-wider font-mono font-bold transition-all border ${
                  statusFilter === 'draft' 
                    ? 'bg-amber-500 text-black border-amber-500' 
                    : 'bg-transparent border-white/10 text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                Drafts
              </button>
            </div>
          </div>

          {/* Table list representation */}
          {loading ? (
            <div className="py-20 flex justify-center items-center">
              <div className="w-10 h-10 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredDeals.length === 0 ? (
            <div className="py-20 text-center border border-white/5 rounded-3xl bg-white/[0.01]">
              <Tag size={40} className="mx-auto text-white/20 mb-4" />
              <h3 className="text-lg font-display font-medium text-white/60">No Deals Sourced</h3>
              <p className="text-white/30 text-xs mt-1">Sponsor, publish, or configure campaigns to populate this index.</p>
            </div>
          ) : (
            <div className="bg-[#0a0a0f] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] font-mono uppercase tracking-wider text-white/40 bg-white/[0.01]">
                      <th className="p-4 sm:p-5">Deal Image & Title</th>
                      <th className="p-4 sm:p-5">Linked Product</th>
                      <th className="p-4 sm:p-5">Financing Details</th>
                      <th className="p-4 sm:p-5">Status</th>
                      <th className="p-4 sm:p-5 text-right">Administrative Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-[13px]">
                    {filteredDeals.map(deal => (
                      <tr key={deal.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="p-4 sm:p-5 flex gap-4 min-w-[280px]">
                          <div className="w-16 aspect-video bg-neutral-900 border border-white/10 rounded-lg overflow-hidden shrink-0">
                            <img src={deal.featuredImage} alt={deal.dealTitle} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <div className="font-semibold text-white hover:text-[#C5A059] transition-colors">{deal.dealTitle}</div>
                            <div className="text-[10px] font-mono text-white/40 mt-1 uppercase tracking-wider flex items-center gap-1.5">
                              <span>ID: {deal.id}</span>
                              <span className="w-1 h-1 rounded-full bg-white/20" />
                              <span className="text-[#C5A059]/80 font-bold">{deal.dealType || 'Lifetime Deal'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 sm:p-5 text-white/60">
                          <div>{deal.productName || 'Direct Deal / Autonomous'}</div>
                          <div className="text-[10px] font-mono text-white/30 mt-0.5">{deal.category || 'General'}</div>
                        </td>
                        <td className="p-4 sm:p-5 font-mono">
                          <div className="flex items-center gap-2">
                            <span className="text-red-400 line-through">${deal.originalPrice || 0}</span>
                            <span className="text-emerald-400 font-bold">${deal.finalPrice || deal.dealPrice || 0}</span>
                          </div>
                          {deal.discountAmount && (
                            <div className="text-[10px] text-emerald-500/80 font-bold mt-1">Save -${deal.discountAmount}</div>
                          )}
                        </td>
                        <td className="p-4 sm:p-5">
                          <button 
                            onClick={() => toggleStatus(deal)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase cursor-pointer select-none transition-all ${
                              deal.status === 'published' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            }`}
                          >
                            {deal.status === 'published' ? <Eye size={10} /> : <EyeOff size={10} />}
                            {deal.status === 'published' ? 'Published' : 'Draft'}
                          </button>
                        </td>
                        <td className="p-4 sm:p-5 text-right font-mono text-xs">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => handleEdit(deal)}
                              className="w-8 h-8 hover:bg-[#C5A059] hover:text-black rounded-lg transition-colors border border-white/5"
                              title="Edit Registry"
                            >
                              <Edit3 size={13} />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => handleDelete(deal.id)}
                              className="w-8 h-8 hover:bg-red-600 hover:text-white rounded-lg transition-colors border border-white/5"
                              title="Revoke Offer"
                            >
                              <Trash2 size={13} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Form View Block */
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-[#0a0a0f] border border-white/5 rounded-3xl p-6 sm:p-8"
        >
          <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
            <h4 className="text-xl font-display font-medium text-white">
              {viewState === 'create' ? 'Define New Deal Campaign' : 'Edit Sourced Deal Details'}
            </h4>
            <Button size="icon" variant="ghost" className="hover:bg-white/5" onClick={cancelEdit}>
              <X size={20} />
            </Button>
          </div>

          {/* Prefill Helper selector */}
          {viewState === 'create' && products.length > 0 && (
            <div className="mb-6 p-4 rounded-xl bg-[#C5A059]/5 border border-[#C5A059]/10">
              <span className="text-xs text-[#C5A059] font-mono uppercase tracking-wider block mb-2 font-bold">Import Hardware Product Preset</span>
              <div className="flex flex-wrap gap-2">
                {products.slice(0, 8).map(prod => (
                  <button
                    key={prod.id} 
                    type="button"
                    onClick={() => {
                      setEditingDeal({
                        ...editingDeal,
                        productId: prod.id,
                        productName: prod.brandName ? `${prod.brandName} ${prod.title}` : prod.title,
                        featuredImage: prod.featuredImage,
                        originalPrice: prod.price || 0,
                        dealTitle: `Deal: ${prod.brandName || "Luxury"} ${prod.title} Promo`,
                        category: prod.category || 'Gear & Gadgets',
                        dealPrice: Math.round(prod.price * 0.85),
                        finalPrice: Math.round(prod.price * 0.85),
                        discountAmount: Math.round(prod.price * 0.15),
                        affiliateUrl: prod.affiliateUrl || '',
                        affiliateLink: prod.affiliateUrl || ''
                      });
                      toast.success(`Populated template with '${prod.title}'!`);
                    }}
                    className="px-3 py-1.5 bg-white/[0.02] border border-white/5 hover:border-[#C5A059]/40 hover:bg-[#C5A059]/10 rounded-lg text-xs font-mono font-medium transition-colors"
                  >
                    {prod.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={async (e) => {
            e.preventDefault();
            if (!editingDeal) return;
            
            // Standard Validation Check
            if (!editingDeal.dealTitle?.trim()) return toast.error("Deal Title is required");
            if (!editingDeal.productName?.trim()) return toast.error("Product Name is required");
            if (!editingDeal.featuredImage?.trim()) return toast.error("Featured Image is required");
            
            // Re-sync finalPrice and dealPrice
            const origPrice = Number(editingDeal.originalPrice || 0);
            const finalP = Number(editingDeal.finalPrice || editingDeal.dealPrice || 0);
            const discAmt = Number(editingDeal.discountAmount || 0);

            let calculatedPercentage: number | undefined = undefined;
            if (origPrice > 0) {
              calculatedPercentage = Math.round(((origPrice - finalP) / origPrice) * 100);
            }

            const payload: TechGearDeal = {
              ...editingDeal as TechGearDeal,
              originalPrice: origPrice,
              finalPrice: finalP,
              dealPrice: finalP,
              discountAmount: discAmt,
              discountPercentage: calculatedPercentage,
              affiliateUrl: editingDeal.affiliateLink || editingDeal.affiliateUrl || '',
              affiliateLink: editingDeal.affiliateLink || editingDeal.affiliateUrl || '',
              status: editingDeal.status || 'published',
              publishDate: editingDeal.publishDate || new Date().toISOString().split('T')[0],
              publishedAt: editingDeal.status === 'published' ? (editingDeal.publishedAt || new Date().toISOString()) : null
            };

            // Remove empty fields to avoid polluting database keys
            if (payload.productId === '') delete (payload as any).productId;

            try {
              if (viewState === 'create') {
                await dealService.createDeal(payload);
                toast.success("Deal published successfully!");
              } else {
                await dealService.updateDeal(payload.id, payload);
                toast.success("Deal updated inside CMS successfully");
              }
              cancelEdit();
              loadData();
            } catch (err) {
              console.error(err);
              toast.error("An error occurred during transaction. Call logs.");
            }
          }} className="space-y-6">
            {/* Grid Layout fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Box 1: Promotion Header */}
              <div className="space-y-4 md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-white/50 block font-mono">Review Title / Article Headline</label>
                <Input 
                  value={editingDeal?.dealTitle || ''}
                  onChange={e => setEditingDeal({ ...editingDeal, dealTitle: e.target.value })}
                  placeholder="e.g., Extensive Analysis: The New Premium Laptop Review"
                  className="bg-white/[0.02] border-white/5 focus:border-[#C5A059]/30 rounded-xl max-w-full select-all"
                />
              </div>

              {/* Box 2: Product Name */}
              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-wider text-white/50 block font-mono">Product Name</label>
                <Input 
                  value={editingDeal?.productName || ''}
                  onChange={e => setEditingDeal({ ...editingDeal, productName: e.target.value })}
                  placeholder="e.g., Apple iPhone 15 Pro Max (1TB, Gold)"
                  className="bg-white/[0.02] border-white/5 focus:border-[#C5A059]/30 rounded-xl"
                />
              </div>

              {/* Box 3: Category */}
              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-wider text-white/50 block font-mono">Category Channel</label>
                <select 
                  value={editingDeal?.category || 'Software Solutions'}
                  onChange={e => setEditingDeal({ ...editingDeal, category: e.target.value })}
                  className="w-full bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 focus:border-[#C5A059]/30 rounded-xl h-11 px-3 text-sm text-white focus:outline-none transition-colors font-mono cursor-pointer"
                >
                  <option value="Software Solutions">Software Solutions</option>
                  <option value="Enterprise SaaS">Enterprise SaaS</option>
                  <option value="Creative Technologies">Creative Technologies</option>
                  <option value="DevOps & Infrastructure">DevOps & Infrastructure</option>
                  <option value="Cloud AI Platforms">Cloud AI Platforms</option>
                  <option value="Gear & Gadgets">Gear & Gadgets</option>
                  <option value="Other Premium Services">Other Premium Services</option>
                </select>
              </div>

              {/* Box 4: Featured Image URL */}
              <div className="space-y-4 md:col-span-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/50 block font-mono">Featured Image URL</label>
                  <span className="text-[10px] text-white/40 font-mono">Preset shortcuts below</span>
                </div>
                <Input 
                  value={editingDeal?.featuredImage || ''}
                  onChange={e => setEditingDeal({ ...editingDeal, featuredImage: e.target.value })}
                  placeholder="Paste custom https://... image url here"
                  className="bg-white/[0.02] border-white/5 focus:border-[#C5A059]/30 rounded-xl select-all"
                />
                
                {/* Image presets helper */}
                <div className="flex gap-2.5 flex-wrap">
                  {STOCK_IMAGE_PRESETS.map((p, idx) => (
                    <button 
                      key={idx}
                      type="button"
                      onClick={() => setEditingDeal({ ...editingDeal, featuredImage: p.url })}
                      className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-1 select-none border border-white/5 hover:border-[#C5A059]/30 hover:bg-[#C5A059]/5 rounded bg-white/[0.01] transition-all"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>

                {editingDeal?.featuredImage && (
                  <div className="mt-3 w-48 aspect-video border border-white/10 rounded-xl overflow-hidden bg-neutral-900 shadow-md">
                    <img src={editingDeal.featuredImage} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Box 5: Deal Type */}
              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-wider text-white/50 block font-mono">Deal Type Model</label>
                <select 
                  value={editingDeal?.dealType || 'Lifetime Deal'}
                  onChange={e => setEditingDeal({ ...editingDeal, dealType: e.target.value })}
                  className="w-full bg-white/[0.02] border border-white/5 rounded-xl h-11 px-3 text-sm text-white focus:outline-none transition-colors font-mono cursor-pointer"
                >
                  <option value="Lifetime Deal">Lifetime Deal</option>
                  <option value="Annual Subscription">Annual Subscription</option>
                  <option value="Monthly Contract">Monthly Contract</option>
                  <option value="Promo Coupon & Gift">Promo Coupon & Gift</option>
                  <option value="Exclusive Group Pricing">Exclusive Group Pricing</option>
                </select>
              </div>

              {/* Box 6: Promo Code */}
              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-wider text-white/50 block font-mono">Promo Code (Optional)</label>
                <Input 
                  value={editingDeal?.promoCode || ''}
                  onChange={e => setEditingDeal({ ...editingDeal, promoCode: e.target.value })}
                  placeholder="e.g., PRIME888, SPRING20"
                  className="bg-white/[0.02] border-white/5 focus:border-[#C5A059]/30 rounded-xl uppercase font-mono"
                />
              </div>

              {/* Financial calculations */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:col-span-2 p-5 bg-white/[0.01] border border-white/5 rounded-2xl relative shadow-md">
                <div className="space-y-3">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/40 block">Original Standard Price ($)</label>
                  <div className="relative">
                    <DollarSign size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 font-mono" />
                    <Input 
                      type="number" 
                      value={editingDeal?.originalPrice || 0}
                      onChange={e => {
                        const origVal = Number(e.target.value);
                        const discVal = Number(editingDeal?.discountAmount || 0);
                        setEditingDeal({ 
                          ...editingDeal, 
                          originalPrice: origVal, 
                          finalPrice: Math.max(0, origVal - discVal),
                          dealPrice: Math.max(0, origVal - discVal) 
                        });
                      }}
                      className="bg-transparent border-white/15 focus:border-[#C5A059]/30 rounded-lg pl-8 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/40 block">Discount Value / Cut ($)</label>
                  <div className="relative">
                    <DollarSign size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 font-mono" />
                    <Input 
                      type="number" 
                      value={editingDeal?.discountAmount || 0}
                      onChange={e => {
                        const discVal = Number(e.target.value);
                        const origVal = Number(editingDeal?.originalPrice || 0);
                        setEditingDeal({ 
                          ...editingDeal, 
                          discountAmount: discVal, 
                          finalPrice: Math.max(0, origVal - discVal),
                          dealPrice: Math.max(0, origVal - discVal) 
                        });
                      }}
                      className="bg-transparent border-white/15 focus:border-[#C5A059]/30 rounded-lg pl-8 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#C5A059] block font-semibold">Authorized Campaign Price ($)</label>
                  <div className="relative font-mono font-bold">
                    <DollarSign size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C5A059]" />
                    <Input 
                      type="number" 
                      value={editingDeal?.finalPrice || editingDeal?.dealPrice || 0}
                      onChange={e => {
                        const finalVal = Number(e.target.value);
                        const origVal = Number(editingDeal?.originalPrice || 0);
                        setEditingDeal({ 
                          ...editingDeal, 
                          finalPrice: finalVal, 
                          dealPrice: finalVal,
                          discountAmount: Math.max(0, origVal - finalVal) 
                        });
                      }}
                      className="bg-transparent border-white/15 focus:border-[#C5A059]/30 rounded-lg pl-8 text-[#C5A059]"
                    />
                  </div>
                </div>
              </div>

              {/* Box 7: Affiliate Link */}
              <div className="space-y-4 md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-white/50 block font-mono">Affiliate Link / Check Price URI</label>
                <div className="relative">
                  <LinkIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                  <Input 
                    value={editingDeal?.affiliateLink || editingDeal?.affiliateUrl || ''}
                    onChange={e => setEditingDeal({ ...editingDeal, affiliateLink: e.target.value, affiliateUrl: e.target.value })}
                    placeholder="https://partner-portal.com/campaign-ref?aff_id=9481"
                    className="bg-white/[0.02] border-white/5 focus:border-[#C5A059]/30 rounded-xl pl-11 select-all"
                  />
                </div>
              </div>

              {/* Box 8: Description */}
              <div className="space-y-4 md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-white/50 block font-mono">Review Description / Sub-copy</label>
                <textarea 
                  value={editingDeal?.dealDescription || ''}
                  onChange={e => setEditingDeal({ ...editingDeal, dealDescription: e.target.value })}
                  placeholder="e.g. Experience professional performance with optimized workflow integrations, low cooling temperatures, and dedicated executive channels. Backed by authorized Somali software licensing."
                  rows={4}
                  className="w-full bg-white/[0.02] border border-white/5 focus:border-[#C5A059]/30 focus:ring-0 focus:outline-none rounded-xl p-4 text-white text-sm leading-relaxed"
                />
              </div>

              {/* Box 9: Deal status */}
              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-wider text-white/50 block font-mono">Status</label>
                <select 
                  value={editingDeal?.status || 'published'}
                  onChange={e => setEditingDeal({ ...editingDeal, status: e.target.value as any })}
                  className="w-full bg-white/[0.02] border border-white/5 rounded-xl h-11 px-3 text-sm text-white focus:outline-none transition-colors font-mono cursor-pointer"
                >
                  <option value="published">Published (Visible on Homepage)</option>
                  <option value="draft">Draft (Hidden)</option>
                </select>
              </div>

              {/* Box 10: Publish Date */}
              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-wider text-white/50 block font-mono">Publish Date</label>
                <Input 
                  type="date"
                  value={editingDeal?.publishDate || new Date().toISOString().split('T')[0]}
                  onChange={e => setEditingDeal({ ...editingDeal, publishDate: e.target.value })}
                  className="bg-white/[0.02] border-white/5 focus:border-[#C5A059]/30 rounded-xl text-white font-mono"
                />
              </div>

              {/* Badge overlay detail */}
              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-wider text-white/50 block font-mono font-bold">Badge Overlay text</label>
                <Input 
                  value={editingDeal?.badge || ''}
                  onChange={e => setEditingDeal({ ...editingDeal, badge: e.target.value })}
                  placeholder="e.g. HOT DEAL, 40% OFF, LIMITED"
                  className="bg-white/[0.02] border-white/5 focus:border-[#C5A059]/30 rounded-xl"
                />
              </div>

            </div>

            {/* Actions button strip */}
            <div className="flex gap-3 justify-end pt-6 border-t border-white/5 mt-8 font-mono">
              <Button 
                type="button" 
                variant="ghost" 
                className="hover:bg-white/5 text-white/60 hover:text-white rounded-xl h-12 px-6" 
                onClick={cancelEdit}
              >
                Discard Changes
              </Button>
              <Button 
                type="submit" 
                className="bg-[#C5A059] hover:bg-white text-black font-semibold h-12 px-8 rounded-xl shrink-0 flex items-center gap-2"
              >
                <Save size={16} /> Save Campaign Settings
              </Button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
}
