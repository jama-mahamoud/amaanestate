import { motion } from 'motion/react';

export default function LoadingState() {
  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center space-y-8">
      <div className="relative w-20 h-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-t-2 border-r-2 border-luxury-gold/50"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="absolute inset-2 rounded-full border-b-2 border-l-2 border-white/20"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-luxury-gold animate-pulse" />
        </div>
      </div>
      <div className="space-y-2 text-center">
        <p className="text-luxury-gold font-bold tracking-[0.4em] uppercase text-[10px] animate-pulse">
          Synchronizing
        </p>
        <p className="text-white/20 text-[9px] uppercase tracking-widest font-light">
          Accessing Secure Database
        </p>
      </div>
    </div>
  );
}
