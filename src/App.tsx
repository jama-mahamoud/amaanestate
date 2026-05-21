import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import RootLayout from './components/layout/RootLayout';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { HelmetProvider } from 'react-helmet-async';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';

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
const Properties = lazy(() => import('./pages/Properties'));
const Vehicles = lazy(() => import('./pages/Vehicles'));
const PropertyDetails = lazy(() => import('./pages/PropertyDetails'));
const VehicleDetails = lazy(() => import('./pages/VehicleDetails'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const News = lazy(() => import('./pages/News'));
const ArticleDetails = lazy(() => import('./pages/ArticleDetails'));
const AgentRegistration = lazy(() => import('./pages/AgentRegistration'));
const ProfessionalServices = lazy(() => import('./pages/ProfessionalServices'));
const ProfessionalDetails = lazy(() => import('./pages/ProfessionalDetails'));
const ProfessionalRegistration = lazy(() => import('./pages/ProfessionalRegistration'));
const BrokerRegistry = lazy(() => import('./pages/brokers/BrokerRegistry'));
const BrokerApplication = lazy(() => import('./pages/brokers/BrokerApplication'));
const AgencyRegistration = lazy(() => import('./pages/brokers/AgencyRegistration'));
const BrokerDetails = lazy(() => import('./pages/brokers/BrokerDetails'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));

// Lazy Loaded Auth Pages
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));

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

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <SettingsProvider>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<RootLayout />}>
                {/* Public Routes */}
                <Route index element={<Home />} />
                <Route path="properties" element={<Properties />} />
                <Route path="properties/:id" element={<PropertyDetails />} />
                <Route path="properties/create" element={<CreateProperty />} />
                <Route path="vehicles" element={<Vehicles />} />
                <Route path="vehicles/:id" element={<VehicleDetails />} />
                <Route path="news" element={<News />} />
                <Route path="news/:id" element={<ArticleDetails />} />
                <Route path="about" element={<About />} />
                <Route path="contact" element={<Contact />} />
                <Route path="become-agent" element={<AgentRegistration />} />
                <Route path="services" element={<ProfessionalServices />} />
                <Route path="professionals/:id" element={<ProfessionalDetails />} />
                <Route path="become-pro" element={<ProfessionalRegistration />} />
                <Route path="brokers" element={<BrokerRegistry />} />
                <Route path="brokers/:id" element={<BrokerDetails />} />
                <Route path="brokers/apply" element={<BrokerApplication />} />
                <Route path="agency-register" element={<AgencyRegistration />} />
                <Route path="privacy" element={<PrivacyPolicy />} />
                
                {/* Auth Routes - Public Only */}
                <Route element={<PublicRoute />}>
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
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
                  <Route path="users" element={<DashboardUsers />} />
                  <Route path="settings" element={<DashboardSettings />} />
                </Route>
              </Route>
            </Routes>
          </Suspense>
        </SettingsProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}
