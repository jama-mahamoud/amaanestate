import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Calendar,
  User,
  ExternalLink,
  MessageSquare,
  Trash2,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { moderationService } from '@/services/moderationService';
import { articleService } from '@/services/articleService';
import { Article } from '@/types';
import { toast } from 'sonner';

export default function ArticleModeratedList() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  useEffect(() => {
    loadArticles();
  }, [statusFilter]);

  const loadArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await moderationService.getAllArticles(statusFilter === 'all' ? undefined : statusFilter === 'published');
      setArticles(data);
    } catch (err: any) {
      setError(err.message || 'Failed to sync content network');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    setActioningId(id);
    const success = await articleService.updateArticle(id, { published: !currentStatus });
    if (success) {
      toast.success(currentStatus ? 'Article unpublished' : 'Article published successfully');
      setArticles(prev => prev.map(a => a.id === id ? { ...a, published: !currentStatus } : a));
    } else {
      toast.error('Failed to update article status');
    }
    setActioningId(null);
  };

  const handleToggleFeature = async (id: string, isFeatured: boolean) => {
    setActioningId(id);
    const success = await articleService.updateArticle(id, { isFeatured: !isFeatured });
    if (success) {
      toast.success(isFeatured ? 'Article removed from featured' : 'Article marked as featured');
      setArticles(prev => prev.map(a => a.id === id ? { ...a, isFeatured: !isFeatured } : a));
    } else {
      toast.error('Failed to update feature status');
    }
    setActioningId(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this article? This action cannot be undone.')) return;
    
    setActioningId(id);
    const success = await articleService.deleteArticle(id);
    if (success) {
      toast.success('Article deleted');
      setArticles(prev => prev.filter(a => a.id !== id));
    } else {
      toast.error('Failed to delete article');
    }
    setActioningId(null);
  };

  if (loading && articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-luxury-gold mb-4" size={32} />
        <p className="text-white/20 text-[10px] uppercase font-bold tracking-[0.3em]">Querying Content Network...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 glass-card rounded-[3rem] border border-red-500/10">
        <FileText className="text-red-500 mb-6" size={48} />
        <h3 className="text-2xl font-display font-bold">Content Synchronizer Error</h3>
        <p className="text-white/40 text-xs mt-2 uppercase tracking-widest">{error}</p>
        <Button onClick={loadArticles} className="mt-8 border border-white/10 hover:border-luxury-gold text-[10px] uppercase font-black tracking-widest">Retry Feed Query</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Status Bar */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'published', 'draft'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-xl text-[10px] uppercase font-black tracking-widest transition-all ${
              statusFilter === s 
              ? 'bg-luxury-gold text-black border-luxury-gold' 
              : 'bg-white/5 border-white/5 text-white/40 hover:text-white'
            } border`}
          >
            {s}
          </button>
        ))}
      </div>

      {articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 glass-card rounded-[3rem] border-dashed border-white/5">
          <FileText className="text-white/10 mb-6" size={48} />
          <h3 className="text-2xl font-display font-bold">Newsroom Empty</h3>
          <p className="text-white/20 text-xs mt-2 uppercase tracking-widest">No articles found in the intelligence stream</p>
        </div>
      ) : (
        <div className="space-y-6">
          {articles.map((article) => (
            <motion.div
              key={article.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card hover:bg-white/[0.03] transition-all p-8 rounded-[2.5rem] border border-white/5 flex flex-col lg:flex-row items-center gap-10"
            >
              {/* Featured Image */}
              <div className="w-full lg:w-56 aspect-[16/9] rounded-3xl overflow-hidden relative border border-white/10 shrink-0">
                <img 
                  src={article.featuredImage || '/placeholder-news.jpg'} 
                  alt={article.title} 
                  className="w-full h-full object-cover"
                />
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg ${article.published ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                  {article.published ? 'Live' : 'Draft'}
                </div>
                {article.isFeatured && (
                  <div className="absolute bottom-4 left-4 p-1.5 bg-luxury-gold rounded-lg text-black">
                    <Star size={12} fill="currentColor" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 space-y-4 w-full">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                   <div>
                      <div className="flex items-center gap-2 mb-2">
                         <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-widest text-luxury-gold">{article.category}</span>
                         <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-widest text-white/40">{article.language}</span>
                      </div>
                      <h4 className="text-2xl font-display font-bold tracking-tight line-clamp-1">{article.title}</h4>
                      <div className="flex items-center gap-6 mt-2">
                         <div className="flex items-center gap-1.5 text-white/20 text-[9px] font-black uppercase tracking-widest">
                            <Calendar size={12} className="text-luxury-gold/50" /> {article.createdAt?.toDate ? article.createdAt.toDate().toLocaleDateString() : 'N/A'}
                         </div>
                         <div className="flex items-center gap-1.5 text-white/20 text-[9px] font-black uppercase tracking-widest">
                            <User size={12} className="text-luxury-gold/50" /> {article.authorId.substring(0, 8)}...
                         </div>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <a href={`/news/${article.id}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm" className="h-10 rounded-xl bg-white/5 border border-white/5 hover:border-luxury-gold hover:text-luxury-gold text-[10px] uppercase font-black tracking-widest">
                           <ExternalLink size={14} className="mr-2" /> Inspect
                        </Button>
                      </a>
                   </div>
                </div>

                <p className="text-white/40 text-sm line-clamp-2 leading-relaxed max-w-2xl">
                  {article.summary}
                </p>

                <div className="flex gap-2 pt-2">
                   <button 
                    onClick={() => handleToggleFeature(article.id, !!article.isFeatured)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-[8px] font-black uppercase tracking-widest ${
                      article.isFeatured 
                      ? 'bg-luxury-gold/20 border-luxury-gold text-luxury-gold' 
                      : 'bg-white/5 border-white/10 text-white/40 hover:text-white'
                    }`}
                   >
                      <Star size={10} fill={article.isFeatured ? 'currentColor' : 'none'} /> {article.isFeatured ? 'Featured Story' : 'Mark Featured'}
                   </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-row lg:flex-col gap-3 w-full lg:w-48 shrink-0">
                 <Button 
                    onClick={() => handleTogglePublish(article.id, article.published)}
                    disabled={actioningId === article.id}
                    className={article.published 
                      ? "flex-1 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white h-14 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all"
                      : "flex-1 bg-luxury-gold text-black hover:bg-white h-14 rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-luxury-gold/10"
                    }
                 >
                    {actioningId === article.id ? <Loader2 className="animate-spin" size={16} /> : (article.published ? <XCircle size={16} className="mr-2" /> : <CheckCircle2 size={16} className="mr-2" />)} 
                    {article.published ? 'Unpublish' : 'Publish'}
                 </Button>
                 <Button 
                    onClick={() => handleDelete(article.id)}
                    disabled={actioningId === article.id}
                    variant="ghost"
                    className="flex-1 text-white/20 hover:text-red-500 hover:bg-red-500/5 h-14 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all"
                 >
                    <Trash2 size={16} className="mr-2" /> Expunge
                 </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
