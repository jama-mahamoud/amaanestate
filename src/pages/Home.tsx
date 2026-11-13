import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Article, Property } from '../types';
import { getPublishedArticles } from '../services/editorialService';
import {
  getFeaturedProperties,
  getShowcaseProperties,
} from '../services/propertyService';
import { getCanonicalOrigin, useSEO } from '../hooks/useSEO';
import PropertySearchHero from '../components/marketplace/PropertySearchHero';
import PropertyCard from '../components/marketplace/PropertyCard';
import GlobalMarketsSection from '../components/marketplace/GlobalMarketsSection';
import ArticleCard from '../components/editorial/ArticleCard';

export default function Home() {
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [showcaseProperties, setShowcaseProperties] = useState<Property[]>([]);
  const [latestNews, setLatestNews] = useState<Article[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [loadingNews, setLoadingNews] = useState(true);

  useSEO({
    title: 'AmaanEstate | Global Real Estate News, Research & Property Marketplace',
    description:
      'Explore global real estate news, housing market research, property investment insights, market trends and property listings with AmaanEstate.',
    url: `${getCanonicalOrigin()}/`,
    image: '/images/articles/sovereign-capital-logistics-corridors.jpg',
    imageAlt: 'AmaanEstate — Global Real Estate Media, Research & Marketplace',
  });

  useEffect(() => {
    let active = true;

    async function loadMarketplace() {
      setLoadingProperties(true);
      try {
        const [featRes, showcaseRes] = await Promise.all([
          getFeaturedProperties(undefined, 6),
          getShowcaseProperties(),
        ]);
        if (!active) return;
        setFeaturedProperties(featRes.properties);
        setShowcaseProperties(showcaseRes.properties);
      } catch {
        if (!active) return;
        setFeaturedProperties([]);
        setShowcaseProperties([]);
      } finally {
        if (active) setLoadingProperties(false);
      }
    }

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

    loadMarketplace();
    loadEditorial();

    return () => {
      active = false;
    };
  }, []);

  // Combine featured and showcase properties ensuring each property appears only once
  const uniqueProperties = Array.from(
    new Map([...featuredProperties, ...showcaseProperties].map((p) => [p.id, p])).values()
  ).slice(0, 4);

  return (
    <div className="space-y-16 pb-8">
      {/* 1. PROPERTY SEARCH HERO */}
      <PropertySearchHero />

      {/* 2. PROPERTY MARKETPLACE (FEATURED INTERNATIONAL PROPERTIES) */}
      <section aria-labelledby="featured-properties-heading" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#E5E0D8] pb-4">
          <div className="space-y-1.5">
            <p className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">
              Property Marketplace
            </p>
            <h2 id="featured-properties-heading" className="text-2xl sm:text-3xl font-serif font-semibold text-[#141413]">
              Featured International Properties
            </h2>
            <p className="text-xs sm:text-sm text-[#5C5A55]">
              Some properties displayed are illustrative examples for presentation purposes and are not confirmed active market listings.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-[#1E3A5F] shrink-0">
            <Link to="/buy" className="hover:underline whitespace-nowrap">
              All Properties for Sale &rarr;
            </Link>
            <span aria-hidden="true" className="text-[#D6CEBE]">|</span>
            <Link to="/rent" className="hover:underline whitespace-nowrap">
              All Rentals &rarr;
            </Link>
          </div>
        </div>

        {loadingProperties ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="bg-white border border-[#E5E0D8] rounded overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-[#EBE6DF]" />
                <div className="p-5 space-y-3">
                  <div className="h-3 w-24 bg-[#EBE6DF] rounded" />
                  <div className="h-6 w-32 bg-[#EBE6DF] rounded" />
                  <div className="h-4 w-full bg-[#EBE6DF] rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : uniqueProperties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {uniqueProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#5C5A55]">No properties currently available.</p>
        )}
      </section>

      {/* 3. GLOBAL MARKETS (INTERNATIONAL COUNTRY DIRECTORY) */}
      <GlobalMarketsSection />

      {/* 4. EDITORIAL INTELLIGENCE */}
      <section aria-labelledby="latest-news-heading" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#E5E0D8] pb-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">
              Editorial Intelligence
            </p>
            <h2 id="latest-news-heading" className="text-2xl sm:text-3xl font-serif font-semibold text-[#141413]">
              Latest Real Estate Insights
            </h2>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold text-[#1E3A5F]">
            <Link to="/news" className="hover:underline whitespace-nowrap">
              Industry News &rarr;
            </Link>
            <span aria-hidden="true" className="text-[#D6CEBE]">|</span>
            <Link to="/search" className="hover:underline whitespace-nowrap">
              Research Archive &rarr;
            </Link>
          </div>
        </div>

        {loadingNews ? (
          <div className="py-10 text-sm text-[#5C5A55]">Loading editorial stories...</div>
        ) : latestNews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestNews.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#5C5A55]">No published editorial stories available yet.</p>
        )}
      </section>
    </div>
  );
}
