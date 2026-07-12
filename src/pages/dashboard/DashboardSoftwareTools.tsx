import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, Edit3, Trash2, Globe, Tag, ExternalLink,
  ChevronDown, X, Save, Eye, Package, LayoutGrid, Check, Settings, Image as ImageIcon, Link as LinkIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { softwareToolsService, SoftwareTool } from '@/services/softwareToolsService';
import { toast } from 'sonner';
import ImageUpload from '@/components/article/ImageUpload';
import GalleryUpload from '@/components/article/GalleryUpload';

export default function DashboardSoftwareTools() {
  const [items, setItems] = useState<SoftwareTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // View states: 'list', 'create', 'edit'
  const [viewState, setViewState] = useState<'list' | 'create' | 'edit'>('list');
  const [editingItem, setEditingItem] = useState<SoftwareTool | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await softwareToolsService.getAllSoftware(false);
      setItems(data);
    } catch (error) {
      toast.error('Failed to load software content');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    const newItem: Partial<SoftwareTool> = {
      name: '',
      developer: '',
      category: 'saas-platforms',
      platform: 'Web',
      shortDescription: '',
      fullDescription: '',
      features: [],
      pros: [],
      cons: [],
      pricing: '',
      officialWebsite: '',
      affiliateUrl: '',
      logoUrl: '',
      featuredImage: '',
      galleryImages: [],
      seoTitle: '',
      seoDescription: '',
      slug: '',
      status: 'draft',
      featured: false
    };
    setEditingItem(newItem as SoftwareTool);
    setViewState('create');
  };

  const handleEdit = (item: SoftwareTool) => {
    setEditingItem(item);
    setViewState('edit');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this software tool?")) {
      try {
        await softwareToolsService.deleteSoftware(id);
        toast.success("Successfully deleted");
        loadData();
      } catch (error) {
        toast.error("Failed to delete");
      }
    }
  };

  const cancelEdit = () => {
    setViewState('list');
    setEditingItem(null);
  };

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    return items.filter(i => 
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      i.developer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display font-medium tracking-tight text-white mb-1">
            Software & Tools CMS
          </h1>
          <p className="text-white/50 text-sm font-light">
            Manage SaaS platforms, desktop apps, and digital services
          </p>
        </div>
        
        {viewState === 'list' && (
          <Button 
            onClick={handleCreateNew}
            className="bg-[#C5A059] text-black hover:bg-white transition-colors h-12 px-6 rounded-xl font-bold tracking-widest uppercase text-[10px] shadow-lg shadow-[#C5A059]/10"
          >
            <Plus size={16} className="mr-2" /> Add Software Tool
          </Button>
        )}
      </div>

      {viewState === 'list' ? (
        <SoftwareListView 
          items={filteredItems} 
          loading={loading} 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <SoftwareFormView 
          item={editingItem!} 
          onCancel={cancelEdit}
          onSaved={() => {
            cancelEdit();
            loadData();
          }}
          isNew={viewState === 'create'}
        />
      )}
    </div>
  );
}

