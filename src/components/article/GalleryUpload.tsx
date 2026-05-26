import { useState, useCallback } from 'react';
import { Upload, X, Grid } from 'lucide-react';
import { uploadFile } from '@/services/uploadService';
import { motion, AnimatePresence } from 'framer-motion';

interface GalleryUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  folder?: string;
}

export default function GalleryUpload({ value = [], onChange, label = 'Gallery Images', folder = 'articles_gallery' }: GalleryUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    try {
      setIsUploading(true);
      const newUrls: string[] = [];
      const total = files.length;
      
      for (let i = 0; i < total; i++) {
        const file = files[i];
        const url = await uploadFile(file, folder, (p) => setProgress((i / total) * 100 + (p / total)));
        newUrls.push(url);
      }
      
      onChange([...value, ...newUrls]);
    } catch (error) {
      console.error('Gallery upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  const onDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleUpload(e.dataTransfer.files);
    }
  }, [value, onChange]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleUpload(e.target.files);
    }
  };

  const removeImage = (indexToRemove: number) => {
    onChange(value.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
         <label className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em]">{label}</label>
         <span className="text-white/30 text-[10px] font-bold">{value.length} Images</span>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {value.map((url, idx) => (
            <motion.div
              key={url}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 group"
            >
              <img src={url} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="bg-red-500/80 text-white p-2 rounded-xl hover:bg-red-500 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <label
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
          onDrop={onDrop}
          className={`flex flex-col items-center justify-center aspect-square rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
            isDragging ? 'border-luxury-gold bg-luxury-gold/5' : 'border-white/10 hover:border-white/20 bg-white/5'
          }`}
        >
          {isUploading ? (
            <div className="flex items-center flex-col gap-3 w-full px-6">
               <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                 <div className="bg-luxury-gold h-full transition-all duration-300" style={{ width: `${progress}%` }} />
               </div>
               <span className="text-luxury-gold font-bold text-[10px] uppercase">{Math.round(progress)}%</span>
            </div>
          ) : (
            <>
              <Upload size={24} className="text-white/40 mb-2" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 text-center">Add Image</p>
            </>
          )}
          <input type="file" className="hidden" accept="image/*" multiple onChange={onFileChange} disabled={isUploading} />
        </label>
      </div>
    </div>
  );
}
