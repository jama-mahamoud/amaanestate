import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      articleService.getArticleById(id).then(data => {
        setArticle(data);
        setLoading(false);
      });
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

  return (
    <div className="min-h-screen bg-luxury-black pb-20">
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
                {new Date(article.createdAt.seconds * 1000).toLocaleDateString()}
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
                 prose-strong:text-luxury-gold prose-strong:font-bold"
               dangerouslySetInnerHTML={{ __html: article.content }} 
             />
          </div>
        </div>
      </div>
    </div>
  );
}
