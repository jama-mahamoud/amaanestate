import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import RootLayout from './components/layout/RootLayout';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { HelmetProvider } from 'react-helmet-async';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/layout/ScrollToTop';

// Luxury Brand Fallback for Code-Splitting Suspense Loaders
function PageFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-luxury-black text-white/40">
      <div className="relative w-12 h-12 mb-6">
        <div className="absolute inset-0 rounded-full border-2 border-luxury-gold/5 animate-pulse" />
        <div className="absolute inset-0 rounded-full border-2 border-t-luxury-gold border-r-transparent border-b-transparent border-l-transparent animate-spin duration-1000" />
      </div>
      <p className="text-[10px] font-bold tracking-[0.4em] uppercase animate-pulse text-luxury-gold font-display">AmaanEstate</p>
    </div>
  );
}

// Lazy Loaded Base Pages
const Home = lazy(() => import('./pages/Home'));
const Agreements = lazy(() => import('./pages/Agreements'));
const AdminAgreements = lazy(() => import('./pages/admin/AdminAgreements'));
const PublicVerification = lazy(() => import('./pages/verify/PublicVerification'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const News = lazy(() => import('./pages/News'));
const ArticleDetails = lazy(() => import('./pages/ArticleDetails'));
// Verified Deals & Agents
const NetworkPage = lazy(() => import('./pages/NetworkPage'));
const DealsPage = lazy(() => import('./pages/DealsPage'));
const ProductDetailsPage = lazy(() => import('./pages/ProductDetailsPage'));
// const AgentDetails = lazy(() => import('./pages/agents/AgentDetails'));
// const AgentRegister = lazy(() => import('./pages/agents/AgentRegister'));

const SoftwareToolsPage = lazy(() => import('./pages/SoftwareToolsPage'));
const TechGearPage = lazy(() => import('./pages/TechGearPage'));

// Experts Module
// const ExpertsPage = lazy(() => import('./pages/experts/ExpertsPage'));
// const ExpertDetailsPage = lazy(() => import('./pages/experts/ExpertDetailsPage'));
// const DashboardExperts = lazy(() => import('./pages/dashboard/DashboardExperts'));

// Product Custom Editors
// const PropertyListingFormPage = lazy(() => import('./pages/PropertyListingFormPage'));

const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const Disclaimer = lazy(() => import('./pages/Disclaimer'));

// Lazy Loaded Auth Pages
const AuthGateway = lazy(() => import('./pages/AuthGateway'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));

// Lazy Loaded Dashboard
const DashboardLayout = lazy(() => import('./pages/dashboard/DashboardLayout'));
const DashboardHome = lazy(() => import('./pages/dashboard/DashboardHome'));
const ModerationCenter = lazy(() => import('./pages/dashboard/ModerationCenter'));
const DashboardUsers = lazy(() => import('./pages/dashboard/DashboardUsers'));
const DashboardSettings = lazy(() => import('./pages/dashboard/DashboardSettings'));
const DashboardArticles = lazy(() => import('./pages/dashboard/DashboardArticles'));
const CreateArticle = lazy(() => import('./pages/dashboard/CreateArticle'));
const EditArticle = lazy(() => import('./pages/dashboard/EditArticle'));
const DashboardReviewCms = lazy(() => import('./pages/dashboard/DashboardReviewCms'));
const DashboardDeals = lazy(() => import('./pages/dashboard/DashboardDeals'));

// Additional Dashboard Sub-Modules
// const DashboardFavorites = lazy(() => import('./pages/dashboard/DashboardFavorites'));
const DashboardProfile = lazy(() => import('./pages/dashboard/DashboardProfile'));
const DashboardSoftwareTools = lazy(() => import('./pages/dashboard/DashboardSoftwareTools'));
const DashboardTechGear = lazy(() => import('./pages/dashboard/DashboardTechGear'));
const DashboardSiteManagement = lazy(() => import('./pages/dashboard/DashboardSiteManagement'));
const DashboardAnalytics = lazy(() => import('./pages/dashboard/DashboardAnalytics'));

export default function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <AuthProvider>
          <SettingsProvider>
              <Suspense fallback={<PageFallback />}>
                <ScrollToTop />
                <Routes>
              <Route path="/" element={<RootLayout />}>
                {/* Public Base & Website Routes */}
                <Route index element={<Home />} />
                
                {/* Properties Module */}
                <Route path="properties" element={<SoftwareToolsPage />} />
                <Route path="software-tools" element={<SoftwareToolsPage />} />
                <Route path="software" element={<SoftwareToolsPage />} />
                <Route path="marketplace" element={<SoftwareToolsPage />} />
                <Route path="agreements" element={<Agreements />} />
                <Route path="verify/:id" element={<PublicVerification />} />

                {/* Reviews & Monetization Hub */}
                <Route path="reviews" element={<DealsPage />} />
                <Route path="reviews/:slug" element={<ProductDetailsPage />} />
                <Route path="deals" element={<DealsPage />} />
                <Route path="deals-and-offers" element={<DealsPage />} />
                <Route path="product/:id" element={<ProductDetailsPage />} />
                <Route path="agents" element={<NetworkPage />} />
                <Route path="agents/:id" element={<NetworkPage />} />
                <Route path="ecosystem" element={<NetworkPage />} />
                <Route path="network" element={<NetworkPage />} />
                <Route path="ecosystem/:slug" element={<NetworkPage />} />
                <Route path="network/:slug" element={<NetworkPage />} />
                <Route path="tech-gear" element={<TechGearPage />} />

                {/* Other Services and Pages */}
                <Route path="news" element={<News />} />
                <Route path="news/english" element={<News />} />
                <Route path="news/:id" element={<ArticleDetails />} />
                <Route path="news/:type/:id" element={<ArticleDetails />} />
                
                {/* Language nested news routes */}
                <Route path=":lang/news" element={<News />} />
                <Route path=":lang/news/:id" element={<ArticleDetails />} />
                <Route path=":lang/news/:type/:id" element={<ArticleDetails />} />
                <Route path="about" element={<About />} />
                <Route path="contact" element={<Contact />} />
                <Route path="privacy" element={<PrivacyPolicy />} />
                <Route path="terms" element={<TermsOfService />} />
                <Route path="disclaimer" element={<Disclaimer />} />
                
                {/* Auth Routes - Public Only */}
                <Route element={<PublicRoute />}>
                  <Route path="login" element={<AuthGateway />} />
                  <Route path="register" element={<AuthGateway />} />
                  <Route path="auth/login" element={<AuthGateway />} />
                  <Route path="auth/register" element={<AuthGateway />} />
                  <Route path="auth/forgot-password" element={<ForgotPassword />} />
                </Route>
              </Route>

              {/* Dashboard Routes (Protected) */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashboardLayout />}>
                  <Route index element={<DashboardHome />} />
                  <Route path="articles" element={<DashboardArticles />} />
                  <Route path="articles/create" element={<CreateArticle />} />
                  <Route path="articles/edit/:id" element={<EditArticle />} />
                  <Route path="review-cms" element={<DashboardReviewCms />} />
                  <Route path="deals" element={<DashboardDeals />} />
                  <Route path="agreements" element={<AdminAgreements />} />
                  <Route path="users" element={<DashboardUsers />} />
                  {/* <Route path="favorites" element={<DashboardFavorites />} /> */}
                  <Route path="profile" element={<DashboardProfile />} />
                  <Route path="settings" element={<DashboardSettings />} />
                  <Route path="software" element={<DashboardSoftwareTools />} />
                  <Route path="tech-gear" element={<DashboardTechGear />} />
                  <Route path="site-management" element={<DashboardSiteManagement />} />
                  <Route path="analytics" element={<DashboardAnalytics />} />
                </Route>
              </Route>
            </Routes>
          </Suspense>
        </SettingsProvider>
      </AuthProvider>
    </ErrorBoundary>
  </HelmetProvider>
  );
}
