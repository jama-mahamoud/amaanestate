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
  Briefcase
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import { useAuth } from '@/contexts/AuthContext';
import ListingCreationModal from '@/components/listing/ListingCreationModal';
import { DashboardProvider, useDashboard } from '@/contexts/DashboardContext';

function DashboardContent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();
  const { isListingModalOpen, closeListingModal, openListingModal, listingCategory } = useDashboard();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const navItems = [
    { name: 'Portfolio', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Properties', path: '/dashboard/properties', icon: <Home size={18} /> },
    { name: 'Vehicles', path: '/dashboard/vehicles', icon: <Car size={18} /> },
  ];

  if (profile?.role === 'admin' || profile?.role === 'editor') {
    navItems.push({ name: 'Articles', path: '/dashboard/articles', icon: <FileText size={18} /> });
  }

  if (profile?.role === 'admin') {
    navItems.push({ name: 'Registry', path: '/dashboard/users', icon: <Users size={18} /> });
  }

  navItems.push({ name: 'Settings', path: '/dashboard/settings', icon: <Settings size={18} /> });

  return (
    <div className="flex min-h-screen bg-luxury-black text-white selection:bg-luxury-gold/30">
      {/* Sidebar stays same ... */}
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-80 bg-[#0a0a0a] border-r border-white/5 transform transition-transform duration-500 ease-luxury lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-10 flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="bg-luxury-gold text-luxury-black w-10 h-10 flex items-center justify-center font-display font-black text-xl rounded-xl transition-all duration-500 group-hover:rotate-3 shadow-xl shadow-luxury-gold/10">
                A
              </div>
              <span className="font-display font-bold text-2xl tracking-tighter">Amaan<span className="gold-text-gradient">Estate</span></span>
            </Link>
            <Button variant="ghost" size="icon" className="lg:hidden text-white/20 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
              <X size={20} />
            </Button>
          </div>

          <div className="px-6 mb-8 text-[9px] uppercase tracking-[0.4em] font-bold text-white/10 ml-4">
             Management Protocol
          </div>

          <nav className="flex-1 px-6 space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group relative ${
                  location.pathname === item.path 
                    ? 'bg-white/5 text-luxury-gold font-bold' 
                    : 'text-white/20 hover:bg-white/[0.02] hover:text-white'
                }`}
              >
                {location.pathname === item.path && (
                  <motion.div 
                    layoutId="active-nav"
                    className="absolute left-0 w-1 h-6 bg-luxury-gold rounded-full"
                  />
                )}
                <span className={location.pathname === item.path ? 'text-luxury-gold' : 'text-white/20 group-hover:text-luxury-gold transition-colors'}>
                  {item.icon}
                </span>
                <span className="text-[11px] uppercase tracking-[0.2em]">{item.name}</span>
              </Link>
            ))}
          </nav>

          <div className="p-8 space-y-6">
            <div className="glass-card p-6 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-luxury-gold/5 blur-2xl rounded-full" />
              <p className="text-[9px] uppercase tracking-[0.4em] font-bold text-white/10 mb-4">Authority Hub</p>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-[1rem] bg-white/5 border border-white/5 flex items-center justify-center text-luxury-gold group-hover:scale-110 transition-transform duration-500">
                  <Briefcase size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate tracking-tight uppercase">
                    {user?.displayName || 'System Operator'}
                  </p>
                  <p className="text-[9px] text-white/20 uppercase font-black tracking-widest leading-none mt-1">Status: {user?.emailVerified ? 'Verified' : 'Member'}</p>
                </div>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start text-white/20 hover:text-white hover:bg-white/5 rounded-2xl h-16 px-6 transition-all group"
              onClick={handleLogout}
            >
              <LogOut size={20} className="mr-4 group-hover:translate-x-1 transition-transform" />
              <span className="text-[10px] uppercase tracking-widest font-bold">Terminate Session</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-24 border-b border-white/5 flex items-center justify-between px-10 bg-luxury-black/60 backdrop-blur-2xl sticky top-0 z-40">
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="icon" className="lg:hidden text-white/50 hover:text-white" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </Button>
            <div>
              <h2 className="text-3xl font-display font-bold tracking-tighter text-white">
                {navItems.find(i => i.path === location.pathname)?.name || 'Command Center'}
              </h2>
              <p className="text-[9px] uppercase tracking-[0.3em] text-white/20 font-bold hidden sm:block">Automated Management Protocol Active</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
             <Button 
                onClick={() => openListingModal(location.pathname.includes('vehicles') ? 'vehicle' : 'property')}
                className="hidden md:flex bg-luxury-gold text-luxury-black hover:bg-white h-12 rounded-[1rem] font-bold px-8 shadow-2xl shadow-luxury-gold/20 transition-all duration-500 scale-100 hover:scale-105 active:scale-95 text-[10px] uppercase tracking-widest"
             >
                <Plus size={16} className="mr-3" /> New Asset
             </Button>
             <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 hover:border-luxury-gold hover:bg-white/10 transition-all duration-500 cursor-pointer group">
                <Users size={18} className="text-white/20 group-hover:text-luxury-gold transition-colors" />
             </div>
          </div>
        </header>

        <ListingCreationModal 
          isOpen={isListingModalOpen}
          onClose={closeListingModal}
          category={listingCategory}
        />

        <main className="p-8 lg:p-16 max-w-[1600px] mx-auto w-full">
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
