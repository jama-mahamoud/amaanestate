import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { Article, Property, PropertyLocationStat } from '../types';
import { getPublishedArticles } from '../services/editorialService';
import {
  getFeaturedProperties,
  getPropertyLocations,
  getShowcaseProperties,
} from '../services/propertyService';
import { useSEO } from '../hooks/useSEO';
import PropertySearchHero from '../components/marketplace/PropertySearchHero';
import PropertyCard from '../components/marketplace/PropertyCard';
import ArticleCard from '../components/editorial/ArticleCard';

export default function Home() {
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [showcaseProperties, setShowcaseProperties] = useState<Property[]>([]);
  const [locations, setLocations] = useState<PropertyLocationStat[]>([]);
  const [latestNews, setLatestNews] = useState<Article[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [loadingNews, setLoadingNews] = useState(true);

  useSEO({
    title: 'AMAAN ESTATE — Global Property Marketplace & Real Estate Intelligence',
    description:
      'Discover global properties for sale and rent alongside independent real estate research, architectural criticism, and market reporting.',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'AMAAN ESTATE',
      url: 'https://www.amaanestate.com',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://www.amaanestate.com/buy?location={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
  });

  useEffect(() => {
    let active = true;

    async function loadMarketplace() {
      setLoadingProperties(true);
      try {
        const [featRes, locRes, showcaseRes] = await Promise.all([
          getFeaturedProperties(undefined, 6),
          getPropertyLocations(),
          getShowcaseProperties(),
        ]);
        if (!active) return;
        setFeaturedProperties(featRes.properties);
        setLocations(locRes.locations);
        setShowcaseProperties(showcaseRes.properties);
      } catch {
        if (!active) return;
        setFeaturedProperties([]);
        setLocations([]);
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

      {/* 3. GLOBAL MARKETS (EXPLORE INTERNATIONAL LOCATIONS) */}
      {locations.length > 0 && (
        <section aria-labelledby="explore-locations-heading" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="border-b border-[#E5E0D8] pb-4 space-y-1">
            <p className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">
              Global Markets
            </p>
            <h2 id="explore-locations-heading" className="text-2xl sm:text-3xl font-serif font-semibold text-[#141413]">
              Explore International Locations
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {locations.map((loc) => (
              <Link
                key={`${loc.city}-${loc.country}`}
                to={`/buy?location=${encodeURIComponent(loc.city)}`}
                className="bg-white border border-[#E5E0D8] hover:border-[#1E3A5F] rounded p-5 space-y-2 transition-colors"
              >
                <div className="flex items-center gap-2 text-[#141413] font-serif font-semibold text-base">
                  <MapPin size={15} className="text-[#8C4A27] shrink-0" />
                  <span className="truncate">{loc.city}</span>
                </div>
                <div className="text-xs text-[#5C5A55]">{loc.country}</div>
                <div className="text-xs font-mono tabular-nums text-[#1E3A5F] pt-1">
                  {loc.totalCount === 1 ? 'Showcase property' : `${loc.totalCount} active listings`}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

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
