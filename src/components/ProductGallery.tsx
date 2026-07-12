import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, ExternalLink } from 'lucide-react';

export interface GalleryImage {
  url: string;
  title?: string;
  price?: string;
  discountPrice?: string;
  productUrl?: string;
  ctaButtonText?: string;
}

interface ProductGalleryProps {
  images: GalleryImage[];
  affiliateUrl?: string;
  brandName?: string;
}

export default function ProductGallery({ images, affiliateUrl = '#', brandName = 'Product' }: ProductGalleryProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedIdx !== null) {
      setSelectedIdx((selectedIdx + 1) % images.length);
    }
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedIdx !== null) {
      setSelectedIdx((selectedIdx - 1 + images.length) % images.length);
    }
  };

  const closeModal = () => {
    setSelectedIdx(null);
  };

  return (
    <div className="w-full space-y-6">
      <div className="text-left border-b border-white/5 pb-2 mb-4">
        <h3 className="text-[#C5A059] font-mono text-[10px] uppercase tracking-widest font-bold">
          Product Showcases & Asset Gallery
        </h3>
        <p className="text-xs text-neutral-450 mt-1">
          Explore close-up captures and interactive interface layouts of {brandName}.
        </p>
      </div>

      {/* Grid of gallery assets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {images.map((img, idx) => (
          <div 
            key={idx} 
            className="group block bg-neutral-900/40 border border-white/5 hover:border-[#C5A059]/30 rounded-2xl overflow-hidden transition-all duration-300 shadow-xl cursor-pointer flex flex-col justify-between"
            onClick={() => setSelectedIdx(idx)}
            id={`gallery-item-${idx}`}
          >
            {/* Image Wrap */}
            <div className="aspect-square bg-neutral-950/80 p-6 flex items-center justify-center relative overflow-hidden">
              <img 
                src={img.url} 
                alt={img.title || `${brandName} Showcase`} 
                className="max-h-full max-w-full object-contain select-none transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="text-[10px] font-mono uppercase bg-black/80 text-white py-1.5 px-3.5 rounded-lg tracking-wider border border-white/10 font-bold">
                  View Detail
                </span>
              </div>
            </div>

            {/* Meta Text below only */}
            <div className="p-4 border-t border-white/5 bg-[#0f0f12]/90 flex flex-col gap-3 text-left">
              <span className="text-xs font-semibold text-neutral-200 line-clamp-1">
                {img.title || `Showcase Item #${idx + 1}`}
              </span>
              
              {(img.price || img.discountPrice) && (
                <div className="flex items-baseline gap-2">
                  {img.discountPrice ? (
                    <>
                      <span className="text-sm font-bold text-emerald-400">{img.discountPrice}</span>
                      {img.price && (
                        <span className="text-xs font-medium text-neutral-500 line-through">{img.price}</span>
                      )}
                      {img.price && img.discountPrice && (
                        <span className="ml-auto bg-emerald-500/10 text-emerald-400 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                          SAVE {Math.round((1 - parseFloat(img.discountPrice.replace(/[^0-9.]/g, '')) / parseFloat(img.price.replace(/[^0-9.]/g, ''))) * 100) || 0}%
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-sm font-bold text-white">{img.price}</span>
                  )}
                </div>
              )}

              <a
                href={img.productUrl || affiliateUrl || '#'}
                target="_blank"
                rel="nofollow sponsored noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="mt-1 w-full bg-white/5 hover:bg-[#C5A059] hover:text-black border border-white/10 hover:border-transparent text-white text-[11px] font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 text-center cursor-pointer"
              >
                {img.ctaButtonText || 'Buy Now'} <ExternalLink size={10} />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Full Screen Lightbox Modal */}
      <AnimatePresence>
        {selectedIdx !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
            onClick={closeModal}
          >
            {/* Close Button */}
            <button 
              onClick={closeModal}
              className="absolute top-6 right-6 z-50 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-[#C5A059] text-white p-2.5 rounded-full cursor-pointer transition-all animate-none"
              aria-label="Close Lightbox"
            >
              <X size={20} />
            </button>

            {/* Left Nav */}
            {images.length > 1 && (
              <button
                onClick={handlePrev}
                className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 bg-white/5 hover:bg-[#C5A059] border border-white/15 text-white hover:text-black w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer z-50 hover:shadow-lg hover:shadow-[#C5A059]/10"
                aria-label="Previous Image"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            {/* Image Container */}
            <motion.div 
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative max-w-5xl w-full max-h-[80vh] flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={images[selectedIdx].url} 
                alt={images[selectedIdx].title || "High resolution showcase image"}
                className="max-h-[70vh] max-w-full object-contain rounded-xl select-none"
                referrerPolicy="no-referrer"
              />

              {/* Caption and price inside image wrapper */}
              <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-full text-center space-y-1 bg-black/50 py-3 rounded-xl px-6 max-w-lg backdrop-blur-md border border-white/5">
                {images[selectedIdx].title && (
                  <p className="text-sm font-semibold text-white truncate">
                    {images[selectedIdx].title}
                  </p>
                )}
                {images[selectedIdx].price && (
                  <p className="text-xs font-mono text-emerald-450 font-bold">
                    Price: {images[selectedIdx].price}
                  </p>
                )}
              </div>
            </motion.div>

            {/* Right Nav */}
            {images.length > 1 && (
              <button
                onClick={handleNext}
                className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 bg-white/5 hover:bg-[#C5A059] border border-white/15 text-white hover:text-black w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer z-50 hover:shadow-lg hover:shadow-[#C5A059]/10"
                aria-label="Next Image"
              >
                <ChevronRight size={24} />
              </button>
            )}

            {/* External Action Button floating at bottom center */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
              <a 
                href={affiliateUrl}
                target="_blank"
                rel="nofollow sponsored noopener noreferrer"
                className="bg-[#C5A059] hover:bg-white text-black font-semibold text-xs py-3 px-6 rounded-xl flex items-center justify-center gap-1.5 shadow-xl transition-all font-mono uppercase tracking-widest"
              >
                <span>Visit Official Partner</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
