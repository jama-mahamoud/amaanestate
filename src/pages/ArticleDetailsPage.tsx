import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Clock, RefreshCw, BookOpen } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';
import { getArticleBySlug, Article } from '../services/articles';
import { Button } from '../components/ui/button';

export default function ArticleDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticle() {
      if (!slug) return;
      setLoading(true);
      const data = await getArticleBySlug(slug);
      setArticle(data);
      setLoading(false);
    }
    fetchArticle();
  }, [slug]);

  useSEO({
    title: article ? `${article.title} | AmaanEstate Intelligence` : 'Article Details | AmaanEstate',
    description: article ? article.summary : 'Real estate research and reports.'
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="text-cyan-400 animate-spin" size={32} />
        <p className="text-xs font-mono uppercase tracking-widest text-neutral-500">Loading publication details...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4">
        <BookOpen className="text-neutral-600 mx-auto animate-pulse" size={48} />
        <h2 className="text-xl font-bold text-white font-mono">Article Not Discovered</h2>
        <p className="text-xs text-neutral-400 leading-relaxed">
          The requested article cannot be retrieved from the database. It may have been archived or deleted.
        </p>
        <Button onClick={() => navigate('/articles')} className="bg-cyan-600 text-white">
          Back to Articles
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <div>
        <Button
          variant="ghost"
          onClick={() => navigate('/articles')}
          className="text-neutral-400 hover:text-white flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to Articles</span>
        </Button>
      </div>

      {/* Header meta */}
      <div className="space-y-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
          {article.title}
        </h1>

        <div className="flex flex-wrap gap-4 items-center text-xs text-neutral-500 font-mono border-y border-white/[0.03] py-3">
          <div className="flex items-center gap-1.5">
            <Calendar size={14} className="text-neutral-400" />
            <span>Published: {formatDate(article.createdAt)}</span>
          </div>
          <span className="hidden sm:inline text-neutral-800">&bull;</span>
          <div className="flex items-center gap-1.5">
            <User size={14} className="text-neutral-400" />
            <span>Author: {article.author}</span>
          </div>
        </div>
      </div>

      {/* Banner Cover Image */}
      <div className="aspect-[21/9] w-full rounded-xl overflow-hidden bg-neutral-950 border border-white/[0.04]">
        <img 
          src={article.coverImage} 
          alt={article.title} 
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80';
          }}
        />
      </div>

      {/* Main Body Text (Markdown style spacing) */}
      <div className="bg-[#0c0c14]/30 border border-white/[0.02] p-6 sm:p-8 rounded-xl">
        <p className="text-sm font-medium text-cyan-200 leading-relaxed italic border-l-2 border-cyan-400 pl-4 mb-6">
          {article.summary}
        </p>
        
        <div className="text-neutral-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line space-y-4">
          {article.content || 'The body content of this publication is currently being updated by the editorial desk.'}
        </div>
      </div>
    </div>
  );
}
