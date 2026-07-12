import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Eye, 
  Tv, 
  Save, 
  X, 
  Trash, 
  PlusCircle, 
  FolderHeart,
  ChevronRight,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { techGearService, TechGearProduct } from '@/services/techGearService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const TECH_GEAR_CATEGORIES = [
  { id: 'smartphones', label: 'Smartphones' },
  { id: 'laptops', label: 'Laptops' },
  { id: 'wearables', label: 'Wearables' },
  { id: 'audio-gear', label: 'Audio Gear' },
  { id: 'desktop-pcs', label: 'Desktop PCs' },
  { id: 'accessories', label: 'Accessories' },
  { id: 'components', label: 'Components' }
];

export default function DashboardVehicles() {
  const { user, profile } = useAuth();
  const [products, setProducts] = useState<TechGearProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog/Form Controls
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<TechGearProduct | null>(null);

  // Form State variables
  const [brandName, setBrandName] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TechGearProduct['category']>('smartphones');
  const [featuredImage, setFeaturedImage] = useState('');
  const [price, setPrice] = useState<number>(999);
  const [description, setDescription] = useState('');
  const [specs, setSpecs] = useState<{ name: string; value: string }[]>([
    { name: 'Processor', value: '' },
    { name: 'Memory', value: '' }
  ]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await techGearService.getAllProducts(false);
      setProducts(data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load Master Hardware catalog.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return products;
    return products.filter(p => 
      p.brandName.toLowerCase().includes(q) ||
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  const openCreateForm = () => {
    setEditingProduct(null);
    setBrandName('');
    setTitle('');
    setCategory('smartphones');
    setFeaturedImage('https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=60');
    setPrice(999);
    setDescription('');
    setSpecs([
      { name: 'Processor', value: '' },
      { name: 'Memory', value: '' }
    ]);
    setIsFormOpen(true);
  };

  const openEditForm = (prod: TechGearProduct) => {
    setEditingProduct(prod);
    setBrandName(prod.brandName);
    setTitle(prod.title);
    setCategory(prod.category);
    setFeaturedImage(prod.featuredImage);
    setPrice(prod.price);
    setDescription(prod.description);
    setSpecs(prod.specs && prod.specs.length > 0 ? [...prod.specs] : [
      { name: 'Processor', value: '' },
      { name: 'Memory', value: '' }
    ]);
    setIsFormOpen(true);
  };

  const handleAddSpecRow = () => {
    setSpecs(prev => [...prev, { name: '', value: '' }]);
  };

  const handleSpecChange = (index: number, field: 'name' | 'value', val: string) => {
    const updated = [...specs];
    updated[index][field] = val;
    setSpecs(updated);
  };

  const handleRemoveSpecRow = (index: number) => {
    setSpecs(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this master product? Any deals referencing this product will display missing specifications.")) return;
    try {
      await techGearService.deleteProduct(id);
      toast.success("Master Record Deleted Successfully");
      loadProducts();
    } catch (e) {
      toast.error("Failed to delete record.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim() || !title.trim() || !featuredImage.trim()) {
      toast.error("Brand Name, Product Title, and Featured Image are required.");
      return;
    }

    // Filter empty specs
    const activeSpecs = specs.filter(s => s.name.trim() !== '' && s.value.trim() !== '');

    const payload = {
      brandName,
      title,
      category,
      featuredImage,
      price: Number(price),
      description,
      specs: activeSpecs,
      status: 'approved' as const
    };

    try {
      if (editingProduct) {
        await techGearService.updateProduct(editingProduct.id, payload);
        toast.success("Master hardware record updated successfully!");
      } else {
        await techGearService.createProduct(payload);
        toast.success("New physical hardware record registered!");
      }
      setIsFormOpen(false);
      loadProducts();
    } catch (e) {
      toast.error("Failed to save product changes.");
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-8 bg-[#07070a] min-h-screen text-white rounded-3xl border border-white/5 shadow-2xl">
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-white flex items-center gap-2">
            <Tv size={28} className="text-[#C5A059]" /> Tech Gear Inventory CMS
          </h1>
          <p className="text-white/40 text-xs uppercase tracking-widest font-mono mt-1">Master catalog registry • Source of Truth for Physical Products</p>
        </div>
        <Button 
          onClick={openCreateForm}
          className="bg-[#C5A059] hover:bg-white text-black font-bold h-11 px-6 rounded-xl text-xs uppercase tracking-widest font-mono shrink-0 flex items-center gap-2"
        >
          <Plus size={16} /> Add Master Product
        </Button>
      </div>

      {/* SEARCH PANEL */}
      <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
          <Input 
            type="text"
            placeholder="Filter master database by model name, brand name, category..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-black/40 border-white/10 text-white h-11 pl-11 focus-visible:ring-[#C5A059]"
          />
        </div>
        <div className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-xs font-mono text-white/40 uppercase tracking-widest font-bold">
          {filteredProducts.length} entries
        </div>
      </div>

      {/* REGISTRY CONTENT GRID / LIST */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-8 w-8 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xs font-mono text-white/30 uppercase tracking-widest">polling master records...</p>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProducts.map(p => (
            <motion.div 
              layout
              key={p.id}
              className="p-5 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-[#C5A059]/20 rounded-2xl flex flex-col justify-between gap-4 transition-all duration-300"
            >
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-neutral-900 border border-white/5 rounded-xl overflow-hidden shrink-0">
                  <img src={p.featuredImage} alt={p.title} className="w-full h-full object-cover select-none" referrerPolicy="no-referrer" />
                </div>
                
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-[#C5A059]/10 text-[#C5A059] text-[9px] font-black uppercase tracking-widest font-mono">
                      {p.category}
                    </span>
                    <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest font-bold">MSRP: ${p.price}</span>
                  </div>
                  <h4 className="text-white font-bold leading-tight text-lg">{p.brandName} {p.title}</h4>
                  <p className="text-white/40 text-xs mt-1 font-mono">ID: {p.id}</p>
                </div>
              </div>

              <div className="border-t border-white/5 pt-3.5 flex items-center justify-between">
                <div className="flex gap-1 items-center">
                  <FolderHeart size={14} className="text-white/20" />
                  <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest font-bold">
                    {p.specs?.length || 0} specs registered
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => openEditForm(p)}
                    className="border border-[#C5A059]/30 hover:bg-[#C5A059]/10 text-[#C5A059] h-9 px-4 rounded-lg text-xs"
                  >
                    Edit Master
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeleteProduct(p.id)}
                    className="border border-red-500/20 hover:bg-red-500/10 text-red-500 h-9 px-3 rounded-lg text-xs"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl">
          <Tv size={40} className="mx-auto text-white/10 mb-4" />
          <p className="text-white/30 font-mono text-xs uppercase tracking-widest">Inventory empty. Register a product to start building campaigns.</p>
        </div>
      )}

      {/* SHEET MODAL DIALOG / EDITOR FORM OVERLAY */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-[#0c0c10] border border-white/10 p-6 md:p-8 rounded-3xl max-w-2xl w-full relative max-h-[85vh] overflow-y-auto no-scrollbar shadow-2xl"
            >
              <button 
                onClick={() => setIsFormOpen(false)}
                className="absolute top-4 right-4 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border border-white/5 transition-all"
              >
                ✕
              </button>

              <h3 className="text-xl font-display font-bold text-white mb-6">
                {editingProduct ? `Edit Master: ${editingProduct.brandName} ${editingProduct.title}` : 'Add Master Inventory Record'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-[#C5A059] font-bold">Brand Name</label>
                    <Input 
                      placeholder="e.g. Apple, Samsung, Sony..."
                      value={brandName}
                      onChange={e => setBrandName(e.target.value)}
                      className="bg-black/40 border-white/10 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-[#C5A059] font-bold">Product Title Model</label>
                    <Input 
                      placeholder="e.g. iPhone 15 Pro, S24 Ultra..."
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      className="bg-black/40 border-white/10 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-[#C5A059] font-bold">Category</label>
                    <select 
                      value={category}
                      onChange={e => setCategory(e.target.value as any)}
                      className="w-full bg-black/40 border border-white/10 text-white text-xs h-10 px-3 rounded-lg focus:outline-none focus:border-[#C5A059]"
                    >
                      {TECH_GEAR_CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-[#C5A059] font-bold">Baseline Price Reference (MSRP)</label>
                    <Input 
                      type="number"
                      placeholder="e.g. 999"
                      value={price}
                      onChange={e => setPrice(Number(e.target.value))}
                      className="bg-black/40 border-white/10 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-mono tracking-widest text-[#C5A059] font-bold">Product Image URL</label>
                  <Input 
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={featuredImage}
                    onChange={e => setFeaturedImage(e.target.value)}
                    className="bg-black/40 border-white/10 text-white text-xs"
                  />
                  <span className="block text-[8px] text-white/30 font-mono">Input a valid Unsplash or secure address image anchor</span>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-mono tracking-widest text-[#C5A059] font-bold">Description Definition</label>
                  <textarea 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Provide a comprehensive technical summary description..."
                    rows={3}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                {/* Spec Attribute dynamic list details wrapper */}
                <div className="space-y-4 border-t border-white/5 pt-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-[#C5A059] font-bold">Technical Specifications Spreadsheet</label>
                    <Button 
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleAddSpecRow}
                      className="text-[#C5A059] hover:bg-[#C5A059]/10 text-[10px] uppercase tracking-wider font-bold shrink-0 p-2 h-7 gap-1 flex items-center"
                    >
                      <PlusCircle size={14} /> Add Row
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {specs.map((item, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <Input 
                          placeholder="Spec Metric (e.g. Memory)"
                          value={item.name}
                          onChange={e => handleSpecChange(index, 'name', e.target.value)}
                          className="bg-black/40 border-white/10 text-white text-xs flex-1"
                        />
                        <Input 
                          placeholder="Value (e.g. 16GB)"
                          value={item.value}
                          onChange={e => handleSpecChange(index, 'value', e.target.value)}
                          className="bg-black/40 border-white/10 text-white text-xs flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => handleRemoveSpecRow(index)}
                          className="text-red-500 hover:bg-red-500/15 p-2 h-9 w-9 shrink-0 border border-red-500/10"
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-white/5 pt-4">
                  <Button 
                    type="button"
                    variant="ghost"
                    onClick={() => setIsFormOpen(false)}
                    className="border border-white/5 text-white/50 hover:bg-white/5 h-10 px-5 text-xs rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-[#C5A059] hover:bg-white text-black font-bold h-10 px-6 text-xs rounded-xl uppercase tracking-widest font-mono flex items-center gap-1.5"
                  >
                    <Save size={14} /> Save Product Record
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
