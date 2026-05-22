import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if standalone
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true);
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  if (isStandalone) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      toast("Installation is not currently available in this browser.");
    }
  };

  return (
    <button 
      onClick={handleInstallClick}
      className="fixed bottom-6 right-6 w-14 h-14 bg-luxury-gold text-luxury-black rounded-full shadow-xl z-50 flex items-center justify-center animate-pulse hover:animate-none hover:scale-110 active:scale-95 transition-all"
    >
      <Download size={24} />
    </button>
  );
}
