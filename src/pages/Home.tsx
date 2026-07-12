import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ExternalLink,
  ChevronRight,
  Percent
} from 'lucide-react';

import { ProductCard } from '@/components/product/ProductCard';

// Services
import { productService, UnifiedProduct } from '@/services/productService';
import { articleService } from '@/services/articleService';
import { Article } from '@/types';

// Date formatter helper for news
const formatNewsDate = (dateValue: any) => {
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

// Clean Category Label filter for premium editorial aesthetic
const getCleanCategoryLabel = (category?: string, type?: string) => {
  const val = (category || type || '').toLowerCase().trim();
  if (val.includes('software') || val.includes('tool')) {
    return 'Software & Tools';
  }
  if (val.includes('gear') || val.includes('hardware') || val.includes('tech')) {
    return 'Tech Gear';
  }
  if (val.includes('review') || val.includes('assessment') || val.includes('editorial')) {
    return 'Reviews';
  }
  return null;
};

export default function Home() {
  const navigate = useNavigate();

  // Dynamic Data States
  const [products, setProducts] = useState<UnifiedProduct[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchHomeData = async () => {
      setLoading(true);
      try {
        const [productsData, articlesData] = await Promise.all([
          productService.getUnifiedProducts(),
          articleService.getArticles(undefined, undefined, true)
        ]);

        if (active) {
          setProducts(productsData);
          
          // Sort and format articles securely
          const sortedArticles = articlesData.sort((a, b) => {
            const getTime = (val: any) => {
              if (!val) return 0;
              if (val && typeof val.toMillis === 'function') return val.toMillis();
              if (val.seconds) return val.seconds * 1000;
              if (val instanceof Date) return val.getTime();
              const parsed = new Date(val);
              return isNaN(parsed.getTime()) ? 0 : parsed.getTime();
            };
            return getTime(b.createdAt) - getTime(a.createdAt);
          });
          setArticles(sortedArticles);
        }
      } catch (err) {
        console.error('Error orchestrating Home page dynamic catalog load:', err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchHomeData();
    return () => {
      active = false;
    };
  }, []);

  // Section 1: Featured Reviews (only reviews)
  const featuredReviews = useMemo(() => {
    return products.filter(p => p.type === 'editorial-review').slice(0, 4);
  }, [products]);

  // Section 2: Software & Tools (only software)
  const softwareProducts = useMemo(() => {
    return products.filter(p => p.type === 'software').slice(0, 4);
  }, [products]);

  // Section 3: Tech Gear (only tech gear)
  const techGearProducts = useMemo(() => {
    return products.filter(p => p.type === 'tech-gear').slice(0, 4);
  }, [products]);

  // Section 4: Latest News
  const latestNews = useMemo(() => {
    return articles.slice(0, 4);
  }, [articles]);

  return (
    <div className="pt-24 pb-20 min-h-screen bg-[#060608] text-white font-sans">
      <Helmet>
        <title>PrimeDeals - Premium Tech & Software Reviews</title>
        <meta name="description" content="Discover our verified premium software tools and high-end technical equipment reviews." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="h-10 w-10 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-xs text-neutral-500 font-mono">Loading catalog...</p>
          </div>
        ) : (
          <>
            {/* Section 1: Featured Reviews */}
            {featuredReviews.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl md:text-2xl font-semibold text-white">Featured Reviews</h2>
                    <p className="text-sm text-neutral-400 mt-1">Our latest comprehensive product assessments.</p>
                  </div>
                  <Link to="/reviews" className="text-sm font-medium text-[#C5A059] hover:text-white flex items-center gap-1 transition-colors">
                    View All <ChevronRight size={16} />
                  </Link>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 items-stretch">
                  {featuredReviews.map(p => <ProductCard key={`featured-${p.id}`} p={p} />)}
                </div>
              </section>
            )}

            {/* Section 2: Software & Tools */}
            {softwareProducts.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl md:text-2xl font-semibold text-white">Software & Tools</h2>
                    <p className="text-sm text-neutral-400 mt-1">Premium applications and enterprise tools.</p>
                  </div>
                  <Link to="/software" className="text-sm font-medium text-[#C5A059] hover:text-white flex items-center gap-1 transition-colors">
                    View All <ChevronRight size={16} />
                  </Link>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 items-stretch">
                  {softwareProducts.map(p => <ProductCard key={`software-${p.id}`} p={p} />)}
                </div>
              </section>
            )}

            {/* Section 3: Tech Gear */}
            {techGearProducts.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl md:text-2xl font-semibold text-white">Tech Gear</h2>
                    <p className="text-sm text-neutral-400 mt-1">High-end hardware and technical equipment.</p>
                  </div>
                  <Link to="/tech-gear" className="text-sm font-medium text-[#C5A059] hover:text-white flex items-center gap-1 transition-colors">
                    View All <ChevronRight size={16} />
                  </Link>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 items-stretch">
                  {techGearProducts.map(p => <ProductCard key={`tech-${p.id}`} p={p} />)}
                </div>
              </section>
            )}

            {/* Section 4: Latest News */}
            {latestNews.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl md:text-2xl font-semibold text-white">Latest News</h2>
                    <p className="text-sm text-neutral-400 mt-1">Industry updates and technical intelligence.</p>
                  </div>
                  <Link to="/news" className="text-sm font-medium text-[#C5A059] hover:text-white flex items-center gap-1 transition-colors">
                    View All <ChevronRight size={16} />
                  </Link>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 items-stretch">
                  {latestNews.map(article => {
                    const cleanCategory = getCleanCategoryLabel(article.category, article.type);
                    return (
                      <div key={`news-${article.id}`} className="bg-[#0c0c11]/80 hover:bg-[#121218] border border-white/5 hover:border-[#C5A059]/20 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer" onClick={() => navigate(`/news/${article.slug || article.id}`)}>
                        {(() => {
                          const imgUrl = typeof article.featuredImage === 'string' ? article.featuredImage : article.featuredImage?.url;
                          return imgUrl ? (
                          <div className="aspect-video relative overflow-hidden bg-black/40 flex-shrink-0">
                            <img 
                              src={imgUrl} 
                              alt={article.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                              loading="lazy"
                            />
                          </div>
                        ) : (
                          <div className="aspect-video relative overflow-hidden bg-[#12121a] flex flex-col items-center justify-center border-b border-white/5 flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2">
                              <svg className="w-5 h-5 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                              </svg>
                            </div>
                            <span className="text-white/20 text-[9px] font-mono tracking-widest uppercase">Intelligence</span>
                          </div>
                        );
                        })()}
                        
                        <div className="p-3.5 sm:p-5 flex flex-col flex-grow">
                          {cleanCategory && (
                            <div className="mb-2 sm:mb-3">
                              <span className="bg-white/5 border border-white/10 text-[#C5A059] px-2 py-0.5 rounded text-[9px] uppercase font-mono tracking-wider">
                                {cleanCategory}
                              </span>
                            </div>
                          )}
                          <h3 className="text-xs sm:text-sm md:text-base font-semibold text-white leading-snug line-clamp-2 h-9 sm:h-12 mb-2 sm:mb-4 group-hover:text-[#C5A059] transition-colors">
                            {article.title}
                          </h3>
                          
                          <div className="mt-auto pt-2.5 sm:pt-4 border-t border-white/5 flex items-center text-[10px] sm:text-[11px] font-bold uppercase tracking-widest font-mono text-[#C5A059] group-hover:text-white transition-colors">
                            Read Article <ChevronRight size={14} className="ml-1" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </>
        )}

      </div>
    </div>
  );
}
