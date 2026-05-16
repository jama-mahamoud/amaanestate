import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Bed, Bath, Square, MapPin, Phone, MessageCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function PropertyDetails() {
  const { id } = useParams();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [inquiry, setInquiry] = useState({ name: '', phone: '', message: '' });

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'properties', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProperty({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error("Error fetching", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const handleInquiry = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'inquiries'), {
         ...inquiry,
         propertyId: id,
         propertyTitle: property.title,
         agentId: property.agentId,
         status: 'new',
         createdAt: serverTimestamp()
      });
      toast.success('Inquiry sent successfully. We will contact you soon.');
      setInquiry({ name: '', phone: '', message: '' });
    } catch(err) {
      toast.error('Failed to send inquiry.');
    }
  };

  if (loading) return <div className="container mx-auto py-12 text-center">Loading property...</div>;
  if (!property) return <div className="container mx-auto py-12 text-center text-red-500">Property not found.</div>;

  const whatsappLink = `https://wa.me/251900000000?text=I'm interested in the property: ${property.title}`;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
       <Link to="/properties" className="text-amber-500 hover:text-black mb-6 inline-block font-medium">&larr; Back to Properties</Link>
       
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
             <div className="w-full h-96 bg-gray-200 rounded-2xl overflow-hidden relative shadow-lg">
                <img 
                  src={property.images?.[0] || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80"} 
                  alt={property.title} 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute top-6 left-6 bg-amber-500 text-white px-4 py-2 rounded text-sm font-bold uppercase tracking-wider shadow-md">
                   For {property.listingType}
                </div>
                <div className="absolute bottom-6 right-6 bg-black/80 text-white px-6 py-2 rounded-sm text-2xl font-bold backdrop-blur shadow-md">
                   {property.price.toLocaleString()} ETB
                </div>
             </div>

             <div>
                <h1 className="text-4xl font-bold mb-4">{property.title}</h1>
                <p className="text-gray-500 flex items-center gap-2 text-lg">
                   <MapPin className="text-amber-500" /> {property.location}, {property.city}
                </p>
             </div>

             <div className="flex flex-wrap items-center gap-8 py-6 border-y border-gray-100">
                <div className="flex items-center gap-3">
                   <div className="bg-amber-50 p-3 rounded-full text-amber-500"><Bed size={24} /></div>
                   <div><div className="font-bold text-xl">{property.bedrooms}</div><div className="text-sm text-gray-500">Bedrooms</div></div>
                </div>
                <div className="flex items-center gap-3">
                   <div className="bg-amber-50 p-3 rounded-full text-amber-500"><Bath size={24} /></div>
                   <div><div className="font-bold text-xl">{property.bathrooms}</div><div className="text-sm text-gray-500">Bathrooms</div></div>
                </div>
                <div className="flex items-center gap-3">
                   <div className="bg-amber-50 p-3 rounded-full text-amber-500"><Square size={24} /></div>
                   <div><div className="font-bold text-xl">{property.area}</div><div className="text-sm text-gray-500">Area m²</div></div>
                </div>
             </div>

             <div>
                <h2 className="text-2xl font-bold mb-4">Description</h2>
                <div className="prose max-w-none text-gray-600">
                   <p className="whitespace-pre-wrap">{property.description}</p>
                </div>
             </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
             <div className="bg-gray-50 p-6 rounded-2xl border">
                <h3 className="text-xl font-bold mb-4">Interested in this property?</h3>
                <div className="flex flex-col gap-3 mb-6">
                   <a href={whatsappLink} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1DA851] text-white py-3 rounded-lg font-bold transition-colors">
                      <MessageCircle size={20} /> WhatsApp Us
                   </a>
                   <a href="tel:+251900000000" className="flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white py-3 rounded-lg font-bold transition-colors">
                      <Phone size={20} /> Call Agent
                   </a>
                </div>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
                  <div className="relative flex justify-center"><span className="bg-gray-50 px-4 text-sm text-gray-500">Or send an inquiry</span></div>
                </div>

                <form onSubmit={handleInquiry} className="space-y-4">
                   <Input required placeholder="Your Name" value={inquiry.name} onChange={e => setInquiry({...inquiry, name: e.target.value})} />
                   <Input required placeholder="Your Phone" type="tel" value={inquiry.phone} onChange={e => setInquiry({...inquiry, phone: e.target.value})} />
                   <Textarea required placeholder="I would like to inquire about..." className="h-32" value={inquiry.message} onChange={e => setInquiry({...inquiry, message: e.target.value})} />
                   <Button type="submit" className="w-full bg-amber-500 hover:bg-black text-white">Send Inquiry</Button>
                </form>
             </div>
          </div>
       </div>
    </div>
  );
}