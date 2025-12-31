import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Layouts
import MainLayout from './components/layout/MainLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminLayout from './components/layout/AdminLayout';

// Public Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Pricing from './pages/Pricing';

// Protected Pages
import Dashboard from './pages/Dashboard';
import LeadSearch from './pages/LeadSearch';
import LeadResults from './pages/LeadResults';
import Leads from './pages/Leads';
import EmailCampaigns from './pages/EmailCampaigns';
import EmailTemplates from './pages/EmailTemplates';
import SmtpSettings from './pages/SmtpSettings';
import Settings from './pages/Settings';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import ManageUsers from './pages/admin/ManageUsers';
import ManageSubscriptions from './pages/admin/ManageSubscriptions';
import AdminApiSettings from './pages/admin/AdminApiSettings';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';
import SiteSettings from './pages/admin/SiteSettings';

// Components
import LoadingScreen from './components/ui/LoadingScreen';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <LoadingScreen />;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}

// Admin Route Component
function AdminRoute({ children }: { children: React.ReactNode }) {
    const { user, loading, isAdmin } = useAuth();

    if (loading) {
        return <LoadingScreen />;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}

// Guest Route Component (redirect if logged in)
function GuestRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <LoadingScreen />;
    }

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}

function App() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route element={<MainLayout />}>
                <Route path="/" element={<Landing />} />
                <Route path="/pricing" element={<Pricing />} />
            </Route>

            {/* Auth Routes */}
            <Route
                path="/login"
                element={
                    <GuestRoute>
                        <Login />
                    </GuestRoute>
                }
            />
            <Route
                path="/register"
                element={
                    <GuestRoute>
                        <Register />
                    </GuestRoute>
                }
            />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected Dashboard Routes */}
            <Route
                element={
                    <ProtectedRoute>
                        <DashboardLayout />
                    </ProtectedRoute>
                }
            >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/search" element={<LeadSearch />} />
                <Route path="/search/:searchId" element={<LeadResults />} />
                <Route path="/leads" element={<Leads />} />
                <Route path="/campaigns" element={<EmailCampaigns />} />
                <Route path="/templates" element={<EmailTemplates />} />
                <Route path="/smtp" element={<SmtpSettings />} />
                <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Admin Routes */}
            <Route
                element={
                    <AdminRoute>
                        <AdminLayout />
                    </AdminRoute>
                }
            >
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/analytics" element={<AdminAnalytics />} />
                <Route path="/admin/users" element={<ManageUsers />} />
                <Route path="/admin/subscriptions" element={<ManageSubscriptions />} />
                <Route path="/admin/api" element={<AdminApiSettings />} />
                <Route path="/admin/logs" element={<AdminAuditLogs />} />
                <Route path="/admin/settings" element={<SiteSettings />} />
            </Route>

            {/* 404 Catch All */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;
