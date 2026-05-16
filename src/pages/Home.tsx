import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home as HomeIcon, Car, Building, ArrowRight, ShieldCheck, MapPin, Search, Bed, Bath, Square } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { db } from '../lib/firebase';
import { collection, query, where, limit, getDocs, orderBy } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  const [featuredProperties, setFeaturedProperties] = useState<any[]>([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const q = query(
          collection(db, 'properties'), 
          where('status', '==', 'published'),
          orderBy('createdAt', 'desc'),
          limit(3)
        );
        const snap = await getDocs(q);
        setFeaturedProperties(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Error fetching featured", err);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-black">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
        </div>
        
        <div className="container relative z-10 mx-auto px-4 text-center max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight drop-shadow-lg">
            Find Your <span className="text-amber-500">Premium</span> Property in the Somali Region
          </h1>
          <p className="text-xl text-gray-200 mb-10 max-w-2xl mx-auto drop-shadow-md font-medium">
            Discover luxury homes, commercial spaces, and premium vehicles in Jigjiga, Dire Dawa, and beyond.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center mb-12">
            <Link to="/properties?type=rent">
              <Button size="lg" className="bg-white text-black hover:bg-amber-500 hover:text-white transition-all text-lg h-14 px-8">
                Properties for Rent
              </Button>
            </Link>
            <Link to="/properties?type=sale">
              <Button size="lg" className="bg-amber-500 hover:bg-black text-white transition-all text-lg h-14 px-8">
                Properties for Sale
              </Button>
            </Link>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-2xl flex flex-col md:flex-row gap-4 max-w-3xl mx-auto">
            <div className="flex-1 flex items-center gap-2 border-b md:border-b-0 md:border-r pb-2 md:pb-0 px-2 text-black">
               <MapPin className="text-amber-500 shrink-0" />
               <select className="w-full bg-transparent outline-none text-gray-700 appearance-none font-medium text-lg">
                  <option value="">Select City</option>
                  <option value="Jigjiga">Jigjiga</option>
                  <option value="Dire Dawa">Dire Dawa</option>
                  <option value="Godey">Godey</option>
                  <option value="Dhagahbur">Dhagahbur</option>
                  <option value="Kabridahar">Kabridahar</option>
               </select>
            </div>
            <Link to="/properties" className="w-full md:w-auto">
               <Button size="lg" className="bg-amber-500 hover:bg-black text-white w-full transition-all text-lg h-14 px-8">
                 Search Now
               </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      {featuredProperties.length > 0 && (
         <section className="py-24 bg-white">
           <div className="container mx-auto px-4 max-w-7xl">
             <div className="flex justify-between items-end mb-12 border-b pb-4">
               <div>
                 <h2 className="text-3xl md:text-4xl font-bold text-black mb-2">Featured Listings</h2>
                 <p className="text-gray-500">Handpicked properties available right now.</p>
               </div>
               <Link to="/properties" className="text-amber-500 font-bold hover:text-black hidden md:flex items-center gap-2">
                 View All <ArrowRight size={16} />
               </Link>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredProperties.map(property => (
                   <Link to={`/properties/${property.id}`} key={property.id}>
                      <Card className="overflow-hidden border-0 shadow-lg group cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl h-full flex flex-col">
                         <div className="h-64 bg-gray-200 relative overflow-hidden shrink-0">
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
             
             <div className="mt-8 text-center md:hidden">
               <Link to="/properties">
                  <Button variant="outline" className="w-full border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white">
                    View All Properties
                  </Button>
               </Link>
             </div>
           </div>
         </section>
      )}

      {/* Services Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">Our Premium Services</h2>
            <div className="w-24 h-1 bg-amber-500 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all group">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                <HomeIcon size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4">House Rentals</h3>
              <p className="text-gray-600 mb-6">Find the perfect luxury apartment or comfortable home for you and your family in prime locations.</p>
              <Link to="/properties?type=rent" className="flex items-center text-amber-600 font-semibold hover:text-black transition-colors">
                Explore Rentals <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all group">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                <Building size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Property Sales</h3>
              <p className="text-gray-600 mb-6">Invest in premium commercial and residential real estate with complete transparency and trust.</p>
              <Link to="/properties?type=sale" className="flex items-center text-amber-600 font-semibold hover:text-black transition-colors">
                View Properties <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all group">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                <Car size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Vehicle Services</h3>
              <p className="text-gray-600 mb-6">Buy, sell, or rent high-quality vehicles. We connect buyers and sellers securely.</p>
              <Link to="/vehicles" className="flex items-center text-amber-600 font-semibold hover:text-black transition-colors">
                Browse Vehicles <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 bg-black text-white relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <h2 className="text-4xl font-bold mb-6">Why Choose AmaanEstate?</h2>
              <div className="w-20 h-1 bg-amber-500 mb-8"></div>
              <p className="text-gray-300 mb-8 text-lg">
                We are the leading real estate and vehicle brokerage platform in the Somali Region. Our verified network of brokers guarantees security and quality for every transaction.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <ShieldCheck className="text-amber-500" />
                  <span className="text-lg">Verified Agents & Brokers</span>
                </li>
                <li className="flex items-center gap-3">
                  <ShieldCheck className="text-amber-500" />
                  <span className="text-lg">Secure & Transparent Transactions</span>
                </li>
                <li className="flex items-center gap-3">
                  <ShieldCheck className="text-amber-500" />
                  <span className="text-lg">Extensive Local Market Knowledge</span>
                </li>
              </ul>
            </div>
            <div className="flex-1">
              {/* Abstract decorative element representing trust/security */}
              <div className="relative rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
                 <img src="https://images.unsplash.com/photo-1626178793926-22b28830aa30?auto=format&fit=crop&q=80" alt="Modern Architecture" className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-8">
                   <div className="bg-amber-500 text-white font-bold py-2 px-4 rounded">
                     Certified Properties
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
