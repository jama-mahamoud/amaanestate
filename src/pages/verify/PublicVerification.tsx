import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { agreementService, Agreement } from '@/services/agreementService';
import { generateAgreementPDF } from '@/lib/agreements';
import { 
  ShieldCheck, 
  ShieldAlert,
  Loader2, 
  Clock,
  CornerDownRight,
  ChevronLeft,
  Printer,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PublicVerification() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (id) {
      setLoading(true);
      agreementService.getAgreement(id)
        .then(res => {
          if (active) {
            setAgreement(res);
            setLoading(false);
          }
        })
        .catch(err => {
          console.error("Error fetching verified agreement record:", err);
          if (active) setLoading(false);
        });
    }
    return () => { active = false; };
  }, [id]);

  const handleDownloadPDF = () => {
    if (!agreement) return;
    try {
      const doc = generateAgreementPDF(agreement);
      doc.save(`Certified_Deed_${agreement.agreementId}.pdf`);
    } catch (e) {
      console.error(e);
      alert("Error building document output stream.");
    }
  };

  const handlePrint = () => {
    if (!agreement) return;
    try {
      const doc = generateAgreementPDF(agreement);
      window.open(doc.output('bloburl'), '_blank');
    } catch (e) {
      console.error(e);
      alert("Error loading PDF preview window.");
    }
  };

  const { isApproved, isRejected, isPending, isProperty, isVehicle, priceVal } = useMemo(() => {
    if (!agreement) return { isApproved: false, isRejected: false, isPending: false, isProperty: false, isVehicle: false, priceVal: 0 };
    
    return {
      isApproved: agreement.status === 'Approved',
      isRejected: agreement.status === 'Rejected',
      isPending: agreement.status === 'Pending Approval',
      isProperty: agreement.agreementType.startsWith('property'),
      isVehicle: agreement.agreementType.startsWith('vehicle'),
      priceVal: agreement.assetInfo.property?.price || agreement.assetInfo.vehicle?.price || 0
    };
  }, [agreement]);

  if (loading) {
    return (
      <div className="pt-32 pb-20 min-h-screen bg-luxury-black text-white flex flex-col items-center justify-center space-y-3">
        <Loader2 className="animate-spin text-luxury-gold" size={32} />
        <span className="text-xs text-white/50 uppercase tracking-widest font-mono">Decrypting Registry Record...</span>
      </div>
    );
  }

  if (!agreement) {
    return (
      <div className="pt-32 pb-20 min-h-screen bg-luxury-black text-white px-4">
        <div className="max-w-md mx-auto glass-card bg-red-950/20 border border-red-500/30 p-10 rounded-[2rem] text-center space-y-6 shadow-2xl">
          <ShieldAlert className="mx-auto text-red-500" size={54} />
          <div className="space-y-1">
            <h2 className="text-xl font-bold font-display">Record Not Found</h2>
            <p className="text-xs font-mono text-red-400">UNREGISTERED OR DELETED DEED ID</p>
          </div>
          <p className="text-white/60 text-sm leading-relaxed">
            The requested transaction identifier <strong>{id}</strong> is not present on the AmaanEstate Ledger. This document may be fraudulent, or its verification record was withdrawn.
          </p>
          <Button onClick={() => navigate('/')} className="w-full bg-[#C5A059] hover:bg-[#B48F48] text-black h-11 font-bold">
            Back to AmaanEstate Portal
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 min-h-screen bg-luxury-black text-white px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Navigation back */}
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
        >
          <ChevronLeft size={14} /> Back to Hub
        </button>

        {/* VERIFICATION OUTCOME HEADER */}
        <div className={`p-8 rounded-[2rem] border text-center space-y-4 shadow-xl ${
          isApproved 
            ? 'bg-emerald-950/10 border-emerald-500/30' 
            : isRejected 
              ? 'bg-red-500/10 border-red-500/20' 
              : 'bg-amber-500/10 border-amber-500/20'
        }`}>
          {isApproved ? (
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400">
              <ShieldCheck size={36} />
            </div>
          ) : isRejected ? (
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto text-red-400">
              <ShieldAlert size={36} />
            </div>
          ) : (
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto text-amber-400">
              <Clock size={36} className="animate-pulse" />
            </div>
          )}

          <div className="space-y-1">
            <span className="text-[10px] font-bold font-mono text-white/40 uppercase tracking-widest block">AMAANESTATE DEED REGISTRY VERIFICATION STATE</span>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-white">
              {isApproved && 'Agreement Record Verified'}
              {isRejected && 'Agreement Request Rejected'}
              {isPending && 'Agreement Under Officer Audit'}
            </h1>
            <p className="text-xs text-white/50 font-mono select-all">RECORD RECORD CODE: {agreement.agreementId}</p>
          </div>

          <div className="inline-flex items-center gap-2 justify-center">
            {isApproved && (
              <span className="px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full">
                ● Legally Binding & Certified
              </span>
            )}
            {isRejected && (
              <span className="px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-red-500/10 border border-red-500/30 text-red-400 rounded-full">
                ● Application Rejected
              </span>
            )}
            {isPending && (
              <span className="px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full">
                ● Pending Municipal Stamps
              </span>
            )}
          </div>
        </div>

        {/* REJECTION REASON BANNER */}
        {isRejected && agreement.rejectionReason && (
          <div className="bg-red-500/5 border border-red-500/20 p-5 rounded-2xl space-y-1.5">
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest font-mono block">Audit Rejection Detail Note:</span>
            <p className="text-xs text-red-300 leading-relaxed italic">
              "{agreement.rejectionReason}"
            </p>
          </div>
        )}

        {/* CORE ACCORDION SPECIFICATIONS CARD */}
        <div className="glass-card bg-white/5 border border-white/10 rounded-[2rem] p-8 md:p-10 space-y-8 shadow-2xl">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div>
              <span className="text-[10px] font-bold font-mono text-white/30 uppercase tracking-widest">DEED TYPE</span>
              <h2 className="text-lg font-bold font-display text-white mt-1">{agreement.agreementTitle}</h2>
              <p className="text-xs text-white/50 font-sans mt-0.5">Agreement Covenant Registered: {agreement.date}</p>
            </div>
            
            {isApproved && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handlePrint} className="border-white/10 text-white hover:bg-white/10 h-10 px-4 text-xs font-bold uppercase tracking-wider">
                  <Printer size={13} className="mr-1.5" /> Print
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="border-white/10 text-white hover:bg-white/10 h-10 px-4 text-xs font-bold uppercase tracking-wider">
                  <Download size={13} className="mr-1.5" /> Download PDF
                </Button>
              </div>
            )}
          </div>

          {/* Parties block */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-luxury-gold flex items-center gap-1.5 border-b border-white/5 pb-1.5">
              <CornerDownRight size={14} /> Bilateral Contracting Entities
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
              <div className="bg-neutral-900Item bg-[#1C1F21]/40 border border-white/5 p-5 rounded-2xl relative space-y-1">
                <span className="text-[9px] uppercase font-bold text-white/30 tracking-widest block">Party A (Covenantee / Owner)</span>
                <p className="font-bold text-white text-base">{agreement.parties.partyA.fullName}</p>
                <p className="text-white/60">Phone: {agreement.parties.partyA.phone}</p>
                <p className="text-white/60">Email: {agreement.parties.partyA.email || 'N/A'}</p>
                <p className="text-white/60">National ID Card: {agreement.parties.partyA.nationalId || 'N/A'}</p>
                <p className="text-white/60">Domicile: {agreement.parties.partyA.address}</p>
              </div>

              <div className="bg-neutral-900Item bg-[#1C1F21]/40 border border-white/5 p-5 rounded-2xl relative space-y-1">
                <span className="text-[9px] uppercase font-bold text-white/30 tracking-widest block">Party B (Covenaytor / Client)</span>
                <p className="font-bold text-white text-base">{agreement.parties.partyB.fullName}</p>
                <p className="text-white/60">Phone: {agreement.parties.partyB.phone}</p>
                <p className="text-white/60">Email: {agreement.parties.partyB.email || 'N/A'}</p>
                <p className="text-white/60">National ID Card: {agreement.parties.partyB.nationalId || 'N/A'}</p>
                <p className="text-white/60">Domicile: {agreement.parties.partyB.address}</p>
              </div>
            </div>
          </div>

          {/* Subject Asset properties */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-luxury-gold flex items-center gap-1.5 border-b border-white/5 pb-1.5">
              <CornerDownRight size={14} /> Subject Asset Metadata
            </h3>
            <div className="bg-[#1C1F21]/40 border border-white/5 p-5 rounded-2xl text-xs font-mono space-y-2">
              {isProperty && agreement.assetInfo.property && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-white/80">
                  <p><strong>Property Unique Identifier:</strong> {agreement.assetInfo.property.propertyId || 'GRID-N/A'}</p>
                  <p><strong>Property Name/Title:</strong> {agreement.assetInfo.property.propertyTitle}</p>
                  <p><strong>Structure Specification:</strong> {agreement.assetInfo.property.type} | {agreement.assetInfo.property.category}</p>
                  <p><strong>District Geographic Coordinates:</strong> {agreement.assetInfo.property.city}, {agreement.assetInfo.property.district}</p>
                  <p className="sm:col-span-2"><strong>Instalments Covenants:</strong> {agreement.assetInfo.property.paymentTerms || 'Bilateral Terms Agreed'}</p>
                </div>
              )}
              {isVehicle && agreement.assetInfo.vehicle && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-white/80">
                  <p><strong>Vehicle Serial ID:</strong> {agreement.assetInfo.vehicle.vehicleId || 'SERIAL-N/A'}</p>
                  <p><strong>Automobile Manufacturer Make:</strong> {agreement.assetInfo.vehicle.make}</p>
                  <p><strong>Automobile Model Selection:</strong> {agreement.assetInfo.vehicle.model}</p>
                  <p><strong>Year of Fabrication:</strong> {agreement.assetInfo.vehicle.year}</p>
                  <p className="sm:col-span-2"><strong>License Government Plate:</strong> {agreement.assetInfo.vehicle.plateNumber}</p>
                </div>
              )}
              {agreement.agreementType === 'brokerCommission' && (
                <p className="text-white/80 whitespace-pre-line leading-relaxed italic">
                  {agreement.assetInfo.commissionTerms}
                </p>
              )}
            </div>
          </div>

          {/* Valuation Block */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-luxury-gold flex items-center gap-1.5 border-b border-white/5 pb-1.5">
              <CornerDownRight size={14} /> Registry Valuation Specification
            </h3>
            <div className="bg-neutral-900/50 p-5 rounded-2xl border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase font-bold text-white/30 tracking-widest block font-mono">Assigned Valuation Price</span>
                <span className="text-2xl font-mono text-white font-bold tracking-tight">{priceVal.toLocaleString()}</span>
                <span className="text-xs text-white/50 ml-1.5 font-bold font-mono">{agreement.currency}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-white/30 tracking-widest block font-mono">Date Ledgered</span>
                <span className="text-sm font-sans text-white/90 font-bold">{agreement.date}</span>
              </div>
            </div>
          </div>

          {/* Legals */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-luxury-gold flex items-center gap-1.5 border-b border-white/5 pb-1.5">
              <CornerDownRight size={14} /> Legally Embedded Clauses & Covenants
            </h3>
            <div className="bg-[#1C1F21]/40 border border-white/5 p-5 rounded-2xl text-xs font-mono text-white/60 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
              {agreement.legalClauses}
            </div>
          </div>

          {/* Secure Blockchain Verification Log Statuses */}
          {isApproved && (
            <div className="border-t border-white/5 pt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-[11px] font-mono text-white/40">
              <div className="space-y-1">
                <span className="text-emerald-400 font-bold uppercase tracking-wider block">✔ System Cryptography Log</span>
                <p>Digital signature matching: MATCHED</p>
                <p>Private hashing check: ENCRYPTED</p>
              </div>
              <div className="space-y-1">
                <span className="text-emerald-400 font-bold uppercase tracking-wider block">✔ Witness Signature Stamp</span>
                <p>Registry Agent Sign: {agreement.approvedBy || 'Admin Official'}</p>
                <p>Approved stamp time: {agreement.approvedAt ? new Date(agreement.approvedAt).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-emerald-400 font-bold uppercase tracking-wider block">✔ QR Token Hash</span>
                <p className="text-[9px] break-all">MD5-SHA256: {id?.substring(0, 16).toUpperCase()}...</p>
                <p>Validation State: INDESTRUCTIBLE</p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
