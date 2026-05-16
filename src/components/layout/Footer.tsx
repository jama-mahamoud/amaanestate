import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black text-white pt-16 pb-8 border-t border-gray-800">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-gold text-black p-2 flex items-center justify-center font-bold text-xl rounded">
                AE
              </div>
              <span className="font-bold text-2xl tracking-tight text-white">
                Amaan<span className="text-gold">Estate</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm mt-4">
              The premium real estate platform for the Somali Region of Ethiopia. We provide standard property sales, rentals, and vehicle listings across our major cities.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 text-gold">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/properties" className="hover:text-white transition-colors">Properties</Link></li>
              <li><Link to="/vehicles" className="hover:text-white transition-colors">Vehicles</Link></li>
              <li><Link to="/news" className="hover:text-white transition-colors">News & Updates</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 text-gold">Top Cities</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/properties?city=Jigjiga" className="hover:text-white transition-colors">Jigjiga</Link></li>
              <li><Link to="/properties?city=Dire%20Dawa" className="hover:text-white transition-colors">Dire Dawa</Link></li>
              <li><Link to="/properties?city=Godey" className="hover:text-white transition-colors">Godey</Link></li>
              <li><Link to="/properties?city=Dhagahbur" className="hover:text-white transition-colors">Dhagahbur</Link></li>
              <li><Link to="/properties?city=Kabridahar" className="hover:text-white transition-colors">Kabridahar</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 text-gold">Contact Us</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gold shrink-0" />
                <span>Jigjiga, Somali Region, Ethiopia</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gold shrink-0" />
                <span>+251910012794</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gold shrink-0" />
                <span>info@amaanestate.com</span>
              </li>
            </ul>
            <div className="flex gap-4 mt-6">
              <a href="#" className="text-gray-400 hover:text-gold transition-colors"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="text-gray-400 hover:text-gold transition-colors"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="text-gray-400 hover:text-gold transition-colors"><Instagram className="h-5 w-5" /></a>
              <a href="#" className="text-gray-400 hover:text-gold transition-colors"><Linkedin className="h-5 w-5" /></a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} AmaanEstate. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
