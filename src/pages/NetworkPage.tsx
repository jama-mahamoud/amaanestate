import React, { useState, useEffect, useMemo } from "react";
import {
  useParams,
  useNavigate,
  Link,
  useSearchParams,
} from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
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
  ChevronDown,
  Minus,
  Users,
  Heart,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { reviewService, EditorialReview } from "@/services/reviewService";
import { productService, UnifiedProduct } from "@/services/productService";
import { useAuth } from "@/contexts/AuthContext";
import {
  CATEGORY_LIST,
  getCategoryLabel,
  normalizeCategory,
} from "@/data/categories";
import NetworkProductCard from "@/components/NetworkProductCard";
import CategoryDropdown from "@/components/CategoryDropdown";
import ProductGallery from "@/components/ProductGallery";
import AffiliateProductGrid from "@/components/AffiliateProductGrid";

export default function NetworkPage() {
  const { slug, catId } = useParams<{ slug?: string; catId?: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { profile, user } = useAuth();

  const [reviews, setReviews] = useState<EditorialReview[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<UnifiedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Advanced affiliate publisher components state
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);
  const [showSticky, setShowSticky] = useState(false);

  // Gallery, save, and swipe carousel states
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [touchStartX, setTouchStartX] = useState<number>(0);

  // Sync category state when URL searchParams or catId parameter change
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (catId) {
      setSelectedCategory(normalizeCategory(catId));
    } else if (categoryParam) {
      setSelectedCategory(normalizeCategory(categoryParam));
    } else {
      setSelectedCategory("all");
    }
  }, [searchParams, catId]);

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    if (catId === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", catId);
    }
    setSearchParams(searchParams);
  };

  // Load reviews on mount
  useEffect(() => {
    async function loadPublicReviews() {
      setLoading(true);
      try {
        const isPreview = searchParams.get("preview") === "true";
        // If preview parameter is active, load all reviews (including drafts), else only approved ones.
        const data = await reviewService.getAllReviews(!isPreview);
        const normalized = data.map((r: any) => ({
          ...r,
          category: normalizeCategory(r.category),
        }));
        setReviews(normalized);
      } catch (err) {
        console.error("Failed to load public reviews archive:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPublicReviews();
  }, [slug, searchParams]);

  // Find active review if matching slug route
  const activeReview = useMemo(() => {
    if (!slug) return null;
    return reviews.find((r) => r.slug === slug) || null;
  }, [reviews, slug]);

  // Load unified products on mount
  useEffect(() => {
    async function loadCatalog() {
      try {
        const data = await productService.getUnifiedProducts();
        setCatalogProducts(data);
      } catch (err) {
        console.error("Failed to load catalog products for related items:", err);
      }
    }
    loadCatalog();
  }, []);

  // Filter similar products for the active review
  const activeReviewRelatedProducts = useMemo(() => {
    if (!activeReview) return [];
    // Filter out the current review itself if it exists as a product
    let filtered = catalogProducts.filter(p => p.sourceId !== activeReview.id);
    
    // Select same category first
    const sameCategory = filtered.filter(p => normalizeCategory(p.category) === normalizeCategory(activeReview.category));
    
    if (sameCategory.length >= 4) {
      return sameCategory.slice(0, 4);
    }
    
    const filled = [...sameCategory];
    const rest = filtered.filter(p => !sameCategory.some(s => s.id === p.id));
    
    rest.sort((a, b) => b.rating - a.rating);
    
    while (filled.length < 4 && rest.length > 0) {
      filled.push(rest.shift()!);
    }
    
    return filled.slice(0, 4);
  }, [catalogProducts, activeReview]);

  // Track dynamic views, when loaded and matches a real active review
  useEffect(() => {
    if (activeReview?.id) {
      reviewService.recordReviewView(activeReview.id);
      setActiveImageIndex(0);
      const saved = localStorage.getItem(`saved_review_${activeReview.id}`);
      setIsSaved(!!saved);
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
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [slug]);

  // Analytics helper event executors
  const handleCtaClick = async (index?: number) => {
    if (activeReview?.id) {
      await reviewService.recordCtaClick(activeReview.id, index);
    }
  };

  const handleBannerClick = async (position: "top" | "inline" | "bottom") => {
    if (activeReview?.id) {
      await reviewService.recordBannerClick(activeReview.id, position);
    }
  };

  // Category tags mapping dynamically built from CATEGORY_LIST taxonomy config
  const categories = useMemo(() => {
    return [
      { id: "all", label: "All Reviews", icon: <LayoutGrid size={14} /> },
      ...CATEGORY_LIST.map((cat) => {
        const IconComponent = cat.icon;
        return {
          id: cat.id,
          label: cat.label,
          icon: <IconComponent size={14} />,
        };
      }),
    ];
  }, []);

  // Filter listings where normalized category matches
  const filteredReviews = useMemo(() => {
    let list = reviews;
    if (selectedCategory !== "all") {
      list = list.filter(
        (r) =>
          normalizeCategory(r.category) === normalizeCategory(selectedCategory),
      );
    }
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.brandName.toLowerCase().includes(q) ||
          r.title.toLowerCase().includes(q) ||
          r.excerpt.toLowerCase().includes(q) ||
          r.introduction.toLowerCase().includes(q),
      );
    }
    return list;
  }, [reviews, selectedCategory, searchQuery]);

  const categoryChips = useMemo(() => [
    { id: "all", label: "All" },
    { id: "software-tools", label: "Software" },
    { id: "tech-gear", label: "Tech Gear" },
    { id: "ai-solutions", label: "AI" },
    { id: "business-productivity", label: "Office" },
    { id: "security", label: "Security" },
    { id: "developer-tools", label: "Developer" },
    { id: "cloud-hosting", label: "Cloud" }
  ], []);

  const filteredProducts = useMemo(() => {
    let list = catalogProducts;
    if (selectedCategory !== "all") {
      list = list.filter(
        (p) =>
          normalizeCategory(p.category) === normalizeCategory(selectedCategory),
      );
    }
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.brandName.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      );
    }
    return list;
  }, [catalogProducts, selectedCategory, searchQuery]);

  // Combined product images helper
  const allImages = useMemo(() => {
    const images: { url: string; title: string }[] = [];
    if (activeReview?.featuredImage) {
      images.push({
        url: activeReview.featuredImage,
        title: activeReview.brandName || "Main Image",
      });
    }
    if (activeReview?.gallery && activeReview.gallery.length > 0) {
      activeReview.gallery.forEach((g, idx) => {
        const url = g.url || g.imageUrl;
        if (url) {
          images.push({
            url,
            title: g.title || `Gallery Image ${idx + 1}`,
          });
        }
      });
    }
    return images;
  }, [activeReview]);

  // Handle Specifications / Comparison scroll
  const handleCompareClick = () => {
    const specSection = document.getElementById("specifications-section") || document.getElementById("comparison-table-section");
    if (specSection) {
      specSection.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      // Fallback to key features
      const featuresSection = document.getElementById("key-features-section");
      if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  // Bookmark Save Click handler
  const handleSaveClick = () => {
    if (!activeReview?.id) return;
    const key = `saved_review_${activeReview.id}`;
    if (isSaved) {
      localStorage.removeItem(key);
      setIsSaved(false);
      toast.success("Removed from saved list");
    } else {
      localStorage.setItem(key, "true");
      setIsSaved(true);
      toast.success(`${activeReview.brandName} saved to your portfolio!`);
    }
  };

  // Touch Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (allImages.length <= 1) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX - touchEndX;
    if (Math.abs(diffX) > 50) {
      if (diffX > 0) {
        // Swiped left -> next
        setActiveImageIndex((prev) => (prev + 1) % allImages.length);
      } else {
        // Swiped right -> prev
        setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
      }
    }
  };

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
              <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest">
                Parsing Manuscript Index...
              </p>
            </div>
          ) : activeReview ? (
            <motion.div
              key="detail"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 relative pb-32"
            >
              {/* Dynamic Tag SEO and Structured Schema injection */}
              <Helmet>
                <title>
                  {activeReview.seoTitle ||
                    `${activeReview.brandName} - Editorial Review | PrimeDeals`}
                </title>
                <meta
                  name="description"
                  content={activeReview.metaDescription || activeReview.excerpt}
                />

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="article" />
                <meta
                  property="og:title"
                  content={
                    activeReview.ogTitle ||
                    activeReview.seoTitle ||
                    activeReview.title
                  }
                />
                <meta
                  property="og:description"
                  content={
                    activeReview.ogDescription ||
                    activeReview.metaDescription ||
                    activeReview.excerpt
                  }
                />
                <meta
                  property="og:image"
                  content={activeReview.ogImage || activeReview.featuredImage}
                />
                <meta property="og:url" content={window.location.href} />

                {/* Twitter Cards */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta
                  name="twitter:title"
                  content={
                    activeReview.ogTitle ||
                    activeReview.seoTitle ||
                    activeReview.title
                  }
                />
                <meta
                  name="twitter:description"
                  content={
                    activeReview.ogDescription ||
                    activeReview.metaDescription ||
                    activeReview.excerpt
                  }
                />
                <meta
                  name="twitter:image"
                  content={activeReview.ogImage || activeReview.featuredImage}
                />

                <link
                  rel="canonical"
                  href={`https://amaanestate.com/ecosystem/${activeReview.slug}`}
                />
                <script type="application/ld+json">
                  {JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "NewsArticle",
                    headline: activeReview.title,
                    image: [activeReview.featuredImage],
                    datePublished:
                      activeReview.createdAt || new Date().toISOString(),
                    dateModified:
                      activeReview.lastUpdatedTimestamp ||
                      activeReview.updatedAt ||
                      activeReview.createdAt ||
                      new Date().toISOString(),
                    author: {
                      "@type": "Person",
                      name:
                        activeReview.reviewerName ||
                        "PrimeDeals Editorial Board",
                    },
                    publisher: {
                      "@type": "Organization",
                      name: "PrimeDeals",
                      logo: {
                        "@type": "ImageObject",
                        url: "https://amaanestate.com/logo.png",
                      },
                    },
                    description:
                      activeReview.metaDescription || activeReview.excerpt,
                  })}
                </script>
                <script type="application/ld+json">
                  {JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Review",
                    itemReviewed: {
                      "@type": "Organization",
                      name: activeReview.brandName,
                    },
                    reviewRating: {
                      "@type": "Rating",
                      ratingValue: activeReview.rating.toString(),
                      bestRating: "5",
                      worstRating: "1",
                    },
                    author: {
                      "@type": "Person",
                      name: activeReview.reviewerName || "PrimeDeals Reviewer",
                    },
                    publisher: {
                      "@type": "Organization",
                      name: "PrimeDeals",
                    },
                    reviewBody:
                      activeReview.introduction + " " + activeReview.whatIsIt,
                  })}
                </script>
                {activeReview.faqs && activeReview.faqs.length > 0 && (
                  <script type="application/ld+json">
                    {JSON.stringify({
                      "@context": "https://schema.org",
                      "@type": "FAQPage",
                      mainEntity: activeReview.faqs.map((f) => ({
                        "@type": "Question",
                        name: f.question,
                        acceptedAnswer: {
                          "@type": "Answer",
                          text: f.answer,
                        },
                      })),
                    })}
                  </script>
                )}
              </Helmet>

              {/* BREADCRUMBS */}
              <nav className="flex items-center gap-2 text-neutral-500 font-mono text-[10px] uppercase tracking-wider mb-8">
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
                <ChevronRight size={10} />
                <Link
                  to="/ecosystem"
                  className="hover:text-white transition-colors"
                >
                  Explore Hub
                </Link>
                <ChevronRight size={10} />
                <span className="text-[#C5A059] truncate">
                  {activeReview.brandName}
                </span>
              </nav>

              {/* BACK CTA BUTTON */}
              <button
                onClick={() => navigate("/ecosystem")}
                className="group inline-flex items-center gap-2 text-xs font-mono text-neutral-450 hover:text-white bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 py-2 px-4 rounded-xl mb-8 transition-all cursor-pointer"
              >
                <ArrowLeft
                  size={13}
                  className="group-hover:-translate-x-1 transition-transform"
                />
                Back to Explore Hub
              </button>

              {/* DESKTOP/TABLET PRODUCT HERO PRESENTATION */}
              <div className="hidden md:grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16 pt-4">
                {/* Left: Interactive Media Gallery */}
                <div className="lg:col-span-7 flex flex-col md:flex-row gap-4 h-fit">
                  {/* Thumbnail gallery list (Vertical layout on md and up) */}
                  {allImages.length > 1 && (
                    <div className="flex md:flex-col gap-3 shrink-0 max-h-[480px] overflow-y-auto pr-1 select-none scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent scroll-smooth">
                      {allImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImageIndex(idx)}
                          className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-300 p-1 flex items-center justify-center bg-[#07070a] relative group/thumb cursor-pointer ${
                            activeImageIndex === idx
                              ? "border-[#C5A059] ring-4 ring-[#C5A059]/10"
                              : "border-white/5 hover:border-white/20"
                          }`}
                        >
                          <img
                            src={img.url}
                            alt={img.title}
                            className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover/thumb:scale-105"
                            referrerPolicy="no-referrer"
                            loading="lazy"
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Main Product Stage */}
                  <div className="flex-1 aspect-square md:aspect-[4/3] lg:h-[480px] rounded-2xl border border-white/10 bg-[#07070a]/40 flex items-center justify-center p-8 overflow-hidden group relative cursor-zoom-in">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={activeImageIndex}
                        src={allImages[activeImageIndex]?.url}
                        alt={allImages[activeImageIndex]?.title || activeReview.brandName}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.25 }}
                        className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-[1.08]"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                    </AnimatePresence>

                    {/* Image indicator count badge */}
                    {allImages.length > 1 && (
                      <span className="absolute bottom-4 right-4 px-3 py-1 bg-black/80 backdrop-blur-sm rounded-lg text-[9px] font-mono text-white/55 border border-white/10 tracking-widest uppercase">
                        {activeImageIndex + 1} / {allImages.length}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Premium Editorial Info Column */}
                <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                  <div className="space-y-5">
                    {/* Category Label */}
                    <span className="inline-flex items-center gap-1.5 bg-[#C5A059]/10 text-[#C5A059] px-3.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest border border-[#C5A059]/20 shadow-sm w-fit">
                      <Building2 size={10} className="text-[#C5A059]" />
                      {activeReview.category}
                    </span>

                    {/* Brand name & Title */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-450 block font-semibold">
                        {activeReview.brandName} Review
                      </span>
                      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white tracking-tight leading-tight">
                        {activeReview.title}
                      </h1>
                    </div>

                    {/* Editor score stars component */}
                    <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 px-4 py-2.5 rounded-2xl w-fit">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={15}
                            className={
                              i < Math.floor(activeReview.rating)
                                ? "text-[#C5A059] fill-[#C5A059]"
                                : "text-white/10"
                            }
                          />
                        ))}
                      </div>
                      <div className="h-4 w-px bg-white/10" />
                      <span className="text-[11px] font-mono text-neutral-450 uppercase tracking-widest">
                        <span className="text-white font-extrabold">{activeReview.rating}</span> / 5.0 score
                      </span>
                    </div>

                    {/* Pricing box */}
                    <div className="py-4 border-y border-white/5 space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-450 block font-bold">
                        Current Price
                      </span>
                      <div className="flex items-baseline gap-3">
                        {activeReview.discountPrice ? (
                          <>
                            <span className="text-4xl font-extrabold text-emerald-400 tracking-tight font-sans">
                              {activeReview.discountPrice}
                            </span>
                            <span className="text-sm line-through text-white/30 font-light">
                              {activeReview.price}
                            </span>
                          </>
                        ) : (
                          <span className="text-4xl font-extrabold text-white tracking-tight font-sans">
                            {activeReview.price || "Free / Demo"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Editorial Excerpt introduction */}
                    <p className="text-sm text-neutral-450 leading-relaxed font-light font-sans line-clamp-4">
                      {activeReview.introduction || activeReview.excerpt}
                    </p>
                  </div>

                  {/* Pricing Action CTAs Group */}
                  <div className="space-y-3 pt-6 border-t border-white/5">
                    {/* Primary Buy Now CTA */}
                    <a
                      href={activeReview.affiliateUrl || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleCtaClick()}
                      className="w-full bg-gradient-to-r from-[#C5A059] to-[#D4B26F] hover:from-[#D4B26F] hover:to-[#E3C380] text-black font-extrabold uppercase tracking-wider text-xs py-4 px-6 rounded-xl flex justify-center items-center gap-2 transition-all shadow-lg hover:shadow-[#C5A059]/10 active:scale-[0.98] duration-300 cursor-pointer"
                    >
                      Buy Now <ExternalLink size={14} />
                    </a>

                    {/* Compare and Save Secondary CTA Row */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={handleCompareClick}
                        className="bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-white font-bold uppercase tracking-wider text-[10px] py-3.5 rounded-xl flex justify-center items-center gap-2 transition-all active:scale-[0.98] duration-250 cursor-pointer"
                      >
                        <SlidersHorizontal size={13} className="text-neutral-400" />
                        Compare
                      </button>

                      <button
                        onClick={handleSaveClick}
                        className={`border font-bold uppercase tracking-wider text-[10px] py-3.5 rounded-xl flex justify-center items-center gap-2 transition-all active:scale-[0.98] duration-250 cursor-pointer ${
                          isSaved
                            ? "bg-[#C5A059]/10 border-[#C5A059]/30 text-[#C5A059]"
                            : "bg-white/[0.03] hover:bg-white/[0.07] border-white/10 text-white"
                        }`}
                      >
                        <Heart
                          size={13}
                          className={isSaved ? "fill-[#C5A059] text-[#C5A059]" : "text-neutral-400"}
                        />
                        {isSaved ? "Saved" : "Save"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* MOBILE ONLY DESIGNED PRODUCT PRESENTATION (Swipeable media, stacked CTAs, touch optimization) */}
              <div className="md:hidden space-y-6">
                {/* Touch Swipeable Gallery */}
                <div
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  className="relative w-full aspect-square sm:aspect-[4/3] bg-[#07070a]/60 rounded-2xl border border-white/10 flex items-center justify-center p-4 overflow-hidden group select-none cursor-pointer"
                >
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={activeImageIndex}
                      src={allImages[activeImageIndex]?.url}
                      alt={allImages[activeImageIndex]?.title || activeReview.brandName}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.2 }}
                      className="max-h-full max-w-full object-contain"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  </AnimatePresence>

                  {/* Carousel Pagination Dots */}
                  {allImages.length > 1 && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
                      {allImages.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImageIndex(idx)}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            activeImageIndex === idx ? "w-5 bg-[#C5A059]" : "w-1.5 bg-white/30"
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Left / Right mini swipe assistance indicators */}
                  {allImages.length > 1 && (
                    <span className="absolute bottom-3 right-3 px-2 py-0.5 bg-black/80 rounded text-[8px] font-mono text-white/40 tracking-wider">
                      {activeImageIndex + 1}/{allImages.length}
                    </span>
                  )}
                </div>

                {/* Mobile Info & Pricing Deck */}
                <div className="space-y-4 px-1">
                  {/* Category + Brand Tag */}
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="bg-[#C5A059]/10 text-[#C5A059] px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider border border-[#C5A059]/20">
                      {activeReview.category}
                    </span>
                    <span className="text-[9px] font-mono uppercase text-neutral-500 tracking-widest font-bold">
                      {activeReview.brandName} Editorial
                    </span>
                  </div>

                  {/* Product Title */}
                  <h1 className="text-2xl font-serif text-white tracking-tight leading-snug">
                    {activeReview.title}
                  </h1>

                  {/* Stars rating deck */}
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={13}
                          className={
                            i < Math.floor(activeReview.rating)
                              ? "text-[#C5A059] fill-[#C5A059]"
                              : "text-white/10"
                          }
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-mono text-neutral-450">
                      Score: <span className="text-white font-bold">{activeReview.rating}</span>
                    </span>
                  </div>

                  {/* Current Price */}
                  <div className="py-2 flex items-baseline gap-2.5">
                    {activeReview.discountPrice ? (
                      <>
                        <span className="text-3xl font-extrabold text-emerald-400 tracking-tight font-sans">
                          {activeReview.discountPrice}
                        </span>
                        <span className="text-sm line-through text-white/30 font-light">
                          {activeReview.price}
                        </span>
                      </>
                    ) : (
                      <span className="text-3xl font-extrabold text-white tracking-tight font-sans">
                        {activeReview.price || "Free / Demo"}
                      </span>
                    )}
                  </div>

                  {/* CTAs Stacked for Touch Interaction */}
                  <div className="space-y-2.5 pt-2">
                    <a
                      href={activeReview.affiliateUrl || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleCtaClick()}
                      className="w-full bg-gradient-to-r from-[#C5A059] to-[#D4B26F] text-black font-extrabold uppercase tracking-wider text-xs py-3.5 rounded-xl flex justify-center items-center gap-2 transition-all shadow-md active:scale-95 duration-200 cursor-pointer"
                    >
                      Buy Now <ExternalLink size={12} />
                    </a>

                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        onClick={handleCompareClick}
                        className="bg-white/[0.02] border border-white/10 text-white font-bold uppercase tracking-wider text-[9px] py-3 rounded-xl flex justify-center items-center gap-1.5 transition-all active:scale-95 duration-150 cursor-pointer"
                      >
                        <SlidersHorizontal size={12} className="text-neutral-400" />
                        Compare
                      </button>

                      <button
                        onClick={handleSaveClick}
                        className={`border font-bold uppercase tracking-wider text-[9px] py-3 rounded-xl flex justify-center items-center gap-1.5 transition-all active:scale-95 duration-150 cursor-pointer ${
                          isSaved
                            ? "bg-[#C5A059]/10 border-[#C5A059]/30 text-[#C5A059]"
                            : "bg-white/[0.02] border-white/10 text-white"
                        }`}
                      >
                        <Heart
                          size={12}
                          className={isSaved ? "fill-[#C5A059] text-[#C5A059]" : "text-neutral-450"}
                        />
                        {isSaved ? "Saved" : "Save"}
                      </button>
                    </div>
                  </div>

                  {/* Short Introduction */}
                  <p className="text-xs text-neutral-450 leading-relaxed font-light pt-4 border-t border-white/5 font-sans">
                    {activeReview.introduction || activeReview.excerpt}
                  </p>
                </div>
              </div>

              {/* SEQUENTIAL ARTICLE SECTIONS AND ACCORDION SEQUENCES */}
              <div className="space-y-12 text-left text-neutral-200 mt-16">
                {/* 1. Specifications / Comparison Section */}
                {activeReview.comparisonTable?.enabled &&
                  activeReview.comparisonTable.rows?.length > 0 && (
                    <div id="specifications-section" className="pt-10 border-t border-white/5 space-y-6">
                      <h2 className="text-xl sm:text-2xl font-serif text-white tracking-tight flex items-center gap-2">
                        <SlidersHorizontal size={18} className="text-[#C5A059]" />
                        Specifications & Comparison
                      </h2>
                      <div className="overflow-x-auto rounded-xl border border-white/5 bg-neutral-950/30">
                        <table className="w-full text-left border-collapse text-xs sm:text-sm">
                          <thead>
                            <tr className="border-b border-white/15 bg-white/[0.02]">
                              <th className="p-4 font-mono uppercase tracking-wider text-neutral-450 font-bold">Feature / Metric</th>
                              <th className="p-4 font-mono uppercase tracking-wider text-[#C5A059] font-bold bg-[#C5A059]/[0.02]">{activeReview.brandName}</th>
                              <th className="p-4 font-mono uppercase tracking-wider text-neutral-500 font-bold">{activeReview.comparisonTable.competitorName || "Competitor"}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/[0.03]">
                            {activeReview.comparisonTable.rows.map((row, i) => (
                              <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                                <td className="p-4 font-medium text-neutral-300">{row.featureName}</td>
                                <td className="p-4 text-white font-semibold bg-[#C5A059]/[0.01]">{row.thisBrandValue}</td>
                                <td className="p-4 text-neutral-400">{row.competitorBrandValue}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                {/* 2. Pros Section */}
                {activeReview.pros?.length > 0 && (
                  <div id="pros-section" className="pt-10 border-t border-white/5 space-y-4">
                    <h2 className="text-xl sm:text-2xl font-serif text-white tracking-tight flex items-center gap-2">
                      <Check size={18} className="text-emerald-400" />
                      Key Pros
                    </h2>
                    <div className="bg-emerald-500/[0.02] border border-emerald-500/10 rounded-2xl p-6 sm:p-8">
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeReview.pros.map((p, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-3 text-xs sm:text-sm leading-relaxed text-emerald-100/80"
                          >
                            <Check
                              size={16}
                              className="text-emerald-400/50 mt-0.5 shrink-0"
                            />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* 3. Cons Section */}
                {activeReview.cons?.length > 0 && (
                  <div id="cons-section" className="pt-10 border-t border-white/5 space-y-4">
                    <h2 className="text-xl sm:text-2xl font-serif text-white tracking-tight flex items-center gap-2">
                      <Minus size={18} className="text-red-400" />
                      Key Cons
                    </h2>
                    <div className="bg-red-500/[0.02] border border-red-500/10 rounded-2xl p-6 sm:p-8">
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeReview.cons.map((c, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-3 text-xs sm:text-sm leading-relaxed text-red-100/80"
                          >
                            <Minus
                              size={16}
                              className="text-red-400/50 mt-0.5 shrink-0"
                            />
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* 4. Overview Section (What Is It?) */}
                {activeReview.whatIsIt && (
                  <div id="overview-section" className="pt-10 border-t border-white/5 space-y-4">
                    <h2 className="text-xl sm:text-2xl font-serif text-white tracking-tight">
                      Product Overview
                    </h2>
                    <p className="leading-relaxed font-light text-sm sm:text-base text-neutral-300 whitespace-pre-wrap font-sans">
                      {activeReview.whatIsIt}
                    </p>
                  </div>
                )}

                {/* 5. Features Section (Key Features) */}
                {activeReview.keyFeatures?.length > 0 && (
                  <div id="key-features-section" className="pt-10 border-t border-white/5 space-y-6">
                    <h2 className="text-xl sm:text-2xl font-serif text-white tracking-tight flex items-center gap-2">
                      <Sparkles size={18} className="text-[#C5A059]" />
                      Core Features
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#07070a]/40 border border-white/5 rounded-2xl p-6 sm:p-8">
                      {activeReview.keyFeatures.map((f, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 text-xs sm:text-sm text-neutral-300"
                        >
                          <Sparkles
                            size={14}
                            className="text-[#C5A059] mt-0.5 shrink-0"
                          />
                          {f}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. Verdict Section (Final Verdict) */}
                {activeReview.finalVerdict && (
                  <div id="verdict-section" className="pt-10 border-t border-white/5 space-y-4">
                    <div className="bg-[#C5A059]/5 border border-[#C5A059]/20 rounded-3xl p-6 sm:p-10 relative overflow-hidden">
                      <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#C5A059]/10 blur-3xl rounded-full" />
                      <h3 className="text-[#C5A059] font-mono text-xs uppercase tracking-widest font-bold mb-4 relative z-10">
                        Final Verdict
                      </h3>
                      <p className="text-base sm:text-lg md:text-xl leading-relaxed italic text-white font-serif relative z-10">
                        "{activeReview.finalVerdict}"
                      </p>
                    </div>
                  </div>
                )}

                {/* 7. FAQ Section */}
                {activeReview.faqs && activeReview.faqs.length > 0 && (
                  <div id="faq-section" className="pt-10 border-t border-white/5 space-y-6">
                    <h2 className="text-xl sm:text-2xl font-serif text-white tracking-tight">
                      Frequently Asked Questions
                    </h2>
                    <div className="space-y-3">
                      {activeReview.faqs.map((faq, i) => (
                        <div
                          key={i}
                          className="border border-white/5 rounded-xl bg-[#07070a] overflow-hidden transition-colors hover:border-white/10"
                        >
                          <button
                            onClick={() => setExpandedFaqIndex(expandedFaqIndex === i ? null : i)}
                            className="w-full p-4 flex items-center justify-between text-left text-sm font-medium text-white hover:bg-white/[0.01] transition-colors cursor-pointer"
                          >
                            <span>{faq.question}</span>
                            <ChevronDown
                              size={16}
                              className={`text-[#C5A059] transition-transform duration-300 ${
                                expandedFaqIndex === i ? "rotate-180" : ""
                              }`}
                            />
                          </button>

                          <AnimatePresence initial={false}>
                            {expandedFaqIndex === i && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <div className="p-4 pt-0 border-t border-white/[0.03] text-xs sm:text-sm text-neutral-400 leading-relaxed font-light">
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

                {/* 8. Related Products upgraded section */}
                <div id="related-products-section" className="pt-10 border-t border-white/5 space-y-8">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-serif text-white tracking-tight">
                        Related Products
                      </h2>
                      <p className="text-xs text-neutral-450 font-light mt-1 max-w-lg">
                        Discover similar products carefully selected by our editorial team.
                      </p>
                    </div>
                  </div>

                  {/* Shopping Grid: Desktop 4, Mobile 2, equal heights, rounded corners, soft shadows, uniform aspect ratio, hover zoom */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                    {activeReviewRelatedProducts.map((p) => (
                      <div
                        key={p.id}
                        className="bg-[#08080c] border border-white/5 hover:border-[#C5A059]/30 rounded-2xl p-4 flex flex-col justify-between transition-all group relative shadow-lg hover:shadow-[#C5A059]/5 h-full"
                      >
                        {/* Image panel with zoom on hover */}
                        <div className="aspect-square w-full rounded-xl overflow-hidden bg-black/40 flex items-center justify-center p-4 relative border border-white/5 mb-4 group/img">
                          <img
                            src={p.featuredImage}
                            alt={p.title}
                            className="max-h-full max-w-full object-contain group-hover/img:scale-[1.08] transition-transform duration-500"
                            referrerPolicy="no-referrer"
                            loading="lazy"
                          />
                          {p.discountPercent && (
                            <span className="absolute top-2 left-2 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase font-mono tracking-wider shadow-md">
                              {p.discountPercent}% Off
                            </span>
                          )}
                          {p.type === 'editorial-review' && (
                            <span className="absolute top-2 right-2 bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/20 text-[7px] font-bold px-1.5 py-0.5 rounded uppercase font-mono tracking-wider">
                              Affiliate Pick
                            </span>
                          )}
                        </div>

                        {/* Content text */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="space-y-1.5">
                            <span className="block text-[8px] font-mono text-[#C5A059] uppercase tracking-wider font-bold">
                              {p.brandName}
                            </span>
                            <h3 className="text-xs sm:text-sm font-semibold text-white leading-snug line-clamp-2 group-hover:text-[#C5A059] transition-colors">
                              {p.title}
                            </h3>
                            
                            {/* Stars Rating */}
                            <div className="flex items-center gap-1">
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={9}
                                    className={i < Math.floor(p.rating) ? "text-[#C5A059] fill-[#C5A059]" : "text-white/10"}
                                  />
                                ))}
                              </div>
                              <span className="text-[8px] font-mono text-neutral-400 font-bold">({p.rating})</span>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-white/5 space-y-3">
                            {/* Pricing */}
                            <div className="flex items-baseline gap-2">
                              <span className="text-xs sm:text-sm font-mono font-bold text-white">{p.price}</span>
                              {p.originalPrice && (
                                <span className="text-[10px] text-white/30 line-through font-mono">{p.originalPrice}</span>
                              )}
                            </div>

                            {/* Two CTAs as requested */}
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => navigate(`/product/${p.id}`)}
                                className="bg-white/5 hover:bg-white/10 text-white border border-white/10 text-[9px] font-mono font-bold py-2 rounded-xl text-center uppercase tracking-wider transition-all cursor-pointer"
                              >
                                View Details
                              </button>
                              
                              <a
                                href={p.affiliateUrl}
                                target="_blank"
                                rel="nofollow sponsored noopener noreferrer"
                                className="bg-gradient-to-r from-[#C5A059] to-[#D4B26F] hover:from-[#D4B26F] hover:to-[#E3C380] text-black text-[9px] font-mono font-extrabold py-2 rounded-xl text-center uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-0.5"
                              >
                                Buy Now <ExternalLink size={8} />
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* See All Deals Button under Related Products */}
                  <div className="pt-6 text-center">
                    <Button
                      onClick={() => navigate('/deals')}
                      className="border border-[#C5A059]/20 hover:border-[#C5A059]/50 bg-transparent hover:bg-[#C5A059]/5 text-[#C5A059] font-mono text-[10px] uppercase tracking-widest px-8 py-5 rounded-xl font-bold cursor-pointer transition-all animate-pulse"
                    >
                      See All Deals <ArrowRight size={12} className="ml-2" />
                    </Button>
                  </div>
                </div>

              {/* STICKY BOTTOM MOBILE CTA ACTION DECK */}
              <AnimatePresence>
                {showSticky && (
                  <motion.div
                    initial={{ y: 80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 80, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 25 }}
                    className="fixed bottom-0 left-0 right-0 z-50 bg-[#060608]/95 backdrop-blur-md border-t border-white/10 p-4 md:hidden flex items-center justify-between shadow-2xl px-5"
                  >
                    <div className="flex flex-col">
                      <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest font-bold">
                        {activeReview.brandName}
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        {activeReview.discountPrice ? (
                          <>
                            <span className="text-xl font-bold text-emerald-400 font-sans">
                              {activeReview.discountPrice}
                            </span>
                            <span className="text-[11px] text-neutral-500 line-through font-light">
                              {activeReview.price}
                            </span>
                          </>
                        ) : (
                          <span className="text-xl font-bold text-white font-sans">
                            {activeReview.price || "Free"}
                          </span>
                        )}
                      </div>
                    </div>

                    <a
                      href={activeReview.affiliateUrl || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleCtaClick()}
                      className="bg-gradient-to-r from-[#C5A059] to-[#D4B26F] text-black text-[10px] font-bold uppercase tracking-wider py-2.5 px-5 rounded-lg transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5 font-mono shadow-md shadow-[#C5A059]/10"
                    >
                      Buy Now
                      <ExternalLink size={10} />
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>

                {/* BOTTOM SPONSOR BANNER */}
                {activeReview.bottomBanner?.enabled &&
                  activeReview.bottomBanner.imageUrl && (
                    <div className="w-full my-12">
                      <a
                        href={activeReview.bottomBanner.destinationUrl || "#"}
                        target="_blank"
                        rel="nofollow sponsored noopener"
                        onClick={() => handleBannerClick("bottom")}
                        className="w-full block rounded-2xl overflow-hidden border border-white/5 hover:border-[#C5A059]/30 transition-all duration-300 bg-neutral-900/40 select-none"
                      >
                        <img
                          src={activeReview.bottomBanner.imageUrl}
                          alt={
                            activeReview.bottomBanner.altText ||
                            "Sponsor bottom campaign banner"
                          }
                          className="w-full h-[180px] sm:h-[240px] md:h-[280px] object-cover"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                      </a>
                    </div>
                  )}

                {/* RELATED REVIEWS PORTFOLIO */}
                {reviews.filter(
                  (r) =>
                    r.id !== activeReview.id &&
                    (activeReview.relatedReviewIds?.includes(r.id) ||
                      r.category === activeReview.category),
                ).length > 0 && (
                  <div className="border-t border-white/5 pt-12">
                    <h3 className="text-neutral-500 font-mono text-[10px] uppercase tracking-widest font-bold mb-6">
                      Related Recommendations
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {reviews
                        .filter(
                          (r) =>
                            r.id !== activeReview.id &&
                            (activeReview.relatedReviewIds?.includes(r.id) ||
                              r.category === activeReview.category),
                        )
                        .slice(0, 3)
                        .map((rev) => (
                          <div
                            key={rev.id}
                            onClick={() => {
                              navigate(`/ecosystem/${rev.slug}`);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="group cursor-pointer bg-white/[0.01] hover:bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex flex-col h-full text-left transition-all"
                          >
                            <div className="aspect-video w-full rounded-xl overflow-hidden border border-white/5 mb-3.5 relative bg-[#0a0a0f]">
                              <img
                                src={rev.featuredImage}
                                alt={rev.brandName}
                                className="object-contain w-full h-full p-2"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                              <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-black/85 rounded-md text-[9px] font-mono uppercase text-[#C5A059] border border-white/10 font-bold z-10">
                                {rev.rating} ★
                              </div>
                            </div>
                            <h4 className="text-sm font-semibold text-neutral-200 group-hover:text-[#C5A059] transition-colors leading-tight line-clamp-1">
                              {rev.title}
                            </h4>
                            <p className="text-xs text-neutral-450 font-light mt-1.5 line-clamp-2 leading-relaxed flex-grow">
                              {rev.excerpt}
                            </p>
                            <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-500 mt-3 pt-3 border-t border-white/[0.02]">
                              <span>Read Full review</span>
                              <ArrowRight
                                size={10}
                                className="group-hover:translate-x-1 transition-transform"
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* FOOTER-STYLE AFFILIATE DISCLOSURE */}
                {(activeReview.enableGlobalDisclosure !== false ||
                  activeReview.sponsoredDisclosure !== false) && (
                  <div className="border-t border-white/5 pt-12 mt-12 text-center max-w-3xl mx-auto space-y-2 select-none">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-[#C5A059] font-bold">
                      Affiliate Link disclosure
                    </p>
                    <p className="text-[11px] text-neutral-500 leading-relaxed font-light">
                      All properties and platforms represented here are subject
                      to meticulous expert editorial research and standard
                      compliance benchmarks. We participate in direct affiliate
                      partnerships; hence registering or initiating an
                      interaction through selected links may yield reference
                      commission credits to PrimeDeals at absolute zero
                      incremental expense to you.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="max-w-md mx-auto py-24 text-center px-4">
              <h2 className="text-lg font-serif mb-2">
                Review Column Not Found
              </h2>
              <p className="text-xs text-neutral-500 mb-6">
                The requested recommendation slug could not be located in our
                index listings.
              </p>
              <Button
                onClick={() => navigate("/ecosystem")}
                size="sm"
                className="bg-[#C5A059] hover:bg-[#D4B26F] text-black"
              >
                View Explore Hub
              </Button>
            </div>
          )}
        </AnimatePresence>
      ) : (
        /* DIRECTORY LISTING MODE */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <Helmet>
            <title>
              Discover Products & Tech Reviews | PrimeDeals
            </title>
            <meta
              name="description"
              content="Discover similar products carefully selected by our editorial team."
            />
            <link rel="canonical" href="https://amaanestate.com/ecosystem" />
          </Helmet>

          {/* SEARCH & FILTERS CONTROLS */}
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Small Compact Search Bar */}
            <div className="relative max-w-md mx-auto">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500">
                <Search size={14} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-neutral-900/60 hover:bg-neutral-900 border border-white/10 hover:border-white/20 focus:border-[#C5A059]/40 rounded-xl py-2 px-10 text-xs text-white placeholder-neutral-500 outline-none transition-all focus:ring-1 focus:ring-[#C5A059]/10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white cursor-pointer"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Category Filter Dropdown */}
            <div className="flex justify-center">
              <CategoryDropdown
                categories={categoryChips}
                selectedId={selectedCategory}
                onChange={handleCategoryChange}
                labelPrefix="Category: "
              />
            </div>
          </div>

          {/* PRODUCT GRID */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="h-8 w-8 border border-[#C5A059] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-xs text-neutral-500 font-mono">
                Syncing product registry...
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="max-w-md mx-auto py-16 text-center px-4 bg-white/[0.01] border border-white/5 rounded-2xl">
              <h3 className="text-sm font-semibold text-white mb-1.5">
                No Products Found
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                No matching items found for your selection. Try checking another category or refining your search.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((prod) => {
                const detailUrl = prod.slug ? `/reviews/${prod.slug}` : `/product/${prod.id}`;
                return (
                  <motion.div
                    key={prod.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col h-full bg-[#0a0a0f] border border-white/5 rounded-2xl overflow-hidden group hover:border-[#C5A059]/30 transition-all duration-300"
                  >
                    {/* Image Area - occupied most of the card */}
                    <div 
                      className="relative aspect-square w-full overflow-hidden bg-neutral-900 border-b border-white/5 cursor-pointer"
                      onClick={() => navigate(detailUrl)}
                    >
                      <img
                        src={prod.featuredImage}
                        alt={prod.title}
                        className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-500 ease-out brightness-95 group-hover:brightness-100"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                    </div>

                    {/* Details section - Clean and compact */}
                    <div className="p-4 flex flex-col flex-grow justify-between space-y-4">
                      <div className="space-y-1">
                        <h3 className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                          {prod.brandName}
                        </h3>
                        <h4 
                          className="text-sm font-bold text-white tracking-tight line-clamp-2 hover:text-[#C5A059] cursor-pointer font-sans transition-colors"
                          onClick={() => navigate(detailUrl)}
                        >
                          {prod.title}
                        </h4>
                      </div>

                      <div className="space-y-3">
                        <div className="text-base font-extrabold text-[#C5A059] font-sans">
                          {prod.price}
                        </div>
                        <Link
                          to={detailUrl}
                          className="w-full bg-white/[0.03] hover:bg-[#C5A059] text-white hover:text-black font-semibold text-xs py-2 px-3 rounded-lg border border-white/10 hover:border-transparent transition-all duration-200 text-center block cursor-pointer"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
