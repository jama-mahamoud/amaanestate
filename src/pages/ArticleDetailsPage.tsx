import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Copy, Share2 } from 'lucide-react';
import { Article } from '../types';
import { getPublishedArticleBySlug, getRelatedArticles } from '../services/editorialService';
import { resolveEditorialImage } from '../lib/editorialImages';
import { useSEO } from '../hooks/useSEO';
import ArticleCard, { formatPublicationDate } from '../components/editorial/ArticleCard';
import EditorialMarkdown from '../components/editorial/EditorialMarkdown';
import AdPlacement from '../components/editorial/AdPlacement';
import NewsletterBox from '../components/editorial/NewsletterBox';
import { toast } from 'sonner';

export default function ArticleDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [article, setArticle] = useState<Article | null>(null);
  const [related, setRelated] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!slug) return;
      setLoading(true);
      const data = await getPublishedArticleBySlug(slug);
      if (!active) return;
      setArticle(data);
      if (data) {
        const rel = await getRelatedArticles(data, 3);
        if (active) setRelated(rel);
      } else {
        setRelated([]);
      }
      setLoading(false);
    }
    load();
    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    const onScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) {
        setScrollProgress(0);
        return;
      }
      setScrollProgress(Math.min(100, Math.max(0, (window.scrollY / docHeight) * 100)));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const articleUrl = typeof window !== 'undefined' ? window.location.href : `https://amaanestate.com/articles/${slug}`;

  const structuredData = useMemo(() => {
    if (!article) return undefined;
    const articleSchema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.seo_title || article.title,
      description: article.seo_description || article.excerpt,
      datePublished: article.published_at || article.created_at,
      dateModified: article.updated_at || article.published_at || article.created_at,
      author: {
        '@type': 'Person',
        name: article.author?.name || 'AMAAN ESTATE Editorial Desk',
      },
      publisher: {
        '@type': 'Organization',
        name: 'AMAAN ESTATE',
        url: 'https://amaanestate.com',
      },
      mainEntityOfPage: articleUrl,
    };

    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://amaanestate.com/' },
        ...(article.category
          ? [
              {
                '@type': 'ListItem',
                position: 2,
                name: article.category.name,
                item: `https://amaanestate.com/${article.category.slug}`,
              },
            ]
          : []),
        {
          '@type': 'ListItem',
          position: article.category ? 3 : 2,
          name: article.title,
          item: articleUrl,
        },
      ],
    };

    return [articleSchema, breadcrumbSchema];
  }, [article, articleUrl]);

  useSEO({
    title: article ? article.seo_title || article.title : 'Article Not Found',
    description: article ? article.seo_description || article.excerpt : 'Read international real estate research on AMAAN ESTATE.',
    image: article?.og_image || article?.featured_image || undefined,
    type: 'article',
    structuredData,
  });

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(articleUrl);
      setCopied(true);
      toast.success('Article link copied to clipboard.');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Unable to copy link.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-sm text-[#5C5A55]">
        Loading article...
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <h1 className="text-3xl font-serif font-semibold text-[#141413]">Article Not Available</h1>
        <p className="text-sm text-[#5C5A55]">
          The requested article could not be found or has not been published.
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="px-5 py-2.5 bg-[#1E3A5F] text-white text-sm font-semibold rounded cursor-pointer"
        >
          Return Home
        </button>
      </div>
    );
  }

  const featuredImageSrc = resolveEditorialImage(article.featured_image, 'hero-pavilion');
  const displayDate = formatPublicationDate(article.published_at || article.created_at);
  const authorAvatar = resolveEditorialImage(article.author?.avatar_url, 'author-portrait');

  return (
    <div>
      {/* Thin Reading Progress Indicator */}
      <div className="fixed top-16 left-0 right-0 h-0.5 bg-transparent z-30 pointer-events-none">
        <div
          className="h-full bg-[#1E3A5F] transition-transform duration-150 origin-left"
          style={{ transform: `scaleX(${scrollProgress / 100})` }}
        />
      </div>

      <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Breadcrumb & Back */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <nav aria-label="Breadcrumb" className="text-xs text-[#5C5A55] flex items-center gap-2">
            <Link to="/" className="hover:text-[#141413]">Home</Link>
            <span aria-hidden="true">/</span>
            {article.category && (
              <>
                <Link to={`/${article.category.slug}`} className="hover:text-[#141413]">
                  {article.category.name}
                </Link>
                <span aria-hidden="true">/</span>
              </>
            )}
            <span className="text-[#141413] font-medium truncate max-w-[240px] sm:max-w-sm">
              {article.title}
            </span>
          </nav>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C5A55] hover:text-[#141413] cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back</span>
          </button>
        </div>

        {/* Editorial Headline & Byline Header */}
        <header className="max-w-3xl mx-auto space-y-5 text-left">
          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-widest font-semibold text-[#5C5A55]">
            {article.category && (
              <Link to={`/${article.category.slug}`} className="text-[#8C4A27] hover:underline">
                {article.category.name}
              </Link>
            )}
            <span aria-hidden="true">·</span>
            <span>{displayDate}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{article.reading_time} min read</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-semibold leading-[1.12] text-[#141413]">
            {article.title}
          </h1>

          <p className="text-lg text-[#4A4843] leading-relaxed font-normal">
            {article.excerpt}
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[#E5E0D8]">
            <div className="flex items-center gap-3">
              <img
                src={authorAvatar}
                alt={article.author?.name || 'Author'}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover bg-[#EBE6DF]"
              />
              <div>
                <div className="text-sm font-semibold text-[#141413]">
                  {article.author?.name || 'AMAAN ESTATE Desk'}
                </div>
                <div className="text-xs text-[#5C5A55]">
                  {article.author?.title || 'Editorial Staff'}
                </div>
              </div>
            </div>

            {/* Social Sharing */}
            <div className="flex items-center gap-2 text-xs font-medium">
              <span className="text-[#7A7770] inline-flex items-center gap-1 mr-1">
                <Share2 size={13} /> Share:
              </span>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(articleUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1.5 bg-white border border-[#E5E0D8] hover:border-[#1E3A5F] rounded text-[#141413]"
              >
                X
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1.5 bg-white border border-[#E5E0D8] hover:border-[#1E3A5F] rounded text-[#141413]"
              >
                LinkedIn
              </a>
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-2.5 py-1.5 bg-white border border-[#E5E0D8] hover:border-[#1E3A5F] rounded text-[#141413] inline-flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Featured Lead Photograph */}
        <figure className="space-y-2">
          <div className="aspect-[16/9] w-full overflow-hidden rounded bg-[#EBE6DF]">
            <img
              src={featuredImageSrc}
              alt={article.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <figcaption className="text-xs font-serif italic text-[#5C5A55] max-w-3xl mx-auto">
            AMAAN ESTATE Editorial Photography · {article.category?.name || 'Global Coverage'}
          </figcaption>
        </figure>

        {/* Main Reading Column */}
        <div className="max-w-2xl mx-auto space-y-8">
          <EditorialMarkdown content={article.content} />

          {/* Image Gallery if present */}
          {article.gallery_images && article.gallery_images.length > 0 && (
            <section aria-label="Article gallery" className="pt-4 space-y-3 border-t border-[#E5E0D8]">
              <h2 className="text-sm font-sans uppercase tracking-widest font-semibold text-[#5C5A55]">
                Visual Plates
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {article.gallery_images.map((img, i) => (
                  <div key={i} className="aspect-[4/3] overflow-hidden rounded bg-[#EBE6DF]">
                    <img
                      src={resolveEditorialImage(img)}
                      alt={`${article.title} plate ${i + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Topic Tags (unboxed typographic links) */}
          {article.tags && article.tags.length > 0 && (
            <div className="pt-4 border-t border-[#E5E0D8] flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#5C5A55]">
              <span className="uppercase tracking-widest font-semibold text-[#141413]">Topics:</span>
              {article.tags.map((tag) => (
                <Link
                  key={tag.id}
                  to={`/search?tag=${tag.slug}`}
                  className="hover:text-[#1E3A5F] underline"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          )}

          <AdPlacement slotName="amaan-article-inline" format="inline" />

          {/* Author Bio Card */}
          {article.author && (
            <section
              aria-label="About the author"
              className="bg-white border border-[#E5E0D8] rounded p-6 flex flex-col sm:flex-row gap-5 items-start"
            >
              <img
                src={authorAvatar}
                alt={article.author.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-full object-cover bg-[#EBE6DF] shrink-0"
              />
              <div className="space-y-1.5">
                <p className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">
                  About the Author
                </p>
                <h3 className="text-lg font-serif font-semibold text-[#141413]">
                  {article.author.name}
                </h3>
                <p className="text-xs font-medium text-[#5C5A55]">{article.author.title}</p>
                <p className="text-sm text-[#4A4843] leading-relaxed pt-1">
                  {article.author.bio}
                </p>
              </div>
            </section>
          )}
        </div>

        {/* Recommended / Related Reading */}
        {related.length > 0 && (
          <section aria-labelledby="related-heading" className="pt-10 border-t border-[#E5E0D8] space-y-6">
            <div className="flex items-baseline justify-between">
              <h2 id="related-heading" className="text-2xl font-serif font-semibold text-[#141413]">
                Recommended Reading
              </h2>
              {article.category && (
                <Link
                  to={`/${article.category.slug}`}
                  className="text-xs font-semibold text-[#1E3A5F] hover:underline"
                >
                  More in {article.category.name} &rarr;
                </Link>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {related.map((item) => (
                <ArticleCard key={item.id} article={item} />
              ))}
            </div>
          </section>
        )}

        <NewsletterBox source={`article:${article.slug}`} />
      </article>
    </div>
  );
}
