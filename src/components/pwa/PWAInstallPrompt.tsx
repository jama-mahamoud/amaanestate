import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showModal, setShowModal] = useState(false);

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
      setShowModal(true);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={handleInstallClick}
        className="fixed bottom-6 right-6 w-14 h-14 bg-luxury-gold text-luxury-black rounded-full shadow-xl z-50 flex items-center justify-center animate-pulse hover:animate-none hover:scale-110 active:scale-95 transition-all"
        title="Install AmaanEstate"
      >
        <Download size={24} />
      </button>

      {/* Instructions Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-luxury-black p-6 rounded-2xl border border-luxury-gold/20 max-w-sm w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-luxury-gold font-bold text-lg">Install AmaanEstate</h3>
              <button onClick={() => setShowModal(false)} className="text-white/60 hover:text-white"><X size={20} /></button>
            </div>
            <div className="text-white/80 space-y-4 text-sm">
              <p>To install the app on your device:</p>
              <div>
                <p className="font-bold text-luxury-gold">Android:</p>
                <p>Use browser menu ⋮ &gt; <span className="italic">Install App</span></p>
              </div>
              <div>
                <p className="font-bold text-luxury-gold">iPhone:</p>
                <p>Safari &gt; Share button &gt; <span className="italic">Add to Home Screen</span></p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
