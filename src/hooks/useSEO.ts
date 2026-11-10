import { useEffect } from 'react';

export interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  keywords?: string[];
  publishedTime?: string;
  modifiedTime?: string;
  structuredData?: Record<string, any> | Array<Record<string, any>>;
}

function toAbsoluteUrl(value?: string): string | undefined {
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;
  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://amaanestate.com';
  return `${origin}${value.startsWith('/') ? '' : '/'}${value}`;
}

export function useSEO({
  title,
  description,
  image,
  imageAlt,
  url,
  type = 'website',
  keywords,
  publishedTime,
  modifiedTime,
  structuredData,
}: SEOProps) {
  useEffect(() => {
    const fullTitle = title
      ? title.includes('AMAAN ESTATE')
        ? title
        : `${title} | AMAAN ESTATE`
      : 'AMAAN ESTATE — Global Real Estate Media, Research & Knowledge';
    document.title = fullTitle;

    const metaDesc =
      description ||
      'AMAAN ESTATE is a global real estate media, research, and knowledge platform covering investment, architecture, construction, home living, and property industry news.';

    const setMetaTag = (attributeName: string, attributeValue: string, content: string) => {
      let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeName, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    const canonicalUrl = url || window.location.origin + window.location.pathname;
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    setMetaTag('name', 'description', metaDesc);
    setMetaTag('name', 'robots', 'index, follow');

    if (keywords && keywords.length > 0) {
      setMetaTag('name', 'keywords', keywords.join(', '));
    } else {
      document.querySelector('meta[name="keywords"]')?.remove();
    }

    const absoluteImage = toAbsoluteUrl(image);

    setMetaTag('property', 'og:site_name', 'AMAAN ESTATE');
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', metaDesc);
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:url', canonicalUrl);
    if (absoluteImage) {
      setMetaTag('property', 'og:image', absoluteImage);
      if (imageAlt) {
        setMetaTag('property', 'og:image:alt', imageAlt);
      } else {
        document.querySelector('meta[property="og:image:alt"]')?.remove();
      }
    } else {
      document.querySelector('meta[property="og:image"]')?.remove();
      document.querySelector('meta[property="og:image:alt"]')?.remove();
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
      if (imageAlt) {
        setMetaTag('name', 'twitter:image:alt', imageAlt);
      } else {
        document.querySelector('meta[name="twitter:image:alt"]')?.remove();
      }
    } else {
      document.querySelector('meta[name="twitter:image"]')?.remove();
      document.querySelector('meta[name="twitter:image:alt"]')?.remove();
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
  }, [title, description, image, imageAlt, url, type, keywords, publishedTime, modifiedTime, structuredData]);
}
