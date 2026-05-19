import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, Search, FileText } from 'lucide-react';
import { brokerService } from '@/services/brokerService';
import { Broker } from '@/types';
import { Button } from '@/components/ui/button';

export default function BrokerModeratedList() {
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBrokers();
  }, []);

  const loadBrokers = async () => {
    setLoading(true);
    try {
      const data = await brokerService.getAllBrokers();
      setBrokers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: Broker['status']) => {
    try {
      await brokerService.updateBrokerStatus(id, status);
      await loadBrokers();
    } catch (error) {
      console.error("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-luxury-gold border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-luxury-gold/5 border border-luxury-gold/20 p-6 rounded-2xl flex items-start gap-4">
        <div className="bg-luxury-gold/20 p-3 rounded-full text-luxury-gold">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h3 className="text-luxury-gold font-bold uppercase tracking-widest text-sm">Legal Audits & Broker Vetting</h3>
          <p className="text-white/60 text-xs mt-1">Review broker registration requests, examine legal documents, and approve highly verified professionals to operate in the AmaanEstate marketplace.</p>
        </div>
      </div>

      <div className="space-y-4">
        {brokers.filter(b => b.status === 'pending').map(broker => (
          <div key={broker.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-amber-500/20 text-amber-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Pending</span>
                <span className="text-white/40 text-[10px] font-mono">{broker.id}</span>
              </div>
              <h4 className="text-lg font-bold text-white mb-1">{broker.fullName}</h4>
              <p className="text-white/60 text-xs">{broker.city}, {broker.region} • {broker.yearsOfExperience} Years Exp</p>
            </div>
            
            <div className="flex flex-wrap gap-2 lg:justify-end">
              <Button size="sm" variant="outline" className="border-white/10 text-white/60 w-full lg:w-auto h-9 text-xs">
                <FileText size={14} className="mr-2" /> View Documents
              </Button>
              <Button size="sm" onClick={() => handleUpdateStatus(broker.id, 'rejected')} variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10 w-full lg:w-auto h-9 text-xs">
                <XCircle size={14} className="mr-2" /> Reject
              </Button>
              <Button size="sm" onClick={() => handleUpdateStatus(broker.id, 'approved')} className="bg-emerald-500 text-black hover:bg-white w-full lg:w-auto h-9 text-xs font-bold">
                <CheckCircle2 size={14} className="mr-2" /> Verify & Approve
              </Button>
            </div>
          </div>
        ))}
        {brokers.filter(b => b.status === 'pending').length === 0 && (
          <div className="text-center py-12 border border-white/5 bg-white/5 rounded-2xl text-white/50 text-sm">
            No pending broker applications.
          </div>
        )}
      </div>
    </div>
  );
}
