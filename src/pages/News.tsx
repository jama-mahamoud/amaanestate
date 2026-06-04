import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { TrendingUp, Newspaper, Clock, ArrowRight, Calendar, Sparkles, ChevronDown, Search, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { articleService } from '@/services/articleService';
import { Article } from '@/types';

const CATEGORIES = [
  'All', 'Real Estate', 'Investment', 'Construction', 
  'Regional Development', 'Economy', 'Infrastructure', 'Land & Urban Growth'
];

// Helper to determine reading time based on word count
const calculateReadTime = (content: string): number => {
  if (!content) return 3;
  const words = content.replace(/<[^>]*>/g, '').trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 225));
};

// Helper to clean summary text
const cleanSummaryText = (content: string, length = 160): string => {
  if (!content) return '';
  const text = content.replace(/<[^>]*>/g, '').trim();
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

// Date formatter
const formatDate = (dateValue: any) => {
  if (!dateValue) return 'Recently';
  let date: Date;
  if (dateValue && typeof dateValue.toMillis === 'function') {
    date = new Date(dateValue.toMillis());
  } else if (dateValue && dateValue.seconds) {
    date = new Date(dateValue.seconds * 1000);
  } else if (dateValue instanceof Date) {
    date = dateValue;
  } else {
    const parsed = new Date(dateValue);
    if (!isNaN(parsed.getTime())) {
      date = parsed;
    } else {
      return 'Recently';
    }
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Separated Sub-component for Featured Article Card
const FeaturedArticleCard = ({ article }: { article: Article }) => {
  const readTime = calculateReadTime(article.content || '');
  const summary = article.summary || cleanSummaryText(article.content || '', 200);

  return (
    <div className="mb-20">
      <Link to={`/news/${article.slug || article.id}`} className="group block relative">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center bg-white/[0.02] hover:bg-white/[0.04] p-6 lg:p-8 rounded-[2.5rem] border border-white/5 hover:border-[#C5A059]/20 transition-all duration-500">
          <div className="lg:col-span-7 aspect-[16/10] rounded-[1.8rem] overflow-hidden relative shadow-2xl bg-white/5">
            <img 
              src={article.featuredImage || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200'} 
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-[1.2s] ease-out" 
              alt={article.title} 
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 lg:hidden" />
            <div className="absolute top-6 left-6 z-10">
              <Badge className="bg-[#C5A059] text-black hover:bg-[#C5A059] font-bold text-[9px] tracking-widest uppercase border-0 px-3 py-1">
                Featured Report
              </Badge>
            </div>
          </div>
          
          <div className="lg:col-span-12 xl:col-span-5 space-y-6 flex flex-col justify-center lg:col-start-1 xl:col-span-5">
            <div className="flex items-center gap-3 text-white/40 text-xs font-mono">
              <span className="text-[#C5A059] font-bold uppercase tracking-wider">{article.category || 'Real Estate'}</span>
              <span>•</span>
              <span>{formatDate(article.createdAt)}</span>
              <span>•</span>
              <span>{readTime} min read</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black leading-tight tracking-tight group-hover:text-[#C5A059] transition-colors duration-300">
              {article.title}
            </h2>
            
            <p className="text-white/60 text-base font-light leading-relaxed line-clamp-4">
              {summary}
            </p>
            
            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="inline-flex items-center gap-2 font-display uppercase font-bold tracking-widest text-xs text-white group-hover:text-[#C5A059] transition-colors">
                Access Intel Briefing <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform" />
              </span>
              <Sparkles size={16} className="text-[#C5A059]/50" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

// Separated Sub-component for individual grid list items (ArticleCard)
const ArticleCard = ({ article, index }: { article: Article; index: number }) => {
  const readTime = calculateReadTime(article.content || '');
  const summaryText = article.summary || cleanSummaryText(article.content || '', 120);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: (index % 3) * 0.1 }}
      className="h-full"
    >
      <Link 
        to={`/news/${article.slug || article.id}`} 
        className="flex flex-col h-full group bg-white/[0.02] border border-white/5 hover:border-[#C5A059]/30 rounded-2xl overflow-hidden hover:bg-white/[0.04] hover:shadow-2xl transition-all duration-300"
      >
        <div className="aspect-[16/10] overflow-hidden bg-white/5 relative">
          <img 
            src={article.featuredImage || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800'} 
            className="w-full h-full object-cover transform group-hover:scale-103 transition-transform duration-500 ease-out" 
            alt={article.title} 
            loading="lazy"
          />
          <div className="absolute top-4 left-4">
            <Badge className="bg-slate-950/80 border-0 text-white hover:bg-[#C5A059] hover:text-black font-bold text-[8px] uppercase tracking-wider">
              {article.category || 'Market'}
            </Badge>
          </div>
        </div>

        <div className="p-6 flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-white/40 text-[10px] font-mono">
              <span>{formatDate(article.createdAt)}</span>
              <span>•</span>
              <span>{readTime} min read</span>
            </div>
            
            <h4 className="text-xl font-display font-medium leading-snug tracking-tight text-white group-hover:text-[#C5A059] transition-colors duration-300 line-clamp-2">
              {article.title}
            </h4>
            
            <p className="text-white/50 text-xs sm:text-sm font-light leading-relaxed line-clamp-3">
              {summaryText}
            </p>
          </div>

          <div className="pt-4 border-t border-white/5 mt-6 flex items-center justify-between text-xs text-white/70 group-hover:text-[#C5A059] transition-colors font-semibold uppercase tracking-wider">
            <span>Read briefing</span>
            <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default function News() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(6);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Ref for intersection observer scroll target
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // Fetch all articles
  useEffect(() => {
    let active = true;
    setLoading(true);
    articleService.getArticles(undefined, undefined, true)
      .then(data => {
        if (active) {
          setArticles(data);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error("Failed to fetch articles:", err);
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  // Filter based on active category and search query
  const filteredArticles = useMemo(() => {
    let filtered = articles;
    
    if (activeCategory !== 'All') {
      filtered = filtered.filter(a => a.category === activeCategory);
    }
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(q) || 
        a.summary?.toLowerCase().includes(q) || 
        (a.tags || []).some(t => t.toLowerCase().includes(q)) ||
        a.content?.toLowerCase().includes(q)
      );
    }
    
    return filtered;
  }, [articles, activeCategory, searchQuery]);

  // Featured article (first published article, or marked isFeatured)
  const featuredArticle = useMemo(() => {
    return filteredArticles.find(a => a.isFeatured) || filteredArticles[0];
  }, [filteredArticles]);

  // Regular articles (all excluding the featured one)
  const regularArticles = useMemo(() => {
    return filteredArticles.filter(a => a.id !== featuredArticle?.id);
  }, [filteredArticles, featuredArticle]);

  // Currently visible regular articles based on pagination
  const visibleRegularArticles = useMemo(() => {
    return regularArticles.slice(0, visibleCount);
  }, [regularArticles, visibleCount]);

  const hasMore = regularArticles.length > visibleCount;

  // Handle Load more action safely with slight loading effect
  const handleLoadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => prev + 6); // Increment by exactly one full 3-column row pair (6 cards)
      setLoadingMore(false);
    }, 400); // Premium brief delayed feel
  }, [loadingMore, hasMore]);

  // Infinite scroll intersection observer setup
  useEffect(() => {
    if (!hasMore || loading) return;

    const observer = new IntersectionObserver((entries) => {
      const target = entries[0];
      if (target.isIntersecting) {
        handleLoadMore();
      }
    }, {
      rootMargin: '100px', // Trigger ahead of reaching actual bottom
      threshold: 0.1
    });

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [hasMore, loading, handleLoadMore]);

  // Reset pagination scale when category switches
  useEffect(() => {
    setVisibleCount(6);
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-24">
      <Helmet>
        <title>Market Insights & Intelligence | AmaanEstate</title>
        <meta name="description" content="Institutional inquiries, regional research, and major updates on the Somali Region's real estate development landscape." />
      </Helmet>
      
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Editorial Title Section */}
        <div className="py-12 border-b border-white/5 mb-16 relative overflow-hidden flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="absolute top-0 right-0 w-72 h-72 bg-luxury-gold/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-luxury-gold animate-pulse" />
              <span className="text-luxury-gold font-bold tracking-[0.3em] uppercase text-[10px]">Institutional Knowledge</span>
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-black tracking-tight leading-none">
              AmaanEstate <span className="text-white/30 font-light">Insights</span>
            </h1>
            <p className="text-white/50 text-base sm:text-lg lg:text-xl font-light">
              We compile and synthesize hard spatial data, transactional intelligence, and localized economic forecasts across the Somali region.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4 self-start md:self-end">
            <div className="relative group flex-1 min-w-[280px]">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/30 group-focus-within:text-[#C5A059] transition-colors">
                <Search size={16} />
              </div>
              <input 
                type="text"
                placeholder="Search by title or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white pl-11 pr-4 py-3 rounded-2xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#C5A059] focus:border-[#C5A059] transition-all placeholder:text-white/20"
              />
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-3.5 rounded-2xl shrink-0">
              <Newspaper size={16} className="text-luxury-gold" />
              <span className="text-xs font-mono font-semibold text-white/70">
                {articles.length} Articles Catalogued
              </span>
            </div>
          </div>
        </div>

        {/* Categories Carousel */}
        <div className="sticky top-20 z-30 bg-black/90 backdrop-blur-md py-4 mb-16 flex gap-2 overflow-x-auto no-scrollbar border-y border-white/5 animate-none">
          {CATEGORIES.map(cat => {
            const count = cat === 'All' 
              ? articles.length
              : articles.filter(a => a.category === cat).length;
            
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-[11px] uppercase font-bold tracking-widest whitespace-nowrap transition-all duration-300 flex items-center gap-2 outline-none border ${
                  activeCategory === cat 
                    ? 'bg-[#C5A059] hover:bg-[#C5A059]/90 text-black border-[#C5A059]' 
                    : 'bg-white/5 text-white/50 border-white/5 hover:border-white/20 hover:text-white'
                }`}
              >
                {cat}
                {count > 0 && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono ${
                    activeCategory === cat ? 'bg-black/15 text-black' : 'bg-white/10 text-white/40'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {loading ? (
          /* Premium Skeleton State Loader */
          <div className="py-24 space-y-12">
            <div className="h-[400px] rounded-[2rem] bg-white/5 animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="space-y-4">
                  <div className="aspect-[16/10] rounded-2xl bg-white/5 animate-pulse" />
                  <div className="h-6 w-3/4 rounded bg-white/5 animate-pulse" />
                  <div className="h-4 w-1/2 rounded bg-white/5 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Spotlight Banner (Featured Article) */}
            {featuredArticle && <FeaturedArticleCard article={featuredArticle} />}

            {/* Structured Grid Layout for Bullets */}
            {regularArticles.length > 0 ? (
              <div className="space-y-12">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <h3 className="text-sm font-display font-bold uppercase tracking-widest text-[#C5A059]">
                    Historical Intelligence Archive
                  </h3>
                  <span className="text-xs text-white/30 font-mono">
                    Showing {visibleRegularArticles.length} of {regularArticles.length} bulletins
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <AnimatePresence mode="popLayout">
                    {visibleRegularArticles.map((item, index) => (
                      <ArticleCard 
                        key={item.id} 
                        article={item} 
                        index={index} 
                      />
                    ))}
                  </AnimatePresence>
                </div>

                {/* Observer Anchor / Infinite scroll state */}
                {hasMore && (
                  <div ref={loaderRef} className="py-12 flex flex-col items-center justify-center gap-4">
                    {loadingMore ? (
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs text-white/50 font-light font-mono">Analyzing more bulletins...</span>
                      </div>
                    ) : (
                      <Button 
                        onClick={handleLoadMore} 
                        variant="outline" 
                        className="bg-transparent border-white/10 hover:border-[#C5A059] hover:bg-white/5 text-xs text-white/70 hover:text-white px-8 py-5 rounded-xl font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 h-auto"
                      >
                        <ChevronDown size={14} /> Load More Bulletins
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-24 border border-white/5 rounded-3xl bg-white/[0.01]">
                <BookOpen size={48} className="text-white/20 mx-auto mb-4 animate-bounce" />
                <h4 className="text-xl font-display font-bold text-white/80 mb-2">Wax warar ah wali lama daabicin.</h4>
                <p className="text-white/40 max-w-sm mx-auto text-sm font-light">
                  There are currently no published intelligence updates stored inside the "{activeCategory}" register. Check back shortly.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
