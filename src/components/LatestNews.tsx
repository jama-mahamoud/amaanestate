import React, { useState, useEffect, memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ArrowRight, BookOpen, Calendar, ChevronRight, TrendingUp } from 'lucide-react';
import { articleService } from '@/services/articleService';
import { Article } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Reading time helper
const calculateReadTime = (content: string): number => {
  if (!content) return 3;
  const words = content.replace(/<[^>]*>/g, '').trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 225)); // average adult reading speed
};

// Clean HTML tags for summary helper
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

// Helper for badge color
const getTypeColor = (type?: string) => {
  const val = (type || '').toLowerCase().trim();
  switch (val) {
    case 'news':
    case 'update': return 'bg-blue-500';
    case 'report':
    case 'market_report': return 'bg-amber-600 text-white';
    case 'opportunity': return 'bg-purple-600 text-white';
    case 'announcement': return 'bg-red-500';
    case 'new_project': return 'bg-green-600';
    case 'short_insight': return 'bg-teal-600';
    default: return 'bg-[#C5A059]';
  }
};

// Clean Category Label filter for premium editorial aesthetic
const getCleanCategoryLabel = (category?: string | string[], type?: string | string[]) => {
  const catStr = Array.isArray(category) 
    ? category.filter(c => typeof c === 'string').join(' ') 
    : (typeof category === 'string' ? category : '');
  const typeStr = Array.isArray(type) 
    ? type.filter(t => typeof t === 'string').join(' ') 
    : (typeof type === 'string' ? type : '');
  const val = (catStr + ' ' + typeStr).toLowerCase().trim();
  if (!val) return 'News';
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

// Sub-component for Featured Article Card
const FeaturedArticleCard = ({ article }: { article: Article }) => {
  const summary = article.summary || cleanSummaryText(article.content || '', 240);
  const cleanCategory = getCleanCategoryLabel(article.category, article.type);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 768);
    }
  }, []);
  
  return (
    <motion.div
      id={`featured-article-${article.id}`}
      initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      whileInView={isMobile ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
      viewport={isMobile ? undefined : { once: true }}
      transition={isMobile ? { duration: 0 } : { duration: 0.6, ease: 'easeOut' }}
      className="group relative bg-white border border-slate-100 rounded-[2rem] overflow-hidden hover:border-[#C5A059]/30 transition-all duration-500 shadow-xl hover:shadow-2xl mb-10 lg:mb-12"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Banner Image Container */}
        <div className="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto min-h-[280px] lg:min-h-[440px] overflow-hidden">
          <img 
            src={typeof article.featuredImage === 'string' ? article.featuredImage : (article.featuredImage?.url || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200')} 
            alt={article.title}
            width={800}
            height={500}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out"
            loading="lazy"
          />
          {cleanCategory && (
            <div className="absolute top-6 left-6 z-10">
              <Badge className="bg-[#C5A059] text-white hover:opacity-90 uppercase tracking-widest text-[10px] font-bold border-none px-4 py-1.5 shadow-sm">
                {cleanCategory}
              </Badge>
            </div>
          )}
        </div>

        {/* Info Container */}
        <div className="lg:col-span-5 p-8 lg:p-12 flex flex-col justify-between bg-white relative">
          <div className="space-y-5">
            {cleanCategory && (
              <span className="text-[#C5A059] text-xs font-black tracking-[0.2em] uppercase block">
                {cleanCategory}
              </span>
            )}

            <h3 className="text-2xl lg:text-3xl font-display font-black text-slate-950 tracking-tight leading-tight group-hover:text-[#C5A059] transition-colors duration-300">
              <Link to={`/news/${article.slug || article.id}`} title={summary || article.title}>
                {article.title}
              </Link>
            </h3>

            <p className="text-slate-600 text-base font-light leading-relaxed">
              {summary}
            </p>
          </div>

          <div className="pt-6 mt-8 border-t border-slate-100 flex items-center justify-between">
            <Link 
              to={`/news/${article.slug || article.id}`} 
              title={summary || article.title}
              className="inline-flex items-center font-bold tracking-tight text-[#C5A059] hover:text-slate-950 transition-colors text-base"
            >
              Read Article 
              <ArrowRight size={18} className="ml-2 transform group-hover:translate-x-1.5 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Sub-component for regular Article Cards
const ArticleCard = ({ article, index }: { article: Article; index: number }) => {
  const summary = article.summary || cleanSummaryText(article.content || '', 140);
  const cleanCategory = getCleanCategoryLabel(article.category, article.type);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 768);
    }
  }, []);
  
  return (
    <motion.div
      id={`article-card-${article.id}`}
      initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
      whileInView={isMobile ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
      viewport={isMobile ? undefined : { once: true }}
      transition={isMobile ? { duration: 0 } : { duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
      className="group bg-white border border-slate-100 rounded-2xl overflow-hidden hover:border-[#C5A059]/30 hover:shadow-xl transition-all duration-300 flex flex-col h-full"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img 
          src={typeof article.featuredImage === 'string' ? article.featuredImage : (article.featuredImage?.url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800')} 
          alt={article.title}
          width={400}
          height={250}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        {cleanCategory && (
          <div className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4">
            <Badge className="bg-[#C5A059] text-white hover:opacity-90 uppercase tracking-wider text-[9px] font-bold border-none px-2.5 py-0.5 sm:px-3 sm:py-1">
              {cleanCategory}
            </Badge>
          </div>
        )}
      </div>

      <div className="p-3.5 sm:p-6 flex-1 flex flex-col justify-between">
        <div>
          {cleanCategory && (
            <span className="text-[#C5A059] text-[9px] sm:text-[10px] font-black tracking-[0.15em] uppercase block mb-1 sm:mb-2">
              {cleanCategory}
            </span>
          )}

          <h4 className="text-sm sm:text-lg md:text-xl font-display font-bold text-slate-950 mb-1.5 sm:mb-3 line-clamp-2 leading-snug group-hover:text-[#C5A059] transition-colors duration-300">
            <Link to={`/news/${article.slug || article.id}`} title={summary || article.title}>
              {article.title}
            </Link>
          </h4>

          <p className="text-slate-600 text-[11px] sm:text-xs md:text-sm font-light leading-normal sm:leading-relaxed mb-3.5 sm:mb-6 line-clamp-2 sm:line-clamp-3">
            {summary}
          </p>
        </div>

        <div className="pt-2.5 sm:pt-4 border-t border-slate-100 mt-auto flex items-center justify-between">
          <Link 
            to={`/news/${article.slug || article.id}`}
            title={summary || article.title}
            className="inline-flex items-center text-xs md:text-sm font-bold text-[#C5A059] hover:text-slate-950 transition-colors"
          >
            Read Article 
            <ArrowRight size={14} className="ml-1.5 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

const LatestNews = memo(() => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    articleService.getArticles(undefined, undefined, true)
      .then(data => {
        // Safe robust sorting & client cache format resilience
        const sorted = data.sort((a, b) => {
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
        setArticles(sorted);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch articles:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="py-24 bg-slate-50 text-slate-900 flex justify-center items-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 text-sm font-light">Loading Tech Assessments...</p>
        </div>
      </section>
    );
  }

  if (articles.length === 0) {
    return (
      <section className="py-24 bg-slate-50 text-slate-900 border-t border-slate-100">
        <div className="container mx-auto px-4 text-center">
          <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <h3 className="text-xl font-display font-bold text-slate-400 mb-2">Wax warar ah wali lama daabicin.</h3>
          <p className="text-slate-400 text-sm">Check back later for latest Somali region updates.</p>
        </div>
      </section>
    );
  }

  const featured = articles[0];
  const gridArticles = articles.slice(1, 7); // Show up to 6 articles in the grid below the hero

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-slate-50 relative overflow-hidden border-t border-slate-100 text-slate-900">
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 lg:mb-12 gap-6">
          <div className="space-y-3">
            <span className="text-[#C5A059] text-xs font-black tracking-[0.3em] uppercase block">
              Tech Network Focus
            </span>
            <h2 className="text-3xl md:text-5xl font-display font-black text-slate-950 mb-4 tracking-tight leading-tight">
              Latest News & <br className="hidden sm:inline" />
              <span className="text-[#C5A059] relative inline-block font-bold">
                Software Insights
                <span className="absolute bottom-1 left-0 w-full h-[3px] bg-[#C5A059]/20" />
              </span>
            </h2>
            <p className="text-slate-600 max-w-2xl text-base md:text-lg font-light leading-relaxed">
              Stay ahead with institutional insights, major tech benchmarks, and localized software intelligence within our ecosystem.
            </p>
          </div>
          
          <Button asChild className="bg-slate-950 hover:bg-[#C5A059] hover:text-black font-semibold text-white px-8 py-6 rounded-2xl h-14 text-sm tracking-wide shadow-lg transition-all duration-300">
            <Link to="/news" className="flex items-center gap-2">
              Browse All Insights <ChevronRight size={16} />
            </Link>
          </Button>
        </div>

        {/* Featured Showcase Item */}
        {featured && <FeaturedArticleCard article={featured} />}

        {/* Rest of the intelligence bulletins - Modern Grid */}
        {gridArticles.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200/60 font-medium">
              <span className="text-xs font-black tracking-widest uppercase text-slate-950 font-display">
                Recent Intelligence Briefings
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {gridArticles.length} Bulletins available
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {gridArticles.map((article, index) => (
                <ArticleCard 
                  key={article.id} 
                  article={article} 
                  index={index} 
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
});

LatestNews.displayName = 'LatestNews';

export default LatestNews;
