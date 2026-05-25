import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Ban, 
  Building2, 
  User, 
  Fingerprint, 
  Award, 
  Hash, 
  Activity, 
  Check, 
  X, 
  Loader2, 
  ExternalLink,
  Users
} from 'lucide-react';
import { brokerService } from '@/services/brokerService';
import { moderationService } from '@/services/moderationService';
import { Broker, Agency } from '@/types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function BrokerModeratedList() {
  const [brokers, setBrokers] = useState<any[]>([]);
  const [agencies, setAgencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'brokers' | 'agencies'>('brokers');
  
  // Registry application status states
  const [verifyingBroker, setVerifyingBroker] = useState<any | null>(null);
  const [verifyingAgency, setVerifyingAgency] = useState<any | null>(null);
  
  // Form controls for certification
  const [registryId, setRegistryId] = useState('');
  const [selectedBadge, setSelectedBadge] = useState('Certified Gold Broker');
  const [docVetted, setDocVetted] = useState(false);
  const [termsVetted, setTermsVetted] = useState(false);
  const [submittingCore, setSubmittingCore] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const brokerData = await brokerService.getAllBrokers();
      const agencyData = await brokerService.getAllAgencies();
      setBrokers(brokerData);
      setAgencies(agencyData);
    } catch (error) {
      console.error("Failed to load audit queues:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBrokerStatus = async (id: string, status: Broker['status']) => {
    try {
      await brokerService.updateBrokerStatus(id, status);
      await moderationService.logAdminAction('BROKER_STATUS_SHIFT', id, `Updated broker state status: ${status}`);
      toast.success(`Broker status set as ${status.toUpperCase()}`);
      await loadData();
    } catch (error) {
      console.error("Failed to update broker status", error);
      toast.error('Could not modify broker state.');
    }
  };

  const handleUpdateAgencyStatus = async (id: string, status: Agency['status']) => {
    try {
      await brokerService.updateAgencyStatus(id, status);
      await moderationService.logAdminAction('AGENCY_STATUS_SHIFT', id, `Updated corporate agency status: ${status}`);
      toast.success(`Agency status set as ${status.toUpperCase()}`);
      await loadData();
    } catch (error) {
      console.error("Failed to update agency status", error);
    }
  };

  const startBrokerVerification = (broker: any) => {
    setVerifyingBroker(broker);
    setRegistryId(`AMAAN-BRK-${Math.floor(1000 + Math.random() * 9000)}`);
    setSelectedBadge('Certified Gold Broker');
    setDocVetted(false);
    setTermsVetted(false);
  };

  const startAgencyVerification = (agency: any) => {
    setVerifyingAgency(agency);
    setRegistryId(`AMAAN-AGC-${Math.floor(1000 + Math.random() * 9000)}`);
    setSelectedBadge('Premium Enterprise Partner');
    setDocVetted(false);
    setTermsVetted(false);
  };

  const submitBrokerRegistry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docVetted || !termsVetted) {
      toast.error('Verification documents and certifications compliance must be vetted first!');
      return;
    }
    setSubmittingCore(true);
    try {
      // Approve application
      await brokerService.updateBrokerStatus(verifyingBroker.id, 'approved');
      // Assign trust badge & license registry ID
      await moderationService.assignTrustBadge(verifyingBroker.id || verifyingBroker.userId, selectedBadge);
      
      // Update custom registry attribute as well
      await moderationService.logAdminAction(
        'BROKER_REGISTRY_VERIFIED', 
        verifyingBroker.id, 
        `Validated license documents. Certified Badge: "${selectedBadge}". Assigned Registry ID: "${registryId}"`
      );
      
      toast.success(`Broker ${verifyingBroker.fullName} validated successfully! Registry License ID: ${registryId}`);
      setVerifyingBroker(null);
      await loadData();
    } catch (err) {
      toast.error('Failure finalizing registry verification.');
    } finally {
      setSubmittingCore(false);
    }
  };

  const submitAgencyRegistry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docVetted || !termsVetted) {
      toast.error('Regulatory requirements and filings must be verified.');
      return;
    }
    setSubmittingCore(true);
    try {
      // Certify agency
      await moderationService.certifyAgency(verifyingAgency.id, registryId);
      toast.success(`Agency ${verifyingAgency.agencyName} officially certified and assigned Registry ID: ${registryId}`);
      setVerifyingAgency(null);
      await loadData();
    } catch (err) {
      toast.error('Failed to register Corporate License credentials.');
    } finally {
      setSubmittingCore(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white/[0.01] border border-white/5 rounded-2xl gap-4">
        <Loader2 size={32} className="animate-spin text-[#C5A059]" />
        <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Accessing regulatory applications database...</p>
      </div>
    );
  }

  const pendingBrokers = brokers.filter(b => b.status === 'pending');
  const pendingAgencies = agencies.filter(a => a.status === 'pending');

  return (
    <div className="space-y-8">
      {/* Informative Header */}
      <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/[0.02] border border-amber-500/15 p-6 rounded-[2rem] flex items-start gap-4">
        <div className="bg-amber-500/10 p-3.5 rounded-2xl text-[#C5A059] shrink-0">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h3 className="text-white font-display font-medium text-lg">Broker Verification Desk</h3>
          <p className="text-white/45 text-xs mt-1 leading-relaxed">
            Review professional certifications, business filings, and identification cards to support consumer safety and market transparency.
          </p>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex gap-4 border-b border-white/5 pb-2">
        <button
          onClick={() => setActiveSubTab('brokers')}
          className={`px-6 py-3.5 rounded-xl text-[10px] uppercase font-bold tracking-widest transition-all flex items-center gap-2 ${
            activeSubTab === 'brokers'
              ? 'bg-[#C5A059] text-black shadow-lg shadow-[#C5A059]/10'
              : 'text-white/50 hover:text-white'
          }`}
        >
          <User size={14} />
          <span>Pending Broker Applications ({pendingBrokers.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('agencies')}
          className={`px-6 py-3.5 rounded-xl text-[10px] uppercase font-bold tracking-widest transition-all flex items-center gap-2 ${
            activeSubTab === 'agencies'
              ? 'bg-[#C5A059] text-black shadow-lg shadow-[#C5A059]/10'
              : 'text-white/50 hover:text-white'
          }`}
        >
          <Building2 size={14} />
          <span>Pending Agency Applications ({pendingAgencies.length})</span>
        </button>
      </div>

      {/* Dynamic List Render */}
      {activeSubTab === 'brokers' ? (
        <div className="space-y-4">
          {pendingBrokers.map(broker => (
            <div key={broker.id} className="bg-white/[0.01] border border-white/5 rounded-[2rem] p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-[#C5A059]/10 transition-all duration-300">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="bg-amber-500/15 text-amber-400 px-3 py-1 rounded-full text-[8.5px] font-black tracking-widest uppercase border border-amber-500/10">
                    Pending Verification
                  </span>
                  <span className="text-white/30 text-[9px] font-mono uppercase">ID: {broker.id}</span>
                </div>
                <div>
                  <h4 className="text-xl font-display font-bold text-white tracking-tight">{broker.fullName}</h4>
                  <p className="text-[#C5A059] text-xs font-semibold mt-1">{broker.city || 'Regional Area'} Area • {broker.yearsOfExperience || 1} Years Experience</p>
                </div>
                <div className="text-xs text-white/45 flex flex-wrap gap-x-6 gap-y-2 font-medium">
                  <span className="flex items-center gap-1.5"><Fingerprint size={12} className="text-[#C5A059]/60" /> Licensure Document Submitted</span>
                  <span>✉ {broker.email}</span>
                  <span>📞 {broker.phone || 'N/A'}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2.5 lg:justify-end shrink-0">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-white/5 hover:border-[#C5A059]/30 text-white/70 h-10 px-4 rounded-xl text-xs gap-1"
                  onClick={() => window.open(broker.governmentIdUrl || '#', '_blank')}
                >
                  <FileText size={14} /> View Identity Docs
                </Button>
                
                <Button 
                  size="sm" 
                  onClick={() => handleUpdateBrokerStatus(broker.id, 'rejected')} 
                  variant="outline" 
                  className="bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white h-10 px-4 rounded-xl text-xs"
                >
                  Reject & Notify Broker
                </Button>
                
                <Button 
                  size="sm" 
                  onClick={() => handleUpdateBrokerStatus(broker.id, 'suspended')} 
                  variant="outline" 
                  className="bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-white h-10 px-4 rounded-xl text-xs"
                >
                  Hold / Suspend Match
                </Button>
                
                <Button 
                  size="sm" 
                  onClick={() => startBrokerVerification(broker)} 
                  className="bg-[#C5A059] text-black hover:bg-white h-10 px-6 rounded-xl text-xs font-semibold uppercase tracking-wider"
                >
                  Review & Approve
                </Button>
              </div>
            </div>
          ))}
          {pendingBrokers.length === 0 && (
            <div className="text-center py-20 border border-white/5 bg-white/[0.01] rounded-[2rem]">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/20 mx-auto mb-4">
                <Users size={22} />
              </div>
              <p className="text-white/40 text-[11px] uppercase tracking-wider font-bold">No pending broker applications.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {pendingAgencies.map(agency => (
            <div key={agency.id} className="bg-white/[0.01] border border-white/5 rounded-[2rem] p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-[#C5A059]/10 transition-all duration-300">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="bg-amber-500/15 text-amber-400 px-3 py-1 rounded-full text-[8.5px] font-black tracking-widest uppercase border border-amber-500/10">
                    Pending Verification
                  </span>
                  <span className="text-white/30 text-[9px] font-mono uppercase">ID: {agency.agencyId || agency.id}</span>
                </div>
                <div>
                  <h4 className="text-xl font-display font-black text-white tracking-tight flex items-center gap-2">
                    <Building2 size={18} className="text-[#C5A059]" />
                    {agency.agencyName}
                  </h4>
                  <p className="text-white/45 text-xs font-semibold mt-1">Founder Owner UID: <span className="font-mono text-white/70">{agency.ownerId}</span></p>
                </div>
                <div className="text-xs text-white/45 flex flex-wrap gap-x-6 gap-y-2 font-medium">
                  <span className="flex items-center gap-1.5"><FileText size={12} className="text-[#C5A059]" /> Trade License Submitted</span>
                  <span>✉ {agency.email}</span>
                  <span>📞 {agency.phone}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2.5 lg:justify-end shrink-0">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-white/5 hover:border-[#C5A059]/30 text-white/70 h-10 px-4 rounded-xl text-xs gap-1"
                  onClick={() => window.open(agency.license || '#', '_blank')}
                >
                  <FileText size={14} /> Corporate Trade license
                </Button>
                
                <Button 
                  size="sm" 
                  onClick={() => handleUpdateAgencyStatus(agency.id, 'rejected')} 
                  variant="outline" 
                  className="bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white h-10 px-4 rounded-xl text-xs"
                >
                  Reject & Deny filings
                </Button>
                
                <Button 
                  size="sm" 
                  onClick={() => handleUpdateAgencyStatus(agency.id, 'suspended')} 
                  variant="outline" 
                  className="bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-white h-10 px-4 rounded-xl text-xs"
                >
                  Hold / Suspend License
                </Button>
                
                <Button 
                  size="sm" 
                  onClick={() => startAgencyVerification(agency)} 
                  className="bg-[#C5A059] text-black hover:bg-white h-10 px-6 rounded-xl text-xs font-semibold uppercase tracking-wider"
                >
                  Review & Approve
                </Button>
              </div>
            </div>
          ))}
          {pendingAgencies.length === 0 && (
            <div className="text-center py-20 border border-white/5 bg-white/[0.01] rounded-[2rem]">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/20 mx-auto mb-4">
                <Building2 size={22} />
              </div>
              <p className="text-white/40 text-[11px] uppercase tracking-wider font-bold">No pending corporate agency applications.</p>
            </div>
          )}
        </div>
      )}

      {/* Broker Audit & Licensing validation Overlay */}
      <AnimatePresence>
        {verifyingBroker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-black border border-white/10 rounded-[2.5rem] p-8 space-y-6 shadow-2xl relative"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#C5A059] tracking-[0.25em] flex items-center gap-1.5">
                    <ShieldCheck size={14} /> VERIFICATION PORTAL
                  </span>
                  <h3 className="text-2xl font-display font-medium text-white mt-1">Approve Broker</h3>
                </div>
                <button
                  onClick={() => setVerifyingBroker(null)}
                  className="p-2.5 rounded-xl bg-white/5 text-white/40 hover:text-white transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={submitBrokerRegistry} className="space-y-6">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
                  <p className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold">Target Professional</p>
                  <p className="text-white font-semibold text-sm">{verifyingBroker.fullName}</p>
                  <p className="text-[11px] text-white/40">{verifyingBroker.email} • {verifyingBroker.city || 'Regional'}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Registry ID inputs */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-white/40 tracking-wider flex items-center gap-1">
                      <Hash size={12} className="text-[#C5A059]" /> Assigned Licensure Registry ID
                    </label>
                    <input
                      type="text"
                      required
                      value={registryId}
                      onChange={(e) => setRegistryId(e.target.value)}
                      className="w-full h-11 bg-white/5 border border-white/5 rounded-xl px-4 text-xs font-semibold text-white/95 focus:outline-none focus:border-[#C5A059]/40"
                    />
                  </div>

                  {/* Trust badge selector */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-white/40 tracking-wider flex items-center gap-1">
                      <Award size={12} className="text-[#C5A059]" /> Assign Trust badge Rating
                    </label>
                    <select
                      value={selectedBadge}
                      onChange={(e) => setSelectedBadge(e.target.value)}
                      className="w-full h-11 bg-white/5 border border-white/5 rounded-xl px-4 text-xs font-semibold text-white/95 focus:outline-none focus:border-[#C5A059]/40"
                    >
                      <option value="Certified Gold Broker">★ Certified Gold Broker</option>
                      <option value="Verified Elite Agent">★★ Verified Elite Agent</option>
                      <option value="Prime Platinum Partner">★★★ Prime Platinum Partner</option>
                      <option value="Standard Broker Profile">Standard Broker</option>
                    </select>
                  </div>
                </div>

                {/* Checklist validation items (Prerequisite compliance checks) */}
                <div className="space-y-3 p-5 bg-white/[0.01] border border-white/5 rounded-2xl">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-white/30 mb-2">Internal Regulatory Checklist Compliance</p>
                  
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={docVetted}
                      onChange={(e) => setDocVetted(e.target.checked)}
                      className="mt-0.5 rounded border-white/20 bg-white/5 text-[#C5A059]"
                    />
                    <div className="text-xs">
                      <p className="text-white/80 font-bold group-hover:text-white">Credentials & Licensure Files Match</p>
                      <p className="text-white/35 text-[11px] mt-0.5">I verify that the uploaded Government ID and real estate certificate contain valid matched names and serial registrations.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer group pt-2">
                    <input
                      type="checkbox"
                      checked={termsVetted}
                      onChange={(e) => setTermsVetted(e.target.checked)}
                      className="mt-0.5 rounded border-white/20 bg-white/5 text-[#C5A059]"
                    />
                    <div className="text-xs">
                      <p className="text-white/80 font-bold group-hover:text-white">AmaanEstate Agency Codes Endorsed</p>
                      <p className="text-white/35 text-[11px] mt-0.5">Applicant has agreed to and signed the standard marketplace ethics charter for transparent customer response speeds.</p>
                    </div>
                  </label>
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setVerifyingBroker(null)}
                    className="h-12 px-6 rounded-xl border-white/5 hover:bg-white/5 text-xs text-white/60 uppercase font-bold tracking-wider"
                  >
                    Cancel audit
                  </Button>
                  <Button
                    type="submit"
                    disabled={submittingCore}
                    className="h-12 px-8 rounded-xl bg-[#C5A059] hover:bg-white text-black text-xs uppercase font-black tracking-widest gap-2"
                  >
                    {submittingCore ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Approve & Certify
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Corporate Agency Audit & Certification Overlay */}
      <AnimatePresence>
        {verifyingAgency && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-black border border-white/10 rounded-[2.5rem] p-8 space-y-6 shadow-2xl relative"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#C5A059] tracking-[0.25em] flex items-center gap-1.5">
                    <Building2 size={14} /> AGENCY CORPORATE WORKSTAT
                  </span>
                  <h3 className="text-2xl font-display font-medium text-white mt-1">Audit & Certify Corporate Agency</h3>
                </div>
                <button
                  onClick={() => setVerifyingAgency(null)}
                  className="p-2.5 rounded-xl bg-white/5 text-white/40 hover:text-white transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={submitAgencyRegistry} className="space-y-6">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
                  <p className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold">Target Business filings</p>
                  <p className="text-white font-black text-sm">{verifyingAgency.agencyName}</p>
                  <p className="text-[11px] text-white/40">Registered Email: {verifyingAgency.email} • Owner ID: {verifyingAgency.ownerId}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-white/40 tracking-wider flex items-center gap-1">
                    <Hash size={12} className="text-[#C5A059]" /> Generated Official Agency License Registry ID
                  </label>
                  <input
                    type="text"
                    required
                    value={registryId}
                    onChange={(e) => setRegistryId(e.target.value)}
                    className="w-full h-11 bg-white/5 border border-white/5 rounded-xl px-4 text-xs font-semibold text-white/95 focus:outline-none focus:border-[#C5A059]/40"
                  />
                </div>

                {/* Corporate compliance check list */}
                <div className="space-y-3 p-5 bg-white/[0.01] border border-white/5 rounded-2xl">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-white/30 mb-2">Corporate filings Audit Check</p>
                  
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={docVetted}
                      onChange={(e) => setDocVetted(e.target.checked)}
                      className="mt-0.5 rounded border-white/20 bg-white/5 text-[#C5A059]"
                    />
                    <div className="text-xs">
                      <p className="text-white/80 font-bold group-hover:text-white">Verify Trade License filings</p>
                      <p className="text-white/35 text-[11px] mt-0.5">Trade registration parameters, tax reference IDs, and legal registration bodies have been fully cross-referenced and confirmed.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer group pt-2">
                    <input
                      type="checkbox"
                      checked={termsVetted}
                      onChange={(e) => setTermsVetted(e.target.checked)}
                      className="mt-0.5 rounded border-white/20 bg-white/5 text-[#C5A059]"
                    />
                    <div className="text-xs">
                      <p className="text-white/80 font-bold group-hover:text-white">Consumer Trust compliance charter certified</p>
                      <p className="text-white/35 text-[11px] mt-0.5">The agency guarantees consumer protection standards and avoids double-brokering listings across AmaanEstate platform.</p>
                    </div>
                  </label>
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setVerifyingAgency(null)}
                    className="h-12 px-6 rounded-xl border-white/5 hover:bg-white/5 text-xs text-white/60 uppercase font-bold tracking-wider"
                  >
                    Cancel audit
                  </Button>
                  <Button
                    type="submit"
                    disabled={submittingCore}
                    className="h-12 px-8 rounded-xl bg-[#C5A059] hover:bg-white text-black text-xs uppercase font-black tracking-widest gap-2"
                  >
                    {submittingCore ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Approve Corporate License
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
