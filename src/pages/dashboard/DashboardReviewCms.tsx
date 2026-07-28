import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, Edit3, Trash2, Globe, ExternalLink,
  X, Save, Tag, Image as ImageIcon, Link as LinkIcon, DollarSign,
  Check, AlertCircle, ShoppingBag, Eye, EyeOff, LayoutTemplate, Star, RefreshCw,
  FileText, ShieldCheck, Send, Sparkles, Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { reviewService, EditorialReview } from '@/services/reviewService';
import { toast } from 'sonner';

// Workspace Components
import { ContentEditorWorkspace } from '@/components/dashboard/review-cms/ContentEditorWorkspace';
import { SeoCenterWorkspace } from '@/components/dashboard/review-cms/SeoCenterWorkspace';
import { AffiliateCenterWorkspace } from '@/components/dashboard/review-cms/AffiliateCenterWorkspace';
import { PublishCenterWorkspace } from '@/components/dashboard/review-cms/PublishCenterWorkspace';
import { ReviewLivePreviewCard } from '@/components/dashboard/review-cms/ReviewLivePreviewCard';

type WorkspaceTab = 'content' | 'seo' | 'affiliate' | 'publish';

export default function DashboardReviewCms() {
  const [reviews, setReviews] = useState<EditorialReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [viewState, setViewState] = useState<'list' | 'create' | 'edit'>('list');
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceTab>('content');
  const [showLivePreviewSidebar, setShowLivePreviewSidebar] = useState(true);

  const [form, setForm] = useState<Partial<EditorialReview> | null>(null);

  const [prosText, setProsText] = useState('');
  const [consText, setConsText] = useState('');
  const [featuresText, setFeaturesText] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await reviewService.getAllReviews(false);
      setReviews(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setForm({
      title: '',
      category: 'Software',
      brandName: '',
      rating: 5.0,
      featuredImage: '',
      price: '',
      discountPrice: '',
      affiliateUrl: '',
      status: 'draft',
      introduction: '',
      whatIsIt: '',
      bestFor: '',
      finalVerdict: '',
      gallery: [],
      pros: [],
      cons: [],
      keyFeatures: [],
      seoTitle: '',
      metaDescription: '',
      brandLogoLetter: '',
      excerpt: '',
      slug: '',
      focusKeyword: '',
      canonicalUrl: '',
      faqs: [],
      imageAlts: {},
      affiliateNetworks: [],
      couponCode: '',
      couponDiscount: '',
      couponExpiry: '',
      discountLabel: '',
      scheduledPublishDate: '',
      scheduledPublishTime: '12:00',
      timezone: 'UTC',
      autoUpdateDays: 90,
      revisionHistory: []
    });
    setProsText('');
    setConsText('');
    setFeaturesText('');
    setActiveWorkspace('content');
    setViewState('create');
  };

  const handleEdit = (rev: EditorialReview) => {
    setForm({ ...rev });
    setProsText(rev.pros?.join('\n') || '');
    setConsText(rev.cons?.join('\n') || '');
    setFeaturesText(rev.keyFeatures?.join('\n') || '');
    setActiveWorkspace('content');
    setViewState('edit');
  };

  const cancelEdit = () => {
    setViewState('list');
    setForm(null);
  };

  const handleFieldChange = (field: keyof EditorialReview, value: any) => {
    if (form) setForm({ ...form, [field]: value });
  };

  const handleToggleStatus = async (item: EditorialReview) => {
    const newStatus = item.status === 'published' ? 'draft' : 'published';
    try {
      await reviewService.updateStatus(item.id, newStatus);
      toast.success(`Set to ${newStatus}`);
      loadData();
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this review entirely?")) return;
    try {
      await reviewService.deleteReview(id);
      toast.success("Deleted successfully");
      loadData();
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  const parseLines = (text: string) => {
    return text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  };

  const handleSave = async (statusOverride?: 'draft' | 'published') => {
    if (!form) return;
    if (!form.title) {
      toast.error("Product Title is required");
      return;
    }

    try {
      const isNew = viewState === 'create';
      let docSlug = form.slug;
      if (!docSlug) {
        docSlug = await reviewService.ensureUniqueSlug(form.title, form.id);
      }

      const baseExcerpt = form.introduction?.substring(0, 150) || form.excerpt || form.title;
      const brandL = form.brandName ? form.brandName.charAt(0).toUpperCase() : form.title.charAt(0).toUpperCase();

      const payload: Omit<EditorialReview, 'createdAt' | 'updatedAt'> = {
        id: docSlug,
        slug: docSlug,
        title: form.title || '',
        category: form.category || 'Software',
        featuredImage: form.featuredImage || '',
        excerpt: form.excerpt || baseExcerpt,
        introduction: form.introduction || '',
        whatIsIt: form.whatIsIt || '',
        keyFeatures: parseLines(featuresText),
        pros: parseLines(prosText),
        cons: parseLines(consText),
        bestFor: form.bestFor || '',
        finalVerdict: form.finalVerdict || '',
        rating: Number(form.rating) || 5.0,
        price: form.price || '',
        discountPrice: form.discountPrice || '',
        brandName: form.brandName || form.title || '',
        brandLogoLetter: brandL,
        affiliateUrl: form.affiliateUrl || '',
        ctaSummary: form.ctaSummary || 'Get this deal today',
        gallery: form.gallery || [],
        seoTitle: form.seoTitle || form.title || '',
        metaDescription: form.metaDescription || baseExcerpt,
        status: statusOverride || form.status || 'draft',
        publishDate: form.publishDate || new Date().toISOString().split('T')[0],
        
        // Workspace Extensions
        focusKeyword: form.focusKeyword || '',
        canonicalUrl: form.canonicalUrl || `https://www.amaanestate.com/review/${docSlug}`,
        faqs: form.faqs || [],
        imageAlts: form.imageAlts || {},
        affiliateNetworks: form.affiliateNetworks || [],
        couponCode: form.couponCode || '',
        couponDiscount: form.couponDiscount || '',
        couponExpiry: form.couponExpiry || '',
        discountLabel: form.discountLabel || '',
        scheduledPublishDate: form.scheduledPublishDate || '',
        scheduledPublishTime: form.scheduledPublishTime || '12:00',
        timezone: form.timezone || 'UTC',
        autoUpdateDays: form.autoUpdateDays || 90,
        revisionHistory: form.revisionHistory || []
      };

      if (isNew) {
        await reviewService.createReview(payload);
        toast.success("Review Created Successfully!");
      } else {
        await reviewService.updateReview(form.id!, payload);
        toast.success("Review Saved Successfully!");
      }
      cancelEdit();
      loadData();
    } catch (e) {
      console.error(e);
      toast.error("Save failed. See console.");
    }
  };

  const filteredItems = useMemo(() => {
    return reviews.filter(d => {
      const match = d.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    d.brandName.toLowerCase().includes(searchQuery.toLowerCase());
      if (statusFilter === 'all') return match;
      return match && d.status === statusFilter;
    });
  }, [reviews, searchQuery, statusFilter]);

  // ================= LIST VIEW =================
  if (viewState === 'list') {
    return (
      <div className="p-6 md:p-10 max-w-[1600px] mx-auto min-h-screen text-white">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-3xl font-display font-light text-white flex items-center gap-3">
              <LayoutTemplate className="text-blue-500" size={28} /> Amaan Editorial Reviews CMS
            </h1>
            <p className="text-white/40 text-sm mt-2">Professional editorial workspace (TechRadar & G2 Grade Editorial Suite).</p>
          </div>
          <Button 
            onClick={handleCreateNew}
            className="bg-blue-600 text-white hover:bg-blue-500 transition-colors h-12 px-6 rounded-xl font-medium shadow-lg shadow-blue-500/20"
          >
            <Plus size={16} className="mr-2" /> Write New Review
          </Button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <Input 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search reviews by title, brand, category..."
              className="bg-white/5 border-white/5 pl-11 h-12 text-white placeholder:text-white/20"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'published', 'draft'].map(s => (
              <button 
                key={s}
                onClick={() => setStatusFilter(s)} 
                className={`px-4 h-12 rounded-xl text-xs uppercase tracking-wider font-mono font-bold transition-all border ${
                  statusFilter === s 
                    ? 'bg-blue-600/10 text-blue-500 border-blue-500/30' 
                    : 'bg-transparent border-white/10 text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table List */}
        {loading ? (
          <div className="py-20 flex justify-center"><RefreshCw className="animate-spin text-white/40" size={24} /></div>
        ) : filteredItems.length === 0 ? (
          <div className="py-20 text-center border border-white/5 rounded-3xl bg-white/[0.02]">
            <p className="text-white/40">No reviews found in CMS database.</p>
          </div>
        ) : (
          <div className="bg-[#0a0a0f] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 text-white/40 bg-white/5 font-mono text-xs uppercase tracking-wider">
                  <th className="p-4">Product Details</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 flex gap-4 min-w-[280px]">
                      {item.featuredImage ? (
                        <img src={item.featuredImage} alt={item.title} className="w-14 h-14 object-cover rounded-xl border border-white/10 bg-black/50 shrink-0" />
                      ) : (
                        <div className="w-14 h-14 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-[10px] text-white/30 font-mono shrink-0">
                          No Image
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-white text-base">{item.title}</div>
                        <div className="text-xs text-white/50 mt-1">{item.brandName || 'Brand'} • Slug: /{item.slug}</div>
                      </div>
                    </td>
                    <td className="p-4 text-white/70 font-mono text-xs">
                      {item.category}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-amber-400 font-mono font-bold text-xs">
                        <Star size={12} className="fill-amber-400" /> {item.rating || '5.0'}
                      </div>
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => handleToggleStatus(item)}
                        className={`px-3 py-1 text-[10px] font-mono font-bold uppercase rounded-lg border transition-all ${
                          item.status === 'published' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' 
                            : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20'
                        }`}
                      >
                        {item.status}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(item)} className="hover:bg-blue-500 hover:text-white mr-2">
                        <Edit3 size={15}/>
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(item.id)} className="hover:bg-red-500 hover:text-white">
                        <Trash2 size={15}/>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // ================= WORKSPACE EDITOR VIEW =================
  return (
    <div className="p-4 md:p-8 max-w-[1700px] mx-auto min-h-screen text-white bg-[#030303] rounded-3xl border border-white/5 shadow-2xl relative">
      
      {/* Top Bar: Navigation & Action Controls */}
      <div className="sticky top-0 z-40 pb-4 mb-8 border-b border-white/10 bg-gradient-to-b from-[#030303] via-[#030303]/95 to-[#030303]/80 backdrop-blur-md pt-2 space-y-4">
        
        {/* Row 1: Title & Main Buttons */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={cancelEdit} className="text-white/50 hover:text-white p-2">
              <X size={20}/>
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  {viewState === 'create' ? 'New Review' : 'Editing Review'}
                </span>
                <span className="text-xs text-white/40">/{form?.slug || 'slug'}</span>
              </div>
              <h2 className="text-xl font-serif text-white font-semibold">
                {form?.title ? form.title : 'Untitled Editorial Review'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLivePreviewSidebar(!showLivePreviewSidebar)}
              className="text-white/60 hover:text-white text-xs hidden md:flex"
            >
              {showLivePreviewSidebar ? <EyeOff size={15} className="mr-1.5"/> : <Eye size={15} className="mr-1.5"/>}
              {showLivePreviewSidebar ? 'Hide Live Card' : 'Show Live Card'}
            </Button>

            <Button
              variant="outline"
              onClick={() => handleSave('draft')}
              className="h-10 px-4 rounded-xl border-white/10 text-white hover:bg-white/10 text-xs"
            >
              <Save size={14} className="mr-1.5"/> Save Draft
            </Button>

            <Button
              onClick={() => handleSave('published')}
              className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-lg shadow-blue-500/20"
            >
              <Send size={14} className="mr-1.5"/> Publish Review
            </Button>
          </div>
        </div>

        {/* Row 2: Four Workspace Tabs Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-t border-white/5 pt-3">
          {[
            { id: 'content', name: '🟢 Content Editor' },
            { id: 'seo', name: '🟣 SEO Center' },
            { id: 'affiliate', name: '🟠 Affiliate Center' },
            { id: 'publish', name: '⚫ Publish Center' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveWorkspace(tab.id as WorkspaceTab)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all border whitespace-nowrap ${
                activeWorkspace === tab.id
                  ? 'bg-white/10 border-white/30 text-white shadow-lg shadow-white/5'
                  : 'bg-black/40 border-white/5 text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Workspace Body Grid */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Main Workspace Column */}
        <div className="flex-1 min-w-0 pb-32">
          {form && activeWorkspace === 'content' && (
            <ContentEditorWorkspace
              form={form}
              handleFieldChange={handleFieldChange}
              prosText={prosText}
              setProsText={setProsText}
              consText={consText}
              setConsText={setConsText}
              featuresText={featuresText}
              setFeaturesText={setFeaturesText}
            />
          )}

          {form && activeWorkspace === 'seo' && (
            <SeoCenterWorkspace
              form={form}
              handleFieldChange={handleFieldChange}
            />
          )}

          {form && activeWorkspace === 'affiliate' && (
            <AffiliateCenterWorkspace
              form={form}
              handleFieldChange={handleFieldChange}
            />
          )}

          {form && activeWorkspace === 'publish' && (
            <PublishCenterWorkspace
              form={form}
              handleFieldChange={handleFieldChange}
              handleSave={handleSave}
              onRestoreSnapshot={(snapshot) => {
                setForm({ ...snapshot });
                if (snapshot.pros) setProsText(snapshot.pros.join('\n'));
                if (snapshot.cons) setConsText(snapshot.cons.join('\n'));
                if (snapshot.keyFeatures) setFeaturesText(snapshot.keyFeatures.join('\n'));
              }}
            />
          )}
        </div>

        {/* Right Sidebar: Live Preview Card */}
        {showLivePreviewSidebar && form && (
          <div className="w-full lg:w-[380px] shrink-0 space-y-6">
            <div className="sticky top-32 space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-white/50 uppercase tracking-wider border-b border-white/5 pb-2">
                <span>Front-end Live Card Preview</span>
                <span className="text-blue-400 font-bold">Real-time</span>
              </div>

              <ReviewLivePreviewCard form={form} />

              <div className="bg-[#0a0a0e] border border-white/5 rounded-2xl p-4 text-xs space-y-3 font-mono">
                <div className="text-white/40 uppercase tracking-widest text-[10px]">Quick Summary Data</div>
                <div className="flex justify-between text-white/70">
                  <span>Category:</span>
                  <span className="text-white font-bold">{form.category || 'Software'}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Status:</span>
                  <span className={`font-bold ${form.status === 'published' ? 'text-emerald-400' : 'text-yellow-400'}`}>
                    {form.status || 'draft'}
                  </span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Rating:</span>
                  <span className="text-amber-400 font-bold">{form.rating || '5.0'} / 5.0</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
