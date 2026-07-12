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
        <div className="relative rounded-2xl overflow-hidden aspect-[16/9] border border-white/10 group bg-neutral-900">
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
