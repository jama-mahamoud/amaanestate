import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { articleService } from '@/services/articleService';
import { Article } from '@/types';
import Editor from './Editor';
import ImageUpload from './ImageUpload';
import GalleryUpload from './GalleryUpload';
import TagsInput from './TagsInput';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, Save, Globe, Info, Layout, Palette, 
  Settings2, Share2, Sparkles, AlertCircle,
  Smartphone, Tablet, Monitor, History, Clock, CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';

export default function ArticleForm({ initialData }: { initialData?: Article }) {
  const navigate = useNavigate();
  const [showPreview, setShowPreview] = useState(false);
  const [splitPreview, setSplitPreview] = useState(false);
  const [previewSize, setPreviewSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  
  const [formData, setFormData] = useState<Partial<Article>>({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    summary: initialData?.summary || '',
    content: initialData?.content || '',
    category: initialData?.category || 'news',
    language: initialData?.language || 'en',
    featuredImage: initialData?.featuredImage || '',
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
    priority: initialData?.priority || 0,
    homepageSection: initialData?.homepageSection || 'default',
    showAuthor: initialData?.showAuthor ?? true,
    publishSchedule: initialData?.publishSchedule || null,
  });

  const [isSaving, setIsSaving] = useState(false);

  // SEO Score auto-calculation (Simulated)
  useEffect(() => {
    let score = 0;
    if (formData.title && formData.title.length > 30) score += 20;
    if (formData.summary && formData.summary.length > 100) score += 20;
    if (formData.content && formData.content.length > 1000) score += 20;
    if (formData.focusKeyword && formData.content?.toLowerCase().includes(formData.focusKeyword.toLowerCase())) score += 20;
    if (formData.featuredImage) score += 20;
    setFormData(prev => ({ ...prev, seoScore: score }));
  }, [formData.title, formData.summary, formData.content, formData.focusKeyword, formData.featuredImage]);

  const handleSubmit = async (e: React.FormEvent, asDraft: boolean = false) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const dataToSave = { 
        ...formData, 
        published: asDraft ? false : formData.published,
        updatedAt: new Date()
      };
      
      if (initialData) {
        await articleService.updateArticle(initialData.id, dataToSave);
      } else {
        await articleService.createArticle(dataToSave as any);
      }
      
      navigate('/dashboard/articles');
    } catch (error) {
      console.error('Failed to save article:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const previewContent = (
     <div className={`transition-all duration-700 ease-in-out ${previewSize === 'mobile' ? 'max-w-[400px]' : previewSize === 'tablet' ? 'max-w-[800px]' : 'max-w-7xl'} mx-auto bg-[#050505] min-h-screen rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl`}>
        {formData.featuredImage && (
          <div className="w-full aspect-[21/9] relative overflow-hidden">
            <img src={formData.featuredImage} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
          </div>
        )}
        <div className="p-8 md:p-16">
          <div className="flex gap-3 mb-10">
            <span className="bg-luxury-gold text-luxury-black px-6 py-2 text-[10px] font-black uppercase tracking-[0.4em] rounded-full">{formData.category} ANALYSIS</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-display font-black text-white tracking-tighter mb-10 leading-[0.85] uppercase">{formData.title || 'Briefing Headline Required'}</h1>
          <div className="text-xl text-white/50 leading-relaxed italic mb-16 font-serif border-l-4 border-luxury-gold pl-10">
            {formData.summary || 'Awaiting executive summary synchronization...'}
          </div>
          <article 
            className="prose prose-invert prose-luxury max-w-none text-xl text-white/70 leading-loose prose-headings:font-display prose-headings:font-black prose-headings:tracking-tighter prose-headings:text-white prose-p:mb-10"
            dangerouslySetInnerHTML={{ __html: formData.content || '' }}
          />
        </div>
     </div>
  );

  return (
    <div className={`max-w-full mx-auto min-h-screen flex flex-col ${splitPreview ? 'overflow-hidden h-screen' : ''}`}>
      
      {/* Editorial Navigation Header */}
      <header className="sticky top-0 z-[60] bg-black/60 backdrop-blur-3xl border-b border-white/5 px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
           <div>
              <h1 className="text-xl font-display font-black text-white tracking-[0.2em] uppercase">Editorial Deck</h1>
              <p className="text-luxury-gold text-[8px] tracking-[0.5em] font-black uppercase mt-1">Amaan Intelligence System • Secure Access</p>
           </div>
           <div className="w-px h-10 bg-white/10 hidden md:block" />
           <div className="hidden lg:flex items-center gap-8">
              <a href="#content" className="text-[10px] uppercase font-black tracking-widest text-white/40 hover:text-luxury-gold transition-colors">01. Intel</a>
              <a href="#media" className="text-[10px] uppercase font-black tracking-widest text-white/40 hover:text-luxury-gold transition-colors">02. Assets</a>
              <a href="#layout" className="text-[10px] uppercase font-black tracking-widest text-white/40 hover:text-luxury-gold transition-colors">03. Framework</a>
              <a href="#seo" className="text-[10px] uppercase font-black tracking-widest text-white/40 hover:text-luxury-gold transition-colors">04. Indexing</a>
           </div>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            type="button"
            variant="outline" 
            onClick={() => setSplitPreview(!splitPreview)}
            className={`border-white/10 text-white h-11 rounded-xl hidden xl:flex hover:bg-white/5 px-6 font-bold uppercase text-[9px] tracking-widest ${splitPreview ? 'bg-luxury-gold/10 border-luxury-gold/50 text-luxury-gold' : ''}`}
          >
            <Layout size={14} className="mr-3" /> Split View
          </Button>
          <Button 
            type="button"
            variant="outline" 
            className="border-white/10 text-white h-11 rounded-xl hover:bg-white/5 px-6 font-bold uppercase text-[9px] tracking-widest"
            onClick={() => setShowPreview(true)}
          >
            <Eye size={14} className="mr-3 text-luxury-gold" /> Full Render
          </Button>
          <div className="w-px h-8 bg-white/10 mx-2" />
          <Button 
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={isSaving}
            className="bg-white/5 border border-white/10 text-white h-11 rounded-xl hover:bg-white/10 px-6 text-[10px] font-black uppercase tracking-widest"
          >
            Hold
          </Button>
          <Button 
            type="button"
            onClick={(e) => handleSubmit(e, false)}
            disabled={isSaving}
            className="bg-luxury-gold text-luxury-black h-11 rounded-xl hover:bg-white px-8 font-black uppercase tracking-widest shadow-2xl shadow-luxury-gold/20"
          >
            Broadcast
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Editor Section */}
        <div className={`flex-1 overflow-y-auto luxury-scroll px-8 py-12 ${splitPreview ? 'max-w-[50%]' : 'max-w-screen-xl mx-auto'}`}>
          <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-24 pb-40">
            
            {/* 01. CONTENT */}
            <section id="content" className="space-y-10 scroll-mt-32">
              <div className="flex items-center gap-4 mb-4">
                <span className="w-8 h-8 rounded-full bg-luxury-gold text-luxury-black flex items-center justify-center font-black text-xs">01</span>
                <h2 className="text-2xl font-display font-black text-white uppercase tracking-widest">Editorial Insight</h2>
              </div>
              
              <div className="glass-card p-12 rounded-[3.5rem] border border-white/5 space-y-12 shadow-2xl">
                <div className="space-y-4">
                  <label className="text-white/30 text-[9px] font-black uppercase tracking-[0.4em] ml-1">Briefing Identification</label>
                  <Input 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})} 
                    required 
                    placeholder="Enter briefing headline..."
                    className="bg-white/5 border-0 text-white text-4xl h-24 rounded-3xl placeholder:text-white/5 font-display font-black tracking-tight px-10" 
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-white/30 text-[9px] font-black uppercase tracking-[0.4em] ml-1">Executive Precis</label>
                  <Textarea 
                    value={formData.summary} 
                    onChange={e => setFormData({...formData, summary: e.target.value})} 
                    required 
                    placeholder="Sophisticated summary for high-level clearance..."
                    className="bg-white/5 border-0 text-white min-h-[160px] rounded-3xl resize-none placeholder:text-white/5 text-xl leading-relaxed pt-10 px-10 font-serif italic" 
                  />
                </div>
                
                <div className="space-y-4">
                  <label className="text-white/30 text-[9px] font-black uppercase tracking-[0.4em] ml-1">Intelligence Body</label>
                  <Editor content={formData.content || ''} onChange={(html) => setFormData({...formData, content: html})} />
                </div>
              </div>
            </section>

            {/* 02. MEDIA */}
            <section id="media" className="space-y-10 scroll-mt-32">
              <div className="flex items-center gap-4 mb-4">
                <span className="w-8 h-8 rounded-full bg-luxury-gold text-luxury-black flex items-center justify-center font-black text-xs">02</span>
                <h2 className="text-2xl font-display font-black text-white uppercase tracking-widest">Visual Surveillance</h2>
              </div>
              
              <div className="glass-card p-12 rounded-[3.5rem] border border-white/5 space-y-12 shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <ImageUpload 
                     label="Primary Vector Hero" 
                     value={formData.featuredImage || ''} 
                     onChange={(url) => setFormData({...formData, featuredImage: url})} 
                   />
                   <div className="flex flex-col justify-center space-y-8">
                      <div className="p-8 bg-white/5 rounded-3xl border border-white/5 relative overflow-hidden">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-gold/5 blur-3xl rounded-full" />
                         <h4 className="text-white font-black uppercase tracking-widest text-xs mb-4 flex items-center gap-3">
                            <Sparkles size={16} className="text-luxury-gold" /> Optical Normalization
                         </h4>
                         <p className="text-white/40 text-sm leading-relaxed font-light">
                            Visual assets are processed for 21:9 Ultra-Wide fidelity. Use high-contrast RAW imagery for maximum perceptual impact.
                         </p>
                      </div>
                      <div className="flex items-center gap-4 p-6 bg-luxury-gold/5 rounded-2xl border border-luxury-gold/10">
                         <Info size={18} className="text-luxury-gold" />
                         <p className="text-luxury-gold text-[9px] font-black uppercase tracking-widest uppercase">Encryption Mode: Edge Secure • Ready for Broadcast</p>
                      </div>
                   </div>
                </div>
                
                <div className="pt-12 border-t border-white/5">
                   <GalleryUpload 
                     value={formData.gallery || []} 
                     onChange={(urls) => setFormData({...formData, gallery: urls})} 
                   />
                </div>
              </div>
            </section>

            {/* 03. LAYOUT */}
            <section id="layout" className="space-y-10 scroll-mt-32">
              <div className="flex items-center gap-4 mb-4">
                <span className="w-8 h-8 rounded-full bg-luxury-gold text-luxury-black flex items-center justify-center font-black text-xs">03</span>
                <h2 className="text-2xl font-display font-black text-white uppercase tracking-widest">Structural Protocol</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="glass-card p-10 rounded-[3rem] border border-white/5 space-y-10 shadow-2xl">
                  <h3 className="text-white font-black text-xs uppercase tracking-[0.3em] flex items-center gap-4 opacity-40">
                    Framework Alignment
                  </h3>
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-luxury-gold text-[9px] uppercase font-black tracking-[0.4em] ml-1">Display Template</label>
                      <Select value={formData.layoutType} onValueChange={(val: any) => setFormData({...formData, layoutType: val})}>
                        <SelectTrigger className="bg-white/10 border-0 text-white h-14 rounded-2xl text-[10px] uppercase tracking-[0.2em] font-black px-6">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-luxury-black border-white/10 text-white p-2 rounded-2xl">
                          <SelectItem value="single" className="rounded-xl py-4 text-[10px] uppercase font-black">Minimal Centralized</SelectItem>
                          <SelectItem value="two-column" className="rounded-xl py-4 text-[10px] uppercase font-black">Dual Wing Editorial</SelectItem>
                          <SelectItem value="featured" className="rounded-xl py-4 text-[10px] uppercase font-black">Hero Immersive</SelectItem>
                          <SelectItem value="magazine" className="rounded-xl py-4 text-[10px] uppercase font-black">Signature Magazine</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <label className="text-luxury-gold text-[9px] uppercase font-black tracking-[0.4em] ml-1">Sidebar Logic</label>
                      <Select value={formData.sidebarPlacement} onValueChange={(val: any) => setFormData({...formData, sidebarPlacement: val})}>
                        <SelectTrigger className="bg-white/10 border-0 text-white h-14 rounded-2xl text-[10px] uppercase tracking-[0.2em] font-black px-6">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-luxury-black border-white/10 text-white p-2 rounded-2xl">
                          <SelectItem value="none" className="rounded-xl py-4 text-[10px] uppercase font-black">No Secondary Wing</SelectItem>
                          <SelectItem value="left" className="rounded-xl py-4 text-[10px] uppercase font-black">Left Alignment</SelectItem>
                          <SelectItem value="right" className="rounded-xl py-4 text-[10px] uppercase font-black">Right Alignment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-10 rounded-[3rem] border border-white/5 space-y-10 shadow-2xl">
                   <h3 className="text-white font-black text-xs uppercase tracking-[0.3em] flex items-center gap-4 opacity-40">
                    Aesthetic Vibe
                  </h3>
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-luxury-gold text-[9px] uppercase font-black tracking-[0.4em] ml-1">Canvas Render</label>
                      <Select value={formData.cardStyle} onValueChange={(val: any) => setFormData({...formData, cardStyle: val})}>
                        <SelectTrigger className="bg-white/10 border-0 text-white h-14 rounded-2xl text-[10px] uppercase tracking-[0.2em] font-black px-6">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-luxury-black border-white/10 text-white p-2 rounded-2xl">
                          <SelectItem value="default" className="rounded-xl py-4 text-[10px] uppercase font-black">Global Default</SelectItem>
                          <SelectItem value="glass" className="rounded-xl py-4 text-[10px] uppercase font-black">Amaan Glassmorphism</SelectItem>
                          <SelectItem value="plain" className="rounded-xl py-4 text-[10px] uppercase font-black">Bare Minimalism</SelectItem>
                          <SelectItem value="premium" className="rounded-xl py-4 text-[10px] uppercase font-black">Premium Halo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-8">
                       <div className="space-y-3">
                          <label className="text-luxury-gold text-[9px] uppercase font-black tracking-[0.4em] ml-1">Corner Precision</label>
                          <Input 
                            type="number"
                            value={formData.borderRadius}
                            onChange={e => setFormData({...formData, borderRadius: parseInt(e.target.value)})}
                            className="bg-white/10 border-0 text-white h-14 rounded-2xl font-mono px-6"
                          />
                       </div>
                       <div className="space-y-3">
                          <label className="text-luxury-gold text-[9px] uppercase font-black tracking-[0.4em] ml-1">Depth Factor</label>
                          <Select value={formData.shadowIntensity} onValueChange={(val: any) => setFormData({...formData, shadowIntensity: val})}>
                            <SelectTrigger className="bg-white/10 border-0 text-white h-14 rounded-2xl text-[10px] uppercase tracking-[0.2em] font-black px-6">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-luxury-black border-white/10 text-white p-2 rounded-2xl">
                              <SelectItem value="none" className="rounded-xl py-4 text-[10px] uppercase font-black">Flat</SelectItem>
                              <SelectItem value="soft" className="rounded-xl py-4 text-[10px] uppercase font-black">Ambient</SelectItem>
                              <SelectItem value="heavy" className="rounded-xl py-4 text-[10px] uppercase font-black">Heavy Drop</SelectItem>
                            </SelectContent>
                          </Select>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 04. SEO */}
            <section id="seo" className="space-y-10 scroll-mt-32">
              <div className="flex items-center gap-4 mb-4">
                <span className="w-8 h-8 rounded-full bg-luxury-gold text-luxury-black flex items-center justify-center font-black text-xs">04</span>
                <h2 className="text-2xl font-display font-black text-white uppercase tracking-widest">Global Indexing</h2>
              </div>

              <div className="glass-card p-12 rounded-[3.5rem] border border-white/5 space-y-10 shadow-2xl">
                <div className="flex items-center justify-between pb-8 border-b border-white/5">
                   <h3 className="text-xl font-display font-black text-white uppercase tracking-widest">SEO Vital Signs</h3>
                   <div className="flex items-center gap-6 bg-white/5 p-4 rounded-3xl border border-white/5">
                      <div className="text-right">
                         <p className="text-[8px] uppercase font-black text-white/40 tracking-widest">Index Quality Rank</p>
                         <p className={`text-2xl font-mono font-black mt-1 ${formData.seoScore! > 80 ? 'text-emerald-500' : formData.seoScore! > 50 ? 'text-luxury-gold' : 'text-rose-500'}`}>
                           {formData.seoScore}%
                         </p>
                      </div>
                      <div className="w-1 h-12 bg-white/5 rounded-full overflow-hidden">
                         <div className={`w-full transition-all duration-1000 ease-out rounded-full ${formData.seoScore! > 80 ? 'bg-emerald-500' : formData.seoScore! > 50 ? 'bg-luxury-gold' : 'bg-rose-500'}`} style={{ height: `${formData.seoScore}%`, marginTop: `${100 - formData.seoScore!}%` }} />
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                   <div className="space-y-10">
                      <div className="space-y-3">
                         <label className="text-luxury-gold text-[9px] font-black uppercase tracking-[0.4em] ml-1">Focus Intellectual Keyword</label>
                         <Input 
                           value={formData.focusKeyword} 
                           onChange={e => setFormData({...formData, focusKeyword: e.target.value})} 
                           placeholder="e.g. Mogadishu Capital Market"
                           className="bg-white/5 border-0 text-white h-16 rounded-2xl px-8 text-sm" 
                         />
                      </div>
                      <div className="space-y-3">
                         <label className="text-luxury-gold text-[9px] font-black uppercase tracking-[0.4em] ml-1">Meta Intelligence Summary</label>
                         <Textarea 
                           value={formData.seoDescription} 
                           onChange={e => setFormData({...formData, seoDescription: e.target.value})} 
                           className="bg-white/5 border-0 text-white min-h-[140px] rounded-3xl resize-none p-8 text-base" 
                         />
                      </div>
                   </div>
                   <div className="space-y-10">
                      <ImageUpload 
                        label="Open Graph Proxy Asset" 
                        value={formData.socialImage || ''} 
                        onChange={(url) => setFormData({...formData, socialImage: url})} 
                      />
                      <div className="p-8 bg-luxury-black rounded-3xl border border-white/5">
                         <h4 className="text-blue-400 text-base font-bold hover:underline mb-2 cursor-pointer">{formData.seoTitle || formData.title || 'Briefing Headline...'}</h4>
                         <p className="text-emerald-400/50 text-[10px] mb-3 font-mono">https://amaanestate.so/news/{formData.slug || 'url'}</p>
                         <p className="text-white/40 text-[11px] line-clamp-2 italic leading-relaxed">
                           {formData.seoDescription || formData.summary || 'Editorial meta will appear on external networks...'}
                         </p>
                      </div>
                   </div>
                </div>
              </div>
            </section>

            {/* 05. ADVANCED */}
            <section id="advanced" className="space-y-10 scroll-mt-32">
              <div className="flex items-center gap-4 mb-4">
                <span className="w-8 h-8 rounded-full bg-luxury-gold text-luxury-black flex items-center justify-center font-black text-xs">05</span>
                <h2 className="text-2xl font-display font-black text-white uppercase tracking-widest">Administrative Protocol</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="glass-card p-12 rounded-[3.5rem] border border-white/5 space-y-10 shadow-2xl">
                   <div className="space-y-8">
                      <div className="flex items-center justify-between p-8 bg-white/5 rounded-3xl border border-white/5 transition-all hover:bg-white/10 group cursor-pointer" onClick={() => setFormData({...formData, showAuthor: !formData.showAuthor})}>
                         <div>
                            <p className="text-white font-black text-sm uppercase tracking-widest group-hover:text-luxury-gold transition-colors">Verified Signature</p>
                            <p className="text-white/30 text-[9px] mt-1 uppercase tracking-[0.3em] font-black">Link Intelligence Unit ID</p>
                         </div>
                         <div className={`w-14 h-8 rounded-full border border-white/10 p-1 transition-all ${formData.showAuthor ? 'bg-luxury-gold' : 'bg-white/5'}`}>
                            <div className={`w-5 h-5 rounded-full bg-white transition-all ${formData.showAuthor ? 'translate-x-6' : ''}`} />
                         </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-white/30 text-[9px] font-black uppercase tracking-[0.4em] ml-1">Priority Classification</label>
                        <Select value={formData.priority?.toString()} onValueChange={(val) => setFormData({...formData, priority: parseInt(val)})}>
                          <SelectTrigger className="bg-white/5 border-0 text-white h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-luxury-black border-white/10 text-white p-2 rounded-2xl">
                            <SelectItem value="0" className="rounded-xl py-4 text-[10px] font-black uppercase">Level 0: Standard Feed</SelectItem>
                            <SelectItem value="1" className="rounded-xl py-4 text-[10px] font-black uppercase">Level 1: Elevated Sight</SelectItem>
                            <SelectItem value="2" className="rounded-xl py-4 text-[10px] font-black uppercase text-luxury-gold">Level 2: Priority Signal</SelectItem>
                            <SelectItem value="3" className="rounded-xl py-4 text-[10px] font-black uppercase text-rose-500">Level 3: Critical Alert</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <label className="text-white/30 text-[9px] font-black uppercase tracking-[0.4em] ml-1">Display Persistence</label>
                        <Select value={formData.homepageSection} onValueChange={(val) => setFormData({...formData, homepageSection: val})}>
                          <SelectTrigger className="bg-white/5 border-0 text-white h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-luxury-black border-white/10 text-white p-2 rounded-2xl">
                            <SelectItem value="default" className="rounded-xl py-4 text-[10px] font-black uppercase">Global Stream</SelectItem>
                            <SelectItem value="hero" className="rounded-xl py-4 text-[10px] font-black uppercase">Elite Feature Slot</SelectItem>
                            <SelectItem value="sidebar" className="rounded-xl py-4 text-[10px] font-black uppercase">Peripheral Insight Feed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                   </div>
                </div>

                <div className="glass-card p-12 rounded-[3.5rem] border border-white/5 space-y-10 shadow-2xl">
                   <div className="space-y-8">
                      <div className="space-y-3">
                        <label className="text-white/30 text-[9px] font-black uppercase tracking-[0.4em] ml-1">Identification Slug</label>
                        <Input 
                          value={formData.slug} 
                          onChange={e => setFormData({...formData, slug: e.target.value})} 
                          className="bg-white/5 border-0 text-white h-14 rounded-2xl font-mono px-6" 
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-white/30 text-[9px] font-black uppercase tracking-[0.4em] ml-1">Editorial Subject</label>
                        <Select value={formData.category} onValueChange={(val) => setFormData({...formData, category: val})}>
                          <SelectTrigger className="bg-white/5 border-0 text-white h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-luxury-black border-white/10 text-white p-2 rounded-2xl">
                            <SelectItem value="news" className="rounded-xl py-4 text-[10px] font-black uppercase">Intelligence News</SelectItem>
                            <SelectItem value="report" className="rounded-xl py-4 text-[10px] font-black uppercase">Market Report</SelectItem>
                            <SelectItem value="opportunity" className="rounded-xl py-4 text-[10px] font-black uppercase">Capital Opportunity</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-3">
                         <label className="text-white/30 text-[9px] font-black uppercase tracking-[0.4em] ml-1">Metadata Classifiers</label>
                         <TagsInput value={formData.tags || []} onChange={tags => setFormData({...formData, tags})} />
                      </div>
                   </div>
                </div>
              </div>
            </section>

          </form>
        </div>


        {/* Real-time Split Preview Panel */}
        {splitPreview && (
          <div className="w-1/2 border-l border-white/5 bg-black/40 overflow-y-auto luxury-scroll p-12">
            <div className="flex items-center justify-between mb-10">
               <h3 className="text-luxury-gold font-display font-black text-base uppercase tracking-[0.5em]">Live Pulse Render</h3>
               <div className="flex items-center gap-3 bg-white/5 p-1.5 rounded-xl border border-white/5">
                 <button onClick={() => setPreviewSize('mobile')} className={`p-2 rounded-lg transition-all ${previewSize === 'mobile' ? 'bg-luxury-gold text-luxury-black' : 'text-white/40'}`}><Smartphone size={14} /></button>
                 <button onClick={() => setPreviewSize('tablet')} className={`p-2 rounded-lg transition-all ${previewSize === 'tablet' ? 'bg-luxury-gold text-luxury-black' : 'text-white/40'}`}><Tablet size={14} /></button>
                 <button onClick={() => setPreviewSize('desktop')} className={`p-2 rounded-lg transition-all ${previewSize === 'desktop' ? 'bg-luxury-gold text-luxury-black' : 'text-white/40'}`}><Monitor size={14} /></button>
               </div>
            </div>
            {previewContent}
          </div>
        )}
      </div>

      {/* Full Modal Preview */}
      <AnimatePresence>
        {showPreview && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col"
          >
             <header className="h-24 border-b border-white/5 px-12 flex items-center justify-between bg-black/80 backdrop-blur-3xl">
                <div className="flex items-center gap-12">
                   <h2 className="text-luxury-gold font-display font-black text-2xl uppercase tracking-[0.5em]">Cinema Render</h2>
                   <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/5">
                      <button onClick={() => setPreviewSize('mobile')} className={`p-4 rounded-xl transition-all ${previewSize === 'mobile' ? 'bg-luxury-gold text-luxury-black font-black' : 'text-white/40 text-[10px] uppercase tracking-widest font-bold'}`}>Mobile</button>
                      <button onClick={() => setPreviewSize('tablet')} className={`p-4 rounded-xl transition-all ${previewSize === 'tablet' ? 'bg-luxury-gold text-luxury-black font-black' : 'text-white/40 text-[10px] uppercase tracking-widest font-bold'}`}>Tablet</button>
                      <button onClick={() => setPreviewSize('desktop')} className={`p-4 rounded-xl transition-all ${previewSize === 'desktop' ? 'bg-luxury-gold text-luxury-black font-black' : 'text-white/40 text-[10px] uppercase tracking-widest font-bold'}`}>Desktop</button>
                   </div>
                </div>
                <Button variant="ghost" onClick={() => setShowPreview(false)} className="text-white hover:bg-white/10 h-14 rounded-2xl px-8 text-[11px] font-black uppercase tracking-widest border border-white/10">Abort Simulation</Button>
             </header>
             <main className="flex-1 overflow-auto bg-[#050505] p-20 luxury-scroll">
                {previewContent}
             </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


