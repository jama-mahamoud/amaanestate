import { Link, useLocation } from 'react-router-dom';
import { 
  Facebook, Instagram, MessageCircle, MapPin, Music2, Mail, Phone
} from 'lucide-react';
import { BrandHeader } from '../brand/BrandHeader';
import { useSettings } from '../../contexts/SettingsContext';

export default function Footer() {
  const { t } = useSettings();
  const currentYear = 2026;
  const location = useLocation();

  const isJobPage = location.pathname.includes('/jobs') || 
                    location.pathname.includes('/job/') || 
                    location.pathname.includes('/company/') || 
                    location.pathname.includes('/employer/');

  if (isJobPage) {
    return (
      <footer className="bg-[#0b0b0c] text-white py-12 border-t border-white/5 font-sans mt-auto">
        <div className="container mx-auto max-w-4xl px-4 text-center space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-white/5 pb-6">
            <div className="text-left">
              <span className="text-sm font-extrabold tracking-wider text-white uppercase">AmaanJobs</span>
              <p className="text-xs text-white/50 mt-1 max-w-sm">
                Somalia's premier recruitment ecosystem connecting verified employers with high-caliber talent.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
              <Link to="/news" className="text-white/60 hover:text-luxury-gold transition-colors">About / Insights</Link>
              <a href="mailto:info@amaanestate.com" className="text-white/60 hover:text-luxury-gold transition-colors">Contact</a>
              <Link to="/privacy" className="text-white/60 hover:text-luxury-gold transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="text-white/60 hover:text-luxury-gold transition-colors">Terms of Service</Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-[10px] text-white/30 tracking-widest uppercase gap-4">
            <p>&copy; {currentYear} AmaanJobs &mdash; Recruiter & Candidate Hub.</p>
            <p className="font-semibold text-luxury-gold/55">Verified Professional Network</p>
          </div>
        </div>
      </footer>
    );
  }

  const propertiesPortfolio = [
    { name: t('properties.houses') || 'Houses', path: '/properties?subcategory=house' },
    { name: t('properties.apartments') || 'Apartments', path: '/properties?subcategory=apartment' },
    { name: t('properties.land') || 'Land & Plots', path: '/properties?subcategory=land' },
    { name: t('properties.commercial') || 'Commercial Spaces', path: '/properties?subcategory=commercial' },
    { name: t('properties.villas') || 'Villas & Estates', path: '/properties?subcategory=villa' },
    { name: t('properties.luxuryHomes') || 'Luxury Homes', path: '/properties?subcategory=luxury' }
  ];

  const vehicleFleet = [
    { name: t('vehicles.suvs') || 'SUVs', path: '/vehicles?subcategory=SUV' },
    { name: t('vehicles.sedans') || 'Sedans', path: '/vehicles?subcategory=Sedan' },
    { name: t('vehicles.trucks') || 'Trucks', path: '/vehicles?subcategory=Truck' },
    { name: t('vehicles.luxury') || 'Luxury Vehicles', path: '/vehicles?subcategory=Lux' }
  ];

  const corporateLinks = [
    { name: t('Ecosystem') || 'Ecosystem', path: '/ecosystem' },
    { name: t('About') || 'About Us', path: '/about' },
    { name: t('Contact') || 'Contact', path: '/contact' },
    { name: t('Privacy Policy') || 'Privacy Policy', path: '/privacy' },
    { name: t('Terms of Service') || 'Terms of Service', path: '/terms' }
  ];

  return (
    <footer className="bg-super-black text-white pt-24 pb-12 relative overflow-hidden font-sans border-t border-white/5">
      {/* Visual Ambience Background Light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[300px] pointer-events-none opacity-20 select-none">
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-[#C5A059]/10 rounded-full filter blur-[100px] -translate-y-1/2" />
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
        
        {/* Brand Banner Block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-16 mb-16 border-b border-white/5">
          <div className="lg:col-span-12 space-y-8 flex flex-col items-center text-center">
            <BrandHeader size="lg" />
            
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Link 
                to="/list-property"
                className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-white text-super-black hover:bg-[#C5A059] hover:text-black text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-xl shadow-white/5"
              >
                List Your Property
              </Link>
              <Link 
                to="/ecosystem"
                className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 text-xs font-bold uppercase tracking-wider transition-all duration-300"
              >
                Ecosystem Workspace
              </Link>
            </div>
          </div>
        </div>

        {/* Links Categories Grid - Perfectly Unified and Responsive */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-16">
          {/* Marketplace Category */}
          <div>
            <h3 className="font-display font-bold text-[#C5A059] tracking-widest uppercase text-[10px] mb-6 opacity-80">
              Marketplace
            </h3>
            <ul className="space-y-4">
              {propertiesPortfolio.map((link, idx) => (
                <li key={`${link.name}-${idx}`}>
                  <Link 
                    to={link.path} 
                    className="text-white/50 hover:text-white transition-colors text-xs font-medium"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Vehicles Category */}
          <div>
            <h3 className="font-display font-bold text-[#C5A059] tracking-widest uppercase text-[10px] mb-6 opacity-80">
              Vehicles
            </h3>
            <ul className="space-y-4">
              {vehicleFleet.map((link, idx) => (
                <li key={`${link.name}-${idx}`}>
                  <Link 
                    to={link.path} 
                    className="text-white/50 hover:text-white transition-colors text-xs font-medium"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Category */}
          <div>
            <h3 className="font-display font-bold text-[#C5A059] tracking-widest uppercase text-[10px] mb-6 opacity-80">
              Navigation & Ecosystem
            </h3>
            <ul className="space-y-4">
              {corporateLinks.map((link, idx) => (
                <li key={`${link.name}-${idx}`}>
                  <Link 
                    to={link.path} 
                    className="text-white/50 hover:text-white transition-colors text-xs font-medium"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Support Section */}
          <div>
            <h3 className="font-display font-bold text-[#C5A059] tracking-widest uppercase text-[10px] mb-6 opacity-80">
              Contact & Support
            </h3>
            <div className="space-y-6">
              <a 
                href="mailto:info@amaanestate.com"
                className="flex items-center gap-3 group outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#C5A059] transition-colors">
                  <Mail size={14} className="text-white/60 group-hover:text-black transition-colors" />
                </div>
                <span className="text-xs text-white/50 group-hover:text-white transition-colors font-medium">
                  info@amaanestate.com
                </span>
              </a>
              <a 
                href="tel:+251910012794"
                className="flex items-center gap-3 group outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#C5A059] transition-colors">
                  <Phone size={14} className="text-white/60 group-hover:text-black transition-colors" />
                </div>
                <span className="text-xs text-white/50 group-hover:text-white transition-colors font-medium">
                  +251 910 012 794
                </span>
              </a>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                  <MapPin size={14} className="text-white/60" />
                </div>
                <span className="text-xs text-white/50 font-medium">
                  Jigjiga, Ethiopia
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright on Left, Horizontal Legal Links in Center, Socials on Right */}
        <div className="pt-8 border-t border-white/5 flex flex-col lg:flex-row items-center justify-between gap-6">
          
          {/* Left Area: Copyright */}
          <p className="text-white/30 text-[10px] tracking-widest uppercase font-medium text-center lg:text-left">
            &copy; {currentYear} AmaanEstate &mdash; Verified Marketplace.
          </p>

          {/* Center Area: Horizontal Clean Legal Bar */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 my-1 lg:my-0">
            <Link 
              to="/privacy" 
              className="text-white/30 hover:text-[#C5A059] transition-colors text-[10px] tracking-widest uppercase font-semibold"
            >
              {t('Privacy Policy') || 'Privacy Policy'}
            </Link>
            <Link 
              to="/terms" 
              className="text-white/30 hover:text-[#C5A059] transition-colors text-[10px] tracking-widest uppercase font-semibold"
            >
              {t('Terms of Service') || 'Terms of Service'}
            </Link>
            <Link 
              to="/disclaimer" 
              className="text-white/30 hover:text-[#C5A059] transition-colors text-[10px] tracking-widest uppercase font-semibold"
            >
              {t('Disclaimer') || 'Disclaimer'}
            </Link>
          </div>

          {/* Right Area: Socials */}
          <div className="flex gap-4">
            {[
              { Icon: Facebook, url: 'https://web.facebook.com/profile.php?id=61560833697279' },
              { Icon: Instagram, url: 'https://instagram.com/amaanestate' },
              { Icon: Music2, url: 'https://www.tiktok.com/@momentumforsuccesstv' },
              { Icon: MessageCircle, url: 'https://wa.me/251910012794' }
            ].map(({ Icon, url }, i) => (
              <a 
                key={i} 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-black hover:bg-white hover:border-transparent transition-all duration-300 outline-none"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>

        </div>

      </div>
    </footer>
  );
}
