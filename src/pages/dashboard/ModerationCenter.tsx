import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  LayoutList, 
  Users, 
  FileText, 
  MessageSquare,
  RefreshCw,
  Loader2,
  Lock,
  Clock,
  Bell,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  UserCheck,
  Eye,
  Trash,
  SlidersHorizontal,
  FolderSync,
  HelpCircle,
  Hash
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { moderationService, ModerationStats as IStats } from '@/services/moderationService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

import ModerationStats from '@/components/dashboard/moderation/ModerationStats';
import ListingModeratedList from '@/components/dashboard/moderation/ListingModeratedList';
import ProfessionalModeratedList from '@/components/dashboard/moderation/ProfessionalModeratedList';
import ArticleModeratedList from '@/components/dashboard/moderation/ArticleModeratedList';
import InquiryModeratedList from '@/components/dashboard/moderation/InquiryModeratedList';
import BrokerModeratedList from '@/components/dashboard/moderation/BrokerModeratedList';

type TabType = 'listings' | 'professionals' | 'brokers' | 'articles' | 'inquiries';

export default function ModerationCenter() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('listings');
  
  // Real-time statistical counts
  const [stats, setStats] = useState<IStats>({
    pendingListings: 0,
    pendingProfessionals: 0,
    totalVerifiedProfessionals: 0,
    totalListings: 0,
    totalArticles: 0,
    totalInquiries: 0,
    totalUsers: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);
  
  // Real-time alerts system notifications list
  const [notifications, setNotifications] = useState<any[]>([]);
  
  // Regulatory audit entries timeline log list
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  useEffect(() => {
    let active = true;
    
    // Initial statistics fetching
    if (active) {
      loadStats();
      fetchAuditLogs();
    }

    // Subscribe to real-time metrics
    const unsubscribeStats = moderationService.subscribeToStats((newStats) => {
      if (active) {
        setStats(newStats);
        setLoadingStats(false);
      }
    });

    // Subscribe to live administration notifications alerts
    const unsubscribeNotif = moderationService.subscribeToNotifications((list) => {
      if (active) {
        // Filter out read notifications
        setNotifications(list.filter(n => !n.read));
      }
    });

    return () => {
      active = false;
      unsubscribeStats();
      unsubscribeNotif();
    };
  }, []);

  const loadStats = async () => {
    setLoadingStats(true);
    const data = await moderationService.getModerationStats();
    setStats(data);
    setLoadingStats(false);
  };

  const fetchAuditLogs = async () => {
    setLoadingAudit(true);
    const logs = await moderationService.getAuditLogs();
    setAuditLogs(logs);
    setLoadingAudit(false);
  };

  const handleDismissNotification = async (notifId: string) => {
    const success = await moderationService.dismissNotification(notifId);
    if (success) {
      setNotifications(prev => prev.filter(n => n.id !== notifId));
      toast.success('Governance notification dismissed.');
    }
  };

  const handleManualSync = async () => {
    toast.promise(
      Promise.all([loadStats(), fetchAuditLogs()]),
      {
        loading: 'Synchronizing system catalog schemas...',
        success: 'System synchronized successfully.',
        error: 'Failed to synchronize indicators.'
      }
    );
  };

  const isAdmin = profile?.role === 'admin' || (profile?.role as string) === 'superadmin' || profile?.email?.endsWith('@amaanestate.com');

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="w-24 h-24 rounded-[2rem] bg-rose-500/10 flex items-center justify-center text-rose-500 mb-8 border border-rose-500/20">
          <Lock size={48} />
        </div>
        <h2 className="text-4xl font-display font-medium mb-4 tracking-tight text-white">Access Unauthorized</h2>
        <p className="text-white/45 text-sm max-w-sm mx-auto leading-relaxed">
          The requested gateway has restricted access rules. Please authenticate with an authorized governance administrator login.
        </p>
      </div>
    );
  }

  const tabs = [
    { id: 'listings', label: 'Market Properties', icon: <LayoutList size={16} />, count: stats.pendingListings },
    { id: 'professionals', label: 'Agent Vetting', icon: <Users size={16} />, count: stats.pendingProfessionals },
    { id: 'brokers', label: 'Corporate Agencies', icon: <ShieldCheck size={16} />, count: 0 },
    { id: 'articles', label: 'Intelligence Feed', icon: <FileText size={16} />, count: 0 },
    { id: 'inquiries', label: 'Client Inquiries', icon: <MessageSquare size={16} />, count: stats.totalInquiries },
  ];

  return (
    <div className="space-y-12">
      {/* Top corporate title block */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-white/5 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse" />
            <p className="text-white/40 text-[10px] uppercase font-bold tracking-[0.35em]">AmaanEstate Marketplace Operations Center</p>
          </div>
          <h1 className="text-4xl lg:text-5xl font-display font-bold tracking-tight text-white">
            Moderation Dashboard <span className="text-white/20 text-3xl font-light">Administration</span>
          </h1>
        </div>
        
        <Button 
          onClick={handleManualSync} 
          variant="outline" 
          className="h-12 px-6 rounded-xl border-white/5 hover:bg-white/5 gap-2 text-xs uppercase font-extrabold tracking-wider"
        >
          <RefreshCw size={14} className={loadingStats ? 'animate-spin' : ''} />
          <span>Synchronize Platform Metrics</span>
        </Button>
      </div>

      {/* Real-time Business Analytics Cards */}
      <ModerationStats stats={stats} loading={loadingStats} />

      {/* Main Grid Layout split (Primary Databases | Sticky logs side desk) */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">
        
        {/* Left Column: Tabular Content databases review queues */}
        <div className="xl:col-span-3 space-y-8">
          
          {/* Main Tab Picker Selection bar */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-white/5">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as TabType);
                    fetchAuditLogs(); // Refresh logs timeline whenever selecting another queue
                  }}
                  className={`flex items-center gap-3 px-6 py-4 rounded-xl transition-all duration-300 whitespace-nowrap border text-xs font-bold uppercase tracking-widest ${
                    isActive 
                    ? 'bg-[#C5A059] border-[#C5A059] text-black shadow-lg shadow-[#C5A059]/10' 
                    : 'bg-white/5 border-white/5 text-white/50 hover:border-white/10 hover:text-white'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black ${
                      isActive ? 'bg-black text-[#C5A059]' : 'bg-[#C5A059] text-black'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active List render frame */}
          <div className="min-h-[450px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'listings' && <ListingModeratedList />}
                {activeTab === 'professionals' && <ProfessionalModeratedList />}
                {activeTab === 'brokers' && <BrokerModeratedList />}
                {activeTab === 'articles' && <ArticleModeratedList />}
                {activeTab === 'inquiries' && <InquiryModeratedList />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: Live workspace alerts & Governance logs timelines */}
        <div className="space-y-8 xl:sticky xl:top-6 self-start">
          
          {/* Part A: Role details clearance gate */}
          <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/[0.01] border border-amber-500/15 p-6 rounded-[2rem] space-y-3.5">
            <h4 className="text-[#C5A059] text-[10px] uppercase font-black tracking-widest flex items-center gap-1.5">
              <ShieldCheck size={14} /> Active Credentials Clearance
            </h4>

            <div className="space-y-1.5">
              <p className="text-white text-sm font-bold truncate">{profile?.displayName || (profile as any)?.fullName || profile?.email || 'Platform Gatekeeper'}</p>
              <p className="text-white/40 text-[10px] font-mono">AUTHORIZED EMAIL: {profile?.email || 'N/A'}</p>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-white/5">
              <span className="text-[9px] uppercase font-black text-white/30 tracking-wider">Assigned Role Scope</span>
              <span className="px-2.5 py-0.5 bg-[#C5A059] text-black text-[9px] font-bold uppercase rounded tracking-wider">
                {(profile?.role as string) === 'superadmin' ? 'SUPER ADMIN' : 'MODERATOR'}
              </span>
            </div>
          </div>

          {/* Part B: Administrative Alert Notifications Center */}
          <div className="bg-white/[0.01] border border-white/5 p-6 rounded-[2rem] space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-white text-[10px] uppercase font-extrabold tracking-widest flex items-center gap-1.5">
                <Bell size={14} className="text-[#C5A059]" /> System Notices Core
              </h4>
              <span className="bg-[#C5A059]/10 text-[#C5A059] px-2 py-0.5 text-[8px] font-black rounded uppercase">
                {notifications.length} Unresolved
              </span>
            </div>

            <div className="space-y-3 max-h-[220px] overflow-y-auto no-scrollbar">
              {notifications.length === 0 ? (
                <div className="text-center py-6 text-white/20 text-[10px] font-bold uppercase tracking-wider">
                  No alerts outstanding.
                </div>
              ) : (
                notifications.map((notif) => (
                  <div key={notif.id} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1 group relative">
                    <button
                      onClick={() => handleDismissNotification(notif.id)}
                      className="absolute top-2 right-2 p-1 rounded bg-white/5 text-white/30 hover:text-white opacity-0 group-hover:opacity-100 transition-all text-[8px] font-black uppercase tracking-wider"
                      title="Clear Notice alert"
                    >
                      Clear
                    </button>
                    <p className="text-white text-xs font-semibold pr-6">{notif.title}</p>
                    <p className="text-white/40 text-[10px] leading-relaxed line-clamp-2">{notif.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Part C: Live Timeline register of governance deeds */}
          <div className="bg-white/[0.01] border border-white/5 p-6 rounded-[2rem] space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-white text-[10px] uppercase font-extrabold tracking-widest flex items-center gap-1.5">
                <Clock size={14} className="text-[#C5A059]" /> Moderation Activity Logs
              </h4>
              <button 
                onClick={fetchAuditLogs}
                disabled={loadingAudit}
                className="text-white/30 hover:text-white transition-colors"
              >
                <RefreshCw size={12} className={loadingAudit ? 'animate-spin' : ''} />
              </button>
            </div>

            <div className="space-y-4 max-h-[350px] overflow-y-auto no-scrollbar pl-2.5">
              {auditLogs.length === 0 ? (
                <div className="text-center py-10 text-white/20 text-[10px] font-bold uppercase tracking-wider">
                  No activity logs available.
                </div>
              ) : (
                auditLogs.map((log, index) => (
                  <div key={log.id || index} className="relative pl-6 pb-2 border-l border-white/5 last:border-0 last:pb-0">
                    {/* Timestamp Dot timeline decoration */}
                    <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-[#C5A059] shadow-md shadow-[#C5A059]/20" />
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-[9px] font-black uppercase tracking-wider text-[#C5A059]">
                          {log.action?.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[8px] font-mono text-white/30">
                          {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                        </span>
                      </div>
                      
                      <p className="text-white/80 text-[11px] font-medium leading-relaxed pr-2">
                        {log.details}
                      </p>
                      
                      <span className="text-[8px] font-mono block text-white/20 truncate">
                        BY: {log.adminUser}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
