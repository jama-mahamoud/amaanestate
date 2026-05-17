import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, User, ArrowRight, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import EmptyState from '@/components/EmptyState';
import { Newspaper } from 'lucide-react';

const newsItems: any[] = [];

export default function News() {
  return (
    <div className="min-h-screen bg-luxury-black pt-28 pb-20">
      <div className="container mx-auto px-4 relative z-10">
        
        <div className="max-w-4xl mb-12 md:mb-24">
          <p className="text-luxury-gold font-bold tracking-[0.3em] md:tracking-[0.4em] uppercase text-[9px] md:text-[10px] mb-4 md:mb-6 underline underline-offset-8 decoration-luxury-gold/30">Regional Intelligence</p>
          <h1 className="text-4xl md:text-9xl font-display font-bold text-white mb-6 md:mb-10 tracking-tighter leading-[1.1] md:leading-[0.85]">
            Market <br />
            <span className="gold-text-gradient">Journal</span>
          </h1>
          <p className="text-white/40 text-lg md:text-xl font-light leading-relaxed max-w-2xl px-1">
            Institutional insights into the Somali Region's evolving real estate and luxury sectors.
          </p>
        </div>

        {/* Featured Article */}
        {newsItems.length > 0 ? (
          <>
            <div className="mb-16 md:mb-32">
              <Link to={`/news/${newsItems[0].id}`}>
                <div className="relative group overflow-hidden rounded-[2.5rem] md:rounded-[5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
                  <div className="aspect-[4/3] md:aspect-[21/9]">
                    <img 
                      src={newsItems[0].image} 
                      className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 scale-105 group-hover:scale-100" 
                      alt="Featured" 
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-luxury-black/40 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-8 md:p-20 max-w-4xl">
                    <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-8">
                      <Badge className="bg-luxury-gold text-luxury-black border-0 px-4 md:px-6 py-1.5 md:py-2 uppercase tracking-[0.2em] md:tracking-[0.3em] font-bold text-[8px] md:text-[10px]">
                        Featured Report
                      </Badge>
                      <span className="text-white/30 text-[8px] md:text-[10px] uppercase font-bold tracking-[0.2em] md:tracking-[0.3em]">• {newsItems[0].category}</span>
                    </div>
                    <h2 className="text-2xl md:text-6xl font-display font-bold text-white mb-6 md:mb-8 group-hover:text-luxury-gold transition-all duration-500 tracking-tighter leading-tight">
                      {newsItems[0].title}
                    </h2>
                    <div className="flex items-center gap-6 md:gap-8 text-white/30 text-[8px] md:text-[10px] uppercase font-bold tracking-[0.2em] md:tracking-[0.3em]">
                      <span className="flex items-center gap-2 md:gap-3"><Calendar size={14} className="text-luxury-gold" /> {newsItems[0].date}</span>
                      <span className="flex items-center gap-2 md:gap-3"><Clock size={14} className="text-luxury-gold" /> {newsItems[0].readTime}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {newsItems.slice(1).map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link to={`/news/${item.id}`} className="group">
                    <div className="glass-card flex flex-col md:flex-row h-full rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden group hover:border-luxury-gold/20 transition-all duration-700">
                      <div className="md:w-2/5 aspect-[16/10] md:aspect-auto overflow-hidden">
                        <img 
                          src={item.image} 
                          className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-105" 
                          alt={item.title} 
                        />
                      </div>
                      <div className="md:w-3/5 p-8 md:p-10 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-4 md:mb-6">
                            <span className="text-luxury-gold text-[8px] md:text-[9px] uppercase tracking-[0.3em] font-bold">
                              {item.category}
                            </span>
                            <span className="text-white/20 text-[8px] md:text-[9px] uppercase font-bold tracking-widest">{item.date}</span>
                          </div>
                          <h3 className="text-xl md:text-2xl font-display font-bold text-white mb-4 md:mb-6 group-hover:text-luxury-gold transition-colors line-clamp-2 tracking-tight leading-snug">
                            {item.title}
                          </h3>
                          <p className="text-white/20 text-xs md:text-sm font-light line-clamp-3 mb-6 md:mb-8 leading-relaxed">
                            {item.excerpt}
                          </p>
                        </div>
                        <div className="flex items-center justify-between pt-6 md:pt-8 border-t border-white/5">
                          <div className="flex items-center gap-3 text-white/30 text-[8px] md:text-[9px] uppercase tracking-[0.2em] font-bold">
                            <div className="w-1.5 h-1.5 rounded-full bg-luxury-gold" />
                            {item.author}
                          </div>
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-luxury-gold group-hover:text-luxury-black transition-all">
                            <ArrowRight size={16} md:size={18} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
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
