import React, { useMemo } from 'react';
import { Plus, Trash2, HelpCircle, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EditorialReview, FAQItem } from '@/services/reviewService';

interface SeoCenterWorkspaceProps {
  form: Partial<EditorialReview>;
  handleFieldChange: (field: keyof EditorialReview, value: any) => void;
}

export function SeoCenterWorkspace({ form, handleFieldChange }: SeoCenterWorkspaceProps) {
  const focusKeyword = form.focusKeyword || '';
  const seoTitle = form.seoTitle || form.title || '';
  const metaDescription = form.metaDescription || form.excerpt || '';
  const slug = form.slug || form.id || '';
  const canonicalUrl = form.canonicalUrl || (slug ? `https://www.amaanestate.com/review/${slug}` : '');

  const imageAlts = form.imageAlts || {};

  const handleAltChange = (imageKey: string, altValue: string) => {
    const updated = { ...imageAlts, [imageKey]: altValue };
    handleFieldChange('imageAlts', updated);
  };

  // Content string for keyword usage analysis
  const fullContentText = useMemo(() => {
    return [
      form.title,
      form.introduction,
      form.whatIsIt,
      form.bestFor,
      form.finalVerdict,
      ...(form.pros || []),
      ...(form.cons || []),
      ...(form.keyFeatures || [])
    ].filter(Boolean).join(' ');
  }, [form]);

  // Dynamic SEO Score Calculation (0-100)
  const seoScore = useMemo(() => {
    let score = 0;
    if (seoTitle.length >= 20 && seoTitle.length <= 65) score += 20;
    else if (seoTitle.length > 0) score += 10;

    if (metaDescription.length >= 70 && metaDescription.length <= 165) score += 20;
    else if (metaDescription.length > 0) score += 10;

    if (slug.length > 2) score += 15;
    if (focusKeyword.length > 0) score += 15;
    if (canonicalUrl.length > 10) score += 10;
    if (form.faqs && form.faqs.length > 0) score += 10;
    if (Object.keys(imageAlts).length > 0 || form.featuredImage) score += 10;

    return Math.min(100, score);
  }, [seoTitle, metaDescription, slug, focusKeyword, canonicalUrl, form.faqs, imageAlts, form.featuredImage]);

  // FAQs Handlers
  const addFaqItem = () => {
    const list = [...(form.faqs || [])];
    list.push({ question: '', answer: '' });
    handleFieldChange('faqs', list);
  };

  const updateFaqItem = (index: number, key: keyof FAQItem, value: string) => {
    const list = [...(form.faqs || [])];
    list[index] = { ...list[index], [key]: value };
    handleFieldChange('faqs', list);
  };

  const removeFaqItem = (index: number) => {
    const list = [...(form.faqs || [])];
    list.splice(index, 1);
    handleFieldChange('faqs', list);
  };

  return (
    <div className="space-y-6">
      {/* Live SEO Score Bar */}
      <section className="bg-[#08080c] rounded-2xl p-5 border border-white/10 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/50">Live SEO Score</span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-3xl font-mono font-bold text-white">{seoScore}</span>
            <span className="text-xs font-mono text-white/40">/ 100</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
            seoScore >= 80 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
              : seoScore >= 50 
              ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' 
              : 'bg-red-500/10 text-red-400 border-red-500/30'
          }`}>
            {seoScore >= 80 ? 'Good SEO' : seoScore >= 50 ? 'Moderate SEO' : 'Needs Optimization'}
          </span>
        </div>
      </section>

      {/* 5. SEO Inputs */}
      <section className="bg-[#08080c] rounded-2xl p-6 border border-white/10 space-y-4">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400 border-b border-white/5 pb-3">
          5. SEO Metadata
        </h3>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-medium text-white/80">SEO Title</label>
              <span className="text-white/40 font-mono text-[11px]">{seoTitle.length} / 60</span>
            </div>
            <Input
              className="bg-black/40 border-white/10 h-10 text-xs text-white"
              placeholder="Primary SEO Title..."
              value={form.seoTitle || ''}
              onChange={(e) => handleFieldChange('seoTitle', e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-medium text-white/80">Meta Description</label>
              <span className="text-white/40 font-mono text-[11px]">{metaDescription.length} / 160</span>
            </div>
            <textarea
              rows={3}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500/50 resize-y"
              placeholder="Search snippet description..."
              value={form.metaDescription || ''}
              onChange={(e) => handleFieldChange('metaDescription', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/80">Slug</label>
              <Input
                className="bg-black/40 border-white/10 h-10 text-xs text-white font-mono"
                placeholder="notion-ai-review"
                value={form.slug || ''}
                onChange={(e) => handleFieldChange('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/80">Canonical URL</label>
              <Input
                className="bg-black/40 border-white/10 h-10 text-xs text-white font-mono"
                placeholder="https://..."
                value={form.canonicalUrl || ''}
                onChange={(e) => handleFieldChange('canonicalUrl', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/80">Focus Keyword</label>
            <Input
              className="bg-black/40 border-white/10 h-10 text-xs text-white"
              placeholder="e.g. Notion AI review"
              value={form.focusKeyword || ''}
              onChange={(e) => handleFieldChange('focusKeyword', e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* FAQ Manager */}
      <section className="bg-[#08080c] rounded-2xl p-6 border border-white/10 space-y-4">
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400">
            FAQ
          </h3>
          <Button onClick={addFaqItem} size="sm" className="bg-purple-600 hover:bg-purple-500 text-white h-8 px-3 rounded-lg text-xs font-medium">
            <Plus size={14} className="mr-1" /> Add FAQ
          </Button>
        </div>

        <div className="space-y-3">
          {form.faqs?.map((faq, index) => (
            <div key={index} className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-2 relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFaqItem(index)}
                className="absolute top-3 right-3 w-7 h-7 rounded-lg text-red-400/70 hover:text-red-400 hover:bg-red-500/20"
              >
                <Trash2 size={14} />
              </Button>
              <Input
                placeholder="Question (e.g. Is there a free trial?)"
                className="bg-black/30 border-white/10 h-9 text-xs text-white pr-10"
                value={faq.question}
                onChange={(e) => updateFaqItem(index, 'question', e.target.value)}
              />
              <textarea
                rows={2}
                placeholder="Answer detail..."
                className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-xs text-white resize-y focus:outline-none focus:border-purple-500/50"
                value={faq.answer}
                onChange={(e) => updateFaqItem(index, 'answer', e.target.value)}
              />
            </div>
          ))}

          {(!form.faqs || form.faqs.length === 0) && (
            <div className="py-6 text-center border border-dashed border-white/10 rounded-xl text-white/30 text-xs font-mono">
              No FAQ items added.
            </div>
          )}
        </div>
      </section>

      {/* Image ALT Text */}
      <section className="bg-[#08080c] rounded-2xl p-6 border border-white/10 space-y-4">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400 border-b border-white/5 pb-3">
          Image ALT Text
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {form.featuredImage && (
            <div className="bg-black/40 border border-white/10 rounded-xl p-3 flex gap-3 items-center">
              <img src={form.featuredImage} alt="Hero" className="w-12 h-12 object-cover rounded border border-white/10 shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="text-[11px] font-mono text-purple-300">Hero Image ALT</div>
                <Input
                  placeholder="ALT text for hero banner..."
                  className="bg-black/30 border-white/10 h-8 text-xs text-white"
                  value={imageAlts['hero'] || ''}
                  onChange={(e) => handleAltChange('hero', e.target.value)}
                />
              </div>
            </div>
          )}

          {form.gallery?.map((gal, i) => (
            <div key={i} className="bg-black/40 border border-white/10 rounded-xl p-3 flex gap-3 items-center">
              {gal.url || gal.imageUrl ? (
                <img src={gal.url || gal.imageUrl} alt="Gal" className="w-12 h-12 object-cover rounded border border-white/10 shrink-0" />
              ) : (
                <div className="w-12 h-12 bg-white/5 rounded border border-white/10 flex items-center justify-center text-[9px] text-white/30 font-mono shrink-0">
                  No Image
                </div>
              )}
              <div className="flex-1 space-y-1">
                <div className="text-[11px] font-mono text-white/60 truncate">{gal.title || `Gallery #${i + 1}`} ALT</div>
                <Input
                  placeholder="ALT text for image..."
                  className="bg-black/30 border-white/10 h-8 text-xs text-white"
                  value={imageAlts[`gallery_${i}`] || ''}
                  onChange={(e) => handleAltChange(`gallery_${i}`, e.target.value)}
                />
              </div>
            </div>
          ))}

          {!form.featuredImage && (!form.gallery || form.gallery.length === 0) && (
            <div className="col-span-full py-4 text-center text-white/30 text-xs font-mono">
              Upload hero or gallery images to set ALT text attributes.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
