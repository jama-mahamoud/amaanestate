import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ExternalLink, 
  Sparkles, 
  ArrowRight,
  Search,
  LayoutGrid,
  Star,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { reviewService, EditorialReview } from '@/services/reviewService';
import { CATEGORY_LIST, getCategoryLabel, normalizeCategory, getCategoryIcon } from '@/data/categories';

export default function HomePageDealsRenderer() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomepage = location.pathname === '/' || location.pathname === '/home';

  const [reviews, setReviews] = useState<EditorialReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Category states (only used on Category page /deals)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    let active = true;
    const fetchReviews = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch ONLY approved reviews directly from Editorial Affiliate CMS
        const data = await reviewService.getAllReviews(true);
        console.log('[Reviews CMS Debug] Loaded reviews from DB:', data);
        
        if (active) {
          setReviews(data);
        }
      } catch (err) {
        console.error('Error fetching CMS reviews:', err);
        if (active) setError("Failed to synchronize reviews. Please refresh.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    fetchReviews();
    return () => {
      active = false;
    };
  }, []);

  // Filter & Search Logic
  const filteredReviews = useMemo(() => {
    let list = [...reviews];

    // Sub-filter by Category of the CMS review if on Category Page
    if (!isHomepage && selectedCategory !== 'all') {
      list = list.filter(r => normalizeCategory(r.category) === normalizeCategory(selectedCategory));
    }

    // Keyword Search
    if (!isHomepage && searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      list = list.filter(r => 
        (r.title && r.title.toLowerCase().includes(q)) || 
        (r.brandName && r.brandName.toLowerCase().includes(q)) ||
        (r.excerpt && r.excerpt.toLowerCase().includes(q)) ||
        (r.category && r.category.toLowerCase().includes(q))
      );
    }

    // If Homepage, limit to exactly 3 entries max
    if (isHomepage) {
      return list.slice(0, 3);
    }

    return list;
  }, [reviews, selectedCategory, searchQuery, isHomepage]);

  // Categories taxonomy for category filtering tabs on /deals
  const categoryFilters = useMemo(() => {
    return [
      { id: 'all', label: 'All Reviews', icon: <LayoutGrid size={13} /> },
      ...CATEGORY_LIST.map(cat => {
        const Icon = cat.icon;
        return {
          id: cat.id,
          label: cat.label,
          icon: <Icon size={13} />
        };
      })
    ];
  }, []);

  return (
    <section className="py-20 border-t border-white/5 bg-[#08080a] relative overflow-hidden">
      {/* Decorative cosmic background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(197,160,89,0.03),transparent_40%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(197,160,89,0.02),transparent_40%)] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#C5A059]/10 border border-[#C5A059]/20 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A059] mb-4">
              <Sparkles size={10} /> {isHomepage ? "Latest Assessments" : "Reviews Directory"}
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-medium text-white tracking-tight">
              {isHomepage ? "Verified Editorial Assessments & Reviews" : "In-Depth Product & Tech Assessments"}
            </h2>
            <p className="text-white/40 text-sm mt-3 max-w-2xl font-light leading-relaxed">
              Transparent evaluations, comprehensive software tests, and purchasing recommendations curated directly by our technical publication team.
            </p>
          </div>
          
          {isHomepage && reviews.length > 3 && (
            <Button
              onClick={() => navigate('/deals')}
              variant="outline"
              className="border-white/10 hover:border-[#C5A059]/30 hover:bg-[#C5A059]/5 text-white font-mono text-[9px] uppercase tracking-widest rounded-xl h-11 px-6 font-bold cursor-pointer transition-all self-start md:self-end"
            >
              View All Reviews <ArrowRight size={12} className="ml-2" />
            </Button>
          )}
        </div>

        {/* Search & Filtration Drawer - Visible ONLY on Reviews Category Page */}
        {!isHomepage && (
          <div className="mb-12 space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search Bar */}
              <div className="relative w-full md:max-w-md">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <Input
                  type="text"
                  placeholder="Search reviews by brand, title, keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 bg-white/[0.02] border-white/5 focus:border-[#C5A059]/30 text-white rounded-xl h-12 w-full"
                />
              </div>

              {/* Status Indicator */}
              <div className="hidden md:block text-xs font-mono text-white/30 lowercase">
                Loaded {filteredReviews.length} professional assessments
              </div>
            </div>

            {/* Category Tags scrollable row */}
            <div className="flex flex-wrap gap-2 pb-2 overflow-x-auto no-scrollbar pt-1">
              {categoryFilters.map((tab) => {
                const isActive = tab.id === selectedCategory;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedCategory(tab.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-sans rounded-xl border transition-all whitespace-nowrap cursor-pointer ${
                      isActive 
                        ? 'bg-[#C5A059] border-[#C5A059] text-black font-semibold shadow-lg'
                        : 'bg-white/[0.02] border-white/5 hover:border-white/10 text-white/60 hover:text-white'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Content State Handler */}
        {error ? (
          <div className="py-20 text-center border border-red-500/10 rounded-[3rem] bg-white/[0.01] max-w-xl mx-auto px-8">
            <h4 className="text-xl font-display font-semibold text-red-400 mb-2">Sync Error</h4>
            <p className="text-white/40 text-sm">{error}</p>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div 
                key={i} 
                className="aspect-[4/5] bg-white/[0.02] border border-white/5 rounded-3xl animate-pulse flex flex-col justify-between p-6"
              >
                <div className="space-y-4">
                  <div className="h-6 w-2/3 bg-white/10 rounded-lg" />
                  <div className="h-24 w-full bg-white/10 rounded-xl" />
                </div>
                <div className="h-10 w-full bg-white/10 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredReviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredReviews.map((review, idx) => {
                const categoryLabel = getCategoryLabel(review.category);
                
                return (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.08, duration: 0.5, ease: 'easeOut' }}
                    className="group relative bg-[#0a0a0f] hover:bg-[#111116] border border-white/5 hover:border-[#C5A059]/30 rounded-3xl overflow-hidden transition-all duration-300 shadow-2xl flex flex-col justify-between"
                  >
                    {/* Badge Overlay */}
                    {review.rating && (
                      <div className="absolute top-4 left-4 z-10 px-2.5 py-1 rounded-lg bg-[#C5A059] text-black text-[10px] font-black tracking-wider font-mono shadow-md flex items-center gap-1 select-none">
                        <Star size={11} fill="black" stroke="none" />
                        {Number(review.rating).toFixed(1)}
                      </div>
                    )}

                    {/* Image Area */}
                    <div className="relative aspect-video w-full overflow-hidden bg-neutral-950 border-b border-white/5 bg-gradient-to-b from-[#C5A059]/10 to-transparent">
                      <img 
                        src={review.featuredImage || "/house_luxury_icon.png"} 
                        alt={review.title} 
                        className="w-full h-full object-cover select-none group-hover:scale-105 transition-transform duration-500 brightness-75 group-hover:brightness-90"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Content Details */}
                    <div className="p-6 flex-grow flex flex-col justify-between">
                      <div>
                        {/* Parent Product Reference */}
                        <div className="flex items-center justify-between text-[9px] tracking-widest uppercase font-black font-mono text-white/30 mb-3 border-b border-white/[0.03] pb-2">
                          <span className="text-[#C5A059]">{review.brandName}</span>
                          <span>{categoryLabel}</span>
                        </div>

                        <h3 className="text-base font-display font-medium text-white group-hover:text-[#C5A059] transition-colors leading-snug line-clamp-2 min-h-[44px]">
                          {review.title}
                        </h3>
                        
                        <p className="text-white/40 text-xs mt-3 leading-relaxed line-clamp-2 min-h-[36px] font-light">
                          {review.excerpt || review.ctaSummary || "Read our technical review and performance assessment of the premium solution."}
                        </p>
                      </div>

                      {/* CTA Route Action */}
                      <div className="mt-6 pt-1">
                        <div className="flex gap-3 w-full">
                          <button 
                            onClick={() => navigate(`/reviews/${review.slug}`)}
                            className="flex-1 flex items-center justify-center gap-1.5 h-11 bg-white/[0.04] hover:bg-[#C5A059]/15 text-white font-semibold text-[10px] uppercase tracking-widest font-mono rounded-xl transition-all border border-white/10 cursor-pointer"
                          >
                            <BookOpen size={11} /> Read Review
                          </button>
                          
                          <a 
                            href={review.affiliateUrl}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-1.5 h-11 bg-[#C5A059] hover:bg-white text-black font-semibold text-[10px] uppercase tracking-widest font-mono rounded-xl transition-all shadow-md active:scale-[0.98]"
                          >
                            Buy Now <ExternalLink size={11} />
                          </a>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          /* Empty state - shown if no approved reviews exist */
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-20 md:py-28 text-center border border-white/5 rounded-[3rem] bg-white/[0.01] max-w-xl mx-auto px-8"
          >
            <div className="w-16 h-16 bg-[#C5A059]/5 border border-[#C5A059]/10 text-white/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <BookOpen size={24} />
            </div>
            <h4 className="text-xl font-display font-semibold text-white mb-2">No reviews matches selection</h4>
            <p className="text-white/40 text-sm leading-relaxed max-w-sm mx-auto mb-6 font-light">
              We currently do not have any certified active reviews available in this category. Please check back later.
            </p>
            <Button
              onClick={() => setSelectedCategory('all')}
              className="bg-transparent hover:bg-white/5 text-[#C5A059] hover:text-[#C5A059] border border-[#C5A059]/20 font-mono text-[9px] uppercase tracking-widest h-11 px-8 rounded-xl cursor-pointer"
            >
              Reset Filters
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
