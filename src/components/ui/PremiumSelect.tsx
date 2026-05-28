import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  label: string;
  value: string;
}

interface PremiumSelectProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: (string | Option)[];
  icon?: React.ReactNode;
  placeholder?: string;
  className?: string;
  id?: string;
}

export default function PremiumSelect({
  label,
  value,
  onChange,
  options,
  icon,
  placeholder = 'Select option',
  className = '',
  id,
}: PremiumSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse options securely
  const normalizedOptions: Option[] = options.map((opt) => {
    if (typeof opt === 'string') {
      return { label: opt, value: opt };
    }
    return opt;
  });

  // Find currently selected option label
  const activeOption = normalizedOptions.find((opt) => opt.value === value);
  const displayLabel = activeOption ? activeOption.label : placeholder;

  // Click outside to close standard dropdown popover
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

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div 
      className={`relative space-y-1.5 w-full text-left ${className}`} 
      ref={containerRef}
      id={id || `premium-select-container-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {/* Label section */}
      {label && (
        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
          {label}
        </span>
      )}

      {/* Main Touch Trigger Panel */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full h-12 px-4 rounded-xl flex items-center justify-between text-left transition-all duration-300 bg-black/60 border ${
          isOpen 
            ? 'border-[#C5A059] shadow-[0_0_12px_rgba(197,160,89,0.2)] bg-black/80' 
            : 'border-white/10 hover:border-[#C5A059]/50 hover:bg-neutral-900/40'
        } outline-none cursor-pointer select-none group focus:ring-2 focus:ring-[#C5A059]/20`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {icon && (
            <div className={`p-1 rounded-lg shrink-0 transition-colors ${
              isOpen ? 'text-[#C5A059]' : 'text-gray-400 group-hover:text-[#C5A059]'
            }`}>
              {icon}
            </div>
          )}
          <span className="text-xs font-semibold text-white tracking-wide truncate">
            {displayLabel}
          </span>
        </div>

        {/* HIGH VISIBILITY ROTATING CHEVRON DOWN */}
        <div className={`p-1 rounded-full shrink-0 transition-all duration-300 ${
          isOpen 
            ? 'bg-[#C5A059] text-black scale-110 shadow-[0_0_8px_rgba(197,160,89,0.4)]' 
            : 'bg-white/5 text-[#C5A059] group-hover:bg-white/10 group-hover:scale-105'
        }`}>
          <ChevronDown 
            size={18} 
            className={`transition-all duration-300 ease-out transform stroke-[2.5] ${
              isOpen ? 'rotate-180' : 'rotate-0'
            }`} 
          />
        </div>
      </button>

      {/* Popover list of options */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#111] border border-white/10 rounded-2xl shadow-[0_12px_30px_rgba(0,0,0,0.8),0_0_15px_rgba(197,160,89,0.1)] overflow-hidden max-h-64 overflow-y-auto backdrop-blur-md animate-in fade-in slide-in-from-top-3 duration-200">
          <ul role="listbox" className="py-2 divide-y divide-white/[0.03]">
            {normalizedOptions.map((option) => {
              const isSelected = option.value === value;
              return (
                <li key={option.value}>
                  <button
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    role="option"
                    aria-selected={isSelected}
                    className={`w-full min-h-[46px] px-4 py-3 flex items-center justify-between text-left text-xs tracking-wider uppercase font-semibold transition-all duration-200 cursor-pointer ${
                      isSelected 
                        ? 'bg-[#C5A059]/10 text-[#C5A059]' 
                        : 'text-gray-300 hover:bg-white/[0.04] hover:text-white'
                    }`}
                  >
                    <span>{option.label}</span>
                    {isSelected && (
                      <Check size={14} className="text-[#C5A059] stroke-[3]" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
