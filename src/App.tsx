import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/layout/Layout';

// Dynamic Page lazy loading
const Home = React.lazy(() => import('./pages/Home'));
const PropertiesPage = React.lazy(() => import('./pages/properties/PropertiesPage'));
const PropertyDetailsPage = React.lazy(() => import('./pages/properties/PropertyDetailsPage'));
const AgentsPage = React.lazy(() => import('./pages/AgentsPage'));
const LocationsPage = React.lazy(() => import('./pages/LocationsPage'));
const ArticlesPage = React.lazy(() => import('./pages/ArticlesPage'));
const ArticleDetailsPage = React.lazy(() => import('./pages/ArticleDetailsPage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const ContactPage = React.lazy(() => import('./pages/ContactPage'));

function PageFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#050508] text-white">
      <div className="w-10 h-10 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin mb-4" />
      <p className="text-xs uppercase tracking-widest text-neutral-500 font-mono animate-pulse">AmaanEstate Loading...</p>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageFallback />}>
        <Layout>
          <Routes>
            <Route index element={<Home />} />
            <Route path="/properties" element={<PropertiesPage />} />
            <Route path="/properties/:id" element={<PropertyDetailsPage />} />
            
            {/* Core listing shortcuts mapped to PropertiesPage with custom path contexts */}
            <Route path="/buy" element={<PropertiesPage />} />
            <Route path="/rent" element={<PropertiesPage />} />
            <Route path="/land" element={<PropertiesPage />} />
            <Route path="/commercial" element={<PropertiesPage />} />
            
            {/* Auxiliary platforms info routes */}
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/locations" element={<LocationsPage />} />
            
            {/* Articles index and details mapping */}
            <Route path="/articles" element={<ArticlesPage />} />
            <Route path="/articles/:slug" element={<ArticleDetailsPage />} />
            
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            
            {/* Wildcard Fallback */}
            <Route path="*" element={<Home />} />
          </Routes>
        </Layout>
      </Suspense>
    </ErrorBoundary>
  );
}
