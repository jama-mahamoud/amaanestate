import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPublishedArticleBySlug } from '../services/editorialService';
import {
  normalizeArticleSlugInput,
  resolveLegacyArticleRedirectSlug,
} from '../lib/legacyRedirects';
import NotFoundPage from './NotFoundPage';

export default function LegacyNewsRoute() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;

    async function resolveLegacyNewsUrl() {
      const cleanSlug = normalizeArticleSlugInput(slug);
      if (!cleanSlug) {
        if (active) setChecking(false);
        return;
      }

      const mappedTarget = resolveLegacyArticleRedirectSlug(cleanSlug);
      if (mappedTarget) {
        const targetArticle = await getPublishedArticleBySlug(mappedTarget);
        if (!active) return;
        if (targetArticle) {
          navigate(`/articles/${encodeURIComponent(targetArticle.slug)}`, { replace: true });
          return;
        }
      }

      const directArticle = await getPublishedArticleBySlug(cleanSlug);
      if (!active) return;
      if (directArticle) {
        navigate(`/articles/${encodeURIComponent(directArticle.slug)}`, { replace: true });
        return;
      }

      setChecking(false);
    }

    setChecking(true);
    resolveLegacyNewsUrl();

    return () => {
      active = false;
    };
  }, [slug, navigate]);

  if (checking) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-sm text-[#5C5A55]">
        Checking article archive...
      </div>
    );
  }

  return (
    <NotFoundPage
      title="Article Not Found (404) | AmaanEstate"
      heading="Article Not Available"
      message="This legacy news article is no longer published or has been removed from the AmaanEstate archive."
    />
  );
}
