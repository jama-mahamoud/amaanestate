import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { Toaster } from '@/components/ui/sonner';
import PWAInstallPrompt from '../pwa/PWAInstallPrompt';

export default function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col font-sans">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <PWAInstallPrompt />
      <Toaster position="top-center" richColors />
    </div>
  );
}
