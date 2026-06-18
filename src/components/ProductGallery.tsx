import React from 'react';
import { motion } from 'framer-motion';

export interface GalleryImage {
  url: string;
  title?: string;
}

interface ProductGalleryProps {
  images: GalleryImage[];
  affiliateUrl?: string;
  brandName?: string;
}

export default function ProductGallery({ images, affiliateUrl = '#', brandName = 'Product' }: ProductGalleryProps) {
  if (!images || images.length === 0) return null;

  return (
    <div className="w-full max-w-7xl mx-auto">
      <h3 className="text-neutral-500 font-mono text-[10px] uppercase tracking-widest font-bold mb-4">
        Product Images & Gallery
      </h3>
      {/* 
        Parent group controls the "dim siblings" effect.
        We use has-[:hover] to dim others when one is hovered, or just simple group logic.
        Tailwind group-hover works well with peer or within a common parent using state or custom CSS.
      */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 [&:hover>a]:opacity-50">
        {images.map((img, gIdx) => {
          const imageUrl = img.url;
          const captionText = img.title;
          
          return (
            <a
              key={gIdx}
              href={affiliateUrl}
              target="_blank"
              rel="nofollow sponsored noopener noreferrer"
              title={`View ${brandName} Deal`}
              className="group block overflow-hidden rounded-xl border border-white/5 bg-neutral-950/20 shadow-sm transition-all duration-300 hover:!opacity-100 hover:border-[#C5A059]/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#C5A059]/10 relative"
            >
              <div className="aspect-video overflow-hidden border-b border-white/[0.02]">
                <img
                  src={imageUrl}
                  alt={captionText || `${brandName} Image ${gIdx + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transform scale-100 group-hover:scale-110 transition-transform duration-500 ease-out"
                />
                {/* Subtle highlight overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div className="absolute bottom-3 right-3 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none flex items-center justify-center">
                  <span className="bg-[#C5A059] text-black text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg">
                    Buy Now
                  </span>
                </div>
              </div>
              {captionText && (
                <div className="p-3 bg-neutral-900/40 relative z-10 transition-colors duration-300 group-hover:bg-neutral-800/60">
                  <p className="text-[11px] text-neutral-400 font-light leading-snug group-hover:text-neutral-200 transition-colors duration-300">
                    {captionText}
                  </p>
                </div>
              )}
            </a>
          );
        })}
      </div>
    </div>
  );
}
