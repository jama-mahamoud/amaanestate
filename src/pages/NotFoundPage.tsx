import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass, Home, Newspaper, Search } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';

interface NotFoundPageProps {
  title?: string;
  heading?: string;
  message?: string;
}

export default function NotFoundPage({
  title = 'Page Not Found (404) | AmaanEstate',
  heading = 'Page or Article Not Found',
  message = 'The page or article you requested is unavailable. It may have been removed, archived, or moved to a new location.',
}: NotFoundPageProps) {
  useSEO({
    title,
    description:
      'The requested page or article could not be found on AmaanEstate. Explore global real estate news, research, and property listings.',
    noIndex: true,
    omitCanonical: true,
    type: 'website',
  });

  return (
    <section
      aria-labelledby="not-found-heading"
      className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 text-center space-y-6"
    >
      <p className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">
        404 · Not Found
      </p>
      <h1
        id="not-found-heading"
        className="text-3xl sm:text-4xl font-serif font-semibold text-[#141413]"
      >
        {heading}
      </h1>
      <p className="text-sm sm:text-base text-[#5C5A55] leading-relaxed max-w-lg mx-auto">
        {message}
      </p>

      <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/news"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1E3A5F] hover:bg-[#162C49] text-white text-xs font-semibold rounded transition-colors"
        >
          <Newspaper size={14} />
          <span>Explore Global News</span>
        </Link>
        <Link
          to="/search"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-[#E5E0D8] hover:border-[#1E3A5F] text-[#141413] text-xs font-semibold rounded transition-colors"
        >
          <Search size={14} />
          <span>Search Articles</span>
        </Link>
        <Link
          to="/buy"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-[#E5E0D8] hover:border-[#1E3A5F] text-[#141413] text-xs font-semibold rounded transition-colors"
        >
          <Compass size={14} />
          <span>Browse Marketplace</span>
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FAF8F5] border border-[#D6CEBE] hover:border-[#141413] text-[#141413] text-xs font-semibold rounded transition-colors"
        >
          <Home size={14} />
          <span>Homepage</span>
        </Link>
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C5A55] hover:text-[#141413] cursor-pointer"
        >
          <ArrowLeft size={13} />
          <span>Go back to previous page</span>
        </button>
      </div>
    </section>
  );
}
