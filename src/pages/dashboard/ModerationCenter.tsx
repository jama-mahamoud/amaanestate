import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  LayoutList, 
  Users, 
  FileText, 
  MessageSquare,
  Search,
  Filter,
  RefreshCcw,
  Loader2,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { moderationService, ModerationStats as IStats } from '@/services/moderationService';
import ModerationStats from '@/components/dashboard/moderation/ModerationStats';
import ListingModeratedList from '@/components/dashboard/moderation/ListingModeratedList';
import ProfessionalModeratedList from '@/components/dashboard/moderation/ProfessionalModeratedList';
import ArticleModeratedList from '@/components/dashboard/moderation/ArticleModeratedList';
import InquiryModeratedList from '@/components/dashboard/moderation/InquiryModeratedList';
import { useAuth } from '@/contexts/AuthContext';

type TabType = 'listings' | 'professionals' | 'articles' | 'inquiries';

export default function ModerationCenter() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('listings');
  const [stats, setStats] = useState<IStats>({
    pendingListings: 0,
    pendingProfessionals: 0,
    totalVerifiedProfessionals: 0,
    totalListings: 0,
    totalArticles: 0,
    totalInquiries: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    loadStats();
  }, [activeTab]);

  const loadStats = async () => {
    setLoadingStats(true);
    const data = await moderationService.getModerationStats();
    setStats(data);
    setLoadingStats(false);
  };

  const isAdmin = profile?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="w-24 h-24 rounded-[2rem] bg-red-500/10 flex items-center justify-center text-red-500 mb-8 border border-red-500/20">
          <Lock size={48} />
        </div>
        <h2 className="text-4xl font-display font-bold mb-4 tracking-tight">Access Restricted</h2>
        <p className="text-white/40 text-lg max-w-md mx-auto leading-relaxed">
          The Moderation Protocol requires Level 1 Administrative Clearance. Your current profile does not possess the necessary authorization tokens.
        </p>
      </div>
    );
  }

  const tabs = [
    { id: 'listings', label: 'Listing Assets', icon: <LayoutList size={18} />, count: stats.pendingListings },
    { id: 'professionals', label: 'Pro Vetting', icon: <Users size={18} />, count: stats.pendingProfessionals },
    { id: 'articles', label: 'News Intelligence', icon: <FileText size={18} />, count: 0 },
    { id: 'inquiries', label: 'Comm Inbound', icon: <MessageSquare size={18} />, count: 0 },
  ];

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
           <div className="flex items-center gap-4 mb-3">
              <div className="p-2 rounded-lg bg-luxury-gold text-black">
                 <ShieldCheck size={20} />
              </div>
              <p className="text-white/20 text-[10px] uppercase font-black tracking-[0.4em]">Integrated Moderation Infrastructure</p>
           </div>
           <h1 className="text-5xl font-display font-bold tracking-tighter">Authority <span className="text-white/20 text-3xl font-light">Moderation Center</span></h1>
        </div>
        <Button 
          onClick={loadStats} 
          variant="outline" 
          className="h-14 px-8 rounded-2xl border-white/5 hover:bg-white/5 gap-3"
        >
          <RefreshCcw size={16} className={loadingStats ? 'animate-spin' : ''} />
          <span className="text-[10px] uppercase font-black tracking-widest">Resync Protocol</span>
        </Button>
      </div>

      {/* Analytics */}
      <ModerationStats stats={stats} loading={loadingStats} />

      {/* Navigation Tabs */}
      <div className="space-y-8">
         <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {tabs.map((tab) => (
               <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-4 px-8 py-5 rounded-[2rem] transition-all duration-500 whitespace-nowrap border relative group ${
                    activeTab === tab.id 
                    ? 'bg-luxury-gold border-luxury-gold text-black shadow-2xl shadow-luxury-gold/20' 
                    : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20 hover:text-white'
                  }`}
               >
                  {tab.icon}
                  <span className="text-[11px] uppercase font-black tracking-[0.2em]">{tab.label}</span>
                  {tab.count > 0 && (
                     <span className={`ml-2 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black ${
                       activeTab === tab.id ? 'bg-black text-luxury-gold' : 'bg-luxury-gold text-black'
                     }`}>
                        {tab.count}
                     </span>
                  )}
               </button>
            ))}
         </div>

         {/* Active View */}
         <div className="min-h-[400px]">
           <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                 {activeTab === 'listings' && <ListingModeratedList />}
                 {activeTab === 'professionals' && <ProfessionalModeratedList />}
                 {activeTab === 'articles' && <ArticleModeratedList />}
                 {activeTab === 'inquiries' && <InquiryModeratedList />}
              </motion.div>
           </AnimatePresence>
         </div>
      </div>
    </div>
  );
}
