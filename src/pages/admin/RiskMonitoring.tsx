import { useEffect, useState } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Listing } from '@/types';
import { Loader2 } from 'lucide-react';
import { trustService } from '@/services/trustService';

export default function RiskMonitoring() {
  const [properties, setProperties] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'listings'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const raw = { id: doc.id, ...doc.data() } as Listing;
        const computed = trustService.calculateTrustScore(raw);
        return {
          ...raw,
          trustScore: computed.trustScore,
          riskLevel: computed.riskLevel,
        };
      });
      setProperties(data.filter(p => p.riskLevel === 'HIGH'));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">Risk Monitoring</h1>
      {loading ? (
        <Loader2 className="animate-spin text-luxury-gold" size={40} />
      ) : properties.length === 0 ? (
        <p className="text-white/60">No high risk listings found.</p>
      ) : (
        <div className="grid gap-4">
            {properties.map(p => (
              <div key={p.id} className="p-6 bg-red-500/10 rounded-xl border border-red-500/20">
                <h3 className="font-bold text-white">{p.title}</h3>
                <p className="text-red-400 font-bold mt-1">Risk: {p.riskLevel}</p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
