import React, { Suspense, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/layout/Layout';
import ScrollToTop from './components/layout/ScrollToTop';
import { supabase } from './lib/supabase';

const Home = React.lazy(() => import('./pages/Home'));
const BuyPage = React.lazy(() => import('./pages/BuyPage'));
const RentPage = React.lazy(() => import('./pages/RentPage'));
const PropertyDetailsPage = React.lazy(() => import('./pages/PropertyDetailsPage'));
const CategoryPage = React.lazy(() => import('./pages/CategoryPage'));
const SearchPage = React.lazy(() => import('./pages/SearchPage'));
const ArticleDetailsPage = React.lazy(() => import('./pages/ArticleDetailsPage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const ContactPage = React.lazy(() => import('./pages/ContactPage'));
const EditorialPolicyPage = React.lazy(() => import('./pages/EditorialPolicyPage'));
const PrivacyPolicyPage = React.lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsPage = React.lazy(() => import('./pages/TermsPage'));
const CookiePolicyPage = React.lazy(() => import('./pages/CookiePolicyPage'));
const AdvertisingDisclosurePage = React.lazy(() => import('./pages/AdvertisingDisclosurePage'));
const CorrectionsPolicyPage = React.lazy(() => import('./pages/CorrectionsPolicyPage'));
const NewsletterPage = React.lazy(() => import('./pages/NewsletterPage'));
const AuthPage = React.lazy(() => import('./pages/AuthPage'));
const AccountPage = React.lazy(() => import('./pages/AccountPage'));
const AdminDashboardPage = React.lazy(() => import('./pages/admin/AdminDashboardPage'));

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
    const subscription = supabase?.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        navigate('/account', { replace: true });
      }
    });
    return () => {
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
          <Route path="/investment" element={<Layout><CategoryPage forcedSlug="investment" /></Layout>} />
          <Route path="/architecture" element={<Layout><CategoryPage forcedSlug="architecture" /></Layout>} />
          <Route path="/construction" element={<Layout><CategoryPage forcedSlug="construction" /></Layout>} />
          <Route path="/home-living" element={<Layout><CategoryPage forcedSlug="home-living" /></Layout>} />
          <Route path="/news" element={<Layout><CategoryPage forcedSlug="news" /></Layout>} />
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
          <Route path="*" element={<Layout><Home /></Layout>} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
