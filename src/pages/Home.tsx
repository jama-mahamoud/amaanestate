import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Article } from '../types';
import { getPublishedArticles } from '../services/editorialService';
import { getCanonicalOrigin, useSEO } from '../hooks/useSEO';
import {
  buildHomeStructuredData,
  DEFAULT_SEO_DESCRIPTION,
  DEFAULT_SEO_TITLE,
} from '../lib/seoUtils';
import PropertySearchHero from '../components/marketplace/PropertySearchHero';
import FeaturedPropertiesSection from '../components/marketplace/FeaturedPropertiesSection';
import GlobalMarketsSection from '../components/marketplace/GlobalMarketsSection';
import HeadToHeadComparisonsSection from '../components/marketplace/HeadToHeadComparisonsSection';
import ArticleCard from '../components/editorial/ArticleCard';
import NewsletterSection from '../components/editorial/NewsletterSection';

export default function Home() {
  const [latestNews, setLatestNews] = useState<Article[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);

  const origin = getCanonicalOrigin();
  const homeStructuredData = useMemo(() => buildHomeStructuredData(origin), [origin]);

  useSEO({
    title: DEFAULT_SEO_TITLE,
    description: DEFAULT_SEO_DESCRIPTION,
    url: `${origin}/`,
    image: '/images/articles/sovereign-capital-logistics-corridors.jpg',
    imageAlt: 'AmaanEstate — Global Real Estate Media, Research & Marketplace',
    structuredData: homeStructuredData,
  });

  useEffect(() => {
    let active = true;

    async function loadEditorial() {
      setLoadingNews(true);
      try {
        const latestRes = await getPublishedArticles({ sortBy: 'latest', limit: 3 });
        if (!active) return;
        setLatestNews(latestRes);
      } catch {
        if (!active) return;
        setLatestNews([]);
      } finally {
        if (active) setLoadingNews(false);
      }
    }

    loadEditorial();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="pb-10 sm:pb-14 space-y-12 sm:space-y-16 lg:space-y-20">
      {/* Section 1 – Hero / Main Search */}
      <PropertySearchHero />

      {/* Section 2 – Featured Properties */}
      <FeaturedPropertiesSection />

      {/* Section 3 – Explore Global Markets */}
      <GlobalMarketsSection maxCountries={4} />

      {/* Section 4 – Head-to-Head Research */}
      <HeadToHeadComparisonsSection maxComparisons={3} />

      {/* Section 5 – Latest Real Estate Insights */}
      <section
        aria-labelledby="latest-news-heading"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 sm:space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#E5E0D8] pb-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">
              Editorial Intelligence
            </p>
            <h2
              id="latest-news-heading"
              className="text-2xl sm:text-3xl font-serif font-semibold text-[#141413]"
            >
              Latest Real Estate Insights
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-semibold text-[#1E3A5F]">
            <Link
              to="/news"
              className="inline-flex items-center min-h-[36px] hover:underline whitespace-nowrap"
            >
              Global News &rarr;
            </Link>
            <span aria-hidden="true" className="text-[#D6CEBE]">|</span>
            <Link
              to="/search"
              className="inline-flex items-center min-h-[36px] hover:underline whitespace-nowrap"
            >
              Research Archive &rarr;
            </Link>
          </div>
        </div>

        {loadingNews ? (
          <div className="py-8 sm:py-10 text-sm text-[#5C5A55]">
            Loading editorial stories...
          </div>
        ) : latestNews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
            {latestNews.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#5C5A55]">
            No published editorial stories available yet.
          </p>
        )}
      </section>

      {/* Section 6 – Newsletter */}
      <NewsletterSection />
    </div>
  );
}
