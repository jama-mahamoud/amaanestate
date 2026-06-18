import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';
import { EditorialReview } from '@/services/reviewService';
import { getCategoryLabel } from '@/data/categories';

interface NetworkProductCardProps {
  rev: EditorialReview;
}

export default function NetworkProductCard({ rev }: NetworkProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="rounded-2xl bg-neutral-900/60 border border-white/5 overflow-hidden flex flex-col h-full hover:border-[#C5A059]/30 hover:shadow-[0_20px_50px_rgba(197,160,89,0.06)] transition-all duration-350 group"
    >
      {/* CLICKABLE IMAGE PREVIEW WITH AMAZON-STYLE SMOOTH HOVER ZOOM */}
      <a 
        href={rev.affiliateUrl || '#'} 
        target="_blank" 
        rel="nofollow sponsored noopener noreferrer"
        className="aspect-[16/9] overflow-hidden border-b border-white/5 relative block cursor-pointer"
        title={`Visit ${rev.brandName}`}
      >
        <img 
          src={rev.featuredImage} 
          alt={rev.brandName} 
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transform scale-100 group-hover:scale-108 transition-transform duration-700 ease-out"
        />
        {/* Subtle hover gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3 bg-neutral-950/80 border border-white/10 px-2.5 py-0.5 rounded-full text-[9px] font-mono tracking-wider uppercase text-neutral-400 backdrop-blur-sm z-10">
          {getCategoryLabel(rev.category)}
        </div>
      </a>

      {/* DETAILS CARD BODY */}
      <div className="p-6 flex flex-col flex-grow space-y-4 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center text-xs font-bold text-[#C5A059]">
              {rev.brandLogoLetter || rev.brandName.charAt(0)}
            </div>
            <h3 className="font-bold text-white text-xs tracking-tight">{rev.brandName}</h3>
          </div>
          
          <div className="flex items-center gap-1.5 text-[#C5A059] font-mono font-bold text-[11px] bg-[#C5A059]/5 border border-[#C5A059]/15 px-2 py-0.5 rounded-lg">
            <Star size={11} className="fill-[#C5A059]" />
            <span>{rev.rating}</span>
          </div>
        </div>

        <div className="space-y-1">
          <h4 className="text-sm font-serif font-semibold text-white tracking-tight group-hover:text-[#C5A059] transition-colors leading-snug line-clamp-1">
            <a 
              href={rev.affiliateUrl || '#'} 
              target="_blank" 
              rel="nofollow sponsored noopener noreferrer"
              className="hover:underline"
            >
              {rev.title}
            </a>
          </h4>
          <p className="text-neutral-400 text-xs font-light leading-relaxed line-clamp-2">
            {rev.excerpt}
          </p>
        </div>

        <div className="flex items-center justify-between text-[10px] text-emerald-400 font-mono pt-4 border-t border-white/5 mt-auto">
          <div className="flex items-center gap-1">
            <ShieldCheck size={11} className="text-emerald-500" />
            <span>Verified Review Curation</span>
          </div>
        </div>
        
        {/* REUSABLE ACTION DUO (READ DETAILS AND DIRECT AFFILIATE BUY NOW LINK) */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          <Link
            to={`/ecosystem/${rev.slug}`}
            className="bg-white/[0.02] hover:bg-white/[0.08] border border-white/5 hover:border-white/10 text-neutral-300 hover:text-white text-[11px] font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1 px-2 text-center cursor-pointer"
          >
            Read Review 
          </Link>
          <a
            href={rev.affiliateUrl || '#'}
            target="_blank"
            rel="nofollow sponsored noopener noreferrer"
            className="bg-[#C5A059] hover:bg-[#D4B26F] text-black text-[11px] font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1 px-2 text-center cursor-pointer shadow-lg shadow-[#C5A059]/10"
          >
            Buy Now <ExternalLink size={11} className="shrink-0" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
