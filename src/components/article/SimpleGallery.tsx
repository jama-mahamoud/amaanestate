import React from 'react';
import { GalleryImage } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Plus, Link as LinkIcon } from 'lucide-react';

interface SimpleGalleryProps {
  images: GalleryImage[];
  onChange: (images: GalleryImage[]) => void;
}

export default function SimpleGallery({ images = [], onChange }: SimpleGalleryProps) {
  const addImage = () => {
    onChange([...images, { url: '', caption: '', linkUrl: '' }]);
  };

  const updateImage = (index: number, field: keyof GalleryImage, value: string) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], [field]: value };
    onChange(newImages);
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em]">Image Gallery</label>
        <Button size="sm" variant="outline" onClick={addImage} className="text-xs">
          <Plus size={14} className="mr-2" /> Add Image
        </Button>
      </div>

      <div className="space-y-4">
        {images.map((img, index) => (
          <div key={index} className="p-4 border border-white/10 rounded-xl bg-neutral-900/50 flex gap-4">
            <div className="flex flex-col gap-2 w-32">
              <div className="aspect-square bg-neutral-800 rounded-lg overflow-hidden border border-white/5">
                {img.url ? (
                  <img src={img.url} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-white/20">Preview</div>
                )}
              </div>
            </div>
            
            <div className="flex-1 space-y-2">
              <Input 
                placeholder="Image URL" 
                value={img.url} 
                onChange={e => updateImage(index, 'url', e.target.value)}
              />
              <Input 
                placeholder="Caption" 
                value={img.caption} 
                onChange={e => updateImage(index, 'caption', e.target.value)}
              />
              <Input 
                placeholder="Optional Affiliate/Link URL" 
                value={img.linkUrl || ''} 
                onChange={e => updateImage(index, 'linkUrl', e.target.value)}
              />
            </div>

            <Button variant="ghost" size="icon" onClick={() => removeImage(index)} className="text-white/20 hover:text-red-500">
              <X size={16} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
