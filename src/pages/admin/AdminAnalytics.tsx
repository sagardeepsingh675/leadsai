import { useState, useEffect } from 'react';
import {
    BarChart3,
    Users,
    Search,
    TrendingUp,
    Globe,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AnalyticsData {
    totalUsers: number;
    newUsersToday: number;
    totalSearches: number;
    searchesToday: number;
    totalLeads: number;
    savedLeadsToday: number;
    activeSubscriptions: number;
}

export default function AdminAnalytics() {
    const [data, setData] = useState<AnalyticsData>({
        totalUsers: 0,
        newUsersToday: 0,
        totalSearches: 0,
        searchesToday: 0,
        totalLeads: 0,
        savedLeadsToday: 0,
        activeSubscriptions: 0,
    });
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('7d');

    useEffect(() => {
        fetchAnalytics();
    }, [dateRange]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];

            // Fetch total users
            const { count: totalUsers } = await supabase
                .from('user_profiles')
                .select('*', { count: 'exact', head: true });

            // Fetch new users today
            const { count: newUsersToday } = await supabase
                .from('user_profiles')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', today);

            // Fetch total searches
            const { count: totalSearches } = await supabase
                .from('lead_searches')
                .select('*', { count: 'exact', head: true });

            // Fetch searches today
            const { count: searchesToday } = await supabase
                .from('lead_searches')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', today);

            // Fetch total leads
            const { count: totalLeads } = await supabase
                .from('leads')
                .select('*', { count: 'exact', head: true });

            // Fetch leads saved today
            const { count: savedLeadsToday } = await supabase
                .from('leads')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', today);

            // Fetch active subscriptions
            const { count: activeSubscriptions } = await supabase
                .from('user_profiles')
                .select('*', { count: 'exact', head: true })
                .eq('subscription_status', 'active');

            setData({
                totalUsers: totalUsers || 0,
                newUsersToday: newUsersToday || 0,
                totalSearches: totalSearches || 0,
                searchesToday: searchesToday || 0,
                totalLeads: totalLeads || 0,
                savedLeadsToday: savedLeadsToday || 0,
                activeSubscriptions: activeSubscriptions || 0,
            });
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        {
            name: 'Total Users',
            value: data.totalUsers,
            change: data.newUsersToday,
            changeLabel: 'new today',
            icon: Users,
            color: 'from-blue-500 to-cyan-500',
        },
        {
            name: 'Total Searches',
            value: data.totalSearches,
            change: data.searchesToday,
            changeLabel: 'today',
            icon: Search,
            color: 'from-purple-500 to-pink-500',
        },
        {
            name: 'Saved Leads',
            value: data.totalLeads,
            change: data.savedLeadsToday,
            changeLabel: 'today',
            icon: Globe,
            color: 'from-green-500 to-emerald-500',
        },
        {
            name: 'Active Subscriptions',
            value: data.activeSubscriptions,
            change: Math.round((data.activeSubscriptions / Math.max(data.totalUsers, 1)) * 100),
            changeLabel: '% of users',
            icon: TrendingUp,
            color: 'from-orange-500 to-amber-500',
        },
    ];

    const topCountries = [
        { name: 'India', searches: 156, percentage: 45 },
        { name: 'United States', searches: 89, percentage: 26 },
        { name: 'United Kingdom', searches: 45, percentage: 13 },
        { name: 'Canada', searches: 32, percentage: 9 },
        { name: 'Australia', searches: 24, percentage: 7 },
    ];

    const topBusinessTypes = [
        { name: 'Restaurant', searches: 89, percentage: 32 },
        { name: 'Retail', searches: 67, percentage: 24 },
        { name: 'Healthcare', searches: 45, percentage: 16 },
        { name: 'Professional', searches: 38, percentage: 14 },
        { name: 'Beauty', searches: 28, percentage: 10 },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Analytics</h1>
                    <p className="text-dark-400">Monitor platform performance and usage</p>
                </div>
                <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="select bg-dark-800 border-dark-700"
                >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                </select>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.name} className="glass-card p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                                <span className="flex items-center gap-1 text-sm text-green-400">
                                    <ArrowUpRight className="w-4 h-4" />
                                    +{stat.change} {stat.changeLabel}
                                </span>
                            </div>
                            <p className="text-3xl font-bold text-white">{loading ? '...' : stat.value.toLocaleString()}</p>
                            <p className="text-dark-400 text-sm mt-1">{stat.name}</p>
                        </div>
                    );
                })}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Countries */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Top Countries</h3>
                    <div className="space-y-4">
                        {topCountries.map((country, index) => (
                            <div key={country.name} className="flex items-center gap-4">
                                <span className="text-dark-500 w-6">{index + 1}</span>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-white font-medium">{country.name}</span>
                                        <span className="text-dark-400 text-sm">{country.searches} searches</span>
                                    </div>
                                    <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                                            style={{ width: `${country.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Business Types */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Top Business Types</h3>
                    <div className="space-y-4">
                        {topBusinessTypes.map((type, index) => (
                            <div key={type.name} className="flex items-center gap-4">
                                <span className="text-dark-500 w-6">{index + 1}</span>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-white font-medium">{type.name}</span>
                                        <span className="text-dark-400 text-sm">{type.percentage}%</span>
                                    </div>
                                    <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                                            style={{ width: `${type.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Platform Activity</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-dark-800/50 rounded-xl">
                        <BarChart3 className="w-8 h-8 text-primary-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-white">{loading ? '...' : Math.round(data.totalSearches / Math.max(data.totalUsers, 1))}</p>
                        <p className="text-dark-400 text-sm">Avg Searches per User</p>
                    </div>
                    <div className="text-center p-4 bg-dark-800/50 rounded-xl">
                        <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-white">{loading ? '...' : Math.round(data.totalLeads / Math.max(data.totalSearches, 1))}</p>
                        <p className="text-dark-400 text-sm">Avg Leads per Search</p>
                    </div>
                    <div className="text-center p-4 bg-dark-800/50 rounded-xl">
                        <Calendar className="w-8 h-8 text-accent-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-white">{loading ? '...' : data.searchesToday}</p>
                        <p className="text-dark-400 text-sm">Searches Today</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
