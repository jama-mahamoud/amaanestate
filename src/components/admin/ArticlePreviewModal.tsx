import React from 'react';
import { ExternalLink, X } from 'lucide-react';
import { Article, Author, Category, Tag } from '../../types';
import { resolveEditorialImage } from '../../lib/editorialImages';
import EditorialMarkdown from '../editorial/EditorialMarkdown';

interface ArticlePreviewModalProps {
  open: boolean;
  onClose: () => void;
  article: {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featured_image?: string | null;
    featured_image_alt?: string;
    gallery_images?: string[];
    category?: Category | null;
    author?: Author | null;
    tags?: Tag[];
    status: string;
    reading_time: number;
    published_at?: string | null;
    scheduled_for?: string | null;
    seo_title?: string | null;
    seo_description?: string | null;
  };
}

export default function ArticlePreviewModal({ open, onClose, article }: ArticlePreviewModalProps) {
  if (!open) return null;

  const displayDate = new Date(
    article.published_at || article.scheduled_for || Date.now()
  ).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Editorial Article Preview"
      className="fixed inset-0 z-50 bg-black/60 flex items-start sm:items-center justify-center p-0 sm:p-6 overflow-y-auto"
    >
      <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-none sm:rounded-md w-full max-w-5xl h-[100dvh] sm:h-auto sm:max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="bg-white border-b border-[#E5E0D8] px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-2 sm:gap-4 shrink-0">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#5C5A55] min-w-0">
            <span className="font-semibold uppercase tracking-widest text-[#8C4A27] whitespace-nowrap">
              Editorial Preview
            </span>
            <span aria-hidden="true">·</span>
            <span className="capitalize font-medium text-[#141413]">{article.status}</span>
            {article.slug && (
              <>
                <span aria-hidden="true" className="hidden sm:inline">·</span>
                <span className="hidden sm:inline font-mono text-[#7A7770] truncate max-w-xs">/articles/{article.slug}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {article.status === 'published' && article.slug && (
              <a
                href={`/articles/${article.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[38px] px-3 py-1.5 bg-[#EFECE6] hover:bg-[#E5E0D8] rounded text-xs font-semibold text-[#141413] inline-flex items-center gap-1.5 whitespace-nowrap"
              >
                <ExternalLink size={13} />
                <span>Open Live URL</span>
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close preview"
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-[#5C5A55] hover:text-[#141413] hover:bg-[#EFECE6] rounded cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-10 py-6 sm:py-10">
          <article className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
            <header className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-widest font-semibold text-[#5C5A55]">
                <span className="text-[#8C4A27]">{article.category?.name || 'Uncategorized'}</span>
                <span aria-hidden="true">·</span>
                <span>{displayDate}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{article.reading_time} min read</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-serif font-semibold leading-[1.12] text-[#141413] [overflow-wrap:anywhere]">
                {article.title || 'Untitled Editorial Article'}
              </h1>

              {article.excerpt && (
                <p className="text-base sm:text-lg text-[#4A4843] leading-relaxed">{article.excerpt}</p>
              )}

              {article.author ? (
                <div className="flex items-center gap-3 pt-3 border-t border-[#E5E0D8]">
                  <img
                    src={resolveEditorialImage(article.author.avatar_url, 'author-portrait')}
                    alt={article.author.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover bg-[#EBE6DF]"
                  />
                  <div>
                    <div className="text-sm font-semibold text-[#141413]">{article.author.name}</div>
                    <div className="text-xs text-[#5C5A55]">{article.author.title}</div>
                  </div>
                </div>
              ) : (
                <div className="pt-3 border-t border-[#E5E0D8]">
                  <div className="text-sm font-semibold text-[#141413]">AMAAN ESTATE Editorial Desk</div>
                  <div className="text-xs text-[#5C5A55]">Institutional Research &amp; Market Reporting</div>
                </div>
              )}
            </header>

            {article.featured_image && (
              <figure className="space-y-2">
                <div className="aspect-[16/9] w-full overflow-hidden rounded bg-[#EBE6DF]">
                  <img
                    src={resolveEditorialImage(article.featured_image)}
                    alt={article.featured_image_alt || article.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                {article.featured_image_alt && (
                  <figcaption className="text-xs font-serif italic text-[#5C5A55]">
                    {article.featured_image_alt}
                  </figcaption>
                )}
              </figure>
            )}

            <EditorialMarkdown content={article.content || '*No article prose entered yet.*'} />

            {article.gallery_images && article.gallery_images.length > 0 && (
              <section className="pt-6 border-t border-[#E5E0D8] space-y-3">
                <h2 className="text-xs uppercase tracking-widest font-semibold text-[#5C5A55]">
                  Additional Images
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {article.gallery_images.map((img, i) => (
                    <div key={i} className="aspect-[4/3] overflow-hidden rounded bg-[#EBE6DF]">
                      <img
                        src={resolveEditorialImage(img)}
                        alt={`Gallery image ${i + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {article.tags && article.tags.length > 0 && (
              <div className="pt-4 border-t border-[#E5E0D8] flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#5C5A55]">
                <span className="uppercase tracking-widest font-semibold text-[#141413]">Topics:</span>
                {article.tags.map((tag, i) => (
                  <React.Fragment key={tag.id}>
                    {i > 0 && <span aria-hidden="true">·</span>}
                    <span>{tag.name}</span>
                  </React.Fragment>
                ))}
              </div>
            )}

            <div className="bg-white border border-[#E5E0D8] rounded p-4 sm:p-5 space-y-2">
              <div className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">
                Search Engine Snippet Preview
              </div>
              <div className="text-base font-medium text-[#1E3A5F] break-words">
                {article.seo_title || article.title || 'AMAAN ESTATE Article'}
              </div>
              <div className="text-xs font-mono text-[#14532D] break-all">
                https://amaanestate.com/articles/{article.slug || 'article-slug'}
              </div>
              <p className="text-xs text-[#5C5A55] break-words">
                {article.seo_description || article.excerpt || 'No SEO meta description provided yet.'}
              </p>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
