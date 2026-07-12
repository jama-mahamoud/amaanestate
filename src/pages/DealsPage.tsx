import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { 
  ExternalLink, 
  ShoppingBag,
  Percent
} from 'lucide-react';
import { productService, UnifiedProduct } from '@/services/productService';
import { ProductCard } from '@/components/product/ProductCard';
import { CATEGORY_LIST } from '@/data/categories';
import { CatalogFilters } from '@/components/product/CatalogFilters';

const ProductCardSkeleton = () => (
  <div className="bg-neutral-900/40 border border-neutral-800/60 rounded-2xl p-4 flex flex-col h-full animate-pulse space-y-3">
    <div className="bg-neutral-800 rounded-xl aspect-[4/3] w-full" />
    <div className="h-3 bg-neutral-800 rounded w-1/4" />
    <div className="h-4 bg-neutral-800 rounded w-3/4" />
    <div className="h-3 bg-neutral-800 rounded w-1/2" />
    <div className="flex justify-between items-center pt-2">
      <div className="h-5 bg-neutral-800 rounded w-1/3" />
      <div className="h-7 bg-[#C5A059]/20 rounded-lg w-1/4" />
    </div>
  </div>
);

export default function DealsPage() {
  const navigate = useNavigate();
  
  const [products, setProducts] = useState<UnifiedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Basic filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    async function loadCatalog() {
      setLoading(true);
      try {
        const data = await productService.getUnifiedProducts();
        setProducts(data);
      } catch (err) {
        console.error('Failed to load deals catalog products:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCatalog();
  }, []);

  // Filter core logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search query keyword filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(q) ||
        p.brandName.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }

    return result;
  }, [products, searchQuery, selectedCategory]);

  const categoryOptions = useMemo(() => {
    return CATEGORY_LIST.map(c => ({
      id: c.id,
      label: c.label,
      value: c.label
    }));
  }, []);

  return (
    <div className="pt-28 pb-20 min-h-screen bg-[#060608] text-white selection:bg-[#C5A059]/30 relative font-sans">
      <Helmet>
        <title>Reviews - Tech Gear & Software Tool Assessments</title>
        <meta name="description" content="Discover our verified premium software tools and high-end technical equipment reviews." />
      </Helmet>

      {/* Radiant ambient mesh */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-[#C5A059]/[0.01] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-emerald-500/[0.01] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
        
        {/* HEADER & FILTERS BAR */}
        <CatalogFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categoryOptions}
          searchPlaceholder="Search products or brands..."
          allLabel="All Categories"
        />

        {/* SHOPPING GRID CONTAINER (Desktop: 4 columns, Mobile: 2 columns) */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 items-stretch">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-24 bg-white/[0.01] border border-white/5 rounded-2xl max-w-md mx-auto p-6">
            <ShoppingBag className="mx-auto h-8 w-8 text-[#C5A059] mb-4 opacity-50" />
            <h3 className="text-base font-semibold mb-1">No Catalog Items Match</h3>
            <p className="text-xs text-neutral-450 mb-6">Modify or reset your search parameters to explore all related items.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 items-stretch">
            {filteredProducts.map(p => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
