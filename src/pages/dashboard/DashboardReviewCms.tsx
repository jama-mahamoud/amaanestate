import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, Edit3, Trash2, Globe, ExternalLink,
  X, Save, Tag, Image as ImageIcon, Link as LinkIcon, DollarSign,
  Check, AlertCircle, ShoppingBag, Eye, EyeOff, LayoutTemplate, Star, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { reviewService, EditorialReview, GalleryItem } from '@/services/reviewService';
import { getCategoryLabel } from '@/data/categories';
import { toast } from 'sonner';
import { uploadFile } from '@/services/uploadService';

interface GalleryImagePreviewProps {
  src?: string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function GalleryImagePreview({ src, onFileChange }: GalleryImagePreviewProps) {
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (src) {
      setState('loading');
    } else {
      setState('idle');
    }
  }, [src]);

  return (
    <div className="w-32 h-32 bg-[#111] border border-white/10 rounded-xl flex-shrink-0 relative overflow-hidden group/img flex items-center justify-center">
      {src ? (
        <>
          {state === 'loading' && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
              <RefreshCw className="animate-spin text-blue-500" size={16} />
            </div>
          )}
          {state === 'error' && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10 text-center p-2">
              <AlertCircle className="text-red-500 mb-1" size={16} />
              <span className="text-[9px] text-white/60 font-mono">Failed to load</span>
            </div>
          )}
          <img 
            src={src} 
            alt="img" 
            className="w-full h-full object-cover" 
            onLoad={() => setState('success')}
            onError={() => setState('error')}
          />
        </>
      ) : (
        <div className="flex items-center justify-center h-full text-white/20 text-xs">No Image</div>
      )}
      
      <label className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-sm z-20">
         <ImageIcon size={18} className="text-white"/>
         <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
      </label>
    </div>
  );
}

