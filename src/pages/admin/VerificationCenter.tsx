import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Listing } from '@/types';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function VerificationCenter() {
  const [properties, setProperties] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'listings'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Listing));
      setProperties(data.filter(p => !p.verificationStatus || p.verificationStatus === 'PENDING'));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleAction = async (id: string, status: 'VERIFIED' | 'REJECTED') => {
    await updateDoc(doc(db, 'listings', id), { verificationStatus: status });
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">Verification Center</h1>
      {loading ? (
          <Loader2 className="animate-spin text-luxury-gold" size={40} />
      ) : (
        <div className="grid gap-4">
            {properties.map(p => (
              <div key={p.id} className="p-6 bg-white/5 rounded-xl border border-white/10 flex justify-between items-center">
                <h3 className="font-bold text-white">{p.title}</h3>
                <div className='flex gap-2'>
                  <button onClick={() => handleAction(p.id, 'VERIFIED')} className='p-2 bg-green-500/10 rounded-full'><CheckCircle size={20} className='text-green-500'/></button>
                  <button onClick={() => handleAction(p.id, 'REJECTED')} className='p-2 bg-red-500/10 rounded-full'><XCircle size={20} className='text-red-500'/></button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
