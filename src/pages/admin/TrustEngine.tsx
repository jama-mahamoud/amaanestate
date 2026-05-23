import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Listing } from '@/types';
import { Loader2, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function TrustEngine() {
  const [properties, setProperties] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Listing));
      setProperties(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Trust Intelligence Engine</h1>
      
      {loading ? (
        <div className="flex justify-center py-24">
            <Loader2 className="animate-spin text-luxury-gold" size={40} />
        </div>
      ) : (
        <div className="grid gap-4">
          {properties.map(prop => (
            <div key={prop.id} className="p-6 bg-white/5 rounded-xl border border-white/10 flex justify-between items-center">
              <div>
                <h3 className="font-bold">{prop.title}</h3>
                <p className="text-sm text-white/60">Score: {prop.trustScore || 0}% | Risk: {prop.riskLevel || 'N/A'}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${prop.riskLevel === 'HIGH' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                {prop.riskLevel || 'N/A'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
