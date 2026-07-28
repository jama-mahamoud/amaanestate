import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  Star, 
  ExternalLink, 
  Award, 
  Sparkles, 
  Check, 
  Minus, 
  Globe, 
  HelpCircle, 
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { productService, UnifiedProduct } from '@/services/productService';

export default function ProductDetailsPage() {
  const { id, slug } = useParams<{ id?: string; slug?: string }>();
  const identifier = id || slug;
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<UnifiedProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [expandedFaqIdx, setExpandedFaqIdx] = useState<number | null>(0);
  const [relatedReviews, setRelatedReviews] = useState<UnifiedProduct[]>([]);

  useEffect(() => {
    async function loadReviewData() {
      if (!identifier) return;
      setLoading(true);
      try {
        const item = await productService.getUnifiedProductById(identifier);
        if (item) {
          setProduct(item);
          setActiveImgIndex(0);

          // Fetch related reviews for bottom section
          const all = await productService.getUnifiedProducts();
          const list = all.filter(p => p.id !== item.id);
          const sameCategory = list.filter(p => p.category.toLowerCase() === item.category.toLowerCase());
          
          if (sameCategory.length >= 3) {
            setRelatedReviews(sameCategory.slice(0, 4));
          } else {
            setRelatedReviews(list.slice(0, 4));
          }
        }
      } catch (err) {
        console.error('Error loading review details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReviewData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, slug, identifier]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-[#060608] text-white">
        <div className="h-10 w-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-mono text-white/50 uppercase tracking-widest">
          Loading Editorial Review...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-[#060608] text-white px-4">
        <h2 className="text-2xl font-serif text-white mb-2">Review Not Found</h2>
        <p className="text-sm text-white/60 mb-6 max-w-sm text-center">
          The requested editorial review is not available or has been moved.
        </p>
        <Button onClick={() => navigate('/reviews')} className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-xl px-6">
          Browse All Reviews
        </Button>
      </div>
    );
  }

  const websiteUrl = product.officialWebsite || product.affiliateUrl || '#';
  const ratingValue = product.rating || 4.8;
  const lastUpdated = product.updatedAt || 'July 2026';

  return (
    <div className="min-h-screen bg-[#060608] text-white pt-24 pb-20 selection:bg-blue-500/30 font-sans">
      <Helmet>
        <title>{product.title} Review & Verdict | Editorial Assessment</title>
        <meta name="description" content={product.description || `Read our comprehensive editorial review of ${product.title}.`} />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Glow ambient background accents */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-blue-600/[0.03] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 right-10 w-96 h-96 bg-indigo-600/[0.02] rounded-full blur-[140px] pointer-events-none" />

        {/* Clean Editorial Breadcrumb */}
        <nav className="flex items-center gap-2 text-white/50 text-xs font-mono mb-8 overflow-x-auto py-1 scrollbar-none">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight size={12} className="text-white/30 shrink-0" />
          <Link to="/reviews" className="hover:text-white transition-colors">Reviews</Link>
          <ChevronRight size={12} className="text-white/30 shrink-0" />
          <span className="text-blue-400 font-medium truncate max-w-[180px] sm:max-w-none">{product.category}</span>
          <ChevronRight size={12} className="text-white/30 shrink-0" />
          <span className="text-white/80 truncate max-w-[200px] sm:max-w-none">{product.title}</span>
        </nav>

        {/* TOP HERO (2-COLUMN EDITORIAL HERO) */}
        <div className="bg-[#09090e] border border-white/10 rounded-3xl p-6 sm:p-8 lg:p-10 mb-8 relative overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* HERO LEFT: Featured Image & Thumbnail Selector */}
            <div className="lg:col-span-5 space-y-4">
              <div className="aspect-[4/3] rounded-2xl bg-[#030305] border border-white/10 p-6 flex items-center justify-center overflow-hidden shadow-inner relative group">
                <img 
                  src={product.galleryImages[activeImgIndex] || product.featuredImage} 
                  alt={product.title}
                  className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Gallery Thumbnails */}
              {product.galleryImages && product.galleryImages.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/10">
                  {product.galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImgIndex(idx)}
                      className={`w-16 h-16 rounded-xl border p-1 bg-[#030305] shrink-0 transition-all cursor-pointer ${
                        activeImgIndex === idx 
                          ? 'border-blue-500 shadow-md shadow-blue-500/20' 
                          : 'border-white/10 opacity-60 hover:opacity-100 hover:border-white/30'
                      }`}
                    >
                      <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* HERO RIGHT: Title, Rating, Meta, Excerpt & Main CTA */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-3">
                {/* Meta Badges */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-wider">
                    {product.category}
                  </span>
                  <span className="text-xs font-mono text-white/60 uppercase tracking-widest font-bold">
                    {product.brandName}
                  </span>
                  <span className="text-white/30">•</span>
                  <span className="text-xs text-white/50 font-mono">
                    Updated {lastUpdated}
                  </span>
                </div>

                {/* Review Main Title */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white tracking-tight leading-tight">
                  {product.title}
                </h1>

                {/* Editorial Rating Score */}
                <div className="flex items-center gap-3 pt-1">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={i < Math.floor(ratingValue) ? "text-amber-400 fill-amber-400" : "text-white/10"}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-white font-mono">{ratingValue.toFixed(1)}</span>
                    <span className="text-xs text-white/40 font-mono">/ 5.0 Rating</span>
                  </div>
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                    <Award size={12} /> Editor's Choice
                  </span>
                </div>
              </div>

              {/* Short Editorial Excerpt */}
              <p className="text-base text-white/80 leading-relaxed font-light border-t border-white/10 pt-4">
                {product.introduction || product.description}
              </p>

              {/* Main Call To Action */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                {product.ctaButtons && product.ctaButtons.length > 0 ? (
                  product.ctaButtons.map((btn, idx) => (
                    <a
                      key={idx}
                      href={btn.url || websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2.5 font-semibold text-xs sm:text-sm py-3.5 px-6 sm:px-8 rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer ${
                        btn.style === 'outline' || btn.style === 'minimal-border'
                          ? 'border border-white/20 hover:border-white/40 text-white bg-white/5'
                          : btn.style === 'secondary' || btn.style === 'solid-gold'
                          ? 'bg-amber-500 hover:bg-amber-400 text-black font-bold shadow-amber-500/20'
                          : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/25'
                      }`}
                    >
                      {btn.text || 'Visit Official Website'} <ExternalLink size={14} />
                    </a>
                  ))
                ) : (
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm py-3.5 px-8 rounded-xl transition-all shadow-lg shadow-blue-600/25 active:scale-95 cursor-pointer"
                  >
                    <Globe size={16} /> Visit Official Website <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* QUICK VERDICT CALLOUT BOX */}
        <div className="bg-gradient-to-r from-blue-950/30 via-[#0d0f18] to-indigo-950/30 border border-blue-500/20 rounded-2xl p-6 sm:p-8 mb-12 shadow-xl relative overflow-hidden">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Award size={24} />
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono uppercase tracking-widest text-blue-400 font-bold">
                  Quick Verdict
                </h3>
                <span className="text-xs font-mono text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                  Highly Recommended
                </span>
              </div>
              <p className="text-base sm:text-lg text-white/90 font-serif italic leading-relaxed">
                "{product.editorialRecommendation || product.finalVerdict || product.description}"
              </p>
            </div>
          </div>
        </div>

        {/* MAIN LAYOUT (70% Left / 30% Sticky Sidebar Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* LEFT CONTENT COLUMN (70% = col-span-8) */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* 1. OVERVIEW / WHAT IS IT */}
            <section className="bg-[#08080c] rounded-2xl p-6 sm:p-8 border border-white/10 space-y-4">
              <h2 className="text-2xl font-serif text-white tracking-tight flex items-center gap-2.5 border-b border-white/10 pb-4">
                <Layers size={20} className="text-blue-400" /> Product Overview
              </h2>
              <div className="text-sm sm:text-base text-white/80 leading-relaxed font-light space-y-4">
                <p>{product.whatIsIt || product.description}</p>
              </div>

              {product.bestFor && (
                <div className="mt-6 bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 flex items-center gap-3">
                  <Sparkles size={18} className="text-blue-400 shrink-0" />
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-blue-400 block font-bold">
                      Best Suited For
                    </span>
                    <span className="text-sm text-white/90 font-medium">{product.bestFor}</span>
                  </div>
                </div>
              )}
            </section>

            {/* 2. PROS & CONS */}
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Pros Card */}
              <div className="bg-emerald-500/[0.02] border border-emerald-500/20 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-mono uppercase tracking-wider font-bold text-emerald-400 flex items-center gap-2 border-b border-emerald-500/20 pb-3">
                  <CheckCircle2 size={18} /> Advantages (Pros)
                </h3>
                <ul className="space-y-3">
                  {product.pros.map((pro, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-white/80 leading-relaxed">
                      <Check size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cons Card */}
              <div className="bg-rose-500/[0.02] border border-rose-500/20 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-mono uppercase tracking-wider font-bold text-rose-400 flex items-center gap-2 border-b border-rose-500/20 pb-3">
                  <Minus size={18} /> Limitations (Cons)
                </h3>
                <ul className="space-y-3">
                  {product.cons.map((con, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-white/80 leading-relaxed">
                      <Minus size={16} className="text-rose-400 shrink-0 mt-0.5" />
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* 3. KEY FEATURES */}
            {product.keyFeatures && product.keyFeatures.length > 0 && (
              <section className="bg-[#08080c] rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6">
                <h2 className="text-2xl font-serif text-white tracking-tight flex items-center gap-2.5 border-b border-white/10 pb-4">
                  <Sparkles size={20} className="text-blue-400" /> Key Capabilities & Features
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {product.keyFeatures.map((feat, idx) => (
                    <div key={idx} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 shrink-0" />
                      <span className="text-xs sm:text-sm text-white/90 leading-relaxed">{feat}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 4. SPECIFICATIONS */}
            {product.specs && product.specs.length > 0 && (
              <section className="bg-[#08080c] rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6">
                <h2 className="text-2xl font-serif text-white tracking-tight flex items-center gap-2.5 border-b border-white/10 pb-4">
                  <ShieldCheck size={20} className="text-blue-400" /> Technical Specifications
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.specs.map((spec, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/5 rounded-xl text-xs sm:text-sm">
                      <span className="text-white/50 font-mono text-xs uppercase">{spec.name}</span>
                      <span className="text-white font-medium text-right font-mono">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 5. FREQUENTLY ASKED QUESTIONS */}
            {product.faqs && product.faqs.length > 0 && (
              <section className="bg-[#08080c] rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6">
                <h2 className="text-2xl font-serif text-white tracking-tight flex items-center gap-2.5 border-b border-white/10 pb-4">
                  <HelpCircle size={20} className="text-blue-400" /> Frequently Asked Questions
                </h2>
                <div className="space-y-3">
                  {product.faqs.map((faq, idx) => (
                    <div key={idx} className="border border-white/5 rounded-xl bg-white/[0.01] overflow-hidden">
                      <button
                        onClick={() => setExpandedFaqIdx(expandedFaqIdx === idx ? null : idx)}
                        className="w-full p-4 flex items-center justify-between text-left text-sm font-medium text-white hover:bg-white/[0.02] transition-colors cursor-pointer"
                      >
                        <span className="pr-4">{faq.question}</span>
                        <ChevronDown size={16} className={`text-blue-400 transition-transform duration-300 shrink-0 ${expandedFaqIdx === idx ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence initial={false}>
                        {expandedFaqIdx === idx && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                          >
                            <div className="p-4 pt-0 text-xs sm:text-sm text-white/70 leading-relaxed font-light border-t border-white/[0.03]">
                              {faq.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 6. FINAL VERDICT */}
            <section className="bg-gradient-to-b from-[#090b14] to-[#08080c] rounded-2xl p-6 sm:p-8 border border-blue-500/20 space-y-6 shadow-xl">
              <h2 className="text-2xl font-serif text-white tracking-tight flex items-center gap-2.5 border-b border-white/10 pb-4">
                <Award size={20} className="text-blue-400" /> Final Editorial Verdict
              </h2>
              <p className="text-sm sm:text-base text-white/80 leading-relaxed font-light">
                {product.finalVerdict || product.editorialRecommendation || product.buyingAdvice}
              </p>
              
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-extrabold text-blue-400 font-mono">
                    {ratingValue.toFixed(1)}
                  </div>
                  <div className="text-xs text-white/60 font-mono">
                    Official Rating<br />
                    <span className="text-emerald-400 font-semibold uppercase">Editor Approved</span>
                  </div>
                </div>

                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-3.5 px-6 rounded-xl transition-all cursor-pointer shadow-lg shadow-blue-600/20"
                >
                  Visit Official Website <ExternalLink size={14} />
                </a>
              </div>
            </section>

          </div>

          {/* RIGHT STICKY SIDEBAR (30% = col-span-4) */}
          <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-6">
            
            {/* Sidebar Editorial Snapshot Card */}
            <div className="bg-[#08080c] border border-white/10 rounded-2xl p-6 space-y-6 shadow-2xl">
              
              {/* Score Header */}
              <div className="text-center pb-6 border-b border-white/10 space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 font-bold block">
                  Editorial Score
                </span>
                <div className="text-5xl font-extrabold text-white font-mono tracking-tight">
                  {ratingValue.toFixed(1)}
                  <span className="text-xl text-white/40 font-normal">/5</span>
                </div>
                <div className="flex justify-center gap-1 py-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < Math.floor(ratingValue) ? "text-amber-400 fill-amber-400" : "text-white/10"}
                    />
                  ))}
                </div>
                <span className="inline-block bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider">
                  Outstanding Class Leader
                </span>
              </div>

              {/* Specs List */}
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                  <span className="text-white/50 font-mono">Category</span>
                  <span className="text-white font-medium">{product.category}</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                  <span className="text-white/50 font-mono">Brand</span>
                  <span className="text-white font-medium">{product.brandName}</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                  <span className="text-white/50 font-mono">Compatibility</span>
                  <span className="text-white font-medium font-mono">
                    {product.compatibility ? product.compatibility.join(', ') : 'Cross-Platform'}
                  </span>
                </div>

                {product.pricingTier && (
                  <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                    <span className="text-white/50 font-mono">Pricing Model</span>
                    <span className="text-white font-medium">{product.pricingTier}</span>
                  </div>
                )}

                {product.freeTrialAvailable && (
                  <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                    <span className="text-white/50 font-mono">Free Trial</span>
                    <span className="text-emerald-400 font-semibold">{product.freeTrialAvailable}</span>
                  </div>
                )}
              </div>

              {/* Sidebar Primary Buttons */}
              <div className="space-y-2.5">
                {product.ctaButtons && product.ctaButtons.length > 0 ? (
                  product.ctaButtons.map((btn, idx) => (
                    <a
                      key={idx}
                      href={btn.url || websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full inline-flex items-center justify-center gap-2 font-semibold text-xs py-3.5 px-4 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer text-center ${
                        btn.style === 'outline' || btn.style === 'minimal-border'
                          ? 'border border-white/20 hover:border-white/40 text-white bg-white/5'
                          : btn.style === 'secondary' || btn.style === 'solid-gold'
                          ? 'bg-amber-500 hover:bg-amber-400 text-black font-bold shadow-amber-500/20'
                          : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/25'
                      }`}
                    >
                      {btn.text || 'Visit Official Website'} <ExternalLink size={13} />
                    </a>
                  ))
                ) : (
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-3.5 px-4 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer text-center"
                  >
                    Visit Official Website <ExternalLink size={13} />
                  </a>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* BOTTOM: RELATED EDITORIAL REVIEWS */}
        {relatedReviews.length > 0 && (
          <div className="mt-20 pt-10 border-t border-white/10 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-serif text-white tracking-tight">
                  Related Editorial Reviews
                </h2>
                <p className="text-xs text-white/50 mt-1">
                  Explore tested technology tools and verified software evaluations.
                </p>
              </div>
              <Link
                to="/reviews"
                className="inline-flex items-center gap-1.5 text-xs font-mono text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
              >
                View All Reviews <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedReviews.map((rev) => (
                <div
                  key={rev.id}
                  onClick={() => navigate(`/reviews/${rev.slug || rev.id}`)}
                  className="bg-[#08080c] border border-white/10 hover:border-blue-500/40 rounded-2xl p-5 flex flex-col justify-between transition-all group cursor-pointer shadow-lg hover:shadow-blue-500/5"
                >
                  <div className="aspect-[4/3] bg-[#030305] rounded-xl overflow-hidden flex items-center justify-center p-4 border border-white/5 mb-4">
                    <img 
                      src={rev.featuredImage} 
                      alt={rev.title} 
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500" 
                      referrerPolicy="no-referrer" 
                    />
                  </div>

                  <div className="space-y-2 flex-1 flex flex-col">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider font-semibold">
                        {rev.category}
                      </span>
                      <div className="flex items-center gap-1 text-amber-400">
                        <Star size={12} className="fill-amber-400" />
                        <span className="text-xs font-mono font-bold text-white">{(rev.rating || 4.8).toFixed(1)}</span>
                      </div>
                    </div>

                    <h4 className="text-sm font-semibold text-white leading-snug group-hover:text-blue-400 transition-colors line-clamp-2">
                      {rev.title}
                    </h4>

                    <div className="mt-auto pt-3 flex items-center justify-between text-xs font-mono text-white/50">
                      <span>{rev.brandName}</span>
                      <span className="text-blue-400 font-medium group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                        Read Review <ChevronRight size={12} />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
