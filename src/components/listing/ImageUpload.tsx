import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, X, Image as ImageIcon, Loader2, Plus, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  onImagesChange: (files: File[]) => void;
  maxFiles?: number;
  existingImages?: string[];
}

interface ImagePreview {
  file: File;
  previewUrl: string;
}

export default function ImageUpload({ onImagesChange, maxFiles = 10, existingImages = [] }: ImageUploadProps) {
  const [previews, setPreviews] = useState<ImagePreview[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      previews.forEach(p => URL.revokeObjectURL(p.previewUrl));
    };
  }, [previews]);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    setError(null);

    const newFiles = Array.from(files);
    const validFiles: ImagePreview[] = [];

    if (previews.length + newFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} images allowed.`);
      return;
    }

    newFiles.forEach(file => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed.');
        return;
      }

      // Validate file size (max 5MB for optimization)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB.');
        return;
      }

      validFiles.push({
        file,
        previewUrl: URL.createObjectURL(file)
      });
    });

    setPreviews(prev => {
      const updated = [...prev, ...validFiles];
      onImagesChange(updated.map(p => p.file));
      return updated;
    });
  }, [previews.length, maxFiles, onImagesChange]);

  const removeImage = (index: number) => {
    setPreviews(prev => {
      const updated = prev.filter((_, i) => i !== index);
      onImagesChange(updated.map(p => p.file));
      // Cleanup URL object to prevent memory leaks
      URL.revokeObjectURL(prev[index].previewUrl);
      return updated;
    });
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <label className="text-[10px] uppercase font-bold tracking-widest text-white/20 ml-1">Asset Imagery</label>
        <p className="text-[10px] text-white/40 font-medium">{previews.length} / {maxFiles} Files</p>
      </div>

      <div 
        onDragOver={onDragOver}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className="group relative h-48 md:h-64 border-2 border-dashed border-white/5 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:border-luxury-gold/30 hover:bg-white/[0.02] transition-all duration-500 overflow-hidden"
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={(e) => handleFiles(e.target.files)}
          multiple 
          accept="image/*" 
          className="hidden" 
        />

        <div className="flex flex-col items-center gap-4 text-center px-8">
           <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-luxury-gold/10 transition-all duration-500">
              <Upload className="text-white/20 group-hover:text-luxury-gold transition-colors" size={24} />
           </div>
           <div>
              <p className="text-sm font-bold text-white group-hover:text-luxury-gold transition-colors">Select or Drop Visual Assets</p>
              <p className="text-[10px] text-white/20 uppercase tracking-widest mt-1 font-bold">PNG, JPG up to 5MB (Max {maxFiles} units)</p>
           </div>
        </div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-[10px] uppercase font-bold tracking-widest"
        >
          <Info size={14} /> {error}
        </motion.div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <AnimatePresence>
          {previews.map((preview, index) => (
            <motion.div
              key={preview.previewUrl}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="group relative aspect-square rounded-2xl overflow-hidden border border-white/5"
            >
              <img 
                src={preview.previewUrl} 
                alt="Preview" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-luxury-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(index);
                }}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300"
              >
                <X size={14} />
              </button>

              {index === 0 && (
                <div className="absolute bottom-2 left-2 bg-luxury-gold text-luxury-black text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded">
                  Primary
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
