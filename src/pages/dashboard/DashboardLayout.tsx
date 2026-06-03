import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Home, 
  Car, 
  FileText, 
  Users, 
  Settings, 
  LogOut, 
  Menu,
  X,
  Plus,
  Briefcase,
  ShieldCheck,
  Heart,
  FileSignature,
  User as UserIcon,
  Sparkles
} from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardProvider, useDashboard } from '@/contexts/DashboardContext';
import { BrandHeader } from '@/components/brand/BrandHeader';

function DashboardContent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, logout, loading } = useAuth();

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  }, [logout, navigate]);

  const navItems = useMemo(() => {
    const items = [
      { name: 'Overview', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    ];

    const currentRole = profile?.role?.toString().trim().toLowerCase();
    const isAdmin = currentRole === 'admin' || profile?.role === 'admin';
    const isAgency = currentRole === 'agency' || profile?.role === 'agency';
    const isEditor = isAdmin || currentRole === 'editor' || profile?.role === 'editor';

    if (isAdmin) {
      items.push({ name: 'Content Review', path: '/dashboard/moderation', icon: <ShieldCheck size={18} /> });
      items.push({ name: 'Agencies', path: '/dashboard/agencies-brokers', icon: <Briefcase size={18} /> });
      items.push({ name: 'Contracts', path: '/dashboard/agreements', icon: <FileSignature size={18} /> });
      items.push({ name: 'Analytics', path: '/dashboard/trust', icon: <Sparkles size={18} /> });
      items.push({ name: 'Verification', path: '/dashboard/verification', icon: <ShieldCheck size={18} /> });
      items.push({ name: 'Activity', path: '/dashboard/risk', icon: <Menu size={18} /> }); 
      items.push({ name: 'Jobs', path: '/dashboard/jobs', icon: <Briefcase size={18} /> });
    }

    if (isAgency) {
      items.push({ name: 'Account', path: '/dashboard/profile', icon: <Briefcase size={18} /> });
      items.push({ name: 'Properties', path: '/dashboard/properties', icon: <Home size={18} /> });
    } else {
      items.push({ name: 'Properties', path: '/dashboard/properties', icon: <Home size={18} /> });
      items.push({ name: 'Vehicles', path: '/dashboard/vehicles', icon: <Car size={18} /> });
    }
    
    items.push({ name: 'Saved', path: '/dashboard/favorites', icon: <Heart size={18} /> });
    if (!isAgency) {
        items.push({ name: 'Account', path: '/dashboard/profile', icon: <UserIcon size={18} /> });
    }

    if (isEditor) {
      items.push({ name: 'Articles', path: '/dashboard/articles', icon: <FileText size={18} /> });
    }

    if (isAdmin) {
      items.push({ name: 'Directory', path: '/dashboard/users', icon: <Users size={18} /> });
    }

    items.push({ name: 'Settings', path: '/dashboard/settings', icon: <Settings size={18} /> });
    return items;
  }, [profile?.role]);

  if (loading) return null;

  return (
    <div className="flex min-h-screen bg-luxury-black text-white selection:bg-luxury-gold/30">
      {/* Mobile Sidebar Overlay Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 sm:w-80 bg-[#0a0a0a] border-r border-white/5 transform transition-transform duration-500 ease-luxury lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 sm:p-10 flex items-center justify-between">
            <BrandHeader size="sm" />
            <Button variant="ghost" size="icon" className="lg:hidden text-white/60 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
              <X size={20} />
            </Button>
          </div>

          <div className="px-6 mb-4 sm:mb-8 text-[10px] uppercase tracking-wider font-bold text-white/30 ml-4">
             Workspace
          </div>

          <div className="flex-1 px-4 sm:px-6 overflow-y-auto space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative ${
                    isActive 
                      ? 'bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/10 shadow-[0_4px_20px_rgba(197,160,89,0.05)] font-medium' 
                      : 'text-white/60 border border-transparent hover:bg-white/[0.03] hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="active-nav-glow"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#C5A059]/5 to-transparent pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                  <span className={isActive ? 'text-[#C5A059]' : 'text-white/40 group-hover:text-[#C5A059] transition-colors shrink-0'}>
                    {item.icon}
                  </span>
                  <span className="text-xs transition-colors font-sans">{item.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
            <div className="glass-card p-4 sm:p-5 rounded-2xl sm:rounded-[1.25rem] relative overflow-hidden group border border-white/5 bg-[#111]/80 backdrop-blur-xl">
              <div className="absolute top-0 right-0 w-20 h-20 bg-luxury-gold/5 blur-2xl rounded-full" />
              <div className="flex items-center gap-3 relative z-10">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#C5A059] to-[#E6C587] p-[1.5px] shrink-0">
                    <div className="w-full h-full rounded-full bg-[#111] flex items-center justify-center text-luxury-gold text-xs font-bold">
                      {user?.displayName ? user.displayName.substring(0, 2).toUpperCase() : 'SO'}
                    </div>
                  </div>
                  {/* Subtle online indicator pill */}
                  <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-[#111] animate-pulse" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold text-white truncate tracking-tight uppercase">
                    {user?.displayName || 'System Operator'}
                  </p>
                  <p className="inline-block mt-1 px-1.5 py-0.5 rounded-md text-[8px] text-[#C5A059] bg-[#C5A059]/10 border border-[#C5A059]/20 uppercase tracking-widest font-bold">
                    {profile?.role?.replace('_', ' ') || 'User'}
                  </p>
                </div>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start text-white/60 hover:text-white hover:bg-white/5 rounded-2xl h-14 sm:h-16 px-4 sm:px-6 transition-all group"
              onClick={handleLogout}
            >
              <LogOut size={18} className="mr-3 sm:mr-4 group-hover:translate-x-1 transition-transform" />
              <span className="text-[10px] uppercase tracking-widest font-bold">Log Out</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 sm:h-24 border-b border-white/5 flex items-center justify-between px-4 sm:px-10 bg-luxury-black/60 backdrop-blur-2xl sticky top-0 z-40">
          <div className="flex items-center gap-4 sm:gap-6 min-w-0">
            <Button variant="ghost" size="icon" className="lg:hidden text-white/55 hover:text-white shrink-0" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={22} />
            </Button>
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl font-display font-light tracking-tight text-white truncate">
                {navItems.find(i => i.path === location.pathname)?.name || 'Dashboard'}
              </h2>
              <p className="text-[11px] text-white/40 hidden sm:block">Workspace content control</p>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
             <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 hover:border-luxury-gold hover:bg-white/10 transition-all duration-500 cursor-pointer group">
                <Users size={16} className="text-white/20 group-hover:text-luxury-gold transition-colors" />
             </div>
          </div>
        </header>

        <main className="p-4 sm:p-8 lg:p-16 max-w-[1600px] mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}
