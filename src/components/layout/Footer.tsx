import { Link } from 'react-router-dom';
import { 
  Facebook, Instagram, Linkedin, Send, MessageCircle, MapPin, Phone, Mail, 
  ArrowUpRight, Music2
} from 'lucide-react';
import PremiumLogo from '../brand/PremiumLogo';
import { useSettings } from '../../contexts/SettingsContext';

export default function Footer() {
  const { t } = useSettings();
  const currentYear = 2026;

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

  const agentsRegistry = [
    { name: t('agents.verifiedBrokers') || 'Verified Brokers', path: '/brokers' },
    { name: t('agents.agencies') || 'Agencies Office', path: '/brokers' },
    { name: t('agents.propertyExperts') || 'Property Experts', path: '/brokers' },
    { name: t('agents.registryVerification') || 'Registry Verification', path: '/brokers' },
    { name: t('agents.certifiedAgents') || 'Certified Agents', path: '/brokers' }
  ];

  const corporateLinks = [
    { name: t('Corporate Portal') || 'Home Portal', path: '/' },
    { name: t('Agreements') || 'Agreements', path: '/agreements' },
    { name: t('Insights & Reports') || 'Insights & Reports', path: '/news' },
    { name: t('Privacy Policy') || 'Privacy Policy', path: '/privacy' },
    { name: t('Terms of Service') || 'Terms of Service', path: '/terms' },
    { name: t('Contact & Support') || 'Contact & Support', path: '/contact' }
  ];

  return (
    <footer className="bg-[#050505] text-white pt-24 pb-8 border-t border-white/5 relative overflow-hidden font-sans">
      {/* Visual Ambience Enhancements */}
      <div className="absolute top-0 left-1/4 w-[450px] h-[450px] bg-luxury-gold/[0.02] blur-[150px] rounded-full pointer-events-none -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-luxury-gold/[0.01] blur-[100px] rounded-full pointer-events-none translate-y-1/3"></div>

      <div className="container mx-auto max-w-7xl px-6 relative z-10">
        
        {/* Interactive Highlight Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-16 mb-16 border-b border-white/5">
          <div className="lg:col-span-5 space-y-6">
            <Link to="/" className="inline-block outline-none group">
              <PremiumLogo className="h-10 transition-transform duration-500 group-hover:scale-[1.02]" variant="white" />
            </Link>
            <p className="text-white/40 text-xs font-light uppercase tracking-[0.25em]">
              {t("footer.brandSlogan") || "Global Real Estate & Structural Verification Network"}
            </p>
            <p className="text-white/60 text-sm leading-relaxed max-w-md font-light">
              {t("footer.brandDescription") || "Pioneering absolute transactional security and asset compliance. Establishing state-of-the-art cataloging, certified ownership validation, and luxury asset exchange systems across East Africa."}
            </p>
          </div>
          
          <div className="lg:col-span-7 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6 p-8 bg-white/[0.02] border border-white/5 rounded-3xl backdrop-blur-md">
            <div>
              <p className="text-xs text-luxury-gold uppercase tracking-[0.3em] font-bold mb-1">
                {t("footer.ctaSub") || "Catalog Your Premium Asset"}
              </p>
              <h4 className="text-lg font-display text-white font-medium">
                {t("footer.ctaTitle") || "Ready to reach East Africa's premier buyers?"}
              </h4>
            </div>
            <Link 
              to="/list-property"
              className="px-6 py-4 rounded-xl bg-luxury-gold text-black hover:bg-white text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 group shadow-xl shadow-luxury-gold/10 animate-pulse-subtle"
            >
              {t("properties.listProperty") || "List Your Property"} 
              <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Links & Information Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 mb-20">
          
          {/* Properties Portfolio */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <span className="w-1 h-3 bg-luxury-gold rounded-full"></span>
              <h3 className="font-display font-bold text-white tracking-[0.2em] uppercase text-[10px]">
                {t("Properties") || "Properties"}
              </h3>
            </div>
            <ul className="space-y-3">
              {propertiesPortfolio.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path} 
                    className="text-white/50 hover:text-luxury-gold transition-colors text-xs flex items-center group font-light"
                  >
                    <span className="w-1 h-1 rounded-full bg-luxury-gold/0 group-hover:bg-luxury-gold transition-all mr-0 group-hover:mr-2"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Elite Mobility Fleet */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <span className="w-1 h-3 bg-luxury-gold rounded-full"></span>
              <h3 className="font-display font-bold text-white tracking-[0.2em] uppercase text-[10px]">
                {t("Vehicles") || "Vehicles"}
              </h3>
            </div>
            <ul className="space-y-3">
              {vehicleFleet.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path} 
                    className="text-white/50 hover:text-luxury-gold transition-colors text-xs flex items-center group font-light"
                  >
                    <span className="w-1 h-1 rounded-full bg-luxury-gold/0 group-hover:bg-luxury-gold transition-all mr-0 group-hover:mr-2"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Registry & Brokerage */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <span className="w-1 h-3 bg-luxury-gold rounded-full"></span>
              <h3 className="font-display font-bold text-white tracking-[0.2em] uppercase text-[10px]">
                {t("Agents & Registry") || "Agents & Registry"}
              </h3>
            </div>
            <ul className="space-y-3">
              {agentsRegistry.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path} 
                    className="text-white/50 hover:text-luxury-gold transition-colors text-xs flex items-center group font-light"
                  >
                    <span className="w-1 h-1 rounded-full bg-luxury-gold/0 group-hover:bg-luxury-gold transition-all mr-0 group-hover:mr-2"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Corporate Desk */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <span className="w-1 h-3 bg-luxury-gold rounded-full"></span>
              <h3 className="font-display font-bold text-white tracking-[0.2em] uppercase text-[10px]">
                {t("Corporate Portal") || "Corporate Portal"}
              </h3>
            </div>
            <ul className="space-y-3">
              {corporateLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path} 
                    className="text-white/50 hover:text-luxury-gold transition-colors text-xs flex items-center group font-light"
                  >
                    <span className="w-1 h-1 rounded-full bg-luxury-gold/0 group-hover:bg-luxury-gold transition-all mr-0 group-hover:mr-2"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Digital Concierge & Headquarters */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <span className="w-1 h-3 bg-luxury-gold rounded-full"></span>
              <h3 className="font-display font-bold text-white tracking-[0.2em] uppercase text-[10px]">
                {t("Headquarters") || "Headquarters"}
              </h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center shrink-0">
                  <MapPin size={13} className="text-luxury-gold" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-white mb-0.5">{t("Physical Office") || "Physical Office"}</p>
                  <p className="text-white/50 font-light">{t("Jigjiga, Ethiopia") || "Jigjiga, Ethiopia"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center shrink-0">
                  <Phone size={13} className="text-luxury-gold" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-white mb-0.5">{t("Concierge Desk") || "Concierge Desk"}</p>
                  <p className="text-white/50 font-light">+251 910 012 794</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center shrink-0">
                  <Mail size={13} className="text-luxury-gold" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-white mb-0.5">{t("Direct Enquiries") || "Direct Enquiries"}</p>
                  <p className="text-white/50 font-light">support@amaanestate.com</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Global Social Handles & Trust Icons */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-xl border border-luxury-gold/10 bg-luxury-gold/[0.02] text-luxury-gold text-[9px] uppercase font-bold tracking-widest flex items-center gap-2 hover:bg-luxury-gold/[0.08] hover:border-luxury-gold/30 transition-all duration-300 cursor-default select-none shadow-sm">
              <span className="text-luxury-gold/80 font-sans font-black">✓</span>
              {t("Verified Property Network") || "Verified Property Network"}
            </div>
            <div className="px-3.5 py-1.5 rounded-xl border border-white/5 bg-white/[0.01] text-white/50 text-[9px] uppercase font-bold tracking-widest flex items-center gap-2 hover:text-white hover:bg-white/[0.03] hover:border-white/15 transition-all duration-300 cursor-default select-none">
              <span className="text-luxury-gold/80 font-sans font-black">✓</span>
              {t("Trusted Regional Registry") || "Trusted Regional Registry"}
            </div>
          </div>

          <div className="flex gap-3">
            {[
              { Icon: Facebook, url: 'https://web.facebook.com/profile.php?id=61560833697279', label: 'Facebook' },
              { Icon: Instagram, url: 'https://instagram.com/amaanestate', label: 'Instagram' },
              { Icon: Music2, url: 'https://www.tiktok.com/@momentumforsuccesstv', label: 'TikTok' },
              { Icon: Linkedin, url: 'https://linkedin.com/company/amaanestate', label: 'LinkedIn' },
              { Icon: Send, url: 'https://t.me/amaanestate', label: 'Telegram' },
              { Icon: MessageCircle, url: 'https://wa.me/251910012794', label: 'WhatsApp' }
            ].map(({ Icon, url, label }, i) => (
              <a 
                key={i} 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label={label}
                className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center hover:bg-luxury-gold hover:text-black hover:border-luxury-gold transition-all duration-300 group"
              >
                <Icon size={16} className="text-white/60 group-hover:text-black transition-colors" />
              </a>
            ))}
          </div>
        </div>

        {/* Premium Bottom Copyright Bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-[10px] tracking-widest uppercase font-light text-center md:text-left">
            &copy; {currentYear} AmaanEstate.com &mdash; {t("All Rights Reserved") || "All Rights Reserved"}.
          </p>
          <div className="flex items-center gap-1 text-white/30 text-[10px] tracking-widest uppercase font-light">
            <span>{t("footer.poweredBy") || "Powered by"}</span>
            <span className="text-luxury-gold font-bold">{t("footer.networkName") || "AmaanEstate Global Property Network"}</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
