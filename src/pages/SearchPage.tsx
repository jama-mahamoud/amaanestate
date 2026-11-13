import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Article } from '../types';
import { getPublishedArticles } from '../services/editorialService';
import { useSEO } from '../hooks/useSEO';
import GlobalSearchBar from '../components/editorial/GlobalSearchBar';
import ArticleCard from '../components/editorial/ArticleCard';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || 'all';
  const initialSort = (searchParams.get('sort') as 'latest' | 'popular') || 'latest';
  const initialTag = searchParams.get('tag') || '';

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useSEO({
    title: initialQuery ? `Search: ${initialQuery}` : 'Search & Archive',
    description: 'Search AmaanEstate real estate news, housing research, investment insights, architectural monographs, and market analysis.',
    noIndex: true,
  });

  useEffect(() => {
    let active = true;
    async function runSearch() {
      setLoading(true);
      const data = await getPublishedArticles({
        search: initialQuery,
        categorySlug: initialCategory,
        tagSlug: initialTag || undefined,
        sortBy: initialSort,
      });
      if (!active) return;
      setArticles(data);
      setLoading(false);
    }
    runSearch();
    return () => {
      active = false;
    };
  }, [initialQuery, initialCategory, initialSort, initialTag]);

  const handleSearch = (q: string, category: string) => {
    const next = new URLSearchParams();
    if (q) next.set('q', q);
    if (category && category !== 'all') next.set('category', category);
    if (initialSort !== 'latest') next.set('sort', initialSort);
    setSearchParams(next);
  };

  const handleSortChange = (sort: 'latest' | 'popular') => {
    const next = new URLSearchParams(searchParams);
    next.set('sort', sort);
    setSearchParams(next);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <nav aria-label="Breadcrumb" className="text-xs text-[#5C5A55] flex items-center gap-2">
        <Link to="/" className="hover:text-[#141413]">Home</Link>
        <span aria-hidden="true">/</span>
        <span className="text-[#141413] font-medium">Search &amp; Archive</span>
      </nav>

      <header className="space-y-4 border-b border-[#E5E0D8] pb-8">
        <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-[#141413]">
          Search Editorial Archive
        </h1>
        <GlobalSearchBar
          initialQuery={initialQuery}
          initialCategory={initialCategory}
          onSearchSubmit={handleSearch}
          variant="compact"
        />
      </header>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-4">
        <p className="text-sm text-[#5C5A55]">
          Showing <strong className="text-[#141413] tabular-nums">{articles.length}</strong> published{' '}
          {articles.length === 1 ? 'article' : 'articles'}
          {initialQuery ? (
            <>
              {' '}for &ldquo;<strong className="text-[#141413]">{initialQuery}</strong>&rdquo;
            </>
          ) : null}
          {initialTag ? (
            <>
              {' '}tagged <strong className="text-[#141413]">{initialTag}</strong>
            </>
          ) : null}
        </p>

        <div className="flex items-center gap-1 p-1 bg-[#EFECE6] rounded self-start sm:self-auto">
          <button
            type="button"
            onClick={() => handleSortChange('latest')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer whitespace-nowrap ${
              initialSort === 'latest' ? 'bg-white text-[#141413] shadow-xs' : 'text-[#5C5A55] hover:text-[#141413]'
            }`}
          >
            Latest
          </button>
          <button
            type="button"
            onClick={() => handleSortChange('popular')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer whitespace-nowrap ${
              initialSort === 'popular' ? 'bg-white text-[#141413] shadow-xs' : 'text-[#5C5A55] hover:text-[#141413]'
            }`}
          >
            Popular
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-sm text-[#5C5A55]">Searching articles...</div>
      ) : articles.length === 0 ? (
        <div className="py-16 text-center bg-white border border-[#E5E0D8] rounded p-8 space-y-3">
          <h2 className="text-xl font-serif font-semibold text-[#141413]">No Matching Articles</h2>
          <p className="text-sm text-[#5C5A55] max-w-md mx-auto">
            No published articles matched your search criteria. Try broader keywords or reset to All Categories.
          </p>
          <button
            type="button"
            onClick={() => setSearchParams(new URLSearchParams())}
            className="px-4 py-2 text-xs font-semibold bg-[#1E3A5F] text-white rounded cursor-pointer"
          >
            Show All Articles
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
