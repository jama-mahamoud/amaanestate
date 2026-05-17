import React from 'react';
import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardEmptyStateProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  icon: React.ReactNode;
}

export default function DashboardEmptyState({ 
  title, 
  description, 
  actionLabel, 
  onAction,
  icon
}: DashboardEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-32 px-8 text-center bg-white/[0.01] rounded-[3.5rem] border border-dashed border-white/10">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-24 h-24 rounded-[2rem] bg-white/5 flex items-center justify-center text-luxury-gold/20 mb-8 border border-white/5 shadow-inner"
      >
        {icon}
      </motion.div>
      <h3 className="text-3xl font-display font-bold text-white mb-4 tracking-tight">{title}</h3>
      <p className="text-white/20 max-w-sm mb-12 text-sm font-medium leading-relaxed uppercase tracking-[0.05em]">{description}</p>
      <Button 
        onClick={onAction}
        className="bg-luxury-gold text-luxury-black hover:bg-white h-16 px-10 rounded-[2rem] font-bold shadow-2xl shadow-luxury-gold/10 transition-all duration-500 hover:-translate-y-1"
      >
        <Plus size={20} className="mr-3" /> {actionLabel}
      </Button>
    </div>
  );
}
