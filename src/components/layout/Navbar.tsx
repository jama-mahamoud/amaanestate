import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, User, MessageCircle, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/contexts/AuthContext';
import AmaanLogo from '../brand/AmaanLogo';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user } = useAuth();

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

  const navLinks = [
    { name: 'Properties', path: '/properties' },
    { name: 'Vehicles', path: '/vehicles' },
    { name: 'News', path: '/news' },
    { name: 'Brokers', path: '/brokers' },
    { name: 'Expert Pros', path: '/services' },
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
      {/* WhatsApp Institutional Strip */}
      <div className="w-full border-b border-white/5 bg-black/20 backdrop-blur-sm py-2 px-4 relative z-50">
        <div className="container mx-auto max-w-7xl flex justify-end">
          <a 
            href="https://wa.me/251910012794" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 group transition-all cursor-pointer"
          >
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#25D366]/10 text-[#25D366] group-hover:bg-[#25D366] group-hover:text-white transition-all duration-500 shadow-lg shadow-black/20">
              <MessageCircle size={10} fill="currentColor" fillOpacity={0.1} />
            </div>
            <p className="text-[9px] md:text-[10px] uppercase font-black tracking-[0.25em] text-white/30 group-hover:text-white transition-colors duration-300">
              WhatsApp Support <span className="mx-2 text-white/10 hidden md:inline">|</span> <span className="text-white/50 group-hover:text-luxury-gold">+251 910 012 794</span>
            </p>
          </a>
        </div>
      </div>

      <div className={`container mx-auto max-w-7xl px-4 md:px-6 flex items-center justify-between transition-all duration-500 ${
        isScrolled ? 'py-4' : 'py-8'
      }`}>
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center space-x-2 md:space-x-3 group outline-none">
            <AmaanLogo size="md" />
            <span className="font-display font-extrabold text-xl md:text-2xl tracking-tighter text-white whitespace-nowrap">
              Amaan<span className="gold-text-gradient bg-clip-text">Estate</span>
            </span>
          </Link>
        </div>
        
        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path} 
              className="text-[10px] items-center uppercase font-bold tracking-[0.2em] text-white/60 transition-all hover:text-luxury-gold relative group"
            >
              {link.name}
              <span className="absolute -bottom-2 left-1/2 w-0 h-0.5 bg-luxury-gold transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-8">
          {/* Custom Theme Switcher */}
          <button 
            onClick={() => setIsLightTheme(!isLightTheme)}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/5 hover:border-luxury-gold/30 hover:bg-white/10 flex items-center justify-center text-luxury-gold transition-all cursor-pointer"
            aria-label="Toggle luxury themes"
          >
            {isLightTheme ? <Moon size={16} className="text-neutral-800" /> : <Sun size={16} />}
          </button>

          {user ? (
            <Link to="/dashboard" className="text-[10px] uppercase font-bold tracking-[0.2em] text-luxury-gold hover:text-white transition-colors flex items-center gap-2">
               <User size={14} /> My Dashboard
            </Link>
          ) : (
            <Link to="/login" className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/40 hover:text-white transition-colors">
              Sign In
            </Link>
          )}
          <Button asChild className="luxury-button shadow-luxury-gold/10">
            <Link to="/become-pro">Join Us</Link>
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center gap-4 lg:hidden">
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40 bg-luxury-black/98 backdrop-blur-2xl flex flex-col items-center justify-center p-8 h-screen"
          >
            <div className="absolute top-8 right-4">
              <button 
                className="p-4 text-white/50 hover:text-luxury-gold transition-colors" 
                onClick={() => setMobileMenuOpen(false)}
              >
                <X size={32} />
              </button>
            </div>
            
            <nav className="flex flex-col space-y-8 md:space-y-12 text-center w-full max-w-xs overflow-y-auto max-h-[70vh] no-scrollbar py-8">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link 
                    to={link.path} 
                    className="text-3xl md:text-4xl font-display font-bold text-white hover:text-luxury-gold transition-all tracking-tighter"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: navLinks.length * 0.05 }}
                className="pt-8 border-t border-white/5 flex flex-col space-y-4"
              >
                {/* Mobile Toggle inside list */}
                <Button 
                  onClick={() => {
                    setIsLightTheme(!isLightTheme);
                    setMobileMenuOpen(false);
                  }}
                  variant="outline" 
                  className="w-full border-white/5 bg-white/5 text-luxury-gold hover:bg-[#C5A059] hover:text-black transition-all h-16 rounded-[1.5rem] font-bold uppercase tracking-widest text-[10px] cursor-pointer"
                >
                  Theme: {isLightTheme ? 'Switch to Dark' : 'Switch to Light'}
                </Button>

                {user ? (
                   <Button asChild variant="outline" className="w-full border-luxury-gold/20 bg-luxury-gold/5 text-luxury-gold hover:bg-luxury-gold hover:text-luxury-black transition-all h-16 rounded-[1.5rem] font-bold uppercase tracking-widest text-[10px]">
                      <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>My Dashboard</Link>
                   </Button>
                ) : (
                  <Button asChild variant="outline" className="w-full border-white/5 bg-white/5 text-white hover:bg-luxury-gold hover:text-luxury-black transition-all h-16 rounded-[1.5rem] font-bold uppercase tracking-widest text-[10px]">
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                  </Button>
                )}
                <Button asChild className="w-full bg-luxury-gold text-luxury-black h-16 rounded-[1.5rem] font-bold text-base shadow-2xl shadow-luxury-gold/10">
                  <Link to="/become-pro" onClick={() => setMobileMenuOpen(false)}>Join Us</Link>
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="pt-12 flex flex-col items-center"
              >
                 <p className="text-white/10 text-[9px] uppercase font-bold tracking-[0.5em] mb-4">Official Presence</p>
                 <div className="flex gap-6">
                    <div className="w-1.5 h-1.5 rounded-full bg-luxury-gold shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                 </div>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
