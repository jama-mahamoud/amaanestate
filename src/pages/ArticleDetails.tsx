import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import { Calendar, User, Clock, ArrowLeft, Share2, Facebook, Twitter, Linkedin, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { articleService } from '@/services/articleService';
import { Article } from '@/types';

import NotFoundState from '@/components/NotFoundState';

export default function ArticleDetails() {
  const { id } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchArticle = async () => {
        let data = await articleService.getArticleById(id);
        if (!data) {
          data = await articleService.getArticleBySlug(id);
        }
        setArticle(data);
        
        if (data) {
           const allArticles = await articleService.getArticles();
           setRelatedArticles(allArticles.filter(a => a.id !== data.id).slice(0, 3));
        }

        setLoading(false);
      };
      fetchArticle();
    }
  }, [id]);

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

  const formatDate = (dateValue: any) => {
    if (!dateValue || !dateValue.seconds) return 'Recently Published';
    return new Date(dateValue.seconds * 1000).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-luxury-black pb-20">
      <Helmet>
        <title>{article.seoTitle || article.title} | AmaanEstate Intelligence</title>
        <meta name="description" content={article.seoDescription || article.summary} />
        {article.featuredImage && <meta property="og:image" content={article.featuredImage} />}
        <link rel="canonical" href={`https://somali-real-estate.com/news/${article.slug || article.id}`} />
      </Helmet>
      {/* Article Hero */}
      <div className="relative h-[70vh] min-h-[500px] overflow-hidden">
        <motion.img 
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          src={article.featuredImage || '/placeholder-news.jpg'} 
          className="w-full h-full object-cover grayscale opacity-40" 
          alt={article.title} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-luxury-black/60 to-transparent"></div>
        
        <div className="absolute inset-x-0 bottom-0 pb-20">
          <div className="container mx-auto px-4 text-center max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
               <div className="flex justify-center mb-8">
                 <Badge className="bg-luxury-gold text-luxury-black border-0 px-6 py-2 uppercase tracking-[0.2em] font-bold text-[10px]">
                    {article.category} Report
                 </Badge>
               </div>
              <h1 className="text-4xl md:text-7xl font-display font-bold text-white mb-8 tracking-tighter leading-[0.9]">
                {article.title}
              </h1>
              <div className="text-white/50 text-[10px] font-bold uppercase tracking-[0.3em]">
                {formatDate(article.createdAt)}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-16 relative z-20">
        <div className="max-w-3xl mx-auto">
          <div className="glass-card p-10 md:p-16 rounded-[2.5rem] shadow-2xl relative overflow-hidden mb-16 border border-white/5">
             <div className="mb-12">
                <Link to="/news" className="inline-flex items-center gap-3 text-white/30 hover:text-luxury-gold transition-all duration-300 text-[10px] font-bold tracking-[0.3em] uppercase">
                   <ArrowLeft size={16} /> Directory Archive
                </Link>
             </div>

             <div 
               className="prose prose-invert prose-luxury max-w-none 
                 prose-p:text-white/60 prose-p:text-lg prose-p:leading-relaxed prose-p:font-light prose-p:mb-8
                 prose-h3:text-white prose-h3:font-display prose-h3:text-3xl prose-h3:font-bold prose-h3:mb-6 prose-h3:mt-12 prose-h3:tracking-tight
                 prose-strong:text-luxury-gold prose-strong:font-bold
                 prose-img:rounded-3xl prose-img:border prose-img:border-white/10 prose-img:mb-12 prose-img:mt-12
                 prose-a:text-luxury-gold hover:prose-a:text-white prose-a:transition-colors"
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
                    <img src={rel.featuredImage || '/placeholder-news.jpg'} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105" alt={rel.title} />
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
