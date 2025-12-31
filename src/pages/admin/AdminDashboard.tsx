import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Users,
    CreditCard,
    TrendingUp,
    Mail,
    Search,
    Calendar,
    ArrowRight,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Stats {
    totalUsers: number;
    activeUsers: number;
    totalLeads: number;
    totalEmails: number;
    newUsersToday: number;
    revenueThisMonth: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats>({
        totalUsers: 0,
        activeUsers: 0,
        totalLeads: 0,
        totalEmails: 0,
        newUsersToday: 0,
        revenueThisMonth: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStats() {
            // Get user count
            const { count: userCount } = await supabase
                .from('user_profiles')
                .select('*', { count: 'exact', head: true });

            // Get active users (logged in within 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const { count: activeCount } = await supabase
                .from('user_profiles')
                .select('*', { count: 'exact', head: true })
                .gte('last_login_at', thirtyDaysAgo.toISOString());

            // Get lead count
            const { count: leadCount } = await supabase
                .from('leads')
                .select('*', { count: 'exact', head: true });

            // Get email count
            const { count: emailCount } = await supabase
                .from('email_logs')
                .select('*', { count: 'exact', head: true });

            // New users today
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const { count: newToday } = await supabase
                .from('user_profiles')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', today.toISOString());

            setStats({
                totalUsers: userCount || 0,
                activeUsers: activeCount || 0,
                totalLeads: leadCount || 0,
                totalEmails: emailCount || 0,
                newUsersToday: newToday || 0,
                revenueThisMonth: 0, // Would need payment integration
            });
            setLoading(false);
        }

        loadStats();
    }, []);

    const statCards = [
        { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'primary' },
        { label: 'Active Users', value: stats.activeUsers, icon: TrendingUp, color: 'green' },
        { label: 'Total Leads', value: stats.totalLeads, icon: Search, color: 'accent' },
        { label: 'Emails Sent', value: stats.totalEmails, icon: Mail, color: 'yellow' },
        { label: 'New Today', value: stats.newUsersToday, icon: Calendar, color: 'blue' },
        { label: 'Revenue (₹)', value: stats.revenueThisMonth.toLocaleString(), icon: CreditCard, color: 'accent' },
    ];

    const colorClasses: Record<string, string> = {
        primary: 'from-primary-500/20 to-primary-600/20 text-primary-400',
        green: 'from-green-500/20 to-green-600/20 text-green-400',
        accent: 'from-accent-500/20 to-accent-600/20 text-accent-400',
        yellow: 'from-yellow-500/20 to-yellow-600/20 text-yellow-400',
        blue: 'from-blue-500/20 to-blue-600/20 text-blue-400',
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Admin Overview</h1>
                <p className="text-dark-400">Platform statistics and management</p>
            </div>

            {/* Stats Grid */}
            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="card p-4">
                            <div className="skeleton h-10 w-10 rounded-lg mb-3" />
                            <div className="skeleton h-8 w-16 mb-1 rounded" />
                            <div className="skeleton h-4 w-20 rounded" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {statCards.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div key={stat.label} className="card p-4">
                                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorClasses[stat.color]} flex items-center justify-center mb-3`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <p className="text-2xl font-bold text-white">{stat.value}</p>
                                <p className="text-dark-400 text-sm">{stat.label}</p>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link to="/admin/users" className="card-hover p-6 group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Users className="w-6 h-6 text-primary-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-white font-semibold">Manage Users</h3>
                            <p className="text-dark-400 text-sm">View and manage user accounts</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-dark-500 group-hover:text-primary-400 transition-colors" />
                    </div>
                </Link>

                <Link to="/admin/subscriptions" className="card-hover p-6 group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-accent-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <CreditCard className="w-6 h-6 text-accent-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-white font-semibold">Subscriptions</h3>
                            <p className="text-dark-400 text-sm">Manage subscription plans</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-dark-500 group-hover:text-accent-400 transition-colors" />
                    </div>
                </Link>

                <Link to="/admin/settings" className="card-hover p-6 group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <TrendingUp className="w-6 h-6 text-green-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-white font-semibold">Site Settings</h3>
                            <p className="text-dark-400 text-sm">Configure platform settings</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-dark-500 group-hover:text-green-400 transition-colors" />
                    </div>
                </Link>
            </div>

            {/* Recent Activity would go here */}
            <div className="card p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
                <p className="text-dark-400 text-center py-8">
                    Activity feed coming soon...
                </p>
            </div>
        </div>
    );
}
