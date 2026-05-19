import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { Toaster } from '@/components/ui/sonner';
import AmaanAIAssistant from '../AmaanAIAssistant';

export default function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col font-sans">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <AmaanAIAssistant />
      <Toaster position="top-center" richColors />
    </div>
  );
}
