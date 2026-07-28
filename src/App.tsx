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

// Helper to handle and retry dynamic imports when they fail (e.g. due to temporary network issues or server restarts)
function lazyWithRetry<T extends React.ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return lazy(async () => {
    const pageHasAlreadyBeenReloaded = window.localStorage.getItem('page-has-been-reloaded-for-chunk');
    try {
      return await componentImport();
    } catch (error) {
      console.warn("Dynamic import failed. Retrying once after 1.5 seconds...", error);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        return await componentImport();
      } catch (retryError) {
        console.error("Dynamic import retry failed. Attempting window reload fallback.", retryError);
        if (!pageHasAlreadyBeenReloaded) {
          window.localStorage.setItem('page-has-been-reloaded-for-chunk', 'true');
          window.location.reload();
          return new Promise(() => {}); // hang forever while reloading
        }
        window.localStorage.removeItem('page-has-been-reloaded-for-chunk');
        throw retryError;
      }
    }
  });
}

// Lazy Loaded Base Pages
const Home = lazyWithRetry(() => import('./pages/Home'));
const Agreements = lazyWithRetry(() => import('./pages/Agreements'));
const AdminAgreements = lazyWithRetry(() => import('./pages/admin/AdminAgreements'));
const PublicVerification = lazyWithRetry(() => import('./pages/verify/PublicVerification'));
const About = lazyWithRetry(() => import('./pages/About'));
const Contact = lazyWithRetry(() => import('./pages/Contact'));
const News = lazyWithRetry(() => import('./pages/News'));
const ArticleDetails = lazyWithRetry(() => import('./pages/ArticleDetails'));
// Verified Deals & Agents
const NetworkPage = lazyWithRetry(() => import('./pages/NetworkPage'));
const DealsPage = lazyWithRetry(() => import('./pages/DealsPage'));
const ProductDetailsPage = lazyWithRetry(() => import('./pages/ProductDetailsPage'));
// const AgentDetails = lazyWithRetry(() => import('./pages/agents/AgentDetails'));
// const AgentRegister = lazyWithRetry(() => import('./pages/agents/AgentRegister'));

const SoftwareToolsPage = lazyWithRetry(() => import('./pages/SoftwareToolsPage'));
const TechGearPage = lazyWithRetry(() => import('./pages/TechGearPage'));

// Experts Module
// const ExpertsPage = lazyWithRetry(() => import('./pages/experts/ExpertsPage'));
// const ExpertDetailsPage = lazyWithRetry(() => import('./pages/experts/ExpertDetailsPage'));
// const DashboardExperts = lazyWithRetry(() => import('./pages/dashboard/DashboardExperts'));

// Product Custom Editors
// const PropertyListingFormPage = lazyWithRetry(() => import('./pages/PropertyListingFormPage'));

const PrivacyPolicy = lazyWithRetry(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazyWithRetry(() => import('./pages/TermsOfService'));
const Disclaimer = lazyWithRetry(() => import('./pages/Disclaimer'));

// Lazy Loaded Auth Pages
const AuthGateway = lazyWithRetry(() => import('./pages/AuthGateway'));
const ForgotPassword = lazyWithRetry(() => import('./pages/ForgotPassword'));

// Lazy Loaded Dashboard
const DashboardLayout = lazyWithRetry(() => import('./pages/dashboard/DashboardLayout'));
const DashboardHome = lazyWithRetry(() => import('./pages/dashboard/DashboardHome'));
const ModerationCenter = lazyWithRetry(() => import('./pages/dashboard/ModerationCenter'));
const DashboardUsers = lazyWithRetry(() => import('./pages/dashboard/DashboardUsers'));
const DashboardSettings = lazyWithRetry(() => import('./pages/dashboard/DashboardSettings'));
const DashboardArticles = lazyWithRetry(() => import('./pages/dashboard/DashboardArticles'));
const CreateArticle = lazyWithRetry(() => import('./pages/dashboard/CreateArticle'));
const EditArticle = lazyWithRetry(() => import('./pages/dashboard/EditArticle'));
const DashboardReviewCms = lazyWithRetry(() => import('./pages/dashboard/DashboardReviewCms'));
const DashboardDeals = lazyWithRetry(() => import('./pages/dashboard/DashboardDeals'));

// Additional Dashboard Sub-Modules
// const DashboardFavorites = lazyWithRetry(() => import('./pages/dashboard/DashboardFavorites'));
const DashboardProfile = lazyWithRetry(() => import('./pages/dashboard/DashboardProfile'));
const DashboardSoftwareTools = lazyWithRetry(() => import('./pages/dashboard/DashboardSoftwareTools'));
const DashboardTechGear = lazyWithRetry(() => import('./pages/dashboard/DashboardTechGear'));
const DashboardSiteManagement = lazyWithRetry(() => import('./pages/dashboard/DashboardSiteManagement'));
const DashboardAnalytics = lazyWithRetry(() => import('./pages/dashboard/DashboardAnalytics'));

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
                <Route path="software/:slug" element={<ProductDetailsPage />} />
                <Route path="tech-gear/:slug" element={<ProductDetailsPage />} />
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
