import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, Edit3, Trash2, Globe, ExternalLink,
  X, Save, Package, Settings, Link as LinkIcon, Check
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
  const [formData, setFormData] = useState<TechGearProduct>({
    ...item,
    specs: item.specs || [],
    pros: item.pros || [],
    cons: item.cons || [],
    retailOffers: item.retailOffers || [],
    compareWithIds: item.compareWithIds || [],
    galleryImages: item.galleryImages || []
  });
  const [saving, setSaving] = useState(false);
  const [validation, setValidation] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'editorial' | 'affiliate' | 'media_seo'>('profile');
  const [allProductsList, setAllProductsList] = useState<TechGearProduct[]>([]);

  // Helpers for custom lists
  const [newSpecName, setNewSpecName] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');
  
  const [newPro, setNewPro] = useState('');
  const [newCon, setNewCon] = useState('');

  // Retail Offers Helper state
  const [offerRetailer, setOfferRetailer] = useState('');
  const [offerUrl, setOfferUrl] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [offerDiscount, setOfferDiscount] = useState('');
  const [offerAvailability, setOfferAvailability] = useState('In Stock');
  const [offerCta, setOfferCta] = useState('Buy Now');

  useEffect(() => {
    async function loadAllProducts() {
      try {
        const prodData = await techGearService.getAllProducts(false);
        setAllProductsList(prodData.filter(x => x.id !== formData.id));
      } catch (e) {
        console.error('Failed to load products for comparison', e);
      }
    }
    loadAllProducts();
  }, [formData.id]);

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

  // Specs helpers
  const addCustomSpec = () => {
    if (newSpecName && newSpecValue) {
      const updated = [...(formData.specs || [])];
      updated.push({ name: newSpecName, value: newSpecValue });
      handleChange('specs', updated);
      setNewSpecName('');
      setNewSpecValue('');
    }
  };

  const removeCustomSpec = (idx: number) => {
    const updated = [...(formData.specs || [])];
    updated.splice(idx, 1);
    handleChange('specs', updated);
  };

  // Pros/cons helpers
  const addPro = () => {
    if (newPro) {
      const updated = [...(formData.pros || [])];
      updated.push(newPro);
      handleChange('pros', updated);
      setNewPro('');
    }
  };

  const removePro = (idx: number) => {
    const updated = [...(formData.pros || [])];
    updated.splice(idx, 1);
    handleChange('pros', updated);
  };

  const addCon = () => {
    if (newCon) {
      const updated = [...(formData.cons || [])];
      updated.push(newCon);
      handleChange('cons', updated);
      setNewCon('');
    }
  };

  const removeCon = (idx: number) => {
    const updated = [...(formData.cons || [])];
    updated.splice(idx, 1);
    handleChange('cons', updated);
  };

  // Affiliate Retail Offer helpers
  const addRetailOffer = () => {
    if (offerRetailer && offerUrl && offerPrice) {
      const updated = [...(formData.retailOffers || [])];
      updated.push({
        retailerName: offerRetailer,
        affiliateUrl: offerUrl,
        price: offerPrice,
        discount: offerDiscount || undefined,
        availability: offerAvailability,
        ctaText: offerCta
      });
      handleChange('retailOffers', updated);
      setOfferRetailer('');
      setOfferUrl('');
      setOfferPrice('');
      setOfferDiscount('');
      setOfferAvailability('In Stock');
      setOfferCta('Buy Now');
    } else {
      toast.error("Retailer name, Offer URL, and Price are required.");
    }
  };

  const removeRetailOffer = (idx: number) => {
    const updated = [...(formData.retailOffers || [])];
    updated.splice(idx, 1);
    handleChange('retailOffers', updated);
  };

  // Alternatives / Comparison list handler
  const toggleCompareProduct = (id: string) => {
    const list = [...(formData.compareWithIds || [])];
    if (list.includes(id)) {
      handleChange('compareWithIds', list.filter(x => x !== id));
    } else {
      if (list.length >= 3) {
        toast.warning("Comparison linking is limited to a maximum of 3 products.");
        return;
      }
      list.push(id);
      handleChange('compareWithIds', list);
    }
  };

  return (
    <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
      {/* CMS Form Header */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between p-6 border-b border-white/5 bg-[#0a0a0b] gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onCancel} className="text-white/40 hover:text-white rounded-xl h-10 w-10">
            <X size={18} />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-white">{isNew ? 'New Premium Hardware Review Profile' : `Edit: ${formData.title}`}</h2>
            <p className="text-xs text-white/40 font-mono mt-1">{isNew ? 'New System Entry' : `ID: ${formData.id}`}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 justify-end">
          <Button onClick={onCancel} variant="ghost" className="text-white/60 hover:text-white text-xs uppercase font-bold tracking-wider">Cancel</Button>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-[#C5A059] text-black hover:bg-white transition-colors uppercase tracking-widest text-[10px] font-bold px-6 h-10 rounded-xl flex items-center gap-2"
          >
            {saving ? <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : <Save size={14} />}
            {saving ? 'Saving Specs...' : 'Save Catalog Profile'}
          </Button>
        </div>
      </div>

      {/* Premium Tab Bar */}
      <div className="flex flex-wrap border-b border-white/5 bg-[#0e0e11] px-6 py-2.5 gap-2">
        {[
          { id: 'profile', label: '1. Hardware Profile' },
          { id: 'editorial', label: '2. Editorial & Evaluation' },
          { id: 'affiliate', label: '3. Affiliate & Retail' },
          { id: 'media_seo', label: '4. Media & SEO Management' },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded-lg border ${
              activeTab === tab.id
                ? 'bg-[#C5A059]/10 border-[#C5A059]/30 text-[#C5A059]'
                : 'border-transparent text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {validation && (
         <div className="p-4 bg-red-500/10 border-b border-red-500/20 text-red-500 text-sm font-bold flex items-center gap-2">
           <X size={16} /> {validation}
         </div>
      )}

      {/* Scrollable Form Content */}
      <div className="p-6 md:p-10 min-h-[500px]">
        {activeTab === 'profile' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Identification parameters */}
            <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#C5A059] border-b border-[#C5A059]/20 pb-2">Hardware Identification</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/60 ml-1">Product Title</label>
                  <Input value={formData.title} onChange={e => handleChange('title', e.target.value)} className="bg-black/50 border-white/10" placeholder="e.g. Galaxy Z Flip7 FE" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/60 ml-1">Brand Manufacturer</label>
                  <Input value={formData.brandName} onChange={e => handleChange('brandName', e.target.value)} className="bg-black/50 border-white/10" placeholder="e.g. Samsung" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/60 ml-1">Hardware Model No.</label>
                  <Input value={formData.model || ''} onChange={e => handleChange('model', e.target.value)} className="bg-black/50 border-white/10 font-mono text-xs" placeholder="e.g. SM-F750" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/60 ml-1">Product Type (Upgraded)</label>
                  <select 
                    value={formData.productType || 'Smartphone'}
                    onChange={e => handleChange('productType', e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 h-12 text-white text-sm focus:outline-none focus:border-[#C5A059]"
                  >
                    <option value="Smartphone">Smartphone</option>
                    <option value="Laptop">Laptop</option>
                    <option value="Headphones">Headphones</option>
                    <option value="Camera">Camera</option>
                    <option value="Wearable">Wearable</option>
                    <option value="Gaming Gear">Gaming Gear</option>
                    <option value="Home Office">Home Office</option>
                    <option value="Smart Home">Smart Home</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/60 ml-1">Sub Category</label>
                  <Input value={formData.subCategory || ''} onChange={e => handleChange('subCategory', e.target.value)} className="bg-black/50 border-white/10" placeholder="e.g. Foldable Smartphones" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/60 ml-1">Release Year</label>
                  <Input value={formData.releaseYear || ''} onChange={e => handleChange('releaseYear', e.target.value)} className="bg-black/50 border-white/10" placeholder="e.g. 2026" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/60 ml-1">Official Product URL</label>
                  <Input value={formData.officialProductUrl || ''} onChange={e => handleChange('officialProductUrl', e.target.value)} className="bg-black/50 border-white/10 font-mono text-xs" placeholder="e.g. https://samsung.com/galaxy-z-flip7" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/60 ml-1">Base Price / MSRP (MSRP Value)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">$</span>
                    <Input 
                      type="number"
                      value={formData.price} 
                      onChange={e => handleChange('price', parseFloat(e.target.value) || 0)} 
                      className="bg-black/50 border-white/10 pl-8 font-mono" 
                      placeholder="e.g. 999.99"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Description Editorial */}
            <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#C5A059] border-b border-[#C5A059]/20 pb-2">Description & Review Narrative</h3>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/60 ml-1">Overview Description / Intro</label>
                <textarea 
                  value={formData.description} 
                  onChange={e => handleChange('description', e.target.value)} 
                  placeholder="Review introduction summary or high-level overview..."
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3.5 text-white text-sm focus:outline-none focus:border-[#C5A059]/50 min-h-[140px]" 
                />
              </div>
            </div>

            {/* Upgraded Tech Specifications parameters */}
            <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#C5A059] border-b border-[#C5A059]/20 pb-2">Technical Specifications Grid (Upgraded)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/60 ml-1">Display Specification</label>
                  <Input value={formData.specDisplay || ''} onChange={e => handleChange('specDisplay', e.target.value)} className="bg-black/50 border-white/10" placeholder="e.g. 6.7-inch Dynamic AMOLED 2X, 120Hz" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/60 ml-1">Processor / SoC</label>
                  <Input value={formData.specProcessor || ''} onChange={e => handleChange('specProcessor', e.target.value)} className="bg-black/50 border-white/10" placeholder="e.g. Snapdragon 8 Gen 5" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/60 ml-1">Memory / RAM</label>
                  <Input value={formData.specRam || ''} onChange={e => handleChange('specRam', e.target.value)} className="bg-black/50 border-white/10" placeholder="e.g. 12GB LPDDR5X" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/60 ml-1">Storage Configurations</label>
                  <Input value={formData.specStorage || ''} onChange={e => handleChange('specStorage', e.target.value)} className="bg-black/50 border-white/10" placeholder="e.g. 256GB / 512GB UFS 4.1" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/60 ml-1">Camera Configuration</label>
                  <Input value={formData.specCamera || ''} onChange={e => handleChange('specCamera', e.target.value)} className="bg-black/50 border-white/10" placeholder="e.g. 50MP Wide + 12MP Ultra-Wide" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/60 ml-1">Battery & Charging</label>
                  <Input value={formData.specBattery || formData.battery || ''} onChange={e => { handleChange('specBattery', e.target.value); handleChange('battery', e.target.value); }} className="bg-black/50 border-white/10" placeholder="e.g. 4400mAh, 45W Fast Charging" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/60 ml-1">Operating System</label>
                  <Input value={formData.specOs || ''} onChange={e => handleChange('specOs', e.target.value)} className="bg-black/50 border-white/10" placeholder="e.g. Android 16 with One UI 8" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/60 ml-1">Connectivity (WiFi, 5G, Bluetooth)</label>
                  <Input value={formData.specConnectivity || ''} onChange={e => handleChange('specConnectivity', e.target.value)} className="bg-black/50 border-white/10" placeholder="e.g. 5G, Wi-Fi 7, Bluetooth 5.4, NFC" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/60 ml-1">On-Device AI Features</label>
                  <Input value={formData.specAiFeatures || ''} onChange={e => handleChange('specAiFeatures', e.target.value)} className="bg-black/50 border-white/10" placeholder="e.g. Galaxy AI, Live Translation, Circle to Search" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/60 ml-1">Physical Weight</label>
                  <Input value={formData.specWeight || formData.weight || ''} onChange={e => { handleChange('specWeight', e.target.value); handleChange('weight', e.target.value); }} className="bg-black/50 border-white/10" placeholder="e.g. 187g" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/60 ml-1">Physical Dimensions</label>
                  <Input value={formData.specDimensions || formData.dimensions || ''} onChange={e => { handleChange('specDimensions', e.target.value); handleChange('dimensions', e.target.value); }} className="bg-black/50 border-white/10" placeholder="e.g. 165.1 x 71.9 x 6.9 mm" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/60 ml-1">Warranty Term</label>
                  <Input value={formData.specWarranty || formData.warranty || ''} onChange={e => { handleChange('specWarranty', e.target.value); handleChange('warranty', e.target.value); }} className="bg-black/50 border-white/10" placeholder="e.g. 1-Year Manufacturer Warranty" />
                </div>
              </div>

              {/* Custom Unlimited Specs Table */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <label className="text-xs font-bold text-white/60 ml-1">Add Supplementary Specifications</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end bg-[#1a1a22] p-4 rounded-xl border border-white/5">
                  <div className="space-y-2">
                    <span className="block text-[10px] uppercase tracking-wider text-white/55 font-mono">Spec Title</span>
                    <Input value={newSpecName} onChange={e => setNewSpecName(e.target.value)} className="bg-black border-white/10 h-10" placeholder="e.g. Water Resistance" />
                  </div>
                  <div className="space-y-2">
                    <span className="block text-[10px] uppercase tracking-wider text-white/55 font-mono">Spec Value</span>
                    <Input value={newSpecValue} onChange={e => setNewSpecValue(e.target.value)} className="bg-black border-white/10 h-10" placeholder="e.g. IPX8 Rated" />
                  </div>
                  <Button type="button" onClick={addCustomSpec} className="bg-[#C5A059] text-black hover:bg-white h-10 uppercase tracking-widest font-mono text-[9px] font-bold">
                    <Plus size={14} className="mr-1" /> Append Spec
                  </Button>
                </div>

                {formData.specs && formData.specs.length > 0 && (
                  <div className="border border-white/5 rounded-xl overflow-hidden bg-black/40">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                          <th className="p-3 text-[10px] text-white/40 uppercase font-mono">Spec Title</th>
                          <th className="p-3 text-[10px] text-white/40 uppercase font-mono">Spec Value</th>
                          <th className="p-3 text-right text-[10px] text-white/40 uppercase font-mono w-20">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.specs.map((s: any, idx: number) => (
                          <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.01]">
                            <td className="p-3 font-mono text-white/70">{s.name}</td>
                            <td className="p-3 font-semibold text-white">{s.value}</td>
                            <td className="p-3 text-right">
                              <button type="button" onClick={() => removeCustomSpec(idx)} className="text-red-400 hover:text-red-300 p-1">
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'editorial' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Editorial Status parameters */}
            <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#C5A059] border-b border-[#C5A059]/20 pb-2">Editorial Review System</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/60 ml-1">Review Workflow Status</label>
                  <select 
                    value={formData.reviewStatus || 'Draft'}
                    onChange={e => handleChange('reviewStatus', e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 h-12 text-white text-sm focus:outline-none focus:border-[#C5A059]"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Testing">Testing</option>
                    <option value="Published">Published</option>
                    <option value="Updated">Updated</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/60 ml-1">Editor Rating Stars (1-5)</label>
                  <select 
                    value={formData.editorRating || 5}
                    onChange={e => handleChange('editorRating', parseInt(e.target.value) || 5)}
                    className="w-full bg-[#1b1b22] border border-[#C5A059]/30 rounded-xl px-4 h-12 text-[#C5A059] font-bold text-sm focus:outline-none"
                  >
                    <option value={1}>1 Star ⭐</option>
                    <option value={2}>2 Stars ⭐⭐</option>
                    <option value={3}>3 Stars ⭐⭐⭐</option>
                    <option value={4}>4 Stars ⭐⭐⭐⭐</option>
                    <option value={5}>5 Stars ⭐⭐⭐⭐⭐</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/60 ml-1">Target "Best For" Audience</label>
                  <Input value={formData.bestFor || ''} onChange={e => handleChange('bestFor', e.target.value)} className="bg-black/50 border-white/10" placeholder="e.g. Creators & Content Producers" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/60 ml-1">Full Detailed Review Article URL</label>
                  <Input value={formData.fullReviewUrl || ''} onChange={e => handleChange('fullReviewUrl', e.target.value)} className="bg-black/50 border-white/10 font-mono text-xs" placeholder="e.g. /reviews/capcut-pro-review-2026" />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 items-stretch pt-2">
                {/* Featured review toggle */}
                <div className="flex-1 flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5">
                  <div>
                    <div className="font-bold text-sm text-white">Featured Review Showcase</div>
                    <div className="text-[10px] text-white/40 uppercase tracking-widest font-mono mt-0.5">Toggle to highlight review as featured</div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => handleChange('featuredReview', !formData.featuredReview)}
                    className={`w-12 h-6 rounded-full relative transition-colors shrink-0 ${formData.featuredReview ? 'bg-[#C5A059]' : 'bg-white/10'}`}
                  >
                    <motion.div 
                      initial={false}
                      animate={{ x: formData.featuredReview ? 24 : 2 }}
                      className="w-5 h-5 bg-white rounded-full absolute top-0.5"
                    />
                  </button>
                </div>

                {/* Legacy featured toggle */}
                <div className="flex-1 flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5">
                  <div>
                    <div className="font-bold text-sm text-white">General Product Featured</div>
                    <div className="text-[10px] text-white/40 uppercase tracking-widest font-mono mt-0.5">Feature in general catalogs</div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => handleChange('featured', !formData.featured)}
                    className={`w-12 h-6 rounded-full relative transition-colors shrink-0 ${formData.featured ? 'bg-[#C5A059]' : 'bg-white/10'}`}
                  >
                    <motion.div 
                      initial={false}
                      animate={{ x: formData.featured ? 24 : 2 }}
                      className="w-5 h-5 bg-white rounded-full absolute top-0.5"
                    />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white/60 ml-1">Verdict summary / Review Summary Excerpt</label>
                <textarea 
                  value={formData.reviewSummary || ''} 
                  onChange={e => handleChange('reviewSummary', e.target.value)} 
                  placeholder="Summarize the core review verdict in 2-3 powerful sentences..."
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3.5 text-white text-sm focus:outline-none focus:border-[#C5A059]/50 min-h-[100px]" 
                />
              </div>
            </div>

            {/* Performance scores evaluations */}
            <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#C5A059] border-b border-[#C5A059]/20 pb-2">Performance Scores (1-100 Rating metrics)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 bg-[#16161b] p-6 rounded-2xl border border-white/5">
                {[
                  { key: 'overallScore', label: 'Overall Evaluation Score' },
                  { key: 'performanceScore', label: 'Performance Score' },
                  { key: 'designScore', label: 'Design & Ergonomics' },
                  { key: 'batteryScore', label: 'Battery Lifespan Score' },
                  { key: 'cameraScore', label: 'Camera & Optics' },
                  { key: 'valueScore', label: 'Value for Money' }
                ].map(scoreItem => (
                  <div key={scoreItem.key} className="space-y-2 bg-black/30 p-3 rounded-xl border border-white/5">
                    <div className="flex justify-between items-center text-xs font-bold text-white/70">
                      <span>{scoreItem.label}</span>
                      <span className="font-mono text-[#C5A059] bg-[#C5A059]/10 border border-[#C5A059]/20 px-2 py-0.5 rounded text-[10px]">
                        {(formData as any)[scoreItem.key] || 85} / 100
                      </span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="100" 
                      value={(formData as any)[scoreItem.key] || 85} 
                      onChange={e => handleChange(scoreItem.key as any, parseInt(e.target.value) || 0)} 
                      className="w-full accent-[#C5A059] bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Pros and Cons bullet points editor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Key Advantages Builder */}
              <div className="space-y-4 bg-emerald-500/[0.02] border border-emerald-500/10 p-5 rounded-xl">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">Key Advantages (Pros)</h4>
                <div className="flex gap-2">
                  <Input value={newPro} onChange={e => setNewPro(e.target.value)} className="bg-black/40 border-emerald-500/20 text-white h-10" placeholder="Add pro bullet point..." />
                  <Button type="button" onClick={addPro} className="bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 h-10 font-bold px-3">Add</Button>
                </div>
                {formData.pros && formData.pros.length > 0 && (
                  <ul className="space-y-2 bg-black/20 p-3 rounded-lg border border-emerald-500/5 text-xs text-emerald-100/80">
                    {formData.pros.map((p: string, idx: number) => (
                      <li key={idx} className="flex justify-between items-center gap-2">
                        <span className="line-clamp-2">👍 {p}</span>
                        <button type="button" onClick={() => removePro(idx)} className="text-red-400/50 hover:text-red-300 shrink-0">
                          <Trash2 size={12} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Key Limitations Builder */}
              <div className="space-y-4 bg-red-500/[0.02] border border-red-500/10 p-5 rounded-xl">
                <h4 className="text-xs font-bold uppercase tracking-wider text-red-400 font-mono">Key Limitations (Cons)</h4>
                <div className="flex gap-2">
                  <Input value={newCon} onChange={e => setNewCon(e.target.value)} className="bg-black/40 border-red-500/20 text-white h-10" placeholder="Add con bullet point..." />
                  <Button type="button" onClick={addCon} className="bg-red-500/15 text-red-400 hover:bg-red-500/25 h-10 font-bold px-3">Add</Button>
                </div>
                {formData.cons && formData.cons.length > 0 && (
                  <ul className="space-y-2 bg-black/20 p-3 rounded-lg border border-red-500/5 text-xs text-red-100/80">
                    {formData.cons.map((c: string, idx: number) => (
                      <li key={idx} className="flex justify-between items-center gap-2">
                        <span className="line-clamp-2">👎 {c}</span>
                        <button type="button" onClick={() => removeCon(idx)} className="text-red-400/50 hover:text-red-300 shrink-0">
                          <Trash2 size={12} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'affiliate' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Base Direct Offer info */}
            <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#C5A059] border-b border-[#C5A059]/20 pb-2">Direct Affiliate Link & Fallback Retailer</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/60 ml-1">Fallback Affiliate URL (Used as Default/MSRP redirect)</label>
                  <Input value={formData.affiliateUrl || ''} onChange={e => handleChange('affiliateUrl', e.target.value)} className="bg-black/50 border-white/10 font-mono text-xs" placeholder="e.g. https://capcutaffiliateprogram.pxf.io/ZVJ4JR" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/60 ml-1">Button CTA Text</label>
                  <Input value={formData.ctaText || 'Buy Now'} onChange={e => handleChange('ctaText', e.target.value)} className="bg-black/50 border-white/10" placeholder="e.g. Buy Now" />
                </div>
              </div>
            </div>

            {/* Upgraded Multiple Retailer Offers */}
            <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#C5A059] border-b border-[#C5A059]/20 pb-2">Affiliate Retail Offers Upgrades (Multiple offers)</h3>
              <div className="bg-[#1b1b22] p-5 rounded-2xl border border-white/5 space-y-4">
                <h4 className="text-xs font-bold text-white/80">Add Upgraded Retail Offer</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-mono text-white/50">Retailer Name</span>
                    <Input value={offerRetailer} onChange={e => setOfferRetailer(e.target.value)} className="bg-black border-white/10 h-10" placeholder="e.g. Amazon, BestBuy" />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-mono text-white/50">Offer URL (Affiliate URL)</span>
                    <Input value={offerUrl} onChange={e => setOfferUrl(e.target.value)} className="bg-black border-white/10 h-10 font-mono text-xs" placeholder="https://..." />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-mono text-white/50">Retail Price (With currency)</span>
                    <Input value={offerPrice} onChange={e => setOfferPrice(e.target.value)} className="bg-black border-white/10 h-10 font-mono text-xs" placeholder="e.g. $949.99" />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-mono text-white/50">Retail Discount Description</span>
                    <Input value={offerDiscount} onChange={e => setOfferDiscount(e.target.value)} className="bg-black border-white/10 h-10" placeholder="e.g. 10% Off coupon" />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-mono text-white/50">Availability Status</span>
                    <Input value={offerAvailability} onChange={e => setOfferAvailability(e.target.value)} className="bg-black border-white/10 h-10" placeholder="e.g. In Stock, Pre-Order" />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-mono text-white/50">CTA Action Button text</span>
                    <Input value={offerCta} onChange={e => setOfferCta(e.target.value)} className="bg-black border-white/10 h-10" placeholder="e.g. Check Price" />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button type="button" onClick={addRetailOffer} className="bg-[#C5A059] text-black hover:bg-white h-10 uppercase tracking-widest font-mono text-[9px] font-bold px-6">
                    <Plus size={14} className="mr-1" /> Add Retail Offer Row
                  </Button>
                </div>
              </div>

              {formData.retailOffers && formData.retailOffers.length > 0 && (
                <div className="border border-white/5 rounded-xl overflow-hidden bg-black/40">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02]">
                        <th className="p-3 text-[10px] text-white/40 uppercase font-mono">Retailer</th>
                        <th className="p-3 text-[10px] text-white/40 uppercase font-mono">Price</th>
                        <th className="p-3 text-[10px] text-white/40 uppercase font-mono">Discount</th>
                        <th className="p-3 text-[10px] text-white/40 uppercase font-mono">Availability</th>
                        <th className="p-3 text-[10px] text-white/40 uppercase font-mono">CTA Button</th>
                        <th className="p-3 text-right text-[10px] text-white/40 uppercase font-mono w-20">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.retailOffers.map((offer: any, idx: number) => (
                        <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.01]">
                          <td className="p-3 font-semibold text-white">{offer.retailerName}</td>
                          <td className="p-3 font-mono text-emerald-400">{offer.price}</td>
                          <td className="p-3 text-white/60">{offer.discount || '-'}</td>
                          <td className="p-3 font-mono text-xs">{offer.availability || 'In Stock'}</td>
                          <td className="p-3 text-xs uppercase tracking-wider font-bold text-[#C5A059]">{offer.ctaText || 'Buy Now'}</td>
                          <td className="p-3 text-right">
                            <button type="button" onClick={() => removeRetailOffer(idx)} className="text-red-400 hover:text-red-300 p-1">
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Alternatives & Comparison System (Compare with related list checkboxes) */}
            <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#C5A059] border-b border-[#C5A059]/20 pb-2">Alternatives & Product Comparison System</h3>
              <div className="bg-[#131317] p-5 rounded-2xl border border-white/5 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-white">Compare with Competitor Models (Link Up to 3 Products)</h4>
                  <p className="text-[10px] text-white/40 uppercase font-mono tracking-widest mt-1">Select other catalog products to generate comparative specifications tables in public pages.</p>
                </div>

                {allProductsList.length === 0 ? (
                  <p className="text-xs text-white/30 italic">No other hardware items in catalog to compare with.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {allProductsList.map((prod: TechGearProduct) => {
                      const isLinked = (formData.compareWithIds || []).includes(prod.id);
                      return (
                        <button
                          key={prod.id}
                          type="button"
                          onClick={() => toggleCompareProduct(prod.id)}
                          className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all select-none ${
                            isLinked 
                              ? 'bg-[#C5A059]/10 border-[#C5A059]/40 text-[#C5A059]' 
                              : 'bg-black/40 border-white/5 text-white/60 hover:border-white/10 hover:text-white'
                          }`}
                        >
                          <div>
                            <span className="block text-[8px] font-mono uppercase tracking-wider text-white/30">{prod.brandName}</span>
                            <span className="text-xs font-bold leading-tight line-clamp-1">{prod.title}</span>
                          </div>
                          <span className="w-4 h-4 rounded border flex items-center justify-center shrink-0 border-white/20">
                            {isLinked && <Check size={10} className="text-[#C5A059]" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'media_seo' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Visual Media Upgrades */}
            <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#C5A059] border-b border-[#C5A059]/20 pb-2">Visual Media Assets Management</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main cover */}
                <div className="bg-black/30 p-5 rounded-2xl border border-white/5 space-y-3">
                  <label className="text-xs font-bold text-white/70 block">Main Featured Cover (Thumbnail)</label>
                  <ImageUpload 
                    value={formData.featuredImage} 
                    onChange={(url) => handleChange('featuredImage', url)} 
                    folder="tech_gear" 
                  />
                </div>

                {/* Gallery uploads */}
                <div className="lg:col-span-2 bg-black/30 p-5 rounded-2xl border border-white/5 space-y-3">
                  <label className="text-xs font-bold text-white/70 block flex justify-between">
                    <span>Supplementary Gallery Images</span>
                    <span className="font-mono text-[#C5A059] text-[10px]">{(formData.galleryImages || []).length} Uploaded</span>
                  </label>
                  <GalleryUpload 
                    value={formData.galleryImages || []}
                    onChange={(urls) => handleChange('galleryImages', urls)}
                    folder="tech_gear_gallery"
                    label=""
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/60 ml-1">Embedded Video Review URL (YouTube / Vimeo embed link)</label>
                  <Input value={formData.videoReviewUrl || ''} onChange={e => handleChange('videoReviewUrl', e.target.value)} className="bg-black/50 border-white/10 font-mono text-xs" placeholder="e.g. https://youtube.com/embed/dQw4w9WgXcQ" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/60 ml-1">Interactive 360 Product View / Canvas Asset URL</label>
                  <Input value={formData.product360ViewUrl || ''} onChange={e => handleChange('product360ViewUrl', e.target.value)} className="bg-black/50 border-white/10 font-mono text-xs" placeholder="e.g. https://yourdomain.com/assets/360-view" />
                </div>
              </div>
            </div>

            {/* SEO and Schema meta options */}
            <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#C5A059] border-b border-[#C5A059]/20 pb-2">SEO Management & Structured Data Schema</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/60 ml-1">SEO Title Tag (Meta Title)</label>
                  <Input value={formData.seoTitle || ''} onChange={e => handleChange('seoTitle', e.target.value)} className="bg-black/50 border-white/10" placeholder="e.g. Samsung Galaxy Z Flip7 Review - Specs and Verdict" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/60 ml-1">SEO Focus Keyword (Primary Keyword)</label>
                  <Input value={formData.focusKeyword || ''} onChange={e => handleChange('focusKeyword', e.target.value)} className="bg-black/50 border-white/10" placeholder="e.g. Galaxy Z Flip7 Review 2026" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/60 ml-1">SEO Meta Description Tag</label>
                  <textarea 
                    value={formData.seoDescription || ''} 
                    onChange={e => handleChange('seoDescription', e.target.value)} 
                    placeholder="Provide a search-engine summary containing the focus keyword organically..."
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3.5 text-white text-sm focus:outline-none focus:border-[#C5A059]/50 min-h-[90px]" 
                  />
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/60 ml-1">Custom URL Slug (Backward compatibility lookup)</label>
                    <Input value={formData.slug || ''} onChange={e => handleChange('slug', e.target.value)} className="bg-black/50 border-white/10 font-mono text-xs" placeholder="e.g. galaxy-z-flip7-review" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/60 ml-1">JSON-LD Structured Schema Type</label>
                    <select 
                      value={formData.schemaType || 'Product Review'}
                      onChange={e => handleChange('schemaType', e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 h-12 text-white text-sm focus:outline-none"
                    >
                      <option value="Product Review">Product Review (IndividualReview)</option>
                      <option value="Product">Standard eCommerce Product</option>
                      <option value="NewsArticle">NewsArticle</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
