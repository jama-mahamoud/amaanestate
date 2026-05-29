import { useEffect } from 'react';

export interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  structuredData?: Record<string, any>;
}

export function useSEO({ title, description, image, url, type = 'website', structuredData }: SEOProps) {
  useEffect(() => {
    // 1. Update document title
    const fullTitle = `${title} | AmaanEstate — Verify & Deal Locally`;
    document.title = fullTitle;

    // 2. Helper to set meta tags safely
    const setMetaTag = (attributeName: string, attributeValue: string, content: string) => {
      let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeName, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Standard SEO Meta Tags
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'robots', 'index, follow');

    // Open Graph Meta Tags (Facebook / LinkedIn / Mobile messengers integration)
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', type);
    if (image) {
      setMetaTag('property', 'og:image', image);
    } else {
      const el = document.querySelector('meta[property="og:image"]');
      if (el) el.remove();
    }
    if (url) {
      setMetaTag('property', 'og:url', url);
    } else {
      setMetaTag('property', 'og:url', window.location.href);
    }

    // Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', description);
    if (image) {
      setMetaTag('name', 'twitter:image', image);
    } else {
      const el = document.querySelector('meta[name="twitter:image"]');
      if (el) el.remove();
    }

    // 3. Structured Data JSON-LD Schema Injection
    let scriptElement = document.querySelector('script[id="amaan-structured-data"]') as HTMLScriptElement;
    if (structuredData) {
      if (!scriptElement) {
        scriptElement = document.createElement('script');
        scriptElement.setAttribute('id', 'amaan-structured-data');
        scriptElement.setAttribute('type', 'application/ld+json');
        document.head.appendChild(scriptElement);
      }
      scriptElement.textContent = JSON.stringify(structuredData);
    } else {
      if (scriptElement) {
        scriptElement.remove();
      }
    }
  }, [title, description, image, url, type, structuredData]);
}
