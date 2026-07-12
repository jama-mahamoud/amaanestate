import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, Edit3, Trash2, Globe, ExternalLink,
  X, Save, Package, Settings, Link as LinkIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { techGearService, TechGearProduct } from '@/services/techGearService';
import { toast } from 'sonner';
import ImageUpload from '@/components/article/ImageUpload';
import GalleryUpload from '@/components/article/GalleryUpload';

export default function DashboardTechGear() {
  const [items, setItems] = useState<TechGearProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // View states: 'list', 'create', 'edit'
  const [viewState, setViewState] = useState<'list' | 'create' | 'edit'>('list');
  const [editingItem, setEditingItem] = useState<TechGearProduct | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await techGearService.getAllProducts(false); // get all including drafts
      setItems(data);
    } catch (error) {
      toast.error('Failed to load tech gear content');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    const newItem: Partial<TechGearProduct> = {
      brandName: '',
      title: '',
      model: '',
      category: 'smartphones',
      featuredImage: '',
      galleryImages: [],
      description: '',
      price: 0,
      specs: [],
      battery: '',
      dimensions: '',
      weight: '',
      colors: [],
      warranty: '',
      affiliateUrl: '',
      ctaText: 'Buy Now',
      seoTitle: '',
      seoDescription: '',
      status: 'draft',
      featured: false
    };
    setEditingItem(newItem as TechGearProduct);
    setViewState('create');
  };

  const handleEdit = (item: TechGearProduct) => {
    setEditingItem(item);
    setViewState('edit');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this hardware product?")) {
      try {
        await techGearService.deleteProduct(id);
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
      i.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      i.brandName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display font-medium tracking-tight text-white mb-1">
            Tech Gear CMS
          </h1>
          <p className="text-white/50 text-sm font-light">
            Manage physical hardware products, systems, and peripherals
          </p>
        </div>
        
        {viewState === 'list' && (
          <Button 
            onClick={handleCreateNew}
            className="bg-[#C5A059] text-black hover:bg-white transition-colors h-12 px-6 rounded-xl font-bold tracking-widest uppercase text-[10px] shadow-lg shadow-[#C5A059]/10"
          >
            <Plus size={16} className="mr-2" /> Add Hardware Product
          </Button>
        )}
      </div>

      {viewState === 'list' ? (
        <TechGearListView 
          items={filteredItems} 
          loading={loading} 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <TechGearFormView 
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

function TechGearListView({ items, loading, searchQuery, setSearchQuery, onEdit, onDelete }: any) {
  return (
    <div className="space-y-6">
      <div className="glass-card bg-neutral-900 border border-white/5 rounded-2xl p-4 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          <Input 
            type="text"
            placeholder="Search hardware catalog..."
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
          <p className="text-white/40 uppercase tracking-widest font-mono text-xs">No hardware product found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 overflow-x-auto border border-white/5 rounded-2xl bg-black/20">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Product</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Brand</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Category</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Price (MSRP)</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Status</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any) => (
                <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-12 h-8 rounded bg-white/5 flex items-center justify-center overflow-hidden border border-white/10 shrink-0">
                      {item.featuredImage ? (
                         <img src={item.featuredImage} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                         <Package size={14} className="text-white/20" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-white group-hover:text-[#C5A059] transition-colors flex items-center gap-2">
                        {item.title}
                        {item.featured && <span className="px-1.5 py-0.5 rounded-sm bg-[#C5A059]/10 text-[#C5A059] text-[8px] uppercase tracking-wider font-bold">Featured</span>}
                      </div>
                      <div className="text-xs text-white/40 font-mono mt-0.5">{item.model || 'No Model Data'}</div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-white/60 font-bold uppercase tracking-widest ">{item.brandName || '-'}</td>
                  <td className="p-4 text-xs font-mono text-white/50">{item.category}</td>
                  <td className="p-4 text-sm text-white/60 font-mono">${item.price || 0}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${
                      item.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
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

function TechGearFormView({ item, onCancel, onSaved, isNew }: any) {
  const [formData, setFormData] = useState<TechGearProduct>(item);
  const [saving, setSaving] = useState(false);
  const [validation, setValidation] = useState<string | null>(null);

  const handleChange = (field: keyof TechGearProduct, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.title || !formData.brandName) {
      setValidation("Product title and Brand name are required.");
      return;
    }

    setSaving(true);
    setValidation(null);
    try {
      const payload = { ...formData };
      
      if (isNew) {
        await techGearService.createProduct(payload);
        toast.success("Hardware product created successfully");
      } else {
        await techGearService.updateProduct(payload.id, payload);
        toast.success("Hardware product updated successfully");
      }
      onSaved();
    } catch (error) {
      toast.error("An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  const handleListChange = (field: 'colors', value: string) => {
    const list = value.split(',').map(s => s.trim()).filter(Boolean);
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
            <h2 className="text-xl font-bold text-white">{isNew ? 'New Hardware Profile' : `Edit: ${formData.title}`}</h2>
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
            {saving ? 'Saving...' : 'Save Product'}
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
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 border-b border-white/5 pb-2">Hardware Identification</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/60 ml-1">Product Title</label>
                <Input value={formData.title} onChange={e => handleChange('title', e.target.value)} className="bg-black/50 border-white/10" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/60 ml-1">Brand Manufacturer</label>
                <Input value={formData.brandName} onChange={e => handleChange('brandName', e.target.value)} className="bg-black/50 border-white/10" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/60 ml-1">Hardware Model No.</label>
                <Input value={formData.model || ''} onChange={e => handleChange('model', e.target.value)} className="bg-black/50 border-white/10 font-mono text-xs" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/60 ml-1">Category Domain</label>
                <select 
                  value={formData.category}
                  onChange={e => handleChange('category', e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 h-12 text-white text-sm focus:outline-none focus:border-[#C5A059]"
                >
                  <option value="smartphones">Smartphones & Communications</option>
                  <option value="laptops">Computing & Laptops</option>
                  <option value="wearables">Wearables & Smart Devices</option>
                  <option value="audio-gear">Audio Gear & Fidelity</option>
                  <option value="desktop-pcs">Desktop & Workstations</option>
                  <option value="components">PC Components</option>
                  <option value="accessories">Peripherals & Accessories</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 border-b border-white/5 pb-2">Description</h3>
            <div className="space-y-2">
              <textarea 
                value={formData.description} 
                onChange={e => handleChange('description', e.target.value)} 
                className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-[#C5A059]/50 min-h-[160px]" 
              />
            </div>
          </div>
          
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 border-b border-white/5 pb-2">Technical Specifications</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/60 ml-1">Price (MSRP)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">$</span>
                  <Input 
                    type="number"
                    value={formData.price} 
                    onChange={e => handleChange('price', parseFloat(e.target.value))} 
                    className="bg-black/50 border-white/10 pl-8 font-mono" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/60 ml-1">Warranty Term</label>
                <Input value={formData.warranty || ''} onChange={e => handleChange('warranty', e.target.value)} className="bg-black/50 border-white/10" placeholder="e.g. 1 Year Limited" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/60 ml-1">Battery</label>
                <Input value={formData.battery || ''} onChange={e => handleChange('battery', e.target.value)} className="bg-black/50 border-white/10" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/60 ml-1">Dimensions</label>
                <Input value={formData.dimensions || ''} onChange={e => handleChange('dimensions', e.target.value)} className="bg-black/50 border-white/10" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/60 ml-1">Weight</label>
                <Input value={formData.weight || ''} onChange={e => handleChange('weight', e.target.value)} className="bg-black/50 border-white/10" />
              </div>
            </div>

            <div className="space-y-2">
               <label className="text-xs font-bold text-white/60 ml-1">Available Colors (comma separated)</label>
               <Input value={(formData.colors || []).join(', ')} onChange={e => handleListChange('colors', e.target.value)} className="bg-black/50 border-white/10" />
            </div>

          </div>

        </div>

        {/* Right Col Settings & Media */}
        <div className="space-y-8">
          
          <div className="glass-card bg-neutral-900 border border-white/5 rounded-2xl p-6 space-y-6">
             <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 border-b border-white/5 pb-2">Catalog Alignment</h3>
             
             <div className="space-y-2">
                <label className="text-xs font-bold text-white/60 ml-1">Status</label>
                <select 
                  value={formData.status}
                  onChange={e => handleChange('status', e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 h-12 text-white font-bold text-sm focus:outline-none focus:border-[#C5A059]"
                >
                  <option value="draft">Draft</option>
                  <option value="approved">Published</option>
                  <option value="archived">Archived</option>
                </select>
             </div>
             
             <div className="flex items-center justify-between p-4 bg-black/50 rounded-xl border border-white/5">
                <div>
                  <div className="font-bold text-sm text-white">Featured Hardware</div>
                  <div className="text-xs text-white/40">Pin to showcase section</div>
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
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 border-b border-white/5 pb-2">Retail Integration</h3>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/60 flex items-center gap-2 ml-1"><LinkIcon size={12} /> Retail URL</label>
              <Input value={formData.affiliateUrl || ''} onChange={e => handleChange('affiliateUrl', e.target.value)} className="bg-black/50 border-white/10 font-mono text-xs" />
              {formData.affiliateUrl && (
                <a href={formData.affiliateUrl} target="_blank" rel="noreferrer text-[10px] text-blue-400 mt-1 inline-flex items-center hover:underline">
                  Launch Preview <ExternalLink size={10} className="ml-1" />
                </a>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/60 ml-1">Button CTA Text</label>
              <Input value={formData.ctaText || 'Buy Now'} onChange={e => handleChange('ctaText', e.target.value)} className="bg-black/50 border-white/10" />
            </div>
          </div>

          <div className="glass-card bg-neutral-900 border border-white/5 rounded-2xl p-6 space-y-6">
             <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 border-b border-white/5 pb-2">Visual Media</h3>
             
             <div className="space-y-2">
                <label className="text-xs font-bold text-white/60 ml-1 flex justify-between">
                   Main Featured Image
                   <span className="text-white/30 uppercase">Primary</span>
                </label>
                <ImageUpload 
                  value={formData.featuredImage} 
                  onChange={(url) => handleChange('featuredImage', url)} 
                  folder="tech_gear" 
                />
             </div>

             <div className="space-y-4 pt-4 border-t border-white/5">
                <label className="text-xs font-bold text-white/60 ml-1 flex justify-between">
                   Supplementary Gallery Upload
                   <span className="text-[#C5A059] uppercase">{formData.galleryImages?.length || 0} Assets</span>
                </label>
                
                <GalleryUpload 
                  value={formData.galleryImages || []}
                  onChange={(urls) => handleChange('galleryImages', urls)}
                  folder="tech_gear_gallery"
                  label=""
                />
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
