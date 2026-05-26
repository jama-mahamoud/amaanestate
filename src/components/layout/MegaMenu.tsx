import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface MegaMenuItem {
  title: string;
  items: { title: string; href: string }[];
}

export interface MegaMenuProps {
  title: string;
  sections: MegaMenuItem[];
}

export default function MegaMenu({ title, sections }: MegaMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="text-[10px] items-center uppercase font-bold tracking-[0.1em] text-white/60 transition-all hover:text-luxury-gold flex items-center gap-1 whitespace-nowrap">
        {title} <ChevronDown size={12} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 w-max bg-luxury-black border border-white/10 p-6 shadow-2xl rounded-xl z-50 flex gap-8"
          >
            {sections.map((section, idx) => (
              <div key={idx} className="flex flex-col gap-4">
                <h3 className="text-luxury-gold text-xs font-bold uppercase tracking-widest">{section.title}</h3>
                <ul className="flex flex-col gap-3">
                  {section.items.map((item, i) => (
                    <li key={i}>
                      <Link to={item.href} className="text-white/60 hover:text-white transition-colors text-sm whitespace-nowrap">
                        {item.title}
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
