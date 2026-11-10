import { useEffect } from 'react';

export interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  structuredData?: Record<string, any> | Array<Record<string, any>>;
}

export function useSEO({
  title,
  description,
  image,
  url,
  type = 'website',
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

    setMetaTag('property', 'og:site_name', 'AMAAN ESTATE');
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', metaDesc);
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:url', canonicalUrl);
    if (image) {
      setMetaTag('property', 'og:image', image);
    } else {
      document.querySelector('meta[property="og:image"]')?.remove();
    }

    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', metaDesc);
    if (image) {
      setMetaTag('name', 'twitter:image', image);
    } else {
      document.querySelector('meta[name="twitter:image"]')?.remove();
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
  }, [title, description, image, url, type, structuredData]);
}
