import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home as HomeIcon, Car, Building, ArrowRight, ShieldCheck, MapPin, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-black">
          {/* Use a placeholder for the hero image for now */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
        </div>
        
        <div className="container relative z-10 mx-auto px-4 text-center max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight drop-shadow-lg">
            Find Your <span className="text-amber-500">Premium</span> Property in the Somali Region
          </h1>
          <p className="text-xl text-gray-200 mb-10 max-w-2xl mx-auto drop-shadow-md font-medium">
            Discover luxury homes, commercial spaces, and premium vehicles in Jigjiga, Dire Dawa, and beyond.
          </p>
          
          {/* Quick Search */}
          <div className="bg-white p-4 rounded-xl shadow-2xl flex flex-col md:flex-row gap-4 max-w-3xl mx-auto">
            <div className="flex-1 flex items-center gap-2 border-b md:border-b-0 md:border-r pb-2 md:pb-0 px-2">
               <MapPin className="text-amber-500" />
               <select className="w-full bg-transparent outline-none text-gray-700">
                  <option value="">Select City</option>
                  <option value="Jigjiga">Jigjiga</option>
                  <option value="Dire Dawa">Dire Dawa</option>
                  <option value="Godey">Godey</option>
                  <option value="Dhagahbur">Dhagahbur</option>
                  <option value="Kabridahar">Kabridahar</option>
               </select>
            </div>
            <div className="flex-1 flex items-center gap-2 px-2">
               <Search className="text-amber-500" />
               <Input type="text" placeholder="Search property or vehicle..." className="border-0 focus-visible:ring-0 px-0 shadow-none" />
            </div>
            <Button size="lg" className="bg-amber-500 hover:bg-black text-white w-full md:w-auto transition-all">
              Search
            </Button>
          </div>
        </div>
      </section>

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
