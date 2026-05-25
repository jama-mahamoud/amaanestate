import React from 'react';
import { motion } from 'motion/react';
import { 
  ClipboardCheck, 
  UserCheck, 
  LayoutList, 
  FileText, 
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  MapPin,
  Eye,
  CheckCircle2,
  Users
} from 'lucide-react';
import { ModerationStats as IStats } from '@/services/moderationService';

interface ModerationStatsProps {
  stats: IStats;
  loading: boolean;
}

export default function ModerationStats({ stats, loading }: ModerationStatsProps) {
  // Operational verification counts
  const queues = [
    { 
      label: 'Listings Pending Review', 
      value: stats.pendingListings, 
      icon: <ClipboardCheck size={20} />, 
      color: 'text-amber-400',
      bg: 'bg-amber-400/10 border-amber-500/10'
    },
    { 
      label: 'Profiles Pending Review', 
      value: stats.pendingProfessionals, 
      icon: <AlertCircle size={20} />, 
      color: 'text-rose-500',
      bg: 'bg-rose-500/10 border-rose-500/10'
    },
    { 
      label: 'Open Inquiries & Leads', 
      value: stats.totalInquiries, 
      icon: <MessageSquare size={20} />, 
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10 border-emerald-500/10'
    }
  ];

  // Enterprise real-estate analytics & business intelligence
  const saasMetrics = [
    {
      label: 'Platform User Registry',
      value: `${stats.totalUsers.toLocaleString()} Users`,
      subtext: 'Total registered account holders',
      icon: <Users size={18} />,
      gradient: 'from-blue-500/10 to-indigo-500/10'
    },
    {
      label: 'Active Market Listings',
      value: `${(stats.totalListings - stats.pendingListings).toLocaleString()} Active`,
      subtext: 'Verified and publicly discoverable listings',
      icon: <LayoutList size={18} />,
      gradient: 'from-emerald-500/10 to-teal-500/10'
    },
    {
      label: 'Total Platform Content',
      value: `${stats.totalArticles.toLocaleString()} Items`,
      subtext: 'Articles published in market news',
      icon: <FileText size={18} />,
      gradient: 'from-amber-500/10 to-orange-500/10'
    },
    {
      label: 'Verified Professionals',
      value: stats.totalVerifiedProfessionals.toLocaleString(),
      subtext: 'Certified brokers and agency agents',
      icon: <CheckCircle2 size={18} />,
      gradient: 'from-purple-500/10 to-pink-500/10'
    },
    {
      label: 'Total Inquiries',
      value: stats.totalInquiries.toLocaleString(),
      subtext: 'Client inquiries & lead messages',
      icon: <MessageSquare size={18} />,
      gradient: 'from-cyan-500/10 to-sky-500/10'
    },
    {
      label: 'Verification Queue',
      value: `${stats.pendingListings + stats.pendingProfessionals} Pending`,
      subtext: 'Items requiring administrative review',
      icon: <ShieldCheck size={18} />,
      gradient: 'from-violet-500/10 to-fuchsia-500/10'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Queues & Action Required Group */}
      <div>
        <h3 className="text-white text-[10px] uppercase font-bold tracking-[0.4em] mb-4 flex items-center">
          Active Action Queues <div className="h-px flex-1 bg-white/5 ml-8"></div>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {queues.map((q, i) => (
            <motion.div
              key={q.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`p-6 bg-white/[0.01] border ${q.bg} rounded-[2rem] flex items-center justify-between group transition-all duration-300 hover:scale-[1.02]`}
            >
              <div className="space-y-2">
                <span className="text-white/40 text-xs font-semibold block">{q.label}</span>
                {loading ? (
                  <div className="h-9 w-16 bg-white/5 animate-pulse rounded-lg" />
                ) : (
                  <p className="text-4xl font-display font-black tracking-tight text-white">{q.value}</p>
                )}
              </div>
              <div className={`w-14 h-14 rounded-2xl bg-white/[0.02] border border-white/5 ${q.color} flex items-center justify-center group-hover:rotate-12 transition-transform duration-500`}>
                {q.icon}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Corporate Market Analytics Group */}
      <div>
        <h3 className="text-white text-[10px] uppercase font-bold tracking-[0.4em] mb-4 flex items-center">
          Marketplace Operations & Performance Metrics <div className="h-px flex-1 bg-white/5 ml-8"></div>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {saasMetrics.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: (i + 3) * 0.04 }}
              className={`p-6 bg-gradient-to-br ${card.gradient} border border-white/5 rounded-3xl relative overflow-hidden group hover:border-[#C5A059]/20 transition-all duration-500`}
            >
              {/* Abs decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.01] rounded-full blur-2xl group-hover:bg-[#C5A059]/5 transition-colors duration-500 pointer-events-none" />
              
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#C5A059]/80">{card.label}</span>
                  <p className="text-2xl font-display font-bold text-white tracking-tight">{card.value}</p>
                  <p className="text-white/40 text-[11px] font-medium leading-relaxed">{card.subtext}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#C5A059] group-hover:scale-110 transition-transform duration-300">
                  {card.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
