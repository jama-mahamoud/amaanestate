import React from 'react';
import { motion } from 'motion/react';
import { 
  ClipboardCheck, 
  UserCheck, 
  LayoutList, 
  FileText, 
  MessageSquare,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { ModerationStats as IStats } from '@/services/moderationService';

interface ModerationStatsProps {
  stats: IStats;
  loading: boolean;
}

export default function ModerationStats({ stats, loading }: ModerationStatsProps) {
  const cards = [
    { 
      label: 'Pending Approval', 
      value: stats.pendingListings, 
      icon: <ClipboardCheck size={24} />, 
      color: 'text-luxury-gold',
      bg: 'bg-luxury-gold/10'
    },
    { 
      label: 'Pending Pros', 
      value: stats.pendingProfessionals, 
      icon: <AlertCircle size={24} />, 
      color: 'text-red-500',
      bg: 'bg-red-500/10'
    },
    { 
      label: 'Verified Pros', 
      value: stats.totalVerifiedProfessionals, 
      icon: <UserCheck size={24} />, 
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    { 
      label: 'Total Listings', 
      value: stats.totalListings, 
      icon: <LayoutList size={24} />, 
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    },
    { 
      label: 'Total Articles', 
      value: stats.totalArticles, 
      icon: <FileText size={24} />, 
      color: 'text-green-500',
      bg: 'bg-green-500/10'
    },
    { 
      label: 'New Inquiries', 
      value: stats.totalInquiries, 
      icon: <MessageSquare size={24} />, 
      color: 'text-orange-500',
      bg: 'bg-orange-500/10'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          className="glass-card hover:bg-white/[0.03] transition-all p-6 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center relative overflow-hidden group"
        >
          <div className={`w-12 h-12 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500`}>
            {card.icon}
          </div>
          {loading ? (
            <div className="h-8 w-12 bg-white/5 animate-pulse rounded-lg mb-1" />
          ) : (
            <p className="text-3xl font-display font-bold tracking-tighter mb-1">{card.value}</p>
          )}
          <p className="text-[8px] uppercase tracking-[0.2em] font-black text-white/20">{card.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
