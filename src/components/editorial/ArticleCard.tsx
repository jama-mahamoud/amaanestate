import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Article } from '../../types';
import { resolveEditorialImage } from '../../lib/editorialImages';

interface ArticleCardProps {
  article: Article;
  variant?: 'default' | 'lead' | 'compact';
}

export function formatPublicationDate(dateStr?: string | null): string {
  if (!dateStr) return 'Unpublished';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ArticleCard({ article, variant = 'default' }: ArticleCardProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const imageSrc = resolveEditorialImage(article.featured_image, 'hero-pavilion');

  if (variant === 'lead') {
    return (
      <article className="group grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch border-b border-[#E5E0D8] pb-10 sm:pb-12">
        <Link
          to={`/articles/${article.slug}`}
          className="lg:col-span-7 block overflow-hidden bg-[#F4F1EC] rounded-lg aspect-[16/10] lg:aspect-auto lg:min-h-[380px] border border-[#E5E0D8] group-hover:border-[#C8BFB0] transition-colors duration-300"
        >
          {!imgFailed ? (
            <img
              src={imageSrc}
              alt={article.featured_image_alt || article.title}
              referrerPolicy="no-referrer"
              onError={() => setImgFailed(true)}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-8 bg-[#F4F1EC] text-[#5C5A55] font-serif text-lg text-center">
              {article.title}
            </div>
          )}
        </Link>

        <div className="lg:col-span-5 flex flex-col justify-between py-1 space-y-6">
          <div className="space-y-4">
            {article.category && (
              <div>
                <Link
                  to={`/${article.category.slug}`}
                  className="inline-block text-xs uppercase tracking-[0.18em] font-semibold text-[#8C4A27] hover:text-[#1E3A5F] transition-colors"
                >
                  {article.category.name}
                </Link>
              </div>
            )}

            <Link to={`/articles/${article.slug}`} className="block group/title">
              <h3 className="text-2xl sm:text-3xl lg:text-[2.2rem] font-serif font-semibold leading-[1.18] text-[#141413] group-hover/title:text-[#1E3A5F] transition-colors">
                {article.title}
              </h3>
            </Link>

            <p className="text-base text-[#4A4843] leading-relaxed line-clamp-4">
              {article.excerpt}
            </p>
          </div>

          <div className="pt-4 border-t border-[#E5E0D8]/80 flex items-center justify-between">
            <Link
              to={`/articles/${article.slug}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#1E3A5F] hover:bg-[#8C4A27] rounded-md shadow-2xs transition-all duration-200 group/btn"
            >
              <span>Read Article</span>
              <span className="inline-block transition-transform duration-200 group-hover/btn:translate-x-1 font-sans">
                &rarr;
              </span>
            </Link>
          </div>
        </div>
      </article>
    );
  }

  if (variant === 'compact') {
    return (
      <article className="group py-4 border-b border-[#E5E0D8] last:border-b-0 flex flex-col gap-2.5">
        {article.category && (
          <div>
            <Link
              to={`/${article.category.slug}`}
              className="inline-block text-[11px] uppercase tracking-[0.16em] font-semibold text-[#8C4A27] hover:text-[#1E3A5F] transition-colors"
            >
              {article.category.name}
            </Link>
          </div>
        )}

        <Link to={`/articles/${article.slug}`} className="block">
          <h4 className="text-base sm:text-lg font-serif font-semibold leading-snug text-[#141413] group-hover:text-[#1E3A5F] transition-colors">
            {article.title}
          </h4>
        </Link>

        {article.excerpt && (
          <p className="text-xs sm:text-sm text-[#5C5A55] line-clamp-2 leading-relaxed">
            {article.excerpt}
          </p>
        )}

        <div className="pt-1">
          <Link
            to={`/articles/${article.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E3A5F] group-hover:text-[#8C4A27] transition-colors py-0.5 group/btn"
          >
            <span>Read Article</span>
            <span className="inline-block transition-transform duration-200 group-hover/btn:translate-x-1 font-sans">
              &rarr;
            </span>
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex flex-col h-full bg-white border border-[#E5E0D8] hover:border-[#C8BFB0] rounded-lg p-5 sm:p-6 transition-all duration-300 shadow-2xs hover:shadow-md hover:-translate-y-0.5">
      <Link
        to={`/articles/${article.slug}`}
        className="block overflow-hidden bg-[#F4F1EC] rounded-md aspect-[16/10] mb-5 border border-[#EBE6DF] group-hover:border-[#DFD7CB] transition-colors"
      >
        {!imgFailed ? (
          <img
            src={imageSrc}
            alt={article.featured_image_alt || article.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover transition-transform duration-600 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-6 bg-[#F4F1EC] text-[#5C5A55] font-serif text-sm text-center">
            {article.title}
          </div>
        )}
      </Link>

      <div className="flex flex-col flex-1 justify-between space-y-4">
        <div className="space-y-3">
          {article.category && (
            <div>
              <Link
                to={`/${article.category.slug}`}
                className="inline-block text-[11px] uppercase tracking-[0.18em] font-semibold text-[#8C4A27] hover:text-[#1E3A5F] transition-colors"
              >
                {article.category.name}
              </Link>
            </div>
          )}

          <Link to={`/articles/${article.slug}`} className="block">
            <h3 className="text-xl font-serif font-semibold leading-snug text-[#141413] group-hover:text-[#1E3A5F] transition-colors line-clamp-2">
              {article.title}
            </h3>
          </Link>

          <p className="text-sm text-[#4A4843] leading-relaxed line-clamp-3">
            {article.excerpt}
          </p>
        </div>

        <div className="pt-4 border-t border-[#F0ECE1] mt-auto flex items-center justify-between">
          <Link
            to={`/articles/${article.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E3A5F] group-hover:text-[#8C4A27] transition-colors py-1 group/btn"
          >
            <span>Read Article</span>
            <span className="inline-block transition-transform duration-200 group-hover/btn:translate-x-1 font-sans">
              &rarr;
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}
