import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight, BookOpen, RefreshCw } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';
import { getAllArticles, Article } from '../services/articles';

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useSEO({
    title: 'Market Intelligence & Articles | AmaanEstate',
    description: 'Expert real estate insights, property guides, and news for Jigjiga, the Somali Region, and East Africa.'
  });

  useEffect(() => {
    async function fetchArticles() {
      setLoading(true);
      const data = await getAllArticles();
      setArticles(data);
      setLoading(false);
    }
    fetchArticles();
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title block */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono">
          <span>AmaanEstate</span>
          <span>/</span>
          <span className="text-neutral-300">Articles</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-none">
          Market Intelligence & Articles
        </h1>
        <p className="text-xs text-neutral-400 max-w-lg">
          Stay informed with deep dives, guides, and updates compiled by the AmaanEstate editorial team.
        </p>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-4">
          <RefreshCw className="text-cyan-400 animate-spin" size={24} />
          <p className="text-xs font-mono uppercase tracking-widest text-neutral-500 text-center">Loading articles...</p>
        </div>
      ) : articles.length === 0 ? (
        <div className="py-20 text-center max-w-md mx-auto space-y-3">
          <BookOpen className="text-neutral-600 mx-auto" size={40} />
          <h3 className="text-base font-bold text-white">No Articles Discovered</h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            The database articles index is currently being populated. Check back shortly for market reports.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <article 
              key={article.id} 
              className="group flex flex-col bg-[#0c0c14] border border-white/[0.04] hover:border-cyan-500/20 rounded-xl overflow-hidden transition-all duration-300"
            >
              {/* Cover Image */}
              <div className="aspect-[16/10] overflow-hidden bg-neutral-900 relative">
                <img 
                  src={article.coverImage} 
                  alt={article.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80';
                  }}
                />
              </div>

              {/* Text Fields */}
              <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  {/* Meta */}
                  <div className="flex items-center gap-3 text-xxs text-neutral-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>{formatDate(article.createdAt)}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <User size={12} />
                      <span className="line-clamp-1">{article.author}</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug line-clamp-2">
                    {article.title}
                  </h3>

                  <p className="text-xs text-neutral-400 line-clamp-3 leading-relaxed">
                    {article.summary}
                  </p>
                </div>

                <Link 
                  to={`/articles/${article.slug}`}
                  className="inline-flex items-center gap-1 text-xxs font-bold text-cyan-400 uppercase tracking-widest hover:text-cyan-300 transition-colors pt-2"
                >
                  <span>Read Article</span>
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
