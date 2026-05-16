import { Routes, Route } from 'react-router-dom';
import RootLayout from './components/layout/RootLayout';

// Base Pages
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

export default function App() {
  return (
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
        
        {/* Auth Routes */}
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>

      {/* Dashboard Routes (Protected) */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardHome />} />
        <Route path="properties" element={<DashboardProperties />} />
        <Route path="vehicles" element={<DashboardVehicles />} />
        <Route path="articles" element={<DashboardArticles />} />
        <Route path="users" element={<DashboardUsers />} />
        <Route path="settings" element={<DashboardSettings />} />
      </Route>
    </Routes>
  );
}
