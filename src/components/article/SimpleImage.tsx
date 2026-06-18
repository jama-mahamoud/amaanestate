import React from 'react';
import { GalleryImage } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';

interface SimpleImageProps {
  value?: GalleryImage;
  onChange: (image?: GalleryImage) => void;
  label: string;
}

export default function SimpleImage({ value, onChange, label }: SimpleImageProps) {
  const update = (field: keyof GalleryImage, val: string) => {
    onChange({ ... (value || { url: '', caption: '', linkUrl: '' }), [field]: val });
  };

  return (
    <div className="space-y-2 p-4 border border-white/10 rounded-xl bg-neutral-900/50">
      <label className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em]">{label}</label>
      <div className="flex gap-4">
        <div className="aspect-square w-24 bg-neutral-800 rounded-lg overflow-hidden border border-white/5 flex-shrink-0">
          {value?.url ? (
            <img src={value.url} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] text-white/20">Preview</div>
          )}
        </div>
        
        <div className="flex-1 space-y-2">
          <Input placeholder="Image URL" value={value?.url || ''} onChange={e => update('url', e.target.value)}/>
          <Input placeholder="Caption" value={value?.caption || ''} onChange={e => update('caption', e.target.value)}/>
          <Input placeholder="Optional Affiliate/Link URL" value={value?.linkUrl || ''} onChange={e => update('linkUrl', e.target.value)}/>
        </div>
        
        {value && (
            <Button variant="ghost" size="icon" onClick={() => onChange(undefined)} className="text-white/20 hover:text-red-500">
                <X size={16} />
            </Button>
        )}
      </div>
    </div>
  );
}
