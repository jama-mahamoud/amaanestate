import { useEffect } from 'react';

import { RobotsDirective } from '../types';
import {
  DEFAULT_OG_IMAGE_ALT,
  DEFAULT_OG_IMAGE_PATH,
  DEFAULT_SEO_DESCRIPTION,
  DEFAULT_SEO_TITLE,
  formatSeoTitle,
  truncateAtWordBoundary,
} from '../lib/seoUtils';

export interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  url?: string;
  lang?: 'en' | 'so' | string;
  noIndex?: boolean;
  robotsDirective?: RobotsDirective;
  omitCanonical?: boolean;
  type?: 'website' | 'article' | 'profile';
  keywords?: string[];
  publishedTime?: string;
  modifiedTime?: string;
  alternateLinks?: Array<{ hrefLang: string; href: string }>;
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

export function useSEO({
  title,
  description,
  image,
  imageAlt,
  url,
  lang = 'en',
  noIndex = false,
  robotsDirective,
  omitCanonical = false,
  type = 'website',
  keywords,
  publishedTime,
  modifiedTime,
  alternateLinks,
  structuredData,
}: SEOProps) {
  useEffect(() => {
    const docLang = (lang || 'en').trim().toLowerCase() === 'so' ? 'so' : 'en';
    document.documentElement.lang = docLang;

    const fullTitle = formatSeoTitle(title, DEFAULT_SEO_TITLE);
    document.title = fullTitle;

    const metaDesc = truncateAtWordBoundary(description, 158, DEFAULT_SEO_DESCRIPTION);

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
    if (omitCanonical) {
      document.querySelector('link[rel="canonical"]')?.remove();
    } else {
      let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', canonicalUrl);
    }

    const effectiveRobots = robotsDirective || (noIndex ? 'noindex, nofollow' : 'index, follow');
    setMetaTag('name', 'description', metaDesc);
    setMetaTag('name', 'robots', effectiveRobots);

    if (keywords && keywords.length > 0) {
      setMetaTag('name', 'keywords', keywords.join(', '));
    } else {
      document.querySelector('meta[name="keywords"]')?.remove();
    }

    const resolvedImage = image || DEFAULT_OG_IMAGE_PATH;
    const resolvedImageAlt = imageAlt || (image ? fullTitle : DEFAULT_OG_IMAGE_ALT);
    const absoluteImage = toAbsoluteUrl(resolvedImage);

    setMetaTag('property', 'og:site_name', 'AmaanEstate');
    setMetaTag('property', 'og:locale', docLang === 'so' ? 'so_SO' : 'en_US');
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', metaDesc);
    setMetaTag('property', 'og:type', type);
    if (omitCanonical) {
      document.querySelector('meta[property="og:url"]')?.remove();
    } else {
      setMetaTag('property', 'og:url', canonicalUrl);
    }
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

    // Hreflang alternate links
    document.querySelectorAll('link[data-amaan-hreflang="true"]').forEach((el) => el.remove());
    if (alternateLinks && alternateLinks.length > 0 && !omitCanonical) {
      alternateLinks.forEach((alt) => {
        if (!alt.hrefLang || !alt.href) return;
        const link = document.createElement('link');
        link.setAttribute('rel', 'alternate');
        link.setAttribute('hreflang', alt.hrefLang);
        link.setAttribute('href', alt.href);
        link.setAttribute('data-amaan-hreflang', 'true');
        document.head.appendChild(link);
      });
    }

    // Remove both prior CSR and SSR JSON-LD blocks before applying route structured data
    document
      .querySelectorAll('script[data-amaan-seo="true"], script[data-amaan-ssr-seo="true"]')
      .forEach((s) => s.remove());

    if (structuredData && !noIndex) {
      const blocks = Array.isArray(structuredData) ? structuredData : [structuredData];
      blocks.forEach((block) => {
        const scriptEl = document.createElement('script');
        scriptEl.setAttribute('type', 'application/ld+json');
        scriptEl.setAttribute('data-amaan-seo', 'true');
        scriptEl.textContent = JSON.stringify(block);
        document.head.appendChild(scriptEl);
      });
    }
  }, [
    title,
    description,
    image,
    imageAlt,
    url,
    lang,
    noIndex,
    robotsDirective,
    omitCanonical,
    type,
    keywords,
    publishedTime,
    modifiedTime,
    alternateLinks,
    structuredData,
  ]);
}
