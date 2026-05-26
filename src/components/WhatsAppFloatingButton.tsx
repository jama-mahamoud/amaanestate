import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WhatsAppFloatingButton = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className="fixed bottom-6 left-6 z-50"
      >
        <button
          onClick={() => setIsVisible(false)}
          className="absolute -top-1 -left-1 bg-black/50 text-white p-0.5 rounded-full shadow hover:bg-black transition-colors"
          aria-label="Minimize"
        >
          <X size={10} />
        </button>
        <motion.a
          href="https://wa.me/251910012794"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#25D366] text-white p-3 rounded-full shadow-lg flex items-center justify-center group"
          aria-label="Contact WhatsApp Support"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <MessageCircle size={20} />
        </motion.a>
      </motion.div>
    </AnimatePresence>
  );
};

export default WhatsAppFloatingButton;
