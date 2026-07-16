import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { articleService } from '@/services/articleService';
import { Article } from '@/types';
import { ArrowRight, BookOpen, Calendar, Clock, Search, X, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Reusing reading time and summary helpers to match LatestNews component
const calculateReadTime = (content: string): number => {
  if (!content) return 3;
  const words = content.replace(/<[^>]*>/g, '').trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 225));
};

const cleanSummaryText = (content: string, length = 140): string => {
  if (!content) return '';
  const text = content.replace(/<[^>]*>/g, '').trim();
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

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
    if (!isNaN(parsed.getTime())) date = parsed;
    else return 'Recently';
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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

export default function News() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const newsCategoryOptions = useMemo(() => {
    const cats = new Set<string>();
    articles.forEach(a => {
      if (!a.category) return;
      if (Array.isArray(a.category)) {
        a.category.forEach(c => {
          if (typeof c === 'string' && c.trim()) {
            cats.add(c.trim());
          }
        });
      } else if (typeof a.category === 'string' && a.category.trim()) {
        cats.add(a.category.trim());
      }
    });
    const uniqueCategories = Array.from(cats);
    return [
      { id: 'all', label: 'All Categories' },
      ...uniqueCategories.map((cat) => ({
        id: cat,
        label: cat.charAt(0).toUpperCase() + cat.slice(1),
      })),
    ];
  }, [articles]);

  const filteredArticles = useMemo(() => {
    return articles.filter((item) => {
      const categoryMatch =
        selectedCategory === 'all' || 
        (Array.isArray(item.category) ? item.category.includes(selectedCategory) : item.category === selectedCategory);
      const searchMatch =
        searchQuery.trim() === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.summary || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.content || '').toLowerCase().includes(searchQuery.toLowerCase());
      return categoryMatch && searchMatch;
    });
  }, [articles, selectedCategory, searchQuery]);

  useEffect(() => {
    let active = true;
    articleService.getArticles(undefined, undefined, true)
      .then(data => {
        if (!active) return;
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
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pt-28 md:pt-36 pb-12 md:pb-20">
      <Helmet>
        <title>Intelligence & News | PrimeDeals</title>
        <meta name="description" content="Read the latest news, updates, and technology insights from PrimeDeals." />
      </Helmet>

      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-6 md:mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-4 md:gap-6">
          <div className="space-y-1.5 md:space-y-3">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-display font-black text-slate-950 tracking-tight leading-none">
              Intelligence <span className="text-[#C5A059]">Briefings</span>
            </h1>
            <p className="text-slate-600 max-w-2xl text-xs md:text-sm lg:text-base font-light leading-relaxed">
              <span className="hidden md:inline">
                Stay ahead with institutional insights, major tech benchmarks, and localized software intelligence within our ecosystem.
              </span>
              <span className="inline md:hidden">
                Latest technology insights, reviews, and updates.
              </span>
            </p>
          </div>

          {/* Dynamic collapsible category & search block */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-56 md:w-64 group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#C5A059] transition-colors">
                <Search size={13} />
              </span>
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-[#C5A059]/40 focus:outline-none focus:ring-1 focus:ring-[#C5A059]/10 rounded-xl py-2 px-9 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Custom-styled clean, single Category selector to avoid duplicates */}
            <div className="relative w-full sm:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-auto bg-white hover:bg-slate-50 border border-slate-200 focus:border-[#C5A059]/40 focus:outline-none focus:ring-1 focus:ring-[#C5A059]/10 rounded-xl py-2 pl-4 pr-10 text-xs font-semibold text-slate-800 outline-none transition-all cursor-pointer appearance-none shadow-sm"
              >
                {newsCategoryOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <ChevronDown size={14} className="text-[#C5A059]" />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-display font-bold text-slate-500 mb-2">No articles published yet</h3>
            <p className="text-slate-400">Check back later for updates and intelligence briefings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
            {filteredArticles.map((article, index) => {
              const summary = article.summary || cleanSummaryText(article.content || '');
              const cleanCategory = getCleanCategoryLabel(article.category, article.type);
              return (
                <div key={article.id} className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-[#C5A059]/30 hover:shadow-xl transition-all duration-300 flex flex-col h-full shadow-sm">
                  <Link to={`/news/${article.slug || article.id}`} className="relative aspect-[16/10] overflow-hidden bg-slate-100 block">
                    <img 
                      src={typeof article.featuredImage === 'string' ? article.featuredImage : (article.featuredImage?.url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800')} 
                      alt={article.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out"
                      loading="lazy"
                    />
                    {cleanCategory && (
                      <div className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 z-10">
                        <Badge className="bg-[#C5A059] text-white hover:opacity-90 uppercase tracking-wider text-[9px] font-bold border-none px-2.5 py-0.5 sm:px-3 sm:py-1">
                          {cleanCategory}
                        </Badge>
                      </div>
                    )}
                  </Link>

                  <div className="p-3.5 sm:p-6 flex-1 flex flex-col justify-between">
                    <div>
                      {cleanCategory && (
                        <span className="text-[#C5A059] text-[9px] sm:text-[10px] font-black tracking-[0.15em] uppercase block mb-1 sm:mb-2">
                          {cleanCategory}
                        </span>
                      )}

                      <h2 className="text-sm sm:text-xl font-display font-bold text-slate-950 mb-1.5 sm:mb-3 line-clamp-2 leading-snug group-hover:text-[#C5A059] transition-colors duration-300">
                        <Link to={`/news/${article.slug || article.id}`}>
                          {article.title}
                        </Link>
                      </h2>

                      <p className="text-slate-600 text-xs sm:text-sm font-light leading-normal sm:leading-relaxed mb-3.5 sm:mb-6 line-clamp-2 sm:line-clamp-3">
                        {summary}
                      </p>
                    </div>

                    <div className="pt-2.5 sm:pt-4 border-t border-slate-100 mt-auto">
                      <Link 
                        to={`/news/${article.slug || article.id}`}
                        className="inline-flex items-center text-xs sm:text-sm font-bold text-[#C5A059] hover:text-slate-950 transition-colors"
                      >
                        Read Article 
                        <ArrowRight size={14} className="ml-1 sm:ml-1.5 transform group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
