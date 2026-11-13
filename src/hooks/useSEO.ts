import { useEffect } from 'react';

export interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  url?: string;
  noIndex?: boolean;
  type?: 'website' | 'article' | 'profile';
  keywords?: string[];
  publishedTime?: string;
  modifiedTime?: string;
  structuredData?: Record<string, any> | Array<Record<string, any>>;
}

export function getCanonicalOrigin(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return window.location.origin;
    }
    return 'https://www.amaanestate.com';
  }
  return 'https://www.amaanestate.com';
}

function toAbsoluteUrl(value?: string): string | undefined {
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;
  const origin = getCanonicalOrigin();
  return `${origin}${value.startsWith('/') ? '' : '/'}${value}`;
}

const DEFAULT_SEO_TITLE =
  'AmaanEstate | Global Real Estate News, Research & Property Marketplace';
const DEFAULT_SEO_DESCRIPTION =
  'Explore global real estate news, housing market research, property investment insights, market trends and property listings with AmaanEstate.';
const DEFAULT_OG_IMAGE = '/images/articles/sovereign-capital-logistics-corridors.jpg';
const DEFAULT_OG_IMAGE_ALT = 'AmaanEstate — Global Real Estate Media, Research & Marketplace';

export function useSEO({
  title,
  description,
  image,
  imageAlt,
  url,
  noIndex = false,
  type = 'website',
  keywords,
  publishedTime,
  modifiedTime,
  structuredData,
}: SEOProps) {
  useEffect(() => {
    const hasBrand = title ? /amaan\s*estate/i.test(title) : false;
    const fullTitle = title
      ? hasBrand
        ? title
        : `${title} | AmaanEstate`
      : DEFAULT_SEO_TITLE;
    document.title = fullTitle;

    const metaDesc = description || DEFAULT_SEO_DESCRIPTION;

    const setMetaTag = (attributeName: string, attributeValue: string, content: string) => {
      let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeName, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    const canonicalUrl = url || getCanonicalOrigin() + window.location.pathname;
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    setMetaTag('name', 'description', metaDesc);
    setMetaTag('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    if (keywords && keywords.length > 0) {
      setMetaTag('name', 'keywords', keywords.join(', '));
    } else {
      document.querySelector('meta[name="keywords"]')?.remove();
    }

    const resolvedImage = image || DEFAULT_OG_IMAGE;
    const resolvedImageAlt = imageAlt || (image ? fullTitle : DEFAULT_OG_IMAGE_ALT);
    const absoluteImage = toAbsoluteUrl(resolvedImage);

    setMetaTag('property', 'og:site_name', 'AmaanEstate');
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', metaDesc);
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:url', canonicalUrl);
    if (absoluteImage) {
      setMetaTag('property', 'og:image', absoluteImage);
      setMetaTag('property', 'og:image:alt', resolvedImageAlt);
    }

    if (type === 'article' && publishedTime) {
      setMetaTag('property', 'article:published_time', publishedTime);
    } else {
      document.querySelector('meta[property="article:published_time"]')?.remove();
    }

    if (type === 'article' && modifiedTime) {
      setMetaTag('property', 'article:modified_time', modifiedTime);
    } else {
      document.querySelector('meta[property="article:modified_time"]')?.remove();
    }

    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', metaDesc);
    if (absoluteImage) {
      setMetaTag('name', 'twitter:image', absoluteImage);
      setMetaTag('name', 'twitter:image:alt', resolvedImageAlt);
    }

    const existingScripts = document.querySelectorAll('script[data-amaan-seo="true"]');
    existingScripts.forEach((s) => s.remove());

    if (structuredData) {
      const blocks = Array.isArray(structuredData) ? structuredData : [structuredData];
      blocks.forEach((block) => {
        const scriptEl = document.createElement('script');
        scriptEl.setAttribute('type', 'application/ld+json');
        scriptEl.setAttribute('data-amaan-seo', 'true');
        scriptEl.textContent = JSON.stringify(block);
        document.head.appendChild(scriptEl);
      });
    }
  }, [title, description, image, imageAlt, url, noIndex, type, keywords, publishedTime, modifiedTime, structuredData]);
}
