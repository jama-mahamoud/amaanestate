import { useState, useEffect, useMemo } from 'react';
import { 
  Laptop,
  Box,
  Star,
  ExternalLink,
  Info,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { softwareToolsService, SoftwareTool } from '@/services/softwareToolsService';
import { ProductCard } from '@/components/product/ProductCard';
import { CatalogFilters } from '@/components/product/CatalogFilters';
import { UnifiedProduct } from '@/services/productService';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const SOFTWARE_SUBCATEGORIES = [
  { id: 'all', label: 'All Software' },
  { id: 'ai-tools', label: 'AI Tools' },
  { id: 'education-software', label: 'Education Software' },
  { id: 'productivity-tools', label: 'Productivity Tools' },
  { id: 'saas-platforms', label: 'SaaS Platforms' },
  { id: 'development-tools', label: 'Development Tools' },
  { id: 'security-software', label: 'Security Software' },
];

function parsePrice(pStr: string | undefined): number {
  if (!pStr) return 0;
  const num = parseFloat(pStr.replace(/[^0-9.]/g, ''));
  return isNaN(num) ? 0 : num;
}

function mapSoftwareToolToUnifiedProduct(sw: SoftwareTool): UnifiedProduct {
  const hasDiscount = sw.pricing?.includes('$');
  let originalPrice: string | undefined = undefined;
  if (hasDiscount) {
    const parsed = parsePrice(sw.pricing);
    if (parsed > 0) {
      originalPrice = `$${Math.round(parsed * 1.25)}`;
    }
  }

  return {
    id: `sw-${sw.id}`,
    sourceId: sw.id,
    type: 'software',
    brandName: sw.developer || 'Software Developer',
    title: sw.name,
    description: sw.shortDescription || sw.fullDescription || '',
    featuredImage: sw.featuredImage || sw.logoUrl || '',
    galleryImages: sw.galleryImages && sw.galleryImages.length > 0
      ? [sw.featuredImage || sw.logoUrl, ...sw.galleryImages]
      : [sw.featuredImage || sw.logoUrl].filter(Boolean) as string[],
    price: sw.pricing || 'Free / Demo',
    originalPrice,
    discountPrice: sw.pricing,
    discountPercent: hasDiscount ? 20 : undefined,
    rating: 4.8,
    category: sw.category || 'Software Utility',
    specs: [
      { name: 'Developer', value: sw.developer || 'Unknown' },
      { name: 'Platform Support', value: sw.platform || 'Cross-Platform Web' },
      { name: 'License Type', value: sw.pricing || 'Commercial' }
    ],
    keyFeatures: sw.features || ['Intelligent cloud synchronization', 'Advanced data exports', 'Secure tokenized backend'],
    pros: sw.pros || ['Easy onboarding', 'Comprehensive reporting suite', 'Low memory usage'],
    cons: sw.cons || ['Advanced filters require subscription tier'],
    affiliateUrl: sw.affiliateUrl || '#',
    slug: sw.slug || (sw.name ? sw.name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '') : undefined),
    faqs: [
      { question: 'Is training required to use this software?', answer: 'No, it has an intuitive visual wizard interface built for self-guided onboarding.' },
      { question: 'Are secure data backups supported?', answer: 'Yes, full compliance encryption and secure routine backups are managed cloud-side.' }
    ],
    buyingAdvice: `When choosing a digital solution in the ${sw.category || 'software'} category, look for options that integrate with your pipeline, support scalable user tiers, and provide adequate security protocols.`,
    editorialRecommendation: 'An excellent SaaS platform that improves data consistency and reduces manual administrative workloads.',
    compatibility: ['Windows 11', 'macOS Sonoma', 'iOS & Android WebApp'],
    availability: 'Instant Download'
  };
}

