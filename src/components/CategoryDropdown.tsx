import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, SlidersHorizontal, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface CategoryOption {
  id: string;
  label: string;
}

interface CategoryDropdownProps {
  categories: CategoryOption[];
  selectedId: string;
  onChange: (id: string) => void;
  labelPrefix?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export default function CategoryDropdown({
  categories,
  selectedId,
  onChange,
  labelPrefix = 'Filter: ',
  align = 'center',
  className = '',
}: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside (desktop)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedCategory = categories.find((cat) => cat.id === selectedId) || categories[0];

  const handleSelect = (id: string) => {
    onChange(id);
    setIsOpen(false);
  };

  // Alignment classes for desktop popover
  const alignClasses = {
    left: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    right: 'right-0',
  }[align];

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`} id="category-dropdown-container">
      {/* TRIGGER BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-5 py-2.5 bg-neutral-900/60 hover:bg-neutral-900 border border-white/10 hover:border-[#C5A059]/40 focus:border-[#C5A059]/50 rounded-xl text-xs font-medium tracking-wide text-white transition-all duration-200 shadow-md cursor-pointer group"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <SlidersHorizontal size={13} className="text-[#C5A059] group-hover:rotate-180 transition-transform duration-500" />
        <span className="font-mono text-neutral-400 font-bold uppercase tracking-wider">
          {labelPrefix}
        </span>
        <span className="font-sans text-white font-semibold">
          {selectedCategory?.label || selectedId}
        </span>
        <ChevronDown
          size={14}
          className={`text-neutral-400 group-hover:text-white transition-transform duration-300 ${
            isOpen ? 'rotate-180 text-[#C5A059]' : ''
          }`}
        />
      </button>

      {/* DESKTOP DROPDOWN */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`hidden md:block absolute top-full ${alignClasses} z-50 mt-2 w-64 bg-[#0a0a0f] border border-white/10 rounded-2xl shadow-2xl p-2.5`}
            role="listbox"
          >
            <div className="text-[10px] font-mono font-bold text-neutral-500 px-3 py-1.5 uppercase tracking-widest border-b border-white/[0.03] mb-1">
              Select Category
            </div>
            <div className="space-y-0.5 max-h-72 overflow-y-auto no-scrollbar">
              {categories.map((cat) => {
                const isSelected = cat.id === selectedId;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleSelect(cat.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'bg-[#C5A059]/10 text-[#C5A059] font-bold'
                        : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <span>{cat.label}</span>
                    {isSelected && <Check size={14} className="text-[#C5A059]" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MOBILE BOTTOM SHEET / FULL DROPDOWN */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="md:hidden fixed inset-0 z-50 bg-black/75 backdrop-blur-xs"
            />

            {/* Bottom Sheet Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0d0d12] border-t border-white/10 rounded-t-3xl p-6 pb-12 max-h-[85vh] overflow-y-auto flex flex-col space-y-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C5A059] font-black">
                    Navigation
                  </span>
                  <span className="text-sm font-bold text-white tracking-tight">
                    Choose a Category
                  </span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-neutral-400 hover:text-white cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Options List */}
              <div className="space-y-1.5">
                {categories.map((cat) => {
                  const isSelected = cat.id === selectedId;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleSelect(cat.id)}
                      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer ${
                        isSelected
                          ? 'bg-[#C5A059]/10 border border-[#C5A059]/20 text-[#C5A059]'
                          : 'bg-white/[0.01] hover:bg-white/[0.04] border border-transparent text-neutral-400'
                      }`}
                    >
                      <span>{cat.label}</span>
                      {isSelected ? (
                        <Check size={16} className="text-[#C5A059]" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-white/10" />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
