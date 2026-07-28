import React, { useState } from 'react';
import { 
  ImageIcon, Star, Plus, Trash2, ArrowUp, ArrowDown, FileText, Upload, RefreshCw, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EditorialReview, GalleryItem } from '@/services/reviewService';
import { uploadFile } from '@/services/uploadService';
import { toast } from 'sonner';

interface ContentEditorWorkspaceProps {
  form: Partial<EditorialReview>;
  handleFieldChange: (field: keyof EditorialReview, value: any) => void;
  prosText: string;
  setProsText: (val: string) => void;
  consText: string;
  setConsText: (val: string) => void;
  featuresText: string;
  setFeaturesText: (val: string) => void;
}

interface GalleryImagePreviewProps {
  src?: string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function GalleryImagePreview({ src, onFileChange }: GalleryImagePreviewProps) {
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  React.useEffect(() => {
    if (src) setState('loading');
    else setState('idle');
  }, [src]);

  return (
    <div className="w-24 h-24 bg-[#111] border border-white/10 rounded-xl flex-shrink-0 relative overflow-hidden group/img flex items-center justify-center">
      {src ? (
        <>
          {state === 'loading' && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
              <RefreshCw className="animate-spin text-blue-500" size={14} />
            </div>
          )}
          {state === 'error' && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10 text-center p-1">
              <AlertCircle className="text-red-500 mb-0.5" size={14} />
              <span className="text-[8px] text-white/60 font-mono">Error</span>
            </div>
          )}
          <img 
            src={src} 
            alt="img" 
            className="w-full h-full object-cover" 
            onLoad={() => setState('success')}
            onError={() => setState('error')}
          />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-white/30 text-[10px] font-mono">
          <ImageIcon size={16} className="mb-1 text-white/20" />
          No Image
        </div>
      )}
      
      <label className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-xs z-20">
         <Upload size={16} className="text-white"/>
         <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
      </label>
    </div>
  );
}

