import { Routes, Route } from 'react-router-dom';
import RootLayout from './components/layout/RootLayout';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';

// Base Pages
// ... imports stay same ...
import Home from './pages/Home';
import Properties from './pages/Properties';
import Vehicles from './pages/Vehicles';
import PropertyDetails from './pages/PropertyDetails';
import VehicleDetails from './pages/VehicleDetails';
import About from './pages/About';
import Contact from './pages/Contact';
import News from './pages/News';
import ArticleDetails from './pages/ArticleDetails';
import AgentRegistration from './pages/AgentRegistration';
import ProfessionalServices from './pages/ProfessionalServices';
import ProfessionalDetails from './pages/ProfessionalDetails';
import ProfessionalRegistration from './pages/ProfessionalRegistration';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Dashboard
import DashboardLayout from './pages/dashboard/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import DashboardProperties from './pages/dashboard/DashboardProperties';
import DashboardVehicles from './pages/dashboard/DashboardVehicles';
import DashboardUsers from './pages/dashboard/DashboardUsers';
import DashboardSettings from './pages/dashboard/DashboardSettings';
import DashboardArticles from './pages/dashboard/DashboardArticles';
import CreateArticle from './pages/dashboard/CreateArticle';
import EditArticle from './pages/dashboard/EditArticle';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          {/* Public Routes */}
          <Route index element={<Home />} />
          <Route path="properties" element={<Properties />} />
          <Route path="properties/:id" element={<PropertyDetails />} />
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
    </AuthProvider>
  );
}
