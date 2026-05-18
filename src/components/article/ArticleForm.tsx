import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { articleService } from '@/services/articleService';
import { Article } from '@/types';

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
    published: initialData?.published || false,
    isFeatured: initialData?.isFeatured || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (initialData) {
      await articleService.updateArticle(initialData.id, formData);
    } else {
      await articleService.createArticle(formData as any);
    }
    navigate('/dashboard/articles');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 glass-card p-10 rounded-[2.5rem] border border-white/5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <label className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em]">Article Title</label>
          <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required className="bg-white/5 border-0 text-white h-14 rounded-xl" />
        </div>
        <div className="space-y-3">
          <label className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em]">Slug (URL)</label>
          <Input value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} required className="bg-white/5 border-0 text-white h-14 rounded-xl" />
        </div>
      </div>
      
      <div className="space-y-3">
        <label className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em]">Summary</label>
        <Textarea value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})} required className="bg-white/5 border-0 text-white min-h-[100px] rounded-xl" />
      </div>
      
      <div className="space-y-3">
        <label className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em]">Main Content</label>
        <Textarea value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} required className="bg-white/5 border-0 text-white min-h-[250px] rounded-xl" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <label className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em]">Category</label>
          <Select value={formData.category} onValueChange={(val) => setFormData({...formData, category: val})}>
            <SelectTrigger className="bg-white/5 border-0 text-white h-14 rounded-xl"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent className="bg-luxury-black border-white/10 text-white">
              <SelectItem value="news">News</SelectItem>
              <SelectItem value="report">Report</SelectItem>
              <SelectItem value="opportunity">Opportunity</SelectItem>
              <SelectItem value="education">Education</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end gap-6 h-full pb-4">
          <label className="flex items-center text-white text-sm font-light gap-3"><input type="checkbox" checked={formData.published} onChange={e => setFormData({...formData, published: e.target.checked})} className="accent-luxury-gold" /> Published</label>
          <label className="flex items-center text-white text-sm font-light gap-3"><input type="checkbox" checked={formData.isFeatured} onChange={e => setFormData({...formData, isFeatured: e.target.checked})} className="accent-luxury-gold" /> Featured</label>
        </div>
      </div>

      <Button type="submit" className="bg-luxury-gold text-luxury-black w-full h-16 rounded-xl font-bold uppercase tracking-widest hover:bg-white transition-all">Save Article Record</Button>
    </form>
  );
}
