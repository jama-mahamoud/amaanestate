import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Percent, ExternalLink, Star } from 'lucide-react';
import { UnifiedProduct } from '@/services/productService';

interface ProductCardProps {
  p: UnifiedProduct;
}

export const ProductCard = React.memo<ProductCardProps>(({ p }) => {
  const navigate = useNavigate();
  return (
    <div
      className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col h-full hover:shadow-lg transition-all duration-300 group relative"
    >
      {/* Image viewport */}
      <div 
        className="aspect-[16/10] sm:aspect-[4/3] relative bg-slate-50 border-b border-slate-100 block flex-shrink-0 cursor-pointer overflow-hidden" 
        onClick={() => navigate(`/product/${p.id}`)}
      >
        <img
          src={p.featuredImage}
          alt={p.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 select-none"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
        
        {/* Discount badge tag */}
        {p.discountPercent && (
          <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-[#e11d48] text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded uppercase shadow-sm z-10 flex items-center gap-0.5">
            <Percent size={8} className="sm:w-2.5 sm:h-2.5" /> {p.discountPercent}% Off
          </span>
        )}
      </div>

      {/* Core description details */}
      <div className="p-2.5 sm:p-4 flex flex-col flex-grow bg-white">
        {/* Title */}
        <h3 
          className="text-[11px] sm:text-sm font-semibold text-slate-900 leading-tight line-clamp-2 h-7 sm:h-10 mb-1 cursor-pointer hover:underline"
          onClick={() => navigate(`/product/${p.id}`)}
          title={p.title}
        >
          {p.title}
        </h3>
        
        {/* Brand, Category & Rating Row */}
        <div className="flex items-center justify-between gap-1 mb-1.5 sm:mb-2 text-[9px] sm:text-xs text-slate-500">
          <div className="flex items-center gap-1 min-w-0">
            <span className="font-medium text-slate-700 truncate max-w-[50px] sm:max-w-[100px]">{p.brandName}</span>
            <span className="text-slate-300">•</span>
            <span className="bg-slate-100 text-slate-600 px-1 py-0.5 rounded uppercase font-mono tracking-wide truncate max-w-[50px] sm:max-w-none">
              {p.category}
            </span>
          </div>
          {p.rating && (
            <div className="flex items-center gap-0.5 text-amber-500 font-bold shrink-0">
              <Star size={10} className="fill-amber-500 text-amber-500 sm:w-3 sm:h-3" />
              <span>{p.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Short Description */}
        {p.description && (
          <p className="text-[10px] sm:text-xs text-slate-500 line-clamp-2 sm:line-clamp-3 mb-2 leading-snug sm:leading-relaxed">
            {p.description}
          </p>
        )}

        {/* Prices & Actions */}
        <div className="mt-auto pt-1 sm:pt-2">
          <div className="flex items-baseline gap-1.5 sm:gap-2 mb-2 sm:mb-3">
            <span className="text-xs sm:text-base font-bold text-slate-900">
              {p.price}
            </span>
            {p.originalPrice && (
              <span className="text-[9px] sm:text-xs line-through text-slate-400">
                {p.originalPrice}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => navigate(`/product/${p.id}`)}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-lg sm:rounded-xl h-8 sm:h-11 flex items-center justify-center transition-colors p-0"
            >
              Details
            </button>
            <a
              href={p.affiliateUrl || '#'}
              target="_blank"
              rel="nofollow sponsored noopener noreferrer"
              className="flex-1 bg-[#C5A059] hover:bg-[#b08d4a] text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-lg sm:rounded-xl h-8 sm:h-11 flex items-center justify-center gap-1 transition-colors"
            >
              Buy <ExternalLink size={12} className="hidden sm:block" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
});
