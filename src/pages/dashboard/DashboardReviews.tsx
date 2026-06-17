import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Copy,
  Lock,
  AlertOctagon,
  ArrowRight,
  RefreshCw,
  Globe,
  Undo2,
  BarChart4
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  reviewService, 
  EditorialReview, 
  CTAButton, 
  Banner, 
  GalleryItem, 
  FAQItem, 
  ComparisonRow, 
  ComparisonTable 
} from '@/services/reviewService';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/userService';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';

export default function DashboardReviews() {
  const navigate = useNavigate();
  const { profile, user: authUser } = useAuth();
  
  // Authenticated administrators protection state
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Reviews state
  const [reviews, setReviews] = useState<EditorialReview[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  // Editorial panel toggles
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
  
  // Future Affiliate Analytics states
  const [formViews, setFormViews] = useState<number>(0);
  const [formClicks, setFormClicks] = useState<number>(0);
  const [formRevenueNotes, setFormRevenueNotes] = useState<string>('');
  const [formLastUpdatedTimestamp, setFormLastUpdatedTimestamp] = useState<string>('');

  // Professional publisher extension options
  const [formCtaButtons, setFormCtaButtons] = useState<CTAButton[]>([]);
  
  const [formTopBannerEnabled, setFormTopBannerEnabled] = useState(false);
  const [formTopBannerImageUrl, setFormTopBannerImageUrl] = useState('');
  const [formTopBannerDestinationUrl, setFormTopBannerDestinationUrl] = useState('');
  const [formTopBannerAltText, setFormTopBannerAltText] = useState('');
  const [formTopBannerClicks, setFormTopBannerClicks] = useState(0);

  const [formInlineBannerEnabled, setFormInlineBannerEnabled] = useState(false);
  const [formInlineBannerImageUrl, setFormInlineBannerImageUrl] = useState('');
  const [formInlineBannerDestinationUrl, setFormInlineBannerDestinationUrl] = useState('');
  const [formInlineBannerAltText, setFormInlineBannerAltText] = useState('');
  const [formInlineBannerClicks, setFormInlineBannerClicks] = useState(0);

  const [formBottomBannerEnabled, setFormBottomBannerEnabled] = useState(false);
  const [formBottomBannerImageUrl, setFormBottomBannerImageUrl] = useState('');
  const [formBottomBannerDestinationUrl, setFormBottomBannerDestinationUrl] = useState('');
  const [formBottomBannerAltText, setFormBottomBannerAltText] = useState('');
  const [formBottomBannerClicks, setFormBottomBannerClicks] = useState(0);

  const [formGallery, setFormGallery] = useState<GalleryItem[]>([]);
  const [formFaqs, setFormFaqs] = useState<FAQItem[]>([]);

  const [formCompareEnabled, setFormCompareEnabled] = useState(false);
  const [formCompareCompetitorName, setFormCompareCompetitorName] = useState('');
  const [formCompareRows, setFormCompareRows] = useState<ComparisonRow[]>([]);
  
  const [formReviewerName, setFormReviewerName] = useState('');
  const [formReviewerAvatar, setFormReviewerAvatar] = useState('');
  const [formReviewMethodology, setFormReviewMethodology] = useState('');
  const [formLastUpdatedDate, setFormLastUpdatedDate] = useState('');
  const [formRelatedReviewIds, setFormRelatedReviewIds] = useState<string[]>([]);

  const [formEnableGlobalDisclosure, setFormEnableGlobalDisclosure] = useState(true);
  const [formCustomDisclosureText, setFormCustomDisclosureText] = useState('');
  const [formEnableStickyCta, setFormEnableStickyCta] = useState(true);
  const [formStickyCtaButtonIndex, setFormStickyCtaButtonIndex] = useState(0);

  const [activeFormTab, setActiveFormTab] = useState<'basic' | 'campaign' | 'editorial' | 'interactive' | 'seo' | 'trust' | 'analytics' | 'publishing'>('basic');

  // Load reviews from repository
  const loadReviews = useCallback(async () => {
    setLoading(true);
    try {
      const data = await reviewService.getAllReviews(false);
      setReviews(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to retrieve editorial ledger');
    } finally {
      setLoading(false);
      setAuthLoading(false);
    }
  }, []);

  // Sync Admin status from Profile context
  useEffect(() => {
    if (profile) {
      const isAdm = 
        authUser?.email?.toLowerCase().trim() === 'towinnow0@gmail.com' ||
        profile.role === 'admin';
      
      setIsAdmin(isAdm);
      setAuthLoading(false);
      
      if (isAdm) {
        loadReviews();
      }
    } else if (authUser === null) {
      setIsAdmin(false);
      setAuthLoading(false);
    }
  }, [profile, authUser, loadReviews]);

  // Sync title to slug automatically for brand new reviews
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

  // Synchronics automation: Automate Brand Logo Letter from Brand Name
  useEffect(() => {
    if (formBrandName.trim()) {
      setFormBrandLogoLetter(formBrandName.trim().charAt(0).toUpperCase());
    } else {
      setFormBrandLogoLetter('A');
    }
  }, [formBrandName]);

  // Synchronics automation: Automatically calculate Reading Time from content length
  useEffect(() => {
    const textToAnalyze = [
      formTitle,
      formBrandName,
      formExcerpt,
      formIntroduction,
      formWhatIsIt,
      formKeyFeatures,
      formPros,
      formCons,
      formBestFor,
      formPricingOverview,
      formFinalVerdict
    ].join(' ');
    const wordCount = textToAnalyze.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(wordCount / 200));
    setFormReadingTime(`${minutes} min read`);
  }, [
    formTitle,
    formBrandName,
    formExcerpt,
    formIntroduction,
    formWhatIsIt,
    formKeyFeatures,
    formPros,
    formCons,
    formBestFor,
    formPricingOverview,
    formFinalVerdict
  ]);

  // Synchronics automation: Open Graph Image uses Featured Image
  useEffect(() => {
    setFormOgImage(formFeaturedImage.trim());
  }, [formFeaturedImage]);

  // Handle unique slug negotiation
  const handleRegenerateSlug = async () => {
    if (!formTitle) return;
    const clean = await reviewService.ensureUniqueSlug(formTitle, editingReview?.id);
    setFormSlug(clean);
    toast.success('Clean structural URL slug negotiated');
  };

  // Action: Create New Review Setup
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
    setFormBrandLogoLetter('B');
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
    
    // Future Affiliate Analytics init
    setFormViews(0);
    setFormClicks(0);
    setFormRevenueNotes('');
    setFormLastUpdatedTimestamp(new Date().toISOString());

    // Reset advanced publisher states
    setFormCtaButtons([]);
    setFormTopBannerEnabled(false);
    setFormTopBannerImageUrl('');
    setFormTopBannerDestinationUrl('');
    setFormTopBannerAltText('');
    setFormTopBannerClicks(0);
    setFormInlineBannerEnabled(false);
    setFormInlineBannerImageUrl('');
    setFormInlineBannerDestinationUrl('');
    setFormInlineBannerAltText('');
    setFormInlineBannerClicks(0);
    setFormBottomBannerEnabled(false);
    setFormBottomBannerImageUrl('');
    setFormBottomBannerDestinationUrl('');
    setFormBottomBannerAltText('');
    setFormBottomBannerClicks(0);
    setFormGallery([]);
    setFormFaqs([]);
    setFormCompareEnabled(false);
    setFormCompareCompetitorName('');
    setFormCompareRows([]);
    setFormReviewerName('AmaanEstate Editorial Board');
    setFormReviewerAvatar('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop');
    setFormReviewMethodology('This product or service was systematically audited against 7 core operational standards, focusing on regulatory alignment, escrow security controls, and client success ratings.');
    setFormLastUpdatedDate(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
    setFormRelatedReviewIds([]);
    setFormEnableGlobalDisclosure(true);
    setFormCustomDisclosureText('');
    setFormEnableStickyCta(true);
    setFormStickyCtaButtonIndex(0);

    setActiveFormTab('basic');
    setIsFormOpen(true);
    setPreviewReview(null);
  };

  // Action: Edit Review Form Setup
  const handleOpenEditForm = (rev: EditorialReview) => {
    setEditingReview(rev);
    setFormTitle(rev.title);
    setFormSlug(rev.slug);
    setFormCategory(rev.category);
    setFormFeaturedImage(rev.featuredImage || '');
    setFormExcerpt(rev.excerpt || '');
    setFormIntroduction(rev.introduction || '');
    setFormWhatIsIt(rev.whatIsIt || '');
    setFormKeyFeatures(rev.keyFeatures ? rev.keyFeatures.join('\n') : '');
    setFormPros(rev.pros ? rev.pros.join('\n') : '');
    setFormCons(rev.cons ? rev.cons.join('\n') : '');
    setFormBestFor(rev.bestFor || '');
    setFormPricingOverview(rev.pricingOverview || '');
    setFormFinalVerdict(rev.finalVerdict || '');
    setFormRating(rev.rating || 4.8);
    setFormReadingTime(rev.readingTime || '5 min read');
    setFormPublishDate(rev.publishDate || '');
    setFormBrandName(rev.brandName || '');
    setFormBrandLogoLetter(rev.brandLogoLetter || 'A');
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
    
    // Future Affiliate Analytics load
    setFormViews(rev.views || 0);
    setFormClicks(rev.clicks || 0);
    setFormRevenueNotes(rev.revenueNotes || '');
    setFormLastUpdatedTimestamp(rev.lastUpdatedTimestamp || new Date().toISOString());

    // Load premium publisher options
    setFormCtaButtons(rev.ctaButtons || []);
    setFormTopBannerEnabled(!!rev.topBanner?.enabled);
    setFormTopBannerImageUrl(rev.topBanner?.imageUrl || '');
    setFormTopBannerDestinationUrl(rev.topBanner?.destinationUrl || '');
    setFormTopBannerAltText(rev.topBanner?.altText || '');
    setFormTopBannerClicks(rev.topBanner?.clicks || 0);

    setFormInlineBannerEnabled(!!rev.inlineBanner?.enabled);
    setFormInlineBannerImageUrl(rev.inlineBanner?.imageUrl || '');
    setFormInlineBannerDestinationUrl(rev.inlineBanner?.destinationUrl || '');
    setFormInlineBannerAltText(rev.inlineBanner?.altText || '');
    setFormInlineBannerClicks(rev.inlineBanner?.clicks || 0);

    setFormBottomBannerEnabled(!!rev.bottomBanner?.enabled);
    setFormBottomBannerImageUrl(rev.bottomBanner?.imageUrl || '');
    setFormBottomBannerDestinationUrl(rev.bottomBanner?.destinationUrl || '');
    setFormBottomBannerAltText(rev.bottomBanner?.altText || '');
    setFormBottomBannerClicks(rev.bottomBanner?.clicks || 0);

    setFormGallery(rev.gallery || []);
    setFormFaqs(rev.faqs || []);
    
    setFormCompareEnabled(!!rev.comparisonTable?.enabled);
    setFormCompareCompetitorName(rev.comparisonTable?.competitorName || '');
    setFormCompareRows(rev.comparisonTable?.rows || []);

    setFormReviewerName(rev.reviewerName || 'AmaanEstate Editorial Board');
    setFormReviewerAvatar(rev.reviewerAvatar || '');
    setFormReviewMethodology(rev.reviewMethodology || '');
    setFormLastUpdatedDate(rev.lastUpdatedDate || '');
    setFormRelatedReviewIds(rev.relatedReviewIds || []);

    setFormEnableGlobalDisclosure(rev.enableGlobalDisclosure !== false);
    setFormCustomDisclosureText(rev.customDisclosureText || '');
    setFormEnableStickyCta(rev.enableStickyCta !== false);
    setFormStickyCtaButtonIndex(rev.stickyCtaButtonIndex || 0);

    setActiveFormTab('basic');
    setIsFormOpen(true);
    setPreviewReview(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Action: Duplicate review manuscript
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
      toast.success('Review duplicated as Draft');
      loadReviews();
    } catch (err) {
      console.error(err);
      toast.error('Failed to duplicate selected review');
    }
  };

  // Status moderation state actions (Approve, Reject, Publish, Unpublish)
  const handleUpdateStatus = async (id: string, nextStatus: EditorialReview['status']) => {
    try {
      await reviewService.updateStatus(id, nextStatus);
      toast.success(`Manuscript status marked as ${nextStatus.toUpperCase()}`);
      loadReviews();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update workflow status');
    }
  };

  // Action: Delete review manuscript
  const handleDeleteReview = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this editorial review? This action cannot be revoked.')) {
      return;
    }
    try {
      await reviewService.deleteReview(id);
      toast.success('Manuscript permanently deleted');
      loadReviews();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete review');
    }
  };

  // Save/Publish Editor contents
  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formSlug.trim() || !formBrandName.trim()) {
      toast.error('Review Title, Slug parameters, and Brand Name are required values.');
      return;
    }

    const cleanSlug = formSlug.toLowerCase().trim().replace(/[^a-z0-9-_]/g, '-');

    const payload: EditorialReview = {
      id: editingReview ? editingReview.id : cleanSlug,
      title: formTitle.trim(),
      slug: cleanSlug,
      category: formCategory,
      featuredImage: formFeaturedImage.trim() || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200&auto=format&fit=crop',
      excerpt: formExcerpt.trim(),
      introduction: formIntroduction.trim(),
      whatIsIt: formWhatIsIt.trim(),
      keyFeatures: formKeyFeatures.split('\n').map(s => s.trim()).filter(Boolean),
      pros: formPros.split('\n').map(s => s.trim()).filter(Boolean),
      cons: formCons.split('\n').map(s => s.trim()).filter(Boolean),
      bestFor: formBestFor.trim(),
      pricingOverview: formPricingOverview.trim() || undefined,
      finalVerdict: formFinalVerdict.trim(),
      rating: parseFloat(String(formRating)) || 4.8,
      readingTime: formReadingTime.trim() || '5 min read',
      publishDate: formPublishDate.trim() || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      brandName: formBrandName.trim(),
      brandLogoLetter: formBrandLogoLetter.trim() || formBrandName.charAt(0).toUpperCase() || 'A',
      affiliateUrl: formAffiliateUrl.trim(),
      ctaSummary: formCtaSummary.trim(),
      ctaButtonText: formCtaButtonText.trim(),
      ctaButtonStyle: formCtaButtonStyle,
      externalLink: formExternalLink,
      sponsoredDisclosure: formEnableGlobalDisclosure, // Unified with global compliance toggle
      seoTitle: formSeoTitle.trim() || `${formBrandName.trim()} Review & Insights`,
      metaDescription: formMetaDescription.trim() || `Detailed editorial review, scoring and features analysis of ${formBrandName.trim()}.`,
      ogTitle: formOgTitle.trim() || formSeoTitle.trim() || `${formBrandName.trim()} Review & Insights`,
      ogDescription: formMetaDescription.trim() || `Detailed editorial review, scoring and features analysis of ${formBrandName.trim()}.`,
      ogImage: formFeaturedImage.trim(), // Automatically paired with Featured Image
      status: formStatus,
      
      // Future Affiliate Analytics fields
      views: Number(formViews) || 0,
      clicks: Number(formClicks) || 0,
      ctr: Number(formViews) > 0 ? Number(((formClicks / formViews) * 100).toFixed(2)) : 0,
      revenueNotes: formRevenueNotes.trim(),
      lastUpdatedTimestamp: new Date().toISOString(),

      // Save professional publisher properties
      ctaButtons: formCtaButtons,
      topBanner: {
        enabled: formTopBannerEnabled,
        imageUrl: formTopBannerImageUrl.trim(),
        destinationUrl: formTopBannerDestinationUrl.trim(),
        altText: formTopBannerAltText.trim(),
        clicks: formTopBannerClicks
      },
      inlineBanner: {
        enabled: formInlineBannerEnabled,
        imageUrl: formInlineBannerImageUrl.trim(),
        destinationUrl: formInlineBannerDestinationUrl.trim(),
        altText: formInlineBannerAltText.trim(),
        clicks: formInlineBannerClicks
      },
      bottomBanner: {
        enabled: formBottomBannerEnabled,
        imageUrl: formBottomBannerImageUrl.trim(),
        destinationUrl: formBottomBannerDestinationUrl.trim(),
        altText: formBottomBannerAltText.trim(),
        clicks: formBottomBannerClicks
      },
      gallery: formGallery,
      faqs: formFaqs,
      comparisonTable: {
        enabled: formCompareEnabled,
        competitorName: formCompareCompetitorName.trim(),
        rows: formCompareRows
      },
      reviewerName: formReviewerName.trim() || 'AmaanEstate Editorial Board',
      reviewerAvatar: formReviewerAvatar.trim(),
      reviewMethodology: formReviewMethodology.trim(),
      lastUpdatedDate: formLastUpdatedDate.trim() || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      relatedReviewIds: formRelatedReviewIds,
      enableGlobalDisclosure: formEnableGlobalDisclosure,
      customDisclosureText: '', // Cleared completely to inherit unified compliance disclosure automatically
      enableStickyCta: formEnableStickyCta,
      stickyCtaButtonIndex: Number(formStickyCtaButtonIndex) || 0,
      bannerClicks: editingReview?.bannerClicks || { top: formTopBannerClicks, inline: formInlineBannerClicks, bottom: formBottomBannerClicks }
    };

    try {
      if (editingReview) {
        await reviewService.updateReview(editingReview.id, payload);
        toast.success('Editorial review updated successfully');
      } else {
        const dup = reviews.some(r => r.slug === cleanSlug);
        if (dup) {
          toast.error('A review with this exact slug coordinates already exists.');
          return;
        }
        await reviewService.createReview(payload);
        console.log('DEBUG: Payload created:', payload);
        toast.success('New review profile registered and saved');
      }
      setIsFormOpen(false);
      loadReviews();
    } catch (err) {
      console.error(err);
      console.log('DEBUG: Payload failed:', payload);
      toast.error('Database write exception occurred');
    }
  };

  // Computed dashboard widgets
  const stats = useMemo(() => {
    let total = reviews.length;
    let drafts = reviews.filter(r => r.status === 'draft').length;
    let pending = reviews.filter(r => r.status === 'pending').length;
    let approved = reviews.filter(r => r.status === 'approved').length;
    let rejected = reviews.filter(r => r.status === 'rejected').length;
    let archived = reviews.filter(r => r.status === 'archived').length;

    return { total, drafts, pending, approved, rejected, archived };
  }, [reviews]);

  // Compute filtered grid ledger
  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      const matchesSearch = 
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        r.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.slug.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || r.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || r.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [reviews, searchQuery, selectedCategory, selectedStatus]);

  // Loading Shield Screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/40">Verifying Clearance Desk...</p>
      </div>
    );
  }

  // Denied Access Shield Screen
  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex flex-col items-center justify-center text-center p-6 space-y-6">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 border border-red-500/20">
          <AlertOctagon size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-serif font-bold text-white tracking-wide">Access Restricted</h2>
          <p className="text-neutral-400 max-w-md mx-auto text-sm font-light leading-relaxed">
            This workspace contains sensitive regulatory and fiscal disclosure matrices. Only authenticated AmaanEstate Administrators possess execution access.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={() => navigate('/login')} className="bg-[#C5A059] hover:bg-[#D4B26F] text-black font-semibold">
            Log In as Administrator
          </Button>
          <Button onClick={() => navigate('/ecosystem')} className="bg-[#111116] hover:bg-white/5 text-neutral-300 border border-white/5">
            Return to Ecosystem
          </Button>
          <Button onClick={() => navigate('/dashboard')} className="bg-white/5 hover:bg-white/10 text-white border border-white/10">
            Return to Hub Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-6 lg:p-10 font-sans space-y-10">
      
      {/* Editorial Dashboard view */}
      {!isFormOpen && !previewReview && (
        <div className="space-y-10 max-w-7xl mx-auto animate-fade-in">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#C5A059] text-[10px] uppercase font-bold tracking-[0.3em] font-mono">
                <ShieldCheck size={14} className="text-[#C5A059]" />
                <span>Authorized Admin Console</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-serif font-bold text-white tracking-wide">
                Affiliate Review CMS
              </h1>
              <p className="text-neutral-400 text-sm font-light max-w-2xl leading-relaxed">
                Publishing desk for strategic, fully disclosure-compliant product reviews. Standard users see the network page as empty until real reviews are manually pushed live here.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => navigate('/dashboard')}
                className="bg-transparent hover:bg-white/5 border border-white/10 text-neutral-300 hover:text-white px-5 rounded-xl text-xs uppercase tracking-wider font-bold h-11"
              >
                <Undo2 size={14} className="mr-2" /> Hub Dashboard
              </Button>
              <Button
                onClick={handleOpenCreateForm}
                className="bg-[#C5A059] hover:bg-[#D4AF37] text-black font-bold uppercase tracking-wider text-xs px-5 rounded-xl transition-all shadow-lg shadow-[#C5A059]/10 h-11 cursor-pointer"
              >
                <Plus size={16} className="mr-1.5 stroke-[3px]" /> Create New Review
              </Button>
            </div>
          </div>

          {/* WIDGETS PANEL */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            
            <div className="bg-[#111116] border border-white/5 p-5 rounded-2xl flex flex-col justify-between">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Total Reviews</span>
              {loading ? (
                <div className="h-6 w-12 bg-white/5 rounded animate-pulse mt-2" />
              ) : (
                <span className="text-2xl font-semibold mt-2 text-white">{stats.total}</span>
              )}
            </div>

            <div className="bg-[#111116] border border-white/5 p-5 rounded-2xl flex flex-col justify-between border-l-4 border-l-neutral-600">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Drafts</span>
              {loading ? (
                <div className="h-6 w-12 bg-white/5 rounded animate-pulse mt-2" />
              ) : (
                <span className="text-2xl font-semibold mt-2 text-neutral-400">{stats.drafts}</span>
              )}
            </div>

            <div className="bg-[#111116] border border-white/5 p-5 rounded-2xl flex flex-col justify-between border-l-4 border-l-amber-500">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Pending</span>
              {loading ? (
                <div className="h-6 w-12 bg-white/5 rounded animate-pulse mt-2" />
              ) : (
                <span className="text-2xl font-semibold mt-2 text-amber-500">{stats.pending}</span>
              )}
            </div>

            <div className="bg-[#111116] border border-white/5 p-5 rounded-2xl flex flex-col justify-between border-l-4 border-l-emerald-500">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Approved</span>
              {loading ? (
                <div className="h-6 w-12 bg-white/5 rounded animate-pulse mt-2" />
              ) : (
                <span className="text-2xl font-semibold mt-2 text-emerald-500">{stats.approved}</span>
              )}
            </div>

            <div className="bg-[#111116] border border-white/5 p-5 rounded-2xl flex flex-col justify-between border-l-4 border-l-red-500">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Rejected</span>
              {loading ? (
                <div className="h-6 w-12 bg-white/5 rounded animate-pulse mt-2" />
              ) : (
                <span className="text-2xl font-semibold mt-2 text-red-500">{stats.rejected}</span>
              )}
            </div>

            <div className="bg-[#111116] border border-white/5 p-5 rounded-2xl flex flex-col justify-between border-l-4 border-l-neutral-700">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Archived</span>
              {loading ? (
                <div className="h-6 w-12 bg-white/5 rounded animate-pulse mt-2" />
              ) : (
                <span className="text-2xl font-semibold mt-2 text-neutral-500">{stats.archived}</span>
              )}
            </div>

          </div>

          {/* FILTERS TOOLBAR */}
          <div className="bg-[#111116] border border-white/5 p-4 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                placeholder="Search reviews by brand title or slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-black/40 border border-white/5 focus:border-[#C5A059] focus:outline-none text-xs rounded-xl transition-all placeholder:text-neutral-600"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              
              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Category:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-black/60 border border-white/5 text-neutral-300 text-xs px-3 py-2 rounded-xl focus:border-[#C5A059] focus:outline-none"
                >
                  <option value="all">All Specialties</option>
                  <option value="real-estate">Real Estate Partners</option>
                  <option value="finance">Finance Partners</option>
                  <option value="tech">Technology Partners</option>
                  <option value="market">Market Partners</option>
                  <option value="learning">Executive Development (Legacy)</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Workflow Status:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-black/60 border border-white/5 text-neutral-300 text-xs px-3 py-2 rounded-xl focus:border-[#C5A059] focus:outline-none"
                >
                  <option value="all">All States</option>
                  <option value="draft">Drafts</option>
                  <option value="pending">Pending Clearance</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

            </div>

          </div>

          {/* LEDGER GRID LIST */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(n => (
                <div key={n} className="h-20 w-full bg-[#111116] rounded-2xl animate-pulse border border-white/5" />
              ))}
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="bg-[#111116] border border-white/10 p-16 rounded-3xl text-center space-y-4">
              <FileText size={48} className="mx-auto text-neutral-600 animate-pulse" />
              <div>
                <h3 className="text-lg font-serif font-semibold">No Affiliate Reviews Registered</h3>
                <p className="text-xs text-neutral-400 font-light mt-1">
                  Start mapping out an affiliate or partner brand review. It will remain strictly invisible on the public network page until you set it to Published.
                </p>
              </div>
              <Button onClick={handleOpenCreateForm} className="bg-[#C5A059] hover:bg-[#D4AF37] text-black font-semibold text-xs px-4 py-2 rounded-xl">
                Create First Review
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-white/5">
              <table className="w-full text-left border-collapse bg-[#111116]">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] font-mono uppercase text-neutral-500 bg-black/20">
                    <th className="py-4 px-5">Brand & Core Title</th>
                    <th className="py-4 px-4">Specialty</th>
                    <th className="py-4 px-4 text-center">Score</th>
                    <th className="py-4 px-4">Outbound Gateway Target</th>
                    <th className="py-4 px-4 text-center">Workflow</th>
                    <th className="py-4 px-5 text-right">Execution Terminal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs font-light">
                  {['draft', 'pending', 'approved', 'rejected', 'archived']
                    .filter(status => selectedStatus === 'all' || selectedStatus === status)
                    .map(status => {
                      const reviewsInGroup = filteredReviews.filter(r => r.status === status);
                      if (reviewsInGroup.length === 0) return null;

                      return (
                        <React.Fragment key={status}>
                          <tr className="bg-white/[0.03] border-y border-white/5">
                            <td colSpan={6} className="py-2 px-5 text-[9px] font-mono font-bold text-[#C5A059] uppercase tracking-widest flex items-center gap-2">
                              {status === 'pending' && <Clock size={10} />}
                              {status === 'approved' && <Check size={10} />}
                              {status === 'rejected' && <X size={10} />}
                              {status === 'archived' && <Lock size={10} />}
                              {status === 'draft' && <FileText size={10} />}
                              {status.replace('-', ' ')} <span className="text-neutral-500 font-normal">({reviewsInGroup.length})</span>
                            </td>
                          </tr>

                          {reviewsInGroup.map((rev) => {
                            let badgeClass = 'bg-neutral-800 text-neutral-400';
                            if (rev.status === 'pending') badgeClass = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
                            if (rev.status === 'approved') badgeClass = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
                            if (rev.status === 'rejected') badgeClass = 'bg-red-500/10 text-red-500 border border-red-500/20';
                            if (rev.status === 'archived') badgeClass = 'bg-neutral-800 text-neutral-500 border border-neutral-700/30';
                            if (rev.status === 'draft') badgeClass = 'bg-neutral-900 text-neutral-500 border border-white/5';

                            return (
                              <tr key={rev.id} className="hover:bg-white/[0.02] transition-colors group">
                                
                                {/* Title and metadata */}
                                <td className="py-4 px-5">
                                  <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 bg-neutral-900 border border-white/10 rounded-lg flex items-center justify-center text-xs font-serif font-bold text-[#C5A059]">
                                      {rev.brandLogoLetter || rev.brandName.charAt(0)}
                                    </div>
                                    <div>
                                      <h4 className="font-serif font-semibold text-white tracking-tight group-hover:text-[#C5A059] transition-colors leading-tight">
                                        {rev.title}
                                      </h4>
                                      <p className="text-[10px] font-mono text-neutral-400 mt-0.5 max-w-sm shrink leading-tight line-clamp-1">
                                        URL Handle: <span className="text-[#C5A059] font-semibold">{rev.slug}</span>
                                      </p>
                                      <div className="flex items-center gap-2.5 text-[9px] font-mono text-neutral-500 mt-1 uppercase">
                                        <span>Views: <strong className="text-white font-medium">{rev.views || 0}</strong></span>
                                        <span className="text-neutral-700">•</span>
                                        <span>Clicks: <strong className="text-white font-medium">{rev.clicks || 0}</strong></span>
                                        <span className="text-neutral-700">•</span>
                                        <span>CTR: <strong className="text-[#C5A059] font-semibold">{rev.views && rev.views > 0 ? ((rev.clicks || 0) / rev.views * 100).toFixed(1) : '0.0'}%</strong></span>
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                {/* Category */}
                                <td className="py-4 px-4 font-mono text-[10px] uppercase text-neutral-400">
                                  {rev.category.replace('-', ' ')}
                                </td>

                                {/* Score Rating */}
                                <td className="py-4 px-4 text-center">
                                  <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-white/[0.03] border border-white/5 rounded-lg text-amber-500 leading-none">
                                    <Star size={11} className="fill-amber-500" />
                                    <span className="font-semibold text-xs leading-none">{rev.rating || '4.8'}</span>
                                  </div>
                                </td>

                                {/* Affiliate URL */}
                                <td className="py-4 px-4 font-mono text-[10px]">
                                  {rev.affiliateUrl ? (
                                    <a
                                      href={rev.affiliateUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-neutral-400 hover:text-[#C5A059] flex items-center gap-1 transition-colors line-clamp-1 truncate max-w-[150px] underline"
                                    >
                                      <ExternalLink size={10} /> Link target
                                    </a>
                                  ) : (
                                    <span className="text-neutral-700 italic">None set</span>
                                  )}
                                </td>

                                {/* Workflow status */}
                                <td className="py-4 px-4 text-center whitespace-nowrap">
                                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono uppercase font-semibold ${badgeClass}`}>
                                    {rev.status || 'draft'}
                                  </span>
                                </td>

                                {/* Actions */}
                                <td className="py-4 px-5 text-right whitespace-nowrap">
                                  <div className="flex items-center justify-end gap-2 text-neutral-400">
                                    
                                    {/* Workflow status changes */}
                                    <div className="flex items-center bg-black/40 border border-white/5 rounded-lg p-0.5 select-none mr-2">
                                      {rev.status === 'draft' && (
                                        <button
                                          onClick={() => handleUpdateStatus(rev.id, 'pending')}
                                          className="px-2 py-1 text-[9px] text-[#C5A059] font-bold uppercase tracking-wider hover:bg-neutral-800 rounded font-mono"
                                          title="Submit for clearance"
                                        >
                                          Submit
                                        </button>
                                      )}
                                      
                                      {rev.status === 'pending' && (
                                        <div className="flex gap-1 p-0.5">
                                          <button
                                            onClick={() => handleUpdateStatus(rev.id, 'approved')}
                                            className="px-1.5 py-0.5 text-[8px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-black font-semibold rounded"
                                            title="Approve manuscript"
                                          >
                                            Approve
                                          </button>
                                          <button
                                            onClick={() => handleUpdateStatus(rev.id, 'rejected')}
                                            className="px-1.5 py-0.5 text-[8px] bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-black font-semibold rounded"
                                            title="Reject manuscript"
                                          >
                                            Reject
                                          </button>
                                        </div>
                                      )}

                                      {rev.status === 'approved' && (
                                        <div className="flex gap-1 p-0.5">
                                          <button
                                            onClick={() => handleUpdateStatus(rev.id, 'archived')}
                                            className="px-1.5 py-0.5 text-[8px] bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white rounded font-mono uppercase"
                                            title="Archive from live rotations"
                                          >
                                            Archive
                                          </button>
                                          <button
                                            onClick={() => handleUpdateStatus(rev.id, 'draft')}
                                            className="px-1.5 py-0.5 text-[8px] text-neutral-500 hover:text-white hover:bg-neutral-900 rounded uppercase font-mono"
                                            title="Revoke to Draft"
                                          >
                                            Revoke
                                          </button>
                                        </div>
                                      )}

                                      {rev.status === 'rejected' && (
                                        <button
                                          onClick={() => handleUpdateStatus(rev.id, 'draft')}
                                          className="px-2 py-1 text-[9px] text-neutral-300 hover:text-white hover:bg-neutral-800 rounded font-mono uppercase"
                                          title="Revoke and set to Draft"
                                        >
                                          Set Draft
                                        </button>
                                      )}

                                      {rev.status === 'archived' && (
                                        <div className="flex gap-1 p-0.5">
                                          <button
                                            onClick={() => handleUpdateStatus(rev.id, 'approved')}
                                            className="px-1.5 py-0.5 text-[8px] text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-black rounded uppercase font-mono"
                                            title="Restore to Approved"
                                          >
                                            Restore
                                          </button>
                                          <button
                                            onClick={() => handleUpdateStatus(rev.id, 'draft')}
                                            className="px-1.5 py-0.5 text-[8px] text-neutral-500 hover:text-white hover:bg-neutral-900 rounded uppercase font-mono"
                                            title="Move to Draft"
                                          >
                                            Draft
                                          </button>
                                        </div>
                                      )}
                                    </div>

                            <button
                              onClick={() => setPreviewReview(rev)}
                              className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white transition-all cursor-pointer"
                              title="Preview Live Experience"
                            >
                              <Eye size={12} />
                            </button>
                            
                            <button
                              onClick={() => handleOpenEditForm(rev)}
                              className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-[#C5A059]/30 text-[#C5A059] hover:text-white transition-all cursor-pointer"
                              title="Edit Details"
                            >
                              <Edit3 size={12} />
                            </button>

                            <button
                              onClick={() => handleDuplicateReview(rev)}
                              className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-blue-900/30 text-blue-400 hover:text-blue-200 transition-all cursor-pointer"
                              title="Duplicate as Draft"
                            >
                              <Copy size={12} />
                            </button>

                            <button
                              onClick={() => handleDeleteReview(rev.id)}
                              className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-red-900/40 text-red-500 hover:text-red-400 transition-all cursor-pointer"
                              title="Permanently Delete"
                            >
                              <Trash2 size={12} />
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}
        </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* FORM: CREATE/EDIT REVIEW MODULE */}
      {isFormOpen && (
        <div className="max-w-5xl mx-auto bg-[#111116] border border-white/5 rounded-3xl p-6 lg:p-10 space-y-8 animate-fade-in">
          
          {/* Editor Header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-6">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-[#C5A059] uppercase tracking-widest font-semibold">
                {editingReview ? 'Formulation Studio — Edit Review' : 'Formulation Studio — Create Review'}
              </span>
              <h2 className="text-2xl font-serif font-bold text-white tracking-wide">
                {editingReview ? `Editing "${editingReview.title}"` : 'Write Product Review'}
              </h2>
            </div>
            
            <button
              onClick={() => setIsFormOpen(false)}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-neutral-400 hover:text-white transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSaveReview} className="space-y-8 text-neutral-300">
            
            {/* Elegant Horizontal Tab Selector */}
            <div className="flex overflow-x-auto pb-2 border-b border-white/5 gap-1.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {[
                { id: 'basic', label: 'Basic Information', icon: <FileText size={14} /> },
                { id: 'campaign', label: 'Affiliate Campaign Hub', icon: <ExternalLink size={14} /> },
                { id: 'editorial', label: 'Editorial Content', icon: <Sparkles size={14} /> },
                { id: 'interactive', label: 'Interactive Elements', icon: <SlidersHorizontal size={14} /> },
                { id: 'seo', label: 'SEO & Social', icon: <Globe size={14} /> },
                { id: 'trust', label: 'Trust & Authority', icon: <ShieldCheck size={14} /> },
                { id: 'analytics', label: 'Performance Analytics', icon: <BarChart4 size={14} /> },
                { id: 'publishing', label: 'Publishing Protocol', icon: <Save size={14} /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFormTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-mono tracking-wider transition-all whitespace-nowrap cursor-pointer selection:bg-transparent ${
                    activeFormTab === tab.id
                      ? 'bg-[#C5A059] text-black font-bold shadow-md shadow-[#C5A059]/10'
                      : 'bg-white/5 border border-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {activeFormTab === 'basic' && (
              /* STAGE 1: BASIC INFORMATION */
              <div className="space-y-4">
                <h3 className="text-sm font-serif font-bold text-[#C5A059] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-white/5">
                  <FileText size={16} /> 1. Basic Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">Review Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amaan Capital — Executive Real Estate Investment Review"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-xl focus:border-[#C5A059] focus:outline-none focus:ring-0 text-sm transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 flex items-center justify-between">
                    <span>URL Handle Slug *</span>
                    <button
                      type="button"
                      onClick={handleRegenerateSlug}
                      className="text-[9px] text-[#C5A059] hover:underline"
                    >
                      Negotiate Custom Slug
                    </button>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. amaan-capital-review"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-xl focus:border-[#C5A059] focus:outline-none focus:ring-0 text-sm font-mono text-[#C5A059] transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">Brand Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amaan Capital"
                    value={formBrandName}
                    onChange={(e) => setFormBrandName(e.target.value)}
                    className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-xl focus:border-[#C5A059] focus:outline-none focus:ring-0 text-sm transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">Specialty Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-xl focus:border-[#C5A059] focus:outline-none focus:ring-0 text-sm transition-all"
                  >
                    <option value="real-estate">Real Estate Partners</option>
                    <option value="finance">Finance Partners</option>
                    <option value="tech">Technology Partners</option>
                    <option value="market">Market Partners</option>
                    <option value="learning">Executive Development (Legacy)</option>
                  </select>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">Featured Image (Direct File Upload or URLFallback)</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-black/20 p-3 rounded-xl border border-white/5">
                    <div className="relative border-2 border-dashed border-white/10 hover:border-[#C5A059]/40 bg-black/35 rounded-xl p-3 flex flex-col items-center justify-center text-center group transition-all duration-300">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              toast.error('Image size exceeds 5MB limit.');
                              return;
                            }
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setFormFeaturedImage(reader.result as string);
                              toast.success('Local file uploaded successfully');
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="space-y-1 py-1">
                        <p className="text-[11px] font-semibold text-white group-hover:text-[#C5A059] transition-colors">Drag & drop or Click to upload</p>
                        <p className="text-[9px] text-neutral-500 font-mono">JPG, PNG, GIF up to 5MB</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 flex flex-col justify-center">
                      <p className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider">Or paste direct image URL</p>
                      <input
                        type="text"
                        placeholder="https://images.unsplash.com/photo-..."
                        value={formFeaturedImage}
                        onChange={(e) => setFormFeaturedImage(e.target.value)}
                        className="w-full px-3 py-1.5 bg-black/45 border border-white/10 rounded-xl focus:border-[#C5A059] focus:outline-none focus:ring-0 text-xs text-neutral-300 font-mono"
                      />
                      {formFeaturedImage && (
                        <div className="flex items-center justify-between text-[9px] font-mono">
                          <span className="text-emerald-400 flex items-center gap-1">✔ Asset preview active</span>
                          <button
                            type="button"
                            onClick={() => setFormFeaturedImage('')}
                            className="text-red-450 hover:underline"
                          >
                            Clear
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">Review Score Rating (1.0 to 5.0)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1.0"
                    max="5.0"
                    placeholder="4.8"
                    value={formRating}
                    onChange={(e) => setFormRating(parseFloat(e.target.value))}
                    className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-xl focus:border-[#C5A059] focus:outline-none focus:ring-0 text-sm transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">Brief Card Excerpt (Summary for the directory listings) *</label>
                <textarea
                  required
                  rows={2}
                  maxLength={180}
                  placeholder="Vetted operational analysis of the brand, covering executive investment mechanisms, yield thresholds, and team background credentials."
                  value={formExcerpt}
                  onChange={(e) => setFormExcerpt(e.target.value)}
                  className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-xl focus:border-[#C5A059] focus:outline-none focus:ring-0 text-sm transition-all"
                />
              </div>
            </div>
          )}

          {activeFormTab === 'campaign' && (
              /* STAGE 2: MONETIZATION & CAMPAIGNS HUB */
              <div className="space-y-6">
              <h3 className="text-sm font-serif font-bold text-[#C5A059] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-white/5">
                <ExternalLink size={16} /> 2. Affiliate Monetization & Campaign Hub
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">Outbound Destination URL *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://amaanestate.com/partners/target-uid"
                    value={formAffiliateUrl}
                    onChange={(e) => setFormAffiliateUrl(e.target.value)}
                    className="w-full px-4 py-2 bg-black/40 border border-[#C5A059]/30 rounded-xl focus:border-[#C5A059] focus:outline-none text-sm font-mono text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">Primary Key CTA Label *</label>
                  <input
                    type="text"
                    required
                    placeholder="Visit Official Website"
                    value={formCtaButtonText}
                    onChange={(e) => setFormCtaButtonText(e.target.value)}
                    className="w-full px-4 py-2 bg-black/40 border border-[#C5A059]/30 rounded-xl focus:border-[#C5A059] focus:outline-none text-sm text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">Button Theme Style</label>
                  <select
                    value={formCtaButtonStyle}
                    onChange={(e) => setFormCtaButtonStyle(e.target.value as any)}
                    className="w-full px-4 py-2 bg-black/40 border border-[#C5A059]/30 rounded-xl focus:border-[#C5A059] focus:outline-none text-sm text-white"
                  >
                    <option value="solid-gold">Premium Gold Filled</option>
                    <option value="outline-gold">Gold Fine Border</option>
                    <option value="solid-emerald">Vibrant Emerald Green</option>
                    <option value="minimal-border">Minimal Solid Border</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">Click Analytics Descriptor (Under the CTA)</label>
                  <input
                    type="text"
                    placeholder="Yield thresholds subject to regulatory approvals. General verification criteria apply."
                    value={formCtaSummary}
                    onChange={(e) => setFormCtaSummary(e.target.value)}
                    className="w-full px-4 py-2 bg-black/40 border border-[#C5A059]/30 rounded-xl focus:border-[#C5A059] focus:outline-none text-sm text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2">
                <label className="flex items-center gap-3 bg-black/35 p-4 rounded-xl border border-white/5 cursor-pointer selection:bg-transparent">
                  <input
                    type="checkbox"
                    checked={formEnableGlobalDisclosure}
                    onChange={(e) => {
                      setFormEnableGlobalDisclosure(e.target.checked);
                      setFormSponsoredDisclosure(e.target.checked);
                    }}
                    className="rounded border-white/10 accent-[#C5A059] cursor-pointer"
                  />
                  <div>
                    <h5 className="text-[11px] font-mono uppercase tracking-wider text-white">Compliance Disclosure Toggle</h5>
                    <p className="text-[10px] text-neutral-400 mt-1">Render an explicit, ethically compliant warning disclaimer Above CTA layout section coordinates.</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 bg-black/35 p-4 rounded-xl border border-white/5 cursor-pointer selection:bg-transparent">
                  <input
                    type="checkbox"
                    checked={formExternalLink}
                    onChange={(e) => setFormExternalLink(e.target.checked)}
                    className="rounded border-white/10 accent-[#C5A059]"
                  />
                  <div>
                    <h5 className="text-[11px] font-mono uppercase tracking-wider text-white">Open link in new browser tab</h5>
                    <p className="text-[10px] text-neutral-400 mt-1">Ensure the CTA link executes with target=&quot;_blank&quot; parameters to keep visitors engaged.</p>
                  </div>
                </label>
              </div>

              {/* MULTI-CTA MANAGER */}
              <div className="bg-black/20 p-5 rounded-2xl border border-white/5 space-y-4 text-left">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-[#C5A059] font-bold">1. Multi-CTA Buttons Manager</h4>
                    <p className="text-[10px] text-neutral-400 mt-0.5">Configure up to 4 independent target Call to Actions with distinct URL routes, styles, and micro-tracking capabilities.</p>
                  </div>
                  <span className="text-[10px] font-mono bg-neutral-900 border border-white/10 text-[#C5A059] px-2.5 py-1 rounded-md font-bold">
                    {formCtaButtons.length} / 4
                  </span>
                </div>

                {formCtaButtons.length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-white/10 rounded-xl space-y-3">
                    <p className="text-xs text-neutral-500">No custom multi-CTA buttons configured yet.</p>
                    <button
                      type="button"
                      onClick={() => {
                        const newBtn: CTAButton = {
                          text: formCtaButtonText || 'Visit Official Website',
                          url: formAffiliateUrl || '',
                          style: formCtaButtonStyle as any || 'solid-gold',
                          clicks: 0
                        };
                        setFormCtaButtons([newBtn]);
                        toast.success('Initialized table with existing fallback CTA');
                      }}
                      className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-neutral-300 font-mono transition-colors"
                    >
                      Migrate Default CTA Button
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formCtaButtons.map((btn, bidx) => (
                      <div key={bidx} className="bg-neutral-900/50 p-4 rounded-xl border border-white/5 space-y-3 relative">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-[#C5A059] uppercase tracking-wider bg-[#C5A059]/10 px-2 py-0.5 rounded">
                            Button #{bidx + 1} {bidx === formStickyCtaButtonIndex ? '★ (Sticky)' : ''}
                          </span>
                          <div className="flex items-center gap-2">
                            {formCtaButtons.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = formCtaButtons.filter((_, i) => i !== bidx);
                                  setFormCtaButtons(updated);
                                  if (formStickyCtaButtonIndex >= updated.length) {
                                    setFormStickyCtaButtonIndex(0);
                                  }
                                  toast.success('CTA Button removed');
                                }}
                                className="text-[10px] font-mono text-red-400 hover:text-red-300 transition-colors"
                              >
                                Remove Button
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="space-y-1 font-sans">
                            <label className="text-[9px] font-mono uppercase text-neutral-400">Button Display Text</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Visit Partner Platform"
                              value={btn.text}
                              onChange={(e) => {
                                const updated = [...formCtaButtons];
                                updated[bidx].text = e.target.value;
                                setFormCtaButtons(updated);
                              }}
                              className="w-full px-3 py-1.5 bg-black/40 border border-white/5 rounded-lg focus:border-[#C5A059] focus:outline-none text-xs text-white"
                            />
                          </div>

                          <div className="space-y-1 font-sans">
                            <label className="text-[9px] font-mono uppercase text-neutral-400">Target Affiliate URL</label>
                            <input
                              type="url"
                              required
                              placeholder="https://..."
                              value={btn.url}
                              onChange={(e) => {
                                const updated = [...formCtaButtons];
                                updated[bidx].url = e.target.value;
                                setFormCtaButtons(updated);
                              }}
                              className="w-full px-3 py-1.5 bg-black/40 border border-white/5 rounded-lg focus:border-[#C5A059] focus:outline-none text-xs text-white font-mono"
                            />
                          </div>

                          <div className="space-y-1 font-sans">
                            <label className="text-[9px] font-mono uppercase text-neutral-400">Button Style Theme</label>
                            <select
                              value={btn.style}
                              onChange={(e) => {
                                const updated = [...formCtaButtons];
                                updated[bidx].style = e.target.value as any;
                                setFormCtaButtons(updated);
                              }}
                              className="w-full px-3 py-1.5 bg-black/40 border border-white/5 rounded-lg focus:border-[#C5A059] focus:outline-none text-xs text-white"
                            >
                              <option value="solid-gold">Premium Gold Filled</option>
                              <option value="outline-gold">Gold Fine Border</option>
                              <option value="solid-emerald">Vibrant Emerald Green</option>
                              <option value="solid-blue">Professional Blue</option>
                              <option value="minimal-border">Minimal Solid Border</option>
                            </select>
                          </div>
                        </div>
                        
                        {btn.clicks !== undefined && (
                          <div className="text-[9px] font-mono text-neutral-500 mt-1 flex items-center gap-1.5">
                            <span>Accumulated Conversions:</span>
                            <span className="text-[#C5A059] font-bold">{btn.clicks} click-throughs</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {formCtaButtons.length < 4 && (
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        const newBtn: CTAButton = {
                          text: 'Claim Partner Deal',
                          url: formAffiliateUrl || '',
                          style: 'solid-gold',
                          clicks: 0
                        };
                        setFormCtaButtons([...formCtaButtons, newBtn]);
                        toast.success('Appended new CTA config container');
                      }}
                      className="px-4 py-2 bg-white/5 hover:bg-[#C5A059]/15 border border-white/10 hover:border-[#C5A059]/30 rounded-xl text-xs font-mono text-neutral-200 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus size={12} /> Append CTA Button Link ({formCtaButtons.length}/4)
                    </button>
                  </div>
                )}
              </div>

              {/* BANNER PLACEMENT CAMPAIGNS */}
              <div className="bg-black/20 p-5 rounded-2xl border border-white/5 space-y-4 text-left">
                <div className="border-b border-white/5 pb-3">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[#C5A059] font-bold">2. Banner Management Placements</h4>
                  <p className="text-[10px] text-neutral-400 mt-0.5">Inject high-visibility graphical banners at premium structural coordinates of the review page.</p>
                </div>

                <div className="grid grid-cols-1 gap-6 divide-y divide-white/5">
                  {/* TOP BANNER */}
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono uppercase font-bold text-neutral-300">A. Top Horizontal Header Banner</span>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formTopBannerEnabled}
                          onChange={(e) => setFormTopBannerEnabled(e.target.checked)}
                          className="rounded border-white/10 accent-[#C5A059]"
                        />
                        <span className="text-[10px] font-mono text-neutral-400">Position Active</span>
                      </label>
                    </div>
                    {formTopBannerEnabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-3 border-l-2 border-[#C5A059]/40">
                        <div className="space-y-1 font-sans">
                          <label className="text-[9px] font-mono text-neutral-400 uppercase">Banner Image URL</label>
                          <input
                            type="text"
                            value={formTopBannerImageUrl}
                            onChange={(e) => setFormTopBannerImageUrl(e.target.value)}
                            placeholder="e.g. https://images.unsplash.com/promo-banner-1"
                            className="w-full px-3 py-1.5 bg-black/40 border border-white/5 rounded-lg focus:border-[#C5A059] focus:outline-none text-xs text-white font-mono"
                          />
                        </div>
                        <div className="space-y-1 font-sans">
                          <label className="text-[9px] font-mono text-neutral-400 uppercase">Alt Text Description</label>
                          <input
                            type="text"
                            value={formTopBannerAltText}
                            onChange={(e) => setFormTopBannerAltText(e.target.value)}
                            placeholder="e.g. Earn up to 15% yields with Amaan Capital"
                            className="w-full px-3 py-1.5 bg-black/40 border border-white/5 rounded-lg focus:border-[#C5A059] focus:outline-none text-xs text-white"
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2 font-sans">
                          <label className="text-[9px] font-mono text-neutral-400 uppercase">Destination URL</label>
                          <input
                            type="url"
                            value={formTopBannerDestinationUrl}
                            onChange={(e) => setFormTopBannerDestinationUrl(e.target.value)}
                            placeholder="https://..."
                            className="w-full px-3 py-1.5 bg-black/40 border border-white/5 rounded-lg focus:border-[#C5A059] focus:outline-none text-xs text-white font-mono"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* INLINE BANNER */}
                  <div className="space-y-3 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono uppercase font-bold text-neutral-300">B. Inline Article Content Banner</span>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formInlineBannerEnabled}
                          onChange={(e) => setFormInlineBannerEnabled(e.target.checked)}
                          className="rounded border-white/10 accent-[#C5A059]"
                        />
                        <span className="text-[10px] font-mono text-neutral-400">Position Active</span>
                      </label>
                    </div>
                    {formInlineBannerEnabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-3 border-l-2 border-[#C5A059]/40">
                        <div className="space-y-1 font-sans">
                          <label className="text-[9px] font-mono text-neutral-400 uppercase">Banner Image URL</label>
                          <input
                            type="text"
                            value={formInlineBannerImageUrl}
                            onChange={(e) => setFormInlineBannerImageUrl(e.target.value)}
                            placeholder="https://..."
                            className="w-full px-3 py-1.5 bg-black/40 border border-white/5 rounded-lg focus:border-[#C5A059] focus:outline-none text-xs text-white font-mono"
                          />
                        </div>
                        <div className="space-y-1 font-sans">
                          <label className="text-[9px] font-mono text-neutral-400 uppercase">Alt Text Description</label>
                          <input
                            type="text"
                            value={formInlineBannerAltText}
                            onChange={(e) => setFormInlineBannerAltText(e.target.value)}
                            placeholder="Inline Partner Campaign Advertisement"
                            className="w-full px-3 py-1.5 bg-black/40 border border-white/5 rounded-lg focus:border-[#C5A059] focus:outline-none text-xs text-white"
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2 font-sans">
                          <label className="text-[9px] font-mono text-neutral-400 uppercase">Destination URL</label>
                          <input
                            type="url"
                            value={formInlineBannerDestinationUrl}
                            onChange={(e) => setFormInlineBannerDestinationUrl(e.target.value)}
                            placeholder="https://..."
                            className="w-full px-3 py-1.5 bg-black/40 border border-white/5 rounded-lg focus:border-[#C5A059] focus:outline-none text-xs text-white font-mono"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* BOTTOM BANNER */}
                  <div className="space-y-3 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono uppercase font-bold text-neutral-300">C. Closing Verdict Footnote Banner</span>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formBottomBannerEnabled}
                          onChange={(e) => setFormBottomBannerEnabled(e.target.checked)}
                          className="rounded border-white/10 accent-[#C5A059]"
                        />
                        <span className="text-[10px] font-mono text-neutral-400">Position Active</span>
                      </label>
                    </div>
                    {formBottomBannerEnabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-3 border-l-2 border-[#C5A059]/40">
                        <div className="space-y-1 font-sans">
                          <label className="text-[9px] font-mono text-neutral-400 uppercase">Banner Image URL</label>
                          <input
                            type="text"
                            value={formBottomBannerImageUrl}
                            onChange={(e) => setFormBottomBannerImageUrl(e.target.value)}
                            placeholder="https://..."
                            className="w-full px-3 py-1.5 bg-black/40 border border-white/5 rounded-lg focus:border-[#C5A059] focus:outline-none text-xs text-white font-mono"
                          />
                        </div>
                        <div className="space-y-1 font-sans">
                          <label className="text-[9px] font-mono text-neutral-400 uppercase">Alt Text Description</label>
                          <input
                            type="text"
                            value={formBottomBannerAltText}
                            onChange={(e) => setFormBottomBannerAltText(e.target.value)}
                            placeholder="Promoted platform signup voucher deal"
                            className="w-full px-3 py-1.5 bg-black/40 border border-white/5 rounded-lg focus:border-[#C5A059] focus:outline-none text-xs text-white"
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2 font-sans">
                          <label className="text-[9px] font-mono text-neutral-400 uppercase">Destination URL</label>
                          <input
                            type="url"
                            value={formBottomBannerDestinationUrl}
                            onChange={(e) => setFormBottomBannerDestinationUrl(e.target.value)}
                            placeholder="https://..."
                            className="w-full px-3 py-1.5 bg-black/40 border border-white/5 rounded-lg focus:border-[#C5A059] focus:outline-none text-xs text-white font-mono"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* DISCLOSURE & STICKY SETTINGS */}
              <div className="bg-black/20 p-5 rounded-2xl border border-white/5 space-y-4 text-left">
                <div className="border-b border-white/5 pb-3">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[#C5A059] font-bold">3. Compliance & Floater CTA settings</h4>
                  <p className="text-[10px] text-neutral-400 mt-0.5">Optimize user flows and manage statutory legal and ethical affiliate disclosures transparently.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Sticky CTA Control Toggle */}
                  <label className="flex items-start gap-3 bg-neutral-900/40 p-3.5 rounded-xl border border-white/5 cursor-pointer selection:bg-transparent">
                    <input
                      type="checkbox"
                      checked={formEnableStickyCta}
                      onChange={(e) => setFormEnableStickyCta(e.target.checked)}
                      className="rounded border-white/10 accent-[#C5A059] mt-0.5"
                    />
                    <div>
                      <h5 className="text-[10px] font-mono uppercase tracking-wider text-white">Enable Sticky Footer CTA Floater</h5>
                      <p className="text-[9px] text-neutral-400 mt-0.5">Launches a smooth bottom bar overlay with brand logo and action button when scrolling passes fold thresholds.</p>
                    </div>
                  </label>

                  {/* Sticky Button Index Selector */}
                  {formEnableStickyCta && (
                    <div className="space-y-1 font-mono bg-neutral-900/40 p-3.5 rounded-xl border border-white/5 font-sans">
                      <label className="text-[9px] font-mono uppercase tracking-wider text-neutral-400">Target Action Index for Sticky Button</label>
                      <select
                        value={formStickyCtaButtonIndex}
                        onChange={(e) => setFormStickyCtaButtonIndex(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 bg-black/40 border border-white/5 rounded-lg focus:border-[#C5A059] focus:outline-none text-xs text-white mt-1"
                      >
                        {formCtaButtons.map((btn, bidx) => (
                          <option key={bidx} value={bidx}>Button #{bidx + 1}: {btn.text}</option>
                        ))}
                        {formCtaButtons.length === 0 && (
                          <option value="0">Default Primary Action</option>
                        )}
                      </select>
                    </div>
                  )}

                  <div className="col-span-1 md:col-span-2 text-[10px] text-neutral-500 font-mono py-1">
                    ℹ️ Compliance Disclosure is enabled. All reviews inherit standard company disclosure automatically.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeFormTab === 'editorial' && (
              /* STAGE 3: EDITORIAL CONTENT */
              <div className="space-y-4">
              <h3 className="text-sm font-serif font-bold text-[#C5A059] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-white/5">
                <Sparkles size={16} /> 3. Editorial Content (Richtext Blocks)
              </h3>

              <div className="space-y-4">
                
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">Introduction Block (Rich Text/Markdown compatible) *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide a comprehensive introduction to this partner brand..."
                    value={formIntroduction}
                    onChange={(e) => setFormIntroduction(e.target.value)}
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-[#C5A059] focus:outline-none focus:ring-0 text-sm transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">What Is This Platform? (Deep Dive Analysis) *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Define the primary operational structures, capabilities, and backgrounds of this platform..."
                    value={formWhatIsIt}
                    onChange={(e) => setFormWhatIsIt(e.target.value)}
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-[#C5A059] focus:outline-none focus:ring-0 text-sm transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">Key Features List (Write each feature on a separate line) *</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Executive Dashboard Access&#10;Highly Vetted Underwriters&#10;Dynamic Yield Estimation Matrices"
                      value={formKeyFeatures}
                      onChange={(e) => setFormKeyFeatures(e.target.value)}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-[#C5A059] focus:outline-none focus:ring-0 text-sm transition-all font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">Ideal User Target Profile (Who Is It Best For?) *</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Best matched for high-net-worth real estate buyers, cross-border corporate trusts, and private family offices seeking secured digital real estate options."
                      value={formBestFor}
                      onChange={(e) => setFormBestFor(e.target.value)}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-[#C5A059] focus:outline-none focus:ring-0 text-sm transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-[#A3E635]">Pros (Write each advantage on a separate line) *</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Highly robust liquidity pools&#10;Zero setup friction for corporate accounts&#10;Absolute cryptographic transaction safety"
                      value={formPros}
                      onChange={(e) => setFormPros(e.target.value)}
                      className="w-full px-4 py-3 bg-[#112211]/30 border border-emerald-500/10 rounded-xl focus:border-emerald-500 focus:outline-none focus:ring-0 text-sm transition-all font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-[#F87171]">Cons (Write each disadvantage on a separate line) *</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Requires offline validation coordinates&#10;Slightly higher institutional fees than retail&#10;Limited support for third party secondary marketplaces"
                      value={formCons}
                      onChange={(e) => setFormCons(e.target.value)}
                      className="w-full px-4 py-3 bg-[#221111]/30 border border-rose-500/10 rounded-xl focus:border-rose-500 focus:outline-none focus:ring-0 text-sm transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">Pricing Overview Matrix / Plans *</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Starts with a standard premium tier with customized volume quotes. Real-time updates remain active."
                      value={formPricingOverview}
                      onChange={(e) => setFormPricingOverview(e.target.value)}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-[#C5A059] focus:outline-none focus:ring-0 text-sm transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">Final Verdict / Wrap-Up *</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Highly recommended institutional gateway for private trusts seeking vetted real estate portfolios..."
                      value={formFinalVerdict}
                      onChange={(e) => setFormFinalVerdict(e.target.value)}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-[#C5A059] focus:outline-none focus:ring-0 text-sm transition-all"
                    />
                  </div>
                </div>

              </div>
            </div>
          )}

          {activeFormTab === 'interactive' && (
              /* STAGE 3.5: RICHTEXT BUILDER SUITE — GALLERY, FAQS, & COMPARISONS */
              <div className="space-y-6">
              <h3 className="text-sm font-serif font-bold text-[#C5A059] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-white/5">
                <SlidersHorizontal size={16} /> 3.5 Interactive Page Elements Builder
              </h3>

              <div className="space-y-6">
                {/* 1. REVIEW GRAPHICS GALLERY BUILDER */}
                <div className="bg-black/20 p-5 rounded-2xl border border-white/5 space-y-4 text-left">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div>
                      <h4 className="text-xs font-mono uppercase tracking-wider text-[#C5A059] font-bold">Screenshot & Platform Interface Gallery</h4>
                      <p className="text-[10px] text-neutral-400 mt-0.5">Add verified screenshots of the dashboard interface with editorial explanations for trust enhancement.</p>
                    </div>
                    <span className="text-[10px] font-mono bg-neutral-900 border border-white/10 text-[#C5A059] px-2.5 py-1 rounded-md font-bold font-sans">
                      {formGallery.length} Screens Configured
                    </span>
                  </div>

                  <div className="space-y-4">
                    {formGallery.map((gItem, gIdx) => (
                      <div key={gItem.id || gIdx} className="bg-neutral-900/40 p-3.5 rounded-xl border border-white/5 flex flex-col sm:flex-row gap-4 items-start sm:items-center relative">
                        <div className="aspect-video w-32 bg-black border border-white/10 rounded-lg overflow-hidden shrink-0 flex items-center justify-center text-[10px] text-neutral-500">
                          {gItem.imageUrl ? (
                            <img src={gItem.imageUrl} alt="preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <span>No URL Target</span>
                          )}
                        </div>
                        <div className="flex-grow grid grid-cols-1 gap-2 w-full">
                          <input
                            type="text"
                            placeholder="Screenshot Image URL"
                            value={gItem.imageUrl}
                            onChange={(e) => {
                              const updated = [...formGallery];
                              updated[gIdx].imageUrl = e.target.value;
                              setFormGallery(updated);
                            }}
                            className="w-full px-3 py-1.5 bg-black/40 border border-white/5 rounded-lg focus:border-[#C5A059] focus:outline-none text-xs text-white font-mono"
                          />
                          <input
                            type="text"
                            placeholder="Verification Caption Label..."
                            value={gItem.caption || ''}
                            onChange={(e) => {
                              const updated = [...formGallery];
                              updated[gIdx].caption = e.target.value;
                              setFormGallery(updated);
                            }}
                            className="w-full px-3 py-1.5 bg-black/40 border border-white/5 rounded-lg focus:border-[#C5A059] focus:outline-none text-xs text-white"
                          />
                        </div>

                        {/* Order manipulation and actions */}
                        <div className="flex sm:flex-col items-center gap-1.5 justify-end w-full sm:w-auto self-stretch font-mono">
                          <button
                            type="button"
                            disabled={gIdx === 0}
                            onClick={() => {
                              const updated = [...formGallery];
                              const temp = updated[gIdx];
                              updated[gIdx] = updated[gIdx - 1];
                              updated[gIdx - 1] = temp;
                              setFormGallery(updated);
                            }}
                            className="p-1 px-2 text-[10px] font-mono border border-white/5 bg-white/5 hover:bg-white/15 rounded text-neutral-400 hover:text-white disabled:opacity-40 cursor-pointer"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            disabled={gIdx === formGallery.length - 1}
                            onClick={() => {
                              const updated = [...formGallery];
                              const temp = updated[gIdx];
                              updated[gIdx] = updated[gIdx + 1];
                              updated[gIdx + 1] = temp;
                              setFormGallery(updated);
                            }}
                            className="p-1 px-2 text-[10px] font-mono border border-white/5 bg-white/5 hover:bg-white/15 rounded text-neutral-400 hover:text-white disabled:opacity-40 cursor-pointer"
                          >
                            ▼
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setFormGallery(formGallery.filter((_, i) => i !== gIdx));
                              toast.info('Gallery asset removed');
                            }}
                            className="p-1.5 text-xs font-mono text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        const newScreenshot: GalleryItem = {
                          id: Math.random().toString(36).substring(4),
                          imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop',
                          caption: 'Platform Operations Dashboard Overview - Real Time Activity Ledger'
                        };
                        setFormGallery([...formGallery, newScreenshot]);
                        toast.success('Screenshot container appended');
                      }}
                      className="px-4 py-2 bg-white/5 hover:bg-[#C5A059]/15 border border-white/10 rounded-xl text-xs font-mono text-neutral-300 transition-all flex items-center gap-1 cursor-pointer animate-fade-in"
                    >
                      <Plus size={12} /> Append Screenshot Asset
                    </button>
                  </div>
                </div>

                {/* 2. SEO-FRIENDLY FAQ BUILDER (Unlimited FAQs) */}
                <div className="bg-black/20 p-5 rounded-2xl border border-white/5 space-y-4 text-left">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div>
                      <h4 className="text-xs font-mono uppercase tracking-wider text-[#C5A059] font-bold">Frequently Asked Questions (FAQ) Builder</h4>
                      <p className="text-[10px] text-neutral-400 mt-0.5">Author FAQ items to automatically compile schema structures for Google Search Rich Cards.</p>
                    </div>
                    <span className="text-[10px] font-mono bg-neutral-900 border border-white/10 text-[#C5A059] px-2.5 py-1 rounded-md font-bold font-sans">
                      {formFaqs.length} FAQ Items
                    </span>
                  </div>

                  <div className="space-y-4">
                    {formFaqs.map((faq, fIdx) => (
                      <div key={fIdx} className="bg-neutral-900/40 p-4 rounded-xl border border-white/5 space-y-2 relative">
                        <div className="flex items-center justify-between font-mono">
                          <span className="text-[9px] font-mono font-bold text-[#C5A059] tracking-wider uppercase">FAQ Item #{fIdx + 1}</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={fIdx === 0}
                              onClick={() => {
                                const updated = [...formFaqs];
                                const temp = updated[fIdx];
                                updated[fIdx] = updated[fIdx - 1];
                                updated[fIdx - 1] = temp;
                                setFormFaqs(updated);
                              }}
                              className="p-1 px-1.5 text-[8px] font-mono border border-white/5 bg-white/5 rounded text-neutral-400 hover:text-white disabled:opacity-40 cursor-pointer"
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              disabled={fIdx === formFaqs.length - 1}
                              onClick={() => {
                                const updated = [...formFaqs];
                                const temp = updated[fIdx];
                                updated[fIdx] = updated[fIdx + 1];
                                updated[fIdx + 1] = temp;
                                setFormFaqs(updated);
                              }}
                              className="p-1 px-1.5 text-[8px] font-mono border border-white/5 bg-white/5 rounded text-neutral-400 hover:text-white disabled:opacity-40 cursor-pointer"
                            >
                              ▼
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setFormFaqs(formFaqs.filter((_, i) => i !== fIdx));
                                toast.info('FAQ item deleted');
                              }}
                              className="text-[10px] font-mono text-red-400 hover:text-red-300 transition-colors ml-2 cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Enter Question (e.g. Is Amaan Capital fully compliant?)"
                            value={faq.question}
                            onChange={(e) => {
                              const updated = [...formFaqs];
                              updated[fIdx].question = e.target.value;
                              setFormFaqs(updated);
                            }}
                            className="w-full px-3 py-1.5 bg-black/40 border border-white/5 rounded-lg focus:border-[#C5A059] focus:outline-none text-xs text-white font-semibold"
                          />
                          <textarea
                            rows={2}
                            placeholder="Enter Answer with factual and comprehensive details..."
                            value={faq.answer}
                            onChange={(e) => {
                              const updated = [...formFaqs];
                              updated[fIdx].answer = e.target.value;
                              setFormFaqs(updated);
                            }}
                            className="w-full px-3 py-1.5 bg-black/40 border border-white/5 rounded-lg focus:border-[#C5A059] focus:outline-none text-xs text-white"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end font-mono">
                    <button
                      type="button"
                      onClick={() => {
                        const newFaq: FAQItem = {
                          question: '',
                          answer: ''
                        };
                        setFormFaqs([...formFaqs, newFaq]);
                        toast.success('Empty FAQ item appended');
                      }}
                      className="px-4 py-2 bg-white/5 hover:bg-[#C5A059]/15 border border-white/10 rounded-xl text-xs font-mono text-neutral-300 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={12} /> Append FAQ Item ({formFaqs.length})
                    </button>
                  </div>
                </div>

                {/* 3. FEATURE COMPARISON MATRIX BUILDER */}
                <div className="bg-black/20 p-5 rounded-2xl border border-white/5 space-y-4 text-left">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div>
                      <h4 className="text-xs font-mono uppercase tracking-wider text-[#C5A059] font-bold">Features & Competitors Comparison Matrix</h4>
                      <p className="text-[10px] text-neutral-400 mt-0.5">Define real parameters comparing {formBrandName || 'This Platform'} vs major market alternatives.</p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer font-mono">
                      <input
                        type="checkbox"
                        checked={formCompareEnabled}
                        onChange={(e) => setFormCompareEnabled(e.target.checked)}
                        className="rounded border-white/10 accent-[#C5A059]"
                      />
                      <span className="text-[10px] font-mono text-[#C5A059] font-bold">Matrix Enabled</span>
                    </label>
                  </div>

                  {formCompareEnabled && (
                    <div className="space-y-4 animate-fade-in font-sans">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5 font-sans">
                          <label className="text-[10px] font-mono text-neutral-400 uppercase">This Brand Label Header</label>
                          <input
                            type="text"
                            disabled
                            value={formBrandName || 'This Platform'}
                            className="w-full px-4 py-1.5 bg-neutral-900 border border-white/5 rounded-lg text-xs text-[#C5A059] font-bold"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono text-neutral-400 uppercase">Competitor Brand Label Header</label>
                          <input
                            type="text"
                            placeholder="e.g. Traditional Broker, Competitor X"
                            value={formCompareCompetitorName}
                            onChange={(e) => setFormCompareCompetitorName(e.target.value)}
                            className="w-full px-4 py-1.5 bg-black/40 border border-white/10 rounded-lg focus:border-[#C5A059] focus:outline-none text-xs text-white"
                          />
                        </div>
                      </div>

                      {/* Header row labels */}
                      <div className="hidden md:grid grid-cols-3 gap-3 p-2 bg-white/[0.02] border border-white/5 rounded-lg text-[9px] font-mono text-neutral-400 uppercase tracking-widest text-center font-bold">
                        <div className="text-left pl-2">Utility Parameter</div>
                        <div>Value inside {formBrandName || 'This Brand'}</div>
                        <div>Value inside {formCompareCompetitorName || 'Competitor'}</div>
                      </div>

                      <div className="space-y-2.5 font-sans">
                        {formCompareRows.map((row, rIdx) => (
                          <div key={rIdx} className="bg-neutral-900/40 p-3.5 rounded-xl border border-white/5 flex flex-col md:grid md:grid-cols-3 gap-3 items-center">
                            <div className="w-full">
                              <label className="md:hidden text-[9px] font-mono text-neutral-500 uppercase">Parameter Name</label>
                              <input
                                type="text"
                                placeholder="e.g. Asset Escrow Lock"
                                value={row.featureName}
                                onChange={(e) => {
                                  const updated = [...formCompareRows];
                                  updated[rIdx].featureName = e.target.value;
                                  setFormCompareRows(updated);
                                }}
                                className="w-full px-3 py-1.5 bg-black/40 border border-white/5 rounded-lg focus:border-[#C5A059] focus:outline-none text-xs text-white"
                              />
                            </div>
                            <div className="w-full">
                              <label className="md:hidden text-[9px] font-mono text-neutral-500 uppercase">{formBrandName || 'This Brand'} Value</label>
                              <input
                                type="text"
                                placeholder="e.g. Certified/Fully Escrowed"
                                value={row.thisBrandValue}
                                onChange={(e) => {
                                  const updated = [...formCompareRows];
                                  updated[rIdx].thisBrandValue = e.target.value;
                                  setFormCompareRows(updated);
                                }}
                                className="w-full px-3 py-1.5 bg-black/40 border border-white/5 rounded-lg focus:border-[#C5A059] focus:outline-none text-xs text-[#C5A059] font-bold text-center"
                              />
                            </div>
                            <div className="w-full flex items-center gap-2">
                              <div className="flex-grow">
                                <label className="md:hidden text-[9px] font-mono text-neutral-500 uppercase">{formCompareCompetitorName || 'Competitor'} Value</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Marginal or Unvetted"
                                  value={row.competitorBrandValue}
                                  onChange={(e) => {
                                    const updated = [...formCompareRows];
                                    updated[rIdx].competitorBrandValue = e.target.value;
                                    setFormCompareRows(updated);
                                  }}
                                  className="w-full px-3 py-1.5 bg-black/40 border border-white/5 rounded-lg focus:border-[#C5A059] focus:outline-none text-xs text-neutral-400 text-center"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setFormCompareRows(formCompareRows.filter((_, i) => i !== rIdx));
                                  toast.info('Comparison row deleted');
                                }}
                                className="text-red-400 hover:text-red-300 text-xs font-mono px-2 py-0.5 border border-white/5 rounded bg-black/25 shrink-0 cursor-pointer"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-end pt-1 font-mono">
                        <button
                          type="button"
                          onClick={() => {
                            const newRow: ComparisonRow = {
                              featureName: '',
                              thisBrandValue: '',
                              competitorBrandValue: ''
                            };
                            setFormCompareRows([...formCompareRows, newRow]);
                            toast.success('Matrix comparison row appended');
                          }}
                          className="px-4 py-2 bg-white/5 hover:bg-[#C5A059]/15 border border-white/10 rounded-xl text-xs font-mono text-neutral-300 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Plus size={12} /> Append Matrix Comparison Parameter
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeFormTab === 'seo' && (
              /* STAGE 4: SEO METADATA METRIC */
              <div className="space-y-4">
              <h3 className="text-sm font-serif font-bold text-[#C5A059] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-white/5">
                <Globe size={16} /> 4. SEO & Social Preview Configuration
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">Meta SEO Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Amaan Capital Review — Vetted Real Estate Platforms"
                    value={formSeoTitle}
                    onChange={(e) => setFormSeoTitle(e.target.value)}
                    className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-xl focus:border-[#C5A059] focus:outline-none focus:ring-0 text-sm transition-all"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">Meta Description</label>
                  <input
                    type="text"
                    placeholder="Highly precise operational analysis of Amaan Capital. Read on to analyze core yield indices models of the trust."
                    value={formMetaDescription}
                    onChange={(e) => setFormMetaDescription(e.target.value)}
                    className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-xl focus:border-[#C5A059] focus:outline-none focus:ring-0 text-sm transition-all"
                  />
                </div>

                {/* Advanced Open Graph title override */}
                <div className="space-y-1 md:col-span-2 mt-2">
                  <details className="outline-none cursor-pointer text-xs text-[#C5A059] font-mono selection:bg-transparent">
                    <summary className="hover:underline select-none font-bold">Advanced Settings: Customize Open Graph Social Title (Optional)</summary>
                    <div className="space-y-2.5 mt-4 cursor-default pl-3 border-l-2 border-[#C5A059]/40">
                      <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">Open Graph Social Title Override</label>
                      <input
                        type="text"
                        placeholder="Defaults to standard SEO Title if left empty"
                        value={formOgTitle}
                        onChange={(e) => setFormOgTitle(e.target.value)}
                        className="w-full px-4 py-2 bg-black/45 border border-white/10 rounded-xl focus:border-[#C5A059] focus:outline-none focus:ring-0 text-xs text-white"
                      />
                    </div>
                  </details>
                </div>
              </div>
            </div>
          )}

          {activeFormTab === 'trust' && (
              /* STAGE 3.75: AUTHOR, TRUST, & RELATED CURATIONS */
              <div className="space-y-6">
              <h3 className="text-sm font-serif font-bold text-[#C5A059] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-white/5">
                <ShieldCheck size={16} /> 3.75 Author, Trust & Related Curations Module
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Author Name */}
                <div className="space-y-1.5 font-sans">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">Review Author / Auditor Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AmaanEstate Editorial Board"
                    value={formReviewerName}
                    onChange={(e) => setFormReviewerName(e.target.value)}
                    className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-xl focus:border-[#C5A059] focus:outline-none text-sm text-white"
                  />
                </div>

                {/* Last Updated Date text representation */}
                <div className="space-y-1.5 font-sans">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">Display Publish/Last Updated Date Text</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. October 12, 2026"
                    value={formLastUpdatedDate}
                    onChange={(e) => setFormLastUpdatedDate(e.target.value)}
                    className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-xl focus:border-[#C5A059] focus:outline-none text-sm text-white font-mono"
                  />
                </div>

                {/* Author Avatar Image URL */}
                <div className="space-y-1.5 md:col-span-2 font-sans">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">Reviewer Avatar Image URL</label>
                  <input
                    type="text"
                    placeholder="e.g. https://images.unsplash.com/photo-..."
                    value={formReviewerAvatar}
                    onChange={(e) => setFormReviewerAvatar(e.target.value)}
                    className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-xl focus:border-[#C5A059] focus:outline-none text-sm text-white font-mono"
                  />
                </div>

                {/* Review Methodology Text Area */}
                <div className="space-y-1.5 md:col-span-2 font-sans">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">Structured Review Methodology</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Define methodology criteria, validation techniques, escrows, yields and regulatory indicators checked..."
                    value={formReviewMethodology}
                    onChange={(e) => setFormReviewMethodology(e.target.value)}
                    className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-xl focus:border-[#C5A059] focus:outline-none text-sm text-white"
                  />
                </div>
              </div>

              {/* MANUAL RELATED REVIEWS NETWORK SELECTOR */}
              <div className="bg-black/20 p-5 rounded-2xl border border-white/5 space-y-4 text-left font-sans">
                <div className="border-b border-white/5 pb-3">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[#C5A059] font-bold">Manual Related Reviews & Curations Selector</h4>
                  <p className="text-[10px] text-neutral-400 mt-0.5">Link similar analyzed models to make navigation easy and auto-recommend related opportunities horizontally.</p>
                </div>

                {reviews.length <= 1 ? (
                  <p className="text-xs text-neutral-500 italic py-4">No other active reviews compiled inside the database directory to link.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {reviews
                      .filter(r => r.slug !== formSlug)
                      .map((rev) => {
                        const isSelected = formRelatedReviewIds.includes(rev.id);
                        return (
                          <label
                            key={rev.id}
                            className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#C5A059]/10 border-[#C5A059] text-white'
                                : 'bg-black/20 border-white/5 text-neutral-400 hover:border-white/10 hover:text-white'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormRelatedReviewIds([...formRelatedReviewIds, rev.id]);
                                } else {
                                  setFormRelatedReviewIds(formRelatedReviewIds.filter(id => id !== rev.id));
                                }
                              }}
                              className="rounded border-white/10 accent-[#C5A059] mt-0.5"
                            />
                            <div>
                              <div className="text-[11px] font-bold leading-tight line-clamp-2">{rev.title}</div>
                              <div className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider mt-1">{rev.category}</div>
                            </div>
                          </label>
                        );
                      })}
                  </div>
                )}
                <div className="text-[10px] text-neutral-500 font-mono flex items-center gap-1.5">
                  <span>Selected relationships:</span>
                  <span className="text-[#C5A059] font-bold">{formRelatedReviewIds.length} review anchors</span>
                  {formRelatedReviewIds.length === 0 && (
                    <span className="text-neutral-600 italic">— Will automatically render and fallback to platform counterparts of matched tags</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeFormTab === 'analytics' && (
              /* STAGE 5: AFFILIATE PERFORMANCE ANALYTICS */
              <div className="space-y-4">
              <h3 className="text-sm font-serif font-bold text-[#C5A059] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-white/5">
                <SlidersHorizontal size={16} /> 5. Affiliate Analytics & Administrative Notes
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5 font-mono">
                  <label className="text-[11px] uppercase tracking-wider text-neutral-400">Review Views</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formViews}
                    onChange={(e) => setFormViews(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-xl focus:border-[#C5A059] focus:outline-none focus:ring-0 text-sm transition-all"
                  />
                </div>

                <div className="space-y-1.5 font-mono">
                  <label className="text-[11px] uppercase tracking-wider text-neutral-400">Affiliate Clicks</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formClicks}
                    onChange={(e) => setFormClicks(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-xl focus:border-[#C5A059] focus:outline-none focus:ring-0 text-sm transition-all"
                  />
                </div>

                <div className="space-y-1.5 font-mono">
                  <label className="text-[11px] uppercase tracking-wider text-neutral-400">CTR (Click-Through Rate)</label>
                  <div className="w-full px-4 py-2 bg-neutral-900 border border-white/5 rounded-xl text-sm text-[#C5A059] font-bold h-[38px] flex items-center">
                    {formViews > 0 ? ((formClicks / formViews) * 100).toFixed(2) : '0.00'} %
                  </div>
                </div>

                <div className="space-y-1.5 md:col-span-3">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">Internal Revenue Notes (Private)</label>
                  <textarea
                    rows={2}
                    placeholder="Provide administrative annotations relative to transaction models or fee rates..."
                    value={formRevenueNotes}
                    onChange={(e) => setFormRevenueNotes(e.target.value)}
                    className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-xl focus:border-[#C5A059] focus:outline-none focus:ring-0 text-sm transition-all"
                  />
                </div>

                {formLastUpdatedTimestamp && (
                  <div className="md:col-span-3 text-[10px] font-mono text-neutral-500 italic block">
                    Last Saved Metric Timestamp: {new Date(formLastUpdatedTimestamp).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeFormTab === 'publishing' && (
              /* STAGE 6: PUBLISHING PROTOCOL */
              <div className="space-y-6 bg-black/20 p-5 rounded-2xl border border-white/5 text-left">
                <div className="border-b border-white/5 pb-3">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[#C5A059] font-bold">6. Publishing Protocol & System Status Matrix</h4>
                  <p className="text-[10px] text-neutral-400 mt-0.5">Control the public visibility index state and index criteria configurations.</p>
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono uppercase text-neutral-400 tracking-wider">Set Initial Status Matrix:</span>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="bg-black border border-white/15 text-white text-xs px-4 py-2 rounded-xl focus:border-[#C5A059] focus:outline-none font-semibold uppercase tracking-wider font-mono cursor-pointer"
                    >
                      <option value="draft">Draft</option>
                      <option value="pending">Pending Review</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div className="text-[10px] text-neutral-500 font-mono">
                    💡 Selecting "Published" will immediately expose this review on the public directory lists and search indexing.
                  </div>
                </div>
              </div>
            )}

            {/* STAGE WORKFLOW BUTTON RUNNERS */}
            <div className="pt-4 border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-neutral-400">
                <span>Direct Navigation Helpers:</span>
                {[
                  { id: 'basic', label: 'Basic' },
                  { id: 'campaign', label: 'Campaign' },
                  { id: 'editorial', label: 'Editorial' },
                  { id: 'interactive', label: 'Interactive' },
                  { id: 'seo', label: 'SEO' },
                  { id: 'trust', label: 'Trust' },
                  { id: 'analytics', label: 'Analytics' },
                  { id: 'publishing', label: 'Publish' }
                ].map((th) => (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => setActiveFormTab(th.id as any)}
                    className={`underline hover:text-white px-1 py-0.5 cursor-pointer rounded ${activeFormTab === th.id ? 'text-[#C5A059] font-bold' : ''}`}
                  >
                    {th.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 justify-end">
                <Button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="bg-white/5 border border-white/10 hover:bg-white/10 text-neutral-300 font-semibold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider h-11"
                >
                  Cancel changes
                </Button>
                
                <Button
                  type="submit"
                  className="bg-[#C5A059] hover:bg-[#D4AF37] text-black font-bold uppercase tracking-wider text-xs px-6 py-2.5 rounded-xl transition-all shadow-lg h-11 cursor-pointer"
                >
                  <Save size={16} className="mr-1.5" /> {editingReview ? 'Save Updates' : 'Publish Protocol'}
                </Button>
              </div>

            </div>

          </form>

        </div>
      )}

      {/* ADMIN-ONLY PREVIEW SIMULATOR */}
      {previewReview && (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#111116] border border-white/5 p-4 rounded-2xl gap-4">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono uppercase bg-[#C5A059]/10 text-[#C5A059] px-2.5 py-1.5 rounded-lg border border-[#C5A059]/20 font-bold tracking-widest">
                PREVIEW MODE SIMULATING
              </span>
              <p className="text-[11px] text-neutral-400">Showing the exact frontend render experience for the visitor.</p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => handleOpenEditForm(previewReview)}
                className="bg-white/5 border border-white/10 text-white hover:bg-[#C5A059]/10 px-4 py-2 text-xs rounded-xl h-9"
              >
                <Edit3 size={12} className="mr-1.5" /> Edit Again
              </Button>
              <Button
                onClick={() => setPreviewReview(null)}
                className="bg-[#C5A059] text-black hover:bg-[#D4AF37] px-4 py-2 font-bold text-xs rounded-xl h-9 cursor-pointer"
              >
                <Undo2 size={12} className="mr-1.5" /> Close Preview
              </Button>
            </div>
          </div>

          {/* SIMULATED VISITOR EXPERIENCE PAGE */}
          <div className="bg-[#0c0c0f] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
            
            {/* Header image banner placeholder */}
            <div className="relative h-64 md:h-80 w-full bg-neutral-950 overflow-hidden">
              <img
                src={previewReview.featuredImage || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200&auto=format&fit=crop'}
                alt={previewReview.title}
                className="w-full h-full object-cover opacity-60"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0f] via-[#0c0c0f]/40 to-transparent" />
              
              <div className="absolute bottom-6 left-6 md:left-10 md:bottom-10 right-6 space-y-3">
                <span className="bg-[#C5A059] text-black text-[9px] font-mono tracking-widest font-black uppercase px-2.5 py-1 rounded-md">
                  {previewReview.category.replace('-', ' ')}
                </span>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-black text-white tracking-wide leading-tight">
                  {previewReview.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 text-[10px] text-neutral-400 font-mono">
                  <div className="flex items-center gap-1">
                    <Clock size={11} />
                    <span>{previewReview.readingTime}</span>
                  </div>
                  <span>•</span>
                  <span>Published: {previewReview.publishDate}</span>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-10 space-y-8">
              
              {/* Affiliate Discosure banner */}
              {previewReview.sponsoredDisclosure !== false && (
                <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl text-[10px] text-neutral-400 max-w-xl font-mono leading-normal">
                  <span className="text-[#C5A059] font-bold uppercase tracking-wider block mb-1">Sponsored Partnership Disclosure</span>
                  We maintain a dynamic business alliance with the provider described herein. When clicking referral gateways to establish a private capital account, our network desk manages corresponding fee arrangements.
                </div>
              )}

              {/* Grid content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Main article columns */}
                <div className="lg:col-span-2 space-y-8">
                  
                  {/* Introduction */}
                  <div className="space-y-3">
                    <h2 className="text-lg font-serif text-[#C5A059] font-bold tracking-tight">Introduction</h2>
                    <p className="text-neutral-300 text-sm font-light leading-relaxed whitespace-pre-wrap">
                      {previewReview.introduction}
                    </p>
                  </div>

                  {/* Deep dive platform analytics */}
                  <div className="space-y-3">
                    <h2 className="text-lg font-serif text-[#C5A059] font-bold tracking-tight">What Is This Platform?</h2>
                    <p className="text-neutral-300 text-sm font-light leading-relaxed whitespace-pre-wrap">
                      {previewReview.whatIsIt}
                    </p>
                  </div>

                  {/* Key Features list */}
                  <div className="bg-[#111116] border border-white/5 p-6 rounded-2xl space-y-4">
                    <h3 className="text-sm font-serif text-[#C5A059] uppercase tracking-wider font-bold">Comprehensive Capabilities</h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {previewReview.keyFeatures?.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-neutral-400">
                          <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Pros & Cons Columns list */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    <div className="bg-emerald-950/10 border border-emerald-500/10 p-5 rounded-2xl space-y-3">
                      <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#A3E635]">Strategic Merits</span>
                      <ul className="space-y-2 text-xs">
                        {previewReview.pros?.map((p, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 text-neutral-300">
                            <Check className="text-emerald-400 shrink-0 mt-0.5" size={12} />
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-rose-950/10 border border-rose-500/10 p-5 rounded-2xl space-y-3">
                      <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#F87171]">Noted Limits</span>
                      <ul className="space-y-2 text-xs">
                        {previewReview.cons?.map((c, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 text-neutral-300">
                            <X className="text-rose-400 shrink-0 mt-0.5" size={12} />
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                  </div>

                  {/* Ideal user profile context */}
                  <div className="space-y-3">
                    <h2 className="text-lg font-serif text-[#C5A059] font-bold tracking-tight">Best Matched Demographics</h2>
                    <p className="text-neutral-300 text-sm font-light leading-relaxed whitespace-pre-wrap">
                      {previewReview.bestFor}
                    </p>
                  </div>

                  {/* Pricing Plans Overview */}
                  {previewReview.pricingOverview && (
                    <div className="space-y-3">
                      <h2 className="text-lg font-serif text-[#C5A059] font-bold tracking-tight">Pricing Matrix Options</h2>
                      <p className="text-neutral-300 text-sm font-light leading-relaxed whitespace-pre-wrap">
                        {previewReview.pricingOverview}
                      </p>
                    </div>
                  )}

                  {/* Final Wrap & Score */}
                  <div className="space-y-3">
                    <h2 className="text-lg font-serif text-[#C5A059] font-bold tracking-tight">Final Verdict</h2>
                    <p className="text-neutral-300 text-sm font-light leading-relaxed whitespace-pre-wrap">
                      {previewReview.finalVerdict}
                    </p>
                  </div>

                </div>

                {/* Sidebar Cards Panel (Score summary CTA Card) */}
                <div className="space-y-6">
                  
                  {/* CTA card summary */}
                  <div className="sticky top-6 bg-[#111116] border border-[#C5A059]/20 p-6 rounded-2xl text-center space-y-6">
                    
                    <div className="flex justify-center">
                      <div className="h-14 w-14 bg-black border border-white/10 rounded-2xl flex items-center justify-center text-xl font-serif font-black text-[#C5A059]">
                        {previewReview.brandLogoLetter || 'V'}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-lg font-serif font-bold text-white tracking-tight">{previewReview.brandName}</h3>
                      <div className="flex items-center justify-center gap-1.5 text-amber-500">
                        <Star size={14} className="fill-amber-500" />
                        <span className="text-sm font-bold font-mono">{previewReview.rating} / 5.0</span>
                      </div>
                    </div>

                    <p className="text-neutral-400 text-xs font-light leading-relaxed">
                      {previewReview.ctaSummary || `Establish a direct institutional connection and private channel accounts with ${previewReview.brandName}.`}
                    </p>

                    <a
                      href={previewReview.affiliateUrl || '#'}
                      target={previewReview.externalLink !== false ? '_blank' : undefined}
                      rel="noreferrer"
                      className={`w-full py-3 h-11 px-4 text-xs font-mono font-bold tracking-widest uppercase rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none
                        ${previewReview.ctaButtonStyle === 'solid-emerald' 
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                          : previewReview.ctaButtonStyle === 'outline-gold'
                          ? 'bg-transparent hover:bg-[#C5A059]/10 border border-[#C5A059] text-[#C5A059]'
                          : previewReview.ctaButtonStyle === 'minimal-border'
                          ? 'bg-transparent hover:bg-white/5 border border-white/10 text-white'
                          : 'bg-[#C5A059] hover:bg-[#D4AF37] text-black shadow-lg shadow-[#C5A059]/15'
                        }`}
                    >
                      {previewReview.ctaButtonText || 'Visit Official Website'}
                      <ExternalLink size={12} />
                    </a>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
