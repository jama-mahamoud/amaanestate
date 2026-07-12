import { useState, useEffect, useMemo } from 'react';
import { 
  Tv,
  Box,
  SlidersHorizontal,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { techGearService, TechGearProduct } from '@/services/techGearService';
import { reviewService, EditorialReview } from '@/services/reviewService';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductCard } from '@/components/product/ProductCard';
import { UnifiedProduct } from '@/services/productService';
import { CatalogFilters } from '@/components/product/CatalogFilters';

const TECHGEAR_SUBCATEGORIES = [
  { id: 'all', label: 'All Hardware' },
  { id: 'smartphones', label: 'Smartphones' },
  { id: 'laptops', label: 'Laptops' },
  { id: 'wearables', label: 'Wearables' },
  { id: 'audio-gear', label: 'Audio Gear' },
  { id: 'desktop-pcs', label: 'Desktop PCs' },
  { id: 'accessories', label: 'Accessories' },
  { id: 'components', label: 'Components' },
];

export default function TechGearPage() {
  const [products, setProducts] = useState<TechGearProduct[]>([]);
  const [reviews, setReviews] = useState<EditorialReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('all');
  const [activeProductDetails, setActiveProductDetails] = useState<TechGearProduct | null>(null);
  
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const toggleCompare = (id: string) => {
    setCompareIds(prev => 
      prev.includes(id) 
        ? prev.filter(x => x !== id) 
        : prev.length < 3 
          ? [...prev, id] 
          : prev
    );
  };

  const getReviewSlug = (product: TechGearProduct) => {
    const matched = reviews.find(r => 
      r.brandName.toLowerCase().trim() === product.brandName.toLowerCase().trim() ||
      product.title.toLowerCase().includes(r.brandName.toLowerCase().trim()) ||
      r.title.toLowerCase().includes(product.title.toLowerCase().trim())
    );
    return matched ? matched.slug : null;
  };

  useEffect(() => {
    let active = true;
    const loadTechGear = async () => {
      setLoading(true);
      setError(null);
      try {
        const [prodData, revData] = await Promise.all([
          techGearService.getAllProducts(true),
          reviewService.getAllReviews(true)
        ]);
        if (active) {
          setProducts(prodData);
          setReviews(revData);
        }
      } catch (error) {
        console.error("Failed to load Tech Gear data:", error);
        if (active) setError("Failed to load hardware catalog. Please check your connection.");
      } finally {
        if (active) setLoading(false);
      }
    };
    loadTechGear();
    return () => { active = false; };
  }, []);

  const filteredHardware = useMemo(() => {
    let list = products;

    if (selectedSubCategory !== 'all') {
      list = list.filter(p => p.category === selectedSubCategory);
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => 
        p.brandName.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [products, selectedSubCategory, searchQuery]);

  return (
    <div className="pt-24 pb-28 min-h-screen bg-[#070707] text-white selection:bg-[#C5A059]/30 relative">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-[#C5A059]/[0.03] via-transparent to-transparent blur-[120px] pointer-events-none" />

      {/* Hero Header */}
      <section className="relative py-12 md:py-16 border-b border-white/5 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 md:px-6 relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-[#C5A059]/10 border border-[#C5A059]/20 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A059] mb-6 animate-pulse"
          >
            <Tv size={12} /> Master Hardware Catalog
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-display font-medium text-white tracking-tight leading-[1.1] mb-6"
          >
            Tech Gear & <br /> <span className="text-[#C5A059] italic">Hardware Database</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/40 max-w-xl mx-auto text-sm"
          >
            Explore our curated inventory of physical hardware, specifications, and retail reference prices. Master records representing pure engineering metrics.
          </motion.p>
        </div>
      </section>

      {/* Master Catalog Content Grid */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12 space-y-8">
        <CatalogFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedSubCategory}
          setSelectedCategory={setSelectedSubCategory}
          categories={TECHGEAR_SUBCATEGORIES}
          searchPlaceholder="Search specs, brands, models..."
          allLabel="All Hardware"
        />

        {error ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="h-10 w-10 border-2 border-red-500 rounded-full flex items-center justify-center mb-4 text-red-500 font-bold">!</div>
            <p className="text-xs font-mono text-red-400 uppercase tracking-widest">{error}</p>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="h-10 w-10 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest font-bold">Querying master catalog records...</p>
          </div>
        ) : filteredHardware.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 items-stretch">
            {filteredHardware.map((product) => {
              const slug = getReviewSlug(product);
              const unifiedProduct: UnifiedProduct = {
                id: `tg-${product.id}`,
                sourceId: product.id,
                type: 'tech-gear',
                brandName: product.brandName || 'Hardware Manufacturer',
                title: product.title,
                description: product.description || '',
                featuredImage: product.featuredImage,
                galleryImages: product.galleryImages && product.galleryImages.length > 0
                  ? [product.featuredImage, ...product.galleryImages]
                  : [product.featuredImage],
                price: `$${product.price}`,
                originalPrice: product.price > 0 ? `$${Math.round(product.price * 1.15)}` : undefined,
                discountPrice: `$${product.price}`,
                discountPercent: 13,
                rating: 4.8,
                category: product.category || 'Hardware',
                specs: product.specs || [],
                keyFeatures: [
                  'Premium tactile quality build',
                  'Engineered for long-lasting heavy workloads',
                  'Sleek modern minimalist aesthetics'
                ],
                pros: ['Durable housing frame', 'High rating standards', 'Industry-proven design'],
                cons: ['Premium price', 'Requires minor workspace adjustment'],
                affiliateUrl: product.affiliateUrl || '#',
                slug: slug || undefined
              };
              return (
                <div key={product.id} className="relative">
                   <ProductCard p={unifiedProduct} />
                   {/* Compare Toggle Button overlay */}
                   <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCompare(product.id);
                      }}
                      className={`absolute top-2 right-2 z-10 px-2 py-1 rounded text-[10px] font-bold font-mono uppercase border transition-all ${
                        compareIds.includes(product.id)
                          ? 'bg-[#C5A059] border-[#C5A059] text-white font-semibold'
                          : 'bg-white/90 border-slate-200 text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {compareIds.includes(product.id) ? '✓' : '+'}
                    </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-28 bg-white/[0.01] border border-white/5 rounded-3xl px-8 max-w-md mx-auto">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-white/20">
              <Box size={24} />
            </div>
            <h3 className="text-xl font-display font-medium text-white mb-2">No hardware products available yet</h3>
            <p className="text-white/40 text-sm max-w-xs mx-auto">Check back later for new additions to the catalog.</p>
          </div>
        )}
      </section>

      {/* Specifications Details Modal overlay */}
      <AnimatePresence>
        {activeProductDetails && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setActiveProductDetails(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#0c0c10] border border-white/10 p-6 md:p-8 rounded-3xl max-w-2xl w-full relative max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl"
            >
              <button 
                onClick={() => setActiveProductDetails(null)}
                className="absolute top-4 right-4 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border border-white/5 transition-all"
              >
                ✕
              </button>

              <div className="flex flex-col md:flex-row gap-6 mt-2">
                <div className="w-full md:w-1/2 aspect-square rounded-2xl overflow-hidden bg-neutral-900 border border-white/5 grow-0 shrink-0">
                  <img 
                    src={activeProductDetails.featuredImage} 
                    alt={activeProductDetails.title}
                    className="w-full h-full object-cover select-none"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <span className="px-2.5 py-1 rounded bg-[#C5A059]/10 text-[#C5A059] text-[10px] font-bold uppercase tracking-widest font-mono select-none">
                      {activeProductDetails.category}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-display font-medium text-white mt-4">
                      {activeProductDetails.brandName} <span className="text-[#C5A059]">{activeProductDetails.title}</span>
                    </h2>
                    <p className="text-white/50 text-xs mt-3 leading-relaxed">
                      {activeProductDetails.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/5 mt-6">
                    <span className="text-[10px] uppercase font-mono text-white/30 font-bold block mb-1">MSRP Baseline</span>
                    <span className="text-2xl font-mono text-white font-bold">${activeProductDetails.price} USD</span>
                  </div>
                </div>
              </div>

              {/* Complete technical specs spreadsheet */}
              <div className="mt-8 border-t border-white/5 pt-6">
                <h4 className="text-sm font-display font-bold text-white uppercase tracking-wider mb-4 text-[#C5A059]">
                  Technical Specs Sheet
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeProductDetails.specs?.map((spec, i) => (
                    <div key={i} className="p-3.5 bg-white/[0.02] border border-white/5 rounded-xl flex flex-col justify-center">
                      <span className="text-[9px] uppercase font-mono text-[#C5A059]/40 font-bold tracking-wider">{spec.name}</span>
                      <span className="text-sm font-semibold text-white/80 mt-1">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Comparison Bar */}
      <AnimatePresence>
        {compareIds.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-[#0e0e14]/95 backdrop-blur-xl border-t border-[#C5A059]/20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] p-4 md:p-6"
          >
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#C5A059]/10 flex items-center justify-center text-[#C5A059]">
                  <SlidersHorizontal size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Compare Products</h4>
                  <p className="text-white/40 text-xs font-mono uppercase tracking-wider">{compareIds.length} of 3 selected</p>
                </div>
              </div>

              {/* Selected Cards preview */}
              <div className="flex items-center gap-3 overflow-x-auto max-w-full py-1">
                {compareIds.map(id => {
                  const prod = products.find(p => p.id === id);
                  if (!prod) return null;
                  return (
                    <div key={id} className="flex items-center gap-2 bg-white/5 border border-white/5 pl-2 pr-3 py-1.5 rounded-xl shrink-0">
                      <img src={prod.featuredImage} alt={prod.title} className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
                      <div className="text-left">
                        <span className="block text-[10px] font-bold text-white max-w-[100px] truncate">{prod.title}</span>
                        <span className="block text-[8px] font-mono text-white/30 uppercase">{prod.brandName}</span>
                      </div>
                      <button 
                        onClick={() => toggleCompare(id)}
                        className="text-white/40 hover:text-white ml-2 text-xs font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Button
                  onClick={() => setCompareIds([])}
                  variant="outline"
                  className="border-white/10 text-white/60 hover:text-white h-11 px-6 rounded-xl text-xs uppercase tracking-wider font-mono font-bold"
                >
                  Clear All
                </Button>
                <Button
                  onClick={() => setShowComparisonModal(true)}
                  className="bg-[#C5A059] hover:bg-white text-black h-11 px-8 rounded-xl text-xs uppercase tracking-wider font-mono font-bold shadow-lg shadow-[#C5A059]/20"
                >
                  Compare Now
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comparison Modal Overlay */}
      <AnimatePresence>
        {showComparisonModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={() => setShowComparisonModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#0c0c10] border border-white/10 p-6 md:p-8 rounded-3xl max-w-5xl w-full relative max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl"
            >
              <button 
                onClick={() => setShowComparisonModal(false)}
                className="absolute top-4 right-4 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border border-white/5 transition-all"
              >
                ✕
              </button>

              <h2 className="text-xl md:text-2xl font-display font-medium text-white mb-6">
                Hardware <span className="text-[#C5A059] italic">Comparison Desk</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Header/Spec Titles Column */}
                <div className="hidden md:block space-y-4 pt-44">
                  <div className="h-12 border-b border-white/5 flex items-center"><span className="text-xs font-bold text-white/40 font-mono uppercase tracking-wider">Brand / Maker</span></div>
                  <div className="h-12 border-b border-white/5 flex items-center"><span className="text-xs font-bold text-white/40 font-mono uppercase tracking-wider">Price MSRP</span></div>
                  <div className="h-12 border-b border-white/5 flex items-center"><span className="text-xs font-bold text-white/40 font-mono uppercase tracking-wider">Category</span></div>
                  <div className="h-44 border-b border-white/5 flex items-start pt-3"><span className="text-xs font-bold text-white/40 font-mono uppercase tracking-wider">Core Specifications</span></div>
                </div>

                {/* Compare items Columns */}
                {compareIds.map(id => {
                  const prod = products.find(p => p.id === id);
                  if (!prod) return null;
                  const slug = getReviewSlug(prod);
                  return (
                    <div key={id} className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 hover:border-[#C5A059]/20 transition-all flex flex-col justify-between">
                      <div className="text-center pb-4 border-b border-white/5">
                        <div className="h-28 flex items-center justify-center bg-black/20 p-2 rounded-xl mb-4">
                          <img src={prod.featuredImage} alt={prod.title} className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                        <h3 className="text-sm font-bold text-white line-clamp-1">{prod.title}</h3>
                        <p className="text-xs text-[#C5A059] font-mono font-bold mt-1 uppercase tracking-wider">{prod.brandName}</p>
                      </div>

                      <div className="space-y-4 pt-4 flex-grow">
                        {/* Mobile view labels inside blocks */}
                        <div className="h-12 border-b border-white/5 flex flex-col justify-center text-left md:text-center">
                          <span className="block md:hidden text-[8px] font-mono text-white/30 uppercase">Brand</span>
                          <span className="text-xs text-white/80 font-bold">{prod.brandName}</span>
                        </div>
                        <div className="h-12 border-b border-white/5 flex flex-col justify-center text-left md:text-center">
                          <span className="block md:hidden text-[8px] font-mono text-white/30 uppercase">Price</span>
                          <span className="text-sm text-[#C5A059] font-mono font-bold">${prod.price}</span>
                        </div>
                        <div className="h-12 border-b border-white/5 flex flex-col justify-center text-left md:text-center">
                          <span className="block md:hidden text-[8px] font-mono text-white/30 uppercase">Category</span>
                          <span className="text-xs text-white/60 uppercase font-mono">{prod.category}</span>
                        </div>
                        <div className="h-44 border-b border-white/5 flex flex-col gap-2 overflow-y-auto no-scrollbar pt-3 text-left">
                          <span className="block md:hidden text-[8px] font-mono text-white/30 uppercase mb-1">Specifications</span>
                          {prod.specs?.map((spec, i) => (
                            <div key={i} className="text-[10px] bg-white/5 p-1 px-2 rounded-md">
                              <span className="text-[#C5A059]/60 font-mono font-bold uppercase">{spec.name}:</span> <span className="text-white/80 font-semibold">{spec.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 space-y-2">
                        {slug ? (
                          <Link
                            to={`/reviews/${slug}`}
                            onClick={() => setShowComparisonModal(false)}
                            className="w-full h-10 bg-[#C5A059]/10 hover:bg-[#C5A059]/20 border border-[#C5A059]/30 hover:border-[#C5A059] text-[#C5A059] text-xs font-bold uppercase tracking-wider font-mono rounded-xl transition-all flex items-center justify-center gap-1"
                          >
                            Read Review
                          </Link>
                        ) : (
                          <Link
                            to="/reviews"
                            onClick={() => setShowComparisonModal(false)}
                            className="w-full h-10 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white text-xs font-bold uppercase tracking-wider font-mono rounded-xl transition-all flex items-center justify-center gap-1"
                          >
                            No Review Yet
                          </Link>
                        )}
                        <a
                          href={prod.affiliateUrl || '#'}
                          target="_blank"
                          rel="nofollow sponsored noopener noreferrer"
                          className="w-full h-10 bg-[#C5A059] hover:bg-white text-black text-xs font-bold uppercase tracking-wider font-mono rounded-xl transition-all flex items-center justify-center gap-1 shadow-lg shadow-[#C5A059]/10"
                        >
                          Buy Now <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
