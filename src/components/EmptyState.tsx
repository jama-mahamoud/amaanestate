import React from 'react';
import { motion } from 'motion/react';
import { Search, PackageOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export default function EmptyState({ 
  title, 
  description, 
  actionLabel, 
  onAction,
  icon = <PackageOpen size={48} />
}: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 md:p-12 glass-card rounded-[2.5rem] md:rounded-[3.5rem] border-white/5"
    >
      <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/5 flex items-center justify-center mb-8 text-luxury-gold/50">
        {icon}
      </div>
      <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-4 tracking-tight">
        {title}
      </h3>
      <p className="text-white/40 max-w-sm mb-10 leading-relaxed font-light">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button 
          onClick={onAction}
          className="bg-luxury-gold text-luxury-black hover:bg-white transition-all h-12 md:h-14 px-8 md:px-10 rounded-xl md:rounded-2xl font-bold uppercase tracking-widest text-[10px]"
        >
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}
