import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Properties', path: '/properties' },
    { name: 'Vehicles', path: '/vehicles' },
    { name: 'Expert Pros', path: '/services' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header 
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        isScrolled 
          ? 'bg-luxury-black/90 backdrop-blur-md py-4 border-b border-white/10 shadow-lg shadow-black/20' 
          : 'bg-transparent py-6'
      }`}
    >
      <div className="container mx-auto max-w-7xl px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-luxury-gold text-luxury-black w-10 h-10 flex items-center justify-center font-bold text-xl rounded-lg transition-transform group-hover:scale-110 shadow-lg shadow-luxury-gold/20">
              A
            </div>
            <span className={`font-display font-bold text-2xl tracking-tight transition-colors ${
              isScrolled ? 'text-white' : 'text-white drop-shadow-md'
            }`}>
              Amaan<span className="text-luxury-gold">Estate</span>
            </span>
          </Link>
        </div>
        
        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path} 
              className={`text-sm font-medium tracking-wide transition-all hover:text-luxury-gold relative group ${
                isScrolled ? 'text-white/80' : 'text-white drop-shadow-sm'
              }`}
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-luxury-gold transition-all group-hover:w-full"></span>
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-6">
          <Button asChild variant="ghost" className="text-white hover:text-luxury-gold hover:bg-white/5 transition-colors font-medium">
            <Link to="/login">Sign In</Link>
          </Button>
          <Button asChild className="bg-luxury-gold text-luxury-black hover:bg-white transition-all font-semibold shadow-xl shadow-luxury-gold/20 border-0">
            <Link to="/become-agent">List Property</Link>
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="lg:hidden p-2 text-white" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden absolute top-full left-0 w-full bg-luxury-black/95 backdrop-blur-xl border-b border-white/10 p-6 shadow-2xl"
          >
            <nav className="flex flex-col space-y-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.path} 
                  className="text-lg font-medium text-white/90 hover:text-luxury-gold transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-6 border-t border-white/10 flex flex-col space-y-4">
                <Button asChild variant="outline" className="w-full border-white/10 text-white hover:bg-white/5 h-12">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                </Button>
                <Button asChild className="w-full bg-luxury-gold text-luxury-black h-12 font-bold">
                  <Link to="/become-agent" onClick={() => setMobileMenuOpen(false)}>List Property</Link>
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
