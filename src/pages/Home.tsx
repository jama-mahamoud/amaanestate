import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Article } from '../types';
import { getPublishedArticles } from '../services/editorialService';
import { isSupabaseConfigured } from '../lib/supabase';
import { resolveEditorialImage } from '../lib/editorialImages';
import { useSEO } from '../hooks/useSEO';
import GlobalSearchBar from '../components/editorial/GlobalSearchBar';
import ArticleCard from '../components/editorial/ArticleCard';
import NewsletterBox from '../components/editorial/NewsletterBox';

export default function Home() {
  const [featured, setFeatured] = useState<Article[]>([]);
  const [investment, setInvestment] = useState<Article[]>([]);
  const [architecture, setArchitecture] = useState<Article[]>([]);
  const [construction, setConstruction] = useState<Article[]>([]);
  const [homeLiving, setHomeLiving] = useState<Article[]>([]);
  const [news, setNews] = useState<Article[]>([]);
  const [latest, setLatest] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useSEO({
    title: 'AMAAN ESTATE — Global Real Estate Media, Research & Knowledge',
    description:
      'International real estate media, architectural criticism, construction engineering research, and market intelligence for global readers.',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'AMAAN ESTATE',
      url: 'https://www.amaanestate.com',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://www.amaanestate.com/search?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
  });

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      const [featRes, invRes, archRes, consRes, homeRes, newsRes, latestRes] = await Promise.all([
        getPublishedArticles({ featured: true, limit: 3 }),
        getPublishedArticles({ categorySlug: 'investment', limit: 3 }),
        getPublishedArticles({ categorySlug: 'architecture', limit: 3 }),
        getPublishedArticles({ categorySlug: 'construction', limit: 3 }),
        getPublishedArticles({ categorySlug: 'home-living', limit: 3 }),
        getPublishedArticles({ categorySlug: 'news', limit: 3 }),
        getPublishedArticles({ sortBy: 'latest', limit: 6 }),
      ]);
      if (!active) return;
      setFeatured(featRes.length > 0 ? featRes : latestRes.slice(0, 3));
      setInvestment(invRes);
      setArchitecture(archRes);
      setConstruction(consRes);
      setHomeLiving(homeRes);
      setNews(newsRes);
      setLatest(latestRes);
      setLoading(false);
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const leadStory = featured[0];
  const supportingStories = featured.slice(1, 3);

  return (
    <div className="space-y-16 pb-8">
      {/* Demonstration Mode Notice if Supabase Env Vars Not Yet Added */}
      {!isSupabaseConfigured && (
        <div className="bg-[#EFECE6] border-b border-[#E5E0D8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#5C5A55]">
            <span>
              <strong className="font-semibold text-[#141413]">Demonstration Content Active:</strong> Connect your Supabase project in <code className="font-mono">.env</code> to publish live database content.
            </span>
            <Link to="/admin/login" className="font-semibold text-[#1E3A5F] hover:underline whitespace-nowrap">
              Open Editorial Admin &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* A. HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center pb-12 sm:pb-16 border-b border-[#E5E0D8]">
          
          {/* Left Column: Editorial Content & CTAs */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6 sm:space-y-8">
            <div className="space-y-4 sm:space-y-5">
              <div className="inline-flex items-center gap-2">
                <span className="h-px w-6 bg-[#8C4A27]"></span>
                <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#8C4A27]">
                  Global Real Estate Intelligence
                </p>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-serif font-semibold leading-[1.08] text-[#141413] tracking-tight">
                Understanding the Forces Shaping the Built World.
              </h1>

              <p className="text-base sm:text-lg text-[#4A4843] leading-relaxed max-w-xl font-normal">
                Independent reporting, investment insights and architectural research exploring the ideas, markets and innovations transforming real estate worldwide.
              </p>
            </div>

            {/* CTAs & Global Search Integration */}
            <div className="space-y-6 pt-1">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <a
                  href="#featured-heading"
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-[#1E3A5F] hover:bg-[#141413] text-white text-sm font-semibold rounded shadow-2xs transition-all duration-200 cursor-pointer group whitespace-nowrap"
                >
                  <span>Explore Insights</span>
                  <span className="inline-block transition-transform duration-200 group-hover:translate-x-1 font-sans">
                    &rarr;
                  </span>
                </a>

                <Link
                  to="/investment"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-[#1E3A5F] text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white text-sm font-semibold rounded transition-all duration-200 cursor-pointer whitespace-nowrap"
                >
                  <span>Discover Our Research</span>
                </Link>
              </div>

              {/* Integrated Search Bar */}
              <div className="pt-2 max-w-xl">
                <GlobalSearchBar variant="hero" />
              </div>
            </div>
          </div>

          {/* Right Column: Dominant Architectural Photograph */}
          <div className="lg:col-span-6">
            <figure className="relative group overflow-hidden rounded bg-[#EBE6DF] border border-[#E5E0D8]">
              <div className="relative aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/3] overflow-hidden">
                <img
                  src={resolveEditorialImage('hero-pavilion')}
                  alt="Contemporary travertine limestone and glass architectural pavilion"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                />
                
                {/* Small Editorial Category Overlay Label */}
                <div className="absolute top-4 left-4 bg-[#141413]/85 backdrop-blur-xs text-white text-[11px] uppercase tracking-widest font-semibold px-3 py-1.5 rounded-xs border border-white/10">
                  Monograph 01 — Architecture &amp; Climate
                </div>
              </div>

              <figcaption className="p-3.5 sm:p-4 bg-white border-t border-[#E5E0D8] flex items-center justify-between gap-4 text-xs text-[#5C5A55]">
                <span className="font-serif italic leading-normal">
                  Fig. 1 — Contemporary limestone thermal mass pavilion, featured in our global research archive.
                </span>
                <span className="font-mono text-[11px] text-[#8C4A27] shrink-0 font-medium uppercase tracking-wider">
                  AMAAN Archive
                </span>
              </figcaption>
            </figure>
          </div>

        </div>

        {/* 4. REFINED HORIZONTAL EDITORIAL CATEGORY NAVIGATION */}
        <nav aria-label="Editorial Categories" className="pt-6 pb-2 border-b border-[#E5E0D8]">
          <div className="flex items-center justify-between flex-wrap gap-4 text-xs uppercase tracking-widest font-semibold text-[#5C5A55]">
            <span className="text-[#8C4A27] font-bold text-[11px] shrink-0">Editorial Sections</span>
            <div className="flex items-center gap-4 sm:gap-8 overflow-x-auto py-1">
              <Link to="/investment" className="text-[#141413] hover:text-[#1E3A5F] transition-colors whitespace-nowrap hover:underline underline-offset-4 decoration-[#1E3A5F]">
                Investment
              </Link>
              <span aria-hidden="true" className="text-[#D6CEBE]">|</span>
              <Link to="/architecture" className="text-[#141413] hover:text-[#1E3A5F] transition-colors whitespace-nowrap hover:underline underline-offset-4 decoration-[#1E3A5F]">
                Architecture
              </Link>
              <span aria-hidden="true" className="text-[#D6CEBE]">|</span>
              <Link to="/construction" className="text-[#141413] hover:text-[#1E3A5F] transition-colors whitespace-nowrap hover:underline underline-offset-4 decoration-[#1E3A5F]">
                Construction
              </Link>
              <span aria-hidden="true" className="text-[#D6CEBE]">|</span>
              <Link to="/home-living" className="text-[#141413] hover:text-[#1E3A5F] transition-colors whitespace-nowrap hover:underline underline-offset-4 decoration-[#1E3A5F]">
                Home &amp; Living
              </Link>
              <span aria-hidden="true" className="text-[#D6CEBE]">|</span>
              <Link to="/news" className="text-[#141413] hover:text-[#1E3A5F] transition-colors whitespace-nowrap hover:underline underline-offset-4 decoration-[#1E3A5F]">
                Industry News
              </Link>
            </div>
          </div>
        </nav>
      </section>

      {/* B. FEATURED STORIES */}
      <section aria-labelledby="featured-heading" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-baseline justify-between border-b border-[#E5E0D8] pb-3">
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">Editorial Selection</p>
            <h2 id="featured-heading" className="text-2xl sm:text-3xl font-serif font-semibold text-[#141413]">
              Featured Stories
            </h2>
          </div>
          <Link to="/search?sort=popular" className="text-xs font-semibold text-[#1E3A5F] hover:underline whitespace-nowrap">
            Most Read &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-sm text-[#5C5A55]">Loading editorial stories...</div>
        ) : leadStory ? (
          <div className="space-y-10">
            <ArticleCard article={leadStory} variant="lead" />
            {supportingStories.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {supportingStories.map((story) => (
                  <ArticleCard key={story.id} article={story} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-[#5C5A55]">No featured articles published yet.</p>
        )}
      </section>


      {/* C. INVESTMENT INSIGHTS */}
      <CategoryBand
        id="investment-heading"
        kicker="Markets & Capital"
        title="Investment Insights"
        description="Global property investment, real estate capital markets, property finance, and institutional strategies."
        viewAllHref="/investment"
        articles={investment}
      />

      {/* D. ARCHITECTURE */}
      <CategoryBand
        id="architecture-heading"
        kicker="Spatial Craft"
        title="Architecture"
        description="Modern architecture, iconic civic buildings, passive climate systems, and architectural innovation."
        viewAllHref="/architecture"
        articles={architecture}
      />

      {/* E. CONSTRUCTION */}
      <CategoryBand
        id="construction-heading"
        kicker="Materials & Engineering"
        title="Construction"
        description="Construction technologies, low-carbon materials, structural engineering, and site innovation."
        viewAllHref="/construction"
        articles={construction}
      />

      {/* F. HOME & LIVING */}
      <CategoryBand
        id="home-living-heading"
        kicker="Domestic Spaces"
        title="Home & Living"
        description="Home improvement, tactile residential design, smart energy systems, and sustainable living."
        viewAllHref="/home-living"
        articles={homeLiving}
      />

      {/* G. GLOBAL REAL ESTATE NEWS */}
      <section aria-labelledby="news-heading" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#E5E0D8] pb-3">
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">Policy &amp; Industry</p>
            <h2 id="news-heading" className="text-2xl sm:text-3xl font-serif font-semibold text-[#141413]">
              Global Real Estate News
            </h2>
          </div>
          <Link to="/news" className="text-xs font-semibold text-[#1E3A5F] hover:underline whitespace-nowrap">
            All Industry News &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8 items-start">
            {news.slice(0, 2).map((item) => (
              <ArticleCard key={item.id} article={item} />
            ))}
          </div>

          {/* H. LATEST ARTICLES COMPACT FEED */}
          <div className="lg:col-span-5 bg-white border border-[#E5E0D8] rounded p-6 flex flex-col">
            <div>
              <div className="flex items-baseline justify-between border-b border-[#E5E0D8] pb-3 mb-2">
                <h3 className="text-lg font-serif font-semibold text-[#141413]">Latest Articles</h3>
                <Link to="/search" className="text-xs font-semibold text-[#1E3A5F] hover:underline">
                  Archive &rarr;
                </Link>
              </div>
              <div>
                {latest.slice(0, 5).map((art) => (
                  <ArticleCard key={art.id} article={art} variant="compact" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* I. NEWSLETTER SUBSCRIPTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <NewsletterBox source="homepage" />
      </div>
    </div>
  );
}

interface CategoryBandProps {
  id: string;
  kicker: string;
  title: string;
  description: string;
  viewAllHref: string;
  articles: Article[];
}

function CategoryBand({ id, kicker, title, description, viewAllHref, articles }: CategoryBandProps) {
  if (articles.length === 0) return null;

  return (
    <section aria-labelledby={id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#E5E0D8] pb-4">
        <div className="space-y-1 max-w-2xl">
          <p className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">{kicker}</p>
          <h2 id={id} className="text-2xl sm:text-3xl font-serif font-semibold text-[#141413]">
            {title}
          </h2>
          <p className="text-sm text-[#5C5A55]">{description}</p>
        </div>
        <Link to={viewAllHref} className="text-xs font-semibold text-[#1E3A5F] hover:underline whitespace-nowrap shrink-0">
          Explore {title} &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
