import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Handshake, 
  Cpu, 
  GraduationCap, 
  Star, 
  ArrowLeft, 
  ExternalLink, 
  Check, 
  X, 
  ChevronRight,
  ShieldCheck,
  Calendar,
  Clock,
  BookOpen,
  ArrowRight,
  Sparkles,
  Award,
  ArrowUpRight,
  TrendingUp,
  SlidersHorizontal,
  LayoutGrid,
  Search,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { reviewService, EditorialReview } from '@/services/reviewService';
import { useAuth } from '@/contexts/AuthContext';
import { CATEGORY_LIST, getCategoryLabel, normalizeCategory } from '@/data/categories';
import NetworkProductCard from '@/components/NetworkProductCard';
import ProductGallery from '@/components/ProductGallery';

export default function NetworkPage() {
  const { slug, catId } = useParams<{ slug?: string; catId?: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { profile, user } = useAuth();
  
  const [reviews, setReviews] = useState<EditorialReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Advanced affiliate publisher components state
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);
  const [showSticky, setShowSticky] = useState(false);

  // Sync category state when URL searchParams or catId parameter change
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (catId) {
      setSelectedCategory(normalizeCategory(catId));
    } else if (categoryParam) {
      setSelectedCategory(normalizeCategory(categoryParam));
    } else {
      setSelectedCategory('all');
    }
  }, [searchParams, catId]);

  const handleCategoryChange = (catId: string) => {
    if (catId === 'all') {
      navigate('/ecosystem');
    } else {
      navigate(`/ecosystem/category/${catId}`);
    }
  };

  // Load reviews on mount
  useEffect(() => {
    async function loadPublicReviews() {
      setLoading(true);
      try {
        // Onlyapproved and published reviews should appear publicly.
        const data = await reviewService.getAllReviews(true);
        const normalized = data.map((r: any) => ({
          ...r,
          category: normalizeCategory(r.category)
        }));
        setReviews(normalized);
      } catch (err) {
        console.error('Failed to load public reviews archive:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPublicReviews();
  }, [slug]);

  // Find active review if matching slug route
  const activeReview = useMemo(() => {
    if (!slug) return null;
    return reviews.find(r => r.slug === slug) || null;
  }, [reviews, slug]);

  // Track dynamic views, when loaded and matches a real active review
  useEffect(() => {
    if (activeReview?.id) {
      reviewService.recordReviewView(activeReview.id);
    }
    // Reset expanded states for accordion
    setExpandedFaqIndex(null);
  }, [activeReview?.id]);

  // Listen to scrolling to trigger sticky CTA
  useEffect(() => {
    if (!slug) {
      setShowSticky(false);
      return;
    }
    const handleScroll = () => {
      if (window.scrollY > 450) {
        setShowSticky(true);
      } else {
        setShowSticky(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [slug]);

  // Analytics helper event executors
  const handleCtaClick = async (index?: number) => {
    if (activeReview?.id) {
      await reviewService.recordCtaClick(activeReview.id, index);
    }
  };

  const handleBannerClick = async (position: 'top' | 'inline' | 'bottom') => {
    if (activeReview?.id) {
      await reviewService.recordBannerClick(activeReview.id, position);
    }
  };

  // Category tags mapping dynamically built from CATEGORY_LIST taxonomy config
  const categories = useMemo(() => {
    return [
      { id: 'all', label: 'All Reviews', icon: <LayoutGrid size={14} /> },
      ...CATEGORY_LIST.map(cat => {
        const IconComponent = cat.icon;
        return {
          id: cat.id,
          label: cat.label,
          icon: <IconComponent size={14} />
        };
      })
    ];
  }, []);

  // Filter listings where normalized category matches
  const filteredReviews = useMemo(() => {
    let list = reviews;
    if (selectedCategory !== 'all') {
      list = list.filter(r => normalizeCategory(r.category) === normalizeCategory(selectedCategory));
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      list = list.filter(r => 
        r.brandName.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.excerpt.toLowerCase().includes(q) ||
        r.introduction.toLowerCase().includes(q)
      );
    }
    return list;
  }, [reviews, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#060608] text-white selection:bg-[#C5A059]/30 pt-28 pb-20">
      
      {/* GLOW AMBIENCE DECORATIONS */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-[#C5A059]/[0.01] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-500/[0.01] rounded-full blur-[120px] pointer-events-none" />

      {/* DETAIL VIEW MODE IF ACTIVE SLUG IS MATCHED */}
      {slug ? (
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="h-10 w-10 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest">Parsing Manuscript Index...</p>
            </div>
          ) : activeReview ? (
            <motion.div 
              key="detail"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto px-4 sm:px-6 relative pb-32"
            >
              {/* Dynamic Tag SEO and Structured Schema injection */}
              <Helmet>
                <title>{activeReview.seoTitle || `${activeReview.brandName} - Editorial Review | AmaanEstate`}</title>
                <meta name="description" content={activeReview.metaDescription || activeReview.excerpt} />
                
                {/* Open Graph / Facebook */}
                <meta property="og:type" content="article" />
                <meta property="og:title" content={activeReview.ogTitle || activeReview.seoTitle || activeReview.title} />
                <meta property="og:description" content={activeReview.ogDescription || activeReview.metaDescription || activeReview.excerpt} />
                <meta property="og:image" content={activeReview.ogImage || activeReview.featuredImage} />
                <meta property="og:url" content={window.location.href} />

                {/* Twitter Cards */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={activeReview.ogTitle || activeReview.seoTitle || activeReview.title} />
                <meta name="twitter:description" content={activeReview.ogDescription || activeReview.metaDescription || activeReview.excerpt} />
                <meta name="twitter:image" content={activeReview.ogImage || activeReview.featuredImage} />

                <link rel="canonical" href={`https://amaanestate.com/ecosystem/${activeReview.slug}`} />
                <script type="application/ld+json">
                  {JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "NewsArticle",
                    "headline": activeReview.title,
                    "image": [activeReview.featuredImage],
                    "datePublished": activeReview.createdAt || new Date().toISOString(),
                    "dateModified": activeReview.lastUpdatedTimestamp || activeReview.updatedAt || activeReview.createdAt || new Date().toISOString(),
                    "author": {
                      "@type": "Person",
                      "name": activeReview.reviewerName || "AmaanEstate Editorial Board"
                    },
                    "publisher": {
                      "@type": "Organization",
                      "name": "AmaanEstate",
                      "logo": {
                        "@type": "ImageObject",
                        "url": "https://amaanestate.com/logo.png"
                      }
                    },
                    "description": activeReview.metaDescription || activeReview.excerpt
                  })}
                </script>
                <script type="application/ld+json">
                  {JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Review",
                    "itemReviewed": {
                      "@type": "Organization",
                      "name": activeReview.brandName
                    },
                    "reviewRating": {
                      "@type": "Rating",
                      "ratingValue": activeReview.rating.toString(),
                      "bestRating": "5",
                      "worstRating": "1"
                    },
                    "author": {
                      "@type": "Person",
                      "name": activeReview.reviewerName || "AmaanEstate Reviewer"
                    },
                    "publisher": {
                      "@type": "Organization",
                      "name": "AmaanEstate"
                    },
                    "reviewBody": activeReview.introduction + " " + activeReview.whatIsIt
                  })}
                </script>
                {activeReview.faqs && activeReview.faqs.length > 0 && (
                  <script type="application/ld+json">
                    {JSON.stringify({
                      "@context": "https://schema.org",
                      "@type": "FAQPage",
                      "mainEntity": activeReview.faqs.map(f => ({
                        "@type": "Question",
                        "name": f.question,
                        "acceptedAnswer": {
                          "@type": "Answer",
                          "text": f.answer
                        }
                      }))
                    })}
                  </script>
                )}
              </Helmet>

              {/* BREADCRUMBS */}
              <nav className="flex items-center gap-2 text-neutral-500 font-mono text-[10px] uppercase tracking-wider mb-8">
                <Link to="/" className="hover:text-white transition-colors">Home</Link>
                <ChevronRight size={10} />
                <Link to="/ecosystem" className="hover:text-white transition-colors">Ecosystem</Link>
                <ChevronRight size={10} />
                <span className="text-[#C5A059] truncate">{activeReview.brandName}</span>
              </nav>

              {/* BACK CTA BUTTON */}
              <button 
                onClick={() => navigate('/ecosystem')}
                className="group inline-flex items-center gap-2 text-xs font-mono text-neutral-450 hover:text-white bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 py-2 px-4 rounded-xl mb-8 transition-all cursor-pointer"
              >
                <ArrowLeft size={13} className="group-hover:-translate-x-1 transition-transform" />
                Back to Recommendations
              </button>

              {/* TOP SPONSOR BANNER */}
              {activeReview.topBanner?.enabled && activeReview.topBanner.imageUrl && (
                <div className="mb-8 overflow-hidden rounded-2xl border border-white/5 bg-neutral-900/30 relative">
                  <a 
                    href={activeReview.topBanner.destinationUrl} 
                    target="_blank" 
                    rel="nofollow sponsored noopener"
                    onClick={() => handleBannerClick('top')}
                    className="block aspect-[16/5] sm:aspect-[21/5] w-full"
                  >
                    <img 
                      src={activeReview.topBanner.imageUrl} 
                      alt={activeReview.topBanner.altText || `Promoted affiliate Partner`} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover text-xs text-neutral-500"
                    />
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-black/80 border border-white/10 text-[8px] font-mono text-neutral-450 uppercase tracking-widest rounded-md">
                      SPONSORED
                    </div>
                  </a>
                </div>
              )}

              {/* HEADER CONTAINER */}
              <div className="space-y-6 text-left">
                <div className="relative border-b border-white/5 pb-6">
                  
                  <div className="pr-0 md:pr-72 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="px-3 py-1 bg-white/[0.04] border border-white/5 rounded-full text-[10px] font-mono uppercase tracking-widest text-[#C5A059]">
                        {getCategoryLabel(activeReview.category)}
                      </span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-white tracking-tight leading-[1.12]">
                      {activeReview.title}
                    </h1>
                  </div>

                  {/* TOP-RIGHT DIRECT DIRECTORY ACCESS CTA BUTTONS */}
                  <div className="md:absolute md:top-[16px] md:right-[16px] md:z-50 w-full md:w-auto mt-6 md:mt-0 flex flex-col gap-3">
                    {activeReview.ctaButtons && activeReview.ctaButtons.length > 0 ? (
                      activeReview.ctaButtons.map((btn, bidx) => (
                        <a 
                          key={bidx}
                          href={btn.url}
                          target={activeReview.externalLink !== false ? "_blank" : "_self"}
                          rel={activeReview.externalLink !== false ? "nofollow sponsored noopener" : undefined}
                          onClick={() => handleCtaClick(bidx)}
                          className={`text-center text-xs font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer border whitespace-nowrap md:min-w-[180px] ${
                            btn.style === 'outline-gold'
                              ? 'border-[#C5A059] text-[#C5A059] hover:bg-[#C5A059]/10 bg-transparent'
                            : btn.style === 'minimal-border'
                              ? 'border-white/10 text-neutral-300 hover:text-white hover:border-[#C5A059] bg-transparent'
                            : btn.style === 'solid-emerald'
                              ? 'bg-emerald-600 border-emerald-600 hover:bg-emerald-500 text-white shadow-lg'
                            : btn.style === 'solid-blue'
                              ? 'bg-blue-600 border-blue-600 hover:bg-blue-500 text-white shadow-lg'
                            : 'bg-[#C5A059] border-[#C5A059] hover:bg-[#D4B26F] text-black font-bold shadow-lg shadow-[#C5A059]/10'
                          }`}
                        >
                          <span>{btn.text}</span>
                          <ExternalLink size={14} className="shrink-0" />
                        </a>
                      ))
                    ) : (
                      <a 
                        href={activeReview.affiliateUrl}
                        target={activeReview.externalLink !== false ? "_blank" : "_self"}
                        rel={activeReview.externalLink !== false ? "nofollow sponsored noopener" : undefined}
                        onClick={() => handleCtaClick()}
                        className={`text-center text-xs font-semibold py-3 px-8 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer border whitespace-nowrap md:min-w-[180px] ${
                          activeReview.ctaButtonStyle === 'outline-gold'
                            ? 'border-[#C5A059] text-[#C5A059] hover:bg-[#C5A059]/10 bg-transparent'
                            : activeReview.ctaButtonStyle === 'minimal-border'
                            ? 'border-white/10 text-neutral-300 hover:text-white hover:border-[#C5A059] bg-transparent'
                            : activeReview.ctaButtonStyle === 'solid-emerald'
                            ? 'bg-emerald-600 border-emerald-600 hover:bg-emerald-500 text-white'
                            : 'bg-[#C5A059] border-[#C5A059] hover:bg-[#D4B26F] text-black font-bold shadow-lg shadow-[#C5A059]/10'
                        }`}
                      >
                        <span>{activeReview.ctaButtonText || 'Visit Official Website'}</span>
                        <ExternalLink size={14} className="shrink-0" />
                      </a>
                    )}
                  </div>
                </div>

              {/*评分和属性 Bar */}
                <div className="flex flex-wrap items-center gap-6 border-y border-white/5 py-4 mt-6">
                  <div className="flex items-center gap-3">
                    <span className="text-neutral-500 font-mono text-[11px]">Score:</span>
                    <div className="flex items-center gap-1.5 bg-[#C5A059]/10 border border-[#C5A059]/25 py-1 px-3 rounded-lg text-xs font-bold text-[#C5A059]">
                      <Star size={13} className="fill-[#C5A059]" />
                      <span>{activeReview.rating} / 5.0</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-neutral-400 text-xs font-mono">
                    <ShieldCheck size={13} className="text-emerald-500" />
                    <span>Verified Partner Review</span>
                  </div>
                </div>

                {/* TRUST / AUTHOR SECTION */}
                <div className="flex flex-wrap items-center gap-4 bg-white/[0.01] border border-white/5 p-4 rounded-xl">
                  {activeReview.reviewerAvatar ? (
                    <img 
                      src={activeReview.reviewerAvatar} 
                      alt={activeReview.reviewerName || 'AmaanEstate Reviewer'} 
                      className="w-10 h-10 rounded-full object-cover border border-white/10" 
                      referrerPolicy="no-referrer" 
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#C5A059]/20 to-[#C5A059]/5 border border-[#C5A059]/30 flex items-center justify-center text-xs font-mono font-bold text-[#C5A059]">
                      {activeReview.reviewerName?.charAt(0) || 'AE'}
                    </div>
                  )}
                  <div className="text-left">
                    <div className="text-xs font-semibold text-neutral-200">Reviewed by {activeReview.reviewerName || 'AmaanEstate Editorial Board'}</div>
                    <div className="text-[10px] font-mono text-emerald-500 mt-0.5 flex items-center gap-1.5">
                      <ShieldCheck size={11} />
                      <span>Regulatory Standards and Compliance Team Curation</span>
                    </div>
                  </div>
                </div>

                {activeReview.reviewMethodology && (
                  <div className="text-left bg-[#C5A059]/[0.02] border border-[#C5A059]/10 p-3.5 rounded-xl text-[11px] text-neutral-400 leading-relaxed font-light mt-2 flex gap-2">
                    <Sparkles size={14} className="text-[#C5A059] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-neutral-350 mr-1 font-mono text-[9px] uppercase tracking-wider">Evaluation Methodology:</span>
                      {activeReview.reviewMethodology}
                    </div>
                  </div>
                )}
              </div>

              {/* HERO IMAGE BANNER */}
              <div className="aspect-[21/9] rounded-2xl overflow-hidden my-8 border border-white/5 relative">
                <img 
                  src={activeReview.featuredImage} 
                  alt={activeReview.brandName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              </div>

              {/* MANUSCRIPT CONTENT SECTION */}
              <div className="space-y-12 text-left">
                
                {/* Introduction Paragraph */}
                <div>
                  <h3 className="text-neutral-500 font-mono text-[10px] uppercase tracking-widest font-bold mb-3">Context & Background</h3>
                  <p className="text-neutral-200 text-sm leading-[1.8] font-light">
                    {activeReview.introduction}
                  </p>
                </div>

                {/* What Is This Platform */}
                <div>
                  <h3 className="text-neutral-500 font-mono text-[10px] uppercase tracking-widest font-bold mb-3">In-Depth Platform Mechanics</h3>
                  <p className="text-neutral-200 text-sm leading-[1.8] font-light">
                    {activeReview.whatIsIt}
                  </p>
                </div>

                {/* INLINE CONTENT BANNER */}
                {activeReview.inlineBanner?.enabled && activeReview.inlineBanner.imageUrl && (
                  <div className="my-8 overflow-hidden rounded-2xl border border-white/5 bg-neutral-900/30 relative">
                    <a 
                      href={activeReview.inlineBanner.destinationUrl} 
                      target="_blank" 
                      rel="nofollow sponsored noopener"
                      onClick={() => handleBannerClick('inline')}
                      className="block aspect-[21/5] w-full"
                    >
                      <img 
                        src={activeReview.inlineBanner.imageUrl} 
                        alt={activeReview.inlineBanner.altText || `Promoted affiliate Partner`} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover text-xs text-neutral-500"
                      />
                      <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-black/80 border border-white/10 text-[8px] font-mono text-neutral-450 uppercase tracking-widest rounded-md">
                        SPONSORED
                      </div>
                    </a>
                  </div>
                )}

                {/* REVIEW GALLERY */}
                {(() => {
                  const normalizedGallery = activeReview.gallery && Array.isArray(activeReview.gallery) 
                    ? activeReview.gallery.map((gItem: any) => {
                        if (!gItem) return null;
                        if (typeof gItem === 'string') {
                          return { url: gItem, title: '' };
                        }
                        return {
                          url: gItem.url || gItem.imageUrl || '',
                          title: gItem.title || gItem.caption || ''
                        };
                      }).filter((img: any) => img && img.url)
                    : [];

                  return (
                    <ProductGallery 
                      images={normalizedGallery} 
                      affiliateUrl={activeReview.affiliateUrl} 
                      brandName={activeReview.brandName} 
                    />
                  );
                })()}

                {/* Key Features Bullet List */}
                {activeReview.keyFeatures && activeReview.keyFeatures.length > 0 && (
                  <div className="bg-white/[0.01] border border-white/5 p-6 rounded-2xl">
                    <h3 className="text-[#C5A059] font-mono text-[10px] uppercase tracking-widest font-bold mb-4">Key Features & Highlights</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeReview.keyFeatures.map((feat, index) => (
                        <div key={index} className="flex items-start gap-2.5 text-xs text-neutral-300">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#C5A059] shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* COMPARISON TABLE MATRIX */}
                {activeReview.comparisonTable?.enabled && activeReview.comparisonTable.rows && activeReview.comparisonTable.rows.length > 0 && (
                  <div className="bg-neutral-950/20 border border-white/5 p-6 rounded-2xl">
                    <div className="flex flex-col mb-4">
                      <h3 className="text-[#C5A059] font-mono text-[10px] uppercase tracking-widest font-bold">Feature Comparison Matrix</h3>
                      <p className="text-xs text-neutral-450 mt-1">Side-by-side analysis: {activeReview.brandName} vs {activeReview.comparisonTable.competitorName}.</p>
                    </div>

                    <div className="overflow-hidden border border-white/5 rounded-xl bg-neutral-950/40">
                      {/* Desktop Header */}
                      <div className="hidden md:grid grid-cols-3 bg-white/[0.02] p-3 text-[10px] font-mono uppercase tracking-wider text-neutral-400 border-b border-white/5 font-semibold text-center">
                        <div className="text-left font-bold pl-2">Capability / Utility</div>
                        <div className="text-[#C5A059] font-bold">{activeReview.brandName}</div>
                        <div className="text-neutral-500 font-bold">{activeReview.comparisonTable.competitorName}</div>
                      </div>

                      {/* Mobile & Desktop Rows */}
                      <div className="divide-y divide-white/5">
                        {activeReview.comparisonTable.rows.map((row, rIdx) => (
                          <div key={rIdx} className="p-3.5 flex flex-col md:grid md:grid-cols-3 gap-2.5 md:gap-4 items-start md:items-center text-xs">
                            <div className="font-semibold text-neutral-200 pl-1">{row.featureName}</div>
                            
                            {/* This Brand */}
                            <div className="flex md:justify-center items-center gap-1.5 w-full md:w-auto bg-[#C5A059]/[0.03] md:bg-transparent p-2 md:p-1 rounded-lg border border-[#C5A059]/15 md:border-none">
                              <span className="md:hidden text-[9px] font-mono text-[#C5A059] mr-auto uppercase tracking-wider">{activeReview.brandName}:</span>
                              <span className="text-[#C5A059] font-bold text-center">{row.thisBrandValue}</span>
                            </div>

                            {/* Competitor */}
                            <div className="flex md:justify-center items-center gap-1.5 w-full md:w-auto bg-white/[0.01] md:bg-transparent p-2 md:p-1 rounded-lg border border-white/5 md:border-none">
                              <span className="md:hidden text-[9px] font-mono text-neutral-500 mr-auto uppercase tracking-wider">{activeReview.comparisonTable.competitorName}:</span>
                              <span className="text-neutral-400 text-center font-medium">{row.competitorBrandValue}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Pros & Cons Editorial Compartments */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  
                  {/* Pros */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="p-1 px-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 rounded-lg text-[10px] font-mono uppercase font-bold">Pros</span>
                      <span className="text-neutral-500 text-[10px] font-mono font-medium">What we love</span>
                    </div>
                    <ul className="space-y-3">
                      {activeReview.pros && activeReview.pros.map((p, i) => (
                        <li key={i} className="text-neutral-300 text-xs flex items-start gap-2.5 leading-relaxed">
                          <Check size={14} className="text-emerald-450 mt-0.5 shrink-0" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Cons */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="p-1 px-2.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-[10px] font-mono uppercase font-bold">Cons</span>
                      <span className="text-neutral-500 text-[10px] font-mono font-medium">Points to consider</span>
                    </div>
                    <ul className="space-y-3">
                      {activeReview.cons && activeReview.cons.map((c, i) => (
                        <li key={i} className="text-neutral-400 text-xs flex items-start gap-2.5 leading-relaxed">
                          <X size={14} className="text-red-400 mt-0.5 shrink-0" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-white/5 pt-8">
                  <div>
                    <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block font-bold">Target Stakeholders</span>
                    <p className="text-white text-xs mt-1.5 font-medium">{activeReview.bestFor}</p>
                  </div>
                  {activeReview.pricingOverview && (
                    <div>
                      <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block font-bold">Price Indexing</span>
                      <p className="text-white text-xs mt-1.5 font-medium">{activeReview.pricingOverview}</p>
                    </div>
                  )}
                </div>

                {/* Final Verdict Paragraph */}
                <div className="border-t border-white/5 pt-8">
                  <h3 className="text-[#C5A059] font-mono text-[10px] uppercase tracking-widest font-bold mb-3.5">Ultimate Editorial Verdict</h3>
                  <p className="text-neutral-200 text-sm leading-[1.8] font-light">
                    {activeReview.finalVerdict}
                  </p>
                </div>

                {/* AFFILIATE DISCLOSURE MODULE */}
                <div className="border-t border-white/5 pt-8">
                  {(activeReview.enableGlobalDisclosure !== false || activeReview.sponsoredDisclosure !== false) && (
                    <div className="p-4 rounded-xl bg-neutral-900/40 border border-white/5 text-[11px] text-neutral-450 leading-relaxed flex items-start gap-2.5">
                      <span className="px-2 py-0.5 bg-[#C5A059]/10 border border-[#C5A059]/20 text-[8px] font-mono tracking-wider uppercase text-[#C5A059] rounded font-semibold shrink-0">
                        Affiliate Disclosure
                      </span>
                      <span>
                        All of our reviews are meticulously researched and tested by our experienced editorial staff. If you register or purchase via some links on this page, we may earn an affiliate commission at no extra cost to you.
                      </span>
                    </div>
                  )}
                </div>

                {/* MULTIPLE CTA BUTTONS SECTION */}
                <div className="bg-neutral-905 p-6 rounded-3xl border border-white/5 relative overflow-hidden">
                  <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#C5A059]/[0.02] rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-white/5">
                    <div className="flex items-center gap-4 text-left">
                      <div className="h-12 w-12 rounded-xl bg-[#C5A059]/10 border border-[#C5A059]/20 flex items-center justify-center text-xl font-bold text-[#C5A059] shrink-0">
                        {activeReview.brandLogoLetter || activeReview.brandName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-white tracking-tight">{activeReview.brandName}</h3>
                          <span className="px-2 py-0.5 bg-[#C5A059]/15 border border-[#C5A059]/25 text-[8px] font-mono uppercase tracking-wider text-[#C5A059] rounded font-semibold">PARTNER ACCESS</span>
                        </div>
                        <p className="text-xs text-neutral-400 mt-1">{activeReview.ctaSummary || 'Select official secure partner destination links.'}</p>
                      </div>
                    </div>
                    <div className="text-left font-mono text-[10px] text-neutral-500">
                      SECURE HTTPS GATEWAYS
                    </div>
                  </div>

                  {/* Multiple Button Render Grid */}
                  <div className="mt-6 flex flex-col sm:grid sm:grid-cols-2 gap-4">
                    {activeReview.ctaButtons && activeReview.ctaButtons.length > 0 ? (
                      activeReview.ctaButtons.map((btn, bidx) => (
                        <a 
                          key={bidx}
                          href={btn.url}
                          target={activeReview.externalLink !== false ? "_blank" : "_self"}
                          rel={activeReview.externalLink !== false ? "nofollow sponsored noopener" : undefined}
                          onClick={() => handleCtaClick(bidx)}
                          className={`w-full text-xs font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                            btn.style === 'outline-gold'
                              ? 'border-[#C5A059] text-[#C5A059] hover:bg-[#C5A059]/10 bg-transparent'
                            : btn.style === 'minimal-border'
                              ? 'border-white/10 text-neutral-300 hover:text-white hover:border-[#C5A059] bg-transparent'
                            : btn.style === 'solid-emerald'
                              ? 'bg-emerald-600 border-emerald-600 hover:bg-emerald-500 text-white shadow-lg'
                            : btn.style === 'solid-blue'
                              ? 'bg-blue-600 border-blue-600 hover:bg-blue-500 text-white shadow-lg'
                            : 'bg-[#C5A059] border-[#C5A059] hover:bg-[#D4B26F] text-black font-bold shadow-lg shadow-[#C5A059]/10'
                          }`}
                        >
                          <span>{btn.text}</span>
                          <ExternalLink size={14} className="shrink-0" />
                        </a>
                      ))
                    ) : (
                      <a 
                        href={activeReview.affiliateUrl}
                        target={activeReview.externalLink !== false ? "_blank" : "_self"}
                        rel={activeReview.externalLink !== false ? "nofollow sponsored noopener" : undefined}
                        onClick={() => handleCtaClick()}
                        className={`w-full sm:col-span-2 text-xs font-semibold py-3.5 px-8 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                          activeReview.ctaButtonStyle === 'outline-gold'
                            ? 'border-[#C5A059] text-[#C5A059] hover:bg-[#C5A059]/10 bg-transparent'
                            : activeReview.ctaButtonStyle === 'minimal-border'
                            ? 'border-white/10 text-neutral-300 hover:text-white hover:border-[#C5A059] bg-transparent'
                            : activeReview.ctaButtonStyle === 'solid-emerald'
                            ? 'bg-emerald-600 border-emerald-600 hover:bg-emerald-500 text-white'
                            : 'bg-[#C5A059] border-[#C5A059] hover:bg-[#D4B26F] text-black font-bold shadow-lg shadow-[#C5A059]/10'
                        }`}
                      >
                        <span>{activeReview.ctaButtonText || 'Visit Official Website'}</span>
                        <ExternalLink size={14} className="shrink-0" />
                      </a>
                    )}
                  </div>
                </div>

                {/* FAQ BUILDER */}
                {activeReview.faqs && activeReview.faqs.length > 0 && (
                  <div className="border-t border-white/5 pt-12">
                    <h3 className="text-[#C5A059] font-mono text-[10px] uppercase tracking-widest font-bold mb-6">Frequently Asked Questions</h3>
                    <div className="space-y-3">
                      {activeReview.faqs.map((faq, idx) => {
                        const isExpanded = expandedFaqIndex === idx;
                        return (
                          <div 
                            key={idx} 
                            className="bg-white/[0.01] border border-white/5 rounded-xl overflow-hidden transition-colors hover:bg-white/[0.02]"
                          >
                            <button 
                              onClick={() => setExpandedFaqIndex(isExpanded ? null : idx)}
                              className="w-full text-left py-4.5 px-5 flex items-center justify-between gap-4 cursor-pointer outline-none focus:outline-none"
                            >
                              <span className="text-sm font-semibold text-neutral-200">{faq.question}</span>
                              <ChevronRight 
                                size={15} 
                                className={`text-neutral-500 transition-transform ${isExpanded ? 'rotate-90 text-[#C5A059]' : ''}`} 
                              />
                            </button>
                            <AnimatePresence initial={false}>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <div className="px-5 pb-5 text-xs leading-relaxed text-neutral-400 font-light border-t border-white/[0.02] pt-3.5">
                                    {faq.answer}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* BOTTOM SPONSOR BANNER */}
                {activeReview.bottomBanner?.enabled && activeReview.bottomBanner.imageUrl && (
                  <div className="border-t border-white/5 pt-8">
                    <div className="overflow-hidden rounded-2xl border border-white/5 bg-neutral-900/30 relative">
                      <a 
                        href={activeReview.bottomBanner.destinationUrl} 
                        target="_blank" 
                        rel="nofollow sponsored noopener"
                        onClick={() => handleBannerClick('bottom')}
                        className="block aspect-[16/5] sm:aspect-[21/5] w-full"
                      >
                        <img 
                          src={activeReview.bottomBanner.imageUrl} 
                          alt={activeReview.bottomBanner.altText || `Promoted affiliate Partner`} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover text-xs text-neutral-500"
                        />
                        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-black/80 border border-white/10 text-[8px] font-mono text-neutral-450 uppercase tracking-widest rounded-md">
                          SPONSORED
                        </div>
                      </a>
                    </div>
                  </div>
                )}

                {/* RELATED REVIEWS PORTFOLIO */}
                {reviews.filter(r => r.id !== activeReview.id && (activeReview.relatedReviewIds?.includes(r.id) || r.category === activeReview.category)).length > 0 && (
                  <div className="border-t border-white/5 pt-12">
                    <h3 className="text-neutral-500 font-mono text-[10px] uppercase tracking-widest font-bold mb-6">Related Recommendations</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {reviews
                        .filter(r => r.id !== activeReview.id && (activeReview.relatedReviewIds?.includes(r.id) || r.category === activeReview.category))
                        .slice(0, 3)
                        .map((rev) => (
                          <div 
                            key={rev.id}
                            onClick={() => {
                              navigate(`/ecosystem/${rev.slug}`);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="group cursor-pointer bg-white/[0.01] hover:bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex flex-col h-full text-left transition-all"
                          >
                            <div className="aspect-video w-full rounded-xl overflow-hidden border border-white/5 mb-3.5 relative">
                              <img src={rev.featuredImage} alt={rev.brandName} className="object-cover w-full h-full" referrerPolicy="no-referrer" />
                              <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-black/85 rounded-md text-[9px] font-mono uppercase text-[#C5A059] border border-white/10 font-bold">
                                {rev.rating} ★
                              </div>
                            </div>
                            <h4 className="text-sm font-semibold text-neutral-200 group-hover:text-[#C5A059] transition-colors leading-tight line-clamp-1">{rev.title}</h4>
                            <p className="text-xs text-neutral-450 font-light mt-1.5 line-clamp-2 leading-relaxed flex-grow">{rev.excerpt}</p>
                            <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-500 mt-3 pt-3 border-t border-white/[0.02]">
                              <span>Read Full review</span>
                              <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

              </div>



            </motion.div>
          ) : (
            <div className="max-w-md mx-auto py-24 text-center px-4">
              <h2 className="text-lg font-serif mb-2">Review Column Not Found</h2>
              <p className="text-xs text-neutral-500 mb-6">The requested recommendation slug could not be located in our index listings.</p>
              <Button onClick={() => navigate('/ecosystem')} size="sm" className="bg-[#C5A059] hover:bg-[#D4B26F] text-black">
                View Ecosystem
              </Button>
            </div>
          )}
        </AnimatePresence>
      ) : (
        /* DIRECTORY LISTING MODE */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <Helmet>
            <title>Ecosystem - Trusted Partners & Market Resources | AmaanEstate</title>
            <meta name="description" content="Discover carefully reviewed tools, services, and platforms that support smarter investing, productivity, and growth in real estate, finance, technology, and learning." />
            <link rel="canonical" href="https://amaanestate.com/ecosystem" />
          </Helmet>

          {/* HERO SECTION */}
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/[0.03] border border-white/5 rounded-full">
              <span className="h-2 w-2 rounded-full bg-[#C5A059]" />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C5A059] font-bold">Curated Hub</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-white tracking-tight leading-none">
              AmaanEstate Ecosystem
            </h1>
            
            <p className="text-[#C5A059] font-serif italic text-base sm:text-lg">
              Curated Partner Ecosystem & Insights
            </p>
            
            <p className="text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto font-light leading-relaxed">
              Discover carefully reviewed tools, services, and platforms that support smarter investing, productivity, and growth.
            </p>
          </div>

          {/* SEARCH BAR & COMPACT CATEGORY DROPDOWN SELECT */}
          <div className="flex flex-col md:flex-row items-center gap-4 justify-center max-w-3xl mx-auto w-full bg-[#0f0f12]/90 border border-white/5 p-3 rounded-2xl shadow-2xl relative z-10">
            {/* Search Input field */}
            <div className="relative flex-grow w-full">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">
                <Search size={14} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search resources, brands, or specialties..."
                className="w-full bg-transparent border-0 rounded-xl py-2 px-11 text-xs text-white placeholder-neutral-500 outline-none focus:ring-0"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-450 hover:text-white text-xs cursor-pointer"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Visual separator line on desktop */}
            <div className="hidden md:block h-6 w-px bg-white/10" />

            {/* Compact Category Dropdown Filter */}
            <div className="relative w-full md:w-60">
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full bg-neutral-950/40 border border-white/5 focus:border-[#C5A059]/40 focus:ring-1 focus:ring-[#C5A059]/10 text-xs text-neutral-300 font-medium py-2.5 px-3 pr-10 rounded-xl appearance-none cursor-pointer outline-none hover:text-white transition-colors"
              >
                <option value="all" className="bg-[#0f0f12] text-white">All Specialties</option>
                {CATEGORY_LIST.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-[#0f0f12] text-white">
                    {cat.label}
                  </option>
                ))}
              </select>
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none">
                <ChevronDown size={14} />
              </span>
            </div>
          </div>

          {/* LISTINGS GRID CONTAINER */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="h-8 w-8 border border-[#C5A059] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-xs text-neutral-500 font-mono">Syncing listing registry...</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="max-w-md mx-auto py-16 text-center px-4 bg-white/[0.01] border border-white/5 rounded-2xl">
              <Building2 className="mx-auto h-8 w-8 text-[#C5A059] mb-3 opacity-60 animate-pulse" />
              <h3 className="text-sm font-semibold text-white mb-1.5">No Ecosystem Recommendations Found</h3>
              <p className="text-xs text-neutral-400 leading-relaxed mb-6">
                No matching verified publisher column was found for "{selectedCategory !== 'all' ? selectedCategory : 'all'}" category matching your search criteria.
              </p>
              {(searchQuery.trim() !== '' || selectedCategory !== 'all') && (
                <Button 
                  onClick={() => {
                    setSearchQuery('');
                    navigate('/ecosystem');
                  }} 
                  size="sm" 
                  className="bg-[#C5A059] hover:bg-[#D4B26F] text-black font-semibold text-xs rounded-xl"
                >
                  Reset Active Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReviews.map((rev) => (
                <NetworkProductCard key={rev.id} rev={rev} />
              ))}
            </div>
          )}



        </div>
      )}

    </div>
  );
}
