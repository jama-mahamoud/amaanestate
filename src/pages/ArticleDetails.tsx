import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, User, Clock, ArrowLeft, Share2, Facebook, Twitter, Linkedin, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import NotFoundState from '@/components/NotFoundState';

const MOCK_ARTICLES: Record<string, any> = {};

export default function ArticleDetails() {
  const { id } = useParams();
  const article = MOCK_ARTICLES[id as string];

  if (!article) {
    return (
      <div className="min-h-screen bg-luxury-black">
        <NotFoundState 
          title="Report Not Found" 
          description="The requested intelligence report could not be retrieved from the editorial archive. It may have been retracted or is undergoing peer-review validation."
          backLink="/news"
          backLabel="BACK TO DIRECTORY"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-black pb-20">
      {/* Article Hero */}
      <div className="relative h-[85vh] min-h-[600px] overflow-hidden">
        <motion.img 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          src={article.image} 
          className="w-full h-full object-cover grayscale opacity-50" 
          alt={article.title} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-luxury-black/40 to-transparent"></div>
        
        <div className="absolute inset-0 flex items-center justify-center pt-24">
          <div className="container mx-auto px-4 text-center max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
               <div className="flex justify-center mb-10">
                 <Badge className="bg-luxury-gold text-luxury-black border-0 px-8 py-2.5 uppercase tracking-[0.4em] font-bold text-[10px]">
                    {article.category} Analysis
                 </Badge>
               </div>
              <h1 className="text-5xl md:text-8xl font-display font-bold text-white mb-12 tracking-tighter leading-[0.85]">
                {article.title}
              </h1>
              <div className="flex flex-wrap items-center justify-center gap-10 text-white/30 text-[10px] font-bold uppercase tracking-[0.4em]">
                <span className="flex items-center gap-3"><Calendar size={16} className="text-luxury-gold" /> {article.date}</span>
                <span className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-luxury-gold" /> BY {article.author}</span>
                <span className="flex items-center gap-3"><Clock size={16} className="text-luxury-gold" /> {article.readTime}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-24 relative z-20">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-12 md:p-20 rounded-[4rem] shadow-2xl relative overflow-hidden mb-16">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-luxury-gold/30 to-transparent opacity-50" />
             
             <div className="flex items-center justify-between mb-16 pb-8 border-b border-white/5">
                <Link to="/news" className="flex items-center gap-3 text-white/20 hover:text-luxury-gold transition-all text-[10px] font-bold tracking-[0.3em] uppercase">
                   <ArrowLeft size={16} /> Directory
                </Link>
                <div className="flex items-center gap-6">
                   <span className="text-white/10 text-[9px] font-bold uppercase tracking-[0.4em] hidden sm:inline">Circulate</span>
                   <div className="flex gap-4">
                      <button className="text-white/20 hover:text-luxury-gold transition-all"><Facebook size={18} /></button>
                      <button className="text-white/20 hover:text-luxury-gold transition-all"><Twitter size={18} /></button>
                      <button className="text-white/20 hover:text-luxury-gold transition-all"><Share2 size={18} /></button>
                   </div>
                </div>
             </div>

             <div 
               className="prose prose-invert prose-luxury max-w-none 
                 prose-p:text-white/40 prose-p:text-xl prose-p:leading-relaxed prose-p:font-light prose-p:mb-10
                 prose-h3:text-white prose-h3:font-display prose-h3:text-3xl prose-h3:font-bold prose-h3:mb-8 prose-h3:mt-16 prose-h3:tracking-tight
                 prose-strong:text-luxury-gold prose-strong:font-bold"
               dangerouslySetInnerHTML={{ __html: article.content }} 
             />
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-12 rounded-[4rem] flex flex-col md:flex-row items-center gap-12 relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-gold/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
             
             <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden shrink-0 border-2 border-white/5 shadow-2xl relative z-10">
                <img 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200" 
                  alt={article.author} 
                  className="w-full h-full object-cover grayscale"
                />
             </div>
             <div className="relative z-10 text-center md:text-left">
                <p className="text-luxury-gold text-[10px] uppercase tracking-[0.4em] font-bold mb-3">Contributor Intelligence</p>
                <h4 className="text-3xl font-display font-bold text-white mb-4 tracking-tight">{article.author}</h4>
                <p className="text-white/30 text-base leading-relaxed font-light mb-8 max-w-lg">Senior macro-economist specializing in the architectural and economic evolution of the Somali Region’s urban nodes.</p>
                <Link to="/contact" className="inline-flex items-center gap-4 text-white hover:text-luxury-gold transition-all text-xs font-bold uppercase tracking-[0.3em]">
                   Engage Advisory <ArrowRight size={16} />
                </Link>
             </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
