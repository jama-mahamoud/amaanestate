import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { GalleryItem } from '@/services/reviewService';
import { 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  FileText, 
  ArrowUp, 
  ArrowDown, 
  ExternalLink,
  Tag
} from 'lucide-react';
import { toast } from 'sonner';

interface ProductImageAssetBuilderProps {
  gallery: GalleryItem[];
  onChange: (newGallery: GalleryItem[]) => void;
}

export default function ProductImageAssetBuilder({ gallery = [], onChange }: ProductImageAssetBuilderProps) {
  
  // Safe helper to generate a unique ID
  const generateId = () => `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Normalizes an existing gallery item to ensure it populated new productUrl/imageUrl properties
  const getNormalizedItems = (): GalleryItem[] => {
    return gallery.map(item => {
      const id = item.id || generateId();
      const imageUrl = item.imageUrl || item.url || '';
      const productUrl = item.productUrl || item.price || '';
      const title = item.title || item.caption || '';
      const description = item.description || '';
      
      return {
        ...item,
        id,
        imageUrl,
        url: imageUrl, // backward compatibility
        productUrl,
        price: productUrl, // backward compatibility / affiliate link placeholder
        title,
        caption: title, // backward compatibility
        description
      };
    });
  };

  const items = getNormalizedItems();

  // Appends a new empty asset card
  const handleAppendAsset = () => {
    const newAsset: GalleryItem = {
      id: generateId(),
      productUrl: '',
      imageUrl: '',
      title: '',
      description: '',
      url: '',
      price: '',
      caption: ''
    };
    onChange([...items, newAsset]);
    toast.success('New product image asset appended!');
  };

  // Safe handler to update any field within an individual asset card
  const handleUpdateField = (id: string, field: keyof GalleryItem, value: string) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        
        // Synchronize legacy fields dynamically for complete database compatibility
        if (field === 'imageUrl') {
          updated.url = value;
        } else if (field === 'productUrl') {
          updated.price = value;
        } else if (field === 'title') {
          updated.caption = value;
        }
        return updated;
      }
      return item;
    });
    onChange(updatedItems);
  };

  // Removes an individual asset from the list
  const handleRemoveAsset = (id: string) => {
    const filtered = items.filter(item => item.id !== id);
    onChange(filtered);
    toast.info('Product image asset removed from checklist.');
  };

  // Reorder operations
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const reordered = [...items];
    const temp = reordered[index];
    reordered[index] = reordered[index - 1];
    reordered[index - 1] = temp;
    onChange(reordered);
  };

  const handleMoveDown = (index: number) => {
    if (index === items.length - 1) return;
    const reordered = [...items];
    const temp = reordered[index];
    reordered[index] = reordered[index + 1];
    reordered[index + 1] = temp;
    onChange(reordered);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header section with instructions & append triggers */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-[#0a0a0f] border border-white/5 rounded-2xl">
        <div className="text-left space-y-1">
          <h3 className="text-sm font-semibold text-[#C5A059] flex items-center gap-2">
            <ImageIcon className="h-4 w-4" /> Product Image Asset Builder
          </h3>
          <p className="text-[11px] text-white/40 leading-relaxed font-light">
            Construct high-fidelity, independent image assets linked dynamically to affiliate redirect pages, supporting rich text overlays.
          </p>
        </div>
        
        <Button 
          type="button" 
          onClick={handleAppendAsset}
          className="bg-[#C5A059] hover:bg-white text-black font-mono text-xs font-bold uppercase tracking-wider h-10 px-4 flex items-center gap-2 rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer shrink-0"
        >
          <Plus size={16} /> Append Product Image Asset
        </Button>
      </div>

      {/* Asset Cards Stack */}
      {items.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-white/10 rounded-2xl bg-black/20 flex flex-col items-center justify-center gap-3">
          <ImageIcon className="h-8 w-8 text-white/20 animate-pulse" />
          <div className="space-y-1">
            <p className="text-xs text-white/50 font-mono uppercase tracking-wider">No assets configured</p>
            <p className="text-[10px] text-white/30 max-w-sm">
              Click the append button above to add independent product-driven editorial showcase elements.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => {
            const hasImage = item.imageUrl && item.imageUrl.trim().startsWith('http');
            
            return (
              <div 
                key={item.id}
                className="group relative bg-[#0b0b10] border border-white/5 hover:border-white/10 rounded-2xl p-5 shadow-xl transition-all duration-300 flex flex-col md:flex-row gap-6 items-stretch"
              >
                {/* 1. Live Image Preview Frame (Left Panel) */}
                <div className="md:w-44 w-full flex-shrink-0 bg-neutral-950 rounded-xl border border-white/5 flex flex-col items-center justify-center p-3 relative group-hover:border-[#C5A059]/10 transition-colors min-h-[160px]">
                  {hasImage ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img 
                        src={item.imageUrl} 
                        alt={item.title || "Asset Preview"} 
                        className="max-h-32 max-w-full object-contain rounded-lg transition-transform duration-300 group-hover:scale-[1.02]"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          // Handle broken image URL gracefully
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      {item.productUrl && (
                        <a 
                          href={item.productUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="absolute -bottom-1 -right-1 bg-black/80 hover:bg-[#C5A059] hover:text-black border border-white/10 text-white/60 p-1.5 rounded-lg transition-all"
                          title="Verify reference URL link"
                        >
                          <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center gap-2 p-2 select-none">
                      <ImageIcon className="h-6 w-6 text-white/15" />
                      <span className="text-[9px] font-mono uppercase tracking-widest text-white/20">Preview Pending</span>
                    </div>
                  )}
                  
                  {/* Aspect Ratio / Order Badge */}
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/80 border border-white/5 text-[9px] font-mono text-[#C5A059] rounded-md tracking-wider">
                    Asset #{index + 1}
                  </div>
                </div>

                {/* 2. Editable Fields Container (Middle Panel) */}
                <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Row 1: Image URL & Product Link */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-mono tracking-widest text-white/40 flex items-center gap-1.5">
                      <ImageIcon size={10} className="text-[#C5A059]" /> Image URL <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Input 
                        placeholder="https://images.unsplash.com/photo-..." 
                        value={item.imageUrl} 
                        onChange={e => handleUpdateField(item.id!, 'imageUrl', e.target.value)} 
                        className="bg-black/40 border-white/10 text-xs pl-8 text-white focus-visible:ring-[#C5A059]/20"
                      />
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/20 text-xs">
                        <ImageIcon size={12} />
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-mono tracking-widest text-white/40 flex items-center gap-1.5">
                      <LinkIcon size={10} className="text-[#C5A059]" /> Affiliate Product URL <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Input 
                        placeholder="https://affiliate.brand.com/deals/..." 
                        value={item.productUrl} 
                        onChange={e => handleUpdateField(item.id!, 'productUrl', e.target.value)} 
                        className="bg-black/40 border-white/10 text-xs pl-8 text-white focus-visible:ring-[#C5A059]/20"
                      />
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/20 text-xs">
                        <LinkIcon size={12} />
                      </span>
                    </div>
                  </div>

                  {/* Row 2: Asset Title & Context Description */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-mono tracking-widest text-white/40 flex items-center gap-1.5">
                      <Tag size={10} /> Title Label <span className="text-white/20 italic">(Optional)</span>
                    </label>
                    <Input 
                      placeholder="e.g., Enterprise Controller Panel Closeup" 
                      value={item.title} 
                      onChange={e => handleUpdateField(item.id!, 'title', e.target.value)} 
                      className="bg-black/40 border-white/10 text-xs text-white uppercase tracking-wider font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-mono tracking-widest text-white/40 flex items-center gap-1.5">
                      <FileText size={10} /> Description Overlay <span className="text-white/20 italic">(Optional)</span>
                    </label>
                    <Input 
                      placeholder="Brief layout caption detailed when zoomed in..." 
                      value={item.description} 
                      onChange={e => handleUpdateField(item.id!, 'description', e.target.value)} 
                      className="bg-black/40 border-white/10 text-xs text-white"
                    />
                  </div>
                </div>

                {/* 3. Asset Sorting & Controls Toolbar (Right Side) */}
                <div className="flex md:flex-col justify-between md:justify-center items-center gap-2 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-5 flex-shrink-0">
                  <div className="flex md:flex-col gap-1.5">
                    {/* Move Up */}
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveUp(index)}
                      className="p-1.5 rounded-lg border border-white/5 hover:border-[#C5A059]/20 text-white/40 hover:text-[#C5A059] bg-black/30 hover:bg-[#C5A059]/5 disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-white/40 transition-all cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp size={14} />
                    </button>

                    {/* Move Down */}
                    <button
                      type="button"
                      disabled={index === items.length - 1}
                      onClick={() => handleMoveDown(index)}
                      className="p-1.5 rounded-lg border border-white/5 hover:border-[#C5A059]/20 text-white/40 hover:text-[#C5A059] bg-black/30 hover:bg-[#C5A059]/5 disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-white/40 transition-all cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>

                  {/* Complete Delete button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveAsset(item.id!)}
                    className="p-2 border border-red-500/10 hover:border-red-500/30 text-red-400 hover:text-red-300 bg-red-500/5 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-mono"
                    title="Remove asset card"
                  >
                    <Trash2 size={13} />
                    <span className="md:hidden">Remove</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
