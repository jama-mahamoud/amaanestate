import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ChevronDown, LayoutDashboard, LogOut, Menu, Search, User, X } from 'lucide-react';
import { getCurrentUserProfile, signOutUser } from '../../services/adminService';
import { SocialLink, getActiveSocialLinks } from '../../services/socialService';
import { subscribeNewsletter } from '../../services/editorialService';
import { SocialIcon } from './SocialIcons';
import BrandLogo from './BrandLogo';
import { supabase } from '../../lib/supabase';
import { Profile } from '../../types';
import { toast } from 'sonner';

interface LayoutProps {
  children: React.ReactNode;
}

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/buy', label: 'Buy' },
  { to: '/rent', label: 'Rent' },
  { to: '/search', label: 'Search' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);

  // Social Links state
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  // Footer Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);

  const fetchSocialLinks = async () => {
    const links = await getActiveSocialLinks();
    setSocialLinks(links);
  };

  useEffect(() => {
    let active = true;

    getCurrentUserProfile().then((prof) => {
      if (active) setCurrentUser(prof);
    });

    fetchSocialLinks();

    const handleSocialUpdate = () => {
      fetchSocialLinks();
    };

    window.addEventListener('social_links_updated', handleSocialUpdate);

    const sub = supabase?.auth.onAuthStateChange(async (event) => {
      if (!active) return;
      if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
      } else {
        const prof = await getCurrentUserProfile();
        if (active) setCurrentUser(prof);
      }
    });

    return () => {
      active = false;
      window.removeEventListener('social_links_updated', handleSocialUpdate);
      sub?.data.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    await signOutUser();
    setCurrentUser(null);
    navigate('/', { replace: true });
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setNewsletterSubmitting(true);
    const res = await subscribeNewsletter(newsletterEmail, 'footer-subscription');
    setNewsletterSubmitting(false);

    if (res.success) {
      toast.success(res.message || 'Thank you for subscribing to AMAAN ESTATE briefings.');
      setNewsletterEmail('');
    } else {
      toast.error(res.message || 'Unable to complete subscription.');
    }
  };

  const roleName = currentUser?.role?.name;
  const isStaff = roleName === 'admin' || roleName === 'editor';
  const displayName =
    currentUser?.full_name?.trim().split(/\s+/)[0] ||
    currentUser?.email?.split('@')[0] ||
    'Account';

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#141413]">
      {/* Clean Single-Row Editorial Header */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-sm border-b border-[#E5E0D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-[72px] flex items-center justify-between gap-4 sm:gap-6">
          {/* Zone 1: Official AmaanEstate Logo */}
          <Link
            to="/"
            aria-label="AmaanEstate — Global Real Estate Media, Research & Marketplace"
            className="inline-flex items-center shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A5F] rounded"
          >
            <BrandLogo variant="header" />
          </Link>

          {/* Zone 2: Clean Typographic Navigation */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-5 lg:gap-7 text-sm font-medium text-[#5C5A55]"
          >
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `whitespace-nowrap shrink-0 py-1 transition-colors border-b-2 ${
                    isActive
                      ? 'text-[#141413] border-[#1E3A5F] font-semibold'
                      : 'border-transparent hover:text-[#141413] hover:border-[#D6CEBE]'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Zone 3: Tablet Search + Auth Login / Account Action + Mobile Drawer Trigger */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <Link
              to="/search"
              aria-label="Search articles"
              className="hidden sm:inline-flex md:hidden items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#141413] bg-white border border-[#E5E0D8] hover:border-[#1E3A5F] rounded transition-colors whitespace-nowrap shrink-0"
            >
              <Search size={14} />
              <span>Search</span>
            </Link>

            {currentUser ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((o) => !o)}
                  aria-expanded={userMenuOpen}
                  aria-label="Account menu"
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#1E3A5F] hover:bg-[#162C49] rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <User size={14} />
                  <span className="max-w-[90px] truncate">{displayName}</span>
                  <ChevronDown size={13} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-[#E5E0D8] rounded shadow-lg py-1.5 z-50">
                    <div className="px-4 py-2 border-b border-[#E5E0D8]">
                      <div className="text-xs font-semibold text-[#141413] truncate">
                        {currentUser.full_name || currentUser.email}
                      </div>
                      <div className="text-[11px] font-mono text-[#7A7770] truncate">
                        {currentUser.email}
                      </div>
                    </div>
                    {isStaff && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="px-4 py-2 text-xs font-semibold text-[#1E3A5F] hover:bg-[#FAF8F5] flex items-center gap-2"
                      >
                        <LayoutDashboard size={14} />
                        <span>Editorial CMS</span>
                      </Link>
                    )}
                    <Link
                      to="/account"
                      onClick={() => setUserMenuOpen(false)}
                      className="px-4 py-2 text-xs font-medium text-[#141413] hover:bg-[#FAF8F5] flex items-center gap-2"
                    >
                      <User size={14} />
                      <span>My Account</span>
                    </Link>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full px-4 py-2 text-left text-xs font-medium text-[#991B1B] hover:bg-[#FEF2F2] flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                aria-label="Login or create account"
                className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs font-semibold text-white bg-[#1E3A5F] hover:bg-[#162C49] rounded transition-colors whitespace-nowrap shrink-0"
              >
                <User size={14} />
                <span>Login</span>
              </Link>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              className="md:hidden p-2 text-[#141413] hover:bg-[#EBE6DF] rounded transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Navigation Panel */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#FAF8F5] border-t border-[#E5E0D8] px-4 py-5 space-y-3">
            <nav aria-label="Mobile navigation" className="grid grid-cols-3 gap-2">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-3 py-2.5 rounded text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#1E3A5F] text-white font-semibold'
                        : 'text-[#141413] hover:bg-[#EBE6DF]'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
            <div className="pt-3 border-t border-[#E5E0D8] flex flex-wrap items-center justify-end gap-2.5">
              {currentUser ? (
                <>
                  {isStaff && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex-1 py-2.5 px-4 text-center text-sm font-semibold bg-[#1E3A5F] text-white rounded"
                    >
                      Editorial CMS
                    </Link>
                  )}
                  <Link
                    to="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2.5 px-4 text-center text-sm font-semibold bg-[#EFECE6] text-[#141413] rounded"
                  >
                    My Account
                  </Link>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 px-4 text-center text-sm font-semibold bg-[#1E3A5F] text-white rounded inline-flex items-center justify-center gap-1.5"
                >
                  <User size={14} />
                  <span>Login</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Premium International Editorial Publication Footer */}
      <footer className="bg-white border-t border-[#E5E0D8] mt-16 text-[#141413]">
        {/* Newsletter Subscription Bar */}
        <div className="bg-[#FAF8F5] border-b border-[#E5E0D8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center justify-between">
              <div className="lg:col-span-6 space-y-1.5">
                <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#8C4A27]">
                  Global Real Estate Briefing
                </p>
                <h3 className="text-xl sm:text-2xl font-serif font-semibold text-[#141413]">
                  Stay Informed. Think Globally.
                </h3>
                <p className="text-xs sm:text-sm text-[#5C5A55] max-w-lg leading-relaxed">
                  Receive selected property research, market insights and international real estate developments in your inbox.
                </p>
              </div>

              <div className="lg:col-span-6">
                <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2.5 max-w-lg lg:ml-auto">
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="flex-1 h-11 px-4 bg-white border border-[#D6CEBE] rounded text-sm text-[#141413] placeholder:text-[#7A7770] focus:outline-none focus:border-[#1E3A5F]"
                  />
                  <button
                    type="submit"
                    disabled={newsletterSubmitting}
                    className="h-11 px-6 bg-[#1E3A5F] hover:bg-[#141413] text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0"
                  >
                    {newsletterSubmitting ? 'Subscribing...' : 'Subscribe'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Main Editorial & Marketplace Footer Layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-10">
          
          {/* Column 1: Brand & About (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-5">
            <Link
              to="/"
              aria-label="AmaanEstate — Global Real Estate Media, Research & Marketplace"
              className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A5F] rounded"
            >
              <BrandLogo variant="footer" />
            </Link>
            
            <p className="text-sm text-[#4A4843] leading-relaxed max-w-md">
              AmaanEstate is a global real estate platform providing property market news, housing research, investment insights, market analysis, and property discovery.
            </p>

            <div className="pt-1">
              <p className="text-xs font-serif italic text-[#8C4A27] font-medium border-l-2 border-[#8C4A27] pl-3 py-0.5">
                Global Real Estate Media, Research &amp; Marketplace.
              </p>
            </div>

            {/* Dynamic Social Media Links with Recognizable Icons */}
            <div className="pt-3 space-y-2.5">
              <p className="text-[11px] uppercase tracking-widest font-semibold text-[#5C5A55]">
                Follow AMAAN ESTATE
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {socialLinks.map((link) => (
                  <a
                    key={link.id || link.platform}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={link.name}
                    aria-label={link.name}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[#141413] bg-[#FAF8F5] hover:bg-[#1E3A5F] hover:text-white border border-[#E5E0D8] rounded transition-all duration-200 group"
                  >
                    <SocialIcon platform={link.icon_name || link.platform} size={15} />
                    <span>{link.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Marketplace (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="text-xs font-sans uppercase tracking-widest font-semibold text-[#141413] border-b border-[#E5E0D8] pb-2">
              Marketplace
            </h4>
            <ul className="space-y-2.5 text-sm text-[#5C5A55]">
              <li>
                <Link to="/buy" className="hover:text-[#141413] transition-colors">
                  Buy Property
                </Link>
              </li>
              <li>
                <Link to="/rent" className="hover:text-[#141413] transition-colors">
                  Rent Property
                </Link>
              </li>
              <li>
                <Link to="/buy?type=house" className="hover:text-[#141413] transition-colors">
                  Houses for Sale
                </Link>
              </li>
              <li>
                <Link to="/buy?type=apartment" className="hover:text-[#141413] transition-colors">
                  Apartments for Sale
                </Link>
              </li>
              <li>
                <Link to="/rent?type=apartment" className="hover:text-[#141413] transition-colors">
                  Apartments for Rent
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Editorial Categories (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="text-xs font-sans uppercase tracking-widest font-semibold text-[#141413] border-b border-[#E5E0D8] pb-2">
              Editorial
            </h4>
            <ul className="space-y-2.5 text-sm text-[#5C5A55]">
              <li>
                <Link to="/investment" className="hover:text-[#141413] transition-colors">
                  Investment
                </Link>
              </li>
              <li>
                <Link to="/architecture" className="hover:text-[#141413] transition-colors">
                  Architecture
                </Link>
              </li>
              <li>
                <Link to="/construction" className="hover:text-[#141413] transition-colors">
                  Construction
                </Link>
              </li>
              <li>
                <Link to="/home-living" className="hover:text-[#141413] transition-colors">
                  Home &amp; Living
                </Link>
              </li>
              <li>
                <Link to="/news" className="hover:text-[#141413] transition-colors">
                  Global News
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: About & Publication (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="text-xs font-sans uppercase tracking-widest font-semibold text-[#141413] border-b border-[#E5E0D8] pb-2">
              Publication
            </h4>
            <ul className="space-y-2.5 text-sm text-[#5C5A55]">
              <li>
                <Link to="/about" className="hover:text-[#141413] transition-colors">
                  About AMAAN ESTATE
                </Link>
              </li>
              <li>
                <Link to="/editorial-policy" className="hover:text-[#141413] transition-colors">
                  Editorial Policy
                </Link>
              </li>
              <li>
                <Link to="/corrections-policy" className="hover:text-[#141413] transition-colors">
                  Corrections Policy
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#141413] transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/newsletter" className="hover:text-[#141413] transition-colors">
                  Newsletter
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Policies & Transparency (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="text-xs font-sans uppercase tracking-widest font-semibold text-[#141413] border-b border-[#E5E0D8] pb-2">
              Policies &amp; Trust
            </h4>
            <ul className="space-y-2.5 text-sm text-[#5C5A55]">
              <li>
                <Link to="/privacy-policy" className="hover:text-[#141413] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-[#141413] transition-colors">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link to="/cookie-policy" className="hover:text-[#141413] transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link to="/advertising-disclosure" className="hover:text-[#141413] transition-colors">
                  Advertising Disclosure
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Footer Bar */}
        <div className="border-t border-[#E5E0D8] bg-[#FAF8F5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#7A7770]">
            <span>&copy; {new Date().getFullYear()} AMAAN ESTATE. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:text-[#141413] transition-colors">
                Sitemap
              </a>
              <span aria-hidden="true">·</span>
              <a href="/robots.txt" target="_blank" rel="noopener noreferrer" className="hover:text-[#141413] transition-colors">
                Robots.txt
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
