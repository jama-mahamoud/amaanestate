import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { EditorialReview } from '@/services/reviewService';
import { getCategoryLabel } from '@/data/categories';

interface NetworkProductCardProps {
  rev: EditorialReview;
  basePath?: string;
}

export default function NetworkProductCard({ rev, basePath = '/ecosystem' }: NetworkProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col h-[400px] hover:shadow-lg transition-all duration-300 group"
    >
      {/* PRODUCT IMAGE (65% height) */}
      <Link 
        to={`${basePath}/${rev.slug}`}
        className="h-[60%] relative block bg-slate-50 border-b border-slate-100 p-4"
        title={`View ${rev.title}`}
      >
        <img 
          src={rev.featuredImage} 
          alt={rev.title} 
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Discount Badge */}
        {rev.discountPrice && rev.price && (
          <div className="absolute top-2 left-2 bg-[#e11d48] text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm z-10">
            SAVE {Math.round((1 - parseFloat(rev.discountPrice.replace(/[^0-9.]/g, '')) / parseFloat(rev.price.replace(/[^0-9.]/g, ''))) * 100) || 0}%
          </div>
        )}
      </Link>

      {/* CARD BODY */}
      <div className="p-3 flex flex-col flex-grow bg-white">
        
        {/* Title: Max 2 lines */}
        <Link to={`${basePath}/${rev.slug}`} className="hover:underline">
          <h4 className="text-sm font-semibold text-slate-900 leading-tight line-clamp-2 h-10 mb-1" title={rev.title}>
            {rev.title}
          </h4>
        </Link>
        
        {/* Brand & Category */}
        <div className="flex items-center gap-2 mb-2 text-xs text-slate-500">
          <span className="font-medium text-slate-700 truncate">{rev.brandName}</span>
          <span className="text-slate-300">•</span>
          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] uppercase font-mono tracking-wide truncate">
            {getCategoryLabel(rev.category)}
          </span>
        </div>

        {/* Price & Actions (Pushed to bottom) */}
        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-3">
            {rev.discountPrice ? (
              <>
                <span className="text-base font-bold text-slate-900">{rev.discountPrice}</span>
                <span className="text-xs text-slate-400 line-through">{rev.price}</span>
              </>
            ) : (
              <span className="text-base font-bold text-slate-900">{rev.price || 'Check Price'}</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link
              to={`${basePath}/${rev.slug}`}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold uppercase tracking-wider rounded-lg h-9 flex items-center justify-center transition-colors"
            >
              Details
            </Link>
            <a
              href={rev.affiliateUrl || '#'}
              target="_blank"
              rel="nofollow sponsored noopener noreferrer"
              className="bg-[#C5A059] hover:bg-[#b08d4a] text-white text-[11px] font-bold uppercase tracking-wider rounded-lg h-9 flex items-center justify-center gap-1 transition-colors"
            >
              Buy Now <ExternalLink size={12} />
            </a>
          </div>
        </div>
        
      </div>
    </motion.div>
  );
}