export default function DashboardReviewCms() {
  const [reviews, setReviews] = useState<EditorialReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [viewState, setViewState] = useState<'list' | 'create' | 'edit'>('list');
  const [form, setForm] = useState<Partial<EditorialReview> | null>(null);

  const [heroImageState, setHeroImageState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (form?.featuredImage) {
      setHeroImageState('loading');
    } else {
      setHeroImageState('idle');
    }
  }, [form?.featuredImage]);

  const [prosText, setProsText] = useState('');
  const [consText, setConsText] = useState('');
  const [featuresText, setFeaturesText] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await reviewService.getAllReviews(false);
      setReviews(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setForm({
      title: '',
      category: 'Software',
      brandName: '',
      rating: 5.0,
      featuredImage: '',
      price: '',
      discountPrice: '',
      affiliateUrl: '',
      status: 'draft',
      introduction: '',
      whatIsIt: '',
      bestFor: '',
      finalVerdict: '',
      gallery: [],
      pros: [],
      cons: [],
      keyFeatures: [],
      seoTitle: '',
      metaDescription: '',
      brandLogoLetter: '',
      excerpt: '',
      slug: ''
    });
    setProsText('');
    setConsText('');
    setFeaturesText('');
    setViewState('create');
  };

  const handleEdit = (rev: EditorialReview) => {
    setForm({ ...rev });
    setProsText(rev.pros?.join('\n') || '');
    setConsText(rev.cons?.join('\n') || '');
    setFeaturesText(rev.keyFeatures?.join('\n') || '');
    setViewState('edit');
  };

  const cancelEdit = () => {
    setViewState('list');
    setForm(null);
  };

  const handleFieldChange = (field: keyof EditorialReview, value: any) => {
    if (form) setForm({ ...form, [field]: value });
  };

  const handleToggleStatus = async (item: EditorialReview) => {
    const newStatus = item.status === 'published' ? 'draft' : 'published';
    try {
      await reviewService.updateStatus(item.id, newStatus);
      toast.success(`Set to ${newStatus}`);
      loadData();
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this review entirely?")) return;
    try {
      await reviewService.deleteReview(id);
      toast.success("Deleted successfully");
      loadData();
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  // Image upload generic helper
  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadFile(file, 'reviews');
      if (url) {
        handleFieldChange('featuredImage', url);
        toast.success("Image uploaded!");
      }
    } catch (err) {
      toast.error("Upload failed");
    }
  };

  // Process text areas to lines
  const parseLines = (text: string) => {
    return text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  };

  const handleSave = async (statusOverride?: 'draft' | 'published') => {
    if (!form) return;
    if (!form.title) {
        toast.error("Title is required");
        return;
    }

    try {
      const isNew = viewState === 'create';
      let docSlug = form.slug;
      if (!docSlug) {
         docSlug = await reviewService.ensureUniqueSlug(form.title, form.id);
      }

      const baseExcerpt = form.introduction?.substring(0, 150) || form.title;
      const brandL = form.brandName ? form.brandName.charAt(0).toUpperCase() : form.title.charAt(0).toUpperCase();

      const payload: Omit<EditorialReview, 'createdAt' | 'updatedAt'> = {
        id: docSlug,
        slug: docSlug,
        title: form.title || '',
        category: form.category || 'Software',
        featuredImage: form.featuredImage || '',
        excerpt: form.excerpt || baseExcerpt,
        introduction: form.introduction || '',
        whatIsIt: form.whatIsIt || '',
        keyFeatures: parseLines(featuresText),
        pros: parseLines(prosText),
        cons: parseLines(consText),
        bestFor: form.bestFor || '',
        finalVerdict: form.finalVerdict || '',
        rating: Number(form.rating) || 5.0,
        price: form.price || '',
        discountPrice: form.discountPrice || '',
        brandName: form.brandName || form.title || '',
        brandLogoLetter: brandL,
        affiliateUrl: form.affiliateUrl || '',
        ctaSummary: form.ctaSummary || 'Get this deal today',
        gallery: form.gallery || [],
        seoTitle: form.title || '',
        metaDescription: baseExcerpt,
        status: statusOverride || form.status || 'draft',
        publishDate: form.publishDate || new Date().toISOString().split('T')[0]
      };

      if (isNew) {
        await reviewService.createReview(payload);
        toast.success("Review Created!");
      } else {
        await reviewService.updateReview(form.id!, payload);
        toast.success("Review Saved!");
      }
      cancelEdit();
      loadData();
    } catch (e) {
      console.error(e);
      toast.error("Save failed. See console.");
    }
  };

  // Gallery array mutations
  const addGalleryItem = () => {
    const freshGallery = [...(form?.gallery || [])];
    freshGallery.push({
      url: '',
      title: '',
      price: '',
      discountPrice: '',
      productUrl: '',
      ctaButtonText: 'Add Product'
    });
    handleFieldChange('gallery', freshGallery);
  };
  
  const updateGalleryItem = (index: number, key: keyof GalleryItem, value: any) => {
    const list = [...(form?.gallery || [])];
    list[index] = { ...list[index], [key]: value };
    handleFieldChange('gallery', list);
  };

  const removeGalleryItem = (index: number) => {
    const list = [...(form?.gallery || [])];
    list.splice(index, 1);
    handleFieldChange('gallery', list);
  };

  const handleGalleryImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadFile(file, 'gallery');
      if (url) {
        updateGalleryItem(index, 'url', url);
        updateGalleryItem(index, 'imageUrl', url);
        toast.success("Gallery Product Image uploaded!");
      }
    } catch (err) {
      toast.error("Upload failed");
    }
  };

  const filteredItems = useMemo(() => {
    return reviews.filter(d => {
      const match = d.title.toLowerCase().includes(searchQuery.toLowerCase());
      if (statusFilter === 'all') return match;
      return match && d.status === statusFilter;
    });
  }, [reviews, searchQuery, statusFilter]);

  if (viewState === 'list') {
    return (
      <div className="p-6 md:p-10 max-w-[1600px] mx-auto min-h-screen text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-3xl font-display font-light text-white flex items-center gap-3">
              <LayoutTemplate className="text-blue-500" size={28} /> Review CMS V2
            </h1>
            <p className="text-white/40 text-sm mt-2">Modern affiliate publishing workspace.</p>
          </div>
          <Button 
            onClick={handleCreateNew}
            className="bg-blue-600 text-white hover:bg-blue-500 transition-colors h-12 px-6 rounded-xl font-medium"
          >
            <Plus size={16} className="mr-2" /> Write New Review
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <Input 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search reviews..."
              className="bg-white/5 border-white/5 pl-11 h-12 text-white placeholder:text-white/20"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'published', 'draft'].map(s => (
              <button 
                key={s}
                onClick={() => setStatusFilter(s)} 
                className={`px-4 h-12 rounded-xl text-xs uppercase tracking-wider font-mono font-bold transition-all border ${
                  statusFilter === s 
                    ? 'bg-blue-600/10 text-blue-500 border-blue-500/30' 
                    : 'bg-transparent border-white/10 text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {loading ? (
             <div className="py-20 flex justify-center"><RefreshCw className="animate-spin text-white/40" size={24} /></div>
        ) : filteredItems.length === 0 ? (
          <div className="py-20 text-center border border-white/5 rounded-3xl bg-white/[0.02]">
            <p className="text-white/40">No reviews found.</p>
          </div>
        ) : (
          <div className="bg-[#0a0a0f] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 text-white/40 bg-white/5">
                  <th className="p-4">Title & Details</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-white/[0.02]">
                    <td className="p-4 flex gap-4 min-w-[300px]">
                      {item.featuredImage && (
                        <img src={item.featuredImage} alt={item.title} className="w-16 h-16 object-cover rounded-lg border border-white/10 bg-black/50" />
                      )}
                      <div>
                         <div className="font-semibold text-white">{item.title}</div>
                         <div className="text-xs text-white/50 mt-1">{item.brandName} • {item.category}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <button 
                         onClick={() => handleToggleStatus(item)}
                         className={`px-3 py-1 text-[10px] font-mono font-bold uppercase rounded-lg border ${item.status === 'published' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-white/5 text-white/40 border-white/10'}`}
                      >
                        {item.status}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                       <Button size="icon" variant="ghost" onClick={() => handleEdit(item)} className="hover:bg-blue-500 hover:text-white mr-2"><Edit3 size={14}/></Button>
                       <Button size="icon" variant="ghost" onClick={() => handleDelete(item.id)} className="hover:bg-red-500 hover:text-white"><Trash2 size={14}/></Button>
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

  // ============== CMS V2 WORKSPACE VIEW ==============
  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen text-white bg-[#030303] rounded-3xl border border-white/5 shadow-2xl relative">
       
      {/* Top Bar Workspace Header */}
      <div className="sticky top-0 z-30 pb-4 mb-6 border-b border-white/10 bg-gradient-to-b from-[#030303] to-[#030303]/90 backdrop-blur-md pt-2 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={cancelEdit} className="text-white/50 hover:text-white px-0"><X size={20}/></Button>
            <h2 className="text-xl font-serif text-white">{form?.title ? form.title : 'Untitled Review'}</h2>
         </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
         {/* LEFT COLUMN: Editor Body */}
         <div className="flex-1 space-y-10 min-w-0 pb-32">
            
            {/* 1. Product Information */}
            <section className="bg-[#0a0a0e] rounded-[1.5rem] p-6 sm:p-8 border border-white/5">
                <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-white/50 mb-6">1. Product Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                       <label className="text-sm font-medium text-white/80">Product Title</label>
                       <Input className="bg-black/30 border-white/10 h-12" placeholder="Platform Name" value={form?.title || ''} onChange={(e) => handleFieldChange('title', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-medium text-white/80">Brand Name</label>
                       <Input className="bg-black/30 border-white/10 h-12" placeholder="Apple, Shopify..." value={form?.brandName || ''} onChange={(e) => handleFieldChange('brandName', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-medium text-white/80">Category</label>
                       <Input className="bg-black/30 border-white/10 h-12" placeholder="e.g. Fintech Software" value={form?.category || ''} onChange={(e) => handleFieldChange('category', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-medium text-white/80">Editorial Rating (1.0 - 5.0)</label>
                       <div className="relative">
                          <Star size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-gold" />
                          <Input type="number" step="0.1" className="bg-black/30 border-white/10 h-12 pl-10 font-bold" value={form?.rating || ''} onChange={(e) => handleFieldChange('rating', e.target.value)} />
                       </div>
                    </div>
                </div>
            </section>            {/* 2. Visual Assets */}
            <section className="bg-[#0a0a0e] rounded-[1.5rem] p-6 sm:p-8 border border-white/5">
                <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-white/50 mb-6 flex items-center gap-2">
                   <ImageIcon size={14}/> 2. Visual Assets (Hero)
                </h3>
                <div className="space-y-4">
                    {form?.featuredImage && (
                       <div className="w-full bg-black border border-white/10 rounded-2xl overflow-hidden mb-4 relative group flex flex-col items-center justify-center min-h-[220px] p-2">
                          {heroImageState === 'loading' && (
                             <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-10">
                                <div className="flex flex-col items-center gap-2">
                                   <RefreshCw className="animate-spin text-blue-500" size={24} />
                                   <span className="text-xs text-white/60 font-mono">Loading image preview...</span>
                                </div>
                             </div>
                          )}
                          {heroImageState === 'error' && (
                             <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-10 p-4 text-center">
                                <div className="flex flex-col items-center gap-2 max-w-xs">
                                   <AlertCircle className="text-red-500" size={24} />
                                   <span className="text-xs text-white/80 font-mono font-medium">Failed to load image</span>
                                   <span className="text-[10px] text-white/40 font-mono">Verify URL is a direct link to a valid image format (JPG, PNG, WebP, GIF, etc.)</span>
                                </div>
                             </div>
                          )}
                          <img 
                             src={form.featuredImage} 
                             alt="Hero Banner" 
                             className="max-w-full h-auto object-contain max-h-[400px] rounded-lg" 
                             onLoad={() => setHeroImageState('success')}
                             onError={() => setHeroImageState('error')}
                          />
                       </div>
                    )}
                    <label className="text-sm font-medium text-white/80 block">URL or Upload Image</label>
                    <div className="flex gap-3">
                       <input 
                         className="flex h-12 w-full min-w-0 rounded-xl border border-white/10 bg-black/30 px-4 py-1 text-base transition-colors outline-none placeholder:text-white/20 focus-visible:border-blue-500 disabled:pointer-events-none disabled:opacity-50 md:text-sm text-white flex-1" 
                         placeholder="https://..." 
                         value={form?.featuredImage || ''} 
                         onChange={(e) => handleFieldChange('featuredImage', e.target.value.trim())}
                         onPaste={(e) => {
                           e.preventDefault();
                           const pastedText = e.clipboardData.getData('text');
                           if (pastedText) {
                             handleFieldChange('featuredImage', pastedText.trim());
                             toast.success("Image URL pasted successfully");
                           }
                         }}
                         onDragOver={(e) => e.preventDefault()}
                         onDrop={(e) => {
                           e.preventDefault();
                           const text = e.dataTransfer.getData('text');
                           if (text) {
                             handleFieldChange('featuredImage', text.trim());
                             toast.success("Image URL dropped successfully");
                           }
                         }}
                       />
                       <Button type="button" className="shrink-0 h-12 border border-white/10 bg-black hover:bg-white/10" onClick={() => document.getElementById('hero-upload')?.click()}>
                           <ImageIcon size={16} className="mr-2"/> Upload
                       </Button>
                       <input id="hero-upload" type="file" accept="image/*" className="hidden" onChange={handleFeaturedImageUpload} />
                    </div>
                </div>
            </section>

            {/* 3. Product Gallery */}
            <section className="bg-[#0a0a0e] rounded-[1.5rem] p-6 sm:p-8 border border-white/5">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-white/50">3. Gallery Collection Products</h3>
                   <Button onClick={addGalleryItem} size="sm" className="bg-white/10 hover:bg-white/20 h-8 rounded-lg text-xs"><Plus size={14} className="mr-1"/> Add Item</Button>
                </div>
                
                <div className="space-y-6">
                   {form?.gallery?.map((item, i) => (
                      <div key={i} className="bg-black/40 border border-white/10 rounded-2xl p-5 relative group">
                         <Button variant="destructive" size="icon" className="absolute -top-3 -right-3 w-8 h-8 rounded-full border border-red-500/20 bg-red-500/10 hover:bg-red-500/30 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeGalleryItem(i)}><Trash2 size={14}/></Button>
                         
                         <div className="flex flex-col sm:flex-row gap-5">
                            <GalleryImagePreview src={item.url || item.imageUrl} onFileChange={(e) => handleGalleryImageUpload(i, e)} />

                            <div className="flex-1 space-y-4">
                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <Input placeholder="Product Name" className="bg-black/30 border-white/10 h-10" value={item.title || ''} onChange={e => updateGalleryItem(i, 'title', e.target.value)} />
                                  <input 
                                     placeholder="Image URL (Or click image to upload)" 
                                     className="flex h-10 w-full min-w-0 rounded-lg border border-white/10 bg-black/30 px-3 text-base transition-colors outline-none placeholder:text-white/25 focus-visible:border-blue-500 disabled:pointer-events-none disabled:opacity-50 md:text-sm text-white" 
                                     value={item.url || item.imageUrl || ''} 
                                     onChange={e => { 
                                        const list = [...(form?.gallery || [])]; 
                                        list[i] = { ...list[i], url: e.target.value.trim(), imageUrl: e.target.value.trim() }; 
                                        handleFieldChange('gallery', list); 
                                     }} 
                                     onPaste={e => {
                                        e.preventDefault();
                                        const pastedText = e.clipboardData.getData('text');
                                        if (pastedText) {
                                           const list = [...(form?.gallery || [])]; 
                                           list[i] = { ...list[i], url: pastedText.trim(), imageUrl: pastedText.trim() }; 
                                           handleFieldChange('gallery', list);
                                           toast.success("Gallery URL pasted successfully");
                                        }
                                     }}
                                     onDragOver={e => e.preventDefault()}
                                     onDrop={e => {
                                        e.preventDefault();
                                        const text = e.dataTransfer.getData('text');
                                        if (text) {
                                           const list = [...(form?.gallery || [])]; 
                                           list[i] = { ...list[i], url: text.trim(), imageUrl: text.trim() }; 
                                           handleFieldChange('gallery', list);
                                           toast.success("Gallery URL dropped successfully");
                                        }
                                     }}
                                  />
                                  <Input placeholder="Price (e.g. $99)" className="bg-black/30 border-white/10 h-10 text-white/60" value={item.price || ''} onChange={e => updateGalleryItem(i, 'price', e.target.value)} />
                                  <Input placeholder="Discount/Sale Price (e.g. $49)" className="bg-black/30 border-emerald-500/30 h-10 text-emerald-400 font-bold" value={item.discountPrice || ''} onChange={e => updateGalleryItem(i, 'discountPrice', e.target.value)} />
                               </div>
                               <div className="flex gap-4">
                                  <div className="relative flex-1">
                                     <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"/>
                                     <Input placeholder="Affiliate Tracking Link" className="bg-black/30 border-white/10 h-10 pl-9" value={item.productUrl || ''} onChange={e => updateGalleryItem(i, 'productUrl', e.target.value)} />
                                  </div>
                                  <Input className="w-32 bg-black/30 border-white/10 h-10" placeholder="CTA Text" value={item.ctaButtonText || 'Buy Now'} onChange={e => updateGalleryItem(i, 'ctaButtonText', e.target.value)} />
                               </div>
                            </div>
                         </div>
                      </div>
                   ))}
                   {(!form?.gallery || form.gallery.length === 0) && (
                      <div className="py-10 text-center border-2 border-dashed border-white/10 rounded-2xl block text-white/30 text-sm">
                         No products added. Press "Add Item" to spawn a product card in the gallery.
                      </div>
                   )}
                </div>
            </section>

            {/* 4. Editorial Content */}
            <section className="bg-[#0a0a0e] rounded-[1.5rem] p-6 sm:p-8 border border-white/5 space-y-6 flex-col">
                <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-white/50 pb-2 border-b border-white/5">4. Longform Editorial Content</h3>
                
                <div className="space-y-2">
                   <label className="text-sm font-medium text-white/80">Introduction (Hook & Context)</label>
                   <textarea rows={4} className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-sm resize-none focus:outline-none focus:border-blue-500/50" value={form?.introduction || ''} onChange={e => handleFieldChange('introduction', e.target.value)} placeholder="Engaging opener..." />
                </div>
                
                <div className="space-y-2">
                   <label className="text-sm font-medium text-white/80">Product Overview (What Is It?)</label>
                   <textarea rows={6} className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-sm resize-none focus:outline-none focus:border-blue-500/50" value={form?.whatIsIt || ''} onChange={e => handleFieldChange('whatIsIt', e.target.value)} placeholder="Deep dive into the architecture and functionality..." />
                </div>

                <div className="space-y-2">
                   <label className="text-sm font-medium text-white/80">Target Stakeholders (Best For)</label>
                   <Input className="bg-black/30 border-white/10 h-12" value={form?.bestFor || ''} onChange={e => handleFieldChange('bestFor', e.target.value)} placeholder="e.g. Freelancers, Enterprises, Developers" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
                   <div className="space-y-2">
                      <label className="text-sm font-medium text-emerald-400">Pros (One line = One item)</label>
                      <textarea rows={6} className="w-full bg-black/30 border border-emerald-500/20 rounded-xl p-4 text-sm text-emerald-100 focus:outline-none focus:border-emerald-500/50 resize-y" value={prosText} onChange={e => setProsText(e.target.value)} placeholder="Fast interface&#10;Affordable&#10;Great Support" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-sm font-medium text-red-400">Cons (One line = One item)</label>
                      <textarea rows={6} className="w-full bg-black/30 border border-red-500/20 rounded-xl p-4 text-sm text-red-100 focus:outline-none focus:border-red-500/50 resize-y" value={consText} onChange={e => setConsText(e.target.value)} placeholder="No offline mode&#10;Steep learning curve" />
                   </div>
                </div>

                <div className="space-y-2 pt-6">
                   <label className="text-sm font-medium text-blue-400">Key Features (One line = One item)</label>
                   <textarea rows={6} className="w-full bg-black/30 border border-blue-500/20 rounded-xl p-4 text-sm text-blue-100 focus:outline-none focus:border-blue-500/50 resize-y" value={featuresText} onChange={e => setFeaturesText(e.target.value)} placeholder="Real-time syncing&#10;End-to-end encryption" />
                </div>

                <div className="space-y-2 pt-6">
                   <label className="text-sm font-medium text-white/80">Final Verdict</label>
                   <textarea rows={5} className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-sm resize-none focus:outline-none focus:border-blue-500/50" value={form?.finalVerdict || ''} onChange={e => handleFieldChange('finalVerdict', e.target.value)} placeholder="Closing subjective thoughts..." />
                </div>
            </section>
         </div>

         {/* RIGHT COLUMN: Publishing Panel sidebar */}
         <div className="w-full lg:w-[380px] shrink-0 space-y-6">
            <div className="bg-[#0a0a0e] rounded-[1.5rem] p-6 border border-white/5 sticky top-28 space-y-8 shadow-2xl">
               
               {/* LIVE PREVIEW MODULE */}
               <div className="space-y-4 border-b border-white/5 pb-8">
                  <div className="flex items-center justify-between">
                     <label className="text-[10px] uppercase tracking-widest font-mono text-white/50 font-bold block">
                        Live Preview rendering
                     </label>
                  </div>
                  
                  <div className="flex flex-col bg-[#030303] border border-white/5 rounded-2xl overflow-hidden shadow-xl select-none pointer-events-none w-full">
                     {/* Banner Image */}
                     <div className="w-full bg-black flex justify-center mb-0 overflow-hidden border-b border-white/5 relative">
                        {form?.featuredImage ? (
                           <img src={form.featuredImage} alt="Preview" className="w-full h-auto object-contain max-h-[200px] opacity-90" />
                        ) : (
                           <div className="text-white/20 text-xs font-mono py-12">No Hero Banner</div>
                        )}
                        <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md text-[8px] font-mono text-white font-bold uppercase tracking-wider border border-white/10 z-10">
                           {form?.category ? getCategoryLabel(form.category) : 'Category'}
                        </span>
                     </div>

                     {/* Content Body */}
                     <div className="flex flex-col p-4 flex-1">
                        <div className="flex items-start justify-between gap-3 mb-2">
                           <h3 className="text-sm font-serif font-semibold text-white tracking-tight leading-snug line-clamp-2 min-h-[40px]">
                              {form?.title || 'Untitled Review...'}
                           </h3>
                           <div className="flex items-center gap-1 bg-[#111] text-blue-400 px-1.5 py-0.5 rounded border border-white/5 font-mono text-[9px] font-bold shrink-0">
                              <Star size={8} className="fill-blue-400" /> {form?.rating || '0.0'}
                           </div>
                        </div>
                        
                        {/* Price Block */}
                        <div className="mt-3 pt-3 flex items-center justify-between border-t border-white/5">
                           <div className="flex items-end gap-2">
                              {form?.discountPrice ? (
                                 <>
                                    <span className="text-sm font-bold text-emerald-400">{form.discountPrice}</span>
                                    <span className="text-[10px] font-medium text-white/30 line-through mb-0.5">{form.price}</span>
                                 </>
                              ) : (
                                 <span className="text-sm font-bold text-white">{form?.price || 'Free / Demo'}</span>
                              )}
                           </div>
                        </div>

                        {/* Action Buttons Mock */}
                        <div className="grid grid-cols-2 gap-2 mt-4 shrink-0">
                           <div className="bg-white/5 border border-white/5 text-neutral-300 text-[9px] font-bold uppercase tracking-wider font-mono rounded-lg h-9 flex items-center justify-center">Read Review</div>
                           <div className="bg-blue-600 text-white text-[9px] font-bold uppercase tracking-wider font-mono rounded-lg h-9 flex items-center justify-center shadow-md">Buy Now</div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Controls */}
               <div className="flex flex-col gap-3">
                  <Button variant="outline" className="w-full h-12 rounded-xl border-white/10 text-white hover:bg-white/5" onClick={() => handleSave('draft')}>
                     Save as Draft
                  </Button>
                  <Button className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium" onClick={() => handleSave('published')}>
                     Publish Review
                  </Button>
               </div>
               
               {/* Metadata Set */}
               <div className="space-y-5 pt-4 border-t border-white/5">
                  <div className="space-y-2">
                     <label className="text-[10px] uppercase tracking-widest font-mono text-white/40 block">Doc Status</label>
                     <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                        <button type="button" onClick={() => handleFieldChange('status', 'draft')} className={`flex-1 text-xs py-2 rounded-lg font-medium transition-all ${form?.status !== 'published' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}>Draft</button>
                        <button type="button" onClick={() => handleFieldChange('status', 'published')} className={`flex-1 text-xs py-2 rounded-lg font-medium transition-all ${form?.status === 'published' ? 'bg-emerald-500/20 text-emerald-400' : 'text-white/40 hover:text-white'}`}>Published</button>
                     </div>
                  </div>

                  <div className="space-y-2 pt-2">
                     <label className="text-[10px] uppercase tracking-widest font-mono text-white/40 block">Sale Data</label>
                     <div className="flex gap-3">
                        <div className="relative flex-1">
                           <DollarSign size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                           <Input className="bg-black/40 border-white/5 pl-8 h-10 text-sm line-through text-white/40" placeholder="Old" value={form?.price || ''} onChange={e => handleFieldChange('price', e.target.value)} />
                        </div>
                        <div className="relative flex-1">
                           <DollarSign size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                           <Input className="bg-black/40 border-emerald-500/20 pl-8 h-10 text-sm font-bold text-emerald-400" placeholder="New" value={form?.discountPrice || ''} onChange={e => handleFieldChange('discountPrice', e.target.value)} />
                        </div>
                     </div>
                  </div>

                  <div className="space-y-2 pt-2">
                     <label className="text-[10px] uppercase tracking-widest font-mono text-emerald-400 block font-bold">Main Affiliate Link</label>
                     <div className="relative">
                        <LinkIcon size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400/50" />
                        <Input className="bg-emerald-500/5 border-emerald-500/20 pl-8 h-10 text-sm" placeholder="https://..." value={form?.affiliateUrl || ''} onChange={e => handleFieldChange('affiliateUrl', e.target.value)} />
                     </div>
                  </div>
               </div>

               {/* SEO Readonly notice */}
               <div className="pt-6 border-t border-white/5">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                     <h4 className="text-[10px] uppercase tracking-widest text-blue-400 font-bold mb-2">Automated SEO</h4>
                     <p className="text-xs text-blue-100/70 leading-relaxed font-mono">
                        System autonomously generates Slug, Canonical URLs, Meta Titles, and Rich Schema structured data from content body and assets.
                     </p>
                  </div>
               </div>

            </div>
         </div>

      </div>
    </div>
  );
}
