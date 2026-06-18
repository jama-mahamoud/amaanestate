import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { articleService } from '@/services/articleService';
import { Article, ArticleStatus } from '@/types';
import Editor from './Editor';
import SimpleImage from './SimpleImage';
import SimpleGallery from './SimpleGallery';
import TagsInput from './TagsInput';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Eye, Layout, Palette, Settings2, Sparkles, AlertCircle,
  Smartphone, Tablet, Monitor, Info, Check, X,
  Search, RefreshCw, EyeOff, Globe, BookOpen, Clock, Tag, ExternalLink
} from 'lucide-react';

export default function ArticleForm({ initialData }: { initialData?: Article }) {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [showPreview, setShowPreview] = useState(false);
  const [splitPreview, setSplitPreview] = useState(false);
  const [previewSize, setPreviewSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [seoPreviewTab, setSeoPreviewTab] = useState<'desktop' | 'mobile' | 'social'>('desktop');
  
  const isAdminOrEditor = profile?.role?.toString().trim().toLowerCase() === 'admin' || profile?.role?.toString().trim().toLowerCase() === 'editor';
  
  const [formData, setFormData] = useState<Partial<Article>>({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    summary: initialData?.summary || '',
    content: initialData?.content || '',
    category: initialData?.category || 'news',
    type: initialData?.type || 'update',
    language: initialData?.language || 'en',
    featuredImage: initialData?.featuredImage || undefined,
    gallery: initialData?.gallery || [],
    tags: initialData?.tags || [],
    
    // Layout
    layoutType: initialData?.layoutType || 'single',
    sidebarPlacement: initialData?.sidebarPlacement || 'right',
    
    // Design
    backgroundColor: initialData?.backgroundColor || 'transparent',
    cardStyle: initialData?.cardStyle || 'glass',
    borderRadius: initialData?.borderRadius || 24,
    shadowIntensity: initialData?.shadowIntensity || 'soft',
    
    // SEO
    seoTitle: initialData?.seoTitle || '',
    seoDescription: initialData?.seoDescription || '',
    focusKeyword: initialData?.focusKeyword || '',
    seoScore: initialData?.seoScore || 0,
    socialImage: initialData?.socialImage || '',
    
    // Advanced
    published: initialData?.published || false,
    isFeatured: initialData?.isFeatured || false,
    visibility: initialData?.visibility || 'public',
    priority: initialData?.priority || 0,
    homepageSection: initialData?.homepageSection || 'default',
    showAuthor: initialData?.showAuthor ?? true,
    publishSchedule: initialData?.publishSchedule || null,
  });

  const [isSaving, setIsSaving] = useState(false);

  // Real-time calculations for SEO
  const totalWordCount = useMemo(() => {
    if (!formData.content) return 0;
    return formData.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
  }, [formData.content]);

  const seoChecks = useMemo(() => {
    const focusKeywordLower = (formData.focusKeyword || '').toLowerCase().trim();
    const hasFocus = focusKeywordLower.length > 0;
    
    const title = formData.title || '';
    const desc = formData.seoDescription || formData.summary || '';
    const firstParagraph = formData.content ? formData.content.replace(/<[^>]*>/g, '').substring(0, 300) : '';

    return [
      {
        id: 'title-presence',
        label: 'Focus Keyword in Article Title',
        description: 'Ensure the main target keyword appears early in your headline.',
        passed: hasFocus && title.toLowerCase().includes(focusKeywordLower),
        impact: 20
      },
      {
        id: 'desc-presence',
        label: 'Focus Keyword in Meta Description',
        description: 'Focus keyword must be cleanly written inside the search summary.',
        passed: hasFocus && desc.toLowerCase().includes(focusKeywordLower),
        impact: 15
      },
      {
        id: 'content-start',
        label: 'Focus Keyword in First Paragraph',
        description: 'Introduce your reader and search bots to your target keyword immediately.',
        passed: hasFocus && firstParagraph.toLowerCase().includes(focusKeywordLower),
        impact: 15
      },
      {
        id: 'title-length',
        label: 'Headline Length Optimization',
        description: 'Title should be 20+ characters for high editorial readability.',
        passed: title.length >= 20 && title.length <= 80,
        current: `${title.length} chars`,
        recommended: '20 - 80 chars',
        impact: 15
      },
      {
        id: 'desc-length',
        label: 'Meta Description Length',
        description: 'Publishing snippets perform best between 60 and 160 characters.',
        passed: desc.length >= 60 && desc.length <= 160,
        current: `${desc.length} chars`,
        recommended: '60 - 160 chars',
        impact: 15
      },
      {
        id: 'word-count',
        label: 'Sufficient Content Length',
        description: 'Detailed writing provides stronger search engines indexing (>100 words).',
        passed: totalWordCount >= 100,
        current: `${totalWordCount} words`,
        recommended: '>= 100 words',
        impact: 10
      },
      {
        id: 'featured-image',
        label: 'Featured Cover Photo Configured',
        description: 'Visual cues boost article click-through rates dramatically.',
        passed: !!formData.featuredImage,
        impact: 10
      }
    ];
  }, [formData.focusKeyword, formData.title, formData.seoDescription, formData.summary, formData.content, formData.featuredImage, totalWordCount]);

  // Dynamically calculate score
  const computedSeoScore = useMemo(() => {
    let score = 0;
    seoChecks.forEach(c => {
      if (c.passed) score += c.impact;
    });
    return score;
  }, [seoChecks]);

  // Sync computed score directly to form state
  useEffect(() => {
    setFormData(prev => {
      if (prev.seoScore === computedSeoScore) return prev;
      return { ...prev, seoScore: computedSeoScore };
    });
  }, [computedSeoScore]);

  // Auto slug generation as headline is typed
  useEffect(() => {
    if (formData.title && !initialData && (!formData.slug || formData.slug === 'draft-briefing')) {
      const gSlug = formData.title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug: gSlug }));
    }
  }, [formData.title, initialData]);

  const validateFormSEO = (): boolean => {
    if (!formData.title?.trim()) {
      toast.error('The article headline is required before publishing.');
      return false;
    }
    
    // Warn about other fields but do not block publishing
    const warnings: string[] = [];
    if (!formData.summary?.trim()) warnings.push('Summary');
    if (!formData.featuredImage?.url?.trim()) warnings.push('Featured Image');
    if (totalWordCount < 40) warnings.push('Word count is low (under 40 words)');
    if (!formData.category?.trim()) warnings.push('Category');
    
    if (warnings.length > 0) {
      toast.warning(`Editorial Notice: Publishing with warnings (${warnings.join(', ')}).`);
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent, asDraft: boolean = false) => {
    e.preventDefault();
    
    // Validate if publishing
    if (!asDraft) {
      const isValid = validateFormSEO();
      if (!isValid) return;
    }

    setIsSaving(true);
    try {
      const finalStatus: ArticleStatus = asDraft 
        ? 'draft' 
        : (isAdminOrEditor ? 'published' : 'pending');

      const dataToSave = { 
        ...formData, 
        status: finalStatus,
        published: finalStatus === 'published',
        updatedAt: new Date()
      };
      
      if (initialData) {
        await articleService.updateArticle(initialData.id, dataToSave);
        if (asDraft) {
          toast.success('Draft saved successfully');
        } else if (finalStatus === 'published') {
          toast.success('Published premium article live');
        } else {
          toast.success('Submitted for editorial approval review');
        }
      } else {
        await articleService.createArticle(dataToSave as any);
        if (asDraft) {
          toast.success('Draft saved successfully');
        } else if (finalStatus === 'published') {
          toast.success('Published premium article live');
        } else {
          toast.success('Submitted for editorial approval review');
        }
      }
      
      navigate('/dashboard/articles');
    } catch (error) {
      console.error('Failed to save article:', error);
      toast.error('Failed to process editorial transaction.');
    } finally {
      setIsSaving(false);
    }
  };

  const previewContent = (
    <div className={`transition-all duration-500 ease-in-out ${previewSize === 'mobile' ? 'max-w-[390px]' : previewSize === 'tablet' ? 'max-w-[768px]' : 'max-w-6xl'} mx-auto bg-[#070707] min-h-screen rounded-[1.5rem] overflow-hidden border border-white/5 shadow-2xl`}>
      {formData.featuredImage?.url && (
        <div className="w-full aspect-[21/9] relative overflow-hidden">
          <img src={formData.featuredImage.url} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt={formData.featuredImage.caption || formData.title} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-[#070707]/30 to-transparent" />
        </div>
      )}
      <div className="p-6 md:p-12 space-y-6">
        <div className="flex gap-2">
          <span className="bg-[#C5A059]/10 text-[#C5A059] px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-md border border-[#C5A059]/25">{formData.category}</span>
        </div>
        <h1 className="text-2xl md:text-5xl font-display font-light text-white tracking-tight leading-[1.1]">{formData.title || 'Headline Required'}</h1>
        <div className="text-base text-white/50 leading-relaxed italic border-l-2 border-[#C5A059] pl-4">
          {formData.summary || 'Awaiting short description snippet...'}
        </div>
        <article 
          className={`
            prose prose-invert max-w-none break-words text-white/80 leading-relaxed
            prose-p:text-white/80 prose-p:leading-[1.7] prose-p:mb-5 prose-p:text-sm sm:prose-p:text-base
            prose-headings:text-white prose-headings:font-display prose-headings:font-light prose-headings:tracking-tight prose-headings:mb-3
            prose-strong:text-[#C5A059] prose-strong:font-bold
            prose-blockquote:border-l-[#C5A059] prose-blockquote:bg-white/[0.01] prose-blockquote:p-4 prose-blockquote:rounded-r-md prose-blockquote:italic
            prose-img:rounded-lg prose-img:border prose-img:border-white/5 prose-img:my-6
            prose-a:text-[#C5A059] hover:prose-a:text-white prose-a:transition-colors prose-a:underline
            ${formData.layoutType === 'magazine' ? 'first-letter:text-5xl first-letter:font-light first-letter:text-[#C5A059] first-letter:mr-2 first-letter:float-left first-letter:leading-none' : ''}
          `}
          dangerouslySetInnerHTML={{ __html: formData.content || '' }}
        />
      </div>
    </div>
  );

  return (
    <div className={`max-w-full mx-auto min-h-screen flex flex-col ${splitPreview ? 'overflow-hidden h-screen' : ''} bg-[#070707] text-white font-sans antialiased`}>
      
      {/* Modern Premium Publishing Studio Header */}
      <header className="sticky top-0 z-[60] bg-[#070707]/90 backdrop-blur-xl border-b border-white/5 px-6 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
           <div>
              <h1 className="text-base sm:text-lg font-display font-light text-white tracking-tight flex items-center gap-2">
                 <span>Amaan Editorial Studio</span>
                 <span className="px-1.5 py-0.5 rounded text-[9px] bg-white/5 border border-white/10 text-white/40 tracking-wider font-mono">CMS</span>
              </h1>
              <p className="text-white/40 text-[11px] leading-none mt-1 hidden sm:block">Create, optimize, and publish premium editorial content.</p>
           </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            type="button"
            variant="outline" 
            onClick={() => setSplitPreview(!splitPreview)}
            className={`border-white/5 bg-white/[0.02] text-white hover:bg-white/5 h-10 rounded-xl hidden xl:flex px-4 font-medium text-xs ${splitPreview ? 'bg-[#C5A059]/10 border-[#C5A059]/30 text-[#C5A059]' : ''}`}
          >
            <Layout size={14} className="mr-2" /> Preview
          </Button>
          <Button 
            type="button"
            variant="outline" 
            className="border-white/5 bg-white/[0.02] text-white hover:bg-white/5 h-10 rounded-xl px-4 font-medium text-xs"
            onClick={() => setShowPreview(true)}
          >
            <Eye size={14} className="mr-2 text-[#C5A059]" /> Fullscreen
          </Button>
          <div className="w-px h-6 bg-white/10 mx-1 hidden sm:block" />
          <Button 
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={isSaving}
            className="bg-white/5 border border-white/10 text-white h-10 rounded-xl hover:bg-white/10 px-4 text-xs font-semibold"
          >
            Save Draft
          </Button>
          <Button 
            type="button"
            onClick={(e) => handleSubmit(e, false)}
            disabled={isSaving}
            className="bg-[#C5A059] text-black h-10 rounded-xl hover:bg-white px-5 text-xs font-semibold shadow-md shadow-[#C5A059]/10"
          >
            Publish Article
          </Button>
        </div>
      </header>

      {/* Editor Main Desk Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Editorial Form Settings */}
        <div className={`flex-1 overflow-y-auto luxury-scroll px-4 sm:px-8 py-8 ${splitPreview ? 'max-w-[50%]' : 'max-w-5xl mx-auto'}`}>
          <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-12 pb-32">
            
            {/* Article */}
            <section id="content" className="space-y-5 scroll-mt-24">
              <h2 className="text-sm font-display font-medium text-white tracking-tight px-1">Content</h2>
              
              <div className="bg-[#0f0f0f]/80 backdrop-blur-xl p-6 sm:p-8 rounded-[1.25rem] border border-white/5 space-y-6 shadow-xl relative overflow-hidden">
                <div className="space-y-1.5">
                  <Input 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})} 
                    required 
                    placeholder="Article Headline"
                    className="bg-white/[0.02] border border-white/5 text-white text-lg rounded-xl placeholder:text-white/20 px-4 focus-visible:ring-[#C5A059]" 
                  />
                </div>

                <div className="space-y-1.5">
                  <Textarea 
                    value={formData.summary} 
                    onChange={e => setFormData({...formData, summary: e.target.value})} 
                    required 
                    placeholder="Short description for preview..."
                    className="bg-white/[0.02] border border-white/5 text-white min-h-[100px] rounded-xl resize-none placeholder:text-white/20 text-sm leading-relaxed p-4 focus-visible:ring-[#C5A059]" 
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="text-[11px] text-white/50 mb-2 flex items-center gap-1.5 px-1 font-medium">
                    <Sparkles size={12} className="text-[#C5A059]" />
                    <span>Writing Canvas</span>
                  </div>
                  <div className="bg-white/[0.01] border border-white/5 rounded-xl overflow-hidden p-1">
                    <Editor content={formData.content || ''} onChange={(html) => setFormData({...formData, content: html})} />
                  </div>
                </div>
              </div>
            </section>

            {/* Visuals */}
            <section id="visuals" className="space-y-5 scroll-mt-24">
              <h2 className="text-sm font-display font-medium text-white tracking-tight px-1">Visuals</h2>
              
              <div className="bg-[#0f0f0f]/80 backdrop-blur-xl p-6 sm:p-8 rounded-[1.25rem] border border-white/5 space-y-6 shadow-xl">
                 <div className="p-1 rounded-xl bg-white/[0.01] border border-white/5">
                   <SimpleImage 
                     label="Featured Image" 
                     value={formData.featuredImage} 
                     onChange={(image) => setFormData({...formData, featuredImage: image})} 
                   />
                 </div>
                
                <div className="pt-2">
                   <SimpleGallery 
                     images={formData.gallery || []} 
                     onChange={(images) => setFormData({...formData, gallery: images})} 
                   />
                </div>
              </div>
            </section>

            {/* Design */}
            <section id="design" className="space-y-5 scroll-mt-24">
              <h2 className="text-sm font-display font-medium text-white tracking-tight px-1">Design</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#0f0f0f]/80 backdrop-blur-xl p-6 sm:p-8 rounded-[1.25rem] border border-white/5 space-y-4 shadow-xl">
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-white/50 text-[11px] font-medium">Layout</label>
                      <Select value={formData.layoutType} onValueChange={(val: any) => setFormData({...formData, layoutType: val})}>
                        <SelectTrigger className="bg-white/5 border border-white/5 text-white h-11 rounded-lg text-xs px-3 focus-visible:ring-[#C5A059]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0f0f0f] border border-white/10 text-white p-1 rounded-xl">
                          <SelectItem value="single" className="rounded-lg text-xs py-2 h-9">Minimal</SelectItem>
                          <SelectItem value="two-column" className="rounded-lg text-xs py-2 h-9">Dual Column</SelectItem>
                          <SelectItem value="featured" className="rounded-lg text-xs py-2 h-9">Hero Immersive</SelectItem>
                          <SelectItem value="magazine" className="rounded-lg text-xs py-2 h-9">Signature</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-white/50 text-[11px] font-medium">Sidebar</label>
                      <Select value={formData.sidebarPlacement} onValueChange={(val: any) => setFormData({...formData, sidebarPlacement: val})}>
                        <SelectTrigger className="bg-white/5 border border-white/5 text-white h-11 rounded-lg text-xs px-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0f0f0f] border border-white/10 text-white p-1 rounded-xl">
                          <SelectItem value="none" className="rounded-lg text-xs py-2 h-9">None</SelectItem>
                          <SelectItem value="left" className="rounded-lg text-xs py-2 h-9">Left</SelectItem>
                          <SelectItem value="right" className="rounded-lg text-xs py-2 h-9">Right</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0f0f0f]/80 backdrop-blur-xl p-6 sm:p-8 rounded-[1.25rem] border border-white/5 space-y-4 shadow-xl">
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-white/50 text-[11px] font-medium">Theme</label>
                      <Select value={formData.cardStyle} onValueChange={(val: any) => setFormData({...formData, cardStyle: val})}>
                        <SelectTrigger className="bg-white/5 border border-white/5 text-white h-11 rounded-lg text-xs px-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0f0f0f] border border-[#0f0f0f] text-white p-1 rounded-xl">
                          <SelectItem value="default" className="rounded-lg text-xs py-2 h-9">Standard</SelectItem>
                          <SelectItem value="glass" className="rounded-lg text-xs py-2 h-9">Glass</SelectItem>
                          <SelectItem value="plain" className="rounded-lg text-xs py-2 h-9">Minimalist</SelectItem>
                          <SelectItem value="premium" className="rounded-lg text-xs py-2 h-9">Premium</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1.5">
                          <label className="text-white/50 text-[11px] font-medium">Radius</label>
                          <Input 
                            type="number"
                            value={formData.borderRadius}
                            onChange={e => setFormData({...formData, borderRadius: parseInt(e.target.value) || 0})}
                            className="bg-white/5 border border-white/5 text-white h-11 rounded-lg font-mono text-xs px-3 focus-visible:ring-[#C5A059]"
                          />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-white/50 text-[11px] font-medium">Shadow</label>
                          <Select value={formData.shadowIntensity} onValueChange={(val: any) => setFormData({...formData, shadowIntensity: val})}>
                            <SelectTrigger className="bg-white/5 border border-white/5 text-white h-11 rounded-lg text-xs px-3">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#0f0f0f] border border-white/10 text-white p-1 rounded-xl">
                              <SelectItem value="none" className="rounded-lg text-xs py-2 h-9">None</SelectItem>
                              <SelectItem value="soft" className="rounded-lg text-xs py-2 h-9">Soft</SelectItem>
                              <SelectItem value="heavy" className="rounded-lg text-xs py-2 h-9">Heavy</SelectItem>
                            </SelectContent>
                          </Select>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* SEO */}
            <section id="seo" className="space-y-5 scroll-mt-24">
              <h2 className="text-sm font-display font-medium text-white tracking-tight px-1">SEO</h2>

              <div className="bg-[#0f0f0f]/80 backdrop-blur-xl p-6 sm:p-8 rounded-[1.25rem] border border-white/5 space-y-8 shadow-xl">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-white/5">
                   <div>
                     <h3 className="text-sm font-medium text-white">SEO Analysis</h3>
                     <p className="text-white/40 text-[11px] mt-0.5">Optimize search visibility</p>
                   </div>
                   
                   <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 p-3 px-5 rounded-2xl">
                      <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
                         <svg className="absolute w-full h-full transform -rotate-90">
                            <circle cx="20" cy="20" r="17" stroke="rgba(255,255,255,0.05)" strokeWidth="3" fill="transparent" />
                            <circle 
                              cx="20" 
                              cy="20" 
                              r="17" 
                              stroke={computedSeoScore >= 80 ? '#10b981' : computedSeoScore >= 50 ? '#f59e0b' : '#ef4444'} 
                              strokeWidth="3.5" 
                              fill="transparent" 
                              strokeDasharray={2 * Math.PI * 17}
                              strokeDashoffset={2 * Math.PI * 17 * (1 - computedSeoScore / 100)}
                              className="transition-all duration-1000 ease-out"
                            />
                         </svg>
                         <span className="text-[10px] font-mono font-bold text-white z-10">{computedSeoScore}%</span>
                      </div>
                      <div className="text-xs font-semibold uppercase tracking-wider">
                         <span className={computedSeoScore >= 80 ? 'text-emerald-400' : computedSeoScore >= 50 ? 'text-amber-400' : 'text-rose-400'}>
                           {computedSeoScore >= 80 ? 'Excellent' : computedSeoScore >= 50 ? 'Good' : 'Needs Work'}
                         </span>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   
                   <div className="space-y-4">
                      <div className="space-y-1.5">
                         <label className="text-white/60 text-[11px] font-medium">Focus Keyword</label>
                         <Input 
                           value={formData.focusKeyword} 
                           onChange={e => setFormData({...formData, focusKeyword: e.target.value})} 
                           placeholder="Enter primary keyword..."
                           className="bg-white/5 border border-white/5 text-white h-11 rounded-lg px-4 text-xs focus-visible:ring-[#C5A059]" 
                         />
                      </div>
                      
                      <div className="space-y-1.5">
                         <label className="text-white/60 text-[11px] font-medium">Meta Description</label>
                         <Textarea 
                           value={formData.seoDescription} 
                           onChange={e => setFormData({...formData, seoDescription: e.target.value})} 
                           placeholder="Snippet description..."
                           className="bg-white/5 border border-white/5 text-white min-h-[80px] rounded-lg resize-none p-4 text-xs focus-visible:ring-[#C5A059]" 
                         />
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-[11px] font-medium text-white/50 mb-2 uppercase tracking-wide">Checks</h4>
                        <div className="space-y-2 max-h-[180px] overflow-y-auto luxury-scroll pr-1">
                           {seoChecks.map(c => (
                              <div key={c.id} className="flex items-start gap-2.5 p-2 rounded-lg bg-white/[0.01] border border-white/[0.03]">
                                 {c.passed ? (
                                    <Check size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                                 ) : (
                                    <AlertCircle size={12} className="text-amber-500 shrink-0 mt-0.5" />
                                 )}
                                 <span className="text-[11px] text-white/80 leading-snug">{c.label}</span>
                              </div>
                           ))}
                        </div>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <SimpleImage 
                        label="Social Image" 
                        value={formData.socialImage ? { url: formData.socialImage, caption: '' } : undefined} 
                        onChange={(image) => setFormData({...formData, socialImage: image?.url})} 
                      />

                      <div className="border border-white/5 bg-white/[0.01] rounded-2xl overflow-hidden shadow-inner">
                         <div className="flex border-b border-white/5 bg-white/[0.01] p-1 gap-1">
                            {['desktop', 'mobile', 'social'].map(tab => (
                              <button 
                                key={tab}
                                type="button" 
                                onClick={() => setSeoPreviewTab(tab as any)}
                                className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${seoPreviewTab === tab ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
                              >
                                {tab}
                              </button>
                            ))}
                         </div>

                         <div className="p-5 min-h-[120px] flex items-center justify-center">
                            {seoPreviewTab === 'desktop' && (
                               <div className="w-full text-left font-serif max-w-sm">
                                  <div className="flex items-center gap-1 text-[10px] text-white/30 mb-1">
                                     <span>amaanestate.so</span>
                                  </div>
                                  <h4 className="text-sky-400 text-sm font-sans font-medium hover:underline cursor-pointer leading-tight mb-0.5">
                                     {formData.seoTitle || formData.title || 'Headline'}
                                  </h4>
                                  <p className="text-white/50 text-[11px] leading-relaxed line-clamp-2">
                                     {formData.seoDescription || formData.summary || 'Snippet...'}
                                  </p>
                               </div>
                            )}

                            {seoPreviewTab === 'mobile' && (
                               <div className="w-full text-left max-w-xs bg-[#0b0b0b] p-3 rounded-lg border border-white/5 font-serif text-[10px]">
                                  <div className="text-white/40 mb-0.5">amaanestate.so</div>
                                  <h4 className="text-[#C5A059] font-sans font-medium leading-snug mb-0.5">
                                     {formData.seoTitle || formData.title || 'Headline'}
                                  </h4>
                                  <p className="text-white/40 leading-normal line-clamp-2">
                                     {formData.seoDescription || formData.summary || 'Snippet...'}
                                  </p>
                               </div>
                            )}

                            {seoPreviewTab === 'social' && (
                               <div className="w-full text-left max-w-xs bg-white/[0.01] rounded-lg border border-white/5 overflow-hidden font-sans">
                                  <div className="aspect-[1.91/1] w-full bg-white/5 relative flex items-center justify-center overflow-hidden">
                                     {formData.socialImage || formData.featuredImage?.url ? (
                                        <img src={formData.socialImage || formData.featuredImage?.url || ''} className="w-full h-full object-cover" alt="Social card" />
                                     ) : (
                                        <div className="text-center p-2 text-[10px] text-white/20">Preview</div>
                                     )}
                                  </div>
                                  <div className="p-2 border-t border-white/5">
                                     <h5 className="text-[10px] font-semibold text-white truncate">{formData.seoTitle || formData.title || 'Headline'}</h5>
                                  </div>
                               </div>
                            )}
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </section>

            {/* Publishing */}
            <section id="publishing" className="space-y-5 scroll-mt-24">
              <h2 className="text-sm font-display font-medium text-white tracking-tight px-1">Publishing</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#0f0f0f]/80 backdrop-blur-xl p-6 sm:p-8 rounded-[1.25rem] border border-white/5 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between p-3 bg-white/[0.01] rounded-lg border border-white/5 cursor-pointer" onClick={() => setFormData({...formData, showAuthor: !formData.showAuthor})}>
                          <p className="text-white font-medium text-xs">Show Author</p>
                          <div className={`w-9 h-5 rounded-full border border-white/10 p-0.5 transition-all ${formData.showAuthor ? 'bg-[#C5A059]' : 'bg-white/5'}`}>
                             <div className={`w-4 h-4 rounded-full bg-[#070707] transition-all ${formData.showAuthor ? 'translate-x-4' : ''}`} />
                          </div>
                    </div>

                    <div className="space-y-1.5">
                         <label className="text-white/50 text-[11px] font-medium">Priority</label>
                         <Select value={formData.priority?.toString()} onValueChange={(val) => setFormData({...formData, priority: parseInt(val) || 0})}>
                           <SelectTrigger className="bg-white/5 border border-white/5 text-white h-11 rounded-lg text-xs px-3">
                             <SelectValue />
                           </SelectTrigger>
                           <SelectContent className="bg-[#0f0f0f] border border-white/10 text-white p-1 rounded-xl">
                             <SelectItem value="0" className="rounded-lg text-xs py-2">Standard</SelectItem>
                             <SelectItem value="1" className="rounded-lg text-xs py-2">Elevated</SelectItem>
                             <SelectItem value="2" className="rounded-lg text-xs py-2">Elite</SelectItem>
                             <SelectItem value="3" className="rounded-lg text-xs py-2 text-rose-500">Alert</SelectItem>
                           </SelectContent>
                         </Select>
                    </div>

                    <div className="space-y-1.5">
                         <label className="text-white/50 text-[11px] font-medium">Visibility</label>
                         <Select value={formData.homepageSection} onValueChange={(val) => setFormData({...formData, homepageSection: val})}>
                           <SelectTrigger className="bg-white/5 border border-white/5 text-white h-11 rounded-lg text-xs px-3">
                             <SelectValue />
                           </SelectTrigger>
                           <SelectContent className="bg-[#0f0f0f] border border-white/10 text-white p-1 rounded-xl">
                             <SelectItem value="default" className="rounded-lg text-xs py-2">Global Feed</SelectItem>
                             <SelectItem value="hero" className="rounded-lg text-xs py-2">Masthead</SelectItem>
                             <SelectItem value="sidebar" className="rounded-lg text-xs py-2">Sidebar</SelectItem>
                           </SelectContent>
                         </Select>
                    </div>
                </div>

                <div className="bg-[#0f0f0f]/80 backdrop-blur-xl p-6 sm:p-8 rounded-[1.25rem] border border-white/5 space-y-4 shadow-xl">
                       <div className="space-y-1.5">
                         <label className="text-white/50 text-[11px] font-medium">URL Slug</label>
                         <Input 
                           value={formData.slug} 
                           onChange={e => setFormData({...formData, slug: e.target.value})} 
                           className="bg-white/5 border border-white/5 text-white h-11 rounded-lg font-mono text-xs px-3 focus-visible:ring-[#C5A059]" 
                         />
                       </div>
                       
                       <div className="space-y-1.5">
                         <label className="text-white/50 text-[11px] font-medium">Category</label>
                         <Select value={formData.category} onValueChange={(val) => setFormData({...formData, category: val})}>
                           <SelectTrigger className="bg-white/5 border border-white/5 text-white h-11 rounded-lg text-xs px-3">
                             <SelectValue />
                           </SelectTrigger>
                           <SelectContent className="bg-[#0f0f0f] border border-white/10 text-white p-1 rounded-xl">
                             <SelectItem value="news" className="rounded-lg text-xs py-2">News</SelectItem>
                             <SelectItem value="report" className="rounded-lg text-xs py-2">Reports</SelectItem>
                             <SelectItem value="opportunity" className="rounded-lg text-xs py-2">Opportunities</SelectItem>
                           </SelectContent>
                         </Select>
                       </div>

                       <div className="space-y-1.5">
                         <label className="text-white/50 text-[11px] font-medium">Article Type (Workflow Tag)</label>
                         <Select value={formData.type} onValueChange={(val) => setFormData({...formData, type: val as any})}>
                           <SelectTrigger className="bg-white/5 border border-white/5 text-white h-11 rounded-lg text-xs px-3">
                             <SelectValue />
                           </SelectTrigger>
                           <SelectContent className="bg-[#0f0f0f] border border-white/10 text-white p-1 rounded-xl">
                             <SelectItem value="update" className="rounded-lg text-xs py-2">Update</SelectItem>
                             <SelectItem value="market_report" className="rounded-lg text-xs py-2">Market Report</SelectItem>
                             <SelectItem value="announcement" className="rounded-lg text-xs py-2">Announcement</SelectItem>
                             <SelectItem value="new_project" className="rounded-lg text-xs py-2">New Project</SelectItem>
                             <SelectItem value="short_insight" className="rounded-lg text-xs py-2">Short Insight</SelectItem>
                           </SelectContent>
                         </Select>
                       </div>

                       <div className="space-y-1.5">
                         <label className="text-white/50 text-[11px] font-medium">Language Setting</label>
                         <Select value={formData.language} onValueChange={(val) => setFormData({...formData, language: val as any})}>
                           <SelectTrigger className="bg-white/5 border border-white/5 text-white h-11 rounded-lg text-xs px-3">
                             <SelectValue />
                           </SelectTrigger>
                           <SelectContent className="bg-[#0f0f0f] border border-white/10 text-white p-1 rounded-xl">
                             <SelectItem value="en" className="rounded-lg text-xs py-2">English</SelectItem>
                             <SelectItem value="so" className="rounded-lg text-xs py-2">Somali</SelectItem>
                           </SelectContent>
                         </Select>
                       </div>
                       
                       <div className="space-y-1.5">
                          <label className="text-white/50 text-[11px] font-medium">Tags</label>
                          <div className="bg-white/[0.01] border border-white/5 rounded-lg p-2.5">
                             <TagsInput value={formData.tags || []} onChange={tags => setFormData({...formData, tags})} />
                          </div>
                       </div>
                </div>
              </div>
            </section>

          </form>
        </div>

        {/* Real-time split preview layout block */}
        {splitPreview && (
          <div className="w-1/2 border-l border-white/5 bg-black/40 overflow-y-auto luxury-scroll p-8">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-[#C5A059] font-display font-light text-sm uppercase tracking-[0.3em]">Live Pulse Render</h3>
               <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/5">
                 <button type="button" onClick={() => setPreviewSize('mobile')} className={`p-2 rounded-lg transition-all ${previewSize === 'mobile' ? 'bg-[#C5A059] text-black' : 'text-white/40'}`}><Smartphone size={13} /></button>
                 <button type="button" onClick={() => setPreviewSize('tablet')} className={`p-2 rounded-lg transition-all ${previewSize === 'tablet' ? 'bg-[#C5A059] text-black' : 'text-white/40'}`}><Tablet size={13} /></button>
                 <button type="button" onClick={() => setPreviewSize('desktop')} className={`p-2 rounded-lg transition-all ${previewSize === 'desktop' ? 'bg-[#C5A059] text-black' : 'text-white/40'}`}><Monitor size={13} /></button>
               </div>
            </div>
            {previewContent}
          </div>
        )}
      </div>

      {/* Full modal overlay screen */}
      <AnimatePresence>
        {showPreview && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col"
          >
             <header className="h-20 border-b border-white/5 px-8 flex items-center justify-between bg-black/90 backdrop-blur-xl">
                <div className="flex items-center gap-8">
                   <h2 className="text-[#C5A059] font-display font-light text-base uppercase tracking-[0.3em]">Cinema Render</h2>
                   <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/5">
                      <button type="button" onClick={() => setPreviewSize('mobile')} className={`py-1.5 px-3 rounded-lg transition-all ${previewSize === 'mobile' ? 'bg-[#C5A059] text-black font-semibold' : 'text-white/40 text-[10px] uppercase font-bold'}`}>Mobile</button>
                      <button type="button" onClick={() => setPreviewSize('tablet')} className={`py-1.5 px-3 rounded-lg transition-all ${previewSize === 'tablet' ? 'bg-[#C5A059] text-black font-semibold' : 'text-white/40 text-[10px] uppercase font-bold'}`}>Tablet</button>
                      <button type="button" onClick={() => setPreviewSize('desktop')} className={`py-1.5 px-3 rounded-lg transition-all ${previewSize === 'desktop' ? 'bg-[#C5A059] text-black font-semibold' : 'text-white/40 text-[10px] uppercase font-bold'}`}>Desktop</button>
                   </div>
                </div>
                <Button variant="ghost" onClick={() => setShowPreview(false)} className="text-white hover:bg-white/10 h-10 rounded-xl px-4 text-xs font-semibold border border-white/10">Back to Studio</Button>
             </header>
             <main className="flex-1 overflow-auto bg-[#070707] p-8 sm:p-16 luxury-scroll">
                {previewContent}
             </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
