import React, { Suspense, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/layout/Layout';
import ScrollToTop from './components/layout/ScrollToTop';
import { supabase } from './lib/supabase';
import { getCurrentUserProfile } from './services/adminService';
import {
  installInternalTrafficGlobalHelper,
  syncInternalTrafficWithProfile,
} from './lib/internalTraffic';

function lazyRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return React.lazy(() =>
    factory().catch((error) => {
      const key = 'chunk_retry_' + window.location.pathname;
      const retried = sessionStorage.getItem(key);
      if (!retried) {
        sessionStorage.setItem(key, 'true');
        window.location.reload();
        return new Promise(() => {});
      }
      throw error;
    })
  );
}

const Home = lazyRetry(() => import('./pages/Home'));
const BuyPage = lazyRetry(() => import('./pages/BuyPage'));
const RentPage = lazyRetry(() => import('./pages/RentPage'));
const PropertyDetailsPage = lazyRetry(() => import('./pages/PropertyDetailsPage'));
const GlobalMarketsIndexPage = lazyRetry(() => import('./pages/GlobalMarketsIndexPage'));
const GlobalMarketPage = lazyRetry(() => import('./pages/GlobalMarketPage'));
const GlobalMarketComparisonPage = lazyRetry(() => import('./pages/GlobalMarketComparisonPage'));
const CategoryPage = lazyRetry(() => import('./pages/CategoryPage'));
const SearchPage = lazyRetry(() => import('./pages/SearchPage'));
const ArticleDetailsPage = lazyRetry(() => import('./pages/ArticleDetailsPage'));
const AboutPage = lazyRetry(() => import('./pages/AboutPage'));
const ContactPage = lazyRetry(() => import('./pages/ContactPage'));
const EditorialPolicyPage = lazyRetry(() => import('./pages/EditorialPolicyPage'));
const PrivacyPolicyPage = lazyRetry(() => import('./pages/PrivacyPolicyPage'));
const TermsPage = lazyRetry(() => import('./pages/TermsPage'));
const CookiePolicyPage = lazyRetry(() => import('./pages/CookiePolicyPage'));
const AdvertisingDisclosurePage = lazyRetry(() => import('./pages/AdvertisingDisclosurePage'));
const CorrectionsPolicyPage = lazyRetry(() => import('./pages/CorrectionsPolicyPage'));
const NewsletterPage = lazyRetry(() => import('./pages/NewsletterPage'));
const AuthPage = lazyRetry(() => import('./pages/AuthPage'));
const AccountPage = lazyRetry(() => import('./pages/AccountPage'));
const AdminDashboardPage = lazyRetry(() => import('./pages/admin/AdminDashboardPage'));
const LegacyNewsRoute = lazyRetry(() => import('./pages/LegacyNewsRoute'));
const NotFoundPage = lazyRetry(() => import('./pages/NotFoundPage'));

function PageFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-[#FAF8F5] text-sm text-[#5C5A55]">
      Loading AMAAN ESTATE...
    </div>
  );
}

export default function App() {
  const navigate = useNavigate();

  useEffect(() => {
    installInternalTrafficGlobalHelper();
    let active = true;

    getCurrentUserProfile()
      .then((profile) => {
        if (active) {
          syncInternalTrafficWithProfile(profile);
        }
      })
      .catch(() => {});

    const subscription = supabase?.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        navigate('/account', { replace: true });
      }
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        getCurrentUserProfile()
          .then((profile) => {
            if (active) {
              syncInternalTrafficWithProfile(profile);
            }
          })
          .catch(() => {});
      }
    });
    return () => {
      active = false;
      subscription?.data.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <ErrorBoundary>
      <ScrollToTop />
      <Toaster position="bottom-right" richColors />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* Unified Authentication & Account Routes */}
          <Route path="/login" element={<Layout><AuthPage initialMode="signin" /></Layout>} />
          <Route path="/register" element={<Layout><AuthPage initialMode="register" /></Layout>} />
          <Route path="/account" element={<Layout><AccountPage /></Layout>} />

          {/* Standalone Admin Workspace */}
          <Route path="/admin/login" element={<Layout><AuthPage initialMode="signin" /></Layout>} />
          <Route path="/admin" element={<AdminDashboardPage />} />

          {/* Public Marketplace & Editorial Routes */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/buy" element={<Layout><BuyPage /></Layout>} />
          <Route path="/rent" element={<Layout><RentPage /></Layout>} />
          <Route path="/properties/:slug" element={<Layout><PropertyDetailsPage /></Layout>} />
          <Route path="/global-markets" element={<Layout><GlobalMarketsIndexPage /></Layout>} />
          <Route path="/global-markets/comparisons/:comparisonSlug" element={<Layout><GlobalMarketComparisonPage /></Layout>} />
          <Route path="/global-markets/:countrySlug" element={<Layout><GlobalMarketPage /></Layout>} />
          <Route path="/global-markets/:countrySlug/:reportSlug" element={<Layout><GlobalMarketPage /></Layout>} />
          <Route path="/investment" element={<Layout><CategoryPage forcedSlug="investment" /></Layout>} />
          <Route path="/architecture" element={<Layout><CategoryPage forcedSlug="architecture" /></Layout>} />
          <Route path="/construction" element={<Layout><CategoryPage forcedSlug="construction" /></Layout>} />
          <Route path="/home-living" element={<Layout><CategoryPage forcedSlug="home-living" /></Layout>} />
          <Route path="/news" element={<Layout><CategoryPage forcedSlug="news" /></Layout>} />
          <Route path="/news/:slug" element={<Layout><LegacyNewsRoute /></Layout>} />
          <Route path="/category/:slug" element={<Layout><CategoryPage /></Layout>} />
          <Route path="/search" element={<Layout><SearchPage /></Layout>} />
          <Route path="/articles/:slug" element={<Layout><ArticleDetailsPage /></Layout>} />
          <Route path="/about" element={<Layout><AboutPage /></Layout>} />
          <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
          <Route path="/editorial-policy" element={<Layout><EditorialPolicyPage /></Layout>} />
          <Route path="/corrections-policy" element={<Layout><CorrectionsPolicyPage /></Layout>} />
          <Route path="/privacy-policy" element={<Layout><PrivacyPolicyPage /></Layout>} />
          <Route path="/cookie-policy" element={<Layout><CookiePolicyPage /></Layout>} />
          <Route path="/advertising-disclosure" element={<Layout><AdvertisingDisclosurePage /></Layout>} />
          <Route path="/terms" element={<Layout><TermsPage /></Layout>} />
          <Route path="/newsletter" element={<Layout><NewsletterPage /></Layout>} />
          <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
