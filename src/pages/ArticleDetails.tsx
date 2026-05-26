import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Calendar, User, Clock, ArrowLeft, Share2, Facebook, Twitter, Linkedin, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useCallback } from 'react';
import { articleService } from '@/services/articleService';
import { Article } from '@/types';
import { toast } from 'sonner';

import NotFoundState from '@/components/NotFoundState';

export default function ArticleDetails() {
  const { id } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (id) {
      const fetchArticle = async () => {
        let data = await articleService.getArticleById(id);
        if (!data) {
          data = await articleService.getArticleBySlug(id);
        }
        
        if (active) {
          setArticle(data);
          if (data) {
             const allArticles = await articleService.getArticles();
             if (active) setRelatedArticles(allArticles.filter(a => a.id !== data.id).slice(0, 3));
          }
          setLoading(false);
        }
      };
      fetchArticle();
    }
    return () => { active = false; };
  }, [id]);

  const formatDate = useCallback((dateValue: any) => {
    if (!dateValue || !dateValue.seconds) return 'Recently Published';
    return new Date(dateValue.seconds * 1000).toLocaleDateString();
  }, []);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Intelligence report link copied to clipboard');
  };

  if (loading) return <div className="min-h-screen bg-luxury-black flex items-center justify-center text-white">Loading intelligence report...</div>;

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

  const sidebar = (
    <aside className="space-y-12">
      {article.showAuthor !== false && (
        <div className="glass-card p-8 rounded-3xl border border-white/5 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border border-luxury-gold p-1">
              <div className="w-full h-full bg-luxury-gold rounded-full flex items-center justify-center text-luxury-black font-black">AIU</div>
            </div>
            <div>
              <p className="text-white text-sm font-black uppercase tracking-widest text-luxury-gold">Amaan Intel Unit</p>
              <p className="text-white/30 text-[10px] uppercase tracking-widest mt-1">Verified Editorial Core</p>
            </div>
          </div>
          <p className="text-white/40 text-[11px] leading-relaxed font-light">
            Verified analyst insights regarding the regional real estate and economic corridor.
          </p>
          <div className="flex items-center gap-3">
             <Button variant="outline" size="sm" className="w-full rounded-xl border-white/10 text-white/60 hover:text-white uppercase text-[9px] font-black tracking-widest">Follow</Button>
             <Button variant="outline" size="icon" className="rounded-xl border-white/10 text-white/60 hover:text-white"><Share2 size={14} /></Button>
          </div>
        </div>
      )}

      {relatedArticles.length > 0 && (
        <div className="space-y-8">
          <h3 className="text-white font-display font-black text-xs uppercase tracking-[0.3em] pl-1 border-l-2 border-luxury-gold">Deep Dive</h3>
          <div className="space-y-6">
            {relatedArticles.map((rel) => (
              <Link to={`/news/${rel.slug || rel.id}`} key={rel.id} className="group block">
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-white/5">
                    <img src={rel.featuredImage || '/placeholder.jpg'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={rel.title} />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h4 className="text-white text-sm font-bold leading-tight group-hover:text-luxury-gold transition-colors line-clamp-2 mb-2">{rel.title}</h4>
                    <span className="text-[9px] uppercase tracking-widest font-black text-white/20">{formatDate(rel.createdAt)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#050505] pb-32">
      <Helmet>
        <title>{article.seoTitle || article.title} | Amaan Intelligence</title>
        <meta name="description" content={article.seoDescription || article.summary} />
        {article.featuredImage && <meta property="og:image" content={article.featuredImage} />}
        <link rel="canonical" href={`https://amaanestate.so/news/${article.slug || article.id}`} />
      </Helmet>

      {/* Article Hero */}
      <div className={`relative flex items-center justify-center overflow-hidden ${article.layoutType === 'featured' ? 'min-h-screen' : 'min-h-[70vh] pt-32'}`}>
        <div className="absolute inset-0 z-0">
          <motion.img 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.4 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            src={article.featuredImage || '/placeholder.jpg'} 
            className="w-full h-full object-cover" 
            alt={article.title} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10 text-center">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Badge className="bg-luxury-gold text-luxury-black border-0 mb-8 px-8 py-2.5 uppercase tracking-[0.3em] font-black text-[10px] rounded-full shadow-2xl shadow-luxury-gold/20">
                  {article.category} Analysis
              </Badge>
              <h1 className="text-5xl md:text-8xl lg:text-9xl font-display font-black text-white mb-10 tracking-tighter leading-[0.85] max-w-6xl mx-auto uppercase">
                  {article.title}
              </h1>
              <div className="flex justify-center items-center gap-10 text-white/30 text-[10px] font-black uppercase tracking-[0.4em] border-y border-white/5 py-8 max-w-2xl mx-auto">
                  <span className="flex items-center gap-3"><Calendar size={14} className="text-luxury-gold" /> {formatDate(article.createdAt)}</span>
                  <div className="w-1 h-1 bg-white/20 rounded-full" />
                  <span className="flex items-center gap-3"><Clock size={14} className="text-luxury-gold" /> {Math.ceil(article.content.length / 1000)} min read</span>
              </div>
            </motion.div>
        </div>
      </div>

      <div className={`container mx-auto px-6 relative z-20 ${article.layoutType === 'featured' ? '-mt-64' : '-mt-32'}`}>
        <div className="grid grid-cols-12 gap-12 max-w-7xl mx-auto">
          
          {/* Main Editorial Body */}
          <div className={`
            ${article.layoutType === 'single' || article.sidebarPlacement === 'none' ? 'col-span-12 max-w-4xl mx-auto' : 
              article.sidebarPlacement === 'left' ? 'col-span-12 lg:col-span-8 lg:order-2' : 
              'col-span-12 lg:col-span-8'}
          `}>
            <div 
              style={{ borderRadius: `${article.borderRadius || 40}px` }}
              className={`
                bg-black border border-white/5 p-8 md:p-16 lg:p-24 shadow-2xl overflow-hidden
                ${article.cardStyle === 'glass' ? 'bg-white/[0.02] backdrop-blur-3xl' : ''}
                ${article.cardStyle === 'premium' ? 'border-luxury-gold/20 shadow-luxury-gold/5' : ''}
                ${article.shadowIntensity === 'heavy' ? 'shadow-black/80' : 'shadow-black/40'}
              `}
            >
               <div className="text-2xl md:text-3xl text-white/50 leading-relaxed italic mb-20 font-serif border-l-4 border-luxury-gold pl-10 max-w-4xl">
                 {article.summary}
               </div>

               <article 
                 className={`
                   prose prose-invert max-w-none 
                   prose-p:text-white/70 prose-p:leading-[1.8] prose-p:font-light prose-p:mb-10 prose-p:text-xl
                   prose-headings:font-display prose-headings:font-black prose-headings:tracking-tighter prose-headings:text-white prose-headings:uppercase
                   prose-h1:text-6xl prose-h2:text-4xl prose-h2:mt-24 prose-h2:mb-8
                   prose-h3:text-2xl prose-h3:mt-16 prose-h3:mb-6
                   prose-strong:text-luxury-gold prose-strong:font-black
                   prose-block:mb-12
                   prose-img:rounded-[2.5rem] prose-img:border prose-img:border-white/5 prose-img:my-16
                   prose-a:text-luxury-gold hover:prose-a:text-white prose-a:transition-colors prose-a:font-bold prose-a:underline-offset-8
                   prose-blockquote:border-l-luxury-gold prose-blockquote:bg-white/5 prose-blockquote:p-10 prose-blockquote:rounded-r-3xl prose-blockquote:italic prose-blockquote:text-white/60
                   ${article.layoutType === 'magazine' ? 'first-letter:text-8xl first-letter:font-black first-letter:text-luxury-gold first-letter:mr-4 first-letter:float-left first-letter:leading-none' : ''}
                 `}
                 dangerouslySetInnerHTML={{ __html: article.content }} 
               />

               {article.gallery && article.gallery.length > 0 && (
                 <div className="mt-32 pt-24 border-t border-white/5">
                   <h3 className="text-3xl font-display font-black text-white mb-12 uppercase tracking-widest text-center">Visual Intelligence Gallery</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {article.gallery.map((url, idx) => (
                       <motion.div 
                         key={idx} 
                         whileInView={{ opacity: 1, scale: 1 }}
                         initial={{ opacity: 0, scale: 0.95 }}
                         className={`rounded-3xl overflow-hidden border border-white/5 h-[400px] ${idx === 0 ? 'md:col-span-2 h-[600px]' : ''}`}
                       >
                         <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-[2s] ease-out" />
                       </motion.div>
                     ))}
                   </div>
                 </div>
               )}

               <div className="mt-24 p-12 bg-white/5 rounded-[2.5rem] flex flex-wrap items-center justify-between gap-8 border border-white/5">
                  <div className="flex items-center gap-6">
                    <div className="w-px h-12 bg-luxury-gold" />
                    <div>
                       <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">Regional Protocol</p>
                       <p className="text-white font-black text-sm uppercase tracking-widest mt-1">Amaan Intelligence System v4.0</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Button variant="outline" size="sm" className="rounded-full border-white/10 text-white hover:bg-white/5 px-6 uppercase text-[9px] font-black tracking-widest"><Share2 size={14} className="mr-3" /> Broadcast Report</Button>
                  </div>
               </div>
            </div>
          </div>

          {/* Sidebar logic */}
          {article.layoutType !== 'single' && article.sidebarPlacement !== 'none' && (
            <div className={`
              col-span-12 lg:col-span-4
              ${article.sidebarPlacement === 'left' ? 'lg:order-1' : ''}
            `}>
              <div className="sticky top-32">
                {sidebar}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
