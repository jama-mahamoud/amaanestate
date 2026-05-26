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
import BrandLogo from '@/components/brand/BrandLogo';

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
      items.push({ name: 'Moderation', path: '/dashboard/moderation', icon: <ShieldCheck size={18} /> });
      items.push({ name: 'Agencies & Brokers', path: '/dashboard/agencies-brokers', icon: <Briefcase size={18} /> });
      items.push({ name: 'Agreements', path: '/dashboard/agreements', icon: <FileSignature size={18} /> });
      items.push({ name: 'Insights', path: '/dashboard/trust', icon: <Sparkles size={18} /> });
      items.push({ name: 'Verification', path: '/dashboard/verification', icon: <ShieldCheck size={18} /> });
      items.push({ name: 'Activity Logs', path: '/dashboard/risk', icon: <Menu size={18} /> }); 
    }

    if (isAgency) {
      items.push({ name: 'Agency Profile', path: '/dashboard/profile', icon: <Briefcase size={18} /> });
      items.push({ name: 'Listings', path: '/dashboard/properties', icon: <Home size={18} /> });
    } else {
      items.push({ name: 'My Properties', path: '/dashboard/properties', icon: <Home size={18} /> });
      items.push({ name: 'My Vehicles', path: '/dashboard/vehicles', icon: <Car size={18} /> });
    }
    
    items.push({ name: 'Favorites', path: '/dashboard/favorites', icon: <Heart size={18} /> });
    if (!isAgency) {
        items.push({ name: 'Profile', path: '/dashboard/profile', icon: <UserIcon size={18} /> });
    }

    if (isEditor) {
      items.push({ name: 'Articles', path: '/dashboard/articles', icon: <FileText size={18} /> });
    }

    if (isAdmin) {
      items.push({ name: 'Registry', path: '/dashboard/users', icon: <Users size={18} /> });
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
            <Link to="/" className="flex items-center group">
              <BrandLogo size="sm" />
            </Link>
            <Button variant="ghost" size="icon" className="lg:hidden text-white/60 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
              <X size={20} />
            </Button>
          </div>

          <div className="px-6 mb-4 sm:mb-8 text-[9px] uppercase tracking-[0.4em] font-bold text-white/50 ml-4">
             Management
          </div>

          <div className="flex-1 px-4 sm:px-6 overflow-y-auto space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-4 px-4 sm:px-6 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl transition-all duration-300 group relative ${
                  location.pathname === item.path 
                    ? 'bg-white/10 text-white font-bold' 
                    : 'text-white/70 hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                {location.pathname === item.path && (
                  <motion.div 
                    layoutId="active-nav"
                    className="absolute left-0 w-1 h-6 bg-luxury-gold rounded-full"
                  />
                )}
                <span className={location.pathname === item.path ? 'text-luxury-gold' : 'text-white/60 group-hover:text-luxury-gold transition-colors'}>
                  {item.icon}
                </span>
                <span className={`text-[10px] sm:text-[11px] uppercase tracking-[0.2em] transition-colors ${
                  location.pathname === item.path ? 'text-white font-bold' : 'text-white/70 group-hover:text-white'
                }`}>{item.name}</span>
              </Link>
            ))}
          </div>

          <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
            <div className="glass-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-luxury-gold/5 blur-2xl rounded-full" />
              <p className="text-[9px] uppercase tracking-[0.4em] font-bold text-white/40 mb-3 sm:mb-4">User Profile</p>
              <div className="flex items-center gap-3.5 relative z-10">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[1rem] bg-white/5 border border-white/15 flex items-center justify-center text-luxury-gold group-hover:scale-110 transition-transform duration-500 shrink-0">
                  <Briefcase size={16} className="sm:size-[20px]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate tracking-tight uppercase">
                    {user?.displayName || 'System Operator'}
                  </p>
                  <p className="text-[9px] text-white/60 uppercase font-black tracking-widest leading-none mt-1 truncate">Role: {profile?.role?.replace('_', ' ') || 'Pending'}</p>
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
              <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-bold tracking-tighter text-white truncate">
                {navItems.find(i => i.path === location.pathname)?.name || 'Dashboard'}
              </h2>
              <p className="text-[9px] uppercase tracking-[0.3em] text-white/20 font-bold hidden sm:block">Active Connection</p>
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
