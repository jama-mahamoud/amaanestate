import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  UserCheck, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Eye, 
  Edit3, 
  Phone, 
  Mail, 
  Clock, 
  MapPin, 
  Plus, 
  Search, 
  Award,
  BadgeAlert,
  Save,
  Loader2,
  ExternalLink,
  ChevronRight,
  UserRound,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { brokerService } from '@/services/brokerService';
import { listingService } from '@/services/listingService';
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { Broker, Agency, Listing } from '@/types';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function AgenciesBrokersManagement() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  
  // Modals for Actions
  const [selectedApplication, setSelectedApplication] = useState<{
    type: 'agency' | 'broker';
    data: any;
  } | null>(null);
  
  const [editingAgency, setEditingAgency] = useState<Agency | null>(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all administration registries
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const agencyData = await brokerService.getAllAgencies();
      const brokerData = await brokerService.getAllBrokers();
      
      // Fetch listings to calculate counts
      const listingsSnap = await getDocs(collection(db, 'listings'));
      const listingsList = listingsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Listing));
      
      setAgencies(agencyData);
      setBrokers(brokerData);
      setListings(listingsList);
    } catch (error) {
      console.error("Failed to load systems administration directory:", error);
      toast.error("Error loading directories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Filter application / items
  const { pendingAgencies, pendingBrokers, verifiedAgencies, verifiedBrokers } = useMemo(() => {
    return {
      pendingAgencies: agencies.filter(a => a.status === 'pending'),
      pendingBrokers: brokers.filter(b => b.status === 'pending'),
      verifiedAgencies: agencies.filter(a => a.status === 'approved' || (a as any).status === 'verified' || a.verified === true),
      verifiedBrokers: brokers.filter(b => b.status === 'approved' || (b as any).status === 'verified' || b.isVerified === true),
    };
  }, [agencies, brokers]);

  // Compute listing counts for faster lookup
  const listingMetadata = useMemo(() => {
    const agencyCounts: Record<string, { total: number, property: number, vehicle: number }> = {};
    const brokerCounts: Record<string, number> = {};
    const agencyTeamCounts: Record<string, number> = {};

    listings.forEach(l => {
      const oid = l.ownerId;
      if (!agencyCounts[oid]) agencyCounts[oid] = { total: 0, property: 0, vehicle: 0 };
      agencyCounts[oid].total++;
      if (l.category === 'property' || l.category === 'land') agencyCounts[oid].property++;
      if (l.category === 'vehicle') agencyCounts[oid].vehicle++;

      if (l.associatedBrokerId) {
        brokerCounts[l.associatedBrokerId] = (brokerCounts[l.associatedBrokerId] || 0) + 1;
      }
    });

    brokers.forEach(b => {
      if (b.companyName) {
        const cname = b.companyName.toLowerCase().trim();
        agencyTeamCounts[cname] = (agencyTeamCounts[cname] || 0) + 1;
      }
    });

    return { agencyCounts, brokerCounts, agencyTeamCounts };
  }, [listings, brokers]);

  // Listing Counts helpers
  const getAgencyListingsCount = (ownerId: string, category?: 'property' | 'vehicle') => {
    const meta = listingMetadata.agencyCounts[ownerId];
    if (!meta) return 0;
    if (!category) return meta.total;
    return meta[category] || 0;
  };

  const getBrokerListingsCount = (brokerId: string) => {
    return listingMetadata.brokerCounts[brokerId] || 0;
  };

  const getAgencyBrokersCount = (agencyName: string) => {
    return listingMetadata.agencyTeamCounts[agencyName.toLowerCase().trim()] || 0;
  };

  // Actions
  const handleApproveAgency = async (agencyId: string) => {
    try {
      const ref = doc(db, 'agencies', agencyId);
      await updateDoc(ref, {
        status: 'approved',
        verified: true,
        isVerified: true,
        visibility: true,
        approved: true,
        updatedAt: new Date().toISOString()
      });
      
      // Upgrade user role to agency (Never update logged-in admin role)
      const matched = agencies.find(a => a.id === agencyId);
      if (matched?.ownerId && matched.ownerId !== user?.uid) {
        await updateDoc(doc(db, 'users', matched.ownerId), { role: 'agency' });
      } else if (matched?.ownerId === user?.uid) {
        console.warn('Prevented self-role-modification for admin user:', user?.uid);
      }

      toast.success("Agency registration approved successfully!");
      setSelectedApplication(null);
      await fetchAllData();
    } catch (err) {
      console.error(err);
      toast.error("Action approval failed.");
    }
  };

  const handleApproveBroker = async (brokerId: string) => {
    try {
      const ref = doc(db, 'brokers', brokerId);
      await updateDoc(ref, {
        status: 'approved',
        isVerified: true,
        approved: true,
        visibility: true,
        updatedAt: new Date().toISOString()
      });

      // Upgrade user role to agent (Never update logged-in admin role)
      const matched = brokers.find(b => b.id === brokerId);
      if (matched?.userId && matched.userId !== user?.uid) {
        await updateDoc(doc(db, 'users', matched.userId), { role: 'agent' });
      } else if (matched?.userId === user?.uid) {
        console.warn('Prevented self-role-modification for admin user:', user?.uid);
      }

      toast.success("Broker registration approved successfully!");
      setSelectedApplication(null);
      await fetchAllData();
    } catch (err) {
      console.error(err);
      toast.error("Action approval failed.");
    }
  };

  const handleRejectAgency = async (agencyId: string) => {
    try {
      const ref = doc(db, 'agencies', agencyId);
      await updateDoc(ref, {
        status: 'rejected',
        verified: false,
        isVerified: false,
        visibility: false,
        updatedAt: new Date().toISOString()
      });
      toast.success("Agency registration rejected.");
      setSelectedApplication(null);
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectBroker = async (brokerId: string) => {
    try {
      const ref = doc(db, 'brokers', brokerId);
      await updateDoc(ref, {
        status: 'rejected',
        isVerified: false,
        visibility: false,
        updatedAt: new Date().toISOString()
      });
      toast.success("Broker registration rejected.");
      setSelectedApplication(null);
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSuspendAgency = async (agencyId: string) => {
    try {
      const ref = doc(db, 'agencies', agencyId);
      await updateDoc(ref, {
        status: 'suspended',
        verified: false,
        isVerified: false,
        visibility: false,
        updatedAt: new Date().toISOString()
      });
      toast.success("Agency corporated suspended.");
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSuspendBroker = async (brokerId: string) => {
    try {
      const ref = doc(db, 'brokers', brokerId);
      await updateDoc(ref, {
        status: 'suspended',
        isVerified: false,
        visibility: false,
        updatedAt: new Date().toISOString()
      });
      toast.success("Broker membership suspended.");
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAgency = async (agencyId: string) => {
    if (!window.confirm("Are you sure you want to delete this agency? This is irreversible.")) return;
    try {
      await brokerService.deleteAgency(agencyId);
      toast.success("Agency deleted from system.");
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBroker = async (brokerId: string) => {
    if (!window.confirm("Are you sure you want to delete this broker? This is irreversible.")) return;
    try {
      await brokerService.deleteBroker(brokerId);
      toast.success("Broker deleted from system.");
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveAgencyEdit = async () => {
    if (!editingAgency) return;
    try {
      const ref = doc(db, 'agencies', editingAgency.id);
      await updateDoc(ref, {
        agencyName: editingAgency.agencyName,
        phone: editingAgency.phone,
        email: editingAgency.email,
        license: editingAgency.license,
        updatedAt: new Date().toISOString()
      });
      toast.success("Agency updated successfully!");
      setEditingAgency(null);
      await fetchAllData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update credentials.");
    }
  };


  return (
    <div className="space-y-12">
      {/* Overview Headings */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight text-white">
            Agencies & Brokers Master 🏢
          </h1>
          <p className="text-white/40 text-xs font-bold uppercase tracking-[0.3em] mt-2">
            Global regulatory authority deck for corporate brokerages & independent agents
          </p>
        </div>
        <div className="flex gap-4">
          <Button onClick={fetchAllData} disabled={loading} className="bg-white/5 hover:bg-white/10 text-white h-11 px-6 rounded-xl text-xs font-bold uppercase tracking-widest border border-white/10">
            {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
            Synchronize Registry
          </Button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/[0.01] border border-white/5 p-6 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#C5A059]/10 rounded-full blur-xl" />
          <Users size={20} className="text-[#C5A059] mb-4" />
          <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">All Registries</p>
          <h3 className="text-3xl font-bold font-display text-white mt-1">{agencies.length + brokers.length}</h3>
        </div>
        <div className="bg-white/[0.01] border border-white/5 p-6 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full blur-xl" />
          <Building2 size={20} className="text-blue-400 mb-4" />
          <p className="text-[10px] text-white/40 uppercase tracking-widest font-black font-sans">Verified Agencies</p>
          <h3 className="text-3xl font-bold font-display text-white mt-1">{verifiedAgencies.length}</h3>
        </div>
        <div className="bg-white/[0.01] border border-white/5 p-6 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl" />
          <UserCheck size={20} className="text-emerald-400 mb-4" />
          <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">Verified Brokers</p>
          <h3 className="text-3xl font-bold font-display text-white mt-1">{verifiedBrokers.length}</h3>
        </div>
        <div className="bg-white/[0.01] border border-white/5 p-6 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-red-400/10 rounded-full blur-xl" />
          <BadgeAlert size={20} className="text-amber-500 mb-4 animate-pulse" />
          <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">Pending Audits</p>
          <h3 className="text-3xl font-bold font-display text-amber-500 mt-1">{pendingAgencies.length + pendingBrokers.length}</h3>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-24 bg-white/[0.01] border border-white/5 rounded-[3.5rem]">
          <Loader2 className="animate-spin text-luxury-gold mx-auto mb-4" size={32} />
          <p className="text-white/60 text-sm">Loading complete Horn of Africa authority registries...</p>
        </div>
      ) : (
        <div className="space-y-16">
          
          {/* SECTION 1: Pending Applications */}
          <section className="glass-card p-8 md:p-12 rounded-[3.5rem] border border-white/5 bg-white/[0.01] relative overflow-hidden">
            <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Clock size={20} className="animate-pulse" />
              </div>
              <div>
                <h3 className="text-2xl font-display font-medium text-white tracking-tight">1. Pending Applications</h3>
                <p className="text-white/40 text-[9px] uppercase tracking-wider font-extrabold">Require compliance audit for official listing</p>
              </div>
              <span className="ml-auto bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full text-xs font-bold font-mono">
                {pendingAgencies.length + pendingBrokers.length} Applications
              </span>
            </div>

            {pendingAgencies.length === 0 && pendingBrokers.length === 0 ? (
              <div className="text-center py-12 text-white/50 bg-[#0c0c0c] rounded-2xl border border-white/5">
                <CheckCircle2 size={36} className="text-emerald-500 mx-auto mb-3" />
                <p className="text-xs font-bold uppercase tracking-widest">Compliance Clear</p>
                <p className="text-[11px] text-white/40 mt-1">No pending agency or broker requests registered right now.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-[10px] text-white/30 uppercase tracking-[0.2em] font-black">
                      <th className="py-4 px-4">Entity & Image</th>
                      <th className="py-4 px-4">Registry Type</th>
                      <th className="py-4 px-4">Gov. License ID</th>
                      <th className="py-4 px-4">Owner Name</th>
                      <th className="py-4 px-4">Official Contact</th>
                      <th className="py-4 px-4">Registration Date</th>
                      <th className="py-4 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {/* Agencies applications */}
                    {pendingAgencies.map((agency) => (
                      <tr key={agency.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <img src={agency.logo || "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=80&q=80"} alt="" className="w-10 h-10 object-cover rounded-xl bg-white/10 border border-white/10 shrink-0" />
                            <div>
                              <p className="font-bold text-white text-sm group-hover:text-luxury-gold transition-colors">{agency.agencyName}</p>
                              <p className="text-[9px] text-white/40 uppercase tracking-widest font-mono">ID: {agency.id.substring(0, 8)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="bg-blue-500/15 text-blue-400 border border-blue-500/10 px-2.5 py-1 rounded-md text-[9px] uppercase font-black tracking-widest">
                            Agency
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-mono bg-white/5 text-white/80 px-2 py-0.5 rounded text-[10px] break-all">
                            {agency.license || 'L-91129-SM'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-white/80">Corporate Agency</td>
                        <td className="py-4 px-4 text-white/80">
                          <div className="space-y-0.5">
                            <p className="font-mono">{agency.phone}</p>
                            <p className="text-white/40 font-mono text-[10px]">{agency.email}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-white/50 font-mono">
                          {agency.createdAt ? new Date(agency.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex justify-end gap-2.5">
                            <Button 
                              onClick={() => setSelectedApplication({ type: 'agency', data: agency })}
                              size="sm" 
                              className="bg-white/5 hover:bg-white/10 text-white text-[10px] uppercase font-bold tracking-widest px-3 h-8"
                            >
                              <Eye size={12} className="mr-1" /> Profile
                            </Button>
                            <Button 
                              onClick={() => handleApproveAgency(agency.id)}
                              size="sm" 
                              className="bg-[#C5A059] hover:bg-white text-black text-[10px] uppercase font-black tracking-wider px-3 h-8 rounded-lg"
                            >
                              Approve
                            </Button>
                            <Button 
                              onClick={() => handleRejectAgency(agency.id)}
                              size="sm" 
                              variant="destructive" 
                              className="text-[10px] uppercase font-bold tracking-widest px-2.5 h-8 bg-red-600/20 hover:bg-red-600 text-red-100"
                            >
                              Reject
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {/* Brokers applications */}
                    {pendingBrokers.map((broker) => (
                      <tr key={broker.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <img src={broker.profilePhotoUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&q=80"} alt="" className="w-10 h-10 object-cover rounded-xl bg-white/10 border border-white/10 shrink-0" />
                            <div>
                              <p className="font-bold text-white text-sm group-hover:text-luxury-gold transition-colors">{broker.fullName}</p>
                              <p className="text-[9px] text-white/40 uppercase tracking-widest font-mono">ID: {broker.id.substring(0, 8)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/10 px-2.5 py-1 rounded-md text-[9px] uppercase font-black tracking-widest">
                            Independent Broker
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-mono bg-white/5 text-white/80 px-2 py-0.5 rounded text-[10px]">
                            {broker.licenseNumber || 'LIC-21A-SOM'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-white/80">{broker.fullName}</td>
                        <td className="py-4 px-4 text-white/80">
                          <div className="space-y-0.5">
                            <p className="font-mono">{broker.phone}</p>
                            <p className="text-white/40 font-mono text-[10px]">{broker.email}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-white/50 font-mono">
                          {broker.createdAt ? new Date(broker.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex justify-end gap-2.5">
                            <Button 
                              onClick={() => setSelectedApplication({ type: 'broker', data: broker })}
                              size="sm" 
                              className="bg-white/5 hover:bg-white/10 text-white text-[10px] uppercase font-bold tracking-widest px-3 h-8"
                            >
                              <Eye size={12} className="mr-1" /> Profile
                            </Button>
                            <Button 
                              onClick={() => handleApproveBroker(broker.id)}
                              size="sm" 
                              className="bg-[#C5A059] hover:bg-white text-black text-[10px] uppercase font-black tracking-wider px-3 h-8 rounded-lg"
                            >
                              Approve
                            </Button>
                            <Button 
                              onClick={() => handleRejectBroker(broker.id)}
                              size="sm" 
                              variant="destructive" 
                              className="text-[10px] uppercase font-bold tracking-widest px-2.5 h-8 bg-red-600/20 hover:bg-red-600 text-red-100"
                            >
                              Reject
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* SECTION 2: Verified Agencies */}
          <section className="glass-card p-8 md:p-12 rounded-[3.5rem] border border-white/5 bg-white/[0.01]">
            <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#C5A059]/10 flex items-center justify-center text-luxury-gold">
                <Building2 size={20} />
              </div>
              <div>
                <h3 className="text-2xl font-display font-medium text-white tracking-tight">2. Verified Agencies</h3>
                <p className="text-white/40 text-[9px] uppercase tracking-wider font-extrabold font-sans">Corporate brokerage firms currently listed in directory</p>
              </div>
              <span className="ml-auto bg-luxury-gold/10 text-luxury-gold px-3 py-1 rounded-full text-xs font-mono font-bold">
                {verifiedAgencies.length} Listed
              </span>
            </div>

            {verifiedAgencies.length === 0 ? (
              <div className="text-center py-12 text-white/40 bg-[#0c0c0c] rounded-2xl border border-white/5">
                <p className="text-xs font-bold uppercase tracking-widest">No Verified Agencies</p>
                <p className="text-[10px] text-white/30 mt-1">Accept compliance applications to list agency firms here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-[10px] text-white/30 uppercase tracking-[0.2em] font-black">
                      <th className="py-4 px-4">Agency / Brand</th>
                      <th className="py-4 px-4">License ID</th>
                      <th className="py-4 px-4">Compliance Status</th>
                      <th className="py-4 px-4">Properties</th>
                      <th className="py-4 px-4">Vehicles</th>
                      <th className="py-4 px-4">Brokers Team</th>
                      <th className="py-4 px-4">Joined Date</th>
                      <th className="py-4 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {verifiedAgencies.map((agency) => {
                      const propCount = getAgencyListingsCount(agency.ownerId, 'property');
                      const carCount = getAgencyListingsCount(agency.ownerId, 'vehicle');
                      const teamCount = getAgencyBrokersCount(agency.agencyName);
                      
                      return (
                        <tr key={agency.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <img src={agency.logo || "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=80&q=80"} alt="" className="w-10 h-10 object-cover rounded-xl bg-white/10 border border-white/10 shrink-0" />
                              <div>
                                <div className="flex items-center gap-1.5 font-bold text-white text-sm">
                                  <span>{agency.agencyName}</span>
                                  <span className="text-emerald-400">✅</span>
                                </div>
                                <p className="text-[9px] text-white/40 uppercase font-mono">{agency.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 font-mono text-white/80">{agency.license || 'L-90291-SM'}</td>
                          <td className="py-4 px-4">
                            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold">
                              Verified
                            </span>
                          </td>
                          <td className="py-4 px-4 text-white font-mono font-bold text-sm">{propCount} lots</td>
                          <td className="py-4 px-4 text-white font-mono font-bold text-sm">{carCount} vehicles</td>
                          <td className="py-4 px-4 text-[#C5A059] font-mono font-bold text-sm">{teamCount} agents</td>
                          <td className="py-4 px-4 text-white/50 font-mono">
                            {agency.createdAt ? new Date(agency.createdAt).toLocaleDateString() : 'May 2026'}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex justify-end gap-2.5">
                              <Button 
                                onClick={() => navigate(`/agents/agency_${agency.id}`)}
                                size="sm" 
                                className="bg-white/5 hover:bg-white/10 text-white text-[10px] uppercase font-bold tracking-widest px-3 h-8"
                              >
                                Live Profile <ExternalLink size={12} className="ml-1 text-luxury-gold" />
                              </Button>
                              <Button 
                                onClick={() => setEditingAgency(agency)}
                                size="sm" 
                                className="bg-white/5 hover:bg-white/10 text-[#C5A059] text-[10px] uppercase font-bold tracking-widest px-3 h-8"
                              >
                                <Edit3 size={11} className="mr-1" /> Edit
                              </Button>
                              <Button 
                                onClick={() => handleSuspendAgency(agency.id)}
                                size="sm" 
                                className="bg-amber-500/10 hover:bg-amber-500 hover:text-black text-amber-500 text-[10px] uppercase font-bold tracking-widest px-3 h-8 border border-amber-500/20"
                              >
                                Suspend
                              </Button>
                              <Button 
                                onClick={() => handleDeleteAgency(agency.id)}
                                size="sm" 
                                variant="destructive" 
                                className="px-2.5 h-8 text-[10px] bg-red-600/10 hover:bg-red-600 text-red-100"
                              >
                                <Trash2 size={12} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* SECTION 3: Verified Brokers */}
          <section className="glass-card p-8 md:p-12 rounded-[3.5rem] border border-white/5 bg-white/[0.01]">
            <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Users size={20} />
              </div>
              <div>
                <h3 className="text-2xl font-display font-medium text-white tracking-tight">3. Verified Brokers</h3>
                <p className="text-white/40 text-[9px] uppercase tracking-wider font-extrabold">Approved independent real estate and listing agents</p>
              </div>
              <span className="ml-auto bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-mono font-bold">
                {verifiedBrokers.length} Agents
              </span>
            </div>

            {verifiedBrokers.length === 0 ? (
              <div className="text-center py-12 text-white/40 bg-[#0c0c0c] rounded-2xl border border-white/5">
                <p className="text-xs font-bold uppercase tracking-widest">No Verified Brokers</p>
                <p className="text-[10px] text-white/30 mt-1">Approve independent compliance forms to add agents here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-[10px] text-white/30 uppercase tracking-[0.2em] font-black">
                      <th className="py-4 px-4">Agent Name</th>
                      <th className="py-4 px-4">Associated Corporate Agency</th>
                      <th className="py-4 px-4">Compliant Lic.</th>
                      <th className="py-4 px-4">Listings Held</th>
                      <th className="py-4 px-4">Contact Detail</th>
                      <th className="py-4 px-4">Joined Date</th>
                      <th className="py-4 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {verifiedBrokers.map((broker) => {
                      const listingsCount = getBrokerListingsCount(broker.id);
                      
                      return (
                        <tr key={broker.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <img src={broker.profilePhotoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80"} alt="" className="w-10 h-10 object-cover rounded-xl bg-white/10 border border-white/10 shrink-0" />
                              <div>
                                <p className="font-bold text-white text-sm group-hover:text-luxury-gold transition-colors">{broker.fullName}</p>
                                <p className="text-[9px] text-[#C5A059] uppercase tracking-widest font-black flex items-center gap-1">
                                  <span>CIVIL AGENT</span>
                                  <span>★</span>
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-white font-medium text-xs">
                              {broker.companyName || 'Independent Generalist'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-white/60 font-mono text-[11px]">{broker.licenseNumber || 'LIC-21A-SOM'}</td>
                          <td className="py-4 px-4 text-white font-mono text-sm font-bold">{listingsCount} approved lots</td>
                          <td className="py-4 px-4 text-white/90 font-mono">
                            <p>{broker.phone}</p>
                            <p className="text-[10px] text-white/40">{broker.email}</p>
                          </td>
                          <td className="py-4 px-4 text-white/50 font-mono">
                            {broker.createdAt ? new Date(broker.createdAt).toLocaleDateString() : 'May 2026'}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex justify-end gap-2.5">
                              <Button 
                                onClick={() => navigate(`/agents/${broker.id}`)}
                                size="sm" 
                                className="bg-white/5 hover:bg-white/10 text-white text-[10px] uppercase font-bold tracking-widest px-3 h-8"
                              >
                                Live View <ExternalLink size={12} className="ml-1 text-luxury-gold" />
                              </Button>
                              <Button 
                                onClick={() => handleSuspendBroker(broker.id)}
                                size="sm" 
                                className="bg-amber-500/10 hover:bg-amber-500 hover:text-black text-amber-500 text-[10px] uppercase font-bold tracking-widest px-3 h-8 border border-amber-500/20"
                              >
                                Suspend
                              </Button>
                              <Button 
                                onClick={() => handleDeleteBroker(broker.id)}
                                size="sm" 
                                variant="destructive" 
                                className="px-2.5 h-8 text-[10px] bg-red-600/10 hover:bg-red-600 text-red-100"
                              >
                                <Trash2 size={12} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

        </div>
      )}

      {/* MODAL 1: VIEW FULL PROFILE APPLICATIONS DETAILS */}
      <AnimatePresence>
        {selectedApplication && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0b0b0b] border border-white/10 rounded-[2.5rem] max-w-2xl w-full p-8 relative overflow-y-auto max-h-[90vh] text-white"
            >
              <h3 className="text-2xl font-display font-bold mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
                <span>Verification Request Profile Desk</span>
                <span className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full text-xs font-mono lowercase">Pending Auditor Review</span>
              </h3>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <img 
                    src={selectedApplication.type === 'agency' ? selectedApplication.data.logo : selectedApplication.data.profilePhotoUrl} 
                    alt="" 
                    className="w-20 h-20 rounded-2xl object-cover bg-white/10 border border-white/10" 
                  />
                  <div>
                    <h4 className="text-xl font-bold font-display">{selectedApplication.type === 'agency' ? selectedApplication.data.agencyName : selectedApplication.data.fullName}</h4>
                    <p className="text-xs text-white/40 uppercase tracking-widest font-mono mt-1">Application Type: {selectedApplication.type}</p>
                    <p className="text-xs text-luxury-gold mt-1 font-mono">Submitting UID: {selectedApplication.type === 'agency' ? selectedApplication.data.ownerId : selectedApplication.data.userId}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/[0.02] p-6 rounded-2xl text-xs gap-y-4">
                  <div>
                    <span className="text-white/40 block mb-1">Email Endpoint</span>
                    <span className="font-mono text-white/90 text-[13px]">{selectedApplication.data.email}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block mb-1">Audit License No.</span>
                    <span className="font-mono text-white/90 bg-white/5 px-2 py-0.5 rounded text-[12px]">{selectedApplication.type === 'agency' ? (selectedApplication.data.license || 'L-PENDING') : (selectedApplication.data.licenseNumber || 'LIC-PENDING')}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block mb-1 font-sans">Official Phone Line</span>
                    <span className="font-mono text-white/90 text-[13px]">{selectedApplication.data.phone}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block mb-1">Operational Area</span>
                    <span className="font-mono text-white/90">
                      {selectedApplication.data.city || 'Jigjiga'}, {selectedApplication.data.region || 'Somali Region'}
                    </span>
                  </div>
                </div>

                {selectedApplication.type === 'broker' && (
                  <div className="space-y-2 border-t border-white/5 pt-4">
                    <h5 className="text-[10px] text-white/40 uppercase tracking-widest font-black">Broker Specialties & Audits</h5>
                    <div className="space-y-4">
                      <div>
                        <span className="text-white/40 text-[11px] block">Years of Experience</span>
                        <span className="text-white font-bold text-sm block">{selectedApplication.data.yearsOfExperience || 0} years</span>
                      </div>
                      <div>
                        <span className="text-white/40 text-[11px] block">Areas of Operation</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {selectedApplication.data.areasOfOperation?.map((area: string) => (
                            <span key={area} className="bg-white/5 relative text-[11px] px-2.5 py-1 rounded">{area}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-white/40 text-[11px] block">Property Specialization</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {selectedApplication.data.propertySpecialization?.map((spec: string) => (
                            <span key={spec} className="bg-white/5 relative text-[11px] px-2.5 py-1 rounded">{spec}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="border-t border-white/5 pt-4 space-y-3">
                  <span className="text-[#C5A059] text-[10px] uppercase font-black tracking-widest block">Audit Credentials Documentation</span>
                  <div className="flex flex-wrap gap-3">
                    <a href={selectedApplication.type === 'agency' ? selectedApplication.data.license : selectedApplication.data.governmentIdUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/5 text-[11px] text-white/80 transition-all font-mono">
                      <ShieldCheck size={16} className="text-emerald-400" /> Government ID Verified Record.pdf
                    </a>
                    <a href={selectedApplication.type === 'agency' ? selectedApplication.data.license : selectedApplication.data.brokerCertificateUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/5 text-[11px] text-white/80 transition-all font-mono">
                      <Award size={16} className="text-[#C5A059]" /> Broker Certification Registration.pdf
                    </a>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                  <Button onClick={() => setSelectedApplication(null)} className="h-11 px-6 rounded-xl text-xs uppercase font-bold tracking-widest bg-white/5 text-white hover:bg-white/10">
                    Close Details
                  </Button>
                  <Button 
                    onClick={() => {
                      if (selectedApplication.type === 'agency') {
                        handleApproveAgency(selectedApplication.data.id);
                      } else {
                        handleApproveBroker(selectedApplication.data.id);
                      }
                    }}
                    className="h-11 px-6 rounded-xl text-xs uppercase font-black bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    Approve Application
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: EDIT VERIFIED AGENCIES */}
      <AnimatePresence>
        {editingAgency && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0b0b0b] border border-white/10 rounded-[2.5rem] max-w-lg w-full p-8 relative text-white"
            >
              <h3 className="text-xl font-display font-bold mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
                <Building2 size={20} className="text-luxury-gold" />
                <span>Edit Agency Credentials</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-2">Agency Name</label>
                  <Input 
                    value={editingAgency.agencyName} 
                    onChange={e => setEditingAgency({...editingAgency, agencyName: e.target.value})}
                    className="bg-white/5 border-0 h-12 pr-6 rounded-xl text-white font-medium" 
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-2">Corporate Primary Phone</label>
                  <Input 
                    value={editingAgency.phone} 
                    onChange={e => setEditingAgency({...editingAgency, phone: e.target.value})}
                    className="bg-white/5 border-0 h-12 pr-6 rounded-xl text-white font-medium" 
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-2">Official Email Endpoint</label>
                  <Input 
                    value={editingAgency.email} 
                    onChange={e => setEditingAgency({...editingAgency, email: e.target.value})}
                    className="bg-white/5 border-0 h-12 pr-6 rounded-xl text-white font-medium" 
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-2">Registry License ID</label>
                  <Input 
                    value={editingAgency.license} 
                    onChange={e => setEditingAgency({...editingAgency, license: e.target.value})}
                    className="bg-white/5 border-0 h-12 pr-6 rounded-xl text-white font-medium" 
                  />
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                  <Button onClick={() => setEditingAgency(null)} className="h-11 px-6 rounded-xl text-xs uppercase font-mono bg-white/5 text-white hover:bg-white/10">
                    Cancel
                  </Button>
                  <Button onClick={handleSaveAgencyEdit} className="h-11 px-6 rounded-xl text-xs uppercase font-bold bg-[#C5A059] text-black hover:bg-white">
                    <Save size={16} className="mr-2" /> Save Updates
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
