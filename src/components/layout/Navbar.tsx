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
  const [currDropdownOpen, setCurrDropdownOpen] = useState(false);
  const [newsDropdownOpen, setNewsDropdownOpen] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const { user } = useAuth();
  const { language, currency, setCurrency, t } = useSettings();
  

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuData = useMemo(() => [] as any[], []);

  const toggleCurrDropdown = useCallback(() => {
    setCurrDropdownOpen(prev => !prev);
  }, []);

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
          <Link 
            to="/reviews" 
            onMouseEnter={() => import('@/pages/DealsPage')}
            className="text-xs font-bold tracking-tight hover:text-[#C5A059] transition-colors whitespace-nowrap shrink-0"
          >
            {t('Reviews')}
          </Link>
          <Link 
            to="/software" 
            onMouseEnter={() => import('@/pages/SoftwareToolsPage')}
            className="text-xs font-bold tracking-tight hover:text-[#C5A059] transition-colors whitespace-nowrap shrink-0"
          >
            {t('Software & Tools')}
          </Link>
          <Link 
            to="/tech-gear" 
            onMouseEnter={() => import('@/pages/TechGearPage')}
            className="text-xs font-bold tracking-tight hover:text-[#C5A059] transition-colors whitespace-nowrap shrink-0"
          >
            {t('Tech Gear')}
          </Link>
          <Link 
            to="/news" 
            onMouseEnter={() => import('@/pages/News')}
            className="text-xs font-bold tracking-tight hover:text-[#C5A059] transition-colors whitespace-nowrap shrink-0"
          >
            {t('News')}
          </Link>
          <Link 
            to="/about" 
            onMouseEnter={() => import('@/pages/About')}
            className="text-xs font-bold tracking-tight hover:text-[#C5A059] transition-colors whitespace-nowrap shrink-0"
          >
            {t('About')}
          </Link>
          <Link 
            to="/contact" 
            onMouseEnter={() => import('@/pages/Contact')}
            className="text-xs font-bold tracking-tight hover:text-[#C5A059] transition-colors whitespace-nowrap shrink-0"
          >
            {t('Contact')}
          </Link>
        </nav>

        {/* Desktop Actions - Right */}
        <div className="hidden lg:flex items-center gap-5 xl:gap-6 shrink-0 justify-end ml-4">
             {/* Language Dropdown Start */}
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
            to="/contact"
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
                <Link to="/reviews" onClick={closeMobileMenu} className="text-lg font-bold text-white hover:text-[#C5A059] transition-all py-4 border-b border-white/5">{t('Reviews')}</Link>
                <Link to="/software" onClick={closeMobileMenu} className="text-lg font-bold text-white hover:text-[#C5A059] transition-all py-4 border-b border-white/5">{t('Software & Tools')}</Link>
                <Link to="/tech-gear" onClick={closeMobileMenu} className="text-lg font-bold text-white hover:text-[#C5A059] transition-all py-4 border-b border-white/5">{t('Tech Gear')}</Link>
                <Link to="/news" onClick={closeMobileMenu} className="text-lg font-bold text-white hover:text-[#C5A059] transition-all py-4 border-b border-white/5">{t('News')}</Link>
                <Link to="/about" onClick={closeMobileMenu} className="text-lg font-bold text-white hover:text-[#C5A059] transition-all py-4 border-b border-white/5">{t('About')}</Link>
                <Link to="/contact" onClick={closeMobileMenu} className="text-lg font-bold text-white hover:text-[#C5A059] transition-all py-4 border-b border-white/5">{t('Contact')}</Link>
              </nav>
              
              <div className="pt-4 pb-12 flex flex-col space-y-4">
                <div className="flex gap-2">
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
                  <Link to="/contact" onClick={closeMobileMenu}>{t('Join Us')}</Link>
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
