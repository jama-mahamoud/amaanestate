import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, MapPin, Phone, Mail, ArrowRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-luxury-black text-white pt-24 pb-12 border-t border-white/10 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-luxury-gold/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="container mx-auto max-w-7xl px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-2 group outline-none">
              <div className="bg-luxury-gold text-luxury-black w-10 h-10 flex items-center justify-center font-bold text-xl rounded-lg shadow-lg shadow-luxury-gold/20">
                A
              </div>
              <span className="font-display font-bold text-2xl tracking-tight">
                Amaan<span className="text-luxury-gold">Estate</span>
              </span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Redefining luxury real estate in the Somali Region of Ethiopia. Discover premium properties and vehicles with unmatched transparency and professional service.
            </p>
            <div className="flex gap-4 pt-4">
              {[
                { Icon: Facebook, url: 'https://facebook.com/amaanestate' },
                { Icon: Twitter, url: 'https://twitter.com/amaanestate' },
                { Icon: Instagram, url: 'https://instagram.com/amaanestate' },
                { Icon: Linkedin, url: 'https://linkedin.com/company/amaanestate' }
              ].map(({ Icon, url }, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-luxury-gold hover:text-luxury-black transition-all duration-300">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-display font-bold text-white mb-8 tracking-wide uppercase text-xs">Navigation</h3>
            <ul className="space-y-4">
              {[
                { name: 'Featured Properties', path: '/properties' },
                { name: 'Luxury Vehicles', path: '/vehicles' },
                { name: 'Professional Expertise', path: '/services' },
                { name: 'Intelligence Briefs', path: '/news' },
                { name: 'About the Platform', path: '/about' },
                { name: 'Direct Inquiries', path: '/contact' }
              ].map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-white/60 hover:text-luxury-gold transition-colors text-sm flex items-center group">
                    <ArrowRight size={14} className="mr-2 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display font-bold text-white mb-8 tracking-wide uppercase text-xs">Strategic Cities</h3>
            <ul className="space-y-4">
              {['Jigjiga', 'Dire Dawa', 'Godey', 'Dhagahbur', 'Addis Ababa'].map((city) => (
                <li key={city}>
                  <Link to={`/properties?city=${city}`} className="text-white/60 hover:text-luxury-gold transition-colors text-sm flex items-center group">
                    <ArrowRight size={14} className="mr-2 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display font-bold text-white mb-8 tracking-wide uppercase text-xs">Inquiries</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-luxury-gold/10 flex items-center justify-center shrink-0">
                  <MapPin size={18} className="text-luxury-gold" />
                </div>
                <div className="text-sm">
                  <p className="font-bold text-white mb-1">Regional Office</p>
                  <p className="text-white/60">Main Road, Jigjiga, Ethiopia</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-luxury-gold/10 flex items-center justify-center shrink-0">
                  <Phone size={18} className="text-luxury-gold" />
                </div>
                <div className="text-sm">
                  <p className="font-bold text-white mb-1">Concierge</p>
                  <p className="text-white/60">+251 910 012 794</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-luxury-gold/10 flex items-center justify-center shrink-0">
                  <Mail size={18} className="text-luxury-gold" />
                </div>
                <div className="text-sm">
                  <p className="font-bold text-white mb-1">Email</p>
                  <p className="text-white/60">support@amaanestate.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-white/40 text-xs tracking-widest uppercase">
            &copy; {new Date().getFullYear()} AmaanEstate. Global Real Estate Excellence.
          </p>
          <div className="flex gap-8">
            <Link to="/contact" className="text-white/40 hover:text-white transition-colors text-xs uppercase tracking-widest">Privacy Policy</Link>
            <Link to="/contact" className="text-white/40 hover:text-white transition-colors text-xs uppercase tracking-widest">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
