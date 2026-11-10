import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Category } from '../../types';
import { getCategories } from '../../services/editorialService';

interface GlobalSearchBarProps {
  initialQuery?: string;
  initialCategory?: string;
  onSearchSubmit?: (query: string, categorySlug: string) => void;
  variant?: 'hero' | 'compact';
}

export default function GlobalSearchBar({
  initialQuery = '',
  initialCategory = 'all',
  onSearchSubmit,
  variant = 'hero',
}: GlobalSearchBarProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialQuery);
  const [categorySlug, setCategorySlug] = useState(initialCategory);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    setCategorySlug(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit(query.trim(), categorySlug);
      return;
    }
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (categorySlug && categorySlug !== 'all') params.set('category', categorySlug);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      aria-label="Search global real estate articles"
      className={`w-full bg-white border border-[#E5E0D8] rounded-md transition-colors focus-within:border-[#1E3A5F] ${
        variant === 'hero' ? 'p-1.5 shadow-sm' : 'p-1.5'
      }`}
    >
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
        {/* 1. Keyword Search */}
        <div className="relative flex-1 flex items-center min-w-0">
          <Search
            size={17}
            className="absolute left-3.5 text-[#5C5A55] pointer-events-none shrink-0"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search research, architecture, markets, or building technology..."
            aria-label="Keyword search"
            className="w-full h-11 pl-10 pr-3 bg-transparent text-sm text-[#141413] placeholder:text-[#7A7770] focus:outline-none"
          />
        </div>

        <div className="hidden md:block w-px h-7 bg-[#E5E0D8] shrink-0" aria-hidden="true" />

        {/* 2. Category Dropdown */}
        <div className="md:w-56 shrink-0">
          <select
            value={categorySlug}
            onChange={(e) => setCategorySlug(e.target.value)}
            aria-label="Filter by category"
            className="w-full h-11 px-3 bg-[#FAF8F5] md:bg-transparent border border-[#E5E0D8] md:border-0 rounded text-sm font-medium text-[#141413] focus:outline-none cursor-pointer"
          >
            <option value="all">All Categories / Real Estate</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Search Button */}
        <button
          type="submit"
          className="h-11 px-6 bg-[#1E3A5F] hover:bg-[#162C49] text-white text-sm font-semibold rounded transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center justify-center gap-2"
        >
          <span>Search</span>
        </button>
      </div>
    </form>
  );
}
