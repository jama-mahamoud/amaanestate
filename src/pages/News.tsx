import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { TrendingUp, Newspaper, Clock, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { articleService } from '@/services/articleService';
import { Article } from '@/types';

const CATEGORIES = [
  'All', 'Real Estate', 'Investment', 'Construction', 
  'Regional Development', 'Economy', 'Infrastructure', 'Land & Urban Growth'
];

export default function News() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    let active = true;
    articleService.getArticles().then(data => {
      if (active) {
        setArticles(data);
        setLoading(false);
      }
    }).catch(err => {
      console.error("Failed to fetch articles:", err);
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const filteredArticles = useMemo(() => {
    if (activeCategory === 'All') return articles;
    return articles.filter(a => a.category === activeCategory);
  }, [articles, activeCategory]);

  const featuredArticle = useMemo(() => {
    const featuredArticleFrom = (items: Article[]) => {
      return items.find(a => a.isFeatured && a.published) || items.find(a => a.published);
    };
    return featuredArticleFrom(filteredArticles);
  }, [filteredArticles]);

  const regularArticles = useMemo(() => 
    filteredArticles.filter(a => a.published && a.id !== featuredArticle?.id), 
    [filteredArticles, featuredArticle]
  );

  const formatDate = useCallback((dateValue: any) => {
    if (!dateValue || !dateValue.seconds) return 'Recently';
    return new Date(dateValue.seconds * 1000).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'});
  }, []);

  if (loading) return <div className="text-white text-center pt-40 min-h-screen bg-black">Loading market intelligence...</div>;

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-20">
      <Helmet>
        <title>Market Insights & Intelligence | AmaanEstate</title>
        <meta name="description" content="Institutional insights into the Somali Region's evolving real estate and economic landscape." />
      </Helmet>
      
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Editorial Header */}
        <div className="py-20">
          <span className="text-luxury-gold font-bold tracking-[0.3em] uppercase text-xs mb-4 block">Market Intelligence</span>
          <h1 className="text-5xl md:text-8xl font-display font-bold tracking-tighter mb-8 leading-none">
            AmaanEstate <span className="text-white/30">Insights</span>
          </h1>
          <p className="text-white/60 text-xl font-light max-w-2xl">
            Credible intelligence on real estate, infrastructure, and regional investment opportunities.
          </p>
        </div>

        {/* Categories */}
        <div className="sticky top-20 z-30 bg-black/80 backdrop-blur-md py-4 mb-12 flex gap-2 overflow-x-auto no-scrollbar border-y border-white/5">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full text-xs uppercase font-bold tracking-widest whitespace-nowrap transition-all ${
                activeCategory === cat 
                  ? 'bg-luxury-gold text-black' 
                  : 'bg-white/5 text-white/50 hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured Section */}
        {featuredArticle ? (
          <div className="mb-20">
            <Link to={`/news/${featuredArticle.id}`} className="group block">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="aspect-[3/2] rounded-[2rem] overflow-hidden">
                   <img src={featuredArticle.featuredImage || '/placeholder.jpg'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={featuredArticle.title} />
                </div>
                <div className="space-y-6">
                    <Badge className="bg-luxury-gold/10 text-luxury-gold border-0">Featured Insights</Badge>
                    <h2 className="text-4xl md:text-6xl font-display font-bold leading-tight group-hover:text-luxury-gold transition-colors">{featuredArticle.title}</h2>
                    <p className="text-white/60 text-lg">{featuredArticle.summary}</p>
                    <div className="flex items-center gap-4 text-white/40 text-sm font-bold">
                        <span>{formatDate(featuredArticle.createdAt)}</span>
                        <span>•</span>
                        <span>{Math.ceil(featuredArticle.content.length / 1000)} min read</span>
                    </div>
                </div>
              </div>
            </Link>
          </div>
        ) : null}

        {/* Regular Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
                {regularArticles.map((item, i) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                    >
                        <Link to={`/news/${item.id}`} className="block h-full group bg-white/5 rounded-[2rem] p-6 hover:bg-white/10 transition-all border border-transparent hover:border-white/10">
                            <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-6">
                                <img src={item.featuredImage || '/placeholder.jpg'} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt={item.title} />
                            </div>
                            <div className="space-y-4">
                                <span className="text-luxury-gold text-xs font-bold uppercase tracking-widest">{item.category}</span>
                                <h3 className="text-2xl font-bold font-display leading-snug group-hover:text-luxury-gold transition-colors">{item.title}</h3>
                                <div className="flex items-center gap-2 text-white/30 text-xs font-bold">
                                    <Clock size={14} />
                                    <span>{formatDate(item.createdAt)}</span>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

