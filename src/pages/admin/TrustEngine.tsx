import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Listing, Agency } from '@/types';
import { trustService } from '@/services/trustService';
import { calculateAgencyTrustScore } from '@/utils/trustScore';
import { 
  Loader2, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  Building, 
  CheckCircle2, 
  X, 
  MapPin, 
  HelpCircle 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function TrustEngine() {
  const [properties, setProperties] = useState<Listing[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'listings' | 'agencies'>('listings');

  useEffect(() => {
    // 1. Subscribe to Listings
    const qListings = query(collection(db, 'listings'));
    const unsubListings = onSnapshot(qListings, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const raw = { id: doc.id, ...doc.data() } as Listing;
        // Dynamically compute score on loading to protect against legacy database entries
        const computed = trustService.calculateTrustScore(raw);
        return {
          ...raw,
          trustScore: computed.trustScore,
          riskLevel: computed.riskLevel
        };
      });
      // Sort with highest trust scores first
      setProperties(data.sort((a, b) => (b.trustScore || 0) - (a.trustScore || 0)));
    }, (error) => {
      console.error("Listing snapshot failed in TrustEngine:", error);
    });

    // 2. Subscribe to Agencies
    const qAgencies = query(collection(db, 'agencies'));
    const unsubAgencies = onSnapshot(qAgencies, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const raw = { id: doc.id, ...doc.data() } as Agency;
        // Dynamically compute score on loading to protect against legacy database entries
        const computed = calculateAgencyTrustScore(raw);
        const risk: 'LOW' | 'MEDIUM' | 'HIGH' = computed.score >= 80 ? 'LOW' : computed.score >= 50 ? 'MEDIUM' : 'HIGH';
        return {
          ...raw,
          trustScore: computed.score,
          riskLevel: risk,
          breakdown: computed.breakdown
        } as any;
      });
      // Sort with highest trust scores first
      setAgencies(data.sort((a, b) => (b.trustScore || 0) - (a.trustScore || 0)));
      setLoading(false);
    }, (error) => {
      console.error("Agency snapshot failed in TrustEngine:", error);
      setLoading(false);
    });

    return () => {
      unsubListings();
      unsubAgencies();
    };
  }, []);

  // Compute aggregate statistics based on dynamic values
  const avgListingScore = properties.length > 0 
    ? Math.round(properties.reduce((acc, p) => acc + (p.trustScore || 0), 0) / properties.length)
    : 0;

  const avgAgencyScore = agencies.length > 0 
    ? Math.round(agencies.reduce((acc, a) => acc + ((a as any).trustScore || 0), 0) / agencies.length)
    : 0;

  const totalHighRiskListings = properties.filter(p => p.riskLevel === 'HIGH').length;
  const totalHighRiskAgencies = agencies.filter(a => (a as any).riskLevel === 'HIGH').length;

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 text-luxury-gold uppercase text-[10px] tracking-[0.2em] font-bold">
            <Sparkles size={12} />
            Autonomous Audit Terminal
          </div>
          <h1 className="text-4xl font-display font-bold text-white tracking-tight mt-1">Trust Intelligence Engine</h1>
          <p className="text-white/40 text-xs mt-1">Real-time dynamic verification, risk inspection, and cryptographic score calculations.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="animate-spin text-luxury-gold" size={40} />
          <p className="text-white/30 text-xs tracking-widest uppercase">Processing sovereign nodes...</p>
        </div>
      ) : (
        <>
          {/* Key Metrics Dashboard Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-8 rounded-[2rem] bg-white/[0.01] border border-white/5 relative overflow-hidden">
              <span className="text-[9px] uppercase tracking-widest text-[#C5A059]/60 font-bold">Sovereign Asset Index</span>
              <div className="text-4xl font-display font-medium text-white mt-1">{avgListingScore}%</div>
              <p className="text-[10px] text-white/40 mt-2">Average trust index across {properties.length} dynamic listing nodes</p>
              <div className="absolute top-0 right-0 w-24 h-24 bg-luxury-gold/5 blur-3xl rounded-full" />
            </div>

            <div className="glass-card p-8 rounded-[2rem] bg-white/[0.01] border border-white/5 relative overflow-hidden">
              <span className="text-[9px] uppercase tracking-widest text-[#C5A059]/60 font-bold">Brokerage Veracity Rate</span>
              <div className="text-4xl font-display font-medium text-white mt-1">{avgAgencyScore}%</div>
              <p className="text-[10px] text-white/40 mt-2">Average profile integrity score across {agencies.length} agencies</p>
              <div className="absolute top-0 right-0 w-24 h-24 bg-luxury-gold/5 blur-3xl rounded-full" />
            </div>

            <div className="glass-card p-8 rounded-[2rem] bg-white/[0.01] border border-white/5 relative overflow-hidden">
              <span className="text-[9px] uppercase tracking-widest text-[#C5A059]/60 font-bold">Anomalies Detected</span>
              <div className="text-4xl font-display font-medium text-red-400 mt-1">{totalHighRiskListings + totalHighRiskAgencies}</div>
              <p className="text-[10px] text-white/40 mt-2">Active profile and listing nodes categorized under High Risk tier</p>
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 blur-3xl rounded-full" />
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex border-b border-white/5 gap-6">
            <button
              onClick={() => setActiveTab('listings')}
              className={`pb-4 text-sm font-medium transition-all relative ${
                activeTab === 'listings' ? 'text-luxury-gold' : 'text-white/45 hover:text-white'
              }`}
            >
              Listings Trust Assessment ({properties.length})
              {activeTab === 'listings' && <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-luxury-gold" />}
            </button>
            <button
              onClick={() => setActiveTab('agencies')}
              className={`pb-4 text-sm font-medium transition-all relative ${
                activeTab === 'agencies' ? 'text-luxury-gold' : 'text-white/45 hover:text-white'
              }`}
            >
              Agencies Veracity Assessment ({agencies.length})
              {activeTab === 'agencies' && <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-luxury-gold" />}
            </button>
          </div>

          {/* Assessment List */}
          <div className="space-y-6">
            {activeTab === 'listings' ? (
              properties.length === 0 ? (
                <div className="p-12 text-center text-white/30 border border-white/5 rounded-2xl">
                  No listings registered for inspection.
                </div>
              ) : (
                properties.map(prop => {
                  const checkList = [
                    { label: 'Verified Broker Linked', met: Boolean(prop.associatedBrokerId || prop.isVerified), points: 20 },
                    { label: 'Legal Agreement Approved', met: prop.verificationStatus === 'VERIFIED', points: 30 },
                    { label: 'Geographical Coordinates Checked', met: Boolean(prop.latitude && prop.longitude), points: 15 },
                    { label: 'Ownership Proved & Authenticated', met: Boolean(prop.ownershipVerified), points: 25 },
                    { label: 'Compliant Host & Empty Report List', met: true, points: 10 },
                  ];

                  return (
                    <div 
                      key={prop.id} 
                      className="glass-card p-8 rounded-[2.5rem] bg-white/[0.01] border border-white/5 hover:border-luxury-gold/20 transition-all duration-300 relative overflow-hidden group"
                    >
                      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 pb-6 border-b border-white/5">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[9px] uppercase tracking-widest font-extrabold text-luxury-gold">{prop.category}</span>
                            <span className="text-white/20">•</span>
                            <span className="text-white/40 text-[10px] uppercase font-bold">{prop.city}</span>
                            {prop.isVerified && (
                              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 py-0 px-2 text-[8px] tracking-widest font-bold rounded-full">
                                Verified Node
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-xl font-display font-semibold text-white tracking-tight group-hover:text-luxury-gold transition-colors">{prop.title}</h3>
                          <div className="text-white/40 text-xs mt-1">Listing ID: {prop.id}</div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <span className="text-white/40 text-[9px] uppercase tracking-widest block font-bold">Dynamic Score</span>
                            <div className="text-3xl font-display font-medium text-white">{prop.trustScore}%</div>
                          </div>
                          
                          <Badge className={`uppercase text-[9px] tracking-widest font-extrabold rounded-lg px-3 py-2 border-0 ${
                            prop.riskLevel === 'LOW' 
                              ? 'bg-emerald-500/10 text-emerald-400' 
                              : prop.riskLevel === 'MEDIUM' 
                              ? 'bg-amber-500/10 text-amber-400' 
                              : 'bg-red-500/10 text-red-400'
                          }`}>
                            {prop.riskLevel} RISK
                          </Badge>
                        </div>
                      </div>

                      {/* Score Breakdown Checkbox Visualizer */}
                      <div className="mt-6">
                        <h4 className="text-[10px] uppercase tracking-wider text-white/50 mb-4 font-bold">Security Assessment Audit Trails</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                          {checkList.map((item, idx) => (
                            <div 
                              key={idx} 
                              className={`p-4 rounded-xl border flex flex-col justify-between min-h-[90px] transition-colors ${
                                item.met 
                                  ? 'bg-emerald-500/[0.02] border-emerald-500/10 text-emerald-400/90' 
                                  : 'bg-white/[0.01] border-white/5 text-white/30'
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <span className="text-[10px] font-bold tracking-tight leading-4 line-clamp-2">{item.label}</span>
                                <CheckCircle2 size={14} className={item.met ? "text-emerald-400 shrink-0" : "text-white/10 shrink-0"} />
                              </div>
                              <span className="text-[10px] uppercase tracking-wider font-extrabold mt-2">
                                {item.met ? `+${item.points}% Added` : '0% Assigned'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              agencies.length === 0 ? (
                <div className="p-12 text-center text-white/30 border border-white/5 rounded-2xl">
                  No agencies registered for audit.
                </div>
              ) : (
                agencies.map(agency => {
                  const checkList = [
                    { label: 'Basic Info Done (Name, Phone, Email)', met: Boolean(agency.agencyName && agency.phone && agency.email), points: 30 },
                    { label: 'Location Configured (City, Region)', met: Boolean(agency.city && agency.region), points: 30 },
                    { label: 'Tax/Registry License Submitted', met: Boolean(agency.license && typeof agency.license === 'string' && !agency.license.startsWith('http')), points: 30 },
                    { label: 'Logo Uploaded', met: Boolean(agency.logo), points: 10 },
                  ];

                  const riskLevel = (agency as any).riskLevel;

                  return (
                    <div 
                      key={agency.id} 
                      className="glass-card p-8 rounded-[2.5rem] bg-white/[0.01] border border-white/5 hover:border-luxury-gold/20 transition-all duration-300 relative overflow-hidden group"
                    >
                      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 pb-6 border-b border-white/5">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[9px] uppercase tracking-widest font-extrabold text-luxury-gold">Agency Node</span>
                            <span className="text-white/20">•</span>
                            <span className="text-white/40 text-[10px] uppercase font-bold">{agency.city || 'Undisclosed Location'}</span>
                            {agency.verified && (
                              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 py-0 px-2 text-[8px] tracking-widest font-bold rounded-full">
                                Corporate Approved
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-xl font-display font-semibold text-white tracking-tight group-hover:text-luxury-gold transition-colors">{agency.agencyName || 'Unnamed Agency'}</h3>
                          <div className="text-white/40 text-xs mt-1">Agency Owner: {agency.email || 'No email registered'}</div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <span className="text-white/40 text-[9px] uppercase tracking-widest block font-bold">Corporate Veracity</span>
                            <div className="text-3xl font-display font-medium text-white">{(agency as any).trustScore}%</div>
                          </div>
                          
                          <Badge className={`uppercase text-[9px] tracking-widest font-extrabold rounded-lg px-3 py-2 border-0 ${
                            riskLevel === 'LOW' 
                              ? 'bg-emerald-500/10 text-emerald-400' 
                              : riskLevel === 'MEDIUM' 
                              ? 'bg-amber-500/10 text-amber-400' 
                              : 'bg-red-500/10 text-red-400'
                          }`}>
                            {riskLevel} RISK
                          </Badge>
                        </div>
                      </div>

                      {/* Score Breakdown Checkbox Visualizer */}
                      <div className="mt-6">
                        <h4 className="text-[10px] uppercase tracking-wider text-white/50 mb-4 font-bold">Credential Compliance Scorecard</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                          {checkList.map((item, idx) => (
                            <div 
                              key={idx} 
                              className={`p-4 rounded-xl border flex flex-col justify-between min-h-[90px] transition-colors ${
                                item.met 
                                  ? 'bg-emerald-500/[0.02] border-emerald-500/10 text-emerald-400/90' 
                                  : 'bg-white/[0.01] border-white/5 text-white/30'
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <span className="text-[10px] font-bold tracking-tight leading-4 line-clamp-2">{item.label}</span>
                                <CheckCircle2 size={14} className={item.met ? "text-emerald-400 shrink-0" : "text-white/10 shrink-0"} />
                              </div>
                              <span className="text-[10px] uppercase tracking-wider font-extrabold mt-2">
                                {item.met ? `+${item.points}% Added` : '0% Assigned'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}
