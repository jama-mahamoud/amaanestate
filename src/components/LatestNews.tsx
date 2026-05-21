import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, ArrowRight, Clock } from 'lucide-react';
import { articleService } from '@/services/articleService';
import { Article } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function LatestNews() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    articleService.getArticles(undefined, undefined, true).then(data => {
      // Sort by publish date, newest first, and take top 6
      const sorted = data.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      }).slice(0, 8);
      setArticles(sorted);
      setLoading(false);
    });
  }, []);

  const formatDate = (dateValue: any) => {
    if (!dateValue || !dateValue.seconds) return 'Recently';
    return new Date(dateValue.seconds * 1000).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'});
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  if (loading) return null;
  if (articles.length === 0) return null;

  const isMany = articles.length > 3;

  return (
    <section className="py-24 bg-luxury-black relative overflow-hidden border-t border-white/5">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4 tracking-tight">
              Latest News & <span className="gold-text-gradient bg-clip-text">Market Intelligence</span>
            </h2>
            <p className="text-white/60 max-w-2xl text-lg">
              Stay informed with our latest market reports, investment insights, and regional development news.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" className="border-white/10 hover:bg-white/5 hover:text-luxury-gold pt-1">
              <Link to="/news">View All Insights</Link>
            </Button>
            {isMany && (
              <div className="hidden md:flex items-center gap-2">
                <button 
                  onClick={scrollLeft}
                  className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/70 hover:text-luxury-gold hover:border-luxury-gold/50 transition-all bg-luxury-black/50"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={scrollRight}
                  className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/70 hover:text-luxury-gold hover:border-luxury-gold/50 transition-all bg-luxury-black/50"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div 
          ref={scrollContainerRef}
          className={`
            ${isMany 
              ? "flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 -mx-4 px-4 md:mx-0 md:px-0 no-scrollbar scroller-hide" 
              : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            }
          `}
          style={isMany ? { scrollbarWidth: 'none', msOverflowStyle: 'none' } : {}}
        >
          {articles.map((article, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              key={article.id} 
              className={`
                group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-luxury-gold/30 transition-all duration-300
                ${isMany ? "min-w-[300px] md:min-w-[380px] snap-start flex-shrink-0 flex flex-col" : "flex flex-col h-full"}
              `}
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img 
                  src={article.featuredImage || `https://images.unsplash.com/photo-1582407947304-fd86f1289c54?auto=format&fit=crop&q=80&w=1000`} 
                  alt={article.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-luxury-gold text-black uppercase tracking-wider text-[10px] font-bold border-none">
                    {article.category || 'News'}
                  </Badge>
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-white/40 text-xs mb-3 font-mono">
                  <Clock size={14} />
                  {formatDate(article.createdAt)}
                </div>
                
                <h3 className="text-xl font-display font-bold text-white mb-3 line-clamp-2 group-hover:text-luxury-gold transition-colors">
                  <Link to={`/news/${article.id}`}>
                    {article.title}
                  </Link>
                </h3>
                
                <p className="text-white/60 text-sm line-clamp-3 mb-6 flex-1">
                  {article.summary || article.content.substring(0, 150) + '...'}
                </p>
                
                <div className="mt-auto pt-4 border-t border-white/5">
                  <Link 
                    to={`/news/${article.id}`}
                    className="inline-flex items-center text-sm font-bold text-white/70 group-hover:text-luxury-gold transition-colors"
                  >
                    Read Article <ArrowRight size={16} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
