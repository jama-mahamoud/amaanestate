import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, ChevronDown, Search, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { articleService } from '@/services/articleService';
import { Article } from '@/types';
import { useSettings } from '@/contexts/SettingsContext';

const NEWS_TRANSLATIONS = {
  en: {
    spotlight: "Institutional Knowledge",
    insights: "Insights",
    tagline: "We compile and synthesize hard spatial data, transactional intelligence, and localized economic forecasts across the Somali region.",
    searchPlaceholder: "Search by title or keyword...",
    articlesCatalogued: "Bulletins Loaded",
    historyArchive: "Historical Intelligence Archive",
    showingBulletins: "Showing {count} of {total} bulletins",
    loadMore: "Load More Bulletins",
    analyzingMore: "Analyzing more bulletins...",
    noArticlesTitle: "No articles found.",
    noArticlesDesc: "There are currently no published intelligence updates stored in this register. Check back shortly.",
    createBtn: "Create Article",
    listPropertyBtn: "List Property",
    briefing: "Access Intel Briefing",
    recentBriefing: "Access Briefing"
  },
  so: {
    spotlight: "Aqoonta Hay'adaha",
    insights: "Aragtiyada",
    tagline: "Waxaan aruurinaa oo falanqeynaa xogta dhulka, macluumaadka rasmiga ah, iyo odoroska dhaqaalaha ee deegaanka Soomaaliyeed.",
    searchPlaceholder: "Ka raadi cinwaanka ama erey-fure...",
    articlesCatalogued: "Maqaalo La Rarayaa",
    historyArchive: "Arkiifiyada Taariikhda Macluumaadka",
    showingBulletins: "La tusayo {count} ka mid ah {total} maqaal",
    loadMore: "Soo Bandhig Maqaalo Kale",
    analyzingMore: "Maqaalo kale ayaa la soo rarayaa...",
    noArticlesTitle: "Wax warar ah oo la helay ma jiraan.",
    noArticlesDesc: "Hadda ma jiraan wax warar ah oo ku keydsan qaybtaan. Fadlan dib u soo laabo dhawaan.",
    createBtn: "Qor Maqaal",
    listPropertyBtn: "Diiwaangeli Hanti",
    briefing: "Akhri Macluumaadka Kooban",
    recentBriefing: "Akhri Warbixinta"
  }
};

const getArticleLink = (article: Article, language: string) => {
  const langPrefix = language === 'so' ? '/so' : '/en';
  if (article.type) {
    return `${langPrefix}/news/${article.type}/${article.slug || article.id}`;
  }
  return `${langPrefix}/news/${article.slug || article.id}`;
};

const getTypeLabel = (type?: string, language?: string) => {
  const isSo = language === 'so';
  const val = (type || '').toLowerCase().trim();
  switch (val) {
    case 'news':
    case 'update': return isSo ? 'Warar' : 'Update';
    case 'report':
    case 'market_report': return isSo ? 'Warbixin' : 'Report';
    case 'opportunity': return isSo ? 'Fursad' : 'Opportunity';
    case 'announcement': return isSo ? 'Ogeysiis' : 'Announcement';
    case 'new_project': return isSo ? 'Mashruuc Cusub' : 'New Project';
    case 'short_insight': return isSo ? 'Falanqeyn Gaaban' : 'Short Insight';
    default: return isSo ? 'Falanqeyn' : 'Insight';
  }
};

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


