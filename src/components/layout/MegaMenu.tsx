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
  isDark?: boolean;
}

export default function MegaMenu({ title, sections }: MegaMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap outline-none text-white/70 hover:text-white">
        {title} <ChevronDown size={12} className="opacity-50" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full -left-4 w-max bg-super-charcoal border border-white/10 p-8 shadow-2xl rounded-[2rem] z-50 flex gap-12"
          >
            {sections.map((section, idx) => (
              <div key={idx} className="flex flex-col gap-5">
                <h3 className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">{section.title}</h3>
                <ul className="flex flex-col gap-3">
                  {section.items.map((item, i) => (
                    <li key={i}>
                      <Link to={item.href} className="text-white/60 hover:text-white transition-colors text-sm font-medium whitespace-nowrap">
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
