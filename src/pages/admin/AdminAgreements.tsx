import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '@/lib/firebase';
import { agreementService, Agreement } from '@/services/agreementService';
import { userService } from '@/services/userService';
import { generateAgreementPDF } from '@/lib/agreements';
import { 
  Check, 
  X, 
  Loader2, 
  Search, 
  FileText, 
  FileCheck, 
  XCircle, 
  Download,
  Calendar,
  User,
  Users,
  Briefcase,
  ExternalLink,
  ShieldCheck,
  AlertOctagon,
  Eye,
  Clock,
  ArrowRight,
  Stamp,
  MoreVertical,
  QrCode,
  FileSignature
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

type TabType = 'Pending Approval' | 'Approved' | 'Rejected' | 'revision_requested';

export default function AdminAgreements() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('Pending Approval');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [selectedAgreement, setSelectedAgreement] = useState<Agreement | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [revisionReason, setRevisionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Authentication & admin check
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const profile = await userService.getUserProfile(user.uid);
          if (profile && profile.role === 'admin') {
            setIsAdmin(true);
            fetchAgreements();
          } else {
            setIsAdmin(false);
            setLoading(false);
          }
        } catch (e) {
          console.error("Auth check failed", e);
          setIsAdmin(false);
          setLoading(false);
        }
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    });
    return unsub;
  }, []);

  const fetchAgreements = async () => {
    try {
      const allList = await agreementService.getAllAgreements();
      setAgreements(allList);
    } catch (err) {
      toast.error("Failed to fetch agreements ledger");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    console.log(`Starting approval for agreement ID: ${id}`);
    setIsProcessing(true);
    try {
      await agreementService.updateStatus(id, 'Approved');
      console.log(`Successfully updated status to Approved for: ${id}`);
      toast.success("Agreement officially certified and stamped");
      setIsReviewModalOpen(false);
      setSelectedAgreement(null);
      await fetchAgreements();
    } catch (err) {
      console.error(`Approval failed for ID: ${id}`, err);
      toast.error(`Certification protocol failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedAgreement) return;
    if (!rejectionReason.trim()) {
      toast.error("Rejection reason is required for the audit log");
      return;
    }
    setIsProcessing(true);
    try {
      await agreementService.updateStatus(selectedAgreement.agreementId, 'Rejected', rejectionReason);
      toast.success("Agreement rejected and reason logged");
      setIsRejectModalOpen(false);
      setIsReviewModalOpen(false);
      setSelectedAgreement(null);
      setRejectionReason('');
      await fetchAgreements();
    } catch (err) {
      toast.error("Failed to process rejection");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!selectedAgreement) return;
    if (!revisionReason.trim()) {
      toast.error("Revision reason is required to guide the user");
      return;
    }
    setIsProcessing(true);
    try {
      await agreementService.updateStatus(selectedAgreement.agreementId, 'revision_requested', revisionReason);
      toast.success("Revision requested from user");
      setIsRevisionModalOpen(false);
      setIsReviewModalOpen(false);
      setSelectedAgreement(null);
      setRevisionReason('');
      await fetchAgreements();
    } catch (err) {
      toast.error("Failed to process revision request");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadPDF = (agreement: Agreement) => {
    try {
      const doc = generateAgreementPDF(agreement);
      doc.save(`AmaanEstate_Deed_${agreement.certificateNumber || agreement.agreementId}.pdf`);
      toast.success("Document downloaded securely");
    } catch (e) {
      toast.error("PDF generation engine failed");
    }
  };

  const filteredItems = agreements.filter(item => {
    // Robust comparison against activeTab
    const itemStatus = (item.status || '').toLowerCase().trim();
    const tabStatus = activeTab.toLowerCase().trim();
    
    // Specifically handle "Pending Approval" vs "pending"
    const tabStatusMapping: Record<string, string> = {
      'pending approval': 'pending approval',
      'approved': 'approved',
      'rejected': 'rejected',
      'revision_requested': 'revision_requested'
    };

    const matchesTab = itemStatus === tabStatusMapping[tabStatus];
    
    const matchesSearch = searchTerm === '' || 
      item.agreementId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.agreementTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.parties.partyA.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.parties.partyB.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  const stats = {
    pending: agreements.filter(a => a.status === 'Pending Approval').length,
    approved: agreements.filter(a => a.status === 'Approved').length,
    rejected: agreements.filter(a => a.status === 'Rejected').length,
    revisions: agreements.filter(a => a.status === 'revision_requested').length,
    total: agreements.length
  };

  if (loading) {
    return (
      <div className="min-h-[600px] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-luxury-gold" size={40} />
        <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/40">Secure Ledger Loading...</p>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] text-center space-y-6">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
          <AlertOctagon size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-display font-bold">Access Restricted</h2>
          <p className="text-white/40 max-w-md mx-auto">This terminal is restricted to authorized AmaanEstate administrators. Unauthorized access attempts are logged.</p>
        </div>
        <Button onClick={() => navigate('/dashboard')} className="bg-white/5 hover:bg-white/10 text-white border border-white/10">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-display font-bold tracking-tighter">Agreements Ledger</h1>
          <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Central Approval & Verification Hub</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-luxury-gold transition-colors" size={18} />
            <Input 
              placeholder="Search by ID, Title, or Name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#0a0a0a] border-white/5 w-full lg:w-[400px] pl-12 h-14 rounded-2xl focus:border-luxury-gold/50 transition-all text-sm"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          { label: 'Pending Approval', value: stats.pending, icon: <Clock className="text-amber-500" />, color: 'from-amber-500/20' },
          { label: 'Approved Agreements', value: stats.approved, icon: <FileCheck className="text-emerald-500" />, color: 'from-emerald-500/20' },
          { label: 'Rejected Agreements', value: stats.rejected, icon: <XCircle className="text-red-500" />, color: 'from-red-500/20' },
          { label: 'Draft Agreements', value: stats.revisions, icon: <FileSignature className="text-blue-400" />, color: 'from-blue-400/20' },
          { label: 'Total Volume', value: stats.total, icon: <FileText className="text-blue-500" />, color: 'from-blue-500/20' },
        ].map((stat, idx) => (
          <div key={idx} className={`glass-card p-8 rounded-[2rem] border border-white/5 relative overflow-hidden group`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/40">{stat.label}</p>
                <p className="text-3xl font-display font-bold">{stat.value}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs & Table */}
      <div className="space-y-6">
        <div className="flex items-center gap-1 bg-[#0a0a0a] p-1.5 rounded-2xl border border-white/5 w-fit">
          {(['Pending Approval', 'Approved', 'Rejected', 'revision_requested'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all duration-300 ${
                activeTab === tab 
                  ? 'bg-luxury-gold text-luxury-black shadow-lg shadow-luxury-gold/20' 
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab === 'revision_requested' ? 'Drafts' : tab}
            </button>
          ))}
        </div>

        <div className="glass-card rounded-[2.5rem] border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-bold text-white/30">Ref Number</th>
                  <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-bold text-white/30">Agreement/Asset</th>
                  <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-bold text-white/30">Buyer/Party B</th>
                  <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-bold text-white/30">Seller/Party A</th>
                  <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-bold text-white/30">Status</th>
                  <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-bold text-white/30">Date</th>
                  <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-bold text-white/30 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence mode="popLayout">
                  {filteredItems.map((item) => (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={item.agreementId} 
                      className="group hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-8 py-6">
                        <span className="text-[11px] font-mono font-bold text-luxury-gold bg-luxury-gold/5 px-3 py-1.5 rounded-lg border border-luxury-gold/10">
                          {item.certificateNumber || item.agreementId.slice(0, 8).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-white">{item.agreementTitle}</p>
                          <p className="text-[10px] text-white/40 uppercase tracking-tighter">
                            {item.assetInfo.property?.propertyTitle || item.assetInfo.vehicle?.make || 'Custom Terms'}
                          </p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-white/40 border border-white/10 uppercase">
                            {item.parties.partyB.fullName.charAt(0)}
                          </div>
                          <span className="text-xs font-medium text-white/70">{item.parties.partyB.fullName}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-white/40 border border-white/10 uppercase">
                            {item.parties.partyA.fullName.charAt(0)}
                          </div>
                          <span className="text-xs font-medium text-white/70">{item.parties.partyA.fullName}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
                          item.status === 'Approved' ? 'text-emerald-500' : 
                          item.status === 'Rejected' ? 'text-red-500' : 
                          item.status === 'revision_requested' ? 'text-blue-400' : 'text-amber-500'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                            item.status === 'Approved' ? 'bg-emerald-500' : 
                            item.status === 'Rejected' ? 'bg-red-500' : 
                            item.status === 'revision_requested' ? 'bg-blue-400' : 'bg-amber-500'
                          }`} />
                          {item.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xs text-white/40 font-mono">
                          {new Date(item.submittedAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="w-10 h-10 rounded-xl hover:bg-white/10 transition-all text-white/60 hover:text-luxury-gold"
                            onClick={() => {
                              setSelectedAgreement(item);
                              setIsReviewModalOpen(true);
                            }}
                          >
                            <Eye size={18} />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="w-10 h-10 rounded-xl hover:bg-white/10 transition-all text-white/60 hover:text-white"
                            onClick={() => downloadPDF(item)}
                          >
                            <Download size={18} />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
            {filteredItems.length === 0 && (
              <div className="p-20 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center mx-auto text-white/20">
                  <FileText size={32} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white/60 uppercase tracking-widest">No Agreements Found</p>
                  <p className="text-xs text-white/20">Try adjusting your search criteria or tab filters.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {isReviewModalOpen && selectedAgreement && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none p-4 lg:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-luxury-black/95 backdrop-blur-xl pointer-events-auto"
              onClick={() => setIsReviewModalOpen(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-6xl h-full max-h-[95vh] bg-[#0c0c0c] border border-white/10 rounded-[3rem] shadow-2xl flex flex-col pointer-events-auto overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-10 border-b border-white/5 flex items-center justify-between shrink-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono font-bold text-luxury-gold px-3 py-1 bg-luxury-gold/5 border border-luxury-gold/10 rounded-lg">
                      {selectedAgreement.agreementId}
                    </span>
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                      selectedAgreement.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500' : 
                      selectedAgreement.status === 'Rejected' ? 'bg-red-500/10 text-red-500' : 
                      selectedAgreement.status === 'revision_requested' ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {selectedAgreement.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h2 className="text-3xl font-display font-bold text-white">{selectedAgreement.agreementTitle}</h2>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 transition-all"
                  onClick={() => setIsReviewModalOpen(false)}
                >
                  <X size={24} />
                </Button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-10 space-y-12 pb-32">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  {/* Left Column: Parties */}
                  <div className="lg:col-span-1 space-y-10">
                    <section className="space-y-6">
                      <div className="flex items-center gap-4 text-luxury-gold">
                        <Users size={20} />
                        <h3 className="text-xs uppercase tracking-[0.3em] font-bold">Covenant Parties</h3>
                      </div>
                      
                      <div className="space-y-6">
                        {/* Party A */}
                        <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
                          <p className="text-[9px] uppercase tracking-widest font-bold text-white/30">Party A (Originator)</p>
                          <div className="space-y-2">
                            <p className="text-sm font-bold text-white">{selectedAgreement.parties.partyA.fullName}</p>
                            <p className="text-[11px] text-white/60">{selectedAgreement.parties.partyA.email}</p>
                            <p className="text-[11px] text-white/60">{selectedAgreement.parties.partyA.phone}</p>
                            <p className="text-[11px] text-white/60">{selectedAgreement.parties.partyA.address}</p>
                            <p className="text-[10px] font-mono text-luxury-gold pt-2 border-t border-white/5">National ID: {selectedAgreement.parties.partyA.nationalId}</p>
                          </div>
                        </div>

                        {/* Party B */}
                        <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
                          <p className="text-[9px] uppercase tracking-widest font-bold text-white/30">Party B (Consignee)</p>
                          <div className="space-y-2">
                            <p className="text-sm font-bold text-white">{selectedAgreement.parties.partyB.fullName}</p>
                            <p className="text-[11px] text-white/60">{selectedAgreement.parties.partyB.email}</p>
                            <p className="text-[11px] text-white/60">{selectedAgreement.parties.partyB.phone}</p>
                            <p className="text-[11px] text-white/60">{selectedAgreement.parties.partyB.address}</p>
                            <p className="text-[10px] font-mono text-luxury-gold pt-2 border-t border-white/5">National ID: {selectedAgreement.parties.partyB.nationalId}</p>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section className="space-y-6">
                      <div className="flex items-center gap-4 text-luxury-gold">
                        <Stamp size={20} />
                        <h3 className="text-xs uppercase tracking-[0.3em] font-bold">Signatures & Witnesses</h3>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center">
                          <p className="text-[8px] uppercase tracking-widest font-bold text-white/30 mb-4 text-left">Party A Signature</p>
                          {selectedAgreement.parties.partyA.signatureUrl ? (
                            <img src={selectedAgreement.parties.partyA.signatureUrl} className="max-h-12 mx-auto mix-blend-lighten opacity-80" alt="Party A" />
                          ) : (
                                <p className="text-[10px] font-serif italic text-blue-400">Electronic Affirmation</p>
                          )}
                        </div>
                        <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center">
                          <p className="text-[8px] uppercase tracking-widest font-bold text-white/30 mb-4 text-left">Party B Signature</p>
                          {selectedAgreement.parties.partyB.signatureUrl ? (
                            <img src={selectedAgreement.parties.partyB.signatureUrl} className="max-h-12 mx-auto mix-blend-lighten opacity-80" alt="Party B" />
                          ) : (
                            <p className="text-[10px] font-serif italic text-blue-400">Electronic Affirmation</p>
                          )}
                        </div>
                      </div>

                      {/* Witnesses */}
                      <div className="space-y-4">
                         {[1, 2, 3].map(w => {
                           const wName = selectedAgreement[`witness${w}FullName` as keyof Agreement];
                           const wSig = selectedAgreement[`witness${w}Signature` as keyof Agreement];
                           if (!wName) return null;
                           return (
                             <div key={w} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                <div className="space-y-1">
                                  <p className="text-[8px] uppercase tracking-widest font-bold text-white/30">Witness {w}</p>
                                  <p className="text-xs font-bold text-white/80">{wName as string}</p>
                                </div>
                                {wSig && <img src={wSig as string} className="max-h-8 mix-blend-lighten opacity-60" alt={`W${w}`} />}
                             </div>
                           );
                         })}
                      </div>
                    </section>
                  </div>

                  {/* Right Column: Asset, Terms, Meta */}
                  <div className="lg:col-span-2 space-y-12">
                    {/* Asset Specs */}
                    <section className="space-y-6">
                      <div className="flex items-center gap-4 text-luxury-gold">
                        <Briefcase size={20} />
                        <h3 className="text-xs uppercase tracking-[0.3em] font-bold">Subject Asset Specifications</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                        <div className="glass-card p-8 rounded-3xl border border-white/5 space-y-6">
                          <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-widest font-bold text-white/30">Valuation Details</p>
                            <p className="text-3xl font-display font-bold text-white">
                              {selectedAgreement.currency} {(selectedAgreement.assetInfo.property?.price || selectedAgreement.assetInfo.vehicle?.price || 0).toLocaleString()}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[9px] uppercase tracking-widest font-bold text-white/20 mb-1">Contract Type</p>
                                <p className="text-xs font-bold uppercase">{selectedAgreement.agreementType.replace(/([A-Z])/g, ' $1')}</p>
                            </div>
                            <div>
                                <p className="text-[9px] uppercase tracking-widest font-bold text-white/20 mb-1">Covenant Date</p>
                                <p className="text-xs font-bold">{selectedAgreement.date}</p>
                            </div>
                          </div>
                        </div>

                        {selectedAgreement.assetInfo.property ? (
                          <div className="glass-card p-8 rounded-3xl border border-white/5 space-y-4">
                            <p className="text-[10px] uppercase tracking-widest font-bold text-white/30">Property Class Information</p>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-white/40">Title</span>
                                <span className="text-xs font-bold">{selectedAgreement.assetInfo.property.propertyTitle}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-white/40">Category</span>
                                <span className="text-xs font-bold">{selectedAgreement.assetInfo.property.category}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-white/40">Reference</span>
                                <span className="text-[10px] font-mono text-luxury-gold truncate max-w-[150px]">{selectedAgreement.assetInfo.property.propertyId}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-white/40">Location</span>
                                <span className="text-xs font-bold">{selectedAgreement.assetInfo.property.city}, {selectedAgreement.assetInfo.property.district}</span>
                              </div>
                            </div>
                          </div>
                        ) : selectedAgreement.assetInfo.vehicle ? (
                          <div className="glass-card p-8 rounded-3xl border border-white/5 space-y-4">
                            <p className="text-[10px] uppercase tracking-widest font-bold text-white/30">Automobile Specs</p>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-white/40">Make/Model</span>
                                <span className="text-xs font-bold">{selectedAgreement.assetInfo.vehicle.make} {selectedAgreement.assetInfo.vehicle.model}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-white/40">Year</span>
                                <span className="text-xs font-bold">{selectedAgreement.assetInfo.vehicle.year}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-white/40">Plate No</span>
                                <span className="text-xs font-bold uppercase">{selectedAgreement.assetInfo.vehicle.plateNumber}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="glass-card p-8 rounded-3xl border border-white/5 flex items-center justify-center text-white/20 italic text-xs">
                             Custom terms only - No physical asset mapped
                          </div>
                        )}
                      </div>
                    </section>

                    {/* Legal Clauses */}
                    <section className="space-y-6">
                      <div className="flex items-center gap-4 text-luxury-gold">
                        <FileText size={20} />
                        <h3 className="text-xs uppercase tracking-[0.3em] font-bold">Incorporated Legal Clauses</h3>
                      </div>
                      <div className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-8 lg:p-12 text-sm leading-relaxed text-white/60 font-mono overflow-y-auto max-h-[400px]">
                        {selectedAgreement.legalClauses}
                      </div>
                    </section>

                    {/* QR Verification Placeholder */}
                    <section className="flex flex-col md:flex-row items-center gap-10 p-10 bg-luxury-gold/5 rounded-[2.5rem] border border-luxury-gold/10">
                      <div className="w-40 h-40 bg-white p-4 rounded-3xl">
                        {selectedAgreement.qrCode ? (
                          <img src={selectedAgreement.qrCode} className="w-full h-full" alt="Verification QR" />
                        ) : (
                          <div className="w-full h-full bg-neutral-100 flex items-center justify-center text-neutral-300">
                             <QrCode size={64} />
                          </div>
                        )}
                      </div>
                      <div className="space-y-4 text-center md:text-left">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-luxury-gold mb-1">Verification Authentication</p>
                          <h4 className="text-xl font-display font-bold">Digital Registry Token</h4>
                        </div>
                        <p className="text-xs text-white/50 max-w-sm leading-relaxed">This QR code integrates the deed into the AmaanEstate blockchain-backed registry for instant authority verification across all terminals.</p>
                      </div>
                    </section>
                  </div>
                </div>
              </div>

              {/* Modal Footer (Fixed) */}
              <div className="p-8 border-t border-white/5 bg-[#0a0a0a] flex items-center justify-between shrink-0 px-12">
                <div className="hidden md:flex items-center gap-4 text-white/30 text-[10px] uppercase font-bold tracking-widest">
                  <ShieldCheck size={16} />
                  Registry Audit Protocol Active
                </div>
                
                <div className="flex items-center gap-4 w-full md:w-auto">
                  {selectedAgreement.status === 'Pending Approval' && (
                    <>
                      <Button 
                        variant="ghost" 
                        onClick={() => setIsRejectModalOpen(true)}
                        className="flex-1 md:flex-none border border-white/10 hover:bg-red-500/10 hover:text-red-500 text-white h-14 rounded-2xl px-6 text-[11px] font-bold uppercase tracking-widest"
                      >
                        <X size={16} className="mr-2" /> Terminate
                      </Button>
                      <Button 
                        variant="ghost" 
                        onClick={() => setIsRevisionModalOpen(true)}
                        className="flex-1 md:flex-none border border-white/10 hover:bg-blue-500/10 hover:text-blue-500 text-white h-14 rounded-2xl px-6 text-[11px] font-bold uppercase tracking-widest"
                      >
                        <FileSignature size={16} className="mr-2" /> Request Edit
                      </Button>
                      <Button 
                        onClick={() => handleApprove(selectedAgreement.agreementId)}
                        disabled={isProcessing}
                        className="flex-1 md:flex-none bg-luxury-gold text-luxury-black hover:bg-white h-14 rounded-2xl px-10 text-[11px] font-bold uppercase tracking-widest shadow-xl shadow-luxury-gold/20"
                      >
                        {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <><Check size={16} className="mr-2" /> Certify & Release</>}
                      </Button>
                    </>
                  )}
                  {selectedAgreement.status === 'Approved' && (
                    <Button 
                      onClick={() => downloadPDF(selectedAgreement)}
                      className="flex-1 md:flex-none bg-emerald-600 text-white hover:bg-emerald-500 h-14 rounded-2xl px-12 text-[11px] font-bold uppercase tracking-widest"
                    >
                      <Download size={16} className="mr-3" /> Download Certified Copy
                    </Button>
                  )}
                  {selectedAgreement.status === 'Rejected' && (
                    <div className="flex items-center gap-3 text-red-500 text-xs font-bold uppercase tracking-widest px-8 bg-red-500/10 py-4 rounded-xl border border-red-500/20">
                      <AlertOctagon size={18} /> Rejected Filing
                    </div>
                  )}
                  {selectedAgreement.status === 'revision_requested' && (
                    <div className="flex items-center gap-3 text-blue-500 text-xs font-bold uppercase tracking-widest px-8 bg-blue-500/10 py-4 rounded-xl border border-blue-500/20">
                      <FileSignature size={18} /> Revision Required
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      <AnimatePresence>
        {isRejectModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/80 backdrop-blur-sm"
               onClick={() => setIsRejectModalOpen(false)}
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.9 }}
               className="relative w-full max-w-md bg-neutral-900 border border-white/10 p-10 rounded-[2.5rem] space-y-8 shadow-2xl"
             >
                <div className="space-y-2">
                   <h3 className="text-2xl font-display font-bold">Filing Rejection</h3>
                   <p className="text-[11px] text-white/40 uppercase tracking-widest font-bold">Audit protocol requires reasons for termination</p>
                </div>

                <textarea 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl h-40 p-6 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors placeholder:text-white/10"
                  placeholder="Describe inconsistencies, missing documents, or validation failures..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />

                <div className="flex gap-4">
                  <Button 
                    variant="ghost" 
                    onClick={() => setIsRejectModalOpen(false)}
                    className="flex-1 border border-white/5 hover:bg-white/5 text-[11px] font-bold uppercase tracking-widest h-14 rounded-2xl"
                  >
                    Rescind
                  </Button>
                  <Button 
                    onClick={handleReject}
                    disabled={isProcessing}
                    className="flex-1 bg-red-600 text-white hover:bg-red-500 text-[11px] font-bold uppercase tracking-widest h-14 rounded-2xl"
                  >
                     {isProcessing ? <Loader2 className="animate-spin" /> : 'Confirm Rejection'}
                  </Button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Revision Modal */}
      <AnimatePresence>
        {isRevisionModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/80 backdrop-blur-sm"
               onClick={() => setIsRevisionModalOpen(false)}
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.9 }}
               className="relative w-full max-w-md bg-neutral-900 border border-white/10 p-10 rounded-[2.5rem] space-y-8 shadow-2xl"
             >
                <div className="space-y-2">
                   <h3 className="text-2xl font-display font-bold">Request Revision</h3>
                   <p className="text-[11px] text-white/40 uppercase tracking-widest font-bold">Guide the user on what needs to be changed</p>
                </div>

                <textarea 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl h-40 p-6 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors placeholder:text-white/10"
                  placeholder="Explain exactly what needs to be fixed (e.g., missing witnessed ID, incorrect price, typo in names)..."
                  value={revisionReason}
                  onChange={(e) => setRevisionReason(e.target.value)}
                />

                <div className="flex gap-4">
                  <Button 
                    variant="ghost" 
                    onClick={() => setIsRevisionModalOpen(false)}
                    className="flex-1 border border-white/5 hover:bg-white/5 text-[11px] font-bold uppercase tracking-widest h-14 rounded-2xl"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleRequestRevision}
                    disabled={isProcessing}
                    className="flex-1 bg-blue-600 text-white hover:bg-blue-500 text-[11px] font-bold uppercase tracking-widest h-14 rounded-2xl"
                  >
                     {isProcessing ? <Loader2 className="animate-spin" /> : 'Request Edit'}
                  </Button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
