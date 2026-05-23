import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import { Calendar, User, Clock, ArrowLeft, Share2, Facebook, Twitter, Linkedin, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useCallback } from 'react';
import { articleService } from '@/services/articleService';
import { Article } from '@/types';

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

  return (
    <div className="min-h-screen bg-luxury-black pb-20">
      <Helmet>
        <title>{article.seoTitle || article.title} | AmaanEstate Intelligence</title>
        <meta name="description" content={article.seoDescription || article.summary} />
        {article.featuredImage && <meta property="og:image" content={article.featuredImage} />}
        <link rel="canonical" href={`https://somali-real-estate.com/news/${article.slug || article.id}`} />
      </Helmet>
      {/* Article Hero */}
      <div className="relative min-h-[60vh] flex items-center justify-center pt-24 pb-16">
        <div className="absolute inset-0 z-0">
          <img 
            src={article.featuredImage || '/placeholder.jpg'} 
            className="w-full h-full object-cover" 
            alt={article.title} 
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
            <Badge className="bg-luxury-gold/10 text-luxury-gold border-0 mb-6 px-6 py-2 uppercase tracking-[0.2em] font-bold text-[10px]">
                {article.category} Report
            </Badge>
            <h1 className="text-4xl md:text-7xl font-display font-bold text-white mb-8 tracking-tighter leading-tight">
                {article.title}
            </h1>
            <div className="flex justify-center items-center gap-6 text-white/50 text-xs font-bold uppercase tracking-[0.2em]">
                <span className="flex items-center gap-2"><Calendar size={14} /> {formatDate(article.createdAt)}</span>
                <span className="flex items-center gap-2"><Clock size={14} /> {Math.ceil(article.content.length / 1000)} min read</span>
            </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-20 relative z-20">
        <div className="max-w-3xl mx-auto">
          <div className="bg-black border border-white/10 p-8 md:p-16 rounded-[2.5rem] shadow-2xl">
             
             <div className="prose prose-invert prose-lg max-w-none 
                 prose-p:text-white/70 prose-p:leading-relaxed prose-p:font-light prose-p:mb-6
                 prose-h2:text-3xl prose-h2:mb-6 prose-h2:mt-10
                 prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-8
                 prose-strong:text-luxury-gold prose-strong:font-bold
                 prose-img:rounded-3xl prose-img:border prose-img:border-white/10
                 prose-a:text-luxury-gold hover:prose-a:text-white prose-a:transition-colors
                 prose-blockquote:border-l-luxury-gold prose-blockquote:bg-white/5 prose-blockquote:p-6 prose-blockquote:rounded-r-2xl"
               dangerouslySetInnerHTML={{ __html: article.content }} 
             />


             {article.gallery && article.gallery.length > 0 && (
               <div className="mt-16 pt-16 border-t border-white/5">
                 <h3 className="text-2xl font-display font-bold text-white mb-8">Media Gallery</h3>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                   {article.gallery.map((url, idx) => (
                     <div key={idx} className="aspect-square rounded-2xl overflow-hidden border border-white/10">
                       <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                     </div>
                   ))}
                 </div>
               </div>
             )}

             {article.tags && article.tags.length > 0 && (
               <div className="mt-16 flex flex-wrap gap-3">
                 {article.tags.map((tag) => (
                   <span key={tag} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-white/60 text-[10px] uppercase font-bold tracking-widest hover:bg-luxury-gold hover:text-luxury-black transition-colors cursor-pointer">
                     #{tag}
                   </span>
                 ))}
               </div>
             )}
          </div>
        </div>
      </div>

      {relatedArticles.length > 0 && (
        <div className="container mx-auto px-4 mt-20 relative z-20">
          <div className="max-w-5xl mx-auto">
            <h3 className="text-3xl font-display font-bold text-white mb-10 border-b border-white/5 pb-6">Related Reports</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedArticles.map((rel) => (
                <Link to={`/news/${rel.slug || rel.id}`} key={rel.id} className="group block">
                  <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-4 border border-white/5 relative">
                    <img src={rel.featuredImage || '/placeholder-news.jpg'} className="w-full h-full object-cover opacity-100 transition-all duration-700 group-hover:scale-105" alt={rel.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-luxury-black/80 to-transparent"></div>
                  </div>
                  <h4 className="text-white font-display font-bold text-xl mb-2 group-hover:text-luxury-gold transition-colors tracking-tight line-clamp-2">{rel.title}</h4>
                  <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest">{formatDate(rel.createdAt)}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
