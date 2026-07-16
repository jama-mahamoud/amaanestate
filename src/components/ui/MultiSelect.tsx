import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, Check, ChevronDown } from 'lucide-react';

interface MultiSelectProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

export function MultiSelect({ label, options, selected, onChange, placeholder = 'Select...' }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredOptions = useMemo(() => {
    return options.filter(opt => opt.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [options, searchQuery]);

  const handleSelect = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(item => item !== option));
    } else {
      onChange([...selected, option]);
    }
    // Optionally keep open to allow multiple selections quickly
  };

  const removeTag = (e: React.MouseEvent, option: string) => {
    e.stopPropagation();
    onChange(selected.filter(item => item !== option));
  };

  return (
    <div className="relative space-y-1.5 w-full text-left" ref={containerRef}>
      {label && (
        <label className="text-white/50 text-[11px] font-medium block">
          {label}
        </label>
      )}

      {/* Main Touch Trigger Panel */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full min-h-[44px] px-3 py-2 rounded-xl flex items-center justify-between transition-all duration-300 bg-black/40 border cursor-pointer select-none group focus:outline-none ${
          isOpen 
            ? 'border-[#D4AF37]/50 shadow-[0_0_15px_rgba(212,175,55,0.15)] bg-black/60' 
            : 'border-white/10 hover:border-[#D4AF37]/30 hover:bg-neutral-900/40'
        }`}
      >
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
          {selected.length === 0 && (
            <span className="text-xs font-semibold text-white/40 tracking-wide">
              {placeholder}
            </span>
          )}
          {selected.map(item => (
            <span 
              key={item} 
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 transition-all hover:bg-[#D4AF37]/20"
            >
              {item}
              <button 
                type="button" 
                onClick={(e) => removeTag(e, item)}
                className="hover:text-white transition-colors focus:outline-none rounded-full p-0.5 hover:bg-black/20"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        
        <div className="pl-2 shrink-0">
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#D4AF37]' : 'text-gray-500 group-hover:text-[#D4AF37]'}`} />
        </div>
      </div>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-[#0a0a0a] border border-white/10 rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.9)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 border-b border-white/5 bg-black/20">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full bg-black/40 border border-white/5 rounded-lg py-2 pl-9 pr-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30 transition-all"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          
          <div className="max-h-[260px] overflow-y-auto p-1 custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-xs text-white/40">
                No matching options found.
              </div>
            ) : (
              <div className="flex flex-col gap-0.5">
                {filteredOptions.map((opt) => {
                  const isSelected = selected.includes(opt);
                  return (
                    <div
                      key={opt}
                      onClick={() => handleSelect(opt)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-[#D4AF37]/10 text-[#D4AF37] font-semibold' 
                          : 'text-white/70 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span className="text-xs truncate">{opt}</span>
                      {isSelected && (
                        <Check className="w-4 h-4 shrink-0 text-[#D4AF37]" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
