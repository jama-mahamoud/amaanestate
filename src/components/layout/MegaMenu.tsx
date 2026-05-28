import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '@/contexts/SettingsContext';

export interface MegaMenuItem {
  title: string;
  items: { title: string; href: string }[];
}

export interface MegaMenuProps {
  title: string;
  sections: MegaMenuItem[];
  isDark?: boolean;
}

export default function MegaMenu({ title, sections }: MegaMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useSettings();

  // Close when user clicks outside the dropdown container (crucial for click triggers)
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(prev => !prev);
  };

  return (
    <div 
      ref={containerRef}
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button 
        onClick={handleToggle}
        className={`text-xs font-bold transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap outline-none py-2 ${
          isOpen ? 'text-[#C5A059]' : 'text-white/70 hover:text-white'
        }`}
      >
        <span>{title}</span>
        <ChevronDown 
          size={12} 
          className={`opacity-50 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#C5A059]' : ''}`} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute top-full -left-4 mt-2 w-max max-w-[90vw] md:max-w-xl lg:max-w-4xl bg-luxury-charcoal border border-white/10 p-6 md:p-8 shadow-2xl rounded-3xl z-50 flex flex-col md:flex-row gap-8 md:gap-12 backdrop-blur-3xl bg-opacity-95"
          >
            {sections.map((section, idx) => (
              <div key={idx} className="flex flex-col gap-4 min-w-[140px]">
                <h3 className="text-[#C5A059] text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/5 pb-2">
                  {t(section.title)}
                </h3>
                <ul className="flex flex-col gap-2.5">
                  {section.items.map((item, i) => (
                    <li key={i}>
                      <Link 
                        to={item.href} 
                        onClick={() => setIsOpen(false)}
                        className="text-white/60 hover:text-[#C5A059] hover:translate-x-1 transition-all duration-300 text-xs font-medium whitespace-nowrap inline-block"
                      >
                        {t(item.title)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