function SoftwareListView({ items, loading, searchQuery, setSearchQuery, onEdit, onDelete }: any) {
  return (
    <div className="space-y-6">
      <div className="glass-card bg-neutral-900 border border-white/5 rounded-2xl p-4 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          <Input 
            type="text"
            placeholder="Search software products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/50 border-white/10 text-white pl-12 h-12 rounded-xl focus:border-[#C5A059]/50"
          />
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center border border-white/5 rounded-2xl bg-white/[0.01]">
          <span className="text-white/30 uppercase tracking-widest text-[10px] font-bold animate-pulse">Loading Catalog...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="py-24 text-center border border-white/5 rounded-3xl bg-white/[0.01]">
          <Package className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/40 uppercase tracking-widest font-mono text-xs">No matching software found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 overflow-x-auto border border-white/5 rounded-2xl bg-black/20">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Product</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Developer</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Category</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Status</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any) => (
                <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden border border-white/10 shrink-0">
                      {item.logoUrl ? (
                         <img src={item.logoUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                         <Package size={16} className="text-white/20" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-white group-hover:text-[#C5A059] transition-colors flex items-center gap-2">
                        {item.name}
                        {item.featured && <span className="px-1.5 py-0.5 rounded-sm bg-[#C5A059]/10 text-[#C5A059] text-[8px] uppercase tracking-wider font-bold">Featured</span>}
                      </div>
                      <div className="text-xs text-white/40 font-mono mt-0.5">{item.slug}</div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-white/60">{item.developer || '-'}</td>
                  <td className="p-4 text-xs font-mono text-white/50">{item.category}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${
                      item.status === 'published' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                      'bg-white/5 text-white/60 border border-white/10'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => onEdit(item)} className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/10 rounded-lg">
                        <Edit3 size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)} className="h-8 w-8 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SoftwareFormView({ item, onCancel, onSaved, isNew }: any) {
  const [formData, setFormData] = useState<SoftwareTool>(item);
  const [saving, setSaving] = useState(false);
  const [validation, setValidation] = useState<string | null>(null);

  const handleChange = (field: keyof SoftwareTool, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.name) {
      setValidation("Software name is required.");
      return;
    }
    
    // Auto generate slug if none provided
    let finalSlug = formData.slug;
    if (!finalSlug && formData.name) {
      finalSlug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    setSaving(true);
    setValidation(null);
    try {
      const payload = { ...formData, slug: finalSlug };
      
      if (isNew) {
        await softwareToolsService.createSoftware(payload);
        toast.success("Software tool created successfully");
      } else {
        await softwareToolsService.updateSoftware(payload.id, payload);
        toast.success("Software tool updated successfully");
      }
      onSaved();
    } catch (error) {
      toast.error("An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  const handleListChange = (field: 'features' | 'pros' | 'cons', value: string) => {
    const list = value.split('\n').filter(s => s.trim());
    handleChange(field, list);
  };

  return (
    <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#0a0a0b]">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onCancel} className="text-white/40 hover:text-white rounded-xl h-10 w-10">
            <X size={18} />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-white">{isNew ? 'Create Software Profile' : `Edit: ${formData.name}`}</h2>
            <p className="text-xs text-white/40 font-mono mt-1">{isNew ? 'New Entry' : formData.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={onCancel} variant="ghost" className="text-white/60 hover:text-white">Cancel</Button>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-[#C5A059] text-black hover:bg-white transition-colors uppercase tracking-widest text-[10px] font-bold px-6 h-10 rounded-xl flex items-center gap-2"
          >
            {saving ? <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : <Save size={14} />}
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </div>
      
      {validation && (
         <div className="p-4 bg-red-500/10 border-b border-red-500/20 text-red-500 text-sm font-bold flex items-center gap-2">
           <X size={16} /> {validation}
         </div>
      )}

      <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Main Details (Left Col) */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 border-b border-white/5 pb-2">Core Identity</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/60 ml-1">Software Name</label>
                <Input value={formData.name} onChange={e => handleChange('name', e.target.value)} className="bg-black/50 border-white/10" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/60 ml-1">Developer / Company</label>
                <Input value={formData.developer} onChange={e => handleChange('developer', e.target.value)} className="bg-black/50 border-white/10" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/60 ml-1">Category Code</label>
                <Input value={formData.category} onChange={e => handleChange('category', e.target.value)} className="bg-black/50 border-white/10 font-mono text-xs" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/60 ml-1">Platform (e.g. Web, Mac, PC, SaaS)</label>
                <Input value={formData.platform} onChange={e => handleChange('platform', e.target.value)} className="bg-black/50 border-white/10" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 border-b border-white/5 pb-2">Content & Details</h3>
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/60 ml-1">Short Description (Excerpt)</label>
              <textarea 
                value={formData.shortDescription} 
                onChange={e => handleChange('shortDescription', e.target.value)} 
                className="w-full bg-black/50 border-white/10 border rounded-xl p-3 text-white text-sm focus:outline-none focus:border-[#C5A059]/50 min-h-[80px]" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/60 ml-1">Full Description</label>
              <textarea 
                value={formData.fullDescription} 
                onChange={e => handleChange('fullDescription', e.target.value)} 
                className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-[#C5A059]/50 min-h-[160px]" 
              />
            </div>
          </div>
          
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 border-b border-white/5 pb-2">Structured Value</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/60 ml-1">Features (One per line)</label>
                <textarea 
                  value={(formData.features || []).join('\n')} 
                  onChange={e => handleListChange('features', e.target.value)} 
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-[#C5A059]/50 min-h-[120px]" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/60 ml-1">Pros/Cons</label>
                <div className="flex gap-2">
                  <textarea 
                    placeholder="Pros (one per line)"
                    value={(formData.pros || []).join('\n')} 
                    onChange={e => handleListChange('pros', e.target.value)} 
                    className="flex-1 bg-black/50 border border-emerald-500/20 rounded-xl p-3 text-emerald-100 text-sm focus:outline-none focus:border-emerald-500/50 min-h-[120px]" 
                  />
                  <textarea 
                    placeholder="Cons (one per line)"
                    value={(formData.cons || []).join('\n')} 
                    onChange={e => handleListChange('cons', e.target.value)} 
                    className="flex-1 bg-black/50 border border-red-500/20 rounded-xl p-3 text-red-100 text-sm focus:outline-none focus:border-red-500/50 min-h-[120px]" 
                  />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Col Settings & Media */}
        <div className="space-y-8">
          
          <div className="glass-card bg-neutral-900 border border-white/5 rounded-2xl p-6 space-y-6">
             <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 border-b border-white/5 pb-2">Distribution</h3>
             
             <div className="space-y-2">
                <label className="text-xs font-bold text-white/60 ml-1">Status</label>
                <select 
                  value={formData.status}
                  onChange={e => handleChange('status', e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 h-12 text-white font-bold text-sm focus:outline-none focus:border-[#C5A059]"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
             </div>
             
             <div className="flex items-center justify-between p-4 bg-black/50 rounded-xl border border-white/5">
                <div>
                  <div className="font-bold text-sm text-white">Featured Profile</div>
                  <div className="text-xs text-white/40">Pin to home page</div>
                </div>
                <button 
                  onClick={() => handleChange('featured', !formData.featured)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${formData.featured ? 'bg-[#C5A059]' : 'bg-white/10'}`}
                >
                  <motion.div 
                    initial={false}
                    animate={{ x: formData.featured ? 24 : 2 }}
                    className="w-5 h-5 bg-white rounded-full absolute top-0.5"
                  />
                </button>
             </div>
          </div>

          <div className="glass-card bg-neutral-900 border border-white/5 rounded-2xl p-6 space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 border-b border-white/5 pb-2">Acquisition & Affiliate Details</h3>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/60 flex items-center gap-2 ml-1"><LinkIcon size={12} /> Partner Link (Affiliate)</label>
              <Input value={formData.affiliateUrl} onChange={e => handleChange('affiliateUrl', e.target.value)} className="bg-black/50 border-white/10 font-mono text-xs" />
              {formData.affiliateUrl && (
                <a href={formData.affiliateUrl} target="_blank" rel="noreferrer" className="text-[10px] text-blue-400 mt-1 inline-flex items-center hover:underline">
                  Test Link <ExternalLink size={10} className="ml-1" />
                </a>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/60 ml-1">Official Website</label>
              <Input value={formData.officialWebsite} onChange={e => handleChange('officialWebsite', e.target.value)} className="bg-black/50 border-white/10" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/60 ml-1">Pricing Model</label>
                <Input value={formData.pricing} onChange={e => handleChange('pricing', e.target.value)} placeholder="e.g. Free Tier, $20/mo" className="bg-black/50 border-white/10" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/60 ml-1">Pricing Tier</label>
                <select 
                  value={formData.pricingTier || 'Freemium'}
                  onChange={e => handleChange('pricingTier', e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 h-10 text-white text-xs focus:outline-none focus:border-[#C5A059]"
                >
                  <option value="Free">Free</option>
                  <option value="Freemium">Freemium</option>
                  <option value="Paid">Paid</option>
                  <option value="Subscription">Subscription</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/60 ml-1">Free Trial Available</label>
                <Input value={formData.freeTrialAvailable || ''} onChange={e => handleChange('freeTrialAvailable', e.target.value)} placeholder="e.g. Yes, 14 Days" className="bg-black/50 border-white/10 text-xs" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/60 ml-1">Commission Type</label>
                <select 
                  value={formData.affiliateCommissionType || 'percentage'}
                  onChange={e => handleChange('affiliateCommissionType', e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 h-10 text-white text-xs focus:outline-none focus:border-[#C5A059]"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Rate</option>
                  <option value="recurring">Recurring</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/60 ml-1">Commission Rate</label>
                <Input value={formData.commissionRate || ''} onChange={e => handleChange('commissionRate', e.target.value)} placeholder="e.g. 20% or $50" className="bg-black/50 border-white/10 text-xs" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/60 ml-1">Cookie Duration</label>
                <Input value={formData.cookieDuration || ''} onChange={e => handleChange('cookieDuration', e.target.value)} placeholder="e.g. 30 Days" className="bg-black/50 border-white/10 text-xs" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/60 ml-1">Affiliate Network</label>
              <Input value={formData.affiliateNetwork || ''} onChange={e => handleChange('affiliateNetwork', e.target.value)} placeholder="e.g. Impact, ShareASale, CJ" className="bg-black/50 border-white/10 text-xs" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/60 ml-1">Best For (Target Audience)</label>
              <Input value={formData.bestFor || ''} onChange={e => handleChange('bestFor', e.target.value)} placeholder="e.g. Video editors, creators" className="bg-black/50 border-white/10 text-xs" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/60 ml-1 flex justify-between">Alternative Products <span className="text-neutral-500 text-[10px] uppercase font-mono">(one per line)</span></label>
              <textarea 
                value={(formData.alternativeProducts || []).join('\n')} 
                onChange={e => {
                  const list = e.target.value.split('\n').filter(s => s.trim());
                  handleChange('alternativeProducts', list);
                }}
                placeholder="e.g. Canva&#10;InVideo"
                className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-[#C5A059]/50 min-h-[80px]" 
              />
            </div>
          </div>

          <div className="glass-card bg-neutral-900 border border-white/5 rounded-2xl p-6 space-y-6">
             <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 border-b border-white/5 pb-2">Media Assets</h3>
             
             <div className="space-y-2">
                <label className="text-xs font-bold text-white/60 ml-1">Software Logo</label>
                <ImageUpload 
                  value={formData.logoUrl} 
                  onChange={(url) => handleChange('logoUrl', url)} 
                  folder="software_logos" 
                />
             </div>

             <div className="space-y-2">
                <label className="text-xs font-bold text-white/60 ml-1">Featured Cover</label>
                <ImageUpload 
                  value={formData.featuredImage} 
                  onChange={(url) => handleChange('featuredImage', url)} 
                  folder="software_covers" 
                />
             </div>

             <div className="space-y-4 pt-4 border-t border-white/5">
                <label className="text-xs font-bold text-white/60 ml-1 flex justify-between">
                   Screenshot Gallery
                   <span className="text-[#C5A059] uppercase">{formData.galleryImages?.length || 0} Assets</span>
                </label>
                <GalleryUpload 
                  value={formData.galleryImages || []}
                  onChange={(urls) => handleChange('galleryImages', urls)}
                  folder="software_gallery"
                  label=""
                />
             </div>
          </div>

          <div className="glass-card bg-neutral-900 border border-white/5 rounded-2xl p-6 space-y-6">
             <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 border-b border-white/5 pb-2">SEO Tuning</h3>
             <div className="space-y-2">
              <label className="text-xs font-bold text-white/60 ml-1">URL Slug</label>
              <Input value={formData.slug} onChange={e => handleChange('slug', e.target.value)} placeholder="auto-generated-if-empty" className="bg-black/50 border-white/10 font-mono text-xs" />
             </div>
             <div className="space-y-2">
              <label className="text-xs font-bold text-white/60 ml-1">Meta Title</label>
              <Input value={formData.seoTitle} onChange={e => handleChange('seoTitle', e.target.value)} className="bg-black/50 border-white/10" />
             </div>
             <div className="space-y-2">
              <label className="text-xs font-bold text-white/60 ml-1">Meta Description</label>
              <textarea 
                value={formData.seoDescription} 
                onChange={e => handleChange('seoDescription', e.target.value)} 
                className="w-full bg-black/50 border-white/10 border rounded-xl p-3 text-white text-sm min-h-[80px]" 
              />
             </div>
          </div>

        </div>

      </div>
    </div>
  );
}

