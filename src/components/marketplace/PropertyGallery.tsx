import React, { useEffect, useState } from 'react';
import { Building2, ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import { PropertyImage } from '../../types';

interface PropertyGalleryProps {
  title: string;
  images: PropertyImage[];
}

export default function PropertyGallery({ title, images }: PropertyGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [failedUrls, setFailedUrls] = useState<Record<string, boolean>>({});

  const validImages = images.filter((img) => Boolean(img.image_url));
  const activeImage = validImages[selectedIndex] || validImages[0] || null;

  useEffect(() => {
    setSelectedIndex(0);
  }, [images.length]);

  useEffect(() => {
    if (!lightboxOpen || validImages.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxOpen(false);
      } else if (e.key === 'ArrowRight') {
        setSelectedIndex((prev) => (prev + 1) % validImages.length);
      } else if (e.key === 'ArrowLeft') {
        setSelectedIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, validImages.length]);

  if (!activeImage || failedUrls[activeImage.image_url]) {
    return (
      <div className="aspect-[16/9] bg-gradient-to-br from-[#F3EFE8] to-[#E6E0D4] border border-[#E5E0D8] rounded flex flex-col items-center justify-center p-8 text-center">
        <Building2 size={40} className="text-[#8C4A27] mb-3" strokeWidth={1.5} />
        <p className="text-sm font-serif font-medium text-[#141413]">{title}</p>
        <p className="text-xs text-[#5C5A55] mt-1">No photographs uploaded for this listing yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-[16/9] bg-[#EBE6DF] border border-[#E5E0D8] rounded overflow-hidden group">
        <img
          src={activeImage.image_url}
          alt={activeImage.alt_text || title}
          referrerPolicy="no-referrer"
          onError={() =>
            setFailedUrls((prev) => ({ ...prev, [activeImage.image_url]: true }))
          }
          className="w-full h-full object-cover object-center"
        />

        {validImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={() =>
                setSelectedIndex((prev) => (prev - 1 + validImages.length) % validImages.length)
              }
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#141413] flex items-center justify-center shadow transition-colors cursor-pointer"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => setSelectedIndex((prev) => (prev + 1) % validImages.length)}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#141413] flex items-center justify-center shadow transition-colors cursor-pointer"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <span className="px-2.5 py-1 bg-[#141413]/80 text-white text-[11px] font-mono tabular-nums rounded">
            {selectedIndex + 1} / {validImages.length}
          </span>
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            aria-label="Expand image gallery"
            className="p-2 bg-white/90 hover:bg-white text-[#141413] rounded shadow transition-colors cursor-pointer"
          >
            <Expand size={15} />
          </button>
        </div>
      </div>

      {validImages.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
          {validImages.map((img, idx) => (
            <button
              key={img.id || img.image_url + idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={`aspect-[4/3] rounded overflow-hidden border-2 transition-colors cursor-pointer bg-[#EBE6DF] ${
                idx === selectedIndex
                  ? 'border-[#1E3A5F]'
                  : 'border-transparent hover:border-[#CFC7B8]'
              }`}
            >
              <img
                src={img.image_url}
                alt={img.alt_text || `${title} photo ${idx + 1}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} image gallery`}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close lightbox"
            className="absolute top-4 right-4 p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full cursor-pointer"
          >
            <X size={20} />
          </button>

          {validImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={() =>
                  setSelectedIndex((prev) => (prev - 1 + validImages.length) % validImages.length)
                }
                aria-label="Previous photo"
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full cursor-pointer"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                onClick={() => setSelectedIndex((prev) => (prev + 1) % validImages.length)}
                aria-label="Next photo"
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full cursor-pointer"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}

          <div className="max-w-5xl max-h-[85vh] flex flex-col items-center gap-3">
            <img
              src={activeImage.image_url}
              alt={activeImage.alt_text || title}
              referrerPolicy="no-referrer"
              className="max-h-[78vh] w-auto object-contain rounded"
            />
            <p className="text-xs text-white/80 font-mono tabular-nums">
              {selectedIndex + 1} / {validImages.length}
              {activeImage.alt_text ? ` — ${activeImage.alt_text}` : ''}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
