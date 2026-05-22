import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, User, MessageCircle, Sun, Moon, ChevronDown, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import AmaanLogo from '../brand/AmaanLogo';
import MegaMenu from './MegaMenu';

const MobileAccordionItem = ({ title, sections, setMobileMenuOpen, isOpen, onToggle }: { title: string, sections: any[], setMobileMenuOpen: (v: boolean) => void, isOpen: boolean, onToggle: () => void }) => {
  const { t } = useSettings();
  
  return (
    <div className="border-b border-white/5 py-6 w-full text-left">
      <button 
        onClick={onToggle} 
        className="w-full flex justify-between items-center text-xl md:text-2xl font-display font-bold text-white hover:text-luxury-gold transition-all"
      >
        <span>{t(title)}</span>
        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180 text-luxury-gold' : 'text-white/30'}`} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="py-4 space-y-4">
              {sections.map((section, idx) => (
                <div key={idx} className="flex flex-col gap-2">
                  <h3 className="text-luxury-gold text-xs font-bold uppercase tracking-[0.2em]">{t(section.title)}</h3>
                  <ul className="flex flex-col gap-1 pl-4 border-l border-white/10">
                    {section.items.map((item: any, i: number) => (
                      <li key={i}>
                        <Link 
                          to={item.href} 
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-white/70 hover:text-white transition-colors text-sm block py-1"
                        >
                          {t(item.title)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [currDropdownOpen, setCurrDropdownOpen] = useState(false);
  const { user } = useAuth();
  const { language, setLanguage, currency, setCurrency, t } = useSettings();
  
  // Premium Theme Engine State Synchronized with Storage
  const [isLightTheme, setIsLightTheme] = useState(() => {
    return localStorage.getItem('theme') === 'light';
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isLightTheme) {
      document.body.classList.add('theme-light');
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.remove('theme-light');
      localStorage.setItem('theme', 'dark');
    }
  }, [isLightTheme]);

  const menuData = [
    {
      title: 'Properties',
      sections: [
        {
          title: 'Residential',
          items: [
            { title: 'Houses', href: '/properties?subcategory=house' },
            { title: 'Apartments', href: '/properties?subcategory=apartment' },
            { title: 'Villas', href: '/properties?subcategory=villa' },
            { title: 'Luxury Homes', href: '/properties?tag=luxury' },
          ]
        },
        {
          title: 'Land & Commercial',
          items: [
            { title: 'Land', href: '/properties?subcategory=land' },
            { title: 'Offices', href: '/properties?subcategory=office' },
            { title: 'Warehouses', href: '/properties?subcategory=warehouse' },
            { title: 'Hotels', href: '/properties?subcategory=hotel' },
          ]
        },
        {
          title: 'Rental',
          items: [
            { title: 'Rentals', href: '/properties?status=rent' },
            { title: 'Furnished', href: '/properties?tag=furnished' },
            { title: 'Short Stay', href: '/properties?tag=short-stay' },
          ]
        }
      ]
    },
    {
      title: 'Vehicles',
      sections: [
        {
          title: 'Personal Vehicles',
          items: [
            { title: 'SUVs', href: '/vehicles?type=suv' },
            { title: 'Sedans', href: '/vehicles?type=sedan' },
            { title: 'Luxury Cars', href: '/vehicles?tag=luxury' },
            { title: 'Pickups', href: '/vehicles?type=pickup' },
          ]
        },
        {
          title: 'Commercial Vehicles',
          items: [
            { title: 'Trucks', href: '/vehicles?type=truck' },
            { title: 'Buses', href: '/vehicles?type=bus' },
            { title: 'Construction', href: '/vehicles?type=construction' },
          ]
        },
        {
          title: 'Other',
          items: [
            { title: 'Motorbikes', href: '/vehicles?type=motorbike' },
            { title: 'Machinery', href: '/vehicles?type=machinery' },
          ]
        }
      ]
    },
    {
      title: 'Agents & Registry',
      sections: [
        {
          title: 'Agent Network',
          items: [
            { title: 'Verified Agents', href: '/agents' },
            { title: 'Apply to Register', href: '/agents/apply' },
          ]
        },
        {
          title: 'Broker Registry',
          items: [
            { title: 'Agent List', href: '/agents' },
            { title: 'Verify Badge Check', href: '/agents' },
          ]
        }
      ]
    }
  ];

  const navLinks = [
    { name: 'Properties', path: '/properties' },
    { name: 'Vehicles', path: '/vehicles' },
    { name: 'Agents', path: '/agents' },
    { name: 'News', path: '/news' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header 
      className={`fixed top-0 z-50 w-full transition-all duration-500 ease-in-out ${
        isScrolled 
          ? 'bg-luxury-black/80 backdrop-blur-xl border-b border-white/5 shadow-2xl' 
          : 'bg-transparent'
      }`}
    >
      {/* Top Utility Bar */}
      <div className="w-full border-b border-white/5 bg-luxury-black/90 backdrop-blur-md py-2 px-4 relative z-50 hidden md:block">
        <div className="container mx-auto max-w-7xl flex justify-between items-center text-[10px] uppercase font-bold tracking-[0.1em] text-white/60">
          <div className="flex items-center gap-6">
            <a 
              href="https://wa.me/251910012794" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-[#25D366] transition-colors"
            >
              <MessageCircle size={12} className="text-[#25D366]" />
              {t('WhatsApp Support')}: <span className="text-white">+251 910 012 794</span>
            </a>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative">
              <div 
                className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                onClick={() => { setLangDropdownOpen(!langDropdownOpen); setCurrDropdownOpen(false); }}
              >
                <span className="mb-[-1px]">🌐 {language === 'en' ? 'EN' : 'SOM'}</span> <ChevronDown size={10} />
              </div>
              <AnimatePresence>
                {langDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full mt-2 right-0 bg-luxury-black border border-white/10 rounded-lg shadow-xl overflow-hidden min-w-[120px] py-1"
                  >
                    <button 
                      onClick={() => { setLanguage('en'); setLangDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-white/5 transition-colors flex items-center justify-between"
                    >
                      <span>English</span>
                      {language === 'en' && <Check size={12} className="text-luxury-gold" />}
                    </button>
                    <button 
                      onClick={() => { setLanguage('so'); setLangDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-white/5 transition-colors flex items-center justify-between"
                    >
                      <span>Soomaali</span>
                      {language === 'so' && <Check size={12} className="text-luxury-gold" />}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <span className="w-px h-3 bg-white/20"></span>
            
            <div className="relative">
              <div 
                className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                onClick={() => { setCurrDropdownOpen(!currDropdownOpen); setLangDropdownOpen(false); }}
              >
                <span className="mb-[-1px]">💱 {currency}</span> <ChevronDown size={10} />
              </div>
              <AnimatePresence>
                {currDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full mt-2 right-0 bg-luxury-black border border-white/10 rounded-lg shadow-xl overflow-hidden min-w-[120px] py-1"
                  >
                    <button 
                      onClick={() => { setCurrency('ETB'); setCurrDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-white/5 transition-colors flex items-center justify-between"
                    >
                      <span>ETB (Birr)</span>
                      {currency === 'ETB' && <Check size={12} className="text-luxury-gold" />}
                    </button>
                    <button 
                      onClick={() => { setCurrency('USD'); setCurrDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-white/5 transition-colors flex items-center justify-between"
                    >
                      <span>USD ($)</span>
                      {currency === 'USD' && <Check size={12} className="text-luxury-gold" />}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <span className="w-px h-3 bg-white/20"></span>
            {user ? (
               <Link to="/dashboard" className="flex items-center gap-2 hover:text-luxury-gold transition-colors">
                 <User size={12} /> {t('Account')}
               </Link>
            ) : (
               <Link to="/login" className="flex items-center gap-2 hover:text-luxury-gold transition-colors">
                 <User size={12} /> {t('Login')}
               </Link>
            )}
          </div>
        </div>
      </div>

      <div className={`container mx-auto max-w-7xl px-4 md:px-6 flex items-center justify-between transition-all duration-500 ${
        isScrolled ? 'py-4' : 'py-8'
      }`}>
        {/* LOGO AREA - Left matched width */}
        <div className="flex items-center gap-2 shrink-0 xl:flex-1 mt-[-3px]">
          <Link to="/" className="flex items-center space-x-2 md:space-x-2.5 group outline-none">
            <AmaanLogo size="xxs" />
            <span className="font-display font-bold text-base md:text-lg tracking-tighter text-white whitespace-nowrap">
              Amaan<span className="gold-text-gradient bg-clip-text">Estate</span>
            </span>
          </Link>
        </div>
        
        {/* Desktop Nav - Centered strictly */}
        <nav className="hidden xl:flex items-center gap-6 2xl:gap-8 justify-center flex-none">
          {menuData.map((menu) => (
            <MegaMenu key={menu.title} title={t(menu.title)} sections={menu.sections} />
          ))}
          <Link to="/about" className="text-[11px] uppercase font-bold tracking-[0.15em] text-white/60 transition-all hover:text-luxury-gold px-3 whitespace-nowrap">{t('About')}</Link>
          <Link to="/agreements" className="text-[11px] uppercase font-bold tracking-[0.15em] text-white/60 transition-all hover:text-luxury-gold px-3 whitespace-nowrap">{t('Agreements')}</Link>
          <Link to="/contact" className="text-[11px] uppercase font-bold tracking-[0.15em] text-white/60 transition-all hover:text-luxury-gold px-3 whitespace-nowrap">{t('Contact')}</Link>
        </nav>

        {/* Desktop Actions - Right matched width */}
        <div className="hidden xl:flex items-center gap-6 shrink-0 xl:flex-1 justify-end">
          {/* Custom Theme Switcher */}
          <button 
            onClick={() => setIsLightTheme(!isLightTheme)}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/5 hover:border-luxury-gold/30 hover:bg-white/10 flex items-center justify-center text-luxury-gold transition-all cursor-pointer"
            aria-label="Toggle luxury themes"
          >
            {isLightTheme ? <Moon size={16} className="text-neutral-800" /> : <Sun size={16} />}
          </button>

          <Button asChild className="luxury-button shadow-luxury-gold/10">
            <Link to="/become-pro">{t('Join Us')}</Link>
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center gap-4 xl:hidden">
          <button 
            onClick={() => setIsLightTheme(!isLightTheme)}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-luxury-gold cursor-pointer"
            aria-label="Toggle themes"
          >
            {isLightTheme ? <Moon size={16} className="text-[#0a0a0a]" /> : <Sun size={16} />}
          </button>
          <button 
            className="p-2 text-white/70 hover:text-white transition-colors" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="xl:hidden fixed inset-y-0 right-0 z-[100] w-full sm:w-[400px] bg-luxury-black border-l border-white/10 flex flex-col h-screen shadow-2xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div className="flex items-center gap-2">
                 <AmaanLogo size="xxs" />
                 <span className="font-display font-bold text-base text-white">Menu</span>
              </div>
              <button 
                className="text-white/50 hover:text-luxury-gold transition-colors p-2" 
                onClick={() => setMobileMenuOpen(false)}
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-6 py-4 no-scrollbar">
              <nav className="flex flex-col gap-2 pb-8">
                {menuData.map((menu) => (
                  <MobileAccordionItem 
                    key={menu.title} 
                    title={menu.title} 
                    sections={menu.sections} 
                    setMobileMenuOpen={setMobileMenuOpen} 
                    isOpen={activeAccordion === menu.title}
                    onToggle={() => setActiveAccordion(activeAccordion === menu.title ? null : menu.title)}
                  />
                ))}

                <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="text-xl md:text-2xl font-display font-bold text-white hover:text-luxury-gold transition-all py-6 border-b border-white/5">{t('About')}</Link>
                <Link to="/agreements" onClick={() => setMobileMenuOpen(false)} className="text-xl md:text-2xl font-display font-bold text-white hover:text-luxury-gold transition-all py-6 border-b border-white/5">{t('Agreements')}</Link>
                <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="text-xl md:text-2xl font-display font-bold text-white hover:text-luxury-gold transition-all py-6 border-b border-white/5">{t('Contact')}</Link>
              </nav>
              
              <div className="pt-4 pb-12 flex flex-col space-y-4">
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setLanguage(language === 'en' ? 'so' : 'en')}
                    variant="outline" 
                    className="flex-1 border-white/5 bg-white/5 text-luxury-gold hover:bg-[#C5A059] hover:text-black transition-all h-14 rounded-xl font-bold uppercase tracking-widest text-[10px]"
                  >
                    🌐 {language === 'en' ? t('SOM') : t('EN')}
                  </Button>
                  <Button 
                    onClick={() => setCurrency(currency === 'ETB' ? 'USD' : 'ETB')}
                    variant="outline" 
                    className="flex-1 border-white/5 bg-white/5 text-luxury-gold hover:bg-[#C5A059] hover:text-black transition-all h-14 rounded-xl font-bold uppercase tracking-widest text-[10px]"
                  >
                    💱 {currency === 'ETB' ? t('USD') : t('ETB')}
                  </Button>
                </div>

                <Button 
                  onClick={() => setIsLightTheme(!isLightTheme)}
                  variant="outline" 
                  className="w-full border-white/5 bg-white/5 text-luxury-gold hover:bg-[#C5A059] hover:text-black transition-all h-14 rounded-xl font-bold uppercase tracking-widest text-[10px]"
                >
                  {t('Theme')}: {t(isLightTheme ? 'Switch to Dark' : 'Switch to Light')}
                </Button>

                {user ? (
                   <Button asChild variant="outline" className="w-full border-luxury-gold/20 bg-luxury-gold/5 text-luxury-gold hover:bg-luxury-gold hover:text-luxury-black transition-all h-14 rounded-xl font-bold uppercase tracking-widest text-[10px]">
                      <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>{t('My Dashboard')}</Link>
                   </Button>
                ) : (
                  <Button asChild variant="outline" className="w-full border-white/5 bg-white/5 text-white hover:bg-luxury-gold hover:text-luxury-black transition-all h-14 rounded-xl font-bold uppercase tracking-widest text-[10px]">
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>{t('Sign In')}</Link>
                  </Button>
                )}
                <Button asChild className="w-full bg-luxury-gold text-luxury-black h-14 rounded-xl font-bold text-sm shadow-xl shadow-luxury-gold/10">
                  <Link to="/become-pro" onClick={() => setMobileMenuOpen(false)}>{t('Join Us')}</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
