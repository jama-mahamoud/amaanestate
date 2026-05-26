import React from 'react';
import { motion } from 'framer-motion';
import { Search, PackageOpen, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  variant?: 'glass' | 'dashed';
  showPlusIcon?: boolean;
}

export default function EmptyState({ 
  title, 
  description, 
  actionLabel, 
  onAction,
  icon = <PackageOpen size={48} />,
  variant = 'glass',
  showPlusIcon = false
}: EmptyStateProps) {
  const isGlass = variant === 'glass';
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex flex-col items-center justify-center text-center p-8 md:p-12 lg:py-32 rounded-[2.5rem] md:rounded-[3.5rem] ${
        isGlass 
          ? 'glass-card border-white/5' 
          : 'bg-white/[0.01] border border-dashed border-white/10'
      }`}
    >
      <div className={`w-20 h-20 md:w-24 md:h-24 rounded-[2rem] flex items-center justify-center mb-8 border border-white/5 ${
        isGlass ? 'bg-white/5 text-luxury-gold/50' : 'bg-white/5 text-luxury-gold/20 shadow-inner'
      }`}>
        {icon}
      </div>
      <h3 className={`text-2xl md:text-3xl font-display font-bold text-white mb-4 tracking-tight`}>
        {title}
      </h3>
      <p className={`max-w-sm mb-10 leading-relaxed ${
        isGlass ? 'text-white/40 font-light' : 'text-white/20 text-sm font-medium uppercase tracking-[0.05em]'
      }`}>
        {description}
      </p>
      {actionLabel && onAction && (
        <Button 
          onClick={onAction}
          className={`${
            isGlass 
              ? 'bg-luxury-gold text-luxury-black hover:bg-white transition-all h-12 md:h-14 px-8 md:px-10 rounded-xl md:rounded-2xl font-bold uppercase tracking-widest text-[10px]'
              : 'bg-luxury-gold text-luxury-black hover:bg-white h-16 px-10 rounded-[2rem] font-bold shadow-2xl shadow-luxury-gold/10 transition-all duration-500 hover:-translate-y-1'
          }`}
        >
          {showPlusIcon && <Search className="mr-3" size={18} />} {/* Default generic search, but Dashboard used Plus */}
          {showPlusIcon && isGlass === false && <Plus className="mr-3" size={18} />}
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}
