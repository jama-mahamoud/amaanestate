import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Calendar, Gauge } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'vehicles'), where('status', '==', 'published'));
        const snap = await getDocs(q);
        setVehicles(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <h1 className="text-4xl font-bold mb-8">Vehicles</h1>
      
      {loading ? (
         <p>Loading vehicles...</p>
      ) : vehicles.length === 0 ? (
         <div className="bg-gray-50 border p-12 text-center rounded-2xl">
            <h2 className="text-2xl font-bold mb-2">No Vehicles Found</h2>
            <p className="text-gray-500">There are currently no published vehicles. Please check back later.</p>
         </div>
      ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vehicles.map(vehicle => (
               <Link to={`/vehicles/${vehicle.id}`} key={vehicle.id}>
                  <Card className="overflow-hidden border-0 shadow-lg group cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl h-full flex flex-col">
                     <div className="h-64 bg-gray-200 relative overflow-hidden shrink-0">
                        <img 
                           src={vehicle.images?.[0] || "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80"} 
                           alt={vehicle.title} 
                           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute top-4 left-4 bg-amber-500 text-white px-3 py-1 rounded text-sm font-bold uppercase tracking-wider shadow-md">
                           For {vehicle.listingType}
                        </div>
                        <div className="absolute bottom-4 right-4 bg-black/80 text-white px-3 py-1 rounded-sm text-lg font-bold backdrop-blur shadow-md">
                           {vehicle.price.toLocaleString()} ETB
                        </div>
                     </div>
                     <CardContent className="p-6 flex-1 flex flex-col">
                        <h3 className="text-xl font-bold mb-2 line-clamp-1">{vehicle.title}</h3>
                        <p className="text-gray-500 flex items-center gap-2 mb-4 text-sm">
                           <MapPin size={16} className="text-amber-500 shrink-0" /> <span className="truncate">{vehicle.city}</span>
                        </p>
                        
                        <div className="mt-auto flex items-center justify-between border-t pt-4 text-gray-500 text-sm">
                           <span className="flex items-center gap-2"><Calendar size={16} /> {vehicle.year}</span>
                           <span className="flex items-center gap-2"><Gauge size={16} /> {vehicle.make}</span>
                           <span className="flex items-center gap-2 truncate font-medium">{vehicle.model}</span>
                        </div>
                     </CardContent>
                  </Card>
               </Link>
            ))}
         </div>
      )}
    </div>
  );
}