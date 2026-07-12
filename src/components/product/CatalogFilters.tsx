import React from 'react';
import { Search, X, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';

export interface CategoryOption {
  id: string;
  label: string;
  value?: string;
}

interface CatalogFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories: CategoryOption[];
  searchPlaceholder?: string;
  allLabel?: string;
}

export const CatalogFilters: React.FC<CatalogFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories,
  searchPlaceholder = "Search products or brands...",
  allLabel = "All Categories"
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/[0.02] border border-white/5 rounded-2xl p-4 shadow-sm w-full">
      {/* Search Input */}
      <div className="relative w-full md:max-w-md">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
        <Input
          type="text"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 bg-black/40 border-white/10 text-white rounded-xl h-11 w-full focus:ring-[#C5A059]/30"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')} 
            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Category Selector */}
      <div className="relative w-full md:w-64">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full bg-black/40 border border-white/10 hover:border-[#C5A059]/30 text-xs text-neutral-300 font-medium py-3.5 px-4 pr-10 rounded-xl appearance-none cursor-pointer outline-none transition-all"
        >
          <option value="all">{allLabel}</option>
          {categories.map(c => (
            <option key={c.id} value={c.value !== undefined ? c.value : c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
      </div>
    </div>
  );
};
