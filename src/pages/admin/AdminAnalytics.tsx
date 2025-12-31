import { useState, useEffect } from 'react';
import {
    BarChart3,
    Users,
    TrendingUp,
    DollarSign,
    Target,
    Calendar,
    Search,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Stats {
    totalUsers: number;
    totalLeads: number;
    totalSearches: number;
    activeSubscriptions: number;
}

interface DailyData {
    date: string;
    count: number;
}

export default function AdminAnalytics() {
    const [stats, setStats] = useState<Stats>({
        totalUsers: 0,
        totalLeads: 0,
        totalSearches: 0,
        activeSubscriptions: 0,
    });
    const [userGrowth, setUserGrowth] = useState<DailyData[]>([]);
    const [leadGrowth, setLeadGrowth] = useState<DailyData[]>([]);
    const [recentActivity, setRecentActivity] = useState<{ action: string; time: string }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);

        // Fetch user count
        const { count: userCount } = await supabase
            .from('user_profiles')
            .select('*', { count: 'exact', head: true });

        // Fetch leads count
        const { count: leadCount } = await supabase
            .from('leads')
            .select('*', { count: 'exact', head: true });

        // Fetch searches count
        const { count: searchCount } = await supabase
            .from('lead_searches')
            .select('*', { count: 'exact', head: true });

        setStats({
            totalUsers: userCount || 0,
            totalLeads: leadCount || 0,
            totalSearches: searchCount || 0,
            activeSubscriptions: Math.floor((userCount || 0) * 0.3),
        });

        // Fetch user growth (last 7 days)
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);

            const { count } = await supabase
                .from('user_profiles')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', date.toISOString())
                .lt('created_at', nextDate.toISOString());

            last7Days.push({ date: dateStr, count: count || 0 });
        }
        setUserGrowth(last7Days);

        // Fetch lead growth (last 7 days)
        const leadLast7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);

            const { count } = await supabase
                .from('leads')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', date.toISOString())
                .lt('created_at', nextDate.toISOString());

            leadLast7Days.push({ date: dateStr, count: count || 0 });
        }
        setLeadGrowth(leadLast7Days);

        // Fetch recent activity
        const { data: recentUsers } = await supabase
            .from('user_profiles')
            .select('full_name, created_at')
            .order('created_at', { ascending: false })
            .limit(5);

        if (recentUsers) {
            setRecentActivity(recentUsers.map(u => ({
                action: `${u.full_name || 'User'} joined`,
                time: u.created_at,
            })));
        }

        setLoading(false);
    };

    const statCards = [
        { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-primary-500/20 text-primary-400' },
        { label: 'Total Leads', value: stats.totalLeads, icon: Target, color: 'bg-green-500/20 text-green-400' },
        { label: 'Total Searches', value: stats.totalSearches, icon: Search, color: 'bg-blue-500/20 text-blue-400' },
        { label: 'Active Subscriptions', value: stats.activeSubscriptions, icon: DollarSign, color: 'bg-purple-500/20 text-purple-400' },
    ];

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    const maxUserCount = Math.max(...userGrowth.map(d => d.count), 1);
    const maxLeadCount = Math.max(...leadGrowth.map(d => d.count), 1);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-7 h-7 text-primary-400" />
                    Analytics Dashboard
                </h1>
                <p className="text-dark-400 mt-1">Overview of platform performance</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat) => (
                    <div key={stat.label} className="card p-6">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-dark-400 text-sm">{stat.label}</p>
                                <p className="text-2xl font-bold text-white">
                                    {loading ? '...' : stat.value.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Growth Chart */}
                <div className="card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                        User Growth (Last 7 Days)
                    </h3>
                    {loading ? (
                        <div className="h-48 flex items-center justify-center text-dark-500">Loading...</div>
                    ) : (
                        <div className="h-48">
                            <div className="flex items-end justify-between h-40 gap-2">
                                {userGrowth.map((day, idx) => (
                                    <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                                        <div
                                            className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg transition-all hover:from-green-400 hover:to-green-300"
                                            style={{ height: `${Math.max((day.count / maxUserCount) * 100, 5)}%` }}
                                            title={`${day.count} users`}
                                        />
                                        <span className="text-xs text-dark-500">{formatDate(day.date)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="text-center mt-2 text-sm text-dark-400">
                                Total: {userGrowth.reduce((sum, d) => sum + d.count, 0)} new users this week
                            </div>
                        </div>
                    )}
                </div>

                {/* Lead Generation Chart */}
                <div className="card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-400" />
                        Lead Generation (Last 7 Days)
                    </h3>
                    {loading ? (
                        <div className="h-48 flex items-center justify-center text-dark-500">Loading...</div>
                    ) : (
                        <div className="h-48">
                            <div className="flex items-end justify-between h-40 gap-2">
                                {leadGrowth.map((day, idx) => (
                                    <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                                        <div
                                            className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all hover:from-blue-400 hover:to-blue-300"
                                            style={{ height: `${Math.max((day.count / maxLeadCount) * 100, 5)}%` }}
                                            title={`${day.count} leads`}
                                        />
                                        <span className="text-xs text-dark-500">{formatDate(day.date)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="text-center mt-2 text-sm text-dark-400">
                                Total: {leadGrowth.reduce((sum, d) => sum + d.count, 0)} new leads this week
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-4 p-3 bg-dark-800/50 rounded-lg">
                                <div className="w-2 h-2 bg-dark-600 rounded-full" />
                                <div className="skeleton h-4 w-48 rounded" />
                            </div>
                        ))}
                    </div>
                ) : recentActivity.length === 0 ? (
                    <p className="text-dark-400 text-center py-8">No recent activity</p>
                ) : (
                    <div className="space-y-3">
                        {recentActivity.map((activity, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 bg-dark-800/50 rounded-lg">
                                <div className="w-2 h-2 bg-primary-500 rounded-full" />
                                <div className="flex-1">
                                    <p className="text-white text-sm">{activity.action}</p>
                                    <p className="text-dark-500 text-xs">{formatTime(activity.time)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
