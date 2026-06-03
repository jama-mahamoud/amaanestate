import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, User, MessageCircle, Sun, Moon, ChevronDown, Check } from 'lucide-react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
// No BrandIdentity import
import { BrandHeader } from '../brand/BrandHeader';
import MegaMenu from './MegaMenu';
import NotificationBell from './NotificationBell';

const MobileAccordionItem = ({ title, sections, setMobileMenuOpen, isOpen, onToggle }: { title: string, sections: any[], setMobileMenuOpen: (v: boolean) => void, isOpen: boolean, onToggle: () => void }) => {
  const { t } = useSettings();
  
  return (
    <div className="border-b border-white/5 py-4 w-full text-left">
      <button 
        onClick={onToggle} 
        className="w-full flex justify-between items-center text-lg font-bold text-white hover:text-[#C5A059] transition-all"
      >
        <span>{t(title)}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180 text-[#C5A059]' : 'text-white/20'}`} />
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
                  <h3 className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{t(section.title)}</h3>
                  <ul className="flex flex-col gap-2 pl-4 border-l border-white/5">
                    {section.items.map((item: any, i: number) => (
                      <li key={i}>
                        <Link 
                          to={item.href} 
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-white/60 hover:text-white transition-colors text-sm block py-1"
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
  

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuData = useMemo(() => [
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
    }
  ], []);

  const navLinks = useMemo(() => [
    { name: 'Properties', path: '/properties' },
    { name: 'Vehicles', path: '/vehicles' },
    { name: 'Agents', path: '/agents' },
    { name: 'News', path: '/news' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ], []);

  const toggleLangDropdown = useCallback(() => {
    setLangDropdownOpen(prev => !prev);
    setCurrDropdownOpen(false);
  }, []);

  const toggleCurrDropdown = useCallback(() => {
    setCurrDropdownOpen(prev => !prev);
    setLangDropdownOpen(false);
  }, []);

  const selectLanguage = useCallback((lang: string) => {
    setLanguage(lang as any);
    setLangDropdownOpen(false);
  }, [setLanguage]);

  const selectCurrency = useCallback((curr: string) => {
    setCurrency(curr as any);
    setCurrDropdownOpen(false);
  }, [setCurrency]);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
        isScrolled 
          ? 'bg-luxury-black border-b border-white/5' 
          : 'bg-luxury-black/95 backdrop-blur-md border-b border-white/5'
      }`}
    >
      {/* Top Support Bar */}
      <div className="bg-black/40 border-b border-white/5 py-2">
        <div className="container mx-auto max-w-7xl px-4 md:px-6 flex justify-center md:justify-end">
          <a 
            href="https://wa.me/251910012794" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 group/wa outline-none"
          >
            <div className="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 bg-white/5 text-emerald-400 group-hover/wa:bg-[#C5A059] group-hover/wa:text-black">
              <MessageCircle size={12} className="fill-current/10" />
            </div>
            <span className="text-[10px] font-bold tracking-widest text-white/70 group-hover/wa:text-white transition-colors">
              +251 910 012 794
            </span>
          </a>
        </div>
      </div>

      {/* Main Navbar */}
      <div className={`container mx-auto max-w-7xl px-4 md:px-6 flex items-center justify-between transition-all duration-500 ${
        isScrolled ? 'py-2.5' : 'py-3.5'
      }`}>
        {/* LEFT AREA: Logo */}
        <div className="flex items-center shrink-0">
          <BrandHeader size="md" />
        </div>
        
        {/* Desktop Nav - Left Aligned and beautifully spaced */}
        <nav className="hidden lg:flex items-center gap-x-5 xl:gap-x-6 justify-start flex-1 ml-6 xl:ml-12 text-white/70">
          {menuData.map((menu) => (
            <MegaMenu key={menu.title} title={t(menu.title)} sections={menu.sections} isDark={true} />
          ))}
          <Link to="/agents" className="text-xs font-bold tracking-tight hover:text-[#C5A059] transition-colors whitespace-nowrap shrink-0">{t('Agents')}</Link>
          <Link to="/network" className="text-xs font-bold tracking-tight text-[#C5A059] hover:text-white transition-colors whitespace-nowrap shrink-0">{t('Network')}</Link>
          <Link to="/agreements" className="text-xs font-bold tracking-tight hover:text-[#C5A059] transition-colors whitespace-nowrap shrink-0">{t('Agreements')}</Link>
          <Link to="/news" className="text-xs font-bold tracking-tight hover:text-[#C5A059] transition-colors whitespace-nowrap shrink-0">{t('News')}</Link>
          <Link to="/jobs" className="text-xs font-bold tracking-tight hover:text-[#C5A059] transition-colors whitespace-nowrap shrink-0">{t('Jobs')}</Link>
          <Link to="/about" className="text-xs font-bold tracking-tight hover:text-[#C5A059] transition-colors whitespace-nowrap shrink-0">{t('About')}</Link>
          <Link to="/contact" className="text-xs font-bold tracking-tight hover:text-[#C5A059] transition-colors whitespace-nowrap shrink-0">{t('Contact')}</Link>
        </nav>

        {/* Desktop Actions - Right */}
        <div className="hidden lg:flex items-center gap-5 xl:gap-6 shrink-0 justify-end ml-4">
             {/* Language Dropdown Start */}
             <div className="relative">
              <div 
                className="flex items-center gap-1 transition-colors cursor-pointer text-xs font-bold text-white/60 hover:text-white"
                onClick={toggleLangDropdown}
              >
                <span>{language === 'en' ? 'EN' : 'SOM'}</span> <ChevronDown size={10} />
              </div>
              <AnimatePresence>
                {langDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full mt-2 right-0 bg-luxury-charcoal border border-white/10 rounded-2xl shadow-2xl overflow-hidden min-w-[120px] py-2 z-50"
                  >
                    <button 
                      onClick={() => selectLanguage('en')}
                      className="w-full text-left px-5 py-2 hover:bg-white/5 transition-colors flex items-center justify-between text-xs font-medium text-white"
                    >
                      <span>English</span>
                      {language === 'en' && <Check size={12} className="text-[#C5A059]" />}
                    </button>
                    <button 
                      onClick={() => selectLanguage('so')}
                      className="w-full text-left px-5 py-2 hover:bg-white/5 transition-colors flex items-center justify-between text-xs font-medium text-white"
                    >
                      <span>Soomaali</span>
                      {language === 'so' && <Check size={12} className="text-[#C5A059]" />}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {user && <NotificationBell isDark={true} />}
            
            {user ? (
               <Link to="/dashboard" className="flex items-center gap-2 transition-colors text-xs font-bold text-white/60 hover:text-white sit-nav">
                 <User size={14} /> {t('Account')}
               </Link>
            ) : (
               <Link to="/login" className="flex items-center gap-2 transition-colors text-xs font-bold text-white/60 hover:text-white">
                 <User size={14} /> {t('Login')}
               </Link>
            )}

          <Link 
            to="/agents/register"
            className="px-6 py-2.5 rounded-full text-xs font-bold transition-all bg-[#C5A059] text-black hover:bg-white hover:text-black shadow-lg shadow-[#C5A059]/10"
          >
            {t('Join Us')}
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          {user && <NotificationBell isDark={true} />}
          <button 
            className="p-2 transition-colors text-white" 
            onClick={toggleMobileMenu}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileMenu}
              className="lg:hidden fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm pointer-events-auto"
            />
            {/* Drawer */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-y-0 right-0 z-[100] w-full sm:w-[400px] bg-luxury-black border-l border-white/10 flex flex-col h-screen shadow-2xl"
            >
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div className="flex items-center gap-2">
                 <BrandHeader size="sm" />
              </div>
              <button 
                className="text-white/30 hover:text-white transition-colors p-2" 
                onClick={closeMobileMenu}
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

                <Link to="/agents" onClick={closeMobileMenu} className="text-lg font-bold text-white hover:text-[#C5A059] transition-all py-4 border-b border-white/5">{t('Agents')}</Link>
                <Link to="/network" onClick={closeMobileMenu} className="text-lg font-bold text-[#C5A059] hover:text-[#C5A059]/80 transition-all py-4 border-b border-white/5">{t('Network')}</Link>
                <Link to="/agreements" onClick={closeMobileMenu} className="text-lg font-bold text-white hover:text-[#C5A059] transition-all py-4 border-b border-white/5">{t('Agreements')}</Link>
                <Link to="/news" onClick={closeMobileMenu} className="text-lg font-bold text-white hover:text-[#C5A059] transition-all py-4 border-b border-white/5">{t('News')}</Link>
                <Link to="/jobs" onClick={closeMobileMenu} className="text-lg font-bold text-white hover:text-[#C5A059] transition-all py-4 border-b border-white/5">{t('Jobs')}</Link>
                <Link to="/about" onClick={closeMobileMenu} className="text-lg font-bold text-white hover:text-[#C5A059] transition-all py-4 border-b border-white/5">{t('About')}</Link>
                <Link to="/contact" onClick={closeMobileMenu} className="text-lg font-bold text-white hover:text-[#C5A059] transition-all py-4 border-b border-white/5">{t('Contact')}</Link>
              </nav>
              
              <div className="pt-4 pb-12 flex flex-col space-y-4">
                <div className="flex gap-2">
                  <Button 
                    onClick={() => selectLanguage(language === 'en' ? 'so' : 'en')}
                    variant="outline" 
                    className="flex-1 border-white/10 bg-white/5 text-white hover:bg-white hover:text-black transition-all h-12 rounded-xl font-bold uppercase tracking-widest text-[9px]"
                  >
                    🌐 {language === 'en' ? t('SOM') : t('EN')}
                  </Button>
                  <Button 
                    onClick={() => selectCurrency(currency === 'ETB' ? 'USD' : 'ETB')}
                    variant="outline" 
                    className="flex-1 border-white/10 bg-white/5 text-white hover:bg-white hover:text-black transition-all h-12 rounded-xl font-bold uppercase tracking-widest text-[9px]"
                  >
                    💱 {currency === 'ETB' ? t('USD') : t('ETB')}
                  </Button>
                </div>

                {user ? (
                   <Button asChild variant="outline" className="w-full border-white/10 text-white hover:bg-[#C5A059] hover:text-black hover:border-transparent transition-all h-14 rounded-xl font-bold uppercase tracking-widest text-[10px]">
                      <Link to="/dashboard" onClick={closeMobileMenu}>{t('Control Center')}</Link>
                   </Button>
                ) : (
                  <Button asChild variant="outline" className="w-full border-white/10 text-white hover:bg-white/5 transition-all h-14 rounded-xl font-bold uppercase tracking-widest text-[10px]">
                    <Link to="/login" onClick={closeMobileMenu}>{t('Sign In')}</Link>
                  </Button>
                )}
                <Button asChild className="w-full bg-[#C5A059] text-black hover:bg-white h-14 rounded-xl font-bold text-sm shadow-xl shadow-[#C5A059]/10">
                  <Link to="/agents/register" onClick={closeMobileMenu}>{t('Join Us')}</Link>
                </Button>
              </div>
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
