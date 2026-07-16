import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ExternalLink, 
  Star, 
  Heart, 
  SlidersHorizontal, 
  Check, 
  Minus, 
  ChevronRight, 
  Building, 
  Tag, 
  ShieldCheck, 
  ChevronDown,
  Sparkles,
  ShoppingBag,
  HelpCircle,
  ThumbsUp,
  FileText,
  Globe,
  Scale,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { productService, UnifiedProduct } from '@/services/productService';
import { toast } from 'sonner';

export default function ProductDetailsPage() {
  const { id, slug } = useParams<{ id?: string; slug?: string }>();
  const identifier = id || slug;
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<UnifiedProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [isCompared, setIsCompared] = useState(false);
  
  // Accordions & swipeable gesture states
  const [expandedFaqIdx, setExpandedFaqIdx] = useState<number | null>(null);
  const [expandedSpecs, setExpandedSpecs] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState<UnifiedProduct[]>([]);
  const [comparedProducts, setComparedProducts] = useState<UnifiedProduct[]>([]);
  const [showStickyCta, setShowStickyCta] = useState(false);

  // Zoom feature coordinates
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({ display: 'none' });

  useEffect(() => {
    async function loadProduct() {
      if (!identifier) return;
      setLoading(true);
      try {
        const prod = await productService.getUnifiedProductById(identifier);
        if (prod) {
          setProduct(prod);
          setActiveImgIndex(0);
          
          // Check if saved
          const savedKey = `saved_product_${prod.id}`;
          setIsSaved(!!localStorage.getItem(savedKey));
          
          // Check if compared
          const compareList = JSON.parse(localStorage.getItem('tech_gear_compare_ids') || '[]');
          setIsCompared(compareList.includes(prod.id));

          // Load similar / related products of the SAME type (software -> software, tech-gear -> tech-gear)
          const all = await productService.getUnifiedProducts();
          const sameTypeProducts = all.filter(p => p.id !== prod.id && p.type === prod.type);
          
          // First try: exact same category
          const sameCategory = sameTypeProducts.filter(p => p.category === prod.category);
          if (sameCategory.length > 0) {
            setRelatedProducts(sameCategory.slice(0, 4));
          } else {
            // Fallback: any product of same type
            setRelatedProducts(sameTypeProducts.slice(0, 4));
          }

          // Fetch compare products
          if (prod.compareWithIds && prod.compareWithIds.length > 0) {
            const comps = all.filter(p => p.type === 'tech-gear' && (
              prod.compareWithIds.includes(p.sourceId || '') || 
              prod.compareWithIds.includes(p.id) ||
              prod.compareWithIds.includes(p.id.replace('tg-', ''))
            ));
            setComparedProducts(comps);
          } else {
            setComparedProducts([]);
          }
        }
      } catch (err) {
        console.error('Error loading unified product:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  // Monitor scroll for sticky bottom Buy Button on mobile
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowStickyCta(true);
      } else {
        setShowStickyCta(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSaveToggle = () => {
    if (!product) return;
    const key = `saved_product_${product.id}`;
    if (isSaved) {
      localStorage.removeItem(key);
      setIsSaved(false);
      toast.success('Product removed from saved shortlist');
    } else {
      localStorage.setItem(key, 'true');
      setIsSaved(true);
      toast.success(`${product.title} saved to shortlist!`);
    }
  };

  const handleCompareToggle = () => {
    if (!product) return;
    
    // We synchronize with TechGearPage compared state
    let compareIds: string[] = [];
    try {
      compareIds = JSON.parse(localStorage.getItem('tech_gear_compare_ids') || '[]');
    } catch (_) {}

    if (isCompared) {
      compareIds = compareIds.filter(x => x !== product.id);
      setIsCompared(false);
      toast.success('Removed from Comparison desk');
    } else {
      if (compareIds.length >= 3) {
        toast.warning('Comparison Desk is limited to a maximum of 3 items.');
        return;
      }
      compareIds.push(product.id);
      setIsCompared(true);
      toast.success('Added to Comparison desk!');
    }
    localStorage.setItem('tech_gear_compare_ids', JSON.stringify(compareIds));
  };

  // Magnifier Zoom interactions
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundImage: `url(${product?.galleryImages[activeImgIndex]})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: '200%'
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none' });
  };

  // Swiping gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!product || product.galleryImages.length <= 1) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Next image
        setActiveImgIndex(prev => (prev + 1) % product.galleryImages.length);
      } else {
        // Prev image
        setActiveImgIndex(prev => (prev - 1 + product.galleryImages.length) % product.galleryImages.length);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#060608] text-white">
        <div className="h-10 w-10 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest">
          Inspecting Asset Specifications...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#060608] text-white px-4">
        <h2 className="text-xl font-serif text-white mb-2">Product Not Found</h2>
        <p className="text-sm text-neutral-400 mb-6 max-w-sm text-center">
          The requested product model is not indexable or was withdrawn from current catalog runs.
        </p>
        <Button onClick={() => navigate('/deals')} className="bg-[#C5A059] hover:bg-white text-black font-mono uppercase text-xs">
          Browse Deals Catalog
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060608] text-white pt-28 pb-20 selection:bg-[#C5A059]/30 font-sans">
      <Helmet>
        <title>{product.title} - Specifications, Price & Deals | PrimeDeals</title>
        <meta name="description" content={product.description} />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Glow ambient meshes */}
        <div className="absolute top-10 left-10 w-80 h-80 bg-[#C5A059]/[0.02] rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 right-10 w-96 h-96 bg-emerald-500/[0.01] rounded-full blur-[120px] pointer-events-none" />

        {/* Breadcrumb Navigator */}
        <nav className="flex items-center gap-2 text-neutral-500 font-mono text-[10px] uppercase tracking-wider mb-6">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight size={10} />
          <Link to="/deals" className="hover:text-white transition-colors">Deals & Offers</Link>
          <ChevronRight size={10} />
          <span className="text-[#C5A059] truncate max-w-[150px] sm:max-w-none">{product.title}</span>
        </nav>

        {/* Back navigation button */}
        <button
          onClick={() => navigate('/deals')}
          className="group inline-flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 py-2 px-4 rounded-xl mb-8 transition-all cursor-pointer"
        >
          <ArrowLeft size={13} className="group-hover:-translate-x-1 transition-transform" />
          Back to Deals Catalog
        </button>

        {/* PREMIUM PRODUCT HERO SUMMARY BLOCK (Above the fold) */}
        <div className="mb-10 p-6 sm:p-8 bg-[#0a0a0f]/80 border border-white/5 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#C5A059]/[0.02] rounded-full blur-[100px] pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 justify-between items-start">
            {/* Left Info */}
            <div className="flex gap-4 sm:gap-6 items-start">
              {product.featuredImage && (
                <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl bg-[#050507] border border-white/10 p-2.5 flex items-center justify-center shrink-0 shadow-lg shadow-black/50">
                  <img src={product.featuredImage} alt={product.title} className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" />
                </div>
              )}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-[#C5A059]/10 text-[#C5A059] px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider border border-[#C5A059]/20">
                    {product.category}
                  </span>
                  <span className="text-[10px] font-mono uppercase text-neutral-400 tracking-widest font-bold">
                    {product.brandName}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-white tracking-tight leading-tight">
                  {product.title}
                </h1>
                
                {/* Rating & Status Bar */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < Math.floor(product.rating) ? "text-[#C5A059] fill-[#C5A059]" : "text-white/10"}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-mono text-neutral-400">
                    <span className="text-white font-bold">{product.rating}</span> / 5.0 Rating
                  </span>
                  <div className="h-3 w-px bg-white/10" />
                  <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {product.availability || 'In Stock'}
                  </span>
                  {product.freeTrialAvailable && (
                    <>
                      <div className="h-3 w-px bg-white/10" />
                      <span className="text-[10px] uppercase font-mono tracking-widest text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                        Trial: {product.freeTrialAvailable}
                      </span>
                    </>
                  )}
                  {product.commissionRate && (
                    <>
                      <div className="h-3 w-px bg-white/10" />
                      <span className="text-[10px] uppercase font-mono tracking-widest text-[#C5A059] font-bold bg-[#C5A059]/10 px-2.5 py-0.5 rounded border border-[#C5A059]/20">
                        {product.commissionRate} rate
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right pricing & Above-the-fold CTA */}
            <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col gap-4 items-stretch sm:items-center lg:items-end justify-between lg:justify-start lg:text-right shrink-0 border-t lg:border-t-0 border-white/5 pt-4 lg:pt-0">
              <div className="space-y-1">
                <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-500 block font-bold leading-none">Deal MSRP</span>
                <div className="flex items-baseline gap-2 justify-start sm:justify-center lg:justify-end">
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#C5A059] tracking-tight font-sans leading-none">
                    {product.price}
                  </span>
                  {product.originalPrice && (
                    <>
                      <span className="text-xs line-through text-white/30 font-light font-mono leading-none">
                        {product.originalPrice}
                      </span>
                      {product.discountPercent && (
                        <span className="text-[9px] bg-red-500/10 text-red-400 border border-red-500/20 px-1 py-0.5 rounded font-bold uppercase tracking-wider font-mono">
                          {product.discountPercent}% Off
                        </span>
                      )}
                    </>
                  )}
                </div>
                {product.pricingTier && (
                  <span className="text-[10px] text-neutral-400 font-mono block">Pricing model: <span className="text-white font-bold">{product.pricingTier}</span></span>
                )}
              </div>

              {/* Instant Header Primary Buy Button */}
              <a
                href={product.affiliateUrl}
                target="_blank"
                rel="nofollow sponsored noopener noreferrer"
                className="bg-gradient-to-r from-[#C5A059] to-[#D4B26F] hover:from-[#D4B26F] hover:to-[#E3C380] text-black font-extrabold uppercase tracking-wider text-[10px] py-3.5 px-6 rounded-xl flex justify-center items-center gap-2 transition-all shadow-md active:scale-95 duration-200 cursor-pointer shrink-0 text-center"
              >
                Buy Now at Official Retailer <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>

        {/* MOBILE ONLY ABOVE THE FOLD SECONDARY ACTIONS */}
        <div className="sm:hidden grid grid-cols-3 gap-1.5 mb-6">
          {product.officialWebsite ? (
            <a
              href={product.officialWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/[0.04] text-white border border-white/10 font-bold uppercase tracking-wider text-[8px] py-2 px-1 rounded-lg flex flex-col justify-center items-center gap-1 cursor-pointer text-center"
            >
              <Globe size={11} className="text-[#C5A059]" />
              <span className="truncate">Website</span>
            </a>
          ) : (
            <div className="bg-white/[0.01] text-white/20 border border-white/5 font-bold uppercase tracking-wider text-[8px] py-2 px-1 rounded-lg flex flex-col justify-center items-center gap-1 text-center">
              <Globe size={11} />
              <span className="truncate">Website</span>
            </div>
          )}
          <button
            onClick={() => {
              const el = document.getElementById('alternatives-section');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              } else {
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
              }
            }}
            className="bg-white/[0.04] text-white border border-white/10 font-bold uppercase tracking-wider text-[8px] py-2 px-1 rounded-lg flex flex-col justify-center items-center gap-1 cursor-pointer text-center"
          >
            <SlidersHorizontal size={11} className="text-[#C5A059]" />
            <span className="truncate">Alternatives</span>
          </button>
          <button
            onClick={handleSaveToggle}
            className="bg-white/[0.04] text-white border border-white/10 font-bold uppercase tracking-wider text-[8px] py-2 px-1 rounded-lg flex flex-col justify-center items-center gap-1 cursor-pointer text-center"
          >
            <Heart size={11} className={isSaved ? 'fill-[#C5A059] text-[#C5A059]' : 'text-neutral-450'} />
            <span className="truncate">{isSaved ? 'Saved' : 'Save Item'}</span>
          </button>
        </div>

        {/* MAIN PRODUCT DESKTOP DETAIL GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16">
          
          {/* LEFT COLUMN: Gallery View (Desktop & Tablet) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="hidden sm:flex gap-4 h-[450px]">
              {/* Thumbnail strip on the left */}
              {product.galleryImages.length > 1 && (
                <div className="flex flex-col gap-3 shrink-0 max-h-full overflow-y-auto pr-1 select-none scrollbar-thin scrollbar-thumb-white/10">
                  {product.galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImgIndex(idx)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 p-1 flex items-center justify-center bg-[#07070a] relative transition-all cursor-pointer ${
                        activeImgIndex === idx ? 'border-[#C5A059]' : 'border-white/5 hover:border-white/20'
                      }`}
                    >
                      <img src={img} alt={`${product.title} thumbnail ${idx}`} className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              )}

              {/* Interactive zoomed master image stage */}
              <div 
                className="flex-1 rounded-2xl border border-white/10 bg-[#07070a]/40 flex items-center justify-center p-8 overflow-hidden group relative cursor-zoom-in"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <img 
                  src={product.galleryImages[activeImgIndex]} 
                  alt={product.title} 
                  className="max-h-full max-w-full object-contain select-none"
                  referrerPolicy="no-referrer"
                />

                {/* Simulated Lens zoom bubble */}
                <div 
                  className="absolute inset-0 pointer-events-none rounded-2xl border border-white/25 shadow-2xl transition-opacity duration-150"
                  style={{
                    ...zoomStyle,
                    backgroundRepeat: 'no-repeat',
                  }}
                />
                
                {product.galleryImages.length > 1 && (
                  <span className="absolute bottom-4 right-4 px-2 py-0.5 bg-black/80 rounded text-[9px] font-mono text-white/50 border border-white/5 tracking-wider">
                    {activeImgIndex + 1} / {product.galleryImages.length}
                  </span>
                )}
              </div>
            </div>

            {/* MOBILE ONLY GESTURE SWIPE CAROUSEL */}
            <div 
              className="sm:hidden relative aspect-square bg-[#07070a]/50 rounded-2xl border border-white/10 flex items-center justify-center p-6 overflow-hidden select-none"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <img 
                src={product.galleryImages[activeImgIndex]} 
                alt={product.title} 
                className="max-h-full max-w-full object-contain"
                referrerPolicy="no-referrer"
              />
              
              {/* Pagination Dots */}
              {product.galleryImages.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
                  {product.galleryImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImgIndex(idx)}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        activeImgIndex === idx ? 'w-4 bg-[#C5A059]' : 'w-1 bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Direct product pricing & info deck */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#C5A059] border-b border-white/5 pb-2">
                Product Editorial Summary
              </h3>
              <p className="text-sm text-neutral-300 leading-relaxed font-light">
                {product.description}
              </p>
              
              {/* Affiliate & Pricing Details Card */}
              {product.type === 'software' && (
                <div className="bg-[#0b0b10] border border-white/5 rounded-2xl p-5 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#C5A059] border-b border-white/5 pb-2 flex items-center gap-1.5">
                    <Sparkles size={12} /> Partner & Deal Registry
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {product.bestFor && (
                      <div className="col-span-2 bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                        <span className="block text-[9px] uppercase tracking-wider text-neutral-500 mb-0.5">Best For</span>
                        <span className="text-white font-medium">{product.bestFor}</span>
                      </div>
                    )}
                    {product.pricingTier && (
                      <div className="bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                        <span className="block text-[9px] uppercase tracking-wider text-neutral-500 mb-0.5">Pricing Model</span>
                        <span className="text-white font-medium">{product.pricingTier}</span>
                      </div>
                    )}
                    {product.freeTrialAvailable && (
                      <div className="bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                        <span className="block text-[9px] uppercase tracking-wider text-neutral-500 mb-0.5">Free Trial</span>
                        <span className="text-white font-medium">{product.freeTrialAvailable}</span>
                      </div>
                    )}
                    {product.commissionRate && (
                      <div className="bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                        <span className="block text-[9px] uppercase tracking-wider text-neutral-500 mb-0.5">Commission Rate</span>
                        <span className="text-emerald-400 font-bold">{product.commissionRate}</span>
                      </div>
                    )}
                    {product.cookieDuration && (
                      <div className="bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                        <span className="block text-[9px] uppercase tracking-wider text-neutral-500 mb-0.5">Cookie Duration</span>
                        <span className="text-white font-medium">{product.cookieDuration}</span>
                      </div>
                    )}
                    {product.affiliateNetwork && (
                      <div className="bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                        <span className="block text-[9px] uppercase tracking-wider text-neutral-500 mb-0.5">Affiliate Network</span>
                        <span className="text-white font-medium font-mono">{product.affiliateNetwork}</span>
                      </div>
                    )}
                    {product.affiliateCommissionType && (
                      <div className="bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                        <span className="block text-[9px] uppercase tracking-wider text-neutral-500 mb-0.5">Commission Type</span>
                        <span className="text-white font-medium">{product.affiliateCommissionType}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Pricing CTAs stack */}
            <div className="space-y-3 pt-6 border-t border-white/5">
              {product.type === 'tech-gear' && product.retailOffers && product.retailOffers.length > 0 ? (
                <div className="space-y-2.5">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block font-bold">Compare Retail Deals</span>
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
                    {product.retailOffers.map((offer: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-xl transition-all gap-4">
                        <div className="space-y-0.5 min-w-0">
                          <span className="font-bold text-xs text-white block truncate">{offer.retailerName}</span>
                          {offer.discount ? (
                            <span className="text-[9px] bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.2 rounded font-mono font-semibold">{offer.discount}</span>
                          ) : (
                            <span className="text-[9px] font-mono text-emerald-400">{offer.availability || 'In Stock'}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-bold font-mono text-[#C5A059]">{offer.price}</span>
                          <a 
                            href={offer.affiliateUrl} 
                            target="_blank" 
                            rel="nofollow sponsored noopener noreferrer"
                            className="bg-[#C5A059]/10 hover:bg-[#C5A059] text-[#C5A059] hover:text-black font-extrabold text-[9px] uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                          >
                            {offer.ctaText || 'Buy'} <ExternalLink size={10} />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <a
                  href={product.affiliateUrl}
                  target="_blank"
                  rel="nofollow sponsored noopener noreferrer"
                  className="w-full bg-gradient-to-r from-[#C5A059] to-[#D4B26F] hover:from-[#D4B26F] hover:to-[#E3C380] text-black font-extrabold uppercase tracking-wider text-xs py-4 px-6 rounded-xl flex justify-center items-center gap-2 transition-all shadow-lg hover:shadow-[#C5A059]/10 active:scale-[0.98] duration-300 cursor-pointer text-center"
                >
                  Buy Now at Official Retailer <ExternalLink size={13} />
                </a>
              )}

              {product.officialWebsite && (
                <a
                  href={product.officialWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10 font-bold uppercase tracking-wider text-xs py-3.5 px-6 rounded-xl flex justify-center items-center gap-2 transition-all active:scale-[0.98] duration-300 cursor-pointer text-center"
                >
                  Visit Official Website <Globe size={13} className="text-[#C5A059]" />
                </a>
              )}

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    const el = document.getElementById('alternatives-section');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                    }
                  }}
                  className="border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-white font-bold uppercase tracking-widest text-[9px] py-3 rounded-xl flex flex-col justify-center items-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <SlidersHorizontal size={12} className="text-[#C5A059]" />
                  <span className="truncate">Alternatives</span>
                </button>

                <button
                  onClick={handleCompareToggle}
                  className={`border font-bold uppercase tracking-widest text-[9px] py-3 rounded-xl flex flex-col justify-center items-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer ${
                    isCompared
                      ? "bg-[#C5A059]/10 border-[#C5A059]/30 text-[#C5A059]"
                      : "bg-white/[0.02] hover:bg-white/[0.06] border-white/10 text-white"
                  }`}
                >
                  <Check size={12} className={isCompared ? 'text-[#C5A059]' : 'text-neutral-450'} />
                  <span>{isCompared ? 'Comparing' : 'Compare'}</span>
                </button>

                <button
                  onClick={handleSaveToggle}
                  className={`border font-bold uppercase tracking-widest text-[9px] py-3 rounded-xl flex flex-col justify-center items-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer ${
                    isSaved
                      ? "bg-[#C5A059]/10 border-[#C5A059]/30 text-[#C5A059]"
                      : "bg-white/[0.02] hover:bg-white/[0.06] border-white/10 text-white"
                  }`}
                >
                  <Heart size={12} className={isSaved ? 'fill-[#C5A059] text-[#C5A059]' : 'text-neutral-450'} />
                  <span>{isSaved ? 'Saved' : 'Save'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* BELOW: COLLAPSED SPECS, PROS & CONS AND DETAIL DRAWER LAYOUT */}
        <div className="mt-16 pt-10 border-t border-white/5 space-y-12">
          
          {/* Tech Gear Premium Benchmark Scores */}
          {product.type === 'tech-gear' && (
            <div className="bg-[#0a0a0f] border border-white/5 rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#C5A059]/[0.02] rounded-full blur-[100px] pointer-events-none" />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-4 gap-4">
                <div>
                  <h3 className="text-lg font-serif text-white tracking-tight flex items-center gap-2">
                    <ShieldCheck size={18} className="text-[#C5A059]" />
                    Amaan Editorial Benchmark Ratings
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    Tested and rated inside our physical hardware lab based on strict performance and durability criteria.
                  </p>
                </div>
                {product.reviewStatus && (
                  <span className="font-mono text-[9px] uppercase tracking-widest text-[#C5A059] bg-[#C5A059]/10 border border-[#C5A059]/20 px-3 py-1 rounded-full font-bold self-start md:self-auto">
                    Status: {product.reviewStatus}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                {/* Master overall verdict score */}
                <div className="md:col-span-4 flex flex-col items-center justify-center bg-white/[0.01] border border-white/5 p-6 rounded-2xl relative text-center">
                  <span className="text-[9px] font-mono uppercase text-neutral-400 tracking-widest block mb-4 font-bold">Overall Verdict Score</span>
                  
                  {/* Circular progress bar SVG */}
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90">
                      <circle cx="64" cy="64" r="54" fill="transparent" stroke="rgba(255,255,255,0.02)" strokeWidth="8" />
                      <circle 
                        cx="64" 
                        cy="64" 
                        r="54" 
                        fill="transparent" 
                        stroke="#C5A059" 
                        strokeWidth="8" 
                        strokeDasharray={339.29}
                        strokeDashoffset={339.29 - (339.29 * (product.overallScore || 85)) / 100}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-3xl font-extrabold text-white tracking-tight leading-none">{product.overallScore || 85}</span>
                      <span className="text-[10px] font-mono text-neutral-500 mt-1 uppercase font-bold">/ 100</span>
                    </div>
                  </div>

                  <span className="text-xs font-serif text-[#C5A059] italic mt-4 block">
                    {product.overallScore && product.overallScore >= 90 ? 'Outstanding Class Leader' : product.overallScore && product.overallScore >= 80 ? 'Highly Recommended' : 'Excellent Utility'}
                  </span>
                </div>

                {/* Sub-metric sliders */}
                <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[
                    { key: 'performanceScore', label: 'Processing & Performance' },
                    { key: 'designScore', label: 'Design & Ergonomics' },
                    { key: 'batteryScore', label: 'Power & Battery Lifespan' },
                    { key: 'cameraScore', label: 'Optics & Camera Fidelity' },
                    { key: 'valueScore', label: 'Value & Price Proposition' }
                  ].map(scoreItem => {
                    const val = (product as any)[scoreItem.key] || 85;
                    return (
                      <div key={scoreItem.key} className="space-y-1.5 bg-black/20 p-3 rounded-xl border border-white/5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-neutral-300 font-medium">{scoreItem.label}</span>
                          <span className="font-mono text-[#C5A059] font-bold">{val}%</span>
                        </div>
                        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-[#C5A059]/70 to-[#C5A059] h-full rounded-full transition-all duration-1000" 
                            style={{ width: `${val}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Video Review Embed Stage */}
          {product.type === 'tech-gear' && product.videoReviewUrl && (
            <div className="space-y-4">
              <div className="border-b border-white/5 pb-4">
                <h3 className="text-xl sm:text-2xl font-serif text-white tracking-tight flex items-center gap-2">
                  <Play size={18} className="text-[#C5A059]" />
                  Amaan Labs Video Assessment
                </h3>
                <p className="text-xs text-neutral-400 mt-1">Watch our comprehensive unboxing, durability benchmarks, and real-world usage demo.</p>
              </div>
              <div className="aspect-video w-full rounded-2xl border border-white/10 overflow-hidden bg-[#0a0a0f] relative shadow-2xl">
                <iframe 
                  src={product.videoReviewUrl} 
                  title={`${product.title} Video Review`}
                  className="w-full h-full border-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Active Competitor Comparison System */}
          {product.type === 'tech-gear' && comparedProducts && comparedProducts.length > 0 && (
            <div className="space-y-6 pt-6 border-t border-white/5">
              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-serif text-white tracking-tight flex items-center gap-2">
                  <Scale size={18} className="text-[#C5A059]" />
                  Head-to-Head Competitor Comparison
                </h3>
                <p className="text-xs text-neutral-400">See how the {product.title} matches up against major benchmark alternatives in the market.</p>
              </div>

              <div className="border border-white/5 rounded-2xl overflow-x-auto bg-[#0a0a0f] scrollbar-thin">
                <table className="w-full text-left text-xs border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                      <th className="p-4 text-[10px] text-white/40 uppercase font-mono tracking-wider w-1/4">Specification / Score</th>
                      <th className="p-4 text-xs font-serif font-bold text-[#C5A059] bg-[#C5A059]/5 border-x border-white/5 w-1/4 text-center">
                        <span className="block text-[8px] font-mono uppercase text-neutral-500 font-bold">{product.brandName}</span>
                        {product.title}
                      </th>
                      {comparedProducts.map(comp => (
                        <th key={comp.id} className="p-4 text-xs font-serif font-bold text-white w-1/4 text-center">
                          <span className="block text-[8px] font-mono uppercase text-neutral-500 font-bold">{comp.brandName}</span>
                          {comp.title}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Overall score row */}
                    <tr className="border-b border-white/5 bg-white/[0.01]">
                      <td className="p-4 font-bold text-white">Overall Rating</td>
                      <td className="p-4 text-center font-mono font-extrabold text-[#C5A059] bg-[#C5A059]/5 border-x border-white/5">
                        <span className="text-sm">{product.overallScore || 85}</span> <span className="text-[10px] text-neutral-500 font-normal">/ 100</span>
                      </td>
                      {comparedProducts.map(comp => (
                        <td key={comp.id} className="p-4 text-center font-mono font-extrabold text-white">
                          <span className="text-sm">{comp.overallScore || 85}</span> <span className="text-[10px] text-neutral-500 font-normal">/ 100</span>
                        </td>
                      ))}
                    </tr>

                    {/* Price row */}
                    <tr className="border-b border-white/5 hover:bg-white/[0.01]">
                      <td className="p-4 font-mono text-[10px] uppercase text-neutral-400">Launch MSRP</td>
                      <td className="p-4 text-center font-mono text-white bg-[#C5A059]/5 border-x border-white/5 font-semibold">
                        {product.price}
                      </td>
                      {comparedProducts.map(comp => (
                        <td key={comp.id} className="p-4 text-center font-mono text-white/85">
                          {comp.price}
                        </td>
                      ))}
                    </tr>

                    {/* Display row */}
                    <tr className="border-b border-white/5 hover:bg-white/[0.01]">
                      <td className="p-4 font-mono text-[10px] uppercase text-neutral-400">Display Spec</td>
                      <td className="p-4 text-center text-white bg-[#C5A059]/5 border-x border-white/5">
                        {product.specDisplay || product.specs.find(s => s.name.toLowerCase() === 'display')?.value || 'N/A'}
                      </td>
                      {comparedProducts.map(comp => (
                        <td key={comp.id} className="p-4 text-center text-white/70">
                          {comp.specDisplay || comp.specs.find(s => s.name.toLowerCase() === 'display')?.value || 'N/A'}
                        </td>
                      ))}
                    </tr>

                    {/* Processor row */}
                    <tr className="border-b border-white/5 hover:bg-white/[0.01]">
                      <td className="p-4 font-mono text-[10px] uppercase text-neutral-400">Processor / SoC</td>
                      <td className="p-4 text-center text-white bg-[#C5A059]/5 border-x border-white/5">
                        {product.specProcessor || product.specs.find(s => s.name.toLowerCase() === 'processor')?.value || 'N/A'}
                      </td>
                      {comparedProducts.map(comp => (
                        <td key={comp.id} className="p-4 text-center text-white/70">
                          {comp.specProcessor || comp.specs.find(s => s.name.toLowerCase() === 'processor')?.value || 'N/A'}
                        </td>
                      ))}
                    </tr>

                    {/* Storage config row */}
                    <tr className="border-b border-white/5 hover:bg-white/[0.01]">
                      <td className="p-4 font-mono text-[10px] uppercase text-neutral-400">Storage / Configuration</td>
                      <td className="p-4 text-center text-white bg-[#C5A059]/5 border-x border-white/5">
                        {product.specStorage || product.specs.find(s => s.name.toLowerCase() === 'storage')?.value || 'N/A'}
                      </td>
                      {comparedProducts.map(comp => (
                        <td key={comp.id} className="p-4 text-center text-white/70">
                          {comp.specStorage || comp.specs.find(s => s.name.toLowerCase() === 'storage')?.value || 'N/A'}
                        </td>
                      ))}
                    </tr>

                    {/* Camera row */}
                    <tr className="border-b border-white/5 hover:bg-white/[0.01]">
                      <td className="p-4 font-mono text-[10px] uppercase text-neutral-400">Primary Camera</td>
                      <td className="p-4 text-center text-white bg-[#C5A059]/5 border-x border-white/5">
                        {product.specCamera || product.specs.find(s => s.name.toLowerCase() === 'camera')?.value || 'N/A'}
                      </td>
                      {comparedProducts.map(comp => (
                        <td key={comp.id} className="p-4 text-center text-white/70">
                          {comp.specCamera || comp.specs.find(s => s.name.toLowerCase() === 'camera')?.value || 'N/A'}
                        </td>
                      ))}
                    </tr>

                    {/* Battery row */}
                    <tr className="border-b border-white/5 hover:bg-white/[0.01]">
                      <td className="p-4 font-mono text-[10px] uppercase text-neutral-400">Battery capacity</td>
                      <td className="p-4 text-center text-white bg-[#C5A059]/5 border-x border-white/5">
                        {product.specBattery || product.specs.find(s => s.name.toLowerCase() === 'battery')?.value || 'N/A'}
                      </td>
                      {comparedProducts.map(comp => (
                        <td key={comp.id} className="p-4 text-center text-white/70">
                          {comp.specBattery || comp.specs.find(s => s.name.toLowerCase() === 'battery')?.value || 'N/A'}
                        </td>
                      ))}
                    </tr>

                    {/* Quick Link row */}
                    <tr>
                      <td className="p-4 font-mono text-[10px] uppercase text-neutral-400">Direct Actions</td>
                      <td className="p-4 text-center bg-[#C5A059]/5 border-x border-white/5">
                        <a 
                          href={product.affiliateUrl} 
                          target="_blank" 
                          rel="nofollow sponsored noopener noreferrer"
                          className="bg-[#C5A059] text-black font-extrabold text-[9px] uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all inline-flex items-center gap-1 cursor-pointer"
                        >
                          Official Deals <ExternalLink size={9} />
                        </a>
                      </td>
                      {comparedProducts.map(comp => (
                        <td key={comp.id} className="p-4 text-center">
                          <Link 
                            to={`/product/${comp.id}`} 
                            className="bg-white/5 border border-white/10 hover:border-[#C5A059] text-white hover:text-[#C5A059] font-extrabold text-[9px] uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all inline-flex items-center gap-1 cursor-pointer"
                          >
                            Read Review <ChevronRight size={9} />
                          </Link>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Specifications Accordion for Mobile / Clean layout for desktop */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h2 className="text-xl sm:text-2xl font-serif text-white tracking-tight flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-[#C5A059]" />
                Technical Specifications
              </h2>
              <button 
                onClick={() => setExpandedSpecs(!expandedSpecs)}
                className="text-neutral-400 hover:text-white flex items-center gap-1.5 text-xs font-mono uppercase"
              >
                {expandedSpecs ? 'Collapse' : 'Expand All'}
                <ChevronDown size={14} className={`transition-transform duration-300 ${expandedSpecs ? 'rotate-180' : ''}`} />
              </button>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-300 overflow-hidden ${
              expandedSpecs ? 'max-h-[1000px]' : 'max-h-[160px]'
            }`}>
              {product.specs.map((spec, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs sm:text-sm">
                  <span className="font-mono text-neutral-400 uppercase text-[10px] tracking-wider">{spec.name}</span>
                  <span className="text-white font-semibold text-right max-w-[200px] truncate">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pros & Cons Columns (Always side-by-side on desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pros card list */}
            <div className="bg-emerald-500/[0.01] border border-emerald-500/10 p-6 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-emerald-400 flex items-center gap-1.5">
                <Check size={16} /> Key Advantages
              </h3>
              <ul className="space-y-2.5">
                {product.pros.map((pro, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed text-emerald-100/70">
                    <Check size={14} className="text-emerald-400/50 mt-0.5 shrink-0" />
                    {pro}
                  </li>
                ))}
              </ul>
            </div>

            {/* Cons card list */}
            <div className="bg-red-500/[0.01] border border-red-500/10 p-6 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-red-400 flex items-center gap-1.5">
                <Minus size={16} /> Key Limitations
              </h3>
              <ul className="space-y-2.5">
                {product.cons.map((con, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed text-red-100/70">
                    <Minus size={14} className="text-red-400/50 mt-0.5 shrink-0" />
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Key Features Section */}
          {product.keyFeatures && product.keyFeatures.length > 0 && (
            <div className="bg-[#0c0c12]/40 border border-white/5 p-6 sm:p-8 rounded-2xl space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Sparkles size={16} className="text-[#C5A059]" /> Core Key Features
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {product.keyFeatures.map((feat, i) => (
                  <div key={i} className="flex items-start gap-3 text-xs sm:text-sm text-neutral-300">
                    <Sparkles size={12} className="text-[#C5A059] mt-1 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Editorial Recommendation and Buying Advice */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#C5A059]/5 border border-[#C5A059]/10 p-6 sm:p-8 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5A059]/5 blur-2xl rounded-full" />
              <h4 className="text-[#C5A059] text-[10px] uppercase font-mono tracking-widest font-bold mb-3 flex items-center gap-1">
                <ShieldCheck size={12} /> Editorial Verdict
              </h4>
              <p className="text-sm sm:text-base text-neutral-200 leading-relaxed italic font-serif">
                "{product.editorialRecommendation || 'Highly evaluated for strict operational standards and reliability.'}"
              </p>
            </div>

            <div className="bg-white/[0.01] border border-white/5 p-6 sm:p-8 rounded-2xl space-y-3">
              <h4 className="text-white text-xs uppercase font-mono tracking-wider font-bold">
                Buying Advice
              </h4>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-light">
                {product.buyingAdvice || 'Ensure your infrastructure meets the specified system specifications. This equipment is best utilized in dedicated high-productivity settings.'}
              </p>
            </div>
          </div>

          {/* Compatible Products */}
          {product.compatibility && product.compatibility.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-xs uppercase tracking-wider font-mono text-neutral-400">Compatible ecosystems & integrations</h4>
              <div className="flex flex-wrap gap-2">
                {product.compatibility.map((comp, i) => (
                  <span key={i} className="bg-white/5 border border-white/5 px-3 py-1 rounded-xl text-xs text-neutral-300 font-mono">
                    {comp}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Top Alternatives Section */}
          {product.alternativeProducts && product.alternativeProducts.length > 0 && (
            <div id="alternatives-section" className="space-y-6 pt-6 border-t border-white/5">
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-serif text-white tracking-tight flex items-center gap-2">
                  <SlidersHorizontal size={18} className="text-[#C5A059]" />
                  Top Verified Alternatives
                </h2>
                <p className="text-xs text-neutral-400">
                  Compare these highly capable competitor platforms offering similar or superior features:
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {product.alternativeProducts.map((alt, i) => (
                  <div key={i} className="bg-[#07070a]/80 border border-white/5 p-4 rounded-xl flex items-center justify-between hover:border-[#C5A059]/40 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/[0.03] border border-white/10 flex items-center justify-center font-bold text-[#C5A059] text-sm">
                        {alt.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-semibold text-white group-hover:text-[#C5A059] transition-colors">{alt}</h4>
                        <span className="text-[9px] text-neutral-500 font-mono uppercase">Direct Alternative</span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      onClick={() => navigate(`/deals?search=${encodeURIComponent(alt)}`)}
                      className="text-xs font-mono text-[#C5A059] hover:text-white p-2 h-auto"
                    >
                      Compare
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Standalone Product FAQ section */}
          {product.faqs && product.faqs.length > 0 && (
            <div className="space-y-6 pt-6 border-t border-white/5">
              <h2 className="text-xl sm:text-2xl font-serif text-white tracking-tight flex items-center gap-2">
                <HelpCircle size={18} className="text-[#C5A059]" />
                Frequently Asked Questions
              </h2>
              <div className="space-y-3">
                {product.faqs.map((faq, i) => (
                  <div key={i} className="border border-white/5 rounded-xl bg-[#07070a] overflow-hidden">
                    <button
                      onClick={() => setExpandedFaqIdx(expandedFaqIdx === i ? null : i)}
                      className="w-full p-4 flex items-center justify-between text-left text-sm font-medium text-white hover:bg-white/[0.01] transition-colors"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown size={14} className={`text-[#C5A059] transition-transform duration-300 ${expandedFaqIdx === i ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence initial={false}>
                      {expandedFaqIdx === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                        >
                          <div className="p-4 pt-0 border-t border-white/[0.02] text-xs sm:text-sm text-neutral-400 leading-relaxed font-light">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Editorial Review (Link backwards if it was a review) */}
          {product.type === 'editorial-review' && (
            <div className="bg-white/[0.01] border border-white/5 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#C5A059]/10 flex items-center justify-center text-[#C5A059]">
                  <FileText size={22} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Full Editorial Column Available</h4>
                  <p className="text-xs text-neutral-400 max-w-md">Our lab performed structured benchmark tests on this product. Read the detailed assessments now.</p>
                </div>
              </div>
              <Link
                to={`/reviews/${product.slug}`}
                className="bg-white/5 hover:bg-white/10 text-white border border-white/10 h-11 px-6 rounded-xl text-xs uppercase tracking-wider font-mono font-bold flex items-center justify-center gap-1 cursor-pointer shrink-0"
              >
                Read Assessment
              </Link>
            </div>
          )}

          {/* RELATED PRODUCTS SECTION - MODERN SHOPPING GRID */}
          <div className="pt-10 border-t border-white/5 space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-serif text-white tracking-tight">
                Recommended Related Products
              </h2>
              <p className="text-xs text-neutral-450 mt-1">
                Explore recommended gear and alternative tools optimized for similar workloads.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map(p => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/product/${p.id}`)}
                  className="bg-[#08080c] border border-white/5 hover:border-[#C5A059]/30 rounded-2xl p-4 flex flex-col justify-between transition-all group cursor-pointer shadow-lg hover:shadow-[#C5A059]/5"
                >
                  <div className="h-32 sm:h-40 bg-black/40 rounded-xl overflow-hidden flex items-center justify-center p-3 relative border border-white/5 mb-3">
                    <img src={p.featuredImage} alt={p.title} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                    {p.originalPrice && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase font-mono tracking-wider">
                        Sale
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5 flex-1 flex flex-col">
                    <span className="block text-[8px] font-mono text-[#C5A059] uppercase tracking-wider font-bold leading-none">{p.brandName}</span>
                    <h4 className="text-xs sm:text-sm font-semibold text-white leading-tight line-clamp-1 group-hover:text-[#C5A059] transition-colors">{p.title}</h4>
                    <div className="flex gap-1 items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={8} className={i < Math.floor(p.rating) ? "text-[#C5A059] fill-[#C5A059]" : "text-white/10"} />
                      ))}
                    </div>
                    <div className="mt-auto pt-2 flex items-baseline gap-2">
                      <span className="text-xs sm:text-sm font-mono font-bold text-white">{p.price}</span>
                      {p.originalPrice && (
                        <span className="text-[10px] text-white/35 line-through font-mono">{p.originalPrice}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* STICKY BOTTOM MOBILE CTA VIEW */}
      <AnimatePresence>
        {showStickyCta && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-[#0c0c10]/95 backdrop-blur-xl border-t border-[#C5A059]/20 p-4 flex sm:hidden items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.5)] px-5"
          >
            <div>
              <span className="block text-[9px] font-mono text-neutral-400 uppercase leading-none mb-1">{product.brandName}</span>
              <span className="text-lg font-bold text-emerald-400 font-mono leading-none">{product.price}</span>
            </div>
            <a
              href={product.affiliateUrl}
              target="_blank"
              rel="nofollow sponsored noopener noreferrer"
              className="bg-[#C5A059] hover:bg-white text-black font-extrabold uppercase font-mono text-[10px] tracking-wider py-2.5 px-5 rounded-lg transition-transform active:scale-95 shadow-md shadow-[#C5A059]/10"
            >
              Buy Now
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
