import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Bed, Bath, Square, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';

export default function Properties() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [filterType, setFilterType] = useState(searchParams.get('type') || 'all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'properties'), where('status', '==', 'published'));
        const snap = await getDocs(q);
        setProperties(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const filteredProperties = properties.filter(p => {
    const typeMatch = filterType === 'all' || p.listingType === filterType;
    const searchMatch = p.title.toLowerCase().includes(search.toLowerCase()) || p.city.toLowerCase().includes(search.toLowerCase());
    return typeMatch && searchMatch;
  });

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <h1 className="text-4xl font-bold mb-8">Properties</h1>
      
      <div className="flex flex-col md:flex-row gap-4 mb-8">
         <div className="flex-1">
           <Input placeholder="Search by title or city..." onChange={(e) => setSearch(e.target.value)} />
         </div>
         <select className="p-2 border rounded" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All Types</option>
            <option value="sale">For Sale</option>
            <option value="rent">For Rent</option>
         </select>
      </div>
      
      {loading ? (
         <p>Loading properties...</p>
      ) : filteredProperties.length === 0 ? (
         <div className="bg-gray-50 border p-12 text-center rounded-2xl">
            <h2 className="text-2xl font-bold mb-2">No Properties Found</h2>
            <p className="text-gray-500">Try adjusting your filters.</p>
         </div>
      ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map(property => (
               <Link to={`/properties/${property.id}`} key={property.id}>
                  <Card className="overflow-hidden border-0 shadow-lg group cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl h-full flex flex-col">
                     <div className="aspect-video bg-gray-200 relative overflow-hidden shrink-0">
                        <img 
                           src={property.images?.[0] || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80"} 
                           alt={property.title} 
                           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute top-4 left-4 bg-amber-500 text-white px-3 py-1 rounded text-sm font-bold uppercase tracking-wider shadow-md">
                           For {property.listingType}
                        </div>
                        <div className="absolute bottom-4 right-4 bg-black/80 text-white px-3 py-1 rounded-sm text-lg font-bold backdrop-blur shadow-md">
                           {property.price.toLocaleString()} ETB
                        </div>
                     </div>
                     <CardContent className="p-6 flex-1 flex flex-col">
                        <h3 className="text-xl font-bold mb-2 line-clamp-1">{property.title}</h3>
                        <p className="text-gray-500 flex items-center gap-2 mb-4 text-sm">
                           <MapPin size={16} className="text-amber-500 shrink-0" /> <span className="truncate">{property.location}, {property.city}</span>
                        </p>
                        
                        <div className="mt-auto flex items-center justify-between border-t pt-4 text-gray-500 text-sm">
                           <span className="flex items-center gap-2"><Bed size={16} /> {property.bedrooms}</span>
                           <span className="flex items-center gap-2"><Bath size={16} /> {property.bathrooms}</span>
                           <span className="flex items-center gap-2"><Square size={16} /> {property.area} m²</span>
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
