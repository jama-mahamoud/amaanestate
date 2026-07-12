import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Tag } from 'lucide-react';

export interface GridProductItem {
  id?: string;
  imageUrl: string;
  title: string;
  price: string;
  affiliateUrl: string;
  discountBadge?: string;
  reviewUrl?: string;
}

export interface AffiliateProductGridProps {
  enabled: boolean;
  gridSize?: '2x2' | '3x3' | '4x4' | '5x5' | '6x6';
  products: GridProductItem[];
  sectionTitle?: string;
}

export default function AffiliateProductGrid({
  enabled,
  gridSize = '3x3',
  products = [],
  sectionTitle = 'Featured Buying Guide & Hardware Deals'
}: AffiliateProductGridProps) {
  if (!enabled || !products || products.length === 0) return null;

  // Explicit literal mappings for responsive columns based on the requested dynamic sizes
  const getGridColsClass = (size: string) => {
    switch (size) {
      case '2x2':
        return 'grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto gap-6';
      case '3x3':
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto gap-6';
      case '4x4':
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5';
      case '5x5':
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4';
      case '6x6':
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3';
      default:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6';
    }
  };

  return (
    <div className="w-full py-8 border-t border-b border-white/5 my-8">
      {/* Module Title */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-[10px] uppercase tracking-widest font-mono text-[#C5A059] font-bold block mb-1">
            Amazon Affiliate Partners & Recommendations
          </span>
          <h2 className="text-xl font-display font-medium text-white tracking-tight">
            {sectionTitle || 'Featured Product Recommendations'}
          </h2>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-[#C5A059]/10 rounded-full border border-[#C5A059]/20 font-mono text-[9px] text-[#C5A059] uppercase tracking-wider font-bold">
          <Tag size={10} /> {products.length} {products.length === 1 ? 'Product' : 'Products'} Listed
        </div>
      </div>

      {/* Grid container with proper dynamic size classes */}
      <div className={`grid ${getGridColsClass(gridSize)} w-full`}>
        {products.map((product, idx) => (
          <motion.div
            key={product.id || idx}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: Math.min(idx * 0.05, 0.4) }}
            className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col h-[380px] hover:shadow-lg transition-all duration-300 group"
          >
            {/* Aspect box for image */}
            <div className="h-[65%] relative bg-slate-50 border-b border-slate-100 p-4 block flex-shrink-0">
              <img
                src={product.imageUrl}
                alt={product.title}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 select-none"
              />

              {/* Discount Badge */}
              {product.discountBadge && (
                <div className="absolute top-2 left-2 bg-[#e11d48] text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm z-10">
                  {product.discountBadge}
                </div>
              )}
            </div>

            {/* Product Meta and CTA area */}
            <div className="p-3 flex flex-col flex-grow bg-white">
              {/* Title */}
              <h4 
                className="text-xs sm:text-sm font-semibold text-slate-900 leading-tight line-clamp-2 h-10 mb-1" 
                title={product.title}
              >
                {product.title}
              </h4>
              
              {/* Fake Brand for consistency if needed, but since it's not provided we can omit or add small spacing */}
              <div className="h-4 mb-2"></div>

              {/* Prices & Actions */}
              <div className="mt-auto">
                <div className="flex items-baseline gap-2 mb-2 sm:mb-3">
                  <span className="text-sm sm:text-base font-bold text-slate-900">
                    {product.price.startsWith('$') ? product.price : `$${product.price}`}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  {product.reviewUrl ? (
                    <a
                      href={product.reviewUrl}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider rounded-lg h-8 sm:h-9 flex items-center justify-center transition-colors"
                    >
                      Details
                    </a>
                  ) : (
                    <div className="bg-slate-50 border border-slate-100 text-slate-400 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider rounded-lg h-8 sm:h-9 flex items-center justify-center cursor-not-allowed">
                      No Review
                    </div>
                  )}
                  
                  <a
                    href={product.affiliateUrl || '#'}
                    target="_blank"
                    rel="nofollow sponsored noopener noreferrer"
                    className="bg-[#C5A059] hover:bg-[#b08d4a] text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-wider rounded-lg h-8 sm:h-9 flex items-center justify-center gap-1 transition-colors"
                  >
                    Buy <ExternalLink size={12} className="hidden sm:block" />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
