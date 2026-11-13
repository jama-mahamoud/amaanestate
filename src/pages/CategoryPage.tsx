import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Article, Category } from '../types';
import { getCategoryBySlug, getPublishedArticles } from '../services/editorialService';
import { resolveEditorialImage } from '../lib/editorialImages';
import { getCanonicalOrigin, useSEO } from '../hooks/useSEO';
import ArticleCard from '../components/editorial/ArticleCard';
import AdPlacement from '../components/editorial/AdPlacement';
import NewsletterBox from '../components/editorial/NewsletterBox';

interface CategoryPageProps {
  forcedSlug?: string;
}

export default function CategoryPage({ forcedSlug }: CategoryPageProps) {
  const { slug: routeSlug } = useParams<{ slug: string }>();
  const activeSlug = forcedSlug || routeSlug || 'investment';

  const [category, setCategory] = useState<Category | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      const [catData, artsData] = await Promise.all([
        getCategoryBySlug(activeSlug),
        getPublishedArticles({ categorySlug: activeSlug, sortBy, search: keyword }),
      ]);
      if (!active) return;
      setCategory(catData);
      setArticles(artsData);
      setLoading(false);
    }
    load();
    return () => {
      active = false;
    };
  }, [activeSlug, sortBy, keyword]);

  useSEO({
    title: category?.seo_title || category?.name || 'Real Estate Insights & News',
    description:
      category?.seo_description ||
      category?.description ||
      'Explore global real estate news, housing market research, and property investment insights on AmaanEstate.',
    url: `${getCanonicalOrigin()}/${activeSlug}`,
    structuredData: category
      ? {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.amaanestate.com/' },
            {
              '@type': 'ListItem',
              position: 2,
              name: category.name,
              item: `https://www.amaanestate.com/${category.slug}`,
            },
          ],
        }
      : undefined,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-xs text-[#5C5A55] flex items-center gap-2">
        <Link to="/" className="hover:text-[#141413]">Home</Link>
        <span aria-hidden="true">/</span>
        <span className="text-[#141413] font-medium">{category?.name || activeSlug}</span>
      </nav>

      {/* Category Editorial Banner */}
      <header className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-[#E5E0D8] pb-10">
        <div className="lg:col-span-7 space-y-4">
          <p className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">
            Editorial Desk
          </p>
          <h1 className="text-3xl sm:text-5xl font-serif font-semibold text-[#141413]">
            {category?.name || 'Editorial Section'}
          </h1>
          <p className="text-base text-[#4A4843] leading-relaxed max-w-2xl">
            {category?.description || 'In-depth research, criticism, and international reporting.'}
          </p>
        </div>

        <div className="lg:col-span-5">
          <div className="aspect-[16/10] overflow-hidden rounded bg-[#EBE6DF]">
            <img
              src={resolveEditorialImage(category?.image_url, 'hero-pavilion')}
              alt={category?.name || 'Category cover'}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </header>

      {/* Filter & Sort Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-4">
        <div className="flex items-center gap-3">
          <input
            type="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder={`Filter ${category?.name || 'section'} articles...`}
            aria-label="Filter section articles"
            className="h-10 px-3.5 bg-white border border-[#D6CEBE] rounded text-sm text-[#141413] placeholder:text-[#7A7770] focus:outline-none focus:border-[#1E3A5F] w-full sm:w-72"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#EFECE6] rounded self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setSortBy('latest')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer whitespace-nowrap ${
              sortBy === 'latest' ? 'bg-white text-[#141413] shadow-xs' : 'text-[#5C5A55] hover:text-[#141413]'
            }`}
          >
            Latest
          </button>
          <button
            type="button"
            onClick={() => setSortBy('popular')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer whitespace-nowrap ${
              sortBy === 'popular' ? 'bg-white text-[#141413] shadow-xs' : 'text-[#5C5A55] hover:text-[#141413]'
            }`}
          >
            Most Read
          </button>
        </div>
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div className="py-16 text-sm text-[#5C5A55]">Loading published articles...</div>
      ) : articles.length === 0 ? (
        <div className="py-16 text-center bg-white border border-[#E5E0D8] rounded p-8 space-y-3">
          <h2 className="text-xl font-serif font-semibold text-[#141413]">No Matching Articles Found</h2>
          <p className="text-sm text-[#5C5A55]">
            Try clearing your filter or exploring another section across AMAAN ESTATE.
          </p>
          {keyword && (
            <button
              type="button"
              onClick={() => setKeyword('')}
              className="px-4 py-2 text-xs font-semibold bg-[#1E3A5F] text-white rounded cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((art) => (
            <ArticleCard key={art.id} article={art} />
          ))}
        </div>
      )}

      <AdPlacement slotName={`amaan-category-${activeSlug}`} format="leaderboard" />
      <NewsletterBox source={`category:${activeSlug}`} />
    </div>
  );
}
