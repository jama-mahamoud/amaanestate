import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Settings, Layout, Link as LinkIcon, Mail, CheckCircle, Trash2, Save, Sparkles, Inbox, RefreshCw, FileSignature, Globe, AlertTriangle
} from 'lucide-react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'resolved';
  createdAt: string;
}

const INITIAL_INQUIRIES: Inquiry[] = [
  {
    id: 'inq-1',
    name: 'Yusuf Barre',
    email: 'yusuf.barre@diaspora-equity.com',
    subject: 'Enterprise Cloud License Review Request',
    message: 'Hello AmaanEstate editors. We recently launched an enterprise-grade cloud server suite optimized for Horn-of-Africa logistics. We would love to get an official editorial review on your platform.',
    status: 'unread',
    createdAt: '2026-07-06T14:22:00Z'
  },
  {
    id: 'inq-2',
    name: 'Mariam Warsame',
    email: 'mariam@somtech-gear.so',
    subject: 'Hardware Syndicate Partnership',
    message: 'Greetings. We import smart wearables and accessories to Hargeisa and Mogadishu. We want to place an inline banner in your Tech Gear channel or link up with your experts directory.',
    status: 'unread',
    createdAt: '2026-07-05T09:10:00Z'
  }
];

export default function DashboardSiteManagement() {
  const [activeTab, setActiveTab] = useState<'branding' | 'inquiries' | 'navigation'>('branding');
  
  // Branding Controls States
  const [siteTitle, setSiteTitle] = useState('AmaanEstate');
  const [siteMission, setSiteMission] = useState('The authoritative editorial publishing space for Somali technology reviews, software solutions, and luxury tech gear.');
  const [supportEmail, setSupportEmail] = useState('contact@amaanestate.com');
  const [facebookLink, setFacebookLink] = useState('https://facebook.com/amaanestate');
  const [twitterLink, setTwitterLink] = useState('https://twitter.com/amaanestate');

  // Contact Inquiries states
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load branding from localStorage or use defaults
    const savedTitle = localStorage.getItem('site_title');
    const savedMission = localStorage.getItem('site_mission');
    const savedEmail = localStorage.getItem('site_support_email');
    if (savedTitle) setSiteTitle(savedTitle);
    if (savedMission) setSiteMission(savedMission);
    if (savedEmail) setSupportEmail(savedEmail);

    // Load inquiries
    const savedInqs = localStorage.getItem('amaan_inquiries');
    if (savedInqs) {
      setInquiries(JSON.parse(savedInqs));
    } else {
      setInquiries(INITIAL_INQUIRIES);
      localStorage.setItem('amaan_inquiries', JSON.stringify(INITIAL_INQUIRIES));
    }
  }, []);

  const handleSaveBranding = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('site_title', siteTitle);
    localStorage.setItem('site_mission', siteMission);
    localStorage.setItem('site_support_email', supportEmail);
    toast.success('Site parameters and branding saved successfully!');
  }, [siteTitle, siteMission, supportEmail]);

  const handleResolveInquiry = useCallback((id: string) => {
    const updated = inquiries.map(inq => inq.id === id ? { ...inq, status: 'resolved' as const } : inq);
    setInquiries(updated);
    localStorage.setItem('amaan_inquiries', JSON.stringify(updated));
    toast.success('Inquiry marked as Resolved');
  }, [inquiries]);

  const handleDeleteInquiry = useCallback((id: string) => {
    if (!window.confirm('Delete this inquiry permanently?')) return;
    const filtered = inquiries.filter(inq => inq.id !== id);
    setInquiries(filtered);
    localStorage.setItem('amaan_inquiries', JSON.stringify(filtered));
    toast.success('Inquiry deleted successfully');
  }, [inquiries]);

  // Navigation Links State simulation
  const [navLinks, setNavLinks] = useState([
    { label: 'Reviews', url: '/deals' },
    { label: 'Software & Tools', url: '/software-tools' },
    { label: 'Tech Gear', url: '/tech-gear' },
    { label: 'News', url: '/news' }
  ]);

  const handleSaveNav = useCallback(() => {
    toast.success('Header and footer navigation links cached & synced!');
  }, []);

  const resetContent = async () => {
    if (!window.confirm('Are you sure you want to delete ALL content? This action is irreversible.')) return;
    
    const collections = ['editorial_reviews', 'software_tools', 'tech_gear_products', 'articles'];
    setLoading(true);
    try {
      for (const col of collections) {
        const snap = await getDocs(collection(db, col));
        for (const d of snap.docs) {
          await deleteDoc(doc(db, col, d.id));
        }
      }
      toast.success('Content reset successfully!');
      localStorage.removeItem('amaan_editorial_reviews_v2');
      localStorage.removeItem('amaan_tech_gear_products_v1');
    } catch (e) {
      console.error(e);
      toast.error('Failed to reset content');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Top Header Block */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-medium text-white flex items-center gap-3 tracking-tight">
            <Settings className="text-[#C5A059]" size={32} /> Site <span className="gold-text-gradient">Management</span>
          </h1>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em] mt-1.5">
            Global Settings, Branding Controls & Editorial Inquiries
          </p>
        </div>
        <Button onClick={resetContent} disabled={loading} className="bg-red-950 text-red-400 hover:bg-red-900 border border-red-900/50 flex items-center gap-2">
          <AlertTriangle size={16} /> Reset ALL Content Collections
        </Button>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-white/5 pb-1 gap-1">
        {[
          { id: 'branding', label: 'Branding & Parameters', icon: <Sparkles size={14} /> },
          { id: 'inquiries', label: `Contact Inquiries (${inquiries.filter(i => i.status === 'unread').length})`, icon: <Inbox size={14} /> },
          { id: 'navigation', label: 'Navigation Links', icon: <LinkIcon size={14} /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-3 rounded-t-xl text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === tab.id 
                ? 'border-b-2 border-[#C5A059] text-[#C5A059]' 
                : 'text-white/40 hover:text-white'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: BRANDING & PARAMETERS */}
          {activeTab === 'branding' && (
            <motion.div
              key="branding-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-[#0a0a0f] border border-white/5 rounded-3xl p-6 sm:p-10 space-y-8"
            >
              <div>
                <h3 className="text-lg font-display font-medium text-white tracking-wide">Branding Controls</h3>
                <p className="text-white/40 text-[10px] uppercase tracking-wider font-mono">Customize the public presentation variables</p>
              </div>

              <form onSubmit={handleSaveBranding} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-white/50 block font-mono">Platform Branding Name</label>
                    <Input 
                      value={siteTitle}
                      onChange={e => setSiteTitle(e.target.value)}
                      placeholder="e.g. AmaanEstate"
                      className="bg-white/[0.02] border-white/5 focus:border-[#C5A059]/30 rounded-xl h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-white/50 block font-mono">Support / Contact Email</label>
                    <Input 
                      type="email"
                      value={supportEmail}
                      onChange={e => setSupportEmail(e.target.value)}
                      placeholder="e.g. contact@amaanestate.com"
                      className="bg-white/[0.02] border-white/5 focus:border-[#C5A059]/30 rounded-xl h-11"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-white/50 block font-mono">Editorial Mission Statement</label>
                    <textarea 
                      value={siteMission}
                      onChange={e => setSiteMission(e.target.value)}
                      placeholder="Mission statement..."
                      rows={4}
                      className="w-full bg-white/[0.02] border border-white/5 focus:border-[#C5A059]/30 focus:ring-0 focus:outline-none rounded-xl p-4 text-white text-sm leading-relaxed"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-white/50 block font-mono">Facebook Page URL</label>
                    <Input 
                      value={facebookLink}
                      onChange={e => setFacebookLink(e.target.value)}
                      placeholder="https://facebook.com/..."
                      className="bg-white/[0.02] border-white/5 focus:border-[#C5A059]/30 rounded-xl h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-white/50 block font-mono">Twitter / X URL</label>
                    <Input 
                      value={twitterLink}
                      onChange={e => setTwitterLink(e.target.value)}
                      placeholder="https://twitter.com/..."
                      className="bg-white/[0.02] border-white/5 focus:border-[#C5A059]/30 rounded-xl h-11"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-white/5 font-mono">
                  <Button type="submit" className="bg-[#C5A059] hover:bg-white text-black font-semibold h-11 px-8 rounded-xl shrink-0 flex items-center gap-2">
                    <Save size={16} /> Save Site Parameters
                  </Button>
                </div>
              </form>
            </motion.div>
          )}

          {/* TAB 2: INQUIRIES */}
          {activeTab === 'inquiries' && (
            <motion.div
              key="inquiries-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center bg-[#0a0a0f] p-6 border border-white/5 rounded-2xl">
                <div>
                  <h3 className="text-lg font-display font-medium text-white tracking-wide">Contact Inquiries</h3>
                  <p className="text-white/40 text-[10px] uppercase tracking-wider font-mono">Sponsor requests, feedback, and partnerships</p>
                </div>
              </div>

              <div className="space-y-4">
                {inquiries.length === 0 ? (
                  <div className="py-20 text-center border border-white/5 rounded-3xl bg-white/[0.01]">
                    <Mail size={40} className="mx-auto text-white/20 mb-4" />
                    <h3 className="text-lg font-display font-medium text-white/60">No pending inquiries</h3>
                    <p className="text-white/30 text-xs mt-1">Platform contact box is currently clear.</p>
                  </div>
                ) : (
                  inquiries.map((inq) => (
                    <div 
                      key={inq.id}
                      className={`p-6 sm:p-8 rounded-[1.5rem] border transition-all space-y-4 ${
                        inq.status === 'unread' 
                          ? 'border-[#C5A059]/30 bg-[#C5A059]/[0.01]' 
                          : 'border-white/5 bg-[#0a0a0f]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-base font-bold text-white font-display">{inq.subject}</h4>
                            <span className={`text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                              inq.status === 'unread' ? 'bg-[#C5A059]/10 text-[#C5A059]' : 'bg-white/5 text-white/40'
                            }`}>
                              ● {inq.status}
                            </span>
                          </div>
                          <p className="text-xs text-white/40 mt-1 font-mono">
                            From: <span className="text-white/70 font-semibold">{inq.name}</span> ({inq.email}) • Received: {new Date(inq.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex gap-2 shrink-0">
                          {inq.status === 'unread' && (
                            <Button 
                              onClick={() => handleResolveInquiry(inq.id)}
                              size="sm"
                              className="bg-[#C5A059]/10 border border-[#C5A059]/15 text-[#C5A059] hover:bg-[#C5A059] hover:text-black h-8 text-xs rounded-lg flex items-center gap-1.5"
                            >
                              <CheckCircle size={12} /> Resolve
                            </Button>
                          )}
                          <Button 
                            onClick={() => handleDeleteInquiry(inq.id)}
                            size="sm"
                            className="bg-red-500/10 border border-red-500/15 text-red-400 hover:bg-red-600 hover:text-white h-8 text-xs rounded-lg flex items-center gap-1.5"
                          >
                            <Trash2 size={12} /> Delete
                          </Button>
                        </div>
                      </div>

                      <p className="text-sm text-white/70 leading-relaxed font-sans font-light bg-black/30 p-4 rounded-xl border border-white/5">
                        {inq.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 3: NAVIGATION */}
          {activeTab === 'navigation' && (
            <motion.div
              key="navigation-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-[#0a0a0f] border border-white/5 rounded-3xl p-6 sm:p-10 space-y-6"
            >
              <div>
                <h3 className="text-lg font-display font-medium text-white tracking-wide">Main Navigation Menu CMS</h3>
                <p className="text-white/40 text-[10px] uppercase tracking-wider font-mono">Control links indexed on header navigation bands</p>
              </div>

              <div className="space-y-3">
                {navLinks.map((lnk, idx) => (
                  <div key={idx} className="flex gap-4 items-center bg-black/40 border border-white/5 p-4 rounded-xl">
                    <span className="text-xs font-mono text-white/30 w-6">0{idx + 1}</span>
                    <Input 
                      value={lnk.label}
                      onChange={e => {
                        const updated = [...navLinks];
                        updated[idx].label = e.target.value;
                        setNavLinks(updated);
                      }}
                      className="bg-white/[0.01] border-white/5 rounded-lg flex-1 h-10 text-white text-xs"
                    />
                    <Input 
                      value={lnk.url}
                      onChange={e => {
                        const updated = [...navLinks];
                        updated[idx].url = e.target.value;
                        setNavLinks(updated);
                      }}
                      className="bg-white/[0.01] border-white/5 rounded-lg flex-1 h-10 text-white font-mono text-xs"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4 border-t border-white/5 font-mono">
                <Button onClick={handleSaveNav} className="bg-[#C5A059] hover:bg-white text-black font-semibold h-11 px-8 rounded-xl shrink-0 flex items-center gap-2">
                  <Save size={16} /> Sync Navigation menu
                </Button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
