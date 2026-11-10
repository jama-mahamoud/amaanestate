import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Sparkles, Phone, Mail, MapPin, ArrowRight } from 'lucide-react';
import { BrandHeader } from '../brand/BrandHeader';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/properties', label: 'All Properties' },
    { to: '/buy', label: 'Buy' },
    { to: '/rent', label: 'Rent' },
    { to: '/land', label: 'Land' },
    { to: '/commercial', label: 'Commercial' },
    { to: '/agents', label: 'Agents' },
    { to: '/articles', label: 'Articles' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' }
  ];

  return (
    <div className="min-h-screen bg-[#050508] text-neutral-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 bg-[#050508]/80 backdrop-blur-md border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo */}
          <div className="flex-shrink-0 flex items-center">
            <BrandHeader size="sm" theme="dark" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-1 xl:space-x-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `
                  px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-white/[0.04] text-cyan-400 font-semibold' 
                    : 'text-neutral-400 hover:text-white hover:bg-white/[0.02]'
                  }
                `}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Action Button: AI Search Trigger */}
          <div className="hidden lg:flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/properties')}
              className="border-neutral-800 hover:bg-white/[0.04] text-xs font-medium cursor-pointer"
            >
              Search Hub
            </Button>
            <Button
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-medium text-xs flex items-center gap-1.5 shadow-lg shadow-blue-500/10 border-0 cursor-pointer"
            >
              <Sparkles size={13} className="text-cyan-200 animate-pulse" />
              <span>AI Assistant</span>
            </Button>
          </div>

          {/* Mobile Navigation Toggle */}
          <div className="flex lg:hidden items-center space-x-2">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger className="text-neutral-400 hover:text-white p-2 shrink-0 cursor-pointer">
                <Menu size={24} />
              </SheetTrigger>
              <SheetContent side="right" className="bg-[#08080f] border-l border-neutral-900 p-6 text-white w-80">
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-8 border-b border-neutral-900 pb-4">
                      <BrandHeader size="sm" theme="dark" />
                    </div>
                    <nav className="flex flex-col space-y-3">
                      {navLinks.map((link) => (
                        <NavLink
                          key={link.to}
                          to={link.to}
                          onClick={() => setMobileOpen(false)}
                          className={({ isActive }) => `
                            px-3 py-2.5 rounded-xl text-base font-medium transition-all duration-200 block
                            ${isActive 
                              ? 'bg-neutral-900 text-cyan-400 font-bold border-l-2 border-cyan-400 rounded-l-none' 
                              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
                            }
                          `}
                        >
                          {link.label}
                        </NavLink>
                      ))}
                    </nav>
                  </div>

                  <div className="border-t border-neutral-900 pt-6 space-y-3">
                    <Button
                      onClick={() => { setMobileOpen(false); navigate('/properties'); }}
                      variant="outline"
                      className="w-full border-neutral-800 text-white justify-center py-2.5"
                    >
                      Browse Properties
                    </Button>
                    <Button
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white justify-center py-2.5"
                    >
                      <Sparkles size={14} className="text-cyan-200" />
                      <span>Chat with AI</span>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Professional Footer */}
      <footer className="bg-[#030306] border-t border-white/[0.03] pt-16 pb-8 text-neutral-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          <div className="space-y-4">
            <BrandHeader size="md" theme="dark" className="!-ml-3" />
            <p className="text-xs text-neutral-500 leading-relaxed max-w-sm">
              The premier, digital property marketplace and location-centric discovery platform for Jigjiga, the Somali Region, and East Africa.
            </p>
          </div>

          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-4 font-mono">Marketplace</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/buy" className="hover:text-white transition-colors">Properties for Sale</Link></li>
              <li><Link to="/rent" className="hover:text-white transition-colors">Properties for Rent</Link></li>
              <li><Link to="/land" className="hover:text-white transition-colors">Land Parcels</Link></li>
              <li><Link to="/commercial" className="hover:text-white transition-colors">Commercial Estates</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-4 font-mono">Company</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/agents" className="hover:text-white transition-colors">Trusted Agents</Link></li>
              <li><Link to="/articles" className="hover:text-white transition-colors">Market Intelligence</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-2 font-mono">Contact Info</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-neutral-500">
                <MapPin size={14} className="text-neutral-400 flex-shrink-0" />
                <span>Jigjiga, Somali Region, Ethiopia</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-500">
                <Phone size={14} className="text-neutral-400 flex-shrink-0" />
                <span>[Contact Phone Pending Configuration]</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-500">
                <Mail size={14} className="text-neutral-400 flex-shrink-0" />
                <span>[Contact Email Pending Configuration]</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/[0.02] pt-8 flex flex-col sm:flex-row items-center justify-between text-xxs text-neutral-600 font-mono">
          <span>&copy; {new Date().getFullYear()} AmaanEstate. All rights reserved.</span>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <a href="#" className="hover:text-neutral-400 transition-colors">Terms of Service</a>
            <span>&bull;</span>
            <a href="#" className="hover:text-neutral-400 transition-colors">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
