import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Search,
    Users,
    Mail,
    FileText,
    Settings,
    LogOut,
    Menu,
    X,
    Zap,
    Server,
    ChevronDown,
    Crown,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getInitials } from '../../lib/utils';

const sidebarLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Search Leads', href: '/search', icon: Search },
    { name: 'My Leads', href: '/leads', icon: Users },
    { name: 'Email Campaigns', href: '/campaigns', icon: Mail },
    { name: 'Email Templates', href: '/templates', icon: FileText },
    { name: 'SMTP Settings', href: '/smtp', icon: Server },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export default function DashboardLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const { profile, signOut, isAdmin } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    const tierColors: Record<string, string> = {
        free_trial: 'bg-dark-600 text-dark-200',
        basic: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
        pro: 'bg-accent-500/20 text-accent-400 border border-accent-500/30',
        ultra_pro: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border border-yellow-500/30',
    };

    const tierLabels: Record<string, string> = {
        free_trial: 'Free Trial',
        basic: 'Basic',
        pro: 'Pro',
        ultra_pro: 'Ultra Pro',
    };

    return (
        <div className="min-h-screen bg-dark-950">
            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-dark-700/50">
                <div className="flex items-center justify-between px-4 py-3">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 glass-button rounded-lg"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <Link to="/dashboard" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg font-bold gradient-text">Stachbit</span>
                    </Link>
                    <div className="w-10" /> {/* Spacer */}
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
                className={`fixed top-0 left-0 z-50 h-full w-64 bg-dark-900 border-r border-dark-800 transform transition-transform lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-4 border-b border-dark-800">
                    <Link to="/dashboard" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold gradient-text">Stachbit</span>
                    </Link>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden p-2 glass-button rounded-lg"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* User Info */}
                <div className="p-4 border-b border-dark-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {profile?.full_name ? getInitials(profile.full_name) : '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">{profile?.full_name || 'User'}</p>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${tierColors[profile?.subscription_tier || 'free_trial']}`}>
                                {profile?.subscription_tier === 'ultra_pro' && <Crown className="w-3 h-3" />}
                                {tierLabels[profile?.subscription_tier || 'free_trial']}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="p-4 space-y-1">
                    {sidebarLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = location.pathname === link.href;
                        return (
                            <Link
                                key={link.name}
                                to={link.href}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                        ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                                        : 'text-dark-300 hover:bg-dark-800 hover:text-white'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{link.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Admin Link */}
                {isAdmin && (
                    <div className="px-4 pb-4">
                        <Link
                            to="/admin"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-accent-500/10 text-accent-400 border border-accent-500/20 hover:bg-accent-500/20 transition-all"
                        >
                            <Crown className="w-5 h-5" />
                            <span className="font-medium">Admin Panel</span>
                        </Link>
                    </div>
                )}

                {/* Bottom Actions */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-dark-800">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-dark-300 hover:bg-red-500/10 hover:text-red-400 transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
                {/* Top Bar */}
                <header className="hidden lg:flex items-center justify-between px-8 py-4 border-b border-dark-800 bg-dark-900/50 backdrop-blur">
                    <div>
                        <h1 className="text-xl font-semibold text-white">
                            {sidebarLinks.find((link) => link.href === location.pathname)?.name || 'Dashboard'}
                        </h1>
                    </div>

                    {/* Profile Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-3 px-4 py-2 glass-button rounded-xl"
                        >
                            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                {profile?.full_name ? getInitials(profile.full_name) : '?'}
                            </div>
                            <span className="text-white font-medium">{profile?.full_name || 'User'}</span>
                            <ChevronDown className={`w-4 h-4 text-dark-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isProfileOpen && (
                            <div className="absolute right-0 mt-2 w-48 glass-card p-2 animate-slide-down">
                                <Link
                                    to="/settings"
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-dark-300 hover:bg-dark-700 hover:text-white transition-colors"
                                    onClick={() => setIsProfileOpen(false)}
                                >
                                    <Settings className="w-4 h-4" />
                                    Settings
                                </Link>
                                <button
                                    onClick={handleSignOut}
                                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-dark-300 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-4 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
