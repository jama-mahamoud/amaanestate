import { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { uploadFile } from '@/services/uploadService';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  folder?: string;
}

export default function ImageUpload({ value, onChange, label = 'Featured Image', folder = 'articles' }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (file: File) => {
    if (!file) return;
    try {
      setIsUploading(true);
      const url = await uploadFile(file, folder, setProgress);
      onChange(url);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  const onDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files[0]);
    }
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUpload(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em]">{label}</label>
      
      {value ? (
        <div className="relative rounded-2xl overflow-hidden aspect-[16/9] border border-white/10 group">
          <img src={value} alt="Uploaded" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={() => onChange('')}
              className="bg-red-500/80 text-white p-3 rounded-xl hover:bg-red-500 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      ) : (
        <label
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
          onDrop={onDrop}
          className={`flex flex-col items-center justify-center w-full aspect-[16/9] rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
            isDragging ? 'border-luxury-gold bg-luxury-gold/5' : 'border-white/10 hover:border-white/20 bg-white/5'
          }`}
        >
          {isUploading ? (
            <div className="flex items-center flex-col gap-4 w-full px-12">
               <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                 <div className="bg-luxury-gold h-full transition-all duration-300" style={{ width: `${progress}%` }} />
               </div>
               <span className="text-luxury-gold font-bold text-sm">{Math.round(progress)}% Uploaded</span>
            </div>
          ) : (
            <>
              <div className="p-4 bg-white/5 rounded-full mb-4">
                <Upload size={32} className="text-white/40" />
              </div>
              <p className="text-sm font-semibold text-white/60">Click or drag image to upload</p>
              <p className="text-xs text-white/30 mt-2">JPEG, PNG, WebP up to 5MB</p>
            </>
          )}
          <input type="file" className="hidden" accept="image/*" onChange={onFileChange} disabled={isUploading} />
        </label>
      )}
    </div>
  );
}
