import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import RootLayout from './components/layout/RootLayout';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { PropertyModalProvider } from './contexts/PropertyModalContext';
import { HelmetProvider } from 'react-helmet-async';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';
import ErrorBoundary from './components/ErrorBoundary';

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
const Vehicles = lazy(() => import('./pages/Vehicles'));
const PropertyDetails = lazy(() => import('./pages/PropertyDetails'));
const VehicleDetails = lazy(() => import('./pages/VehicleDetails'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const News = lazy(() => import('./pages/News'));
const ArticleDetails = lazy(() => import('./pages/ArticleDetails'));
// Verified Agents Module
const AgentsList = lazy(() => import('./pages/agents/AgentsList'));
const AgentDetails = lazy(() => import('./pages/agents/AgentDetails'));
const AgentApply = lazy(() => import('./pages/agents/AgentApply'));

// Product Custom Editors
const EditProperty = lazy(() => import('./pages/EditProperty'));
const CreateVehicle = lazy(() => import('./pages/CreateVehicle'));
const EditVehicle = lazy(() => import('./pages/EditVehicle'));

const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));

// Lazy Loaded Auth Pages
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));

// Lazy Loaded Dashboard
const DashboardLayout = lazy(() => import('./pages/dashboard/DashboardLayout'));
const DashboardHome = lazy(() => import('./pages/dashboard/DashboardHome'));
const ModerationCenter = lazy(() => import('./pages/dashboard/ModerationCenter'));
const DashboardProperties = lazy(() => import('./pages/dashboard/DashboardProperties'));
const DashboardVehicles = lazy(() => import('./pages/dashboard/DashboardVehicles'));
const DashboardUsers = lazy(() => import('./pages/dashboard/DashboardUsers'));
const DashboardSettings = lazy(() => import('./pages/dashboard/DashboardSettings'));
const DashboardArticles = lazy(() => import('./pages/dashboard/DashboardArticles'));
const CreateArticle = lazy(() => import('./pages/dashboard/CreateArticle'));
const EditArticle = lazy(() => import('./pages/dashboard/EditArticle'));
const CreateProperty = lazy(() => import('./pages/CreateProperty'));
const PropertyListingFormPage = lazy(() => import('./pages/PropertyListingFormPage'));

// Additional Dashboard Sub-Modules
const DashboardFavorites = lazy(() => import('./pages/dashboard/DashboardFavorites'));
const DashboardProfile = lazy(() => import('./pages/dashboard/DashboardProfile'));
const AgenciesBrokersManagement = lazy(() => import('./pages/dashboard/AgenciesBrokersManagement'));

export default function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <AuthProvider>
          <SettingsProvider>
            <PropertyModalProvider>
              <Suspense fallback={<PageFallback />}>
                <Routes>
              <Route path="/" element={<RootLayout />}>
                {/* Public Base & Website Routes */}
                <Route index element={<Home />} />
                
                {/* Properties Module */}
                <Route path="properties" element={<Home />} />
                <Route path="marketplace" element={<Home />} />
                <Route path="properties/:id" element={<PropertyDetails />} />
                <Route path="properties/create" element={<CreateProperty />} />
                <Route path="properties/edit/:id" element={<EditProperty />} />
                <Route path="property-form" element={<PropertyListingFormPage />} />
                <Route path="agreements" element={<Agreements />} />
                <Route path="admin/agreements" element={<AdminAgreements />} />
                <Route path="verify/:id" element={<PublicVerification />} />
                
                {/* Vehicles Module */}
                <Route path="vehicles" element={<Vehicles />} />
                <Route path="vehicles/:id" element={<VehicleDetails />} />
                <Route path="vehicles/create" element={<CreateVehicle />} />
                <Route path="vehicles/edit/:id" element={<EditVehicle />} />

                {/* Agents Module */}
                <Route path="agents" element={<AgentsList />} />
                <Route path="agents/:id" element={<AgentDetails />} />
                <Route path="agents/apply" element={<AgentApply />} />


                {/* Other Services and Pages */}
                <Route path="news" element={<News />} />
                <Route path="news/:id" element={<ArticleDetails />} />
                <Route path="about" element={<About />} />
                <Route path="contact" element={<Contact />} />
                <Route path="privacy" element={<PrivacyPolicy />} />
                
                {/* Auth Routes - Public Only */}
                <Route element={<PublicRoute />}>
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
                  <Route path="auth/login" element={<Login />} />
                  <Route path="auth/register" element={<Register />} />
                  <Route path="auth/forgot-password" element={<ForgotPassword />} />
                </Route>
              </Route>

              {/* Dashboard Routes (Protected) */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashboardLayout />}>
                  <Route index element={<DashboardHome />} />
                  <Route path="moderation" element={<ModerationCenter />} />
                  <Route path="properties" element={<DashboardProperties />} />
                  <Route path="vehicles" element={<DashboardVehicles />} />
                  <Route path="articles" element={<DashboardArticles />} />
                  <Route path="articles/create" element={<CreateArticle />} />
                  <Route path="articles/edit/:id" element={<EditArticle />} />
                  <Route path="agreements" element={<AdminAgreements />} />
                  <Route path="users" element={<DashboardUsers />} />
                  <Route path="agencies-brokers" element={<AgenciesBrokersManagement />} />
                  <Route path="favorites" element={<DashboardFavorites />} />
                  <Route path="profile" element={<DashboardProfile />} />
                  <Route path="settings" element={<DashboardSettings />} />
                </Route>
              </Route>
            </Routes>
          </Suspense>
        </PropertyModalProvider>
      </SettingsProvider>
    </AuthProvider>
    </ErrorBoundary>
  </HelmetProvider>
  );
}
