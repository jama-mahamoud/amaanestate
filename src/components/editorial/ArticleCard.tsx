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
  const displayDate = formatPublicationDate(article.published_at || article.created_at);

  if (variant === 'lead') {
    return (
      <article className="group grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch border-b border-[#E5E0D8] pb-10">
        <Link
          to={`/articles/${article.slug}`}
          className="lg:col-span-7 block overflow-hidden bg-[#EBE6DF] rounded aspect-[16/10] lg:aspect-auto lg:min-h-[380px]"
        >
          {!imgFailed ? (
            <img
              src={imageSrc}
              alt={article.title}
              referrerPolicy="no-referrer"
              onError={() => setImgFailed(true)}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-8 bg-[#EBE6DF] text-[#5C5A55] font-serif text-lg text-center">
              {article.title}
            </div>
          )}
        </Link>

        <div className="lg:col-span-5 flex flex-col justify-between py-1 space-y-5">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-widest font-semibold text-[#5C5A55]">
              {article.category && (
                <Link
                  to={`/category/${article.category.slug}`}
                  className="text-[#8C4A27] hover:underline"
                >
                  {article.category.name}
                </Link>
              )}
              <span aria-hidden="true">·</span>
              <span>{displayDate}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{article.reading_time} min read</span>
            </div>

            <Link to={`/articles/${article.slug}`} className="block">
              <h3 className="text-2xl sm:text-3xl lg:text-[2rem] font-serif font-semibold leading-tight text-[#141413] group-hover:text-[#1E3A5F] transition-colors">
                {article.title}
              </h3>
            </Link>

            <p className="text-base text-[#4A4843] leading-relaxed line-clamp-4">
              {article.excerpt}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#E5E0D8] text-xs text-[#5C5A55]">
            <span>
              By <strong className="font-semibold text-[#141413]">{article.author?.name || 'AMAAN ESTATE Desk'}</strong>
            </span>
            <Link
              to={`/articles/${article.slug}`}
              className="font-semibold text-[#1E3A5F] hover:underline whitespace-nowrap"
            >
              Read Analysis &rarr;
            </Link>
          </div>
        </div>
      </article>
    );
  }

  if (variant === 'compact') {
    return (
      <article className="group py-4 border-b border-[#E5E0D8] last:border-b-0 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-medium text-[#5C5A55]">
          {article.category && (
            <Link to={`/category/${article.category.slug}`} className="text-[#8C4A27] hover:underline">
              {article.category.name}
            </Link>
          )}
          <span aria-hidden="true">·</span>
          <span>{displayDate}</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">{article.reading_time} min read</span>
        </div>

        <Link to={`/articles/${article.slug}`} className="block">
          <h4 className="text-lg font-serif font-semibold leading-snug text-[#141413] group-hover:text-[#1E3A5F] transition-colors">
            {article.title}
          </h4>
        </Link>

        <p className="text-sm text-[#5C5A55] line-clamp-2 leading-relaxed">{article.excerpt}</p>
      </article>
    );
  }

  return (
    <article className="group flex flex-col h-full">
      <Link
        to={`/articles/${article.slug}`}
        className="block overflow-hidden bg-[#EBE6DF] rounded aspect-[4/3] mb-4"
      >
        {!imgFailed ? (
          <img
            src={imageSrc}
            alt={article.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-6 bg-[#EBE6DF] text-[#5C5A55] font-serif text-sm text-center">
            {article.title}
          </div>
        )}
      </Link>

      <div className="flex flex-col flex-1 justify-between space-y-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wider font-medium text-[#5C5A55]">
            {article.category && (
              <Link to={`/category/${article.category.slug}`} className="text-[#8C4A27] hover:underline">
                {article.category.name}
              </Link>
            )}
            <span aria-hidden="true">·</span>
            <span>{displayDate}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{article.reading_time} min</span>
          </div>

          <Link to={`/articles/${article.slug}`} className="block">
            <h3 className="text-xl font-serif font-semibold leading-snug text-[#141413] group-hover:text-[#1E3A5F] transition-colors line-clamp-2">
              {article.title}
            </h3>
          </Link>

          <p className="text-sm text-[#5C5A55] leading-relaxed line-clamp-3">
            {article.excerpt}
          </p>
        </div>

        <div className="pt-2 text-xs text-[#5C5A55]">
          By <span className="font-medium text-[#141413]">{article.author?.name || 'Editorial Desk'}</span>
        </div>
      </div>
    </article>
  );
}
