import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ChevronDown, LayoutDashboard, LogOut, Menu, Search, User, X } from 'lucide-react';
import { getCurrentUserProfile, signOutUser } from '../../services/adminService';
import { supabase } from '../../lib/supabase';
import { Profile } from '../../types';

interface LayoutProps {
  children: React.ReactNode;
}

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/investment', label: 'Investment' },
  { to: '/architecture', label: 'Architecture' },
  { to: '/construction', label: 'Construction' },
  { to: '/home-living', label: 'Home & Living' },
  { to: '/news', label: 'News' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);

  useEffect(() => {
    let active = true;
    getCurrentUserProfile().then((prof) => {
      if (active) setCurrentUser(prof);
    });

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 sm:gap-6">
          {/* Zone 1: Single-line Wordmark */}
          <Link
            to="/"
            className="font-serif text-lg sm:text-2xl font-bold tracking-tight text-[#141413] whitespace-nowrap shrink-0"
          >
            AMAAN ESTATE
          </Link>

          {/* Zone 2: Clean Typographic Navigation */}
          <nav
            aria-label="Primary navigation"
            className="hidden xl:flex items-center gap-6 text-sm font-medium text-[#5C5A55]"
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

          {/* Zone 3: Search + Auth Login / Account Action + Mobile Drawer Trigger */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <Link
              to="/search"
              aria-label="Search articles"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#141413] bg-white border border-[#E5E0D8] hover:border-[#1E3A5F] rounded transition-colors whitespace-nowrap shrink-0"
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
              className="xl:hidden p-2 text-[#141413] hover:bg-[#EBE6DF] rounded transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Navigation Panel */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-[#FAF8F5] border-t border-[#E5E0D8] px-4 py-5 space-y-3">
            <nav aria-label="Mobile navigation" className="grid grid-cols-2 gap-2">
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
            <div className="pt-3 border-t border-[#E5E0D8] flex flex-wrap items-center justify-between gap-2.5">
              <Link
                to="/search"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2.5 px-4 text-center text-sm font-semibold bg-white border border-[#E5E0D8] rounded text-[#141413]"
              >
                Search Articles
              </Link>
              {currentUser ? (
                <>
                  {isStaff && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2.5 px-4 text-center text-sm font-semibold bg-[#1E3A5F] text-white rounded"
                    >
                      Editorial CMS
                    </Link>
                  )}
                  <Link
                    to="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 px-4 text-center text-sm font-semibold bg-[#EFECE6] text-[#141413] rounded"
                  >
                    My Account
                  </Link>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-4 text-center text-sm font-semibold bg-[#1E3A5F] text-white rounded inline-flex items-center gap-1.5"
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

      {/* Editorial Publication Footer */}
      <footer className="bg-white border-t border-[#E5E0D8] mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2 space-y-3">
            <Link to="/" className="font-serif text-2xl font-bold tracking-tight text-[#141413] block">
              AMAAN ESTATE
            </Link>
            <p className="text-sm text-[#5C5A55] max-w-md leading-relaxed">
              An international real estate media, research, and knowledge platform covering global property investment, architecture, construction technology, home living, and industry developments.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-5 text-xs font-medium text-[#5C5A55]">
              <a href="https://x.com/amaanestate" target="_blank" rel="noreferrer" className="hover:text-[#141413] underline">
                X / Twitter
              </a>
              <a href="https://linkedin.com/company/amaanestate" target="_blank" rel="noreferrer" className="hover:text-[#141413] underline">
                LinkedIn
              </a>
              <a href="https://instagram.com/amaanestate" target="_blank" rel="noreferrer" className="hover:text-[#141413] underline">
                Instagram
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-sans uppercase tracking-widest font-semibold text-[#141413]">
              Sections
            </h3>
            <ul className="space-y-2 text-sm text-[#5C5A55]">
              <li><Link to="/investment" className="hover:text-[#141413]">Investment</Link></li>
              <li><Link to="/architecture" className="hover:text-[#141413]">Architecture</Link></li>
              <li><Link to="/construction" className="hover:text-[#141413]">Construction</Link></li>
              <li><Link to="/home-living" className="hover:text-[#141413]">Home &amp; Living</Link></li>
              <li><Link to="/news" className="hover:text-[#141413]">Global News</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-sans uppercase tracking-widest font-semibold text-[#141413]">
              Publication
            </h3>
            <ul className="space-y-2 text-sm text-[#5C5A55]">
              <li><Link to="/about" className="hover:text-[#141413]">About</Link></li>
              <li><Link to="/editorial-policy" className="hover:text-[#141413]">Editorial Policy</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-[#141413]">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-[#141413]">Terms of Use</Link></li>
              <li><Link to="/contact" className="hover:text-[#141413]">Contact</Link></li>
              <li><Link to="/newsletter" className="hover:text-[#141413]">Newsletter</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#E5E0D8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#7A7770]">
            <span>&copy; {new Date().getFullYear()} AMAAN ESTATE (amaanestate.com). All rights reserved.</span>
            <div className="flex items-center gap-4">
              <a href="/sitemap.xml" className="hover:text-[#141413]">Sitemap</a>
              <span aria-hidden="true">·</span>
              <a href="/robots.txt" className="hover:text-[#141413]">Robots</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
