import { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
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
  const [urlInput, setUrlInput] = useState('');

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

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput('');
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em]">{label}</label>
      
      {value ? (
        <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#09090d] group transition-all duration-300 flex items-center justify-center p-3 min-h-[220px] md:min-h-[280px]">
          {/* Subtle Ambient Blurred Background to prevent raw empty margins and look highly premium */}
          <div 
            className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-20 scale-110 pointer-events-none select-none"
            style={{ backgroundImage: `url(${value})` }}
          />
          {/* Overlay to elevate card elegance */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 pointer-events-none select-none" />
          
          {/* Full Composition Image */}
          <img 
            src={value} 
            alt="Uploaded Cover Preview" 
            className="relative z-10 max-h-[240px] md:max-h-[300px] w-auto max-w-full object-contain rounded-lg shadow-2xl mx-auto transition-transform duration-500 group-hover:scale-[1.015]"
            referrerPolicy="no-referrer"
          />

          {/* Premium Floating Corner Delete Action */}
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-3 right-3 z-20 bg-black/75 hover:bg-red-500 border border-white/10 text-white p-2.5 rounded-xl transition-all duration-300 md:opacity-0 group-hover:opacity-100 hover:scale-105 shadow-lg flex items-center justify-center"
            title="Remove Image"
          >
            <X size={15} />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
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

          <div className="flex items-center gap-2">
            <div className="h-[1px] flex-1 bg-white/10" />
            <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">OR</span>
            <div className="h-[1px] flex-1 bg-white/10" />
          </div>

          <form onSubmit={handleUrlSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Paste image URL here..."
                className="w-full bg-black/50 border border-white/10 text-white text-sm rounded-xl pl-9 pr-3 h-10 focus:outline-none focus:border-[#C5A059]/50"
              />
            </div>
            <button
              type="submit"
              disabled={!urlInput.trim()}
              className="bg-white/5 hover:bg-white/10 text-white font-bold text-xs px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
            >
              Apply
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
