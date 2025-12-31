import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Users,
    Mail,
    Search,
    TrendingUp,
    Clock,
    ArrowRight,
    Zap,
    AlertCircle,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getLeads, getEmailCampaigns } from '../lib/supabase';
import { formatRelativeTime } from '../lib/utils';
import type { Lead, EmailCampaign } from '../lib/database.types';

interface StatCardProps {
    icon: React.ElementType;
    label: string;
    value: string | number;
    subtext?: string;
    color: 'primary' | 'accent' | 'green' | 'yellow';
}

function StatCard({ icon: Icon, label, value, subtext, color }: StatCardProps) {
    const colorClasses = {
        primary: 'from-primary-500/20 to-primary-600/20 text-primary-400',
        accent: 'from-accent-500/20 to-accent-600/20 text-accent-400',
        green: 'from-green-500/20 to-green-600/20 text-green-400',
        yellow: 'from-yellow-500/20 to-yellow-600/20 text-yellow-400',
    };

    return (
        <div className="card p-6">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-dark-400 text-sm mb-1">{label}</p>
                    <p className="text-3xl font-bold text-white">{value}</p>
                    {subtext && <p className="text-dark-500 text-sm mt-1">{subtext}</p>}
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    );
}

export default function Dashboard() {
    const { profile } = useAuth();
    const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
    const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            if (!profile) return;

            const [leadsRes, campaignsRes] = await Promise.all([
                getLeads(profile.id, { limit: 5 }),
                getEmailCampaigns(profile.id),
            ]);

            if (leadsRes.data) setRecentLeads(leadsRes.data);
            if (campaignsRes.data) setCampaigns(campaignsRes.data);
            setLoading(false);
        }

        loadData();
    }, [profile]);

    const tierLimits: Record<string, { leads: number; emails: number }> = {
        free_trial: { leads: 25, emails: 10 },
        basic: { leads: 100, emails: 50 },
        pro: { leads: 500, emails: 300 },
        ultra_pro: { leads: 999999, emails: 1000 },
    };

    const currentLimits = tierLimits[profile?.subscription_tier || 'free_trial'];
    const leadsUsed = profile?.leads_used_this_month || 0;
    const emailsSent = profile?.emails_sent_this_month || 0;

    const leadsRemaining = Math.max(0, currentLimits.leads - leadsUsed);
    const emailsRemaining = Math.max(0, currentLimits.emails - emailsSent);

    const isLowOnLeads = leadsRemaining < currentLimits.leads * 0.2;
    const isLowOnEmails = emailsRemaining < currentLimits.emails * 0.2;

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}! 👋
                    </h1>
                    <p className="text-dark-400">Here's what's happening with your leads today.</p>
                </div>
                <Link to="/search" className="btn-primary">
                    <Search className="w-4 h-4" />
                    Search New Leads
                </Link>
            </div>

            {/* Low Quota Warning */}
            {(isLowOnLeads || isLowOnEmails) && (
                <div className="card p-4 border-yellow-500/50 bg-yellow-500/10 flex items-center gap-4">
                    <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="text-white font-medium">Running low on quota</p>
                        <p className="text-dark-400 text-sm">
                            {isLowOnLeads && `${leadsRemaining} leads remaining. `}
                            {isLowOnEmails && `${emailsRemaining} emails remaining.`}
                        </p>
                    </div>
                    <Link to="/pricing" className="btn-accent btn-sm">
                        Upgrade
                    </Link>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={Users}
                    label="Leads This Month"
                    value={leadsUsed}
                    subtext={`${leadsRemaining} remaining`}
                    color="primary"
                />
                <StatCard
                    icon={Mail}
                    label="Emails Sent"
                    value={emailsSent}
                    subtext={`${emailsRemaining} remaining`}
                    color="accent"
                />
                <StatCard
                    icon={TrendingUp}
                    label="Response Rate"
                    value="--"
                    subtext="Track email opens"
                    color="green"
                />
                <StatCard
                    icon={Clock}
                    label="Active Campaigns"
                    value={campaigns.filter((c) => c.status === 'sending').length}
                    color="yellow"
                />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link to="/search" className="card-hover p-6 group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Search className="w-6 h-6 text-primary-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-white font-semibold">Search Leads</h3>
                            <p className="text-dark-400 text-sm">Find new business opportunities</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-dark-500 group-hover:text-primary-400 transition-colors" />
                    </div>
                </Link>

                <Link to="/campaigns" className="card-hover p-6 group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-accent-500/20 to-accent-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Mail className="w-6 h-6 text-accent-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-white font-semibold">Email Campaigns</h3>
                            <p className="text-dark-400 text-sm">Send personalized outreach</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-dark-500 group-hover:text-accent-400 transition-colors" />
                    </div>
                </Link>

                <Link to="/leads" className="card-hover p-6 group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Users className="w-6 h-6 text-green-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-white font-semibold">My Leads</h3>
                            <p className="text-dark-400 text-sm">Manage your lead database</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-dark-500 group-hover:text-green-400 transition-colors" />
                    </div>
                </Link>
            </div>

            {/* Recent Leads */}
            <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-white">Recent Leads</h2>
                    <Link to="/leads" className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1">
                        View All
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="w-10 h-10 skeleton rounded-lg" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 skeleton w-1/3 rounded" />
                                    <div className="h-3 skeleton w-1/2 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : recentLeads.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Zap className="w-8 h-8 text-dark-600" />
                        </div>
                        <p className="text-dark-400 mb-4">No leads yet. Start searching to find potential clients!</p>
                        <Link to="/search" className="btn-primary btn-sm">
                            Search Leads
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {recentLeads.map((lead) => (
                            <div key={lead.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-dark-800/50 transition-colors">
                                <div className="w-10 h-10 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-semibold text-sm">
                                        {lead.business_name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-medium truncate">{lead.business_name}</p>
                                    <p className="text-dark-400 text-sm truncate">
                                        {lead.city}, {lead.state} • {lead.business_type}
                                    </p>
                                </div>
                                <span className={`badge ${lead.website_score === 'good' ? 'badge-success' :
                                        lead.website_score === 'average' ? 'badge-warning' :
                                            lead.website_score === 'poor' ? 'badge-danger' :
                                                'badge-primary'
                                    }`}>
                                    {lead.has_website ? lead.website_score : 'No Website'}
                                </span>
                                <span className="text-dark-500 text-sm hidden md:block">
                                    {formatRelativeTime(lead.created_at)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
