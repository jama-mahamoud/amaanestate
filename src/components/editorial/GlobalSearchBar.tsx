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

  const isHero = variant === 'hero';

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      aria-label="Search global real estate articles"
      className={`w-full bg-white rounded-[6px] transition-all duration-200 focus-within:border-[#1E3A5F] ${
        isHero
          ? 'border border-[#D8D0C2] p-2 shadow-[0_10px_30px_-12px_rgba(20,20,19,0.1)] focus-within:shadow-[0_12px_34px_-12px_rgba(30,58,95,0.18)]'
          : 'border border-[#E5E0D8] p-1.5'
      }`}
    >
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
        {/* 1. Keyword Search */}
        <div className="relative flex-1 flex items-center min-w-0">
          <Search
            size={isHero ? 18 : 17}
            className="absolute left-3.5 text-[#5C5A55] pointer-events-none shrink-0"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search real estate research, markets, architecture..."
            aria-label="Keyword search"
            className={`w-full pl-11 pr-3 bg-transparent text-[#141413] placeholder:text-[#6E6B64] focus:outline-none ${
              isHero ? 'h-12 text-[15px]' : 'h-11 text-sm'
            }`}
          />
        </div>

        <div className="hidden md:block w-px h-7 bg-[#E5E0D8] shrink-0" aria-hidden="true" />

        {/* 2. Category Dropdown */}
        <div className="md:w-52 shrink-0">
          <select
            value={categorySlug}
            onChange={(e) => setCategorySlug(e.target.value)}
            aria-label="Filter by category"
            className={`w-full px-3 bg-[#FAF8F5] md:bg-transparent border border-[#E5E0D8] md:border-0 rounded-[4px] text-sm font-medium text-[#141413] focus:outline-none cursor-pointer ${
              isHero ? 'h-12' : 'h-11'
            }`}
          >
            <option value="all">All Categories</option>
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
          className={`bg-[#1E3A5F] hover:bg-[#142944] text-white text-sm font-semibold rounded-[4px] transition-colors duration-200 cursor-pointer whitespace-nowrap shrink-0 flex items-center justify-center gap-2 ${
            isHero ? 'h-12 px-7' : 'h-11 px-6'
          }`}
        >
          <span>Search</span>
        </button>
      </div>
    </form>
  );
}
