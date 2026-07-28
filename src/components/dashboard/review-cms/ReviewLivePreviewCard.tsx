import React from 'react';
import { Star, ExternalLink, ShieldCheck, Tag, Check, X, ArrowRight } from 'lucide-react';
import { EditorialReview } from '@/services/reviewService';
import { getCategoryLabel } from '@/data/categories';

interface ReviewLivePreviewCardProps {
  form: Partial<EditorialReview>;
}

export function ReviewLivePreviewCard({ form }: ReviewLivePreviewCardProps) {
  const discountLabel = form.discountLabel || (form.price && form.discountPrice ? 'Special Deal' : null);

  return (
    <div className="bg-[#08080c] border border-white/10 rounded-2xl overflow-hidden shadow-2xl space-y-0">
      {/* Top Banner Header */}
      <div className="relative w-full bg-black aspect-video flex items-center justify-center overflow-hidden border-b border-white/10">
        {form.featuredImage ? (
          <img
            src={form.featuredImage}
            alt="Preview"
            className="w-full h-full object-cover opacity-90 transition-transform hover:scale-105 duration-300"
          />
        ) : (
          <div className="text-white/20 text-xs font-mono py-16 flex flex-col items-center gap-2">
            <span>No Hero Banner Image</span>
          </div>
        )}

        {/* Category Pill */}
        <span className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[9px] font-mono text-white font-bold uppercase tracking-wider border border-white/15 z-10">
          {form.category ? getCategoryLabel(form.category) : 'Software'}
        </span>

        {/* Discount Badge */}
        {discountLabel && (
          <span className="absolute top-3 right-3 bg-amber-500 text-black px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider z-10 shadow-lg">
            {discountLabel}
          </span>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 space-y-4">
        {/* Title & Rating */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 block mb-0.5">
              {form.brandName || 'Editorial Assessment'}
            </span>
            <h3 className="text-base font-serif font-bold text-white tracking-tight leading-snug line-clamp-2">
              {form.title || 'Untitled Review...'}
            </h3>
          </div>
          <div className="flex items-center gap-1 bg-[#14141c] text-amber-400 px-2 py-1 rounded-lg border border-amber-500/20 font-mono text-xs font-bold shrink-0">
            <Star size={12} className="fill-amber-400" /> {form.rating || '5.0'}
          </div>
        </div>

        {/* Intro Excerpt */}
        <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
          {form.introduction || form.excerpt || 'Engaging review introduction snippet...'}
        </p>

        {/* Coupon Code Pill if present */}
        {form.couponCode && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-amber-300 font-mono font-bold">
              <Tag size={12} /> {form.couponCode}
            </div>
            <span className="text-[10px] text-amber-200/70">{form.couponDiscount || 'Exclusive Code'}</span>
          </div>
        )}

        {/* Price Block */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between">
          <div>
            <div className="text-[9px] font-mono uppercase text-white/40">Verified Price</div>
            <div className="flex items-baseline gap-2 mt-0.5">
              {form.discountPrice ? (
                <>
                  <span className="text-base font-bold text-emerald-400">{form.discountPrice}</span>
                  {form.price && (
                    <span className="text-xs text-white/40 line-through">{form.price}</span>
                  )}
                </>
              ) : (
                <span className="text-base font-bold text-white">{form.price || 'Free / Pricing On Request'}</span>
              )}
            </div>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg">
            Verified Partner
          </div>
        </div>

        {/* Primary CTA Button */}
        <a
          href={form.affiliateUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs h-10 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20"
        >
          {form.ctaSummary || 'Get Deal Today'} <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
}
