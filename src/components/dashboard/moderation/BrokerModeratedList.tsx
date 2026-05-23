import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, FileText, Ban, Building2, User } from 'lucide-react';
import { brokerService } from '@/services/brokerService';
import { Broker, Agency } from '@/types';
import { Button } from '@/components/ui/button';

export default function BrokerModeratedList() {
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'brokers' | 'agencies'>('brokers');

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
      await loadData();
    } catch (error) {
      console.error("Failed to update broker status", error);
    }
  };

  const handleUpdateAgencyStatus = async (id: string, status: Agency['status']) => {
    try {
      await brokerService.updateAgencyStatus(id, status);
      await loadData();
    } catch (error) {
      console.error("Failed to update agency status", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-luxury-gold border-t-transparent animate-spin"></div>
      </div>
    );
  }

  const pendingBrokers = brokers.filter(b => b.status === 'pending');
  const pendingAgencies = agencies.filter(a => a.status === 'pending');

  return (
    <div className="space-y-8">
      {/* Informative Header */}
      <div className="bg-luxury-gold/5 border border-luxury-gold/20 p-6 rounded-2xl flex items-start gap-4">
        <div className="bg-luxury-gold/20 p-3 rounded-full text-luxury-gold">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h3 className="text-luxury-gold font-bold uppercase tracking-widest text-sm">Legal Audits & Broker Vetting</h3>
          <p className="text-white/60 text-xs mt-1">
            Review broker and corporate agency registration requests, examine verified business licenses, and approve vetted partners to access premium leads.
          </p>
        </div>
      </div>

      {/* Subtab Navigation Row */}
      <div className="flex gap-4 border-b border-white/5 pb-4">
        <button
          onClick={() => setActiveSubTab('brokers')}
          className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeSubTab === 'brokers'
              ? 'bg-[#C5A059] text-black font-black'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <User size={14} />
          <span>Pending Brokers ({pendingBrokers.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('agencies')}
          className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeSubTab === 'agencies'
              ? 'bg-[#C5A059] text-black font-black'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <Building2 size={14} />
          <span>Pending Agencies ({pendingAgencies.length})</span>
        </button>
      </div>

      {/* Dynamic List Render */}
      {activeSubTab === 'brokers' ? (
        <div className="space-y-4">
          {pendingBrokers.map(broker => (
            <div key={broker.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-white/20 transition-all">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-amber-500/20 text-amber-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Pending</span>
                  <span className="text-white/40 text-[10px] font-mono">Broker ID: {broker.id}</span>
                </div>
                <h4 className="text-xl font-bold text-white mb-1">{broker.fullName}</h4>
                <p className="text-white/60 text-xs">{broker.city}, {broker.region} • {broker.yearsOfExperience || 0} Years Exp</p>
                <div className="mt-3 text-xs text-white/40 flex flex-wrap gap-4">
                  <span>✉ Email: {broker.email}</span>
                  <span>📞 Phone: {broker.phone}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 lg:justify-end shrink-0">
                <Button size="sm" variant="outline" className="border-white/10 text-white/60 hover:bg-white/5 h-9 text-xs" onClick={() => window.open(broker.governmentIdUrl || '#', '_blank')}>
                  <FileText size={14} className="mr-2" /> ID Doc
                </Button>
                <Button size="sm" onClick={() => handleUpdateBrokerStatus(broker.id, 'rejected')} variant="outline" className="border-red-500/30 text-red-500 hover:bg-red-500/10 h-9 text-xs">
                  <XCircle size={14} className="mr-2" /> Reject
                </Button>
                <Button size="sm" onClick={() => handleUpdateBrokerStatus(broker.id, 'suspended')} variant="outline" className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10 h-9 text-xs">
                  <Ban size={14} className="mr-2" /> Suspend
                </Button>
                <Button size="sm" onClick={() => handleUpdateBrokerStatus(broker.id, 'approved')} className="bg-emerald-500 text-black hover:bg-white h-9 text-xs font-bold">
                  <CheckCircle2 size={14} className="mr-2" /> Approve
                </Button>
              </div>
            </div>
          ))}
          {pendingBrokers.length === 0 && (
            <div className="text-center py-12 border border-white/5 bg-white/5 rounded-2xl text-white/50 text-sm">
              No pending broker applications.
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {pendingAgencies.map(agency => (
            <div key={agency.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-white/20 transition-all">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-amber-500/20 text-amber-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Pending</span>
                  <span className="text-white/40 text-[10px] font-mono">Agency ID: {agency.agencyId}</span>
                </div>
                <h4 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                  <Building2 size={18} className="text-luxury-gold" />
                  {agency.agencyName}
                </h4>
                <p className="text-white/60 text-xs">Owner: {agency.ownerId}</p>
                <div className="mt-3 text-xs text-white/40 flex flex-wrap gap-4">
                  <span>✉ Email: {agency.email}</span>
                  <span>📞 Phone: {agency.phone}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 lg:justify-end shrink-0">
                <Button size="sm" variant="outline" className="border-white/10 text-white/60 hover:bg-white/5 h-9 text-xs" onClick={() => window.open(agency.license || '#', '_blank')}>
                  <FileText size={14} className="mr-2" /> Corporate License
                </Button>
                <Button size="sm" onClick={() => handleUpdateAgencyStatus(agency.id, 'rejected')} variant="outline" className="border-red-500/30 text-red-500 hover:bg-red-500/10 h-9 text-xs">
                  <XCircle size={14} className="mr-2" /> Reject
                </Button>
                <Button size="sm" onClick={() => handleUpdateAgencyStatus(agency.id, 'suspended')} variant="outline" className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10 h-9 text-xs">
                  <Ban size={14} className="mr-2" /> Suspend
                </Button>
                <Button size="sm" onClick={() => handleUpdateAgencyStatus(agency.id, 'approved')} className="bg-emerald-500 text-black hover:bg-white h-9 text-xs font-bold">
                  <CheckCircle2 size={14} className="mr-2" /> Approve
                </Button>
              </div>
            </div>
          ))}
          {pendingAgencies.length === 0 && (
            <div className="text-center py-12 border border-white/5 bg-white/5 rounded-2xl text-white/50 text-sm">
              No pending corporate agency applications.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
