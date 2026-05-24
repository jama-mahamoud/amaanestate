import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, Car, Users, TrendingUp, ArrowUpRight, Clock, MapPin, Loader2, 
  Activity, Heart, Copy, Check, ShieldCheck, Sparkles, Bell, AlertCircle, Share2,
  FileSignature, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/userService';
import { Agreement, agreementService } from '@/services/agreementService';
import { useDashboard } from '@/contexts/DashboardContext';
import { useListings } from '@/hooks/useListings';
import { Property } from '@/types';

export default function DashboardHome() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { openListingModal } = useDashboard();
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'notifications' | 'compliance' | 'referrals' | 'favorites'>('notifications');
  const [pendingAgreements, setPendingAgreements] = useState<Agreement[]>([]);

  const isAdmin = profile?.role === 'admin';

  const [notifications, setNotifications] = useState([
    { id: '1', title: 'Buyer Inquiry Received', body: 'Abdirahman Yusuf requested a private video tour of Jigjiga Villa Ref #192.', time: '3 mins ago', type: 'inquiry', unread: true },
    { id: '2', title: 'Land Deed Validated', body: 'Legal title deed audit for plot Godey River Bank cleared regulatory check successfully.', time: '2 hours ago', type: 'compliance', unread: true },
    { id: '3', title: 'Professional Tier Approved', body: 'AmaanEstate Executive Professional classification successfully enabled.', time: '1 day ago', type: 'badge', unread: false },
    { id: '4', title: 'Referral Link Visited', body: 'A diaspora user in Minneapolis registered using your invite. Est commission locked.', time: '2 days ago', type: 'referral', unread: false }
  ]);

  const handleMarkAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  }, []);

  const { listings } = useListings({ limit: 4 });
  const mockSavedProperties = useMemo(() => {
    return (listings || []).slice(0, 2) as Property[];
  }, [listings]);

  const [stats, setStats] = useState({
    properties: 0,
    vehicles: 0,
    agents: 0,
    users: 0
  });

  useEffect(() => {
    let active = true;
    const loadStats = async () => {
      try {
        const data = await userService.getGlobalStats();
        if (active) setStats(data);
        
        if (isAdmin) {
          const allAgreements = await agreementService.getAllAgreements();
          if (active) setPendingAgreements(allAgreements.filter(a => a.status === 'Pending Approval'));
        }
      } catch (error) {
        console.error("Failed to load dashboard statistics:", error);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadStats();
    return () => { active = false; };
  }, [isAdmin]);

  const statCards = useMemo(() => [
    { label: 'Active Listings', value: stats.properties, icon: <Home size={18} />, change: '+8%' },
    { label: 'Vehicle Inventory', value: stats.vehicles, icon: <Car size={18} />, change: '+5%' },
    { label: 'Certified Agents', value: stats.agents, icon: <Users size={18} />, change: '+4' },
    { label: 'Market Users', value: stats.users, icon: <TrendingUp size={18} />, change: '+12%' },
  ], [stats]);

  const referralLink = useMemo(() => 
    `https://amaanestate.com/verify?ref=${user?.uid?.slice(0, 8) || 'amaan888'}`,
    [user?.uid]
  );

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [referralLink]);

  return (
    <div className="space-y-12">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-4xl md:text-6xl font-display font-medium mb-3 tracking-tight">
            Executive <span className="gold-text-gradient">Console</span>
            {user?.displayName && (
              <span className="block text-xl mt-1 text-white/50 font-light">Welcome back, {user.displayName}</span>
            )}
          </h1>
          <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.4em]">AmaanEstate Executive Dashboard</p>
        </div>
        <div className="flex gap-4">
           {isAdmin && pendingAgreements.length > 0 && (
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="glass-card px-8 py-4 rounded-2xl relative overflow-hidden flex items-center gap-6 border border-amber-500/20 bg-amber-500/[0.03] group cursor-pointer"
               onClick={() => navigate('/dashboard/agreements')}
             >
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <FileSignature size={20} />
                </div>
                <div>
                   <p className="text-[10px] uppercase tracking-[0.3em] text-amber-500/60 font-bold">Pending Approvals</p>
                   <p className="text-sm font-black tracking-tight text-white flex items-center gap-2">
                     {pendingAgreements.length} Agreements Awaiting Review
                     <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                   </p>
                </div>
             </motion.div>
           )}
           <div className="glass-card px-8 py-4 rounded-2xl relative overflow-hidden flex items-center gap-4 border border-white/5 bg-white/[0.01]">
              <div className="absolute top-0 right-0 w-16 h-16 bg-luxury-gold/5 blur-xl rounded-full" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Market Feed</p>
                <p className="text-sm font-bold tracking-tight text-white">MARKET STATUS: ACTIVE</p>
              </div>
           </div>
        </div>
      </div>

      {/* CORE HIGH-FIDELITY STATISTIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="glass-card p-8 rounded-[2rem] relative overflow-hidden group hover:border-[#C5A059]/35 hover:scale-[1.01] transition-all duration-500 bg-white/[0.01]">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#C5A059]/5 blur-2xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000" />
              
              <div className="flex justify-between items-start mb-8">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-luxury-gold group-hover:bg-[#C5A059] group-hover:text-black transition-all duration-500">
                  {stat.icon}
                </div>
                <div className="bg-luxury-gold/5 border border-luxury-gold/10 text-luxury-gold px-3 py-1 rounded-full text-[9px] font-bold tracking-widest flex items-center gap-1">
                  {stat.change} <ArrowUpRight size={10} />
                </div>
              </div>
              {loading ? (
                <div className="h-[40px] flex items-center mb-2">
                   <Loader2 className="w-6 h-6 text-[#C5A059] animate-spin" />
                </div>
              ) : (
                <p className="text-4xl font-display font-medium mb-1.5 tracking-tight tabular-nums text-white">{stat.value}</p>
              )}
              <p className="text-white/40 text-[9px] uppercase tracking-[0.3em] font-bold">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* INTELLIGENT UX PORTAL WITH TABBED SHEETS (Items 4, 5, 6) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Main Tab Container (Saved, Referral, Notifications, Legal Compliance) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Custom Luxury Navigation Row */}
          <div className="border border-white/5 bg-white/[0.01] p-1.5 rounded-2xl flex flex-wrap gap-1">
            {[
              { id: 'notifications', label: 'Updates', unreadCount: notifications.filter(n => n.unread).length },
              { id: 'compliance', label: 'Verification' },
              { id: 'referrals', label: 'Referrals' },
              { id: 'favorites', label: 'Favorites' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === tab.id 
                    ? 'bg-[#C5A059] text-black font-black shadow-lg shadow-[#C5A059]/10' 
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{tab.label}</span>
                {tab.unreadCount !== undefined && tab.unreadCount > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-normal ${activeTab === tab.id ? 'bg-black text-white' : 'bg-luxury-gold text-black'}`}>
                    {tab.unreadCount} NEW
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="glass-card p-8 md:p-10 rounded-[2.5rem] border border-white/10 relative min-h-[440px]">
            <AnimatePresence mode="wait">
              
              {/* TAB 1: REAL-TIME NOTIFICATION SYSTEM (Item 5) */}
              {activeTab === 'notifications' && (
                <motion.div
                  key="notifications-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-xl font-display font-bold text-white tracking-tight flex items-center gap-2">
                        <Bell size={18} className="text-[#C5A059]" />
                        Recent Updates
                      </h3>
                      <p className="text-white/40 text-[10px] uppercase tracking-wider font-bold">In-app property signals & audit triggers</p>
                    </div>
                    {notifications.some(n => n.unread) && (
                      <Button 
                        variant="ghost" 
                        onClick={handleMarkAllRead}
                        className="text-[10px] text-[#C5A059] hover:text-white uppercase tracking-widest font-extrabold cursor-pointer"
                      >
                        Clear All Unread
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {notifications.map((notif) => (
                      <div 
                        key={notif.id}
                        className={`p-5 rounded-xl border transition-all flex items-start gap-4 ${
                          notif.unread 
                            ? 'border-[#C5A059]/30 bg-[#C5A059]/[0.02]/30 relative' 
                            : 'border-white/5 bg-white/[0.005]'
                        }`}
                      >
                        {notif.unread && (
                          <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-luxury-gold animate-pulse" />
                        )}
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                          notif.type === 'inquiry' ? 'bg-[#C5A059]/15 text-luxury-gold' :
                          notif.type === 'compliance' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-white/50'
                        }`}>
                          <Sparkles size={16} />
                        </div>
                        <div className="space-y-1 overflow-hidden pr-6">
                          <h4 className="text-white font-bold text-sm">{notif.title}</h4>
                          <p className="text-white/60 text-xs leading-relaxed">{notif.body}</p>
                          <span className="text-[10px] text-white/30 block font-semibold">{notif.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* TAB 2: COMPLIANCE & TRUST SYSTEMS (Item 6) */}
              {activeTab === 'compliance' && (
                <motion.div
                  key="compliance-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <div>
                    <h3 className="text-xl font-display font-bold text-white tracking-tight flex items-center gap-2">
                      <ShieldCheck size={18} className="text-[#C5A059]" />
                      Property Verifications
                    </h3>
                    <p className="text-white/40 text-[10px] uppercase tracking-wider font-bold">Government-audited legal property queues</p>
                  </div>

                  <div className="space-y-4">
                    {[
                      { property: 'Jigjiga Villa, Elite Block #3', ID: 'AE-9481', status: 'Approved', badge: 'Verified by AmaanEstate', color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' },
                      { property: 'Godey Riverfront Plot #12', ID: 'AE-0044', status: 'Audited', badge: 'Legal Checks Cleared', color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' },
                      { property: 'Dire Dawa Business Quarter Layout', ID: 'AE-8812', status: 'Pending Deed Verification', badge: 'Awaiting Registry Match', color: 'border-luxury-gold/20 text-luxury-gold bg-luxury-gold/5' },
                    ].map((app, i) => (
                      <div key={i} className="p-6 rounded-2xl border border-white/5 bg-white/[0.005] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-3">
                            <h4 className="text-white font-bold text-sm font-display">{app.property}</h4>
                            <span className="text-[10px] font-mono font-medium text-white/30">{app.ID}</span>
                          </div>
                          <span className={`inline-block text-[9px] font-bold tracking-widest uppercase px-3 py-1 rounded-full ${app.color}`}>
                            ● {app.badge}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-right">
                          <span className="text-[11px] font-semibold text-white/50 bg-white/5 px-4 py-1.5 rounded-xl border border-white/5">{app.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-5 bg-white/[0.02] rounded-2xl border border-white/5 flex gap-4">
                    <AlertCircle size={18} className="text-luxury-gold shrink-0 mt-0.5" />
                    <p className="text-white/50 text-[11px] leading-relaxed">
                      Lien-free status is monitored in collaboration with Regional Cadastral Systems. Double allocation safety keys are auto-assigned to approved assets.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* TAB 3: DIAGPORA REFERRALS & EARNINGS OPPORTUNITIES */}
              {activeTab === 'referrals' && (
                <motion.div
                  key="referrals-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-white/5">
                    <div>
                      <h3 className="text-xl font-display font-bold text-white tracking-tight flex items-center gap-2">
                        <Share2 size={18} className="text-[#C5A059]" />
                        Diaspora Referral rewards
                      </h3>
                      <p className="text-white/40 text-[10px] uppercase tracking-wider font-bold">Earn commissions by referring investors & land acquisitions</p>
                    </div>
                    <div className="bg-[#C5A059]/10 border border-[#C5A059]/20 p-4 rounded-xl text-center md:text-right shrink-0">
                      <span className="text-[10px] uppercase text-white/30 block mb-0.5 font-bold">Referral Wallet Balance</span>
                      <p className="text-2xl font-display font-bold text-luxury-gold tabular-nums">$1,450.00 USD</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-2">Share Invites with Friends & Colleagues</label>
                      <div className="flex rounded-xl overflow-hidden border border-white/10 group bg-white/5 p-1 relative">
                        <input
                          type="text"
                          readOnly
                          value={referralLink}
                          className="w-full bg-transparent px-4 text-white text-xs select-all outline-none"
                        />
                        <Button 
                          onClick={handleCopyLink}
                          className="bg-[#C5A059] text-black hover:bg-white flex items-center gap-2 px-6 h-11 rounded-lg font-bold text-xs shrink-0 cursor-pointer"
                        >
                          {copied ? (
                            <>
                              <Check size={14} />
                              <span>COPIED</span>
                            </>
                          ) : (
                            <>
                              <Copy size={14} />
                              <span>COPY LINK</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                        <span className="text-[9px] uppercase font-bold text-white/30 block mb-1">Affiliate Registered</span>
                        <p className="text-2xl font-bold font-display text-white tabular-nums">12</p>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                        <span className="text-[9px] uppercase font-bold text-white/30 block mb-1">Purchases Initiated</span>
                        <p className="text-2xl font-bold font-display text-white tabular-nums">2</p>
                      </div>
                      <div className="p-4 rounded-xl bg-[#C5A059]/10 border border-[#C5A059]/30 text-center">
                        <span className="text-[9px] uppercase font-bold text-luxury-gold block mb-1">Your Payout Queue</span>
                        <p className="text-2xl font-bold font-display text-luxury-gold tabular-nums">$750 pending</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 4: SAVED LISTINGS & VEHICLES HISTORY */}
              {activeTab === 'favorites' && (
                <motion.div
                  key="saved-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-xl font-display font-bold text-white tracking-tight flex items-center gap-2">
                      <Heart size={18} className="text-[#C5A059] fill-[#C5A059]" />
                      Saved Regional Portfolio
                    </h3>
                    <p className="text-white/40 text-[10px] uppercase tracking-wider font-bold">Quick tracking card indices saved for ongoing queries</p>
                  </div>

                  {mockSavedProperties.length === 0 ? (
                    <div className="text-center py-10">
                      <Heart size={36} className="text-white/10 mx-auto mb-3" />
                      <p className="text-white/30 text-xs">No bookmarks recorded. Navigate our portfolio to save premium assets.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {mockSavedProperties.map((prop) => (
                        <div key={prop.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex gap-4 items-center justify-between group">
                          <div className="flex items-center gap-4 overflow-hidden">
                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 shrink-0">
                              <img src={prop.images?.[0] || 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=300'} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div className="truncate">
                              <h4 className="text-white font-bold text-xs truncate font-display">{prop.title}</h4>
                              <p className="text-[#C5A059] text-xs font-bold font-display mt-0.5">${prop.price?.toLocaleString()}</p>
                              <span className="text-[10px] text-white/30 font-semibold">{prop.city}</span>
                            </div>
                          </div>
                          <Button asChild size="sm" variant="ghost" className="text-xs hover:text-luxury-gold bg-white/5 group-hover:bg-[#C5A059] group-hover:text-black transition-all cursor-pointer rounded-lg shrink-0 h-10 px-4">
                            <Link to={`/properties/${prop.id}`}>Visit</Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>

        {/* SIDEBAR ANALYTICS AND ACCOUNT ACTIONS */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Quick Create CTA Block */}
          <div className="p-8 bg-[#C5A059] rounded-[2.5rem] text-black relative overflow-hidden group shadow-2xl">
             <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 blur-[50px] rounded-full translate-x-1/4 -translate-y-1/4" />
             <div className="relative z-10">
               <span className="text-[9px] uppercase font-black tracking-[0.3em] opacity-40">Listing Actions</span>
               <h3 className="text-3xl font-display font-medium mb-6 leading-none tracking-tight">Expand Your Digital Footprint</h3>
               <p className="text-black/60 text-xs font-medium mb-8 leading-relaxed italic">Get started and list your property.</p>
               <Button 
                 onClick={() => openListingModal('property')}
                 className="w-full bg-black text-white hover:bg-black/90 h-16 rounded-2xl font-bold text-sm border-0 shadow-lg cursor-pointer"
               >
                 Register New Asset
               </Button>
             </div>
          </div>

          {/* Regional Market Shares */}
          <div className="glass-card rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden bg-white/[0.01]">
              <div className="absolute inset-0 bg-white/[0.005]" />
              <h3 className="text-lg font-display font-medium mb-6 tracking-wide flex items-center gap-2">
                <Activity size={16} className="text-luxury-gold" />
                Regional Portfolios
              </h3>
              <div className="space-y-6 relative z-10">
                {[
                  { city: 'Jigjiga Province', share: '45%', color: 'bg-[#C5A059]' },
                  { city: 'Dire Dawa Region', share: '25%', color: 'bg-white/40' },
                  { city: 'Hargeisa Hub', share: '18%', color: 'bg-white/20' },
                  { city: 'Mogadishu Coastal', share: '12%', color: 'bg-white/10' },
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                     <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em]">
                       <span className="text-white/40">{item.city}</span>
                       <span className="text-white">{item.share}</span>
                     </div>
                     <div className="h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: item.share }}
                          transition={{ duration: 1.5, ease: "circOut" }}
                          className={`h-full ${item.color}`} 
                        />
                     </div>
                  </div>
                ))}
              </div>
          </div>
        </div>

      </div>
    </div>
  );
}