// Separated Sub-component for individual grid list items (ArticleCard)
const ArticleCard = ({ article, index, language }: { article: Article; index: number; language: string }) => {
  const readTime = calculateReadTime(article.content || '');
  const summaryText = article.summary || cleanSummaryText(article.content || '', 120);
  const t = NEWS_TRANSLATIONS[language === 'so' ? 'so' : 'en'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: (index % 3) * 0.1 }}
      className="h-full"
    >
      <Link 
        to={getArticleLink(article, language)} 
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
            <Badge className={`${getTypeColor(article.type || article.category)} border-0 text-white font-bold text-[8px] uppercase tracking-wider`}>
              {getTypeLabel(article.type || article.category, language)}
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
            <span>{t.recentBriefing}</span>
            <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default function News() {
  const location = useLocation();
  const isEnglishRoute = useMemo(() => location.pathname.endsWith('/news/english'), [location.pathname]);
  const langQuery = useMemo(() => new URLSearchParams(location.search).get('lang'), [location.search]);
  
  const { lang } = useParams();
  const { language, setLanguage } = useSettings();

  // Derive initial tab state safely & dynamically to bypass flickering/stale rendering
  const initialTab = isEnglishRoute ? 'en' : (langQuery === 'so' ? 'so' : (langQuery === 'en' ? 'en' : 'All'));

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLangTab, setActiveLangTab] = useState<'All' | 'en' | 'so'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(6);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Sync active language tab dynamically when route location elements update
  useEffect(() => {
    if (isEnglishRoute) {
      setActiveLangTab('en');
    } else if (langQuery === 'so') {
      setActiveLangTab('so');
    } else if (langQuery === 'en') {
      setActiveLangTab('en');
    } else {
      setActiveLangTab('so');
    }
  }, [isEnglishRoute, langQuery]);

  useEffect(() => {
    if (lang === 'en' || lang === 'so') {
      if (language !== lang) {
        setLanguage(lang);
      }
    }
  }, [lang, language, setLanguage]);
  
  const activeLang = useMemo(() => {
    return language === 'so' ? 'so' : 'en';
  }, [language]);

  const t = useMemo(() => {
    return NEWS_TRANSLATIONS[activeLang];
  }, [activeLang]);

  // Ref for intersection observer scroll target
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // Fetch articles dynamically when language tab selection changes
  useEffect(() => {
    let active = true;
    setLoading(true);
    
    const langParam = activeLangTab === 'All' ? undefined : activeLangTab;
    
    articleService.getArticles(undefined, langParam, true)
      .then(data => {
        if (active) {
          setArticles(data);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error("Failed to fetch articles dynamically:", err);
        if (active) setLoading(false);
      });
      
    return () => { active = false; };
  }, [activeLangTab]);

  // One-time client-side database migration to set correct language on all existing articles
  useEffect(() => {
    const migrated = localStorage.getItem('articles_lang_migrated_v2');
    if (!migrated) {
      const articlesToMigrate = [
        { id: "99IuUGjA7Ou5OAiw4zyO", lang: "so" as const },
        { id: "CP9L2lQBwrG3CGPYvssP", lang: "so" as const },
        { id: "Cjc5bMXjwU1CfoVDeduL", lang: "so" as const },
        { id: "NTEDvZ7ijVvJcp2qHOVF", lang: "so" as const },
        { id: "UBsouDeqo9BczFFe1aXN", lang: "so" as const },
        { id: "VQyXROXAco4EImmJRlFf", lang: "en" as const },
        { id: "VR4mjmPcxQNvCkwChqhl", lang: "so" as const },
        { id: "cRbV9MHGj4zq98nv8EyN", lang: "so" as const },
        { id: "nO4slXjTUXj1myEL8idA", lang: "so" as const },
        { id: "oQqHE42apHWK97bkS1FD", lang: "so" as const }
      ];

      console.log("--- Executing client-side article database language migration ---");
      Promise.all(
        articlesToMigrate.map(async (item) => {
          try {
            await articleService.updateArticle(item.id, { language: item.lang });
            console.log(`Successfully migrated ${item.id} to language "${item.lang}"`);
          } catch (e) {
            console.error(`Failed migration for article ${item.id}`, e);
          }
        })
      ).then(() => {
        localStorage.setItem('articles_lang_migrated_v2', 'true');
        console.log("--- Client-side article database language migration completed ---");
      });
    }
  }, []);

  // Filter based on search query
  const filteredArticles = useMemo(() => {
    let filtered = articles;
    
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
  }, [articles, searchQuery]);

  // Currently visible articles based on pagination
  const visibleArticles = useMemo(() => {
    return filteredArticles.slice(0, visibleCount);
  }, [filteredArticles, visibleCount]);

  const hasMore = filteredArticles.length > visibleCount;

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

  // Reset pagination scale when filters switch
  useEffect(() => {
    setVisibleCount(6);
  }, [searchQuery, activeLangTab]);

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-24">
      <Helmet>
        <title>{activeLang === 'so' ? 'Wararkii Ugu Dambeeyay | AmaanEstate' : 'Latest News & Insights | AmaanEstate'}</title>
        <meta name="description" content="Local market updates, announcements, and news on the Somali region real estate market." />
      </Helmet>
      
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Simple Clean Header Section */}
        <div className="py-12 border-b border-white/5 mb-16 relative overflow-hidden flex flex-col md:flex-row md:items-end justify-between gap-8 animate-none">
          <div className="absolute top-0 right-0 w-72 h-72 bg-luxury-gold/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-luxury-gold animate-pulse" />
              <span className="text-luxury-gold font-bold tracking-[0.3em] uppercase text-[10px]">
                {activeLang === 'so' ? 'Wararkii Ugu Dambeeyay' : 'LATEST NEWS'}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-medium tracking-tight">
              {activeLang === 'so' ? 'AmaanEstate Wararka' : 'Latest News'}
            </h1>
            <p className="text-white/50 text-sm sm:text-base font-light">
              {activeLang === 'so' 
                ? 'La soco wararkii ugu dambeeyay iyo falanqeynta ku saabsan hantida maguurtada ah.' 
                : 'Stay informed with our latest news, market insights, and updates.'}
            </p>
          </div>
          
          <div className="relative group w-full md:w-80">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/30 group-focus-within:text-[#C5A059] transition-colors">
              <Search size={16} />
            </div>
            <input 
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white pl-11 pr-4 py-3 rounded-2xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#C5A059] focus:border-[#C5A059] transition-all placeholder:text-white/20"
            />
          </div>
        </div>

        {loading ? (
          /* Premium Skeleton State Loader */
          <div className="py-24 space-y-12 animate-none">
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
            {/* Structured Grid Layout for Articles */}
            {visibleArticles.length > 0 ? (
              <div className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <AnimatePresence mode="popLayout">
                    {visibleArticles.map((item, index) => (
                      <ArticleCard 
                        key={item.id} 
                        article={item} 
                        index={index} 
                        language={activeLang}
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
                        <span className="text-xs text-white/50 font-light font-mono">{t.analyzingMore}</span>
                      </div>
                    ) : (
                      <Button 
                        onClick={handleLoadMore} 
                        variant="outline" 
                        className="bg-transparent border-white/10 hover:border-[#C5A059] hover:bg-white/5 text-xs text-white/70 hover:text-white px-8 py-5 rounded-xl font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 h-auto"
                      >
                        <ChevronDown size={14} /> {t.loadMore}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-24 border border-white/5 rounded-3xl bg-white/[0.01]">
                <BookOpen size={48} className="text-white/20 mx-auto mb-4 animate-bounce" />
                <h4 className="text-xl font-display font-bold text-white/80 mb-2">{t.noArticlesTitle}</h4>
                <p className="text-white/40 max-w-sm mx-auto text-sm font-light">
                  {t.noArticlesDesc}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
