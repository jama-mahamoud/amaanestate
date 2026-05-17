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
  Plus
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Properties', path: '/dashboard/properties', icon: <Home size={20} /> },
    { name: 'Vehicles', path: '/dashboard/vehicles', icon: <Car size={20} /> },
    { name: 'Articles', path: '/dashboard/articles', icon: <FileText size={20} /> },
    { name: 'Agents', path: '/dashboard/users', icon: <Users size={20} /> },
    { name: 'Settings', path: '/dashboard/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-luxury-black text-white">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-luxury-charcoal border-r border-white/5 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-8 flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-luxury-gold text-luxury-black w-8 h-8 flex items-center justify-center font-bold rounded-lg">
                A
              </div>
              <span className="font-display font-bold text-xl">AmaanEstate</span>
            </Link>
            <Button variant="ghost" size="icon" className="lg:hidden text-white/40" onClick={() => setIsSidebarOpen(false)}>
              <X size={20} />
            </Button>
          </div>

          <nav className="flex-1 px-4 space-y-2 py-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group ${
                  location.pathname === item.path 
                    ? 'bg-luxury-gold text-luxury-black font-bold shadow-lg shadow-luxury-gold/5' 
                    : 'text-white/40 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className={location.pathname === item.path ? 'text-luxury-black' : 'text-luxury-gold group-hover:scale-110 transition-transform'}>
                  {item.icon}
                </span>
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-white/5 space-y-4">
            <div className="bg-white/5 p-6 rounded-3xl">
              <p className="text-[10px] uppercase tracking-widest font-bold text-white/20 mb-2">Authenticated As</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-luxury-gold/20 flex items-center justify-center text-luxury-gold font-bold">
                  A
                </div>
                <div>
                  <p className="text-sm font-bold truncate max-w-[120px]">Super Admin</p>
                  <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Admin Panel</p>
                </div>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start text-white/40 hover:text-destructive hover:bg-destructive/10 rounded-2xl h-14 p-4 transition-all"
              onClick={() => navigate('/')}
            >
              <LogOut size={20} className="mr-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-luxury-black/50 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden text-white" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </Button>
            <h2 className="text-xl font-display font-bold">
              {navItems.find(i => i.path === location.pathname)?.name || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
             <Button className="hidden md:flex bg-luxury-gold text-luxury-black hover:bg-white h-10 rounded-xl font-bold px-6">
                <Plus size={18} className="mr-2" /> Quick Add
             </Button>
             <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 hover:border-luxury-gold transition-colors cursor-pointer">
                <Users size={18} className="text-white/40" />
             </div>
          </div>
        </header>

        <main className="p-8 lg:p-12">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