export function ContentEditorWorkspace({
  form,
  handleFieldChange,
  prosText,
  setProsText,
  consText,
  setConsText,
  featuresText,
  setFeaturesText,
}: ContentEditorWorkspaceProps) {
  const [heroImageState, setHeroImageState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  React.useEffect(() => {
    if (form.featuredImage) setHeroImageState('loading');
    else setHeroImageState('idle');
  }, [form.featuredImage]);

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadFile(file, 'reviews');
      if (url) {
        handleFieldChange('featuredImage', url);
        toast.success("Hero Image uploaded!");
      }
    } catch (err) {
      toast.error("Upload failed");
    }
  };

  // Gallery array helpers
  const addGalleryItem = () => {
    const list = [...(form.gallery || [])];
    list.push({
      url: '',
      title: '',
      price: '',
      discountPrice: '',
      productUrl: '',
      ctaButtonText: 'Buy Now'
    });
    handleFieldChange('gallery', list);
  };

  const updateGalleryItem = (index: number, key: keyof GalleryItem, value: any) => {
    const list = [...(form.gallery || [])];
    list[index] = { ...list[index], [key]: value };
    handleFieldChange('gallery', list);
  };

  const removeGalleryItem = (index: number) => {
    const list = [...(form.gallery || [])];
    list.splice(index, 1);
    handleFieldChange('gallery', list);
  };

  const moveGalleryItem = (index: number, direction: 'up' | 'down') => {
    const list = [...(form.gallery || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;
    handleFieldChange('gallery', list);
  };

  const handleGalleryUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadFile(file, 'gallery');
      if (url) {
        updateGalleryItem(index, 'url', url);
        updateGalleryItem(index, 'imageUrl', url);
        toast.success("Gallery image uploaded!");
      }
    } catch (err) {
      toast.error("Upload failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Product Information */}
      <section className="bg-[#08080c] rounded-2xl p-6 border border-white/10 space-y-4">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400 border-b border-white/5 pb-3">
          1. Product Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/80">Product Title *</label>
            <Input 
              className="bg-black/40 border-white/10 h-10 text-white text-sm" 
              placeholder="e.g. Notion AI, MacBook Pro M3" 
              value={form.title || ''} 
              onChange={(e) => handleFieldChange('title', e.target.value)} 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/80">Brand</label>
            <Input 
              className="bg-black/40 border-white/10 h-10 text-white text-sm" 
              placeholder="e.g. Notion, Apple, Sony" 
              value={form.brandName || ''} 
              onChange={(e) => handleFieldChange('brandName', e.target.value)} 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/80">Category</label>
            <Input 
              className="bg-black/40 border-white/10 h-10 text-white text-sm" 
              placeholder="e.g. Software, Electronics, Productivity" 
              value={form.category || ''} 
              onChange={(e) => handleFieldChange('category', e.target.value)} 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/80">Rating (1.0 - 5.0)</label>
            <div className="relative">
              <Star size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 fill-amber-400" />
              <Input 
                type="number" 
                step="0.1" 
                max="5.0"
                min="1.0"
                className="bg-black/40 border-white/10 h-10 pl-9 font-bold text-white text-sm" 
                value={form.rating || ''} 
                onChange={(e) => handleFieldChange('rating', e.target.value)} 
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Hero Image */}
      <section className="bg-[#08080c] rounded-2xl p-6 border border-white/10 space-y-4">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400 border-b border-white/5 pb-3">
          2. Hero Image
        </h3>

        {/* Live Preview */}
        {form.featuredImage ? (
          <div className="w-full bg-black border border-white/10 rounded-xl overflow-hidden relative flex flex-col items-center justify-center min-h-[180px] p-3 max-h-[300px]">
            {heroImageState === 'loading' && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-10">
                <RefreshCw className="animate-spin text-blue-500" size={20} />
              </div>
            )}
            {heroImageState === 'error' && (
              <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-10 p-2 text-center">
                <AlertCircle className="text-red-500 mb-1" size={20} />
                <span className="text-xs text-white/80 font-mono">Failed to load image preview</span>
              </div>
            )}
            <img 
              src={form.featuredImage} 
              alt="Hero Preview" 
              className="max-w-full max-h-[260px] object-contain rounded" 
              onLoad={() => setHeroImageState('success')}
              onError={() => setHeroImageState('error')}
            />
          </div>
        ) : (
          <div className="w-full bg-black/30 border border-dashed border-white/10 rounded-xl py-8 text-center text-white/30 text-xs font-mono">
            No hero image set. Enter an Image URL or Upload Image below.
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/80">Image URL & Upload</label>
          <div className="flex gap-2">
            <Input 
              className="bg-black/40 border-white/10 h-10 text-white text-xs flex-1 font-mono" 
              placeholder="https://images.unsplash.com/photo-..." 
              value={form.featuredImage || ''} 
              onChange={(e) => handleFieldChange('featuredImage', e.target.value.trim())}
            />
            <Button 
              type="button" 
              className="shrink-0 h-10 border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs px-4" 
              onClick={() => document.getElementById('hero-upload-input')?.click()}
            >
              <Upload size={14} className="mr-1.5"/> Upload Image
            </Button>
            {form.featuredImage && (
              <Button
                type="button"
                variant="outline"
                className="shrink-0 h-10 border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs px-3"
                onClick={() => handleFieldChange('featuredImage', '')}
              >
                Clear
              </Button>
            )}
            <input id="hero-upload-input" type="file" accept="image/*" className="hidden" onChange={handleHeroUpload} />
          </div>
        </div>
      </section>

      {/* 3. Gallery */}
      <section className="bg-[#08080c] rounded-2xl p-6 border border-white/10 space-y-4">
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">
            3. Gallery
          </h3>
          <Button onClick={addGalleryItem} size="sm" className="bg-blue-600 hover:bg-blue-500 text-white h-8 px-3 rounded-lg text-xs font-medium">
            <Plus size={14} className="mr-1"/> Add Image
          </Button>
        </div>

        <div className="space-y-3">
          {form.gallery?.map((item, i) => (
            <div key={i} className="bg-black/40 border border-white/10 rounded-xl p-4 flex gap-4 items-center relative group">
              <GalleryImagePreview src={item.url || item.imageUrl} onFileChange={(e) => handleGalleryUpload(i, e)} />

              <div className="flex-1 space-y-2 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <Input 
                    placeholder="Image Title / Label" 
                    className="bg-black/30 border-white/10 h-9 text-xs text-white" 
                    value={item.title || ''} 
                    onChange={e => updateGalleryItem(i, 'title', e.target.value)} 
                  />
                </div>

                <div className="flex gap-2 items-center">
                  <Input 
                    placeholder="Image URL or Upload" 
                    className="bg-black/30 border-white/10 h-9 text-xs text-white font-mono flex-1" 
                    value={item.url || item.imageUrl || ''} 
                    onChange={e => {
                      updateGalleryItem(i, 'url', e.target.value.trim());
                      updateGalleryItem(i, 'imageUrl', e.target.value.trim());
                    }} 
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    className="shrink-0 h-9 border-white/10 text-white/80 hover:text-white text-xs px-3"
                    onClick={() => document.getElementById(`gal-upload-${i}`)?.click()}
                  >
                    <Upload size={13} className="mr-1"/> Upload
                  </Button>
                  <input id={`gal-upload-${i}`} type="file" accept="image/*" className="hidden" onChange={(e) => handleGalleryUpload(i, e)} />
                </div>
              </div>

              {/* Sorting & Action Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  disabled={i === 0}
                  onClick={() => moveGalleryItem(i, 'up')}
                  className="w-8 h-8 rounded-lg text-white/50 hover:text-white hover:bg-white/10"
                  title="Move Up"
                >
                  <ArrowUp size={14} />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  disabled={i === (form.gallery?.length || 0) - 1}
                  onClick={() => moveGalleryItem(i, 'down')}
                  className="w-8 h-8 rounded-lg text-white/50 hover:text-white hover:bg-white/10"
                  title="Move Down"
                >
                  <ArrowDown size={14} />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => removeGalleryItem(i)}
                  className="w-8 h-8 rounded-lg text-red-400/70 hover:text-red-400 hover:bg-red-500/20"
                  title="Remove Image"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}

          {(!form.gallery || form.gallery.length === 0) && (
            <div className="py-6 text-center border border-dashed border-white/10 rounded-xl text-white/30 text-xs font-mono">
              No gallery images added. Click "Add Image" to build your review gallery.
            </div>
          )}
        </div>
      </section>

      {/* 4. Editorial Review */}
      <section className="bg-[#08080c] rounded-2xl p-6 border border-white/10 space-y-5">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400 border-b border-white/5 pb-3">
          4. Editorial Review
        </h3>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/80">Introduction</label>
            <textarea 
              rows={3} 
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500/50 resize-y" 
              value={form.introduction || ''} 
              onChange={e => handleFieldChange('introduction', e.target.value)} 
              placeholder="Opening overview and key takeaway hook..." 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/80">Product Overview</label>
            <textarea 
              rows={5} 
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500/50 resize-y" 
              value={form.whatIsIt || ''} 
              onChange={e => handleFieldChange('whatIsIt', e.target.value)} 
              placeholder="Detailed explanation of product features, build, and user experience..." 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/80">Target Audience</label>
            <Input 
              className="bg-black/40 border-white/10 h-10 text-xs text-white" 
              value={form.bestFor || ''} 
              onChange={e => handleFieldChange('bestFor', e.target.value)} 
              placeholder="e.g. Freelancers, Enterprises, Digital Creators" 
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-emerald-400">Pros (One per line)</label>
              <textarea 
                rows={5} 
                className="w-full bg-black/40 border border-emerald-500/20 rounded-xl p-3 text-xs text-emerald-100 focus:outline-none focus:border-emerald-500/50 resize-y" 
                value={prosText} 
                onChange={e => setProsText(e.target.value)} 
                placeholder="Fast performance&#10;Clean user interface&#10;Great value" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-red-400">Cons (One per line)</label>
              <textarea 
                rows={5} 
                className="w-full bg-black/40 border border-red-500/20 rounded-xl p-3 text-xs text-red-100 focus:outline-none focus:border-red-500/50 resize-y" 
                value={consText} 
                onChange={e => setConsText(e.target.value)} 
                placeholder="Requires internet connection&#10;Slight learning curve" 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-blue-400">Key Features (One per line)</label>
            <textarea 
              rows={4} 
              className="w-full bg-black/40 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-100 focus:outline-none focus:border-blue-500/50 resize-y" 
              value={featuresText} 
              onChange={e => setFeaturesText(e.target.value)} 
              placeholder="Cloud Syncing&#10;AI Automation&#10;Team Collaboration" 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/80">Final Verdict</label>
            <textarea 
              rows={4} 
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500/50 resize-y" 
              value={form.finalVerdict || ''} 
              onChange={e => handleFieldChange('finalVerdict', e.target.value)} 
              placeholder="Concluding recommendation and final buying advice..." 
            />
          </div>
        </div>
      </section>
    </div>
  );
}
