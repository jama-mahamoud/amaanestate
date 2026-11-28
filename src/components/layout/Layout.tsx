import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, LayoutDashboard, LogOut, Menu, Search, User, X } from 'lucide-react';
import { getCurrentUserProfile, signOutUser } from '../../services/adminService';
import { SocialLink, DEFAULT_SEED_LINKS, getActiveSocialLinks } from '../../services/socialService';
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
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Social Links state (seeded immediately to prevent footer CLS)
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(DEFAULT_SEED_LINKS);

  // Footer Newsletter State (shown on non-homepage routes so / does not render duplicate newsletter forms)
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);

  const fetchSocialLinks = async () => {
    const links = await getActiveSocialLinks();
    setSocialLinks(links);
  };

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setUserMenuOpen(false);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    let active = true;

    getCurrentUserProfile().then((prof) => {
      if (active) setCurrentUser(prof);
    });

    let idleId: number | null = null;
    let timerId: ReturnType<typeof setTimeout> | null = null;
    const scheduleSocialRefresh = () => {
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        idleId = (window as any).requestIdleCallback(() => {
          if (active) fetchSocialLinks();
        }, { timeout: 1500 });
      } else {
        timerId = setTimeout(() => {
          if (active) fetchSocialLinks();
        }, 400);
      }
    };
    scheduleSocialRefresh();

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
      if (idleId !== null && typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
        (window as any).cancelIdleCallback(idleId);
      }
      if (timerId !== null) clearTimeout(timerId);
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

  const showFooterNewsletter =
    location.pathname !== '/' && location.pathname !== '/newsletter';

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#141413]">
      {/* Clean Responsive Header */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-sm border-b border-[#E5E0D8]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-[72px] flex items-center justify-between gap-x-4 sm:gap-x-6">
          {/* Zone 1: Official AmaanEstate Logo */}
          <Link
            to="/"
            aria-label="AmaanEstate — Global Real Estate Media, Research & Marketplace"
            className="inline-flex items-center shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A5F] rounded"
          >
            <BrandLogo variant="header" className="lg:h-[60px]" />
          </Link>

          {/* Zone 2: Simplified Main Navigation */}
          <nav
            aria-label="Primary navigation"
            className="hidden lg:flex items-center gap-7 text-[13px] font-medium text-[#5C5A55]"
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

          {/* Zone 3: Search Action + Auth Login / Account Action + Mobile/Tablet Drawer Trigger */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <Link
              to="/search"
              aria-label="Search articles"
              title="Search editorial archive"
              className="hidden sm:inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3 py-2 text-xs font-semibold text-[#141413] bg-white border border-[#E5E0D8] hover:border-[#1E3A5F] rounded transition-colors whitespace-nowrap shrink-0"
            >
              <Search size={14} />
              <span>Search</span>
            </Link>

            {currentUser ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((o) => !o)}
                  aria-expanded={userMenuOpen}
                  aria-label="Account menu"
                  className="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-2.5 sm:px-3 py-2 text-xs font-semibold text-white bg-[#1E3A5F] hover:bg-[#162C49] rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <User size={14} />
                  <span className="max-w-[76px] sm:max-w-[96px] truncate">{displayName}</span>
                  <ChevronDown size={13} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-1.5rem)] bg-white border border-[#E5E0D8] rounded shadow-lg py-1.5 z-50">
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
                        className="px-4 py-2.5 text-xs font-semibold text-[#1E3A5F] hover:bg-[#FAF8F5] flex items-center gap-2 min-h-[40px]"
                      >
                        <LayoutDashboard size={14} />
                        <span>Editorial CMS</span>
                      </Link>
                    )}
                    <Link
                      to="/account"
                      onClick={() => setUserMenuOpen(false)}
                      className="px-4 py-2.5 text-xs font-medium text-[#141413] hover:bg-[#FAF8F5] flex items-center gap-2 min-h-[40px]"
                    >
                      <User size={14} />
                      <span>My Account</span>
                    </Link>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full px-4 py-2.5 text-left text-xs font-medium text-[#991B1B] hover:bg-[#FEF2F2] flex items-center gap-2 cursor-pointer min-h-[40px]"
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
                className="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3 sm:px-3.5 py-2 text-xs font-semibold text-white bg-[#1E3A5F] hover:bg-[#162C49] rounded transition-colors whitespace-nowrap shrink-0"
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
              className="lg:hidden min-h-[44px] min-w-[44px] inline-flex items-center justify-center p-2 text-[#141413] hover:bg-[#EBE6DF] rounded transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Navigation Panel */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#FAF8F5] border-t border-[#E5E0D8] px-4 py-4 space-y-3 max-h-[calc(100dvh-3.5rem)] sm:max-h-[calc(100dvh-4.5rem)] overflow-y-auto shadow-lg">
            <nav aria-label="Mobile navigation" className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `min-h-[44px] px-3.5 py-2.5 rounded text-sm font-medium transition-colors flex items-center justify-between ${
                      isActive
                        ? 'bg-[#1E3A5F] text-white font-semibold'
                        : 'text-[#141413] bg-white/60 sm:bg-transparent border border-[#E5E0D8]/60 sm:border-transparent hover:bg-[#EBE6DF]'
                    }`
                  }
                >
                  <span>{link.label}</span>
                </NavLink>
              ))}
            </nav>
            <div className="pt-3 border-t border-[#E5E0D8] flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-end gap-2.5">
              <Link
                to="/search"
                onClick={() => setMobileMenuOpen(false)}
                className="sm:hidden min-h-[44px] w-full py-2.5 px-4 text-center text-sm font-semibold bg-white border border-[#E5E0D8] text-[#141413] rounded inline-flex items-center justify-center gap-1.5"
              >
                <Search size={14} />
                <span>Search Archive</span>
              </Link>
              {currentUser ? (
                <>
                  {isStaff && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="min-h-[44px] flex-1 py-2.5 px-4 text-center text-sm font-semibold bg-[#1E3A5F] text-white rounded inline-flex items-center justify-center"
                    >
                      Editorial CMS
                    </Link>
                  )}
                  <Link
                    to="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="min-h-[44px] flex-1 py-2.5 px-4 text-center text-sm font-semibold bg-[#EFECE6] text-[#141413] rounded inline-flex items-center justify-center"
                  >
                    My Account
                  </Link>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="min-h-[44px] w-full py-2.5 px-4 text-center text-sm font-semibold bg-[#1E3A5F] text-white rounded inline-flex items-center justify-center gap-1.5"
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
      <main className="flex-1 min-w-0">{children}</main>

      {/* International Real Estate Platform Footer */}
      <footer className="bg-white border-t border-[#E5E0D8] mt-12 sm:mt-16 text-[#141413]">
        {/* Newsletter Subscription Bar (for inner pages; homepage renders Section 6 directly in main) */}
        {showFooterNewsletter && (
          <div className="bg-[#FAF8F5] border-b border-[#E5E0D8]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-center justify-between">
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

                <div className="lg:col-span-6 min-w-0">
                  <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2.5 max-w-lg lg:ml-auto">
                    <input
                      type="email"
                      required
                      aria-label="Email address for briefing newsletter"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="flex-1 min-w-0 w-full h-11 px-4 bg-white border border-[#D6CEBE] rounded text-sm text-[#141413] placeholder:text-[#7A7770] focus:outline-none focus:border-[#1E3A5F]"
                    />
                    <button
                      type="submit"
                      disabled={newsletterSubmitting}
                      className="h-11 px-6 bg-[#1E3A5F] hover:bg-[#141413] text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0 w-full sm:w-auto"
                    >
                      {newsletterSubmitting ? 'Subscribing...' : 'Subscribe'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
          {/* Brand Summary & Social Links */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 pb-8 border-b border-[#E5E0D8] items-start">
            <div className="lg:col-span-6 space-y-3.5">
              <Link
                to="/"
                aria-label="AmaanEstate — Global Real Estate Media, Research & Marketplace"
                className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A5F] rounded"
              >
                <BrandLogo variant="footer" />
              </Link>
              <p className="text-sm text-[#4A4843] leading-relaxed max-w-xl">
                AMAAN ESTATE – Global Real Estate Media, Research &amp; Marketplace. Combining international property discovery, city-level market research, and independent real estate journalism.
              </p>
              <p className="text-xs font-serif italic text-[#8C4A27] font-medium">
                Global Real Estate. Informed Decisions.
              </p>
            </div>

            <div className="lg:col-span-6 lg:text-right space-y-2.5">
              <p className="text-[11px] uppercase tracking-widest font-semibold text-[#5C5A55]">
                Follow AMAAN ESTATE
              </p>
              <div className="flex flex-wrap lg:justify-end items-center gap-2">
                {socialLinks.map((link) => (
                  <a
                    key={link.id || link.platform}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={link.name}
                    aria-label={link.name}
                    className="inline-flex items-center gap-2 min-h-[38px] px-3 py-1.5 text-xs font-medium text-[#141413] bg-[#FAF8F5] hover:bg-[#1E3A5F] hover:text-white border border-[#E5E0D8] rounded transition-all duration-200 group"
                  >
                    <SocialIcon platform={link.icon_name || link.platform} size={15} />
                    <span>{link.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* 5 Explicit Footer Link Columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
            {/* Column 1: Explore */}
            <div className="space-y-3">
              <h4 className="text-xs font-sans uppercase tracking-widest font-semibold text-[#141413] border-b border-[#E5E0D8] pb-2">
                Explore
              </h4>
              <ul className="space-y-1 sm:space-y-2.5 text-sm text-[#5C5A55]">
                <li>
                  <Link to="/buy" className="inline-flex items-center min-h-[36px] sm:min-h-0 py-0.5 hover:text-[#141413] transition-colors">
                    Buy
                  </Link>
                </li>
                <li>
                  <Link to="/rent" className="inline-flex items-center min-h-[36px] sm:min-h-0 py-0.5 hover:text-[#141413] transition-colors">
                    Rent
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Global Markets */}
            <div className="space-y-3">
              <h4 className="text-xs font-sans uppercase tracking-widest font-semibold text-[#141413] border-b border-[#E5E0D8] pb-2">
                Global Markets
              </h4>
              <ul className="space-y-1 sm:space-y-2.5 text-sm text-[#5C5A55]">
                <li>
                  <Link to="/global-markets" className="inline-flex items-center min-h-[36px] sm:min-h-0 py-0.5 hover:text-[#141413] transition-colors">
                    Global Markets
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Editorial */}
            <div className="space-y-3">
              <h4 className="text-xs font-sans uppercase tracking-widest font-semibold text-[#141413] border-b border-[#E5E0D8] pb-2">
                Editorial
              </h4>
              <ul className="space-y-1 sm:space-y-2.5 text-sm text-[#5C5A55]">
                <li>
                  <Link to="/investment" className="inline-flex items-center min-h-[36px] sm:min-h-0 py-0.5 hover:text-[#141413] transition-colors">
                    Investment
                  </Link>
                </li>
                <li>
                  <Link to="/architecture" className="inline-flex items-center min-h-[36px] sm:min-h-0 py-0.5 hover:text-[#141413] transition-colors">
                    Architecture
                  </Link>
                </li>
                <li>
                  <Link to="/construction" className="inline-flex items-center min-h-[36px] sm:min-h-0 py-0.5 hover:text-[#141413] transition-colors">
                    Construction
                  </Link>
                </li>
                <li>
                  <Link to="/home-living" className="inline-flex items-center min-h-[36px] sm:min-h-0 py-0.5 hover:text-[#141413] transition-colors">
                    Home &amp; Living
                  </Link>
                </li>
                <li>
                  <Link to="/news" className="inline-flex items-center min-h-[36px] sm:min-h-0 py-0.5 hover:text-[#141413] transition-colors">
                    Global News
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Publication */}
            <div className="space-y-3">
              <h4 className="text-xs font-sans uppercase tracking-widest font-semibold text-[#141413] border-b border-[#E5E0D8] pb-2">
                Publication
              </h4>
              <ul className="space-y-1 sm:space-y-2.5 text-sm text-[#5C5A55]">
                <li>
                  <Link to="/about" className="inline-flex items-center min-h-[36px] sm:min-h-0 py-0.5 hover:text-[#141413] transition-colors">
                    About AMAAN ESTATE
                  </Link>
                </li>
                <li>
                  <Link to="/editorial-policy" className="inline-flex items-center min-h-[36px] sm:min-h-0 py-0.5 hover:text-[#141413] transition-colors">
                    Editorial Policy
                  </Link>
                </li>
                <li>
                  <Link to="/corrections-policy" className="inline-flex items-center min-h-[36px] sm:min-h-0 py-0.5 hover:text-[#141413] transition-colors">
                    Corrections Policy
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="inline-flex items-center min-h-[36px] sm:min-h-0 py-0.5 hover:text-[#141413] transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link to="/newsletter" className="inline-flex items-center min-h-[36px] sm:min-h-0 py-0.5 hover:text-[#141413] transition-colors">
                    Newsletter
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 5: Policies & Trust */}
            <div className="space-y-3">
              <h4 className="text-xs font-sans uppercase tracking-widest font-semibold text-[#141413] border-b border-[#E5E0D8] pb-2">
                Policies &amp; Trust
              </h4>
              <ul className="space-y-1 sm:space-y-2.5 text-sm text-[#5C5A55]">
                <li>
                  <Link to="/privacy-policy" className="inline-flex items-center min-h-[36px] sm:min-h-0 py-0.5 hover:text-[#141413] transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="inline-flex items-center min-h-[36px] sm:min-h-0 py-0.5 hover:text-[#141413] transition-colors">
                    Terms of Use
                  </Link>
                </li>
                <li>
                  <Link to="/cookie-policy" className="inline-flex items-center min-h-[36px] sm:min-h-0 py-0.5 hover:text-[#141413] transition-colors">
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link to="/advertising-disclosure" className="inline-flex items-center min-h-[36px] sm:min-h-0 py-0.5 hover:text-[#141413] transition-colors">
                    Advertising Disclosure
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Footer Bar */}
        <div className="border-t border-[#E5E0D8] bg-[#FAF8F5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#7A7770] text-center sm:text-left">
            <span>&copy; {new Date().getFullYear()} AMAAN ESTATE. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="inline-flex items-center min-h-[36px] sm:min-h-0 hover:text-[#141413] transition-colors">
                Sitemap
              </a>
              <span aria-hidden="true">·</span>
              <a href="/robots.txt" target="_blank" rel="noopener noreferrer" className="inline-flex items-center min-h-[36px] sm:min-h-0 hover:text-[#141413] transition-colors">
                Robots.txt
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
