import { useEffect } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../components/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import { LayoutDashboard, Home, Car, Users, Settings, LogOut, FileText } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';

export default function DashboardLayout() {
  const { appUser, currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!currentUser || !appUser) {
    return <Navigate to="/login" />;
  }

  const isAdmin = appUser.role === 'admin';
  const isAgent = appUser.role === 'agent';

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Properties', path: '/dashboard/properties', icon: <Home size={20} /> },
    { name: 'Vehicles', path: '/dashboard/vehicles', icon: <Car size={20} /> },
    { name: 'Articles', path: '/dashboard/articles', icon: <FileText size={20} /> },
    { name: 'Manage Agents', path: '/dashboard/users', icon: <Users size={20} /> },
    { name: 'Settings', path: '/dashboard/settings', icon: <Settings size={20} /> },
  ];

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-black text-white hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <Link to="/" className="flex items-center space-x-2">
             <div className="bg-amber-500 text-black p-1.5 flex items-center justify-center font-bold text-lg rounded">
                AE
              </div>
              <span className="font-bold text-xl tracking-tight text-white">
                Amaan<span className="text-amber-500">Estate</span>
              </span>
          </Link>
          <div className="mt-6">
            <p className="text-sm text-gray-400">Welcome,</p>
            <p className="font-medium truncate">{appUser.name}</p>
            <span className="inline-block mt-2 text-xs px-2 py-1 bg-gray-800 rounded-full border border-gray-700 uppercase tracking-wide">
               {appUser.role} {!appUser.isApproved && appUser.role === 'agent' ? '(Pending)' : ''}
            </span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link 
                key={link.name} 
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-amber-500 text-black font-semibold' : 'hover:bg-gray-800 text-gray-300'
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            )
          })}
        </nav>
        
        <div className="p-4 border-t border-gray-800">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-gray-800"
            onClick={handleLogout}
          >
            <LogOut size={20} className="mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b flex items-center justify-between px-6 md:hidden">
          <span className="font-bold text-xl">Dashboard</span>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
             <LogOut size={20} />
          </Button>
        </header>
        <div className="p-6 md:p-8 flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
      
      <Toaster position="top-right" richColors />
    </div>
  );
}
