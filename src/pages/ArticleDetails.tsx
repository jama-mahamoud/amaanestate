import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Calendar, Clock, ArrowLeft, Share2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect, useCallback } from 'react';
import { articleService } from '@/services/articleService';
import { Article } from '@/types';
import { toast } from 'sonner';
import { useSEO } from '@/hooks/useSEO';

import NotFoundState from '@/components/NotFoundState';

export default function ArticleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  // Compute dynamic metadata details
  const metaImageUrl = (() => {
    if (!article) return undefined;
    
    let rawUrl = article.socialImage || article.featuredImage;
    if (!rawUrl && article.gallery && Array.isArray(article.gallery) && article.gallery.length > 0) {
      rawUrl = article.gallery.find(g => typeof g === 'string' && g.trim() !== '');
    }
    
    // No fallback images for article shares (only article-specific featured image / thumbnail)
    if (!rawUrl || typeof rawUrl !== 'string' || rawUrl.trim() === '') {
      return undefined;
    }
    
    const trimmedUrl = rawUrl.trim();
    
    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
      return trimmedUrl;
    }
    
    if (trimmedUrl.startsWith('//')) {
      return `https:${trimmedUrl}`;
    }
    
    const cleanPath = trimmedUrl.startsWith('/') ? trimmedUrl : `/${trimmedUrl}`;
    return `https://www.amaanestate.com${cleanPath}`;
  })();

  const cleanContentText = article ? (article.content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : '';
  const metaDesc = article ? (article.seoDescription || article.summary || (cleanContentText ? cleanContentText.substring(0, 160) + '...' : '')) : '';

  useSEO({
    title: article ? (article.seoTitle || article.title) : 'Intelligence Report',
    description: metaDesc,
    image: metaImageUrl,
    url: article ? `https://www.amaanestate.com/news/${article.slug || article.id}` : undefined,
    type: 'article'
  });

  useEffect(() => {
    let active = true;
    if (id) {
      const fetchArticle = async () => {
        let data = await articleService.getArticleById(id);
        if (!data) {
          data = await articleService.getArticleBySlug(id);
        }
        
        if (active) {
          if (data) {
            const targetSlug = data.slug || id;
            const canonicalPath = `/news/${targetSlug}`;
            if (window.location.pathname !== canonicalPath) {
              console.log(`[CLIENT-SIDE] Redirecting from ${window.location.pathname} to canonical ${canonicalPath}`);
              navigate(canonicalPath, { replace: true });
              return;
            }
            setArticle(data);
            const allArticles = await articleService.getArticles();
            if (active) setRelatedArticles(allArticles.filter(a => a.id !== data.id).slice(0, 3));
          } else {
            setArticle(null);
          }
          setLoading(false);
        }
      };
      fetchArticle();
    }
    return () => { active = false; };
  }, [id, navigate]);

  const formatDate = useCallback((dateValue: any) => {
    if (!dateValue || !dateValue.seconds) return 'Recently Published';
    return new Date(dateValue.seconds * 1000).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Report link copied to clipboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-t-2 border-b-2 border-[#C5A059] animate-spin"></div>
          <span className="text-white/40 text-xs tracking-widest font-bold uppercase">Loading intelligence report...</span>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-[#050505] pt-24">
        <NotFoundState 
          title="Report Not Found" 
          description="The requested intelligence report could not be retrieved from the editorial archive. It may have been retracted or is undergoing peer-review validation."
          backLink="/news"
          backLabel="BACK TO DIRECTORY"
        />
      </div>
    );
  }

  // Determine dynamic styles based on author choices / dashboard settings
  const dynamicBorderRadius = article.borderRadius ? `${article.borderRadius}px` : '1.5rem';
  
  const getCardStyle = () => {
    let base = "bg-black border border-white/5 shadow-2xl relative overflow-hidden ";
    if (article.cardStyle === 'glass') {
      base += "bg-white/[0.02] backdrop-blur-3xl ";
    } else if (article.cardStyle === 'premium') {
      base += "border-[#C5A059]/30 shadow-2xl shadow-[#C5A059]/5 ";
    }
    if (article.shadowIntensity === 'heavy') {
      base += "shadow-black/90 ";
    } else {
      base += "shadow-black/50 ";
    }
    return base;
  };

  return (
    <div className="min-h-screen bg-[#050505] pb-24 font-sans text-white antialiased">
      <Helmet>
        <title>{article.seoTitle || article.title} | Amaan Intelligence</title>
        <meta name="description" content={metaDesc} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={article.seoTitle || article.title} />
        <meta property="og:description" content={metaDesc} />
        {metaImageUrl && <meta property="og:image" content={metaImageUrl} />}
        <meta property="og:url" content={`https://www.amaanestate.com/news/${article.slug || article.id}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.seoTitle || article.title} />
        <meta name="twitter:description" content={metaDesc} />
        {metaImageUrl && <meta name="twitter:image" content={metaImageUrl} />}
        <link rel="canonical" href={`https://www.amaanestate.com/news/${article.slug || article.id}`} />
      </Helmet>

      {/* Hero Banner Background & Top Meta */}
      <div className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden border-b border-white/5 bg-gradient-to-b from-black via-[#050505] to-[#0a0a0a]">
        {/* Ambient Glowing Background lights */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-30 select-none">
          <div className="absolute top-1/4 right-10 w-[300px] h-[300px] bg-[#C5A059]/10 rounded-full filter blur-[100px]" />
          <div className="absolute bottom-1/4 left-10 w-[300px] h-[300px] bg-white/5 rounded-full filter blur-[120px]" />
        </div>

        {/* Faded Background Image */}
        {article.featuredImage && (
          <div className="absolute inset-0 z-0 opacity-20 filter blur-sm">
            <img 
              src={article.featuredImage} 
              className="w-full h-full object-cover select-none pointer-events-none" 
              alt=""
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#050505]/70 to-black"></div>
          </div>
        )}

        <div className="container mx-auto max-w-4xl px-4 sm:px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Category badge */}
            <div>
              <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase border ${article.type === 'market_report' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' : 'bg-[#C5A059]/10 border-[#C5A059]/20 text-[#C5A059]'}`}>
                {article.type || article.category || 'MARKET ANALYSIS'}
              </span>
            </div>

            {/* Editorial Title - Responsive, elegant serif hierarchy */}
            <h1 className="text-2xl sm:text-3.5xl md:text-4.5xl lg:text-5xl font-display font-medium text-white tracking-tight leading-[1.2] max-w-3xl mx-auto">
              {article.title}
            </h1>

            {/* Responsive visual divider & metadata */}
          </motion.div>
        </div>
      </div>

      {/* Main Container */}
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 relative z-20 -mt-10 sm:-mt-12">
        {/* Back and Action controls */}
        <div className="flex items-center justify-between mb-6 text-xs text-white/50 px-1">
          <Link 
            to="/news" 
            className="flex items-center gap-2 hover:text-white transition-colors py-1 outline-none group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Insights</span>
          </Link>
          <button 
            onClick={handleShare}
            className="flex items-center gap-1.5 hover:text-white transition-colors py-1 outline-none group"
          >
            <Share2 size={13} />
            <span>Copy Link</span>
          </button>
        </div>

        {/* Article Reading Card Container */}
        <div 
          style={{ borderRadius: dynamicBorderRadius }}
          className={getCardStyle()}
        >
          {/* Main Hero Image Inside the Card, nested beautifully */}
          {article.featuredImage && (
            <div className="w-full aspect-[2/1] bg-white/5 min-h-[220px] max-h-[440px] overflow-hidden border-b border-white/5">
              <img 
                src={article.featuredImage} 
                className="w-full h-full object-cover" 
                alt={article.title} 
              />
            </div>
          )}

          {/* Text Pad */}
          <div className="p-5 sm:p-10 md:p-14 lg:p-16">
            {/* Elegant Summary Quote */}
            {article.summary && (
              <div className="text-lg sm:text-xl text-white/70 font-serif italic border-l-2 border-[#C5A059] pl-5 sm:pl-6 mb-10 sm:mb-12 leading-relaxed">
                {article.summary}
              </div>
            )}

            {/* Structured Editorial HTML Body */}
            <article 
              className={`
                prose prose-invert max-w-none break-words
                prose-p:text-white/80 prose-p:leading-[1.8] prose-p:font-normal prose-p:mb-6 prose-p:text-base sm:prose-p:text-lg prose-p:tracking-normal
                prose-headings:text-white prose-headings:font-display prose-headings:font-semibold prose-headings:tracking-tight prose-headings:mb-4
                prose-h2:text-xl sm:prose-h2:text-2xl md:prose-h2:text-3xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:font-medium
                prose-h3:text-lg sm:prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-h3:font-medium
                prose-strong:text-[#C5A059] prose-strong:font-bold
                prose-blockquote:border-l-[#C5A059] prose-blockquote:bg-white/[0.01] prose-blockquote:p-5 sm:prose-blockquote:p-8 prose-blockquote:rounded-r-xl prose-blockquote:italic prose-blockquote:text-white/70 prose-blockquote:my-8 prose-blockquote:border-l-2
                prose-img:rounded-xl prose-img:border prose-img:border-white/5 prose-img:my-8 prose-img:w-full prose-img:object-cover
                prose-a:text-[#C5A059] hover:prose-a:text-white prose-a:transition-colors prose-a:font-semibold prose-a:underline prose-a:underline-offset-4
                prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-6 prose-ul:text-white/70 prose-ul:space-y-2
                prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-6 prose-ol:text-white/70 prose-ol:space-y-2
                prose-li:text-base sm:prose-li:text-lg
                ${article.layoutType === 'magazine' ? 'first-letter:text-6xl sm:first-letter:text-7xl first-letter:font-bold first-letter:text-[#C5A059] first-letter:mr-3 first-letter:float-left first-letter:leading-none' : ''}
              `}
              dangerouslySetInnerHTML={{ __html: article.content }} 
            />

            {/* Gallery module, responsive images */}
            {article.gallery && article.gallery.length > 0 && (
              <div className="mt-16 pt-12 border-t border-white/5">
                <h3 className="text-xs font-display font-medium uppercase tracking-[0.2em] text-[#C5A059] mb-6 text-center">
                  Visual Exhibit Panel
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {article.gallery.map((url, idx) => (
                    <div 
                      key={idx} 
                      className={`rounded-xl overflow-hidden border border-white/5 h-[220px] sm:h-[300px] ${idx === 0 && article.gallery.length > 1 ? 'md:col-span-2 h-[340px] sm:h-[400px]' : ''}`}
                    >
                      <img 
                        src={url} 
                        alt={`Gallery Exhibit ${idx + 1}`} 
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.03]" 
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Related Articles List - Handled inside the clean card structure */}
            {relatedArticles.length > 0 && (
              <div className="mt-16 pt-12 border-t border-white/5">
                <h3 className="text-xs font-display font-semibold uppercase tracking-[0.2em] text-[#C5A059]/80 mb-6">
                  Related Analysis
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {relatedArticles.map((rel) => (
                    <Link 
                      to={`/news/${rel.slug || rel.id}`} 
                      key={rel.id} 
                      className="group flex flex-col justify-between bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-[#C5A059]/20 rounded-xl p-4 transition-all duration-300 h-full"
                    >
                      <div>
                        <div className="aspect-[16/10] w-full rounded-lg overflow-hidden mb-3 bg-white/5">
                          <img 
                            src={rel.featuredImage || '/placeholder.jpg'} 
                            alt={rel.title} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                            loading="lazy"
                          />
                        </div>
                        <h4 className="text-white text-xs font-medium line-clamp-2 leading-snug group-hover:text-[#C5A059] transition-colors">
                          {rel.title}
                        </h4>
                      </div>
                      <span className="text-[9px] uppercase tracking-widest font-bold text-white/30 block mt-4">
                        {formatDate(rel.createdAt)}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
