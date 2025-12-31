import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    CreditCard,
    Settings,
    LogOut,
    Menu,
    X,
    ArrowLeft,
    Crown,
    Ticket,
    BarChart3,
    Mail,
    FileText,
    HelpCircle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getInitials } from '../../lib/utils';

const adminLinks = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Manage Users', href: '/admin/users', icon: Users },
    { name: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
    { name: 'Coupons', href: '/admin/coupons', icon: Ticket },
    { name: 'Support Tickets', href: '/admin/tickets', icon: HelpCircle },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Email Templates', href: '/admin/emails', icon: Mail },
    { name: 'System Logs', href: '/admin/logs', icon: FileText },
    { name: 'Site Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { profile, signOut } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-dark-950">
            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-accent-900/90 backdrop-blur border-b border-accent-800/50">
                <div className="flex items-center justify-between px-4 py-3">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 bg-accent-800/50 rounded-lg"
                    >
                        <Menu className="w-6 h-6 text-white" />
                    </button>
                    <div className="flex items-center gap-2">
                        <Crown className="w-5 h-5 text-accent-400" />
                        <span className="text-lg font-bold text-white">Admin Panel</span>
                    </div>
                    <div className="w-10" />
                </div>
            </header>

            {/* Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/60 z-40"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-50 h-full w-64 bg-gradient-to-b from-accent-900 to-dark-900 border-r border-accent-800/50 transform transition-transform lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-4 border-b border-accent-800/50">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-pink-500 rounded-xl flex items-center justify-center">
                            <Crown className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white">Admin</span>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden p-2 bg-accent-800/50 rounded-lg"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* User Info */}
                <div className="p-4 border-b border-accent-800/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {profile?.full_name ? getInitials(profile.full_name) : '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">{profile?.full_name || 'Admin'}</p>
                            <p className="text-accent-300 text-sm">Administrator</p>
                        </div>
                    </div>
                </div>

                {/* Back to Dashboard */}
                <div className="p-4">
                    <Link
                        to="/dashboard"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-accent-300 hover:bg-accent-800/30 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Dashboard</span>
                    </Link>
                </div>

                {/* Navigation Links */}
                <nav className="px-4 space-y-1">
                    {adminLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = location.pathname === link.href;
                        return (
                            <Link
                                key={link.name}
                                to={link.href}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? 'bg-accent-500/30 text-white border border-accent-500/50'
                                    : 'text-accent-200 hover:bg-accent-800/30 hover:text-white'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{link.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Actions */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-accent-800/50">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-accent-200 hover:bg-red-500/20 hover:text-red-400 transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
                {/* Top Bar */}
                <header className="hidden lg:flex items-center justify-between px-8 py-4 border-b border-dark-800 bg-accent-900/20 backdrop-blur">
                    <div className="flex items-center gap-4">
                        <Crown className="w-6 h-6 text-accent-400" />
                        <h1 className="text-xl font-semibold text-white">
                            {adminLinks.find((link) => link.href === location.pathname)?.name || 'Admin Panel'}
                        </h1>
                    </div>
                    <Link
                        to="/dashboard"
                        className="flex items-center gap-2 px-4 py-2 glass-button rounded-xl text-dark-300 hover:text-white"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>
                </header>

                {/* Page Content */}
                <div className="p-4 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
