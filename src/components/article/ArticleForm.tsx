import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { articleService } from '@/services/articleService';
import { Article } from '@/types';
import Editor from './Editor';
import ImageUpload from './ImageUpload';
import GalleryUpload from './GalleryUpload';
import TagsInput from './TagsInput';
import { motion } from 'framer-motion';
import { Eye, Save, Globe, Info } from 'lucide-react';

export default function ArticleForm({ initialData }: { initialData?: Article }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    summary: initialData?.summary || '',
    content: initialData?.content || '',
    category: initialData?.category || 'news',
    language: initialData?.language || 'en',
    featuredImage: initialData?.featuredImage || '',
    gallery: initialData?.gallery || [],
    tags: initialData?.tags || [],
    seoTitle: initialData?.seoTitle || '',
    seoDescription: initialData?.seoDescription || '',
    published: initialData?.published || false,
    isFeatured: initialData?.isFeatured || false,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent, isDraft: boolean = false) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const dataToSave = { ...formData, published: isDraft ? false : formData.published };
      
      if (initialData) {
        await articleService.updateArticle(initialData.id, dataToSave);
      } else {
        await articleService.createArticle(dataToSave as any);
      }
      
      navigate('/dashboard/articles');
    } catch (error) {
      console.error('Failed to save article:', error);
      alert('Error saving article. Check console details.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.form 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={(e) => handleSubmit(e, false)} 
      className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8"
    >
      {/* Main Column */}
      <div className="lg:col-span-8 space-y-8">
        
        {/* Core Info */}
        <div className="glass-card p-10 rounded-[2.5rem] border border-white/5 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-luxury-gold/5 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3" />
          
          <div className="space-y-3 relative z-10">
            <label className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em]">Article Title</label>
            <Input 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              required 
              placeholder="e.g. New Luxury Development announced..."
              className="bg-white/5 border-0 text-white text-2xl h-16 rounded-2xl placeholder:text-white/20 font-display font-medium" 
            />
          </div>

          <div className="space-y-3 relative z-10">
            <label className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em]">Executive Summary</label>
            <Textarea 
              value={formData.summary} 
              onChange={e => setFormData({...formData, summary: e.target.value})} 
              required 
              placeholder="A brief overview of this report..."
              className="bg-white/5 border-0 text-white min-h-[120px] rounded-2xl resize-none placeholder:text-white/20 text-lg leading-relaxed" 
            />
          </div>
          
          <div className="space-y-3 relative z-10">
            <label className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-between">
              <span>Main Content</span>
              {formData.content.length > 0 && <span className="text-luxury-gold">{Math.round(formData.content.split(' ').length)} words</span>}
            </label>
            <Editor content={formData.content} onChange={(html) => setFormData({...formData, content: html})} />
          </div>
        </div>

        {/* Media & Gallery */}
        <div className="glass-card p-10 rounded-[2.5rem] border border-white/5 space-y-8">
           <h3 className="text-white text-xl font-display font-bold flex items-center gap-3">
             Media Assets
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ImageUpload 
                label="Featured Image (Hero)" 
                value={formData.featuredImage} 
                onChange={(url) => setFormData({...formData, featuredImage: url})} 
              />
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex flex-col justify-center">
                 <p className="text-white/40 text-sm font-light leading-relaxed mb-4">
                   The featured image is used on article cards, the intelligence index, and as the hero banner on the article detail view. Try to use high-contrast, professional architectural or economic photography.
                 </p>
                 <div className="flex items-start gap-3 p-4 bg-luxury-gold/10 text-luxury-gold rounded-xl text-xs font-medium">
                   <Info size={16} className="shrink-0 mt-0.5" />
                   <p>Max recommended size: 1920x1080px (16:9 ratio). We compress automatically.</p>
                 </div>
              </div>
           </div>
           
           <div className="pt-6 border-t border-white/5">
              <GalleryUpload 
                value={formData.gallery} 
                onChange={(urls) => setFormData({...formData, gallery: urls})} 
              />
           </div>
        </div>

        {/* SEO Panel */}
        <div className="glass-card p-10 rounded-[2.5rem] border border-white/5 space-y-8">
           <h3 className="text-white text-xl font-display font-bold flex items-center gap-3">
             <Globe size={20} className="text-luxury-gold" /> Search & Social (SEO)
           </h3>
           
           <div className="space-y-6">
              <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                 <h4 className="text-blue-400 text-lg hover:underline mb-1 truncate">{formData.seoTitle || formData.title || 'Search Engine Title Preview'}</h4>
                 <p className="text-green-500 text-sm mb-2 truncate">https://somali-real-estate.com/news/{formData.slug || 'article-url'}</p>
                 <p className="text-white/60 text-sm line-clamp-2">{formData.seoDescription || formData.summary || 'This is how your article will appear in Google search results and when shared on social media...'}</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-3">
                  <label className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em]">SEO Title</label>
                  <Input 
                    value={formData.seoTitle} 
                    onChange={e => setFormData({...formData, seoTitle: e.target.value})} 
                    placeholder="Leave empty to use article title..."
                    className="bg-white/5 border-0 text-white rounded-xl h-14" 
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em]">SEO Description</label>
                  <Textarea 
                    value={formData.seoDescription} 
                    onChange={e => setFormData({...formData, seoDescription: e.target.value})} 
                    placeholder="Leave empty to use article summary..."
                    className="bg-white/5 border-0 text-white rounded-xl min-h-[100px] resize-none" 
                  />
                </div>
              </div>
           </div>
        </div>

      </div>
      
      {/* Settings Side Panel */}
      <div className="lg:col-span-4 space-y-8">
         <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 space-y-8 sticky top-32">
            <div>
               <h3 className="text-2xl font-display font-bold text-white mb-2">Publishing</h3>
               <p className="text-white/30 text-sm font-light">Configure visibility and routing.</p>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em]">URL Slug</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 text-sm">/news/</span>
                  <Input 
                    value={formData.slug} 
                    onChange={e => setFormData({...formData, slug: e.target.value})} 
                    required 
                    className="bg-white/5 border-0 text-white rounded-xl h-14 pl-16 focus-visible:ring-luxury-gold/50 font-mono text-sm" 
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em]">Categorization</label>
                <Select value={formData.category} onValueChange={(val) => setFormData({...formData, category: val})}>
                  <SelectTrigger className="bg-white/5 border-0 text-white h-14 rounded-xl focus:ring-luxury-gold/50">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-luxury-black border-white/10 text-white rounded-xl">
                    <SelectItem value="news">Market News</SelectItem>
                    <SelectItem value="report">Intelligence Report</SelectItem>
                    <SelectItem value="opportunity">Opportunity Brief</SelectItem>
                    <SelectItem value="education">Educational</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em]">Tags & Keywords</label>
                <TagsInput value={formData.tags} onChange={(tags) => setFormData({...formData, tags})} />
              </div>
            </div>
            
            <div className="bg-white/5 rounded-2xl p-6 space-y-4 border border-white/5">
              <label className="flex items-center text-white text-sm font-medium gap-4 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input type="checkbox" checked={formData.published} onChange={e => setFormData({...formData, published: e.target.checked})} className="peer sr-only" />
                  <div className="w-12 h-6 bg-white/10 peer-focus:outline-none rounded-full peer-checked:bg-luxury-gold/20 transition-all"></div>
                  <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all peer-checked:translate-x-6 peer-checked:bg-luxury-gold"></div>
                </div>
                <div>
                   <span className="block group-hover:text-luxury-gold transition-colors">Publish Live</span>
                   <span className="text-[10px] font-light text-white/40 block mt-0.5">Make available to public instantly</span>
                </div>
              </label>

              <div className="w-full h-px bg-white/5" />

              <label className="flex items-center text-white text-sm font-medium gap-4 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input type="checkbox" checked={formData.isFeatured} onChange={e => setFormData({...formData, isFeatured: e.target.checked})} className="peer sr-only" />
                  <div className="w-12 h-6 bg-white/10 peer-focus:outline-none rounded-full peer-checked:bg-luxury-gold/20 transition-all"></div>
                  <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all peer-checked:translate-x-6 peer-checked:bg-luxury-gold"></div>
                </div>
                <div>
                   <span className="block group-hover:text-luxury-gold transition-colors">Feature on Homepage</span>
                   <span className="text-[10px] font-light text-white/40 block mt-0.5">Pin to main intelligence feeds</span>
                </div>
              </label>
            </div>

            <div className="space-y-3 pt-4">
              <Button 
                type="submit" 
                disabled={isSaving}
                className="bg-luxury-gold text-luxury-black w-full h-16 rounded-xl font-bold uppercase tracking-widest hover:bg-white hover:-translate-y-1 transition-all shadow-xl shadow-luxury-gold/10"
              >
                {isSaving ? 'Processing...' : (formData.published ? 'Publish Intelligence' : 'Save Pending Output')}
              </Button>
              
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={isSaving}
                  className="bg-transparent border-white/10 text-white h-12 rounded-xl hover:bg-white/5 hover:text-white transition-all font-semibold"
                >
                  <Save size={16} className="mr-2 opacity-50" /> Draft
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  disabled={isSaving}
                  onClick={() => window.open(`/news/${formData.slug}?preview=true`, '_blank')}
                  className="bg-transparent border-white/10 text-white h-12 rounded-xl hover:bg-white/5 hover:text-white transition-all font-semibold"
                >
                  <Eye size={16} className="mr-2 opacity-50" /> Preview
                </Button>
              </div>
            </div>
         </div>
      </div>
    </motion.form>
  );
}
