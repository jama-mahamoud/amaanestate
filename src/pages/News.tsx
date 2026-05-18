import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, ArrowRight, Clock, Newspaper } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { articleService } from '@/services/articleService';
import { Article } from '@/types';
import EmptyState from '@/components/EmptyState';

export default function News() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    articleService.getArticles().then(data => {
      setArticles(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-white text-center pt-40">Loading journal...</div>;

  const featuredArticle = articles.find(a => a.isFeatured && a.published);
  const regularArticles = articles.filter(a => a.published && a.id !== featuredArticle?.id);

  return (
    <div className="min-h-screen bg-luxury-black pt-28 pb-20">
      <div className="container mx-auto px-4 relative z-10">
        
        <div className="max-w-4xl mb-16 md:mb-24">
          <p className="text-luxury-gold font-bold tracking-[0.3em] uppercase text-[10px] mb-6 underline underline-offset-8 decoration-luxury-gold/50">Regional Intelligence</p>
          <h1 className="text-5xl md:text-9xl font-display font-bold text-white mb-10 tracking-tighter leading-[0.9]">
            Market <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">Journal</span>
          </h1>
          <p className="text-white/50 text-lg md:text-xl font-light leading-relaxed max-w-2xl">
            Institutional insights into the Somali Region's evolving real estate and luxury sectors.
          </p>
        </div>

        {/* Featured Article */}
        {featuredArticle ? (
          <div className="mb-24 md:mb-40">
            <Link to={`/news/${featuredArticle.id}`}>
              <div className="relative group overflow-hidden rounded-[3rem] shadow-2xl">
                <div className="aspect-[4/3] md:aspect-[21/9]">
                  <img 
                    src={featuredArticle.featuredImage || '/placeholder-news.jpg'} 
                    className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-[2000ms] scale-105 group-hover:scale-100" 
                    alt="Featured" 
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-luxury-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-10 md:p-20 max-w-4xl">
                  <div className="flex items-center gap-4 mb-6">
                    <Badge className="bg-luxury-gold text-luxury-black border-0 px-6 py-2 uppercase tracking-[0.2em] font-bold text-[10px]">
                      Featured Report
                    </Badge>
                    <span className="text-white/40 text-[10px] uppercase font-bold tracking-[0.2em]">{featuredArticle.category}</span>
                  </div>
                  <h2 className="text-3xl md:text-7xl font-display font-bold text-white mb-8 group-hover:text-luxury-gold transition-colors duration-500 tracking-tighter leading-[0.9]">
                    {featuredArticle.title}
                  </h2>
                  <div className="text-white/40text-[10px] uppercase font-bold tracking-[0.3em]">
                    {new Date(featuredArticle.createdAt.seconds * 1000).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16">
          {regularArticles.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Link to={`/news/${item.id}`} className="group block h-full">
                <div className="glass-card h-full flex flex-col rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-luxury-gold/30 transition-all duration-500">
                  <div className="aspect-[16/9] overflow-hidden">
                    <img 
                      src={item.featuredImage || '/placeholder-news.jpg'} 
                      className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105" 
                      alt={item.title} 
                    />
                  </div>
                  <div className="p-8 md:p-10 flex flex-col flex-grow">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-luxury-gold text-[10px] uppercase tracking-[0.2em] font-bold">
                        {item.category}
                      </span>
                      <span className="text-white/20 text-[10px] uppercase font-bold tracking-widest">{new Date(item.createdAt.seconds * 1000).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-2xl font-display font-bold text-white mb-4 group-hover:text-luxury-gold transition-colors tracking-tight leading-snug flex-grow">
                      {item.title}
                    </h3>
                    <p className="text-white/40 text-sm font-light leading-relaxed line-clamp-3">
                      {item.summary}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {articles.length === 0 && (
          <EmptyState 
            title="Journal Empty" 
            description="Our editorial team is currently drafting institutional reports and regional intelligence briefs." 
            icon={<Newspaper size={48} />}
          />
        )}

        <div className="mt-32 text-center">
            <Button variant="outline" className="border-white/5 bg-white/5 text-white hover:bg-luxury-gold hover:text-luxury-black transition-all duration-500 h-20 px-16 rounded-[2rem] font-bold uppercase tracking-[0.2em] text-xs">
              Archive Directory
            </Button>
        </div>
      </div>
    </div>
  );
}
