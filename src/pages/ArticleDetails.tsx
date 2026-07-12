import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Calendar, Clock, ArrowLeft, Share2, X, ExternalLink, ShieldAlert, BadgeInfo, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { articleService } from '@/services/articleService';
import { Article } from '@/types';
import { toast } from 'sonner';
import { useSEO } from '@/hooks/useSEO';

import NotFoundState from '@/components/NotFoundState';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export default function ArticleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  // Scroll Tracking & Layout States
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showStickyCta, setShowStickyCta] = useState(false);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  // Compute dynamic metadata details
  const metaImageUrl = (() => {
    if (!article) return undefined;
    
    let rawUrl = article.socialImage || article.featuredImage;
    if (!rawUrl && article.gallery && Array.isArray(article.gallery) && article.gallery.length > 0) {
      const firstImage = article.gallery.find(g => g.url && g.url.trim() !== '');
      rawUrl = firstImage?.url;
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

  const cleanContentText = useMemo(() => {
    if (!article) return '';
    return (article.content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }, [article]);

  const metaDesc = article ? (article.seoDescription || article.summary || (cleanContentText ? cleanContentText.substring(0, 160) + '...' : '')) : '';

  // Calculate detailed word count and reading metrics
  const totalWordCount = useMemo(() => {
    if (!cleanContentText) return 0;
    return cleanContentText.split(/\s+/).filter(Boolean).length;
  }, [cleanContentText]);

  const readingTime = useMemo(() => {
    return Math.max(1, Math.ceil(totalWordCount / 225)); // assuming standard 225 words-per-minute
  }, [totalWordCount]);

  useSEO({
    title: article ? (article.seoTitle || article.title) : 'Intelligence Report',
    description: metaDesc,
    image: metaImageUrl,
    url: article ? `https://www.amaanestate.com/news/${article.slug || article.id}` : undefined,
    type: 'article'
  });

  // Fetch article details
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

  // Scroll handler for progress and sticky CTA
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.scrollY / totalScroll) * 100);
      }
      setShowStickyCta(window.scrollY > 450);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Parse Headings & Affiliate Products from HTML Content
  useEffect(() => {
    if (!article || !article.content) return;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = article.content;

    // 1. Generate TOC Elements
    const headingElements = tempDiv.querySelectorAll('h2, h3');
    const headingItems: TocItem[] = [];
    headingElements.forEach((el, idx) => {
      headingItems.push({
        id: `heading-${idx}`,
        text: el.textContent || '',
        level: parseInt(el.tagName.substring(1))
      });
    });
    setToc(headingItems);

    // 2. Discover Affiliate Products
    const productBoxes = tempDiv.querySelectorAll('[data-type="product-box"]');
    const products: any[] = [];
    productBoxes.forEach((el) => {
      try {
        const nameEl = el.querySelector('h4');
        const companyEl = el.querySelector('span');
        const imgEl = el.querySelector('img');
        const priceEl = el.querySelector('.text-2\\.5xl, .font-mono');
        const affiliateLinkEl = el.querySelector('a');
        
        if (nameEl) {
          products.push({
            name: nameEl.textContent || 'Affiliate Product',
            company: companyEl ? companyEl.textContent || '' : 'Review Recommendation',
            imageUrl: imgEl ? imgEl.getAttribute('src') || '' : '',
            price: priceEl ? priceEl.textContent || '' : 'Best Value',
            affiliateUrl: affiliateLinkEl ? affiliateLinkEl.getAttribute('href') || '#' : '#'
          });
        }
      } catch (e) {
        console.error('Failed to parse dynamic related product box', e);
      }
    });
    setRelatedProducts(products);
  }, [article]);

  // HTML content injected with dynamic unique Heading IDs for anchor navigations
  const contentWithHeadingIds = useMemo(() => {
    if (!article || !article.content) return '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = article.content;
    const headingElements = tempDiv.querySelectorAll('h2, h3');
    headingElements.forEach((el, idx) => {
      el.setAttribute('id', `heading-${idx}`);
      // Add a slight scroll margin and transition-all
      el.setAttribute('style', 'scroll-margin-top: 100px;');
    });
    return tempDiv.innerHTML;
  }, [article]);

  // Schema Markup Generator (Breadcrumbs, Article, FAQs, Products)
  const schemas = useMemo(() => {
    if (!article) return [];
    const schemaList: any[] = [];
    const articleUrl = `https://www.amaanestate.com/news/${article.slug || article.id}`;

    // A. Breadcrumb List Schema
    schemaList.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.amaanestate.com" },
        { "@type": "ListItem", "position": 2, "name": "Directory", "item": "https://www.amaanestate.com/news" },
        { "@type": "ListItem", "position": 3, "name": article.title, "item": articleUrl }
      ]
    });

    // B. Main Editorial Article Schema
    schemaList.push({
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "mainEntityOfPage": { "@type": "WebPage", "@id": articleUrl },
      "headline": article.title,
      "description": article.seoDescription || article.summary,
      "image": metaImageUrl,
      "datePublished": article.createdAt ? new Date(article.createdAt.seconds * 1000).toISOString() : new Date().toISOString(),
      "dateModified": article.createdAt ? new Date(article.createdAt.seconds * 1000).toISOString() : new Date().toISOString(),
      "author": { "@type": "Person", "name": "Amaan Real-Estate Compliance Team" },
      "publisher": {
        "@type": "Organization",
        "name": "Amaan NEWSEditorial Studio",
        "logo": { "@type": "ImageObject", "url": "https://www.amaanestate.com/logo.png" }
      }
    });

    // C. Dynamic FAQPage Schema from blocks
    if (article.content && article.content.includes('data-type="faq-block"')) {
      try {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = article.content;
        const faqElement = tempDiv.querySelector('[data-type="faq-block"]');
        if (faqElement) {
          // Parse questions and answers
          const detailsElements = faqElement.querySelectorAll('details');
          const faqs: any[] = [];
          detailsElements.forEach((det) => {
            const question = det.querySelector('summary')?.textContent?.trim() || '';
            const answer = det.querySelector('div')?.textContent?.trim() || '';
            if (question && answer) {
              faqs.push({
                "@type": "Question",
                "name": question.replace(/^[Q:\s▼]+|[\s▼]+$/g, '').trim(),
                "acceptedAnswer": { "@type": "Answer", "text": answer }
              });
            }
          });
          if (faqs.length > 0) {
            schemaList.push({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": faqs
            });
          }
        }
      } catch (e) {
        console.error('Failed to parse FAQ JSON schema', e);
      }
    }

    // D. Dynamic Product / Review Schema from blocks
    if (relatedProducts.length > 0) {
      relatedProducts.forEach((prod) => {
        schemaList.push({
          "@context": "https://schema.org",
          "@type": "Product",
          "name": prod.name,
          "image": prod.imageUrl,
          "description": article.summary || article.title,
          "brand": { "@type": "Brand", "name": prod.company },
          "offers": {
            "@type": "Offer",
            "price": prod.price.replace(/[^\d.]/g, '') || '0.00',
            "priceCurrency": "USD",
            "url": prod.affiliateUrl
          },
          "review": {
            "@type": "Review",
            "reviewRating": {
              "@type": "Rating",
              "ratingValue": "4.8",
              "bestRating": "5"
            },
            "author": { "@type": "Person", "name": "Amaan Editorial Team" }
          }
        });
      });
    }

    return schemaList;
  }, [article, metaImageUrl, relatedProducts]);

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
    <div className="min-h-screen bg-[#050505] pb-24 font-sans text-white antialiased relative">
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
        
        {/* Schema markup tags dynamic injection */}
        {schemas.map((schema, sIdx) => (
          <script key={sIdx} type="application/ld+json">
            {JSON.stringify(schema)}
          </script>
        ))}
      </Helmet>

      {/* Dynamic Scrolling Reading Progress Bar */}
      <div 
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C5A059]/40 via-[#C5A059] to-[#C5A059] z-[99] origin-left transition-all duration-75"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Hero Banner Background & Top Meta */}
      <div className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden border-b border-white/5 bg-gradient-to-b from-black via-[#050505] to-[#0a0a0a]">
        {/* Ambient Glowing Background lights */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-30 select-none">
          <div className="absolute top-1/4 right-10 w-[300px] h-[300px] bg-[#C5A059]/10 rounded-full filter blur-[100px]" />
          <div className="absolute bottom-1/4 left-10 w-[300px] h-[300px] bg-white/5 rounded-full filter blur-[120px]" />
        </div>

        {article.featuredImage?.url && (
          <div className="absolute inset-0 z-0 opacity-20 filter blur-sm">
            <img 
              src={article.featuredImage.url} 
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
            <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] font-mono font-bold tracking-wider text-white/50 pt-2 uppercase">
              <span className="flex items-center gap-1.5">
                <Calendar size={13} className="text-[#C5A059]" />
                {formatDate(article.createdAt)}
              </span>
              <span className="w-1.5 h-1.5 bg-white/20 rounded-full hidden sm:block" />
              <span className="flex items-center gap-1.5">
                <Clock size={13} className="text-[#C5A059]" />
                {readingTime} min read
              </span>
              <span className="w-1.5 h-1.5 bg-white/20 rounded-full hidden sm:block" />
              <span className="flex items-center gap-1.5">
                <FileText size={13} className="text-[#C5A059]" />
                {totalWordCount} words
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Container */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 relative z-20 -mt-10 sm:-mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* DESKTOP STICKY LEFT COLUMN: Outline & Affiliate Products */}
          <div className="hidden lg:block lg:col-span-3 sticky top-24 space-y-6">
            
            {toc.length > 0 && (
              <div className="bg-black/60 border border-white/5 rounded-3xl p-6 backdrop-blur-xl space-y-4">
                <span className="text-[10px] uppercase font-black tracking-[0.2em] text-[#C5A059] block pb-2 border-b border-white/5">Report Chapter Map</span>
                <nav className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                  {toc.map((item) => (
                    <a 
                      key={item.id} 
                      href={`#${item.id}`} 
                      onClick={(e) => {
                        e.preventDefault();
                        const target = document.getElementById(item.id);
                        if (target) {
                          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                      className={`block text-xs font-medium hover:text-[#C5A059] transition-all leading-normal ${item.level === 3 ? 'pl-4 text-white/30 border-l border-white/5 mt-1' : 'text-white/60 hover:translate-x-1'}`}
                    >
                      {item.level === 3 ? '↳ ' : ''}{item.text}
                    </a>
                  ))}
                </nav>
              </div>
            )}

            {relatedProducts.length > 0 && (
              <div className="bg-black/60 border border-[#C5A059]/20 rounded-3xl p-6 backdrop-blur-xl space-y-4">
                <span className="text-[10px] uppercase font-black tracking-[0.2em] text-[#C5A059] block pb-2 border-b border-white/5">Affiliate Products</span>
                <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                  {relatedProducts.map((p, idx) => (
                    <a 
                      key={idx} 
                      href={p.affiliateUrl} 
                      target="_blank" 
                      rel="nofollow sponsored" 
                      className="group block bg-white/[0.02] border border-white/5 hover:border-[#C5A059]/30 rounded-2xl p-3.5 transition-all space-y-2.5"
                    >
                      <div className="flex gap-3 items-center">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} className="w-10 h-10 rounded-xl object-contain bg-black p-1 border border-white/10 shrink-0" alt="" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xs text-white/40 shrink-0">✦</div>
                        )}
                        <div className="min-w-0 flex-1">
                          <span className="text-[8px] uppercase font-bold text-[#C5A059] block leading-none truncate">{p.company}</span>
                          <h5 className="text-[11px] font-black text-white truncate leading-normal group-hover:text-[#C5A059] transition-colors mt-0.5">{p.name}</h5>
                          <span className="text-[10px] font-mono font-bold text-white/60 block mt-0.5">{p.price}</span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* MAIN COLUMN (Article Content) */}
          <div className="col-span-12 lg:col-span-9">
            
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
              {article.featuredImage?.url && (
                <div className="w-full aspect-[2/1] bg-white/5 min-h-[220px] max-h-[440px] overflow-hidden border-b border-white/5">
                  <img 
                    src={article.featuredImage.url} 
                    className="w-full h-full object-cover" 
                    alt={article.featuredImage.caption || article.title} 
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

                {/* Collapsible Outline/TOC for Mobile Screens */}
                {toc.length > 0 && (
                  <div className="lg:hidden bg-white/[0.02] border border-white/5 rounded-2xl p-4 sm:p-5 mb-8 text-left">
                    <details className="group">
                      <summary className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C5A059] cursor-pointer flex justify-between items-center outline-none list-none [&::-webkit-details-marker]:hidden select-none">
                        <span>✦ Outline & Chapters</span>
                        <span className="text-[10px] group-open:rotate-180 transition-transform duration-300">▼</span>
                      </summary>
                      <nav className="mt-4 pt-4 border-t border-white/5 space-y-2.5">
                        {toc.map((item) => (
                          <a 
                            key={item.id} 
                            href={`#${item.id}`} 
                            onClick={(e) => {
                              e.preventDefault();
                              const target = document.getElementById(item.id);
                              if (target) {
                                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }
                            }}
                            className={`block text-xs font-medium hover:text-[#C5A059] transition-all leading-normal ${item.level === 3 ? 'pl-4 text-white/30' : 'text-white/60'}`}
                          >
                            {item.level === 3 ? '↳ ' : ''}{item.text}
                          </a>
                        ))}
                      </nav>
                    </details>
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
                  dangerouslySetInnerHTML={{ __html: contentWithHeadingIds }} 
                />

                {/* Gallery module, responsive images */}
                {article.gallery && article.gallery.length > 0 && (
                  <div className="mt-16 pt-12 border-t border-white/5">
                    <h3 className="text-xs font-display font-medium uppercase tracking-[0.2em] text-[#C5A059] mb-6 text-center">
                      Visual Exhibit Panel
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {article.gallery.map((image, idx) => (
                        <div 
                          key={idx} 
                          className={`rounded-xl overflow-hidden border border-white/5 h-[220px] sm:h-[300px] ${idx === 0 && article.gallery.length > 1 ? 'md:col-span-2 h-[340px] sm:h-[400px]' : ''}`}
                        >
                          <img 
                            src={image.url} 
                            alt={image.caption || `Gallery Exhibit ${idx + 1}`} 
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.03]" 
                          />
                          {image.caption && (
                             <p className="text-[10px] text-white/50 text-center mt-2 font-mono uppercase">{image.caption}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom Related Articles List - Handled inside the clean card structure */}
                {relatedArticles.length > 0 && (
                  <div className="mt-16 pt-12 border-t border-white/5 text-left">
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
                                src={typeof rel.featuredImage === 'string' ? rel.featuredImage : (rel.featuredImage?.url || '/placeholder.jpg')} 
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
      </div>

      {/* Sticky Affiliate CTA Footer Bar (Mobile & Desktop) */}
      <AnimatePresence>
        {showStickyCta && relatedProducts.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-[#07070a]/95 border-t border-[#C5A059]/30 backdrop-blur-2xl py-3 px-4 shadow-[0_-20px_50px_rgba(0,0,0,0.8)]"
          >
            <div className="container mx-auto max-w-5xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {relatedProducts[0].imageUrl && (
                  <img src={relatedProducts[0].imageUrl} className="w-9 h-9 rounded-lg object-contain bg-black p-1 border border-white/10 shrink-0 hidden sm:block" alt="" />
                )}
                <div className="text-left">
                  <span className="text-[8px] uppercase tracking-widest text-[#C5A059] block font-extrabold leading-none">Recommended Choice</span>
                  <h4 className="text-xs sm:text-sm font-black text-white truncate max-w-[140px] sm:max-w-[340px] mt-0.5 leading-snug">{relatedProducts[0].name}</h4>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-white/60 hidden md:block">{relatedProducts[0].price}</span>
                <a 
                  href={relatedProducts[0].affiliateUrl} 
                  target="_blank" 
                  rel="nofollow sponsored" 
                  className="bg-[#C5A059] hover:bg-white text-black text-[10px] font-black uppercase tracking-widest px-4.5 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap shadow-md shadow-[#C5A059]/10 cursor-pointer"
                  style={{ borderRadius: '10px' }}
                >
                  Configure Solution <span className="text-[10px]">↗</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
