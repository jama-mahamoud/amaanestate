import { Link } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { appUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Properties', path: '/properties' },
    { name: 'Vehicles', path: '/vehicles' },
    { name: 'News', path: '/news' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto max-w-7xl px-4 flex h-20 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gold text-white p-2 flex items-center justify-center font-bold text-xl rounded">
              AE
            </div>
            <span className="hidden sm:inline-block font-bold text-2xl tracking-tight">
              Amaan<span className="text-gold">Estate</span>
            </span>
          </Link>
        </div>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 font-medium">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path} 
              className="text-sm transition-colors hover:text-gold"
            >
              {link.name}
            </Link>
          ))}
          {appUser && (appUser.role === 'admin' || appUser.role === 'agent') && (
            <>
              <Link to="/dashboard/properties" className="text-sm transition-colors hover:text-gold">Add Property</Link>
              <Link to="/dashboard/vehicles" className="text-sm transition-colors hover:text-gold">Add Vehicle</Link>
            </>
          )}
          {appUser && appUser.role === 'admin' && (
            <Link to="/dashboard/users" className="text-sm transition-colors hover:text-gold">Manage Agents</Link>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Button asChild variant="outline" className="border-gold text-gold hover:bg-gold hover:text-white">
            <Link to="/become-agent">List Property</Link>
          </Button>
          {appUser ? (
            <Button asChild className="bg-black hover:bg-gold transition-colors text-white">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild className="hover:text-gold">
                <Link to="/login">Sign In</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white p-4">
          <nav className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path} 
                className="text-sm font-medium transition-colors hover:text-gold"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 border-t flex flex-col space-y-2">
              {appUser ? (
                <>
                  <Button asChild className="w-full bg-gold text-white" variant="outline">
                    <Link to="/become-agent" onClick={() => setMobileMenuOpen(false)}>List Property</Link>
                  </Button>
                  <Button asChild className="w-full bg-black">
                    <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline" className="w-full border-gold text-gold">
                    <Link to="/become-agent" onClick={() => setMobileMenuOpen(false)}>List Property</Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full">
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