export default function SoftwareToolsPage() {
  const [softwareTools, setSoftwareTools] = useState<SoftwareTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'featured' | 'all'>('featured');

  useEffect(() => {
    let active = true;
    const loadSoftwareTools = async () => {
      setLoading(true);
      try {
        const data = await softwareToolsService.getAllSoftware(true);
        if (active) {
          setSoftwareTools(data);
        }
      } catch (error) {
        console.error("Failed to load Software & Tools content:", error);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadSoftwareTools();
    return () => { active = false; };
  }, []);

  const filteredSoftware = useMemo(() => {
    let list = softwareTools;

    if (selectedSubCategory !== 'all') {
      const sub = selectedSubCategory.toLowerCase();
      list = list.filter(sw => {
        const cat = (sw.category || '').toLowerCase();
        const name = (sw.name || '').toLowerCase();
        const dev = (sw.developer || '').toLowerCase();
        const desc = (sw.shortDescription || sw.fullDescription || '').toLowerCase();
        
        if (sub === 'ai-tools') {
          return cat.includes('ai') || name.includes('ai') || desc.includes('ai') || desc.includes('gpt') || desc.includes('copilot');
        }
        if (sub === 'education-software') {
          return cat.includes('edu') || cat.includes('learn') || name.includes('learn') || desc.includes('education') || desc.includes('academy');
        }
        if (sub === 'productivity-tools') {
          return cat.includes('prod') || cat.includes('work') || name.includes('task') || desc.includes('productivity') || desc.includes('management');
        }
        if (sub === 'saas-platforms') {
          return cat.includes('saas') || cat.includes('platform') || name.includes('saas') || desc.includes('cloud');
        }
        if (sub === 'development-tools') {
          return cat.includes('dev') || cat.includes('code') || name.includes('code') || desc.includes('api') || desc.includes('database');
        }
        if (sub === 'security-software') {
          return cat.includes('secure') || cat.includes('security') || name.includes('shield') || desc.includes('privacy');
        }
        return cat.includes(sub);
      });
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      list = list.filter(sw => 
        (sw.developer || '').toLowerCase().includes(q) ||
        (sw.name || '').toLowerCase().includes(q) ||
        (sw.shortDescription || sw.fullDescription || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [softwareTools, selectedSubCategory, searchQuery]);

  const allApprovedProducts = useMemo(() => {
    return softwareTools.filter(sw => sw.status === 'published');
  }, [softwareTools]);

  return (
    <div className="pt-24 pb-28 min-h-screen bg-[#070707] text-white selection:bg-[#C5A059]/30 relative">
      {/* Right Side "All Products" Panel Toggle */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 hidden xl:block">
        <button 
          onClick={() => setViewMode(viewMode === 'featured' ? 'all' : 'featured')}
          className={`flex flex-col items-center gap-4 py-8 px-3 rounded-l-2xl border-y border-l transition-all duration-300 group ${
            viewMode === 'all' 
            ? 'bg-[#C5A059] border-[#C5A059] text-black shadow-[0_0_50px_rgba(197,160,89,0.3)]' 
            : 'bg-[#111] border-white/10 text-white/40 hover:text-white hover:bg-white/5'
          }`}
        >
          <div className="[writing-mode:vertical-lr] text-[10px] font-black uppercase tracking-[0.3em] rotate-180">
            {viewMode === 'all' ? 'Return to Featured' : 'All Software Directory'}
          </div>
          <Box size={18} className={viewMode === 'all' ? '' : 'group-hover:text-[#C5A059]'} />
        </button>
      </div>

      {/* Mobile Toggle Floating */}
      <div className="fixed bottom-8 right-8 z-40 xl:hidden">
        <Button 
          onClick={() => setViewMode(viewMode === 'featured' ? 'all' : 'featured')}
          className={`h-14 w-14 rounded-2xl shadow-2xl flex items-center justify-center p-0 ${
            viewMode === 'all' ? 'bg-[#C5A059] text-black' : 'bg-white text-black'
          }`}
        >
          {viewMode === 'all' ? <Star size={24} /> : <Box size={24} />}
        </Button>
      </div>

      {/* Hero */}
      <section className="relative py-16 md:py-20 border-b border-white/5 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-[#C5A059]/[0.02] blur-[120px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 md:px-6 relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-[#C5A059]/10 border border-[#C5A059]/20 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A059] mb-6"
          >
            <Laptop size={12} /> Strategic Hub
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-display font-medium text-white tracking-tight leading-[1.1] mb-6"
          >
            Software & <br /> <span className="text-[#C5A059] italic">Tools Portal</span>
          </motion.h1>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-16 min-h-[600px] space-y-8">
        <CatalogFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedSubCategory}
          setSelectedCategory={setSelectedSubCategory}
          categories={SOFTWARE_SUBCATEGORIES}
          searchPlaceholder="Search for software tools..."
          allLabel="All Software"
        />

        <AnimatePresence mode="wait">
          {viewMode === 'featured' ? (
            <motion.div 
              key="featured-view"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.4 }}
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <div className="h-10 w-10 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest font-bold">Loading software suite...</p>
                </div>
              ) : softwareTools.length === 0 ? (
                <div className="text-center py-32 bg-white/[0.01] border border-white/5 rounded-[3rem] px-8">
                  <div className="w-16 h-16 bg-[#C5A059]/10 rounded-full flex items-center justify-center mx-auto mb-6 text-[#C5A059]">
                    <Laptop size={28} />
                  </div>
                  <h3 className="text-xl font-display font-medium text-white mb-2 text-slate-100">No Software Available</h3>
                  <p className="text-white/40 text-sm max-w-md mx-auto">There are currently no published software profiles. Please check back soon.</p>
                </div>
              ) : filteredSoftware.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 items-stretch">
                   {filteredSoftware.map(sw => (
                      <ProductCard key={sw.id} p={mapSoftwareToolToUnifiedProduct(sw)} />
                   ))}
                </div>
              ) : (
                <div className="text-center py-32 bg-white/[0.01] border border-white/5 rounded-[3rem] px-8">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-white/20">
                    <Search size={24} />
                  </div>
                  <h3 className="text-xl font-display font-medium text-white mb-2">No matching software tools found</h3>
                  <p className="text-white/40 text-sm max-w-xs mx-auto">Try adjusting your category chips or search query.</p>
                  <Button 
                    onClick={() => {setSearchQuery(''); setSelectedSubCategory('all');}} 
                    className="mt-8 bg-[#C5A059] hover:bg-white text-black font-bold h-11 px-8 rounded-xl"
                  >
                    Reset Filter Options
                  </Button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="all-view"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/[0.02] border border-white/5 p-6 rounded-3xl mb-12">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#C5A059]/10 flex items-center justify-center text-[#C5A059]">
                    <Box size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-bold text-white">Full Software Directory</h2>
                    <p className="text-white/40 text-xs uppercase tracking-widest font-mono">Software Catalog Alpha-02</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-white/20 text-[10px] font-bold uppercase tracking-widest mr-2">Count: {allApprovedProducts.length}</span>
                  <Button 
                    variant="outline" 
                    onClick={() => setViewMode('featured')}
                    className="border-white/10 text-white/60 hover:text-white h-10 px-6 rounded-xl text-xs"
                  >
                    Return to Featured
                  </Button>
                </div>
              </div>

              <div className="max-h-[800px] overflow-y-auto no-scrollbar pr-2 space-y-3">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-24">
                    <div className="h-10 w-10 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest font-bold">Loading software suite...</p>
                  </div>
                ) : allApprovedProducts.length > 0 ? (
                  allApprovedProducts.map((product) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={product.id}
                      className="group flex flex-col md:flex-row items-center justify-between gap-4 p-4 md:p-5 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-[#C5A059]/20 rounded-2xl transition-all duration-300"
                    >
                      <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl overflow-hidden bg-neutral-900 border border-white/5 shrink-0">
                          {product.featuredImage || product.logoUrl ? (
                            <img src={product.featuredImage || product.logoUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-white/5">
                              <Box className="text-white/10" size={24} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded-md bg-[#C5A059]/10 text-[#C5A059] text-[9px] font-bold uppercase tracking-widest">
                               {product.category || 'Software'}
                            </span>
                            <span className="text-[10px] text-white/30 font-mono">#{product.id.slice(-6)}</span>
                          </div>
                          <h4 className="text-white font-bold truncate group-hover:text-[#C5A059] transition-colors">{product.developer || 'Software Developer'}</h4>
                          <p className="text-white/40 text-xs truncate max-w-[200px] md:max-w-[300px]">{product.name || product.shortDescription}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                        <div className="hidden sm:block text-right mr-4">
                           <div className="text-[10px] text-white/20 uppercase tracking-widest font-bold mb-1">Trust Score</div>
                           <div className="flex gap-0.5 justify-end">
                             {[...Array(5)].map((_, i) => (
                               <Star key={i} size={10} className={i < 4 ? "text-[#C5A059] fill-[#C5A059]" : "text-white/10"} />
                             ))}
                           </div>
                        </div>
                        <Link 
                          to={`/product/${product.slug || `sw-${product.id}`}`}
                          className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/5 border border-white/5 hover:border-[#C5A059]/30 hover:bg-[#C5A059]/10 text-white/40 hover:text-[#C5A059] transition-all"
                        >
                          <Info size={18} />
                        </Link>
                        <a 
                          href={product.affiliateUrl || '#'} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 px-6 h-10 md:h-12 bg-[#C5A059] hover:bg-white text-black font-bold rounded-xl text-xs uppercase tracking-widest transition-all"
                        >
                          Access <ExternalLink size={14} />
                        </a>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="py-32 text-center bg-white/[0.01] border border-white/5 rounded-[3rem] px-8">
                     <div className="w-16 h-16 bg-[#C5A059]/10 rounded-full flex items-center justify-center mx-auto mb-6 text-[#C5A059]">
                       <Laptop size={28} />
                     </div>
                     <h3 className="text-xl font-display font-medium text-white mb-2 text-slate-100">No Software Available</h3>
                     <p className="text-white/40 text-sm max-w-md mx-auto">There are currently no published software profiles. Please check back soon.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
