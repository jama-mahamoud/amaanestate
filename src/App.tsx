import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/layout/Layout';
import ScrollToTop from './components/layout/ScrollToTop';

const Home = React.lazy(() => import('./pages/Home'));
const CategoryPage = React.lazy(() => import('./pages/CategoryPage'));
const SearchPage = React.lazy(() => import('./pages/SearchPage'));
const ArticleDetailsPage = React.lazy(() => import('./pages/ArticleDetailsPage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const ContactPage = React.lazy(() => import('./pages/ContactPage'));
const EditorialPolicyPage = React.lazy(() => import('./pages/EditorialPolicyPage'));
const PrivacyPolicyPage = React.lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsPage = React.lazy(() => import('./pages/TermsPage'));
const NewsletterPage = React.lazy(() => import('./pages/NewsletterPage'));
const AdminLoginPage = React.lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminDashboardPage = React.lazy(() => import('./pages/admin/AdminDashboardPage'));

function PageFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-[#FAF8F5] text-sm text-[#5C5A55]">
      Loading AMAAN ESTATE...
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ScrollToTop />
      <Toaster position="bottom-right" richColors />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* Standalone Admin Workspace */}
          <Route path="/admin/login" element={<Layout><AdminLoginPage /></Layout>} />
          <Route path="/admin" element={<AdminDashboardPage />} />

          {/* Public Editorial Publication Routes */}
          <Route path="/" element={<Layout><Home /></Layout>} />
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
          <Route path="/privacy-policy" element={<Layout><PrivacyPolicyPage /></Layout>} />
          <Route path="/terms" element={<Layout><TermsPage /></Layout>} />
          <Route path="/newsletter" element={<Layout><NewsletterPage /></Layout>} />
          <Route path="*" element={<Layout><Home /></Layout>} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
