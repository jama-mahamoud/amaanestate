import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Eye, 
  FileText, 
  Calendar, 
  Check, 
  X, 
  SlidersHorizontal, 
  Save, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  ArrowLeft,
  ChevronRight,
  Star,
  Globe,
  CornerDownRight,
  RotateCcw,
  BookOpen,
  Send,
  Sliders,
  Play,
  Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { reviewService, EditorialReview } from '@/services/reviewService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function DashboardReviews() {
  const { profile } = useAuth();
  
  // Reviews records state
  const [reviews, setReviews] = useState<EditorialReview[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  // Active UI editors / views
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<EditorialReview | null>(null);
  const [previewReview, setPreviewReview] = useState<EditorialReview | null>(null);

  // Form Fields State
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formCategory, setFormCategory] = useState<'real-estate' | 'finance' | 'tech' | 'learning' | 'market'>('real-estate');
  const [formFeaturedImage, setFormFeaturedImage] = useState('');
  const [formExcerpt, setFormExcerpt] = useState('');
  const [formIntroduction, setFormIntroduction] = useState('');
  const [formWhatIsIt, setFormWhatIsIt] = useState('');
  const [formKeyFeatures, setFormKeyFeatures] = useState('');
  const [formPros, setFormPros] = useState('');
  const [formCons, setFormCons] = useState('');
  const [formBestFor, setFormBestFor] = useState('');
  const [formPricingOverview, setFormPricingOverview] = useState('');
  const [formFinalVerdict, setFormFinalVerdict] = useState('');
  const [formRating, setFormRating] = useState(4.8);
  const [formReadingTime, setFormReadingTime] = useState('5 min read');
  const [formPublishDate, setFormPublishDate] = useState('June 16, 2026');
  const [formBrandName, setFormBrandName] = useState('');
  const [formBrandLogoLetter, setFormBrandLogoLetter] = useState('A');
  const [formAffiliateUrl, setFormAffiliateUrl] = useState('');
  const [formCtaSummary, setFormCtaSummary] = useState('');
  const [formCtaButtonText, setFormCtaButtonText] = useState('Visit Official Website');
  const [formCtaButtonStyle, setFormCtaButtonStyle] = useState<'solid-gold' | 'outline-gold' | 'minimal-border' | 'solid-emerald'>('solid-gold');
  const [formExternalLink, setFormExternalLink] = useState(true);
  const [formSponsoredDisclosure, setFormSponsoredDisclosure] = useState(true);
  const [formSeoTitle, setFormSeoTitle] = useState('');
  const [formMetaDescription, setFormMetaDescription] = useState('');
  const [formOgTitle, setFormOgTitle] = useState('');
  const [formOgDescription, setFormOgDescription] = useState('');
  const [formOgImage, setFormOgImage] = useState('');
  const [formStatus, setFormStatus] = useState<EditorialReview['status']>('draft');

  // Load reviews on mount
  const loadReviewsData = async () => {
    setLoading(true);
    try {
      const data = await reviewService.getAllReviews(false);
      setReviews(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to retrieve reviews from repository');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviewsData();
  }, []);

  // Sync title to slug automatically on input changes
  useEffect(() => {
    if (!editingReview && formTitle && !formSlug) {
      const generated = formTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/[\s_]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormSlug(generated);
    }
  }, [formTitle, formSlug, editingReview]);

  // Handle auto-routing slug verify
  const handleRegenerateSlug = async () => {
    if (!formTitle) return;
    const clean = await reviewService.ensureUniqueSlug(formTitle, editingReview?.id);
    setFormSlug(clean);
    toast.success('Unique slug handle negotiated');
  };

  const handleOpenCreateForm = () => {
    setEditingReview(null);
    setFormTitle('');
    setFormSlug('');
    setFormCategory('real-estate');
    setFormFeaturedImage('https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200&auto=format&fit=crop');
    setFormExcerpt('');
    setFormIntroduction('');
    setFormWhatIsIt('');
    setFormKeyFeatures('');
    setFormPros('');
    setFormCons('');
    setFormBestFor('');
    setFormPricingOverview('');
    setFormFinalVerdict('');
    setFormRating(4.8);
    setFormReadingTime('5 min read');
    setFormPublishDate(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
    setFormBrandName('');
    setFormBrandLogoLetter('A');
    setFormAffiliateUrl('');
    setFormCtaSummary('');
    setFormCtaButtonText('Visit Official Website');
    setFormCtaButtonStyle('solid-gold');
    setFormExternalLink(true);
    setFormSponsoredDisclosure(true);
    setFormSeoTitle('');
    setFormMetaDescription('');
    setFormOgTitle('');
    setFormOgDescription('');
    setFormOgImage('');
    setFormStatus('draft');

    setIsFormOpen(true);
    setPreviewReview(null);
  };

  const handleOpenEditForm = (rev: EditorialReview) => {
    setEditingReview(rev);
    setFormTitle(rev.title);
    setFormSlug(rev.slug);
    setFormCategory(rev.category);
    setFormFeaturedImage(rev.featuredImage);
    setFormExcerpt(rev.excerpt);
    setFormIntroduction(rev.introduction);
    setFormWhatIsIt(rev.whatIsIt);
    setFormKeyFeatures(rev.keyFeatures ? rev.keyFeatures.join('\n') : '');
    setFormPros(rev.pros ? rev.pros.join('\n') : '');
    setFormCons(rev.cons ? rev.cons.join('\n') : '');
    setFormBestFor(rev.bestFor || '');
    setFormPricingOverview(rev.pricingOverview || '');
    setFormFinalVerdict(rev.finalVerdict || '');
    setFormRating(rev.rating || 4.5);
    setFormReadingTime(rev.readingTime || '5 min read');
    setFormPublishDate(rev.publishDate || '');
    setFormBrandName(rev.brandName || '');
    setFormBrandLogoLetter(rev.brandLogoLetter || 'B');
    setFormAffiliateUrl(rev.affiliateUrl || '');
    setFormCtaSummary(rev.ctaSummary || '');
    setFormCtaButtonText(rev.ctaButtonText || 'Visit Official Website');
    setFormCtaButtonStyle(rev.ctaButtonStyle || 'solid-gold');
    setFormExternalLink(rev.externalLink !== false);
    setFormSponsoredDisclosure(rev.sponsoredDisclosure !== false);
    setFormSeoTitle(rev.seoTitle || '');
    setFormMetaDescription(rev.metaDescription || '');
    setFormOgTitle(rev.ogTitle || '');
    setFormOgDescription(rev.ogDescription || '');
    setFormOgImage(rev.ogImage || '');
    setFormStatus(rev.status || 'draft');

    setIsFormOpen(true);
    setPreviewReview(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDuplicateReview = async (rev: EditorialReview) => {
    try {
      const generatedUniqueSlug = await reviewService.ensureUniqueSlug(`${rev.title} Copy`, rev.id);
      
      const payload: EditorialReview = {
        ...rev,
        id: generatedUniqueSlug,
        slug: generatedUniqueSlug,
        title: `${rev.title} (Copy)`,
        brandName: `${rev.brandName} (Copy)`,
        status: 'draft',
        createdAt: new Date().toISOString()
      };
      
      await reviewService.createReview(payload);
      toast.success('Review duplicated successfully as Draft');
      loadReviewsData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to duplicate editorial review');
    }
  };

  // Moderation state changes
  const handleUpdateStatus = async (id: string, nextStatus: EditorialReview['status']) => {
    try {
      await reviewService.updateStatus(id, nextStatus);
      toast.success(`Review flag moved to ${nextStatus.toUpperCase()}`);
      loadReviewsData();
    } catch (err) {
      toast.error('Failed to change workflow status');
    }
  };

  // Save changes
  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formSlug.trim() || !formBrandName.trim()) {
      toast.error('Review Title, Slug parameters, and Brand Name are required values.');
      return;
    }

    const cleanSlug = formSlug.toLowerCase().trim().replace(/[^a-z0-9-_]/g, '-');

    const payload: EditorialReview = {
      id: editingReview ? editingReview.id : cleanSlug,
      title: formTitle,
      slug: cleanSlug,
      category: formCategory,
      featuredImage: formFeaturedImage || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200&auto=format&fit=crop',
      excerpt: formExcerpt,
      introduction: formIntroduction,
      whatIsIt: formWhatIsIt,
      keyFeatures: formKeyFeatures.split('\n').map(s => s.trim()).filter(Boolean),
      pros: formPros.split('\n').map(s => s.trim()).filter(Boolean),
      cons: formCons.split('\n').map(s => s.trim()).filter(Boolean),
      bestFor: formBestFor,
      pricingOverview: formPricingOverview || undefined,
      finalVerdict: formFinalVerdict,
      rating: parseFloat(String(formRating)) || 4.5,
      readingTime: formReadingTime || '5 min read',
      publishDate: formPublishDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      brandName: formBrandName,
      brandLogoLetter: formBrandLogoLetter || formBrandName.charAt(0).toUpperCase() || 'A',
      affiliateUrl: formAffiliateUrl,
      ctaSummary: formCtaSummary,
      ctaButtonText: formCtaButtonText,
      ctaButtonStyle: formCtaButtonStyle,
      externalLink: formExternalLink,
      sponsoredDisclosure: formSponsoredDisclosure,
      seoTitle: formSeoTitle || `${formBrandName} Review & Insights`,
      metaDescription: formMetaDescription || `Detailed editorial review, scoring and features analysis of ${formBrandName}.`,
      ogTitle: formOgTitle || formSeoTitle || `${formBrandName} Review & Insights`,
      ogDescription: formOgDescription || formMetaDescription || `Detailed editorial review, scoring and features analysis of ${formBrandName}.`,
      ogImage: formOgImage || formFeaturedImage,
      status: formStatus
    };

    try {
      if (editingReview) {
        await reviewService.updateReview(editingReview.id, payload);
        toast.success('Editorial review updated successfully');
      } else {
        // slug uniqueness check
        const dup = reviews.some(r => r.slug === cleanSlug);
        if (dup) {
          toast.error('A review with this exact slug coordinates already exists.');
          return;
        }
        await reviewService.createReview(payload);
        toast.success('New review profile registered and cached');
      }
      setIsFormOpen(false);
      loadReviewsData();
    } catch (err) {
      toast.error('Database write exception occurred');
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (window.confirm('Delete this editorial recommendation column? This action is irreversible.')) {
      try {
        await reviewService.deleteReview(id);
        toast.success('Review purged clean from logs');
        loadReviewsData();
      } catch (err) {
        toast.error('Failed to purge review');
      }
    }
  };



  // Matches search terms
  const filteredAndSorted = useMemo(() => {
    return reviews.filter(r => {
      const matchSearch = 
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchCat = selectedCategory === 'all' || r.category === selectedCategory;
      const matchStatus = selectedStatus === 'all' || r.status === selectedStatus;
      
      return matchSearch && matchCat && matchStatus;
    });
  }, [reviews, searchQuery, selectedCategory, selectedStatus]);

  // Counts
  const counts = useMemo(() => {
    return {
      all: reviews.length,
      draft: reviews.filter(r => r.status === 'draft').length,
      pending: reviews.filter(r => r.status === 'pending').length,
      approved: reviews.filter(r => r.status === 'approved').length,
      rejected: reviews.filter(r => r.status === 'rejected').length,
      published: reviews.filter(r => r.status === 'published').length,
      unpublished: reviews.filter(r => r.status === 'unpublished').length,
    };
  }, [reviews]);

  return (
    <div className="space-y-8 bg-[#0a0a0c] p-6 rounded-3xl border border-white/5 relative min-h-[80vh]">
      {/* GLOW DECORATOR ACCENT */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-[#C5A059]/[0.02] rounded-full blur-[80px] pointer-events-none" />

      {/* DASHBOARD HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/5 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="h-2 w-2 rounded-full bg-[#C5A059] animate-pulse" />
            <span className="text-[10px] font-mono tracking-widest text-[#C5A059] uppercase font-bold">EDITORIAL OFFICE</span>
          </div>
          <h1 className="text-2xl font-serif text-white tracking-tight">Affiliate Partner Reviews</h1>
          <p className="text-xs text-neutral-400 mt-1">Write, moderate and publish premier product analyses and reviews</p>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <Button
            onClick={handleOpenCreateForm}
            size="sm"
            className="bg-[#C5A059] hover:bg-[#D4B26F] text-black font-semibold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 transition-all shadow-[0_4px_12px_rgba(197,160,89,0.15)]"
          >
            <Plus size={14} /> Write Editorial Review
          </Button>
         </div>
      </div>

      {/* DASHBOARD OVERVIEW: STATS METRICS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-[#0f0f12] border border-white/5 p-4 rounded-xl flex flex-col justify-between h-20 transition-all hover:border-neutral-800">
          <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-semibold">Total Reviews</span>
          <span className="text-xl font-bold text-white tracking-tight">{counts.all}</span>
        </div>
        <div className="bg-[#0f0f12] border border-white/5 p-4 rounded-xl flex flex-col justify-between h-20 transition-all hover:border-neutral-800">
          <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-semibold">Drafts</span>
          <span className="text-xl font-bold text-neutral-400 tracking-tight">{counts.draft}</span>
        </div>
        <div className="bg-[#0f0f12] border border-white/5 p-4 rounded-xl flex flex-col justify-between h-20 transition-all hover:border-amber-600/30">
          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-500 font-semibold">Pending Admin</span>
          <span className="text-xl font-bold text-amber-500 tracking-tight">{counts.pending}</span>
        </div>
        <div className="bg-[#0f0f12] border border-white/5 p-4 rounded-xl flex flex-col justify-between h-20 transition-all hover:border-[#C5A059]/30">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#C5A059] font-semibold">Approved</span>
          <span className="text-xl font-bold text-[#C5A059] tracking-tight">{counts.approved}</span>
        </div>
        <div className="bg-[#0f0f12] border border-white/5 p-4 rounded-xl flex flex-col justify-between h-20 transition-all hover:border-emerald-600/30">
          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">Published</span>
          <span className="text-xl font-bold text-emerald-400 tracking-tight">{counts.published}</span>
        </div>
        <div className="bg-[#0f0f12] border border-white/5 p-4 rounded-xl flex flex-col justify-between h-20 transition-all hover:border-red-600/30">
          <span className="text-[10px] font-mono uppercase tracking-wider text-red-400 font-semibold">Rejected</span>
          <span className="text-xl font-bold text-red-400 tracking-tight">{counts.rejected}</span>
        </div>
      </div>

      {/* RENDER VIEW: DIALOG FORM FOR EDITING OR VIEWING */}
      {isFormOpen && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-2xl bg-[#0f0f12] border border-white/5 space-y-6 text-left"
        >
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-2.5">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFormOpen(false)}
                className="text-neutral-400 hover:text-white shrink-0 hover:bg-neutral-900 h-8 w-8 rounded-lg"
              >
                <ArrowLeft size={16} />
              </Button>
              <div>
                <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase block font-semibold">CMS MANUSCRIPT DESK</span>
                <h2 className="text-base font-bold text-white mt-0.5">
                  {editingReview ? `Editing Entry: "${formBrandName || 'Untargeted Platform'}"` : 'Construct New Editorial Recommendation Column'}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400 font-mono">Stage Status:</span>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as any)}
                className="h-8 px-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-[#C5A059] font-mono focus:ring-1 focus:ring-[#C5A059] focus:outline-none focus:border-[#C5A059]"
              >
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="published">Published</option>
                <option value="unpublished">Unpublished</option>
              </select>
            </div>
          </div>

          <form onSubmit={handleSaveReview} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Form Panel */}
              <div className="space-y-4 lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-neutral-400 uppercase tracking-widest font-bold mb-1.5">Review Title *</label>
                    <input 
                      type="text" 
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="e.g., PropTrack Pro: Deep East Africa Land-registry Audit"
                      className="w-full h-10 px-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-600 text-xs focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-400 uppercase tracking-widest font-bold mb-1.5 flex items-center justify-between">
                      <span>URL SLUG *</span>
                      {!editingReview && (
                        <button 
                          type="button" 
                          onClick={handleRegenerateSlug}
                          className="text-[9px] text-[#C5A059] hover:underline uppercase font-mono cursor-pointer"
                        >
                          Verify Slug Match
                        </button>
                      )}
                    </label>
                    <input 
                      type="text" 
                      required
                      value={formSlug}
                      onChange={(e) => setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-'))}
                      placeholder="proptrack-review-audit"
                      className="w-full h-10 px-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-600 text-xs font-mono focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] text-neutral-400 uppercase tracking-widest font-bold mb-1.5">Brand Platform Name *</label>
                    <input 
                      type="text" 
                      required
                      value={formBrandName}
                      onChange={(e) => setFormBrandName(e.target.value)}
                      placeholder="e.g. PropTrack Pro"
                      className="w-full h-10 px-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-600 text-xs focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-400 uppercase tracking-widest font-bold mb-1.5">Category Classification</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as any)}
                      className="w-full h-10 px-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
                    >
                      <option value="real-estate">Real Estate</option>
                      <option value="finance">Finance</option>
                      <option value="tech">Technology</option>
                      <option value="learning">Learning</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-400 uppercase tracking-widest font-bold mb-1.5">Brand Logo Initials Letter</label>
                    <input 
                      type="text" 
                      maxLength={2}
                      value={formBrandLogoLetter}
                      onChange={(e) => setFormBrandLogoLetter(e.target.value.toUpperCase())}
                      placeholder="e.g., P"
                      className="w-full h-10 px-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 text-xs text-center font-bold focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-neutral-400 uppercase tracking-widest font-bold mb-1.5">Featured Image URL Upload</label>
                  <input 
                    type="text" 
                    value={formFeaturedImage}
                    onChange={(e) => setFormFeaturedImage(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full h-10 px-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-600 text-xs focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
                  />
                  <span className="text-[10px] text-neutral-500 mt-1 block">Paste Unsplash address or image asset pointer</span>
                </div>

                <div>
                  <label className="block text-[10px] text-neutral-400 uppercase tracking-widest font-bold mb-1.5">Short Excerpt (2-Line Grid Overview)</label>
                  <textarea 
                    rows={2}
                    value={formExcerpt}
                    onChange={(e) => setFormExcerpt(e.target.value)}
                    placeholder="Provide a tight, highly curated hook explaining the product scope..."
                    className="w-full p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-600 text-xs focus:ring-1 focus:ring-[#C5A059] focus:outline-none resize-none"
                  />
                </div>

                {/* Sub-sections editors */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <h3 className="text-xs uppercase font-mono tracking-widest font-bold text-[#C5A059]">Rich Editorial Manuscript Layout</h3>
                  
                  <div>
                    <label className="block text-[10px] text-neutral-450 uppercase tracking-widest mb-1.5">Section 1: Introduction Paragraph</label>
                    <textarea 
                      rows={3}
                      value={formIntroduction}
                      onChange={(e) => setFormIntroduction(e.target.value)}
                      placeholder="Establish why this review was written and what common problem is addressed..."
                      className="w-full p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-450 uppercase tracking-widest mb-1.5">Section 2: What Is This Platform?</label>
                    <textarea 
                      rows={3}
                      value={formWhatIsIt}
                      onChange={(e) => setFormWhatIsIt(e.target.value)}
                      placeholder="Describe the platform structure, target audience, and mechanics details..."
                      className="w-full p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] text-neutral-400 uppercase tracking-widest mb-1.5 font-semibold">Key Features (Line separated)</label>
                      <textarea 
                        rows={4}
                        value={formKeyFeatures}
                        onChange={(e) => setFormKeyFeatures(e.target.value)}
                        placeholder="Feature One&#10;Feature Two&#10;Feature Three"
                        className="w-full p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs font-mono focus:ring-1 focus:ring-[#C5A059] focus:outline-none leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-emerald-400 uppercase tracking-widest mb-1.5 font-semibold">Pros (Benefits - Line separated)</label>
                      <textarea 
                        rows={4}
                        value={formPros}
                        onChange={(e) => setFormPros(e.target.value)}
                        placeholder="Benefit One&#10;Benefit Two"
                        className="w-full p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs font-mono focus:ring-1 focus:ring-[#C5A059] focus:outline-none leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-red-400 uppercase tracking-widest mb-1.5 font-semibold">Cons (Limitations - Line separated)</label>
                      <textarea 
                        rows={4}
                        value={formCons}
                        onChange={(e) => setFormCons(e.target.value)}
                        placeholder="Limitation One&#10;Limitation Two"
                        className="w-full p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs font-mono focus:ring-1 focus:ring-[#C5A059] focus:outline-none leading-relaxed"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-neutral-450 uppercase tracking-widest mb-1.5">Who Is It Best For?</label>
                      <input 
                        type="text" 
                        value={formBestFor}
                        onChange={(e) => setFormBestFor(e.target.value)}
                        placeholder="e.g., Diaspora homebuilders, independent land negotiators"
                        className="w-full h-10 px-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-neutral-450 uppercase tracking-widest mb-1.5">Pricing Overview Details (Optional)</label>
                      <input 
                        type="text" 
                        value={formPricingOverview}
                        onChange={(e) => setFormPricingOverview(e.target.value)}
                        placeholder="e.g. Flat 0.8% transaction scale. Corporate tier starts at $249."
                        className="w-full h-10 px-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-450 uppercase tracking-widest mb-1.5">Section 3: Final Verdict (Direct editorial summary recommendation)</label>
                    <textarea 
                      rows={3}
                      value={formFinalVerdict}
                      onChange={(e) => setFormFinalVerdict(e.target.value)}
                      placeholder="e.g., PropTrack Pro removes manual ledger tracking doubts perfectly..."
                      className="w-full p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Right Sidebar Form Panels */}
              <div className="space-y-6">
                
                {/* Metrics & Ratings */}
                <div className="p-5 rounded-2xl bg-[#141419] border border-white/5 space-y-4">
                  <h4 className="text-xs font-mono uppercase tracking-widest font-bold text-neutral-300">Ratings & Metadata</h4>
                  
                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[10px] text-neutral-400 uppercase tracking-widest mb-1 font-bold">Expert Score</label>
                      <input 
                        type="number" 
                        step="0.1"
                        min="1"
                        max="5"
                        value={formRating}
                        onChange={(e) => setFormRating(parseFloat(e.target.value))}
                        className="w-full h-10 px-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs focus:ring-1 focus:ring-[#C5A059] focus:outline-none text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-400 uppercase tracking-widest mb-1 font-bold">Reading Time</label>
                      <input 
                        type="text" 
                        value={formReadingTime}
                        onChange={(e) => setFormReadingTime(e.target.value)}
                        placeholder="e.g. 5 min read"
                        className="w-full h-10 px-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs focus:ring-1 focus:ring-[#C5A059] focus:outline-none text-center"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-400 uppercase tracking-widest mb-1 font-bold">Custom Publishing Date</label>
                    <input 
                      type="text" 
                      value={formPublishDate}
                      onChange={(e) => setFormPublishDate(e.target.value)}
                      placeholder="e.g. June 16, 2026"
                      className="w-full h-10 px-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs focus:ring-1 focus:ring-[#C5A059] focus:outline-none text-center"
                    />
                  </div>
                </div>

                {/* Secure Outboard Affiliate System */}
                <div className="p-5 rounded-2xl bg-[#141419] border border-[#C5A059]/20 space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 py-0.5 px-2 bg-[#C5A059]/10 rounded-bl text-[8px] font-mono tracking-wider font-semibold text-[#C5A059]">MONETIZED FIELD</div>
                  <h4 className="text-xs font-mono uppercase tracking-widest font-bold text-[#C5A059]">Affiliate Integration CTA</h4>
                  
                  <div>
                    <label className="block text-[10px] text-neutral-300 uppercase tracking-widest mb-1 font-bold">Affiliate URL (affiliate_url)</label>
                    <input 
                      type="url" 
                      value={formAffiliateUrl}
                      onChange={(e) => setFormAffiliateUrl(e.target.value)}
                      placeholder="https://www.external.com/?ref=amaan"
                      className="w-full h-10 px-3 bg-neutral-900 border border-[#C5A059]/30 text-white placeholder-neutral-750 text-xs focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
                    />
                    <span className="text-[10px] text-neutral-500 mt-1 block">External redirection destination. Never exposed on directory grids.</span>
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-300 uppercase tracking-widest mb-1 font-bold">Affiliate CTA Summary Statement</label>
                    <input 
                      type="text" 
                      value={formCtaSummary}
                      onChange={(e) => setFormCtaSummary(e.target.value)}
                      placeholder="Ready for compliant land acquisitions? Secure an account here."
                      className="w-full h-10 px-3 bg-neutral-900 border border-[#C5A059]/30 text-white placeholder-neutral-750 text-xs focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-300 uppercase tracking-widest mb-1 font-bold">CTA Button Text</label>
                    <input 
                      type="text" 
                      value={formCtaButtonText}
                      onChange={(e) => setFormCtaButtonText(e.target.value)}
                      placeholder="e.g. Visit Official Website"
                      className="w-full h-10 px-3 bg-neutral-900 border border-[#C5A059]/30 text-white placeholder-neutral-750 text-xs focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-300 uppercase tracking-widest mb-1 font-bold">CTA Button Style Accent</label>
                    <select
                      value={formCtaButtonStyle}
                      onChange={(e) => setFormCtaButtonStyle(e.target.value as any)}
                      className="w-full h-10 px-2 rounded-xl bg-neutral-900 border border-[#C5A059]/35 text-white text-xs focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
                    >
                      <option value="solid-gold">Solid Gold Accents</option>
                      <option value="outline-gold">Gold Outline minimalist</option>
                      <option value="minimal-border">Minimal muted border</option>
                      <option value="solid-emerald">Solid Emerald success</option>
                    </select>
                  </div>

                  {/* Reactive Mockup Preview */}
                  <div className="bg-[#0c0c0e] p-4 rounded-xl border border-white/5 text-center space-y-2">
                    <span className="text-[10px] font-mono text-neutral-500 uppercase block font-semibold">Active Button Presentation</span>
                    <button
                      type="button"
                      className={`w-full text-[11px] font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 transition-all pointer-events-none ${
                        formCtaButtonStyle === 'outline-gold'
                          ? 'border border-[#C5A059] text-[#C5A059] bg-transparent'
                          : formCtaButtonStyle === 'minimal-border'
                          ? 'border border-white/10 text-neutral-300 bg-transparent'
                          : formCtaButtonStyle === 'solid-emerald'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#C5A059] text-black shadow-[0_4px_12px_rgba(197,160,89,0.15)]'
                      }`}
                    >
                      {formCtaButtonText || 'Visit Official Website'} <ExternalLink size={11} />
                    </button>
                  </div>

                  <div className="space-y-2.5 pt-1">
                    <div className="flex items-center gap-2.5">
                      <input 
                        type="checkbox" 
                        id="formExternalLink"
                        checked={formExternalLink}
                        onChange={(e) => setFormExternalLink(e.target.checked)}
                        className="h-4 w-4 bg-neutral-905 border-neutral-800 text-[#C5A059] rounded focus:ring-[#C5A059] cursor-pointer"
                      />
                      <label htmlFor="formExternalLink" className="text-xs text-neutral-350 cursor-pointer select-none font-medium">
                        Open Partner Link in new tab (blank)
                      </label>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <input 
                        type="checkbox" 
                        id="formSponsoredDisclosure"
                        checked={formSponsoredDisclosure}
                        onChange={(e) => setFormSponsoredDisclosure(e.target.checked)}
                        className="h-4 w-4 bg-neutral-905 border-neutral-800 text-[#C5A059] rounded focus:ring-[#C5A059] cursor-pointer"
                      />
                      <label htmlFor="formSponsoredDisclosure" className="text-xs text-neutral-350 cursor-pointer select-none font-medium">
                        Show sponsored partner disclosure
                      </label>
                    </div>
                  </div>
                </div>

                {/* High Tier SEO Optimization */}
                <div className="p-5 rounded-2xl bg-[#141419] border border-white/5 space-y-4">
                  <h4 className="text-xs font-mono uppercase tracking-widest font-bold text-neutral-300">SEO & Core Indexing Metadata</h4>
                  
                  <div>
                    <label className="block text-[10px] text-neutral-450 uppercase tracking-widest mb-1 font-bold">SEO HTML Title Tag</label>
                    <input 
                      type="text" 
                      value={formSeoTitle}
                      onChange={(e) => setFormSeoTitle(e.target.value)}
                      placeholder="PropTrack Pro Real Estate Review - AmaanEstate"
                      className="w-full h-10 px-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-700 text-xs focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-450 uppercase tracking-widest mb-1 font-bold">Meta Robots Description</label>
                    <textarea 
                      rows={2}
                      value={formMetaDescription}
                      onChange={(e) => setFormMetaDescription(e.target.value)}
                      placeholder="Curated technical review details, features benefits evaluation..."
                      className="w-full p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-700 text-xs focus:ring-1 focus:ring-[#C5A059] focus:outline-none resize-none"
                    />
                  </div>

                  <div className="pt-2 border-t border-white/5 space-y-3">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-neutral-500 block font-semibold">Social Preview (Open Graph)</span>
                    
                    <div>
                      <label className="block text-[9px] text-neutral-450 uppercase mb-1 font-mono">OG Title Tag</label>
                      <input 
                        type="text" 
                        value={formOgTitle}
                        onChange={(e) => setFormOgTitle(e.target.value)}
                        placeholder="Custom Facebook/Twitter Title"
                        className="w-full h-10 px-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs focus:ring-1 focus:ring-[#C5A059]"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] text-neutral-450 uppercase mb-1 font-mono">OG Description Tag</label>
                      <textarea 
                        rows={2}
                        value={formOgDescription}
                        onChange={(e) => setFormOgDescription(e.target.value)}
                        placeholder="Custom Facebook/Twitter description summary highlight..."
                        className="w-full p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] text-neutral-450 uppercase mb-1 font-mono">OG Asset Image URL</label>
                      <input 
                        type="text" 
                        value={formOgImage}
                        onChange={(e) => setFormOgImage(e.target.value)}
                        placeholder="https://images.unsplash.com/promo-art.png"
                        className="w-full h-10 px-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs"
                      />
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* BUTTON TRAIL */}
            <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-[10px] font-mono text-neutral-500 tracking-wider">
                * Required database fields
              </span>
              <div className="flex items-center gap-3 self-end sm:self-auto">
                <Button 
                  type="button" 
                  onClick={() => setIsFormOpen(false)}
                  variant="outline"
                  className="border-neutral-800 hover:border-neutral-700 text-neutral-300 h-10 px-6 rounded-xl"
                >
                  Dismiss Editor
                </Button>
                <Button 
                  type="submit"
                  className="bg-[#C5A059] hover:bg-[#D4B26F] text-black font-semibold h-10 px-8 rounded-xl flex items-center gap-2"
                >
                  <Save size={15} /> {editingReview ? 'Apply Changes' : 'Publish Article'}
                </Button>
              </div>
            </div>
          </form>
        </motion.div>
      )}

      {/* SEARCH AND FILTER SEGMENTS */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-neutral-900/40 p-4 rounded-2xl border border-white/5">
        <div className="md:col-span-5 relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reviews by name, excerpts or title..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-600 text-xs focus:ring-1 focus:ring-[#C5A059] focus:outline-none focus:border-[#C5A059]"
          />
        </div>

        <div className="md:col-span-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full h-10 px-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="real-estate">Real Estate</option>
            <option value="finance">Finance</option>
            <option value="tech">Technology</option>
            <option value="learning">Learning</option>
          </select>
        </div>

        <div className="md:col-span-4 flex items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full h-10 px-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
          >
            <option value="all">All Moderation Statuses</option>
            <option value="draft">Drafts ({counts.draft})</option>
            <option value="pending">Pending Admin ({counts.pending})</option>
            <option value="approved">Approved ({counts.approved})</option>
            <option value="rejected">Rejected ({counts.rejected})</option>
            <option value="published">Published ({counts.published})</option>
            <option value="unpublished">Unpublished ({counts.unpublished})</option>
          </select>
          {reviews.length > 0 && (
            <div className="text-[10px] font-mono whitespace-nowrap bg-neutral-950 border border-neutral-800 px-3 h-10 flex items-center justify-center rounded-xl text-neutral-400">
              Total: {counts.all}
            </div>
          )}
        </div>
      </div>

      {/* CONDITIONAL PREVIEW AREA OVERLAY */}
      {previewReview && (
        <div className="p-8 rounded-2xl bg-neutral-950 border border-[#C5A059]/30 relative text-left">
          <button 
            onClick={() => setPreviewReview(null)}
            className="absolute top-4 right-4 text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <X size={12} /> Clear Preview
          </button>
          <div className="mb-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#C5A059]/10 border border-[#C5A059]/30 text-[9px] text-[#C5A059] font-mono uppercase tracking-wider">
            <Eye size={10} /> Active Article Preview Simulation
          </div>
          
          <h2 className="text-xl sm:text-2xl font-serif text-white tracking-tight leading-snug">{previewReview.title}</h2>
          <div className="flex flex-wrap items-center gap-4 text-[11px] text-neutral-400 font-mono mt-3.5 border-b border-white/5 pb-4">
            <span className="uppercase text-[#C5A059]">{previewReview.category}</span>
            <span>•</span>
            <span>{previewReview.publishDate}</span>
            <span>•</span>
            <span>{previewReview.readingTime}</span>
            <span>•</span>
            <span className="bg-neutral-900 text-neutral-300 font-bold px-2 py-0.5 rounded border border-neutral-800 text-[10px] flex items-center gap-1">
              <Star size={10} className="fill-[#C5A059] text-[#C5A059]" /> {previewReview.rating} Rating
            </span>
          </div>

          <div className="mt-6 space-y-6 max-w-3xl">
            <div>
              <h4 className="text-[11px] font-mono text-neutral-500 uppercase tracking-widest font-bold">Introduction</h4>
              <p className="text-xs text-neutral-300 leading-relaxed mt-1 font-light">{previewReview.introduction}</p>
            </div>
            <div>
              <h4 className="text-[11px] font-mono text-neutral-500 uppercase tracking-widest font-bold">What is {previewReview.brandName}?</h4>
              <p className="text-xs text-neutral-300 leading-relaxed mt-1 font-light">{previewReview.whatIsIt}</p>
            </div>

            {previewReview.keyFeatures && previewReview.keyFeatures.length > 0 && (
              <div>
                <h4 className="text-[11px] font-mono text-neutral-500 uppercase tracking-widest font-bold">Key Architectural Features</h4>
                <ul className="mt-2 space-y-1.5">
                  {previewReview.keyFeatures.map((f, i) => (
                    <li key={i} className="text-xs text-neutral-400 flex items-start gap-2">
                      <ChevronRight size={12} className="text-[#C5A059] mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Pros and Cons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block font-bold">Pros</span>
                <ul className="space-y-1.5">
                  {previewReview.pros && previewReview.pros.map((p, i) => (
                    <li key={i} className="text-xs text-neutral-300 flex items-start gap-2 bg-emerald-950/15 p-2 rounded-lg border border-emerald-900/10">
                      <Check size={12} className="text-emerald-400 mt-0.5 shrink-0" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest block font-bold">Cons</span>
                <ul className="space-y-1.5">
                  {previewReview.cons && previewReview.cons.map((c, i) => (
                    <li key={i} className="text-xs text-neutral-400 flex items-start gap-2 bg-red-950/10 p-2 rounded-lg border border-red-900/10">
                      <X size={12} className="text-red-400 mt-0.5 shrink-0" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* SPONSORED DISCLOSURE IN PREVIEW SCREEN */}
            {previewReview.sponsoredDisclosure && (
              <div className="p-4 rounded-xl bg-[#141419] border border-white/5 text-[10px] text-neutral-450 leading-relaxed flex items-start gap-2.5">
                <span className="px-2 py-0.5 bg-[#C5A059]/10 border border-[#C5A059]/20 text-[8px] font-mono tracking-wider uppercase text-[#C5A059] rounded font-semibold shrink-0">
                  Sponsored Disclosure
                </span>
                <span>
                  This review contains certified partner affiliate links. If you click through and register/transact, we may receive financial support. All reviews remain highly independent under our standard editorial guidelines.
                </span>
              </div>
            )}

            {/* Affiliate CTA */}
            <div className="bg-[#141419] p-6 rounded-2xl border border-[#C5A059]/20 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 text-left">
                <div className="h-12 w-12 rounded-xl bg-[#C5A059]/10 border border-[#C5A059]/30 flex items-center justify-center text-xl font-bold text-[#C5A059]">
                  {previewReview.brandLogoLetter || previewReview.brandName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{previewReview.brandName}</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">{previewReview.ctaSummary || 'Premium verified recommendation.'}</p>
                </div>
              </div>
              <a 
                href={previewReview.affiliateUrl}
                target={previewReview.externalLink !== false ? "_blank" : "_self"}
                rel={previewReview.externalLink !== false ? "nofollow sponsored noopener" : undefined}
                className={`text-xs font-bold px-6 py-3 rounded-xl flex items-center gap-1.5 transition-all w-full md:w-auto justify-center cursor-pointer ${
                  previewReview.ctaButtonStyle === 'outline-gold'
                    ? 'border border-[#C5A059] text-[#C5A059] hover:bg-[#C5A059]/10 bg-transparent'
                    : previewReview.ctaButtonStyle === 'minimal-border'
                    ? 'border border-white/10 text-neutral-300 hover:text-white hover:border-[#C5A059] bg-transparent'
                    : previewReview.ctaButtonStyle === 'solid-emerald'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-[#C5A059] hover:bg-[#D4B26F] text-black shadow-[0_4px_16px_rgba(197,160,89,0.15)]'
                }`}
              >
                {previewReview.ctaButtonText || 'Visit Official Website'} <ExternalLink size={13} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* CORE REVIEWS LIST DIRECTORY TABLE */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-8 w-8 rounded-full border-2 border-[#C5A059] border-t-transparent animate-spin mb-4" />
          <p className="text-xs text-neutral-500 font-mono">Syncing reviews archive...</p>
        </div>
      ) : filteredAndSorted.length === 0 ? (
        <div className="py-24 text-center space-y-4 border border-white/5 rounded-2xl bg-neutral-900/20">
          <div className="p-3 bg-neutral-900 inline-block rounded-2xl border border-white/5">
            <SlidersHorizontal size={26} className="text-neutral-600 block" />
          </div>
          <h3 className="text-white text-base font-serif">No reviews matched selected indexes</h3>
          <p className="text-neutral-500 text-xs max-w-sm mx-auto">
            Try adjusting your search phrases, picking another categories filters or changing status tags.
          </p>
          {reviews.length === 0 && (
            <button
              onClick={handleOpenCreateForm}
              className="text-[#C5A059] hover:underline text-xs font-semibold cursor-pointer"
            >
              Write your very first review profile now
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-neutral-400 text-[10px] uppercase tracking-wider font-mono">
                <th className="py-3.5 px-4">Brand Asset</th>
                <th className="py-3.5 px-4">Review Headline & Path</th>
                <th className="py-3.5 px-4 text-center">Score</th>
                <th className="py-3.5 px-4 text-center">Reading Time</th>
                <th className="py-3.5 px-4">Monetized CTA Destination</th>
                <th className="py-3.5 px-4 text-center">Moderation Workflow</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredAndSorted.map((rev) => {
                
                // Color badges depending on moderation status
                let statusBadge = (
                  <span className="px-2.5 py-1 rounded-full bg-neutral-950 border border-neutral-800 text-neutral-450 font-mono text-[9px] uppercase font-bold">
                    Draft
                  </span>
                );
                
                if (rev.status === 'published') {
                  statusBadge = (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-950/30 border border-emerald-900/40 text-emerald-400 font-mono text-[9px] uppercase font-bold flex items-center gap-1 justify-center max-w-[100px] mx-auto">
                      <CheckCircle2 size={10} /> Active
                    </span>
                  );
                } else if (rev.status === 'pending') {
                  statusBadge = (
                    <span className="px-2.5 py-1 rounded-full bg-amber-950/20 border border-amber-900/30 text-amber-500 font-mono text-[9px] uppercase font-bold flex items-center gap-1 justify-center max-w-[100px] mx-auto animate-pulse">
                      Pending
                    </span>
                  );
                } else if (rev.status === 'approved') {
                  statusBadge = (
                    <span className="px-2.5 py-1 rounded-full bg-[#C5A059]/10 border border-[#C5A059]/30 text-[#C5A059] font-mono text-[9px] uppercase font-bold flex items-center gap-1 justify-center max-w-[100px] mx-auto">
                      Approved
                    </span>
                  );
                } else if (rev.status === 'rejected') {
                  statusBadge = (
                    <span className="px-2.5 py-1 rounded-full bg-red-950/10 border border-red-900/30 text-red-400 font-mono text-[9px] uppercase font-bold flex items-center gap-1 justify-center max-w-[100px] mx-auto">
                      <XCircle size={10} /> Rejected
                    </span>
                  );
                } else if (rev.status === 'unpublished') {
                  statusBadge = (
                    <span className="px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-500 font-mono text-[9px] uppercase font-bold flex items-center gap-1 justify-center max-w-[100px] mx-auto">
                      Hidden
                    </span>
                  );
                }

                return (
                  <tr key={rev.id} className="hover:bg-white/[0.01] transition-all group">
                    {/* Brand Identifier */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-neutral-900/80 border border-neutral-800 group-hover:border-neutral-700 transition-colors flex items-center justify-center text-sm font-bold text-[#C5A059]">
                          {rev.brandLogoLetter || rev.brandName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-white text-xs">{rev.brandName}</p>
                          <span className="text-[10px] text-neutral-500 uppercase font-mono tracking-wider">{rev.category}</span>
                        </div>
                      </div>
                    </td>

                    {/* Headline and Short link */}
                    <td className="py-4 px-4 max-w-xs">
                      <h4 className="font-medium text-white truncate hover:text-[#C5A059] transition-colors line-clamp-1">{rev.title}</h4>
                      <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 mt-1 font-mono">
                        <Globe size={10} />
                        <span className="truncate">/network/{rev.slug}</span>
                      </div>
                    </td>

                    {/* Score */}
                    <td className="py-4 px-4 text-center whitespace-nowrap font-mono font-bold text-neutral-300">
                      <div className="flex items-center justify-center gap-1 text-[#C5A059]">
                        <Star size={12} className="fill-[#C5A059] text-[#C5A059]" />
                        <span>{rev.rating}</span>
                      </div>
                    </td>

                    {/* Reading duration */}
                    <td className="py-4 px-4 text-center whitespace-nowrap font-mono text-neutral-400">
                      {rev.readingTime}
                    </td>

                    {/* Affiliate URL destination */}
                    <td className="py-4 px-4 max-w-[150px] truncate">
                      {rev.affiliateUrl ? (
                        <a 
                          href={rev.affiliateUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-[#C5A059] hover:underline flex items-center gap-1 text-[11px] font-mono justify-start"
                        >
                          Link details <ExternalLink size={10} />
                        </a>
                      ) : (
                        <span className="text-neutral-700 italic">No link</span>
                      )}
                    </td>

                    {/* Workflow status */}
                    <td className="py-4 px-4 text-center">
                      {statusBadge}
                    </td>

                    {/* ACTIONS */}
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2.5">
                        
                        {/* Status moderation fast actions */}
                        <div className="flex items-center bg-neutral-950 border border-neutral-900 rounded-lg p-0.5">
                          {rev.status !== 'pending' && rev.status !== 'approved' && rev.status !== 'published' && (
                            <button
                              onClick={() => handleUpdateStatus(rev.id, 'pending')}
                              className="p-1 text-[9px] text-amber-500 underline uppercase tracking-tight hover:bg-neutral-900 rounded cursor-pointer"
                              title="Submit for clearance"
                            >
                              Submit
                            </button>
                          )}
                          {rev.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(rev.id, 'approved')}
                                className="p-1 px-1.5 text-[9px] bg-[#C5A059]/10 text-[#C5A059] hover:bg-[#C5A059] hover:text-black font-semibold rounded cursor-pointer"
                                title="Approve Manuscript"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(rev.id, 'rejected')}
                                className="p-1 px-1.5 text-[9px] text-red-400 hover:bg-red-950/20 rounded ml-1 cursor-pointer"
                                title="Reject Manuscript"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {rev.status === 'approved' && (
                            <button
                              onClick={() => handleUpdateStatus(rev.id, 'published')}
                              className="p-1 px-2 text-[9px] bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded cursor-pointer flex items-center gap-0.5"
                              title="Publish Live Online"
                            >
                              <Play size={8} /> Publish
                            </button>
                          )}
                          {rev.status === 'published' && (
                            <button
                              onClick={() => handleUpdateStatus(rev.id, 'unpublished')}
                              className="p-1 text-[9px] text-neutral-400 hover:text-white rounded cursor-pointer"
                              title="Set status to unpublished"
                            >
                              Unpublish
                            </button>
                          )}
                          {rev.status === 'unpublished' && (
                            <button
                              onClick={() => handleUpdateStatus(rev.id, 'published')}
                              className="p-1 text-[9px] text-[#C5A059] hover:underline rounded cursor-pointer"
                              title="Republish Live"
                            >
                              Republish
                            </button>
                          )}
                          {rev.status === 'rejected' && (
                            <button
                              onClick={() => handleUpdateStatus(rev.id, 'pending')}
                              className="p-1 text-[9px] text-neutral-400 hover:underline rounded cursor-pointer"
                              title="Submit Again for review"
                            >
                              Edit & Try Again
                            </button>
                          )}
                        </div>

                        {/* Standard actions */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setPreviewReview(rev)}
                            className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white transition-all cursor-pointer"
                            title="Simulate Mobile & Desktop Article"
                          >
                            <Eye size={12} />
                          </button>
                          <button
                            onClick={() => handleOpenEditForm(rev)}
                            className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-[#C5A059]/20 text-[#C5A059] hover:text-[#D4B26F] transition-all cursor-pointer"
                            title="Edit Review Attributes"
                          >
                            <Edit3 size={12} />
                          </button>
                          <button
                            onClick={() => handleDuplicateReview(rev)}
                            className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-blue-900/40 text-blue-400 hover:text-blue-300 transition-all cursor-pointer"
                            title="Duplicate Manuscript (As Draft)"
                          >
                            <Copy size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteReview(rev.id)}
                            className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-red-900/30 text-neutral-500 hover:text-red-400 transition-all cursor-pointer"
                            title="Purge Review File"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>

                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
